import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';
import type { CanvasShapeKind } from '$stylist/canvas/type/alias/canvas-shape-kind';

/** SVG outlines of canvas shapes inside a `width` x `height` box at the origin. */
export class CanvasShapeManager {
	/** Corners of the polygonal shapes, normalized to the box (`0..1` on each axis). */
	static readonly unitPolygons: Partial<Record<CanvasShapeKind, readonly [number, number][]>> = {
		triangle: [
			[0.5, 0],
			[1, 1],
			[0, 1]
		],
		'right-triangle': [
			[0, 0],
			[1, 1],
			[0, 1]
		],
		diamond: [
			[0.5, 0],
			[1, 0.5],
			[0.5, 1],
			[0, 0.5]
		],
		parallelogram: [
			[0.25, 0],
			[1, 0],
			[0.75, 1],
			[0, 1]
		],
		trapezoid: [
			[0.2, 0],
			[0.8, 0],
			[1, 1],
			[0, 1]
		],
		pentagon: [
			[0.5, 0],
			[1, 0.382],
			[0.809, 1],
			[0.191, 1],
			[0, 0.382]
		],
		hexagon: [
			[0.25, 0],
			[0.75, 0],
			[1, 0.5],
			[0.75, 1],
			[0.25, 1],
			[0, 0.5]
		],
		octagon: [
			[0.29, 0],
			[0.71, 0],
			[1, 0.29],
			[1, 0.71],
			[0.71, 1],
			[0.29, 1],
			[0, 0.71],
			[0, 0.29]
		],
		cross: [
			[0.33, 0],
			[0.67, 0],
			[0.67, 0.33],
			[1, 0.33],
			[1, 0.67],
			[0.67, 0.67],
			[0.67, 1],
			[0.33, 1],
			[0.33, 0.67],
			[0, 0.67],
			[0, 0.33],
			[0.33, 0.33]
		],
		'arrow-right': [
			[0, 0.3],
			[0.6, 0.3],
			[0.6, 0],
			[1, 0.5],
			[0.6, 1],
			[0.6, 0.7],
			[0, 0.7]
		],
		'arrow-left': [
			[1, 0.3],
			[0.4, 0.3],
			[0.4, 0],
			[0, 0.5],
			[0.4, 1],
			[0.4, 0.7],
			[1, 0.7]
		],
		chevron: [
			[0, 0],
			[0.7, 0],
			[1, 0.5],
			[0.7, 1],
			[0, 1],
			[0.3, 0.5]
		],
		callout: [
			[0, 0],
			[1, 0],
			[1, 0.75],
			[0.45, 0.75],
			[0.2, 1],
			[0.25, 0.75],
			[0, 0.75]
		]
	};

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

	/**
	 * Path data (`d`) of `shape`; `inset` keeps a stroke of that width inside
	 * the box. `vertices` (normalized corners) are used by `polygon`.
	 */
	static getPath(
		shape: CanvasShapeKind,
		width: number,
		height: number,
		inset = 0,
		vertices?: readonly Point2D[]
	): string {
		const left = inset;
		const top = inset;
		const w = Math.max(0, width - inset * 2);
		const h = Math.max(0, height - inset * 2);
		const right = left + w;
		const bottom = top + h;
		const cx = left + w / 2;
		const cy = top + h / 2;
		const x = (unit: number) => +(left + unit * w).toFixed(2);
		const y = (unit: number) => +(top + unit * h).toFixed(2);
		const unitPolygon = CanvasShapeManager.unitPolygons[shape];

		if (unitPolygon) {
			return CanvasShapeManager.polygon(unitPolygon.map(([px, py]) => [x(px), y(py)]));
		}

		switch (shape) {
			case 'polygon':
				return vertices && vertices.length >= 3
					? CanvasShapeManager.polygon(vertices.map((vertex) => [x(vertex.x), y(vertex.y)]))
					: `M${left} ${top} H${right} V${bottom} H${left} Z`;
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
			case 'cylinder': {
				const rx = w / 2;
				const ry = Math.min(h * 0.15, w / 3);
				// Front rim of the top ellipse first, then the closed body.
				return [
					`M${left} ${top + ry}`,
					`A${rx} ${ry} 0 0 0 ${right} ${top + ry}`,
					`M${left} ${top + ry}`,
					`A${rx} ${ry} 0 0 1 ${right} ${top + ry}`,
					`V${bottom - ry}`,
					`A${rx} ${ry} 0 0 1 ${left} ${bottom - ry}`,
					'Z'
				].join(' ');
			}
			case 'cloud': {
				const arc = (rx: number, ry: number, ex: number, ey: number) =>
					`A${+(rx * w).toFixed(2)} ${+(ry * h).toFixed(2)} 0 0 1 ${x(ex)} ${y(ey)}`;
				return [
					`M${x(0.25)} ${y(0.85)}`,
					arc(0.18, 0.2, 0.12, 0.45),
					arc(0.2, 0.24, 0.42, 0.15),
					arc(0.2, 0.22, 0.78, 0.22),
					arc(0.18, 0.24, 0.85, 0.85),
					'Z'
				].join(' ');
			}
			case 'heart':
				return [
					`M${x(0.5)} ${y(1)}`,
					`C${x(0.1)} ${y(0.68)} ${x(0)} ${y(0.47)} ${x(0)} ${y(0.28)}`,
					`C${x(0)} ${y(0.1)} ${x(0.15)} ${y(0)} ${x(0.3)} ${y(0)}`,
					`C${x(0.42)} ${y(0)} ${x(0.5)} ${y(0.1)} ${x(0.5)} ${y(0.18)}`,
					`C${x(0.5)} ${y(0.1)} ${x(0.58)} ${y(0)} ${x(0.7)} ${y(0)}`,
					`C${x(0.85)} ${y(0)} ${x(1)} ${y(0.1)} ${x(1)} ${y(0.28)}`,
					`C${x(1)} ${y(0.47)} ${x(0.9)} ${y(0.68)} ${x(0.5)} ${y(1)}`,
					'Z'
				].join(' ');
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
