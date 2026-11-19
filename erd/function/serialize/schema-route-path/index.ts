import type { SchemaDependencyRoute } from '$stylist/erd/type/object/schema-dependency-route';

/** Round orthogonal elbows while keeping field endpoints and their tangents fixed. */
export function serializeSchemaRoutePath(points: SchemaDependencyRoute['points'], radius = 24): string {
	if (!points.length) return '';
	const number = (value: number) => Number(value.toFixed(3));
	const pair = (point: {x: number; y: number}) => `${number(point.x)} ${number(point.y)}`;
	let path = `M ${pair(points[0])}`;
	for (let i = 1; i < points.length - 1; i++) {
		const before = points[i - 1], corner = points[i], after = points[i + 1];
		const incoming = Math.hypot(corner.x - before.x, corner.y - before.y);
		const outgoing = Math.hypot(after.x - corner.x, after.y - corner.y);
		const bend = Math.min(radius, incoming / 2, outgoing / 2);
		if (!bend || (before.x === corner.x && corner.x === after.x) ||
			(before.y === corner.y && corner.y === after.y)) {
			path += ` L ${pair(corner)}`;
			continue;
		}
		const enter = { x: corner.x + (before.x - corner.x) * bend / incoming,
			y: corner.y + (before.y - corner.y) * bend / incoming };
		const leave = { x: corner.x + (after.x - corner.x) * bend / outgoing,
			y: corner.y + (after.y - corner.y) * bend / outgoing };
		path += ` L ${pair(enter)} Q ${pair(corner)} ${pair(leave)}`;
	}
	if (points.length > 1) path += ` L ${pair(points[points.length - 1])}`;
	return path;
}
