import { describe, expect, it } from 'vitest';
import { CanvasBoardManager } from '$stylist/canvas/class/manager/canvas-board';
import { CanvasManager } from '$stylist/canvas/class/manager/canvas';
import { CanvasRecognitionManager } from '$stylist/canvas/class/manager/canvas-recognition';
import { CanvasShapeManager } from '$stylist/canvas/class/manager/canvas-shape';
import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';
import type { CanvasObject } from '$stylist/canvas/type/alias/canvas-object';

/** Deterministic jitter, so a "hand-drawn" stroke is the same in every run. */
const jitter = (index: number, amount: number) => Math.sin(index * 12.9898) * amount;

/** Hand-drawn closed stroke through `corners`, with noise and a small overshoot. */
const drawPolygon = (corners: Point2D[], noise = 2, steps = 14): Point2D[] => {
	const points: Point2D[] = [];
	corners.forEach((corner, side) => {
		const next = corners[(side + 1) % corners.length];
		for (let step = 0; step < steps; step += 1) {
			const t = step / steps;
			const index = side * steps + step;
			points.push({
				x: corner.x + (next.x - corner.x) * t + jitter(index, noise),
				y: corner.y + (next.y - corner.y) * t + jitter(index + 7, noise)
			});
		}
	});
	points.push({ x: corners[0].x + 4, y: corners[0].y + 3 });
	return points;
};

const drawEllipse = (cx: number, cy: number, rx: number, ry: number, noise = 2): Point2D[] =>
	Array.from({ length: 60 }, (_, index) => {
		const angle = (index / 56) * Math.PI * 2;
		return {
			x: cx + Math.cos(angle) * rx + jitter(index, noise),
			y: cy + Math.sin(angle) * ry + jitter(index + 3, noise)
		};
	});

describe('CanvasRecognitionManager', () => {
	it('recognizes a sloppy square as a square rectangle', () => {
		const result = CanvasRecognitionManager.recognize(
			drawPolygon([
				{ x: 100, y: 100 },
				{ x: 205, y: 102 },
				{ x: 203, y: 198 },
				{ x: 98, y: 200 }
			])
		);
		expect(result).toMatchObject({ kind: 'shape', shape: 'rectangle' });
		if (result?.kind !== 'shape') return;
		expect(result.width).toBeCloseTo(result.height, 5);
		expect(result.width).toBeGreaterThan(90);
	});

	it('keeps a wide rectangle wide', () => {
		const result = CanvasRecognitionManager.recognize(
			drawPolygon([
				{ x: 0, y: 0 },
				{ x: 300, y: 0 },
				{ x: 300, y: 120 },
				{ x: 0, y: 120 }
			])
		);
		expect(result).toMatchObject({ kind: 'shape', shape: 'rectangle' });
		if (result?.kind === 'shape') expect(result.width / result.height).toBeGreaterThan(2);
	});

	it('recognizes circles and ellipses', () => {
		const circle = CanvasRecognitionManager.recognize(drawEllipse(200, 200, 80, 76));
		expect(circle).toMatchObject({ kind: 'shape', shape: 'ellipse' });
		if (circle?.kind === 'shape') expect(circle.width).toBeCloseTo(circle.height, 5);

		const ellipse = CanvasRecognitionManager.recognize(drawEllipse(200, 200, 150, 60));
		expect(ellipse).toMatchObject({ kind: 'shape', shape: 'ellipse' });
		if (ellipse?.kind === 'shape') expect(ellipse.width).toBeGreaterThan(ellipse.height * 2);
	});

	it('recognizes an isosceles triangle and a diamond', () => {
		expect(
			CanvasRecognitionManager.recognize(
				drawPolygon([
					{ x: 150, y: 0 },
					{ x: 300, y: 200 },
					{ x: 0, y: 200 }
				])
			)
		).toMatchObject({ kind: 'shape', shape: 'triangle' });

		expect(
			CanvasRecognitionManager.recognize(
				drawPolygon([
					{ x: 100, y: 0 },
					{ x: 200, y: 100 },
					{ x: 100, y: 200 },
					{ x: 0, y: 100 }
				])
			)
		).toMatchObject({ kind: 'shape', shape: 'diamond' });
	});

	it('turns other clean figures into polygons with normalized corners', () => {
		const result = CanvasRecognitionManager.recognize(
			drawPolygon([
				{ x: 0, y: 0 },
				{ x: 200, y: 160 },
				{ x: 40, y: 200 }
			])
		);
		expect(result).toMatchObject({ kind: 'shape', shape: 'polygon' });
		if (result?.kind !== 'shape') return;
		expect(result.vertices).toHaveLength(3);
		for (const vertex of result.vertices ?? []) {
			expect(vertex.x).toBeGreaterThanOrEqual(0);
			expect(vertex.x).toBeLessThanOrEqual(1);
			expect(vertex.y).toBeGreaterThanOrEqual(0);
			expect(vertex.y).toBeLessThanOrEqual(1);
		}
	});

	it('recognizes a pentagram stroke as a star', () => {
		const star = [0, 2, 4, 1, 3].map((index) => {
			const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 5;
			return { x: 200 + Math.cos(angle) * 100, y: 200 + Math.sin(angle) * 100 };
		});
		expect(CanvasRecognitionManager.recognize(drawPolygon(star, 1.5, 16))).toMatchObject({
			kind: 'shape',
			shape: 'star'
		});
	});

	it('straightens lines and snaps them to 45°', () => {
		const points = Array.from({ length: 20 }, (_, index) => ({
			x: index * 10,
			y: index * 0.6 + jitter(index, 1.5)
		}));
		const result = CanvasRecognitionManager.recognize(points);
		expect(result?.kind).toBe('line');
		if (result?.kind !== 'line') return;
		expect(result.points[1].y).toBeCloseTo(result.points[0].y, 5);
	});

	it('leaves scribbles, open curves and taps alone', () => {
		const scribble = Array.from({ length: 80 }, (_, index) => ({
			x: 100 + Math.sin(index * 0.9) * 80 + index,
			y: 100 + Math.cos(index * 1.7) * 60
		}));
		expect(CanvasRecognitionManager.recognize(scribble)).toBeNull();

		const arc = Array.from({ length: 30 }, (_, index) => {
			const angle = (index / 29) * Math.PI;
			return { x: 100 + Math.cos(angle) * 80, y: 100 + Math.sin(angle) * 80 };
		});
		expect(CanvasRecognitionManager.recognize(arc)).toBeNull();

		expect(
			CanvasRecognitionManager.recognize([
				{ x: 0, y: 0 },
				{ x: 2, y: 1 },
				{ x: 3, y: 3 }
			])
		).toBeNull();
	});
});

