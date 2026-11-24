import type { SchemaDependency } from '$stylist/erd/type/object/schema-dependency';

// A fixed narrative order (platform, identity, geo, ...) looks tidy but
// is blind to the actual graph: a domain like `finance` can end up
// wedged between two clusters it barely talks to (e.g. `content`),
// forcing its relation lines to sweep clear across the canvas past
// unrelated blocks -- which is exactly the "noise" grouping-by-name-only
// was supposed to fix. This builds a weighted adjacency graph from the
// real cross-domain FK counts, then greedily walks a nearest-neighbor
// chain through it (the classic weighted-TSP heuristic) so consecutive
// domains in the result are the ones actually referencing each other
// most. `domainOrder` only breaks ties (equal/zero weight).
//
// `groups` maps a domain to the indices of its tables in `tables`.
export function orderDomainsByConnectionStrength(
	groups: ReadonlyMap<string, readonly number[]>,
	tables: readonly { id: string }[],
	dependencies: readonly SchemaDependency[],
	domainOrder: readonly string[]
): string[] {
	const domains = Array.from(groups.keys());
	const domainByTableId = new Map<string, string>();

	for (const [domain, indices] of groups) {
		for (const index of indices) {
			domainByTableId.set(tables[index].id, domain);
		}
	}

	const weights = new Map<string, Map<string, number>>();
	for (const domain of domains) {
		weights.set(domain, new Map());
	}

	for (const dependency of dependencies) {
		const sourceDomain = domainByTableId.get(dependency.sourceTable);
		const targetDomain = domainByTableId.get(dependency.targetTable);

		if (!sourceDomain || !targetDomain || sourceDomain === targetDomain) {
			continue;
		}

		const sourceRow = weights.get(sourceDomain)!;
		const targetRow = weights.get(targetDomain)!;
		sourceRow.set(targetDomain, (sourceRow.get(targetDomain) ?? 0) + 1);
		targetRow.set(sourceDomain, (targetRow.get(sourceDomain) ?? 0) + 1);
	}

	const fallbackRank = new Map(
		domains.map((domain, index) => {
			const narrativeIndex = domainOrder.indexOf(domain);
			return [domain, narrativeIndex === -1 ? domainOrder.length + index : narrativeIndex] as const;
		})
	);

	const totalWeight = (domain: string): number => {
		let sum = 0;
		for (const value of weights.get(domain)!.values()) {
			sum += value;
		}
		return sum;
	};

	// Prefer higher `score`; break exact ties with the deterministic
	// fallback rank so the result never depends on Map/Set iteration order.
	const isBetter = (
		candidate: string,
		current: string | null,
		score: (domain: string) => number
	): boolean => {
		if (current === null) {
			return true;
		}

		const candidateScore = score(candidate);
		const currentScore = score(current);

		if (candidateScore !== currentScore) {
			return candidateScore > currentScore;
		}

		return fallbackRank.get(candidate)! < fallbackRank.get(current)!;
	};

	const remaining = new Set(domains);
	let start: string | null = null;
	for (const domain of domains) {
		if (isBetter(domain, start, totalWeight)) {
			start = domain;
		}
	}

	const chain: string[] = [start as string];
	remaining.delete(start as string);

	while (remaining.size > 0) {
		const last = chain[chain.length - 1];
		const lastWeights = weights.get(last)!;
		const scoreAgainstLast = (domain: string) => lastWeights.get(domain) ?? 0;

		let next: string | null = null;
		for (const candidate of remaining) {
			if (isBetter(candidate, next, scoreAgainstLast)) {
				next = candidate;
			}
		}

		// Nothing left is connected to the current chain end at all --
		// jump to the still-unplaced domain with the strongest overall
		// connections instead of landing wherever Set iteration happens to
		// visit next, so disconnected pockets still group near whichever
		// part of the diagram they actually relate to.
		if (scoreAgainstLast(next as string) === 0) {
			let bestOverall: string | null = null;
			for (const candidate of remaining) {
				if (isBetter(candidate, bestOverall, totalWeight)) {
					bestOverall = candidate;
				}
			}
			next = bestOverall;
		}

		chain.push(next as string);
		remaining.delete(next as string);
	}

	return chain;
}
