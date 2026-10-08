import type { SchemaDependency as SchemaDependencyData } from '$stylist/erd/type/object/schema-dependency';
import type { SchemaTablePosition } from '$stylist/erd/type/object/schema-table-position';
import type { RecipeErdSchemaView } from '$stylist/erd/interface/recipe/erd-schema-view';

export function createSchemaViewState(getProps: () => RecipeErdSchemaView) {
	const props = $derived(getProps());
	// A floor, not a target: keeps tiny documents from collapsing to near-zero
	// canvas. Previously fixed at 4800x3200 regardless of content, which for a
	// typical (non-demo-scale) document left most of the canvas empty -- the
	// default (0,0) scroll position then showed blank space instead of the
	// diagram, and radial's center (tied to this same minimum) landed well
	// off to the side of the visible viewport. canvasPadding is extra slack
	// beyond the auto-computed layout bounds specifically so there's room to
	// drag tables around -- a freeform diagram needs more than just enough
	// space for its own initial layout.
	const document = $derived(props.document);
	const compact = $derived(document.tables.length > 80);
	const tableWidth = $derived(compact ? 150 : 260);
	const columnGap = $derived(compact ? 34 : 110);
	const rowGap = $derived(compact ? 32 : 90);
	const minCanvasWidth = $derived(compact ? 1800 : 2600);
	const minCanvasHeight = $derived(compact ? 1100 : 1700);
	const canvasPadding = $derived(compact ? 120 : 480);
	const tableHeaderHeight = $derived(compact ? 30 : 48);
	const tableFieldHeight = $derived(compact ? 21 : 37);
	const zoom = $derived(props.zoom ?? 1);
	const showRelations = $derived(props.showRelations ?? true);
	const highlightRelations = $derived(props.highlightRelations ?? true);
	const layout = $derived(props.layout ?? 'grid');
	const activeTableId = $derived(props.activeTableId ?? '');
	const draggable = $derived(props.draggable ?? true);
	const persistLayout = $derived(props.persistLayout ?? false);

	// Tiebreak only, not a placement rule: the "clusters" layout orders
	// domains by actual cross-domain FK weight (see
	// orderDomainsByConnectionStrength), and falls back to this narrative
	// order only when two domains are equally (dis)connected -- e.g. a
	// domain with zero cross-domain FKs has nothing to rank it by otherwise.
	// Domains present in the document but not listed here rank after all of
	// these, in the order they were first seen.
	const DOMAIN_ORDER = [
		'platform',
		'identity',
		'geo',
		'localization',
		'finance',
		'content',
		'catalog',
		'inventory',
		'routing',
		'pricing',
		'planning',
		'commerce',
		'payments',
		'documents'
	];

	const DOMAIN_COLOR_PALETTE = [
		'#4d92cf',
		'#d46b34',
		'#6fb98f',
		'#b98fd0',
		'#e0a13c',
		'#5f9ea0',
		'#c9667a',
		'#7c9c3f',
		'#a0685f',
		'#4f8a8b',
		'#9b6bcc',
		'#c98474',
		'#3f8efc',
		'#a3a847'
	];

	let positions = $state<SchemaTablePosition[]>([]);
	let documentLayoutKey = $state('');
	// Seeded empty (not from the `layout` prop) so it never equals `layout` on
	// the first effect run -- that run always takes the createPositions()
	// branch, which is equivalent to mergePositions() while `positions` is
	// still empty anyway. Avoids capturing a reactive prop's value into local
	// $state at declaration time (state_referenced_locally).
	let activeLayout = $state('');
	let draggedTableId = $state<string | null>(null);
	let dragStartClientX = $state(0);
	let dragStartClientY = $state(0);
	let dragStartX = $state(0);
	let dragStartY = $state(0);
	let pointerMoved = $state(false);
	let hoveredTableId = $state<string | null>(null);
	let pinnedTableId = $state<string | null>(null);
	let draggedClusterDomain = $state<string | null>(null);
	let clusterDragStartClientX = $state(0);
	let clusterDragStartClientY = $state(0);
	// Scratch data for the in-progress cluster drag -- not reactive state,
	// just a snapshot read/written only by the three cluster-drag functions.
	let clusterDragOrigin: Map<string, { x: number; y: number }> | null = null;

	const positionByTable = $derived(
		new Map(positions.map((position) => [position.tableId, position]))
	);
	const relatedFieldIds = $derived(createRelatedFieldIds(document.dependencies));
	// Pinning (click) wins over hovering, so a user can move the mouse away
	// to read a table's card without losing the highlight.
	const focusTableId = $derived(pinnedTableId ?? hoveredTableId);
	const focusNeighborIds = $derived.by(() => {
		if (!focusTableId) {
			return new Set<string>();
		}

		const neighbors = new Set<string>();
		for (const dependency of document.dependencies) {
			if (dependency.sourceTable === focusTableId) {
				neighbors.add(dependency.targetTable);
			} else if (dependency.targetTable === focusTableId) {
				neighbors.add(dependency.sourceTable);
			}
		}

		return neighbors;
	});

	// Domain grouping + connection-strength ordering, kept as its own
	// derived (rather than recomputed inline in createClusterPositions)
	// because the drag-a-whole-domain feature needs cluster *membership*
	// (which tables belong to which domain) independent of how those
	// tables' positions were produced -- freshly laid out, individually
	// dragged, whole-cluster dragged, or restored from a persisted layout.
	const orderedDomainGroups = $derived.by(() => {
		if (layout !== 'clusters' && layout !== 'star') {
			return [] as { domain: string; indices: number[] }[];
		}

		const groups = new Map<string, number[]>();
		document.tables.forEach((table, index) => {
			const domain = getDomain(table.name);
			const indices = groups.get(domain);

			if (indices) {
				indices.push(index);
			} else {
				groups.set(domain, [index]);
			}
		});

		const orderedDomains = orderDomainsByConnectionStrength(groups);
		return orderedDomains.map((domain) => ({ domain, indices: groups.get(domain) as number[] }));
	});

	const clusterMembership = $derived(
		orderedDomainGroups.map(({ domain, indices }, index) => ({
			domain,
			label: `${domain} · ${indices.length}`,
			color: DOMAIN_COLOR_PALETTE[index % DOMAIN_COLOR_PALETTE.length],
			tableIds: indices.map((tableIndex) => document.tables[tableIndex].id)
		}))
	);

	// The panel geometry is a *live* bounding box around wherever its member
	// tables currently are -- not a value fixed at grid-generation time --
	// so it stays correct whether a table was moved individually, the whole
	// domain was dragged by its header, or positions came back from
	// persisted storage. This also means a table dragged out of its domain
	// simply expands that domain's backdrop to still enclose it.
	const clusterPanels = $derived.by(() => {
		if (clusterMembership.length === 0) {
			return [] as {
				domain: string;
				label: string;
				x: number;
				y: number;
				width: number;
				height: number;
				color: string;
				tableIds: string[];
			}[];
		}

		const sidePadding = compact ? 14 : 20;
		const topPadding = compact ? 30 : 40;
		const panels: {
			domain: string;
			label: string;
			x: number;
			y: number;
			width: number;
			height: number;
			color: string;
			tableIds: string[];
		}[] = [];

		for (const cluster of clusterMembership) {
			const memberPositions = cluster.tableIds
				.map((tableId) => positionByTable.get(tableId))
				.filter((position): position is SchemaTablePosition => position !== undefined);

			if (memberPositions.length === 0) {
				continue;
			}

			const minX = Math.min(...memberPositions.map((position) => position.x));
			const minY = Math.min(...memberPositions.map((position) => position.y));
			const maxX = Math.max(...memberPositions.map((position) => position.x + position.width));
			const maxY = Math.max(...memberPositions.map((position) => position.y + position.height));

			panels.push({
				domain: cluster.domain,
				label: cluster.label,
				color: cluster.color,
				tableIds: cluster.tableIds,
				x: minX - sidePadding,
				y: minY - topPadding,
				width: maxX - minX + sidePadding * 2,
				height: maxY - minY + topPadding + sidePadding
			});
		}

		return panels;
	});

	const canvasSize = $derived(createCanvasSize(positions));
	const scaledCanvasSize = $derived({
		width: Math.ceil(canvasSize.width * zoom),
		height: Math.ceil(canvasSize.height * zoom)
	});

	$effect(() => {
		const nextLayoutKey = document.tables
			.map((table) => `${table.id}:${table.fields.length}`)
			.join('|')
			.concat(`:${layout}`);

		if (nextLayoutKey === documentLayoutKey) {
			return;
		}

		// Only the very first run tries a saved layout -- later layout-key
		// changes (switching the dropdown, editing the document) go through
		// the normal recompute/merge path so Save/Reset stay the deliberate
		// way back to a persisted arrangement instead of it reappearing
		// unexpectedly on every recompute.
		const persisted = documentLayoutKey === '' ? loadPersistedPositions() : null;

		positions =
			persisted ??
			(layout === activeLayout ? mergePositions() : createPositions(document.tables.length));
		documentLayoutKey = nextLayoutKey;
		activeLayout = layout;
		draggedTableId = null;
	});

	function hashTableIds(): string {
		const joined = document.tables
			.map((table) => table.id)
			.slice()
			.sort()
			.join('|');
		let hash = 0;

		for (let index = 0; index < joined.length; index += 1) {
			hash = (hash * 31 + joined.charCodeAt(index)) | 0;
		}

		return Math.abs(hash).toString(36);
	}

	function currentStorageKey(): string {
		return `erd-layout:${layout}:${hashTableIds()}`;
	}

	function loadPersistedPositions(): SchemaTablePosition[] | null {
		if (!persistLayout || typeof localStorage === 'undefined') {
			return null;
		}

		try {
			const raw = localStorage.getItem(currentStorageKey());
			if (!raw) {
				return null;
			}

			const stored = JSON.parse(raw) as SchemaTablePosition[];
			const storedIds = new Set(stored.map((position) => position.tableId));

			if (storedIds.size !== document.tables.length) {
				return null;
			}

			for (const table of document.tables) {
				if (!storedIds.has(table.id)) {
					return null;
				}
			}

			return stored;
		} catch {
			return null;
		}
	}

	function persistPositions(): void {
		if (!persistLayout || typeof localStorage === 'undefined') {
			return;
		}

		try {
			localStorage.setItem(currentStorageKey(), JSON.stringify(positions));
		} catch {
			// Storage unavailable or full -- the layout still works in-memory,
			// it just won't survive a reload.
		}
	}

	function saveLayout(): void {
		persistPositions();
	}

	function resetLayout(): void {
		if (persistLayout && typeof localStorage !== 'undefined') {
			try {
				localStorage.removeItem(currentStorageKey());
			} catch {
				// ignore
			}
		}

		positions = createPositions(document.tables.length);
	}

	function createPositions(count: number): SchemaTablePosition[] {
		if (layout === 'clusters') {
			return resolveOverlaps(createClusterPositions());
		}

		if (layout === 'star') {
			return resolveOverlaps(createStarPositions());
		}

		if (layout === 'wide') {
			return resolveOverlaps(
				createGridPositions(
					count,
					Math.max(1, Math.ceil(Math.sqrt(count * 2.8))),
					compact ? 30 : 140,
					compact ? 30 : 130
				)
			);
		}

		if (layout === 'columns') {
			return resolveOverlaps(
				createGridPositions(
					count,
					Math.min(compact ? 12 : 6, Math.max(1, Math.ceil(count / (compact ? 9 : 14)))),
					compact ? 38 : 240,
					compact ? 32 : 110
				)
			);
		}

		if (layout === 'radial') {
			return resolveOverlaps(createRadialPositions(count));
		}

		return resolveOverlaps(
			createGridPositions(count, Math.max(1, Math.ceil(Math.sqrt(count))), columnGap, rowGap)
		);
	}

	// Final safety net on top of the per-layout math above: pushes any two
	// still-overlapping cards apart along whichever axis needs the smaller
	// nudge, iterating until stable. The per-layout functions get the common
	// cases right on their own, but closed-form angle/row math can't fully
	// account for arbitrarily-tall cards (e.g. a table with 20+ fields next
	// to one with 2) without this -- a card's height can intrude on a
	// neighbor's space in ways a simple arc-length or row-height formula
	// doesn't predict at every angle.
	function resolveOverlaps(items: SchemaTablePosition[]): SchemaTablePosition[] {
		const result = items.map((item) => ({ ...item }));
		const gap = 24;
		const maxIterations = 200;

		for (let iteration = 0; iteration < maxIterations; iteration += 1) {
			let moved = false;

			for (let i = 0; i < result.length; i += 1) {
				for (let j = i + 1; j < result.length; j += 1) {
					const a = result[i];
					const b = result[j];

					const overlapX = Math.min(a.x + a.width + gap, b.x + b.width + gap) - Math.max(a.x, b.x);
					const overlapY =
						Math.min(a.y + a.height + gap, b.y + b.height + gap) - Math.max(a.y, b.y);

					if (overlapX <= 0 || overlapY <= 0) {
						continue;
					}

					moved = true;

					const aCenterX = a.x + a.width / 2;
					const aCenterY = a.y + a.height / 2;
					const bCenterX = b.x + b.width / 2;
					const bCenterY = b.y + b.height / 2;

					if (overlapX < overlapY) {
						const push = overlapX / 2 + 1;
						if (aCenterX <= bCenterX) {
							a.x -= push;
							b.x += push;
						} else {
							a.x += push;
							b.x -= push;
						}
					} else {
						const push = overlapY / 2 + 1;
						if (aCenterY <= bCenterY) {
							a.y -= push;
							b.y += push;
						} else {
							a.y += push;
							b.y -= push;
						}
					}
				}
			}

			if (!moved) {
				break;
			}
		}

		const minX = Math.min(0, ...result.map((item) => item.x));
		const minY = Math.min(0, ...result.map((item) => item.y));

		if (minX < 0 || minY < 0) {
			return result.map((item) => ({ ...item, x: item.x - minX + 40, y: item.y - minY + 40 }));
		}

		return result;
	}

	function createGridPositions(
		count: number,
		columns: number,
		horizontalGap: number,
		verticalGap: number
	): SchemaTablePosition[] {
		const heights = document.tables.map((table) => createTableHeight(table.fields.length));
		const rowCount = Math.max(1, Math.ceil(count / columns));

		// Row Y must come from the tallest card actually placed in each
		// preceding row, not from each card's own height -- using "this
		// table's height" for `row * height` (the previous formula) only
		// happened to work when every card was the same height. Real tables
		// have wildly different field counts, so rows silently overlapped.
		const rowHeights = new Array(rowCount).fill(0);
		document.tables.forEach((_, index) => {
			const row = Math.floor(index / columns);
			rowHeights[row] = Math.max(rowHeights[row], heights[index]);
		});

		const rowY = new Array(rowCount).fill(56);
		for (let row = 1; row < rowCount; row += 1) {
			rowY[row] = rowY[row - 1] + rowHeights[row - 1] + verticalGap;
		}

		return document.tables.map((table, index) => {
			const column = index % columns;
			const row = Math.floor(index / columns);

			return {
				tableId: table.id,
				x: 56 + column * (tableWidth + horizontalGap),
				y: rowY[row],
				width: tableWidth,
				height: heights[index]
			};
		});
	}

	function createRadialPositions(count: number): SchemaTablePosition[] {
		const firstRingCapacity = 8;
		const ringCapacityGrowth = 6;
		const arcGap = 70; // breathing room between cards sharing a ring
		const ringGap = 90; // radial breathing room between rings
		const minRadius = 320;

		const heights = document.tables.map((table) => createTableHeight(table.fields.length));

		// Assign tables to rings first (same growth scheme as before), then size
		// each ring from what's actually in it.
		const ringAssignments: number[][] = [];
		{
			let index = 0;
			let ring = 0;
			while (index < count) {
				const capacity = firstRingCapacity + ring * ringCapacityGrowth;
				const slice: number[] = [];
				for (let slot = 0; slot < capacity && index < count; slot += 1, index += 1) {
					slice.push(index);
				}
				ringAssignments.push(slice);
				ring += 1;
			}
		}

		// A ring's radius must be large enough for two independent reasons:
		// (1) enough arc length per slot that cards on the same ring don't
		// collide sideways, and (2) enough clearance from the previous ring's
		// tallest card that rings don't collide radially. The previous version
		// used a single fixed radius-per-ring regardless of how many tables
		// were on it or how tall they were, which is what caused overlaps.
		const ringRadius: number[] = [];
		let previousOuterEdge = 0;
		ringAssignments.forEach((indices, ring) => {
			const maxHeightInRing = Math.max(...indices.map((index) => heights[index]));
			const arcRequiredRadius = ((tableWidth + arcGap) * indices.length) / (2 * Math.PI);
			const clearanceRadius = ring === 0 ? 0 : previousOuterEdge + maxHeightInRing / 2 + ringGap;
			const radius = Math.max(arcRequiredRadius, clearanceRadius, minRadius);

			ringRadius.push(radius);
			previousOuterEdge = radius + maxHeightInRing / 2;
		});

		const center = previousOuterEdge + tableWidth / 2 + canvasPadding / 2;
		const positions: SchemaTablePosition[] = [];

		ringAssignments.forEach((indices, ring) => {
			const radius = ringRadius[ring];
			const capacity = indices.length;

			indices.forEach((tableIndex, slot) => {
				const table = document.tables[tableIndex];
				const height = heights[tableIndex];
				const angle = (Math.PI * 2 * slot) / capacity - Math.PI / 2;

				positions.push({
					tableId: table.id,
					x: center + Math.cos(angle) * radius - tableWidth / 2,
					y: center + Math.sin(angle) * radius - height / 2,
					width: tableWidth,
					height
				});
			});
		});

		return positions;
	}

	function getDomain(tableName: string): string {
		const separatorIndex = tableName.indexOf('_');
		return separatorIndex === -1 ? tableName : tableName.slice(0, separatorIndex);
	}

	// A fixed narrative order (platform, identity, geo, ...) looks tidy but
	// is blind to the actual graph: a domain like `finance` can end up
	// wedged between two clusters it barely talks to (e.g. `content`),
	// forcing its relation lines to sweep clear across the canvas past
	// unrelated blocks -- which is exactly the "noise" grouping-by-name-only
	// was supposed to fix. This builds a weighted adjacency graph from the
	// real cross-domain FK counts, then greedily walks a nearest-neighbor
	// chain through it (the classic weighted-TSP heuristic) so consecutive
	// domains in the result are the ones actually referencing each other
	// most. `DOMAIN_ORDER` only breaks ties (equal/zero weight).
	function orderDomainsByConnectionStrength(groups: Map<string, number[]>): string[] {
		const domains = Array.from(groups.keys());
		const domainByTableId = new Map<string, string>();

		for (const [domain, indices] of groups) {
			for (const index of indices) {
				domainByTableId.set(document.tables[index].id, domain);
			}
		}

		const weights = new Map<string, Map<string, number>>();
		for (const domain of domains) {
			weights.set(domain, new Map());
		}

		for (const dependency of document.dependencies) {
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
				const narrativeIndex = DOMAIN_ORDER.indexOf(domain);
				return [domain, narrativeIndex === -1 ? DOMAIN_ORDER.length + index : narrativeIndex] as const;
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

	// Lays one domain's own tables out as a squarish sub-grid (bounded 2-4
	// columns so a cluster reads as a compact block rather than one long
	// row or column), local to a 0,0 origin -- both the "clusters" grid and
	// the "star" ring layouts place many of these and then shift each one
	// into its final position.
	function buildDomainGrid(
		indices: readonly number[],
		heights: readonly number[]
	): { width: number; height: number; positions: SchemaTablePosition[] } {
		const innerGapX = compact ? 26 : 60;
		const innerGapY = compact ? 26 : 50;
		const columns = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(indices.length))));
		const rows = Math.max(1, Math.ceil(indices.length / columns));
		const rowHeights = new Array(rows).fill(0);

		indices.forEach((tableIndex, slot) => {
			const row = Math.floor(slot / columns);
			rowHeights[row] = Math.max(rowHeights[row], heights[tableIndex]);
		});

		const rowY = new Array(rows).fill(0);
		for (let row = 1; row < rows; row += 1) {
			rowY[row] = rowY[row - 1] + rowHeights[row - 1] + innerGapY;
		}

		const positions = indices.map((tableIndex, slot) => {
			const column = slot % columns;
			const row = Math.floor(slot / columns);

			return {
				tableId: document.tables[tableIndex].id,
				x: column * (tableWidth + innerGapX),
				y: rowY[row],
				width: tableWidth,
				height: heights[tableIndex]
			};
		});

		return {
			width: columns * tableWidth + (columns - 1) * innerGapX,
			height: rowY[rows - 1] + rowHeights[rows - 1],
			positions
		};
	}

	// Tiles each domain's sub-grid (see buildDomainGrid) into rows with
	// generous gaps between them, ordered so strongly cross-referenced
	// domains land next to each other (see orderDomainsByConnectionStrength).
	function createClusterPositions(): SchemaTablePosition[] {
		const heights = document.tables.map((table) => createTableHeight(table.fields.length));
		const clusterGapX = compact ? 90 : 220;
		const clusterGapY = compact ? 110 : 220;
		const clustersPerRow = compact ? 4 : 3;

		const clusters = orderedDomainGroups.map(({ domain, indices }) => ({
			domain,
			...buildDomainGrid(indices, heights)
		}));

		const finalPositions: SchemaTablePosition[] = [];
		let cursorY = 60;
		let rowIndex = 0;

		for (let start = 0; start < clusters.length; start += clustersPerRow) {
			const rowSlice = clusters.slice(start, start + clustersPerRow);
			// Snake the grid (alternate direction each row) so the
			// connection-strength chain stays physically adjacent across a row
			// wrap too, not just within a single row -- otherwise the last
			// cluster of one row and the first of the next could be strongly
			// connected in the chain but land on opposite sides of the canvas.
			const rowClusters = rowIndex % 2 === 0 ? rowSlice : [...rowSlice].reverse();
			const rowHeight = Math.max(...rowClusters.map((cluster) => cluster.height));
			let cursorX = 60;

			for (const cluster of rowClusters) {
				for (const position of cluster.positions) {
					finalPositions.push({ ...position, x: position.x + cursorX, y: position.y + cursorY });
				}

				cursorX += cluster.width + clusterGapX;
			}

			cursorY += rowHeight + clusterGapY;
			rowIndex += 1;
		}

		return finalPositions;
	}

	// The domain with the most total cross-domain FK weight (chain[0] from
	// orderDomainsByConnectionStrength -- the same "hub" the chain already
	// starts from) sits centered; every other domain rings around it in
	// connection-strength chain order, so domains that are strongly
	// connected *to each other* (not just to the hub) end up in adjacent
	// sectors. Unlike the grid's row wrap, a ring has no seam -- the last
	// sector is already adjacent to the first -- so this reads as more
	// consistently "close" than the snaked grid for schemas with one clear
	// dominant hub.
	function createStarPositions(): SchemaTablePosition[] {
		const heights = document.tables.map((table) => createTableHeight(table.fields.length));
		const clusters = orderedDomainGroups.map(({ domain, indices }) => ({
			domain,
			...buildDomainGrid(indices, heights)
		}));

		if (clusters.length === 0) {
			return [];
		}

		const [hub, ...ring] = clusters;
		const hubCenterX = hub.width / 2;
		const hubCenterY = hub.height / 2;
		const finalPositions: SchemaTablePosition[] = hub.positions.map((position) => ({ ...position }));

		if (ring.length === 0) {
			return finalPositions;
		}

		const ringGap = compact ? 90 : 180;
		const arcGap = compact ? 40 : 90;
		const hubRadius = Math.max(hub.width, hub.height) / 2;
		const maxRingClusterSpan = Math.max(...ring.map((cluster) => Math.max(cluster.width, cluster.height)));
		// Same two-constraint radius reasoning as createRadialPositions: enough
		// arc length that ring neighbors don't collide sideways, and enough
		// clearance from the hub that nothing overlaps it.
		const arcRequiredRadius = ((maxRingClusterSpan + arcGap) * ring.length) / (2 * Math.PI);
		const radius = Math.max(arcRequiredRadius, hubRadius + maxRingClusterSpan / 2 + ringGap);

		ring.forEach((cluster, index) => {
			const angle = (Math.PI * 2 * index) / ring.length - Math.PI / 2;
			const originX = hubCenterX + Math.cos(angle) * radius - cluster.width / 2;
			const originY = hubCenterY + Math.sin(angle) * radius - cluster.height / 2;

			for (const position of cluster.positions) {
				finalPositions.push({ ...position, x: position.x + originX, y: position.y + originY });
			}
		});

		return finalPositions;
	}

	function createTableHeight(fieldCount: number): number {
		return tableHeaderHeight + fieldCount * tableFieldHeight;
	}

	function mergePositions(): SchemaTablePosition[] {
		const generatedPositions = createPositions(document.tables.length);
		const previousPositions = new Map(positions.map((position) => [position.tableId, position]));

		return generatedPositions.map((position) => {
			const previousPosition = previousPositions.get(position.tableId);

			if (!previousPosition) {
				return position;
			}

			return {
				...position,
				x: previousPosition.x,
				y: previousPosition.y
			};
		});
	}

	function createCanvasSize(currentPositions: readonly SchemaTablePosition[]): {
		width: number;
		height: number;
	} {
		const rightEdge = Math.max(
			0,
			...currentPositions.map((position) => position.x + position.width)
		);
		const bottomEdge = Math.max(
			0,
			...currentPositions.map((position) => position.y + position.height)
		);

		return {
			width: Math.max(minCanvasWidth, rightEdge + canvasPadding),
			height: Math.max(minCanvasHeight, bottomEdge + canvasPadding)
		};
	}

	function clamp(value: number, min: number, max: number): number {
		return Math.min(max, Math.max(min, value));
	}

	function createRelatedFieldIds(dependencies: readonly SchemaDependencyData[]): string[] {
		return Array.from(
			new Set(
				dependencies.flatMap((dependency) => [
					`${dependency.sourceTable}.${dependency.sourceField}`,
					`${dependency.targetTable}.${dependency.targetField}`
				])
			)
		);
	}

	function getDependencyPoints(dependency: SchemaDependencyData) {
		const source = positionByTable.get(dependency.sourceTable);
		const target = positionByTable.get(dependency.targetTable);
		const sourceTable = document.tables.find((table) => table.id === dependency.sourceTable);
		const targetTable = document.tables.find((table) => table.id === dependency.targetTable);

		if (!source || !target || !sourceTable || !targetTable) {
			return null;
		}

		const sourceFieldIndex = Math.max(
			0,
			sourceTable.fields.findIndex(
				(field) => field.id === `${dependency.sourceTable}.${dependency.sourceField}`
			)
		);
		const targetFieldIndex = Math.max(
			0,
			targetTable.fields.findIndex(
				(field) => field.id === `${dependency.targetTable}.${dependency.targetField}`
			)
		);
		const sourceCenterX = source.x + source.width / 2;
		const targetCenterX = target.x + target.width / 2;
		const sourceX = sourceCenterX <= targetCenterX ? source.x + source.width : source.x;
		const targetX = sourceCenterX <= targetCenterX ? target.x : target.x + target.width;

		return {
			x1: sourceX,
			y1: source.y + tableHeaderHeight + sourceFieldIndex * tableFieldHeight + tableFieldHeight / 2,
			x2: targetX,
			y2: target.y + tableHeaderHeight + targetFieldIndex * tableFieldHeight + tableFieldHeight / 2
		};
	}

	function startTableDrag(event: PointerEvent, tableId: string): void {
		if (!draggable || event.button !== 0) {
			return;
		}

		const position = positionByTable.get(tableId);
		if (!position) {
			return;
		}

		event.preventDefault();
		draggedTableId = tableId;
		pointerMoved = false;
		dragStartClientX = event.clientX;
		dragStartClientY = event.clientY;
		dragStartX = position.x;
		dragStartY = position.y;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function moveTable(event: PointerEvent, tableId: string): void {
		if (!draggable || draggedTableId !== tableId) {
			return;
		}

		const position = positionByTable.get(tableId);
		if (!position) {
			return;
		}

		const deltaX = (event.clientX - dragStartClientX) / zoom;
		const deltaY = (event.clientY - dragStartClientY) / zoom;

		// A few pixels of jitter shouldn't count as "dragged" -- stopTableDrag
		// uses this to tell an intentional drag apart from a click-to-pin.
		if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
			pointerMoved = true;
		}

		const nextX = clamp(dragStartX + deltaX, 0, canvasSize.width - position.width);
		const nextY = clamp(dragStartY + deltaY, 0, canvasSize.height - position.height);

		positions = positions.map((entry) =>
			entry.tableId === tableId
				? {
						...entry,
						x: nextX,
						y: nextY
					}
				: entry
		);
	}

	function stopTableDrag(event: PointerEvent, tableId: string): void {
		if (draggedTableId !== tableId) {
			return;
		}

		if ((event.currentTarget as HTMLElement).hasPointerCapture(event.pointerId)) {
			(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
		}

		draggedTableId = null;

		if (!pointerMoved) {
			toggleFocusTable(tableId);
		}
	}

	function startClusterDrag(event: PointerEvent, domain: string): void {
		if (!draggable || event.button !== 0) {
			return;
		}

		const panel = clusterPanels.find((entry) => entry.domain === domain);
		if (!panel) {
			return;
		}

		event.preventDefault();
		draggedClusterDomain = domain;
		clusterDragStartClientX = event.clientX;
		clusterDragStartClientY = event.clientY;
		clusterDragOrigin = new Map(
			panel.tableIds.map((tableId) => {
				const position = positionByTable.get(tableId);
				return [tableId, { x: position?.x ?? 0, y: position?.y ?? 0 }];
			})
		);
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function moveClusterDrag(event: PointerEvent, domain: string): void {
		if (!draggable || draggedClusterDomain !== domain || !clusterDragOrigin) {
			return;
		}

		const origin = clusterDragOrigin;
		const originValues = Array.from(origin.values());
		let deltaX = (event.clientX - clusterDragStartClientX) / zoom;
		let deltaY = (event.clientY - clusterDragStartClientY) / zoom;

		// Mirrors the individual-table clamp: the group can grow the canvas
		// to the right/bottom freely, but its leftmost/topmost member can't
		// be dragged past the canvas origin.
		const minOriginX = Math.min(...originValues.map((position) => position.x));
		const minOriginY = Math.min(...originValues.map((position) => position.y));
		deltaX = Math.max(deltaX, -minOriginX);
		deltaY = Math.max(deltaY, -minOriginY);

		positions = positions.map((position) => {
			const originPosition = origin.get(position.tableId);
			if (!originPosition) {
				return position;
			}

			return { ...position, x: originPosition.x + deltaX, y: originPosition.y + deltaY };
		});
	}

	function stopClusterDrag(event: PointerEvent, domain: string): void {
		if (draggedClusterDomain !== domain) {
			return;
		}

		if ((event.currentTarget as HTMLElement).hasPointerCapture(event.pointerId)) {
			(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
		}

		draggedClusterDomain = null;
		clusterDragOrigin = null;
	}

	function setHoveredTable(tableId: string | null): void {
		hoveredTableId = tableId;
	}

	function toggleFocusTable(tableId: string): void {
		pinnedTableId = pinnedTableId === tableId ? null : tableId;
	}

	function clearFocus(): void {
		pinnedTableId = null;
		hoveredTableId = null;
	}

	function isDependencyFocused(dependency: SchemaDependencyData): boolean {
		return (
			focusTableId !== null &&
			(dependency.sourceTable === focusTableId || dependency.targetTable === focusTableId)
		);
	}

	return {
		get document() {
			return document;
		},
		get zoom() {
			return zoom;
		},
		get showRelations() {
			return showRelations;
		},
		get highlightRelations() {
			return highlightRelations;
		},
		get compact() {
			return compact;
		},
		get draggable() {
			return draggable;
		},
		get activeTableId() {
			return activeTableId;
		},
		get canvasSize() {
			return canvasSize;
		},
		get clusterPanels() {
			return clusterPanels;
		},
		get scaledCanvasSize() {
			return scaledCanvasSize;
		},
		get positionByTable() {
			return positionByTable;
		},
		get relatedFieldIds() {
			return relatedFieldIds;
		},
		get draggedTableId() {
			return draggedTableId;
		},
		get focusTableId() {
			return focusTableId;
		},
		get focusNeighborIds() {
			return focusNeighborIds;
		},
		get draggedClusterDomain() {
			return draggedClusterDomain;
		},
		getDependencyPoints,
		isDependencyFocused,
		startTableDrag,
		moveTable,
		stopTableDrag,
		startClusterDrag,
		moveClusterDrag,
		stopClusterDrag,
		setHoveredTable,
		clearFocus,
		saveLayout,
		resetLayout
	};
}

export default createSchemaViewState;
