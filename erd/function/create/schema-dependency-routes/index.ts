import type { SchemaDocument } from '$stylist/erd/type/object/schema-document';
import type { SchemaTablePosition } from '$stylist/erd/type/object/schema-table-position';
import type { SchemaDependencyRoute } from '$stylist/erd/type/object/schema-dependency-route';
import { bundleSchemaDependencyRoutes } from '$stylist/erd/function/transform/bundle-schema-dependency-routes';
import type { SchemaGravitySettings } from '$stylist/erd/type/object/schema-gravity-settings';

/** Rectilinear A* routing: every source exits right, every target is entered from the left. */
export function createSchemaDependencyRoutes(
	document: SchemaDocument,
	positions: readonly SchemaTablePosition[],
	headerHeight: number,
	fieldHeight: number,
	clearance = 18,
	reserved: readonly SchemaTablePosition[] = [],
	gravity?: SchemaGravitySettings
): Map<string, SchemaDependencyRoute> {
	const result = new Map<string, SchemaDependencyRoute>();
	if (!positions.length || !document.dependencies.length) return result;
	const cards = new Map(positions.map(position => [position.tableId, position]));
	const tables = new Map(document.tables.map(table => [table.id, table]));
	const xs = new Set<number>();
	const ys = new Set<number>();
	const outer = clearance + 16;
	const obstacles = [...positions, ...reserved];
	for (const card of obstacles) {
		for (const gap of [clearance, outer]) {
			xs.add(card.x - gap); xs.add(card.x + card.width + gap);
			ys.add(card.y - gap); ys.add(card.y + card.height + gap);
		}
	}
	const entries = document.dependencies.flatMap(dependency => {
		const source = cards.get(dependency.sourceTable), target = cards.get(dependency.targetTable);
		const sourceTable = tables.get(dependency.sourceTable), targetTable = tables.get(dependency.targetTable);
		if (!source || !target || !sourceTable || !targetTable) return [];
		const fieldY = (table: typeof sourceTable, card: SchemaTablePosition, field: string) =>
			card.y + headerHeight + Math.max(0, table.fields.findIndex(row => row.name === field)) * fieldHeight + fieldHeight / 2;
		const sy = fieldY(sourceTable, source, dependency.sourceField);
		const ty = fieldY(targetTable, target, dependency.targetField);
		ys.add(sy); ys.add(ty);
		return [{ dependency, source, target, sy, ty, targetKey:JSON.stringify([dependency.targetTable,dependency.targetField]) }];
	});
	const targetCounts = new Map<string,number>();
	for (const entry of entries) targetCounts.set(entry.targetKey,(targetCounts.get(entry.targetKey) ?? 0)+1);
	const trunks = new Map<string,{x:number;y:number;anchorY:number}>();
	const clearSegment = (x1:number,y1:number,x2:number,y2:number) => !obstacles.some(box => {
		const left=box.x-clearance,right=box.x+box.width+clearance;
		const top=box.y-clearance,bottom=box.y+box.height+clearance;
		return x1===x2 ? x1>left && x1<right && Math.max(y1,y2)>top && Math.min(y1,y2)<bottom
			: y1>top && y1<bottom && Math.max(x1,x2)>left && Math.min(x1,x2)<right;
	});
	// A common target needs a real shared approach, not merely similar nearby
	// paths. Reserve one incoming spine per field before routing its branches.
	for (const {targetKey,target,ty} of entries) {
		if ((targetCounts.get(targetKey) ?? 0)<2 || trunks.has(targetKey)) continue;
		const tx=target.x-clearance;
		for (const length of [128,96,64,40]) {
			for (const direction of [1,-1]) {
				const anchorY=ty+length*direction;
				if (anchorY<clearance || !clearSegment(tx,ty,tx,anchorY)) continue;
				const leftFree=tx-clearance>=0 && clearSegment(tx-clearance,anchorY,tx,anchorY);
				const rightFree=clearSegment(tx,anchorY,tx+clearance,anchorY);
				if (!leftFree && !rightFree) continue;
				trunks.set(targetKey,{x:tx,y:ty,anchorY});ys.add(anchorY);
				if (leftFree) xs.add(tx-clearance);
				if (rightFree) xs.add(tx+clearance);
				break;
			}
			if (trunks.has(targetKey)) break;
		}
	}
	const x = [...xs].sort((a, b) => a - b), y = [...ys].sort((a, b) => a - b);
	const nx = x.length, ny = y.length, count = nx * ny;
	const xIndex = new Map(x.map((value, index) => [value, index]));
	const yIndex = new Map(y.map((value, index) => [value, index]));
	const blocked = new Uint8Array(count);
	const horizontal = new Uint8Array(count), vertical = new Uint8Array(count);
	// Block segments as well as nodes: a long compressed-grid segment can cross a card
	// even when both its endpoints happen to be in free space.
	for (const card of obstacles) {
		const left = card.x - clearance, right = card.x + card.width + clearance;
		const top = card.y - clearance, bottom = card.y + card.height + clearance;
		for (let iy = 0; iy < ny; iy++) for (let ix = 0; ix < nx; ix++) {
			const node = iy * nx + ix;
			if (y[iy] > top && y[iy] < bottom) {
				if (x[ix] > left && x[ix] < right) blocked[node] = 1;
				if (ix + 1 < nx && x[ix] < right && x[ix + 1] > left) horizontal[node] = 1;
			}
			if (x[ix] > left && x[ix] < right && iy + 1 < ny && y[iy] < bottom && y[iy + 1] > top) vertical[node] = 1;
		}
	}
	const traffic = new Map<string, number>();
	const targetTraffic = new Map<string, Set<string>>();
	const edgeKey = (a: number, b: number) => a < b ? `${a}:${b}` : `${b}:${a}`;
	// Local relations get first choice of lanes; long inter-cluster routes use the
	// remaining channels. Stable ordering prevents paths jumping between renders.
	entries.sort((a, b) => (Math.abs(a.source.x - a.target.x) + Math.abs(a.sy - a.ty)) -
		(Math.abs(b.source.x - b.target.x) + Math.abs(b.sy - b.ty)) || a.dependency.id.localeCompare(b.dependency.id));
	for (const entry of entries) {
		const { dependency, source, target, sy, ty, targetKey } = entry;
		const trunk=trunks.get(targetKey);
		const sharedLanes = targetTraffic.get(targetKey) ?? new Set<string>();
		const ports = (card: SchemaTablePosition, py: number, outgoing: boolean) => {
			const px = outgoing ? card.x + card.width : card.x;
			const escape = px + (outgoing ? clearance : -clearance);
			const node = yIndex.get(py)! * nx + xIndex.get(escape)!;
			return blocked[node] ? [] : [{node, x:px, y:py}];
		};
		const starts = ports(source, sy, true), goals = ports(target, ty, false);
		if (!starts.length || !goals.length) continue;
		if (trunk) goals[0].node=yIndex.get(trunk.anchorY)!*nx+xIndex.get(trunk.x)!;
		const goalNodes = new Set(goals.map(port => port.node));
		const distance = new Float64Array(count * 2).fill(Infinity);
		const previous = new Int32Array(count * 2).fill(-1);
		const heap: { state: number; cost: number; estimate: number }[] = [];
		const heuristic = (node: number) => (sharedLanes.size ? 0.65 : 1) * Math.min(...goals.map(goal =>
			Math.abs(x[node % nx] - x[goal.node % nx]) + Math.abs(y[Math.floor(node / nx)] - y[Math.floor(goal.node / nx)])));
		const push = (state: number, cost: number) => {
			const item = { state, cost, estimate: cost + heuristic(Math.floor(state / 2)) };
			let index = heap.length; heap.push(item);
			while (index > 0) {
				const parent = (index - 1) >> 1;
				if (heap[parent].estimate <= item.estimate) break;
				heap[index] = heap[parent]; index = parent;
			}
			heap[index] = item;
		};
		const pop = () => {
			const first = heap[0], last = heap.pop()!;
			if (heap.length) {
				let index = 0;
				while (index * 2 + 1 < heap.length) {
					let child = index * 2 + 1;
					if (child + 1 < heap.length && heap[child + 1].estimate < heap[child].estimate) child++;
					if (heap[child].estimate >= last.estimate) break;
					heap[index] = heap[child]; index = child;
				}
				heap[index] = last;
			}
			return first;
		};
		for (const start of starts) { distance[start.node * 2] = clearance; push(start.node * 2, clearance); }
		let finish = -1;
		while (heap.length) {
			const current = pop();
			if (current.cost !== distance[current.state]) continue;
			const node = Math.floor(current.state / 2), direction = current.state % 2;
			if (goalNodes.has(node) && (!trunk || direction===0)) { finish = current.state; break; }
			const ix = node % nx, iy = Math.floor(node / nx);
			const neighbors: [number, number, number][] = [];
			if (ix > 0 && !horizontal[node - 1]) neighbors.push([node - 1, 0, x[ix] - x[ix - 1]]);
			if (ix + 1 < nx && !horizontal[node]) neighbors.push([node + 1, 0, x[ix + 1] - x[ix]]);
			if (iy > 0 && !vertical[node - nx]) neighbors.push([node - nx, 1, y[iy] - y[iy - 1]]);
			if (iy + 1 < ny && !vertical[node]) neighbors.push([node + nx, 1, y[iy + 1] - y[iy]]);
			for (const [next, orientation, length] of neighbors) {
				if (blocked[next]) continue;
				const key = edgeKey(node, next);
				// Existing lanes to this field attract branches; traffic to other fields
				// still discourages unnecessary overlaps. All costs remain positive.
				const shared = sharedLanes.has(key);
				const cost = current.cost + length * (shared ? 0.65 : 1) + (orientation === direction ? 0 : 24) +
					(shared ? 0 : (traffic.get(key) ?? 0) * (12 + length * 0.3));
				const state = next * 2 + orientation;
				if (cost >= distance[state]) continue;
				distance[state] = cost; previous[state] = current.state; push(state, cost);
			}
		}
		if (finish < 0) continue; // Overlapping manually dragged cards may have no legal exit.
		const nodes: number[] = [];
		for (let state = finish; state >= 0; state = previous[state]) nodes.push(Math.floor(state / 2));
		nodes.reverse();
		const start = starts.find(port => port.node === nodes[0])!;
		const goal = goals.find(port => port.node === nodes[nodes.length - 1])!;
		if (trunk) {
			const column=xIndex.get(trunk.x)!,end=yIndex.get(trunk.y)!;
			let row=yIndex.get(trunk.anchorY)!;
			const step=row<end?1:-1;
			while (row!==end) { row+=step;nodes.push(row*nx+column); }
		}
		for (let i = 1; i < nodes.length; i++) {
			const key = edgeKey(nodes[i - 1], nodes[i]);
			traffic.set(key, (traffic.get(key) ?? 0) + 1);
			sharedLanes.add(key);
		}
		targetTraffic.set(targetKey, sharedLanes);
		const all = [start, ...nodes.map(node => ({ x: x[node % nx], y: y[Math.floor(node / nx)] })), goal];
		const points = all.filter((point, index) => {
			if (index === 0 || index === all.length - 1) return true;
			const before = all[index - 1], after = all[index + 1];
			return !((before.x === point.x && point.x === after.x) || (before.y === point.y && point.y === after.y));
		}).map(({x,y}) => ({x,y}));
		result.set(dependency.id, {
			x1: start.x, y1: start.y, x2: goal.x, y2: goal.y, points, lockedTailPoints:trunk?3:0,
			pathData: points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ')
		});
	}
	return bundleSchemaDependencyRoutes(result, obstacles, gravity?.radius ?? 112, gravity?.strength ?? 1, gravity?.zones ?? []);
}