describe('CanvasBoardManager.recognize', () => {
	const style = { ...CanvasBoardManager.defaultStyle, fill: '#fde68a' };
	const path = (points: Point2D[]): CanvasObject => ({
		id: 'stroke',
		type: 'path',
		color: '#2563eb',
		strokeWidth: 4,
		points
	});

	it('keeps id, color and width, takes fill from the style', () => {
		const shape = CanvasBoardManager.recognize(path(drawEllipse(100, 100, 50, 50)), style);
		expect(shape).toMatchObject({
			id: 'stroke',
			type: 'shape',
			shape: 'ellipse',
			color: '#2563eb',
			strokeWidth: 4,
			fill: '#fde68a'
		});
		expect(CanvasManager.isCanvasObject(shape)).toBe(true);
	});

	it('returns unrecognized strokes and other objects unchanged', () => {
		const scribble = path(
			Array.from({ length: 60 }, (_, index) => ({
				x: Math.sin(index * 0.9) * 80 + index,
				y: Math.cos(index * 1.7) * 60
			}))
		);
		expect(CanvasBoardManager.recognize(scribble, style)).toBe(scribble);
	});
});

describe('CanvasShapeManager polygons', () => {
	it('draws a polygon from normalized vertices and validates them', () => {
		const vertices = [
			{ x: 0, y: 0 },
			{ x: 1, y: 0.5 },
			{ x: 0, y: 1 }
		];
		expect(CanvasShapeManager.getPath('polygon', 100, 50, 0, vertices)).toBe(
			'M0 0 L100 25 L0 50 Z'
		);
		expect(
			CanvasManager.isCanvasObject({
				id: 'p',
				type: 'shape',
				shape: 'polygon',
				x: 0,
				y: 0,
				width: 10,
				height: 10
			})
		).toBe(false);
	});
});
