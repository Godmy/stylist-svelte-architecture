import { CanvasGeometryManager } from '$stylist/canvas/class/manager/canvas-geometry';
import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';
import type { SlotSharedCanvasObjectBounds } from '$stylist/canvas/interface/slot/shared-canvas-object-bounds';
import type { CanvasRecognition } from '$stylist/canvas/type/alias/canvas-recognition';
import type { CanvasShapeKind } from '$stylist/canvas/type/alias/canvas-shape-kind';

/**
 * Recognition of freehand strokes ("smart pen"): a nearly straight stroke
 * becomes a line, a closed one an ellipse, rectangle, triangle, diamond, star
 * or a clean polygon. Scribbles are not recognized (`null`) and stay strokes.
 * Tolerances are relative to the stroke size, so the zoom level does not matter.
 */
export class CanvasRecognitionManager {
	/** Strokes whose bounding box diagonal is shorter are taps, not figures. */
	static readonly minSize = 12;

	/** Chord-to-length ratio from which an open stroke counts as straight. */
	static readonly straightness = 0.92;

	/** Angle (radians) within which lines snap to a multiple of 45°. */
	static readonly lineSnap = (7 * Math.PI) / 180;

	/** Relative size difference under which rectangles become squares and ellipses circles. */
	static readonly squareSnap = 0.15;

	static recognize(points: readonly Point2D[]): CanvasRecognition | null {
		if (points.length < 3) return null;

		const bounds = CanvasGeometryManager.getPointsBounds(points);
		const diagonal = Math.hypot(bounds.width, bounds.height);
		if (diagonal < CanvasRecognitionManager.minSize) return null;

		const first = points[0];
		const last = points[points.length - 1];
		const length = CanvasRecognitionManager.getLength(points);
		const gap = Math.hypot(last.x - first.x, last.y - first.y);

		if (gap / length >= CanvasRecognitionManager.straightness) {
			return {
				kind: 'line',
				points: [{ ...first }, CanvasRecognitionManager.snapLine(first, last)]
			};
		}

		const closed = gap <= Math.max(diagonal * 0.25, 10);
		const flat = Math.min(bounds.width, bounds.height) < CanvasRecognitionManager.minSize / 2;
		if (!closed || flat) return null;

		const loop = CanvasRecognitionManager.resample([...points, first], 72);
		const corners = CanvasRecognitionManager.getCorners(loop, diagonal);
		const ellipseError = CanvasRecognitionManager.getEllipseError(loop, bounds);

		if (ellipseError < 0.05 || (ellipseError < 0.1 && corners.length >= 5)) {
			return CanvasRecognitionManager.toShape(
				'ellipse',
				CanvasRecognitionManager.snapSquare(bounds)
			);
		}
		if (corners.length < 3) return null;

		const polygonError =
			loop.reduce(
				(sum, point) =>
					sum + CanvasGeometryManager.getPolylineDistance(point, [...corners, corners[0]]),
				0
			) /
			loop.length /
			diagonal;
		if (polygonError > 0.045) return null;

		return CanvasRecognitionManager.classifyPolygon(corners);
	}

	/** Shape (or `null`) for corners of a closed polygonal stroke. */
	static classifyPolygon(corners: readonly Point2D[]): CanvasRecognition | null {
		const count = corners.length;
		if (count === 5 && CanvasRecognitionManager.isSelfIntersecting(corners)) {
			return CanvasRecognitionManager.toShape(
				'star',
				CanvasGeometryManager.getPointsBounds(corners)
			);
		}
		if (count === 10 && CanvasRecognitionManager.isStar(corners)) {
			return CanvasRecognitionManager.toShape(
				'star',
				CanvasGeometryManager.getPointsBounds(corners)
			);
		}
		if (count > 8) return null;

		const box = CanvasGeometryManager.getPointsBounds(corners);
		const vertices = corners.map((corner) => ({
			x: CanvasRecognitionManager.snapUnit((corner.x - box.x) / box.width),
			y: CanvasRecognitionManager.snapUnit((corner.y - box.y) / box.height)
		}));
		const key = vertices
			.map((vertex) => `${vertex.x},${vertex.y}`)
			.sort()
			.join(' ');

		if (
			count === 4 &&
			(key === '0,0 0,1 1,0 1,1' || CanvasRecognitionManager.isAxisAligned(corners))
		) {
			return CanvasRecognitionManager.toShape(
				'rectangle',
				CanvasRecognitionManager.snapSquare(box)
			);
		}
		if (count === 4 && key === '0,0.5 0.5,0 0.5,1 1,0.5') {
			return CanvasRecognitionManager.toShape('diamond', box);
		}
		if (count === 3 && key === '0,1 0.5,0 1,1') {
			return CanvasRecognitionManager.toShape('triangle', box);
		}
		return { ...CanvasRecognitionManager.toShape('polygon', box), vertices };
	}

