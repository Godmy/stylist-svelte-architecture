import type { CanvasShapeKind } from '$stylist/canvas/type/alias/canvas-shape-kind';

/** SVG outlines of canvas shapes inside a `width` x `height` box at the origin. */
export class CanvasShapeManager {
	static polygon(points: readonly [number, number][]): string {
		return (
			points
				.map(([x, y], index) => `${index ? 'L' : 'M'}${+x.toFixed(2)} ${+y.toFixed(2)}`)
				.join(' ') + ' Z'
		);
	}

	/** Filled arrowhead at `to`, pointing away from `from`; `size` is its length. */
	static getArrowHead(
		from: { x: number; y: number },
		to: { x: number; y: number },
		size: number
	): string {
		const angle = Math.atan2(to.y - from.y, to.x - from.x);
		const spread = Math.PI / 7;
		return CanvasShapeManager.polygon([
			[to.x, to.y],
			[to.x - size * Math.cos(angle - spread), to.y - size * Math.sin(angle - spread)],
			[to.x - size * Math.cos(angle + spread), to.y - size * Math.sin(angle + spread)]
		]);
	}

	/** Path data (`d`) of `shape`; `inset` keeps a stroke of that width inside the box. */
	static getPath(shape: CanvasShapeKind, width: number, height: number, inset = 0): string {
		const left = inset;
		const top = inset;
		const w = Math.max(0, width - inset * 2);
		const h = Math.max(0, height - inset * 2);
		const right = left + w;
		const bottom = top + h;
		const cx = left + w / 2;
		const cy = top + h / 2;

		switch (shape) {
			case 'rounded': {
				const r = Math.min(16, w / 4, h / 4);
				return [
					`M${left + r} ${top}`,
					`H${right - r}`,
					`Q${right} ${top} ${right} ${top + r}`,
					`V${bottom - r}`,
					`Q${right} ${bottom} ${right - r} ${bottom}`,
					`H${left + r}`,
					`Q${left} ${bottom} ${left} ${bottom - r}`,
					`V${top + r}`,
					`Q${left} ${top} ${left + r} ${top}`,
					'Z'
				].join(' ');
			}
			case 'ellipse': {
				const rx = w / 2;
				const ry = h / 2;
				return `M${left} ${cy} A${rx} ${ry} 0 1 0 ${right} ${cy} A${rx} ${ry} 0 1 0 ${left} ${cy} Z`;
			}
			case 'triangle':
				return CanvasShapeManager.polygon([
					[cx, top],
					[right, bottom],
					[left, bottom]
				]);
			case 'diamond':
				return CanvasShapeManager.polygon([
					[cx, top],
					[right, cy],
					[cx, bottom],
					[left, cy]
				]);
			case 'hexagon':
				return CanvasShapeManager.polygon([
					[left + w * 0.25, top],
					[left + w * 0.75, top],
					[right, cy],
					[left + w * 0.75, bottom],
					[left + w * 0.25, bottom],
					[left, cy]
				]);
			case 'star': {
				const points: [number, number][] = [];
				for (let index = 0; index < 10; index += 1) {
					const angle = -Math.PI / 2 + (index * Math.PI) / 5;
					const scale = index % 2 === 0 ? 1 : 0.45;
					points.push([
						cx + Math.cos(angle) * (w / 2) * scale,
						cy + Math.sin(angle) * (h / 2) * scale
					]);
				}
				return CanvasShapeManager.polygon(points);
			}
			default:
				return `M${left} ${top} H${right} V${bottom} H${left} Z`;
		}
	}
}
