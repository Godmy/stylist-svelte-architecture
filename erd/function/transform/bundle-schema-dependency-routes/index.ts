import type { SchemaDependencyRoute } from '$stylist/erd/type/object/schema-dependency-route';
import type { SchemaTablePosition } from '$stylist/erd/type/object/schema-table-position';
import { serializeSchemaRoutePath } from '$stylist/erd/function/serialize/schema-route-path';
import type { SchemaGravityZone } from '$stylist/erd/type/object/schema-gravity-zone';

/** Relax nearby parallel sections into common trunks, keeping cards as hard barriers. */
export function bundleSchemaDependencyRoutes(
	routes: ReadonlyMap<string, SchemaDependencyRoute>,
	obstacles: readonly SchemaTablePosition[],
	attractionRadius = 112,
	strength = 1,
	zones: readonly SchemaGravityZone[] = []
): Map<string, SchemaDependencyRoute> {
	const entries = [...routes].map(([id, route]) => ({id, route, points: route.points.map(point => ({...point}))}));
	const margin = 8;
	const clear = (points: SchemaDependencyRoute['points']) => {
		for (let i = 0; i < points.length - 1; i++) {
			const a = points[i], b = points[i + 1];
			for (const box of obstacles) {
				// The short horizontal field stubs must be allowed to leave/enter their
				// own card's safety margin. Every other obstacle remains solid.
				const endpoint = i === 0 ? a : i === points.length - 2 ? b : null;
				const outside = i === 0 ? b : a;
				if (endpoint && a.y === b.y && endpoint.y >= box.y && endpoint.y <= box.y + box.height &&
					((endpoint.x === box.x && outside.x <= box.x) ||
					(endpoint.x === box.x + box.width && outside.x >= box.x + box.width))) continue;
				const left = box.x - margin, right = box.x + box.width + margin;
				const top = box.y - margin, bottom = box.y + box.height + margin;
				if (a.x === b.x
					? a.x > left && a.x < right && Math.max(a.y,b.y) > top && Math.min(a.y,b.y) < bottom
					: a.y > top && a.y < bottom && Math.max(a.x,b.x) > left && Math.min(a.x,b.x) < right) return false;
			}
		}
		return true;
	};
	for (let iteration = 0; iteration < 24 && attractionRadius > 0; iteration++) {
		const segments = entries.flatMap((entry, routeIndex) => entry.points.slice(1).map((b, index) => {
			const a = entry.points[index], horizontal = a.y === b.y;
			return {routeIndex, index, horizontal, normal: horizontal ? a.y : a.x,
				lo: Math.min(horizontal ? a.x : a.y, horizontal ? b.x : b.y),
				hi: Math.max(horizontal ? a.x : a.y, horizontal ? b.x : b.y),
				movable: index > 0 && index + 1 < entry.points.length - Math.max(1,entry.route.lockedTailPoints ?? 1)};
		}));
		// Spatial buckets make attraction local even on larger schemas. Only
		// parallel sections with a shared projected span contribute any force.
		const buckets = new Map<string, typeof segments>();
		for (const segment of segments) {
			const key = `${segment.horizontal}:${Math.floor(segment.normal / attractionRadius)}`;
			const bucket = buckets.get(key) ?? []; bucket.push(segment); buckets.set(key,bucket);
		}
		let movement = 0;
		for (const segment of segments) {
			if (!segment.movable || segment.hi - segment.lo < 8) continue;
			let force = 0, mass = 0;
			const band = Math.floor(segment.normal / attractionRadius);
			for (let bucketIndex = band - 1; bucketIndex <= band + 1; bucketIndex++) {
				for (const neighbor of buckets.get(`${segment.horizontal}:${bucketIndex}`) ?? []) {
					if (neighbor.routeIndex === segment.routeIndex) continue;
					const distance = Math.abs(segment.normal - neighbor.normal);
					if (distance >= attractionRadius) continue;
					const overlap = Math.min(segment.hi,neighbor.hi) - Math.max(segment.lo,neighbor.lo);
					const shorter = Math.min(segment.hi - segment.lo, neighbor.hi - neighbor.lo);
					if (overlap < Math.min(40,shorter * 0.5) || overlap <= 6) continue;
					const weight = Math.min(1,overlap / Math.max(40,shorter)) * (1 - distance / attractionRadius) ** 2;
					const along = (Math.max(segment.lo,neighbor.lo) + Math.min(segment.hi,neighbor.hi)) / 2;
					const normal = (segment.normal + neighbor.normal) / 2;
					const point = segment.horizontal ? {x:along,y:normal} : {x:normal,y:along};
					let localStrength = Math.max(0,strength);
					for (const zone of zones) {
						const proximity = Math.max(0,1 - Math.hypot(point.x-zone.x,point.y-zone.y) / Math.max(1,zone.radius));
						localStrength += Math.max(0,zone.strength) * proximity ** 2;
					}
					const response = 1 - Math.exp(-0.55 * localStrength);
					force += (neighbor.normal - segment.normal) * weight * response;
					mass += weight;
				}
			}
			if (!mass) continue;
			const entry = entries[segment.routeIndex], index = segment.index;
			const previous = entry.points[index - 1], a = entry.points[index], b = entry.points[index + 1], next = entry.points[index + 2];
			const limit = Math.min(14, Math.hypot(a.x-previous.x,a.y-previous.y)*0.3,
				Math.hypot(next.x-b.x,next.y-b.y)*0.3);
			let delta = Math.max(-limit, Math.min(limit, force / (1 + mass)));
			if (Math.abs(delta) < 0.002) continue;
			for (let attempt = 0; attempt < 9; attempt++, delta /= 2) {
				const candidate = entry.points.map((point,i) => i === index || i === index + 1
					? segment.horizontal ? {...point,y:point.y+delta} : {...point,x:point.x+delta} : point);
				if (!clear(candidate)) continue;
				entry.points = candidate;
				movement = Math.max(movement,Math.abs(delta));
				break;
			}
		}
		if (movement < 0.002) break;
	}
	return new Map(entries.map(({id,route,points}) => [id,{...route,points,pathData:serializeSchemaRoutePath(points)}]));
}