	static getLength(points: readonly Point2D[]): number {
		let length = 0;
		for (let index = 1; index < points.length; index += 1) {
			length += Math.hypot(
				points[index].x - points[index - 1].x,
				points[index].y - points[index - 1].y
			);
		}
		return length;
	}

	/**
	 * `count` points evenly spaced along a closed polyline (its last point
	 * equals the first; the duplicate is not returned).
	 */
	static resample(points: readonly Point2D[], count: number): Point2D[] {
		const length = CanvasRecognitionManager.getLength(points);
		if (!length) return [{ ...points[0] }];

		const step = length / count;
		const result: Point2D[] = [{ ...points[0] }];
		let travelled = 0;
		let target = step;
		for (let index = 1; index < points.length && result.length < count; index += 1) {
			const from = points[index - 1];
			const to = points[index];
			const segment = Math.hypot(to.x - from.x, to.y - from.y);
			while (segment && travelled + segment >= target && result.length < count) {
				const ratio = (target - travelled) / segment;
				result.push({ x: from.x + (to.x - from.x) * ratio, y: from.y + (to.y - from.y) * ratio });
				target += step;
			}
			travelled += segment;
		}
		return result;
	}

	/** Ramer–Douglas–Peucker simplification of an open polyline. */
	static simplify(points: readonly Point2D[], epsilon: number): Point2D[] {
		if (points.length < 3) return points.map((point) => ({ ...point }));

		const first = points[0];
		const last = points[points.length - 1];
		let farthest = 0;
		let distance = 0;
		for (let index = 1; index < points.length - 1; index += 1) {
			const current = CanvasGeometryManager.getSegmentDistance(points[index], first, last);
			if (current > distance) {
				distance = current;
				farthest = index;
			}
		}
		if (distance <= epsilon) return [{ ...first }, { ...last }];

		const head = CanvasRecognitionManager.simplify(points.slice(0, farthest + 1), epsilon);
		const tail = CanvasRecognitionManager.simplify(points.slice(farthest), epsilon);
		return [...head.slice(0, -1), ...tail];
	}

	/**
	 * Corners of a closed, evenly resampled stroke: simplification starting at
	 * the point farthest from the centroid (always a corner of a convex
	 * figure), then removal of near-duplicate and nearly straight vertices.
	 */
	static getCorners(loop: readonly Point2D[], diagonal: number): Point2D[] {
		const centroid = {
			x: loop.reduce((sum, point) => sum + point.x, 0) / loop.length,
			y: loop.reduce((sum, point) => sum + point.y, 0) / loop.length
		};
		let start = 0;
		loop.forEach((point, index) => {
			const current = Math.hypot(point.x - centroid.x, point.y - centroid.y);
			const best = Math.hypot(loop[start].x - centroid.x, loop[start].y - centroid.y);
			if (current > best) start = index;
		});

		const rotated = [...loop.slice(start), ...loop.slice(0, start)];
		let corners = CanvasRecognitionManager.simplify(
			[...rotated, rotated[0]],
			diagonal * 0.06
		).slice(0, -1);

		let changed = true;
		while (changed && corners.length > 2) {
			changed = false;
			for (let index = 0; index < corners.length; index += 1) {
				const previous = corners[(index - 1 + corners.length) % corners.length];
				const current = corners[index];
				const next = corners[(index + 1) % corners.length];
				const near = Math.hypot(next.x - current.x, next.y - current.y) < diagonal * 0.08;
				const turn = Math.abs(
					Math.atan2(
						(current.x - previous.x) * (next.y - current.y) -
							(current.y - previous.y) * (next.x - current.x),
						(current.x - previous.x) * (next.x - current.x) +
							(current.y - previous.y) * (next.y - current.y)
					)
				);
				if (near || turn < Math.PI / 7) {
					corners = corners.filter((_, position) => position !== index);
					changed = true;
					break;
				}
			}
		}
		return corners;
	}

	/** Mean relative deviation of the points from the ellipse inscribed in `bounds`. */
	static getEllipseError(points: readonly Point2D[], bounds: SlotSharedCanvasObjectBounds): number {
		const rx = bounds.width / 2;
		const ry = bounds.height / 2;
		const cx = bounds.x + rx;
		const cy = bounds.y + ry;
		return (
			points.reduce(
				(sum, point) => sum + Math.abs(Math.hypot((point.x - cx) / rx, (point.y - cy) / ry) - 1),
				0
			) / points.length
		);
	}

	/** Whether every side runs within 12° of horizontal or vertical. */
	static isAxisAligned(corners: readonly Point2D[]): boolean {
		const tolerance = (12 * Math.PI) / 180;
		return corners.every((corner, index) => {
			const next = corners[(index + 1) % corners.length];
			const angle = Math.abs(Math.atan2(next.y - corner.y, next.x - corner.x)) % (Math.PI / 2);
			return angle < tolerance || Math.PI / 2 - angle < tolerance;
		});
	}

	/** Whether two non-adjacent sides of a closed polygon cross (a pentagram stroke). */
	static isSelfIntersecting(corners: readonly Point2D[]): boolean {
		const count = corners.length;
		const cross = (a: Point2D, b: Point2D, c: Point2D) =>
			(b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
		for (let first = 0; first < count; first += 1) {
			for (let second = first + 2; second < count; second += 1) {
				if (first === 0 && second === count - 1) continue;
				const a = corners[first];
				const b = corners[(first + 1) % count];
				const c = corners[second];
				const d = corners[(second + 1) % count];
				if (cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0) return true;
			}
		}
		return false;
	}

	/** Whether ten corners alternate between outer and inner radius. */
	static isStar(corners: readonly Point2D[]): boolean {
		const box = CanvasGeometryManager.getPointsBounds(corners);
		const cx = box.x + box.width / 2;
		const cy = box.y + box.height / 2;
		const radii = corners.map((corner) =>
			Math.hypot((corner.x - cx) / box.width, (corner.y - cy) / box.height)
		);
		return radii.every((radius, index) => {
			const next = radii[(index + 1) % radii.length];
			return Math.min(radius, next) / Math.max(radius, next) < 0.75;
		});
	}

	/** Coordinate in `0..1` snapped to an edge or the middle when within 0.1 of it. */
	static snapUnit(value: number): number {
		for (const anchor of [0, 0.5, 1]) {
			if (Math.abs(value - anchor) <= 0.1) return anchor;
		}
		return Math.round(value * 1000) / 1000;
	}

	/** End of a line, turned to the nearest multiple of 45° when close to it. */
	static snapLine(start: Point2D, end: Point2D): Point2D {
		const angle = Math.atan2(end.y - start.y, end.x - start.x);
		const snapped = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
		if (Math.abs(angle - snapped) > CanvasRecognitionManager.lineSnap) return { ...end };
		const length = Math.hypot(end.x - start.x, end.y - start.y);
		return {
			x: start.x + Math.round(Math.cos(snapped) * length * 100) / 100,
			y: start.y + Math.round(Math.sin(snapped) * length * 100) / 100
		};
	}

	/** Nearly square box made square around the same center. */
	static snapSquare(box: SlotSharedCanvasObjectBounds): SlotSharedCanvasObjectBounds {
		const larger = Math.max(box.width, box.height);
		if (Math.abs(box.width - box.height) / larger > CanvasRecognitionManager.squareSnap) return box;
		const side = (box.width + box.height) / 2;
		return {
			x: box.x + (box.width - side) / 2,
			y: box.y + (box.height - side) / 2,
			width: side,
			height: side
		};
	}

	static toShape(
		shape: CanvasShapeKind,
		box: SlotSharedCanvasObjectBounds
	): Extract<CanvasRecognition, { kind: 'shape' }> {
		return { kind: 'shape', shape, x: box.x, y: box.y, width: box.width, height: box.height };
	}
}
