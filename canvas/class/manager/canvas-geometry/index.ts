import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';
import type { SlotSharedCanvasObjectBounds } from '$stylist/canvas/interface/slot/shared-canvas-object-bounds';
import type { CanvasObject } from '$stylist/canvas/type/alias/canvas-object';
import type { CanvasResizeHandle } from '$stylist/canvas/type/alias/canvas-resize-handle';

/** Bounds, hit testing, area selection and resizing of shared canvas objects. */
export class CanvasGeometryManager {
	static readonly minSize = 8;

	static normalizeRect(start: Point2D, end: Point2D): SlotSharedCanvasObjectBounds {
		return {
			x: Math.min(start.x, end.x),
			y: Math.min(start.y, end.y),
			width: Math.abs(end.x - start.x),
			height: Math.abs(end.y - start.y)
		};
	}

	static getPointsBounds(points: readonly Point2D[]): SlotSharedCanvasObjectBounds {
		const xs = points.map((point) => point.x);
		const ys = points.map((point) => point.y);
		const x = Math.min(...xs);
		const y = Math.min(...ys);

		return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
	}

	static getBounds(object: CanvasObject): SlotSharedCanvasObjectBounds {
		if (object.type === 'line' || object.type === 'path') {
			return CanvasGeometryManager.getPointsBounds(object.points);
		}

		return { x: object.x, y: object.y, width: object.width, height: object.height };
	}

	/** Bounding box around several objects, or `null` for none. */
	static getGroupBounds(objects: readonly CanvasObject[]): SlotSharedCanvasObjectBounds | null {
		if (!objects.length) return null;

		const boxes = objects.map(CanvasGeometryManager.getBounds);
		const x = Math.min(...boxes.map((box) => box.x));
		const y = Math.min(...boxes.map((box) => box.y));

		return {
			x,
			y,
			width: Math.max(...boxes.map((box) => box.x + box.width)) - x,
			height: Math.max(...boxes.map((box) => box.y + box.height)) - y
		};
	}

	static getSegmentDistance(point: Point2D, start: Point2D, end: Point2D): number {
		const dx = end.x - start.x;
		const dy = end.y - start.y;
		const lengthSquared = dx * dx + dy * dy;
		const t =
			lengthSquared === 0
				? 0
				: Math.max(
						0,
						Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared)
					);

		return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
	}

	static getPolylineDistance(point: Point2D, points: readonly Point2D[]): number {
		if (points.length === 1) return Math.hypot(point.x - points[0].x, point.y - points[0].y);

		let distance = Infinity;
		for (let index = 1; index < points.length; index += 1) {
			distance = Math.min(
				distance,
				CanvasGeometryManager.getSegmentDistance(point, points[index - 1], points[index])
			);
		}
		return distance;
	}

	static isPointInRect(point: Point2D, rect: SlotSharedCanvasObjectBounds, tolerance = 0): boolean {
		return (
			point.x >= rect.x - tolerance &&
			point.x <= rect.x + rect.width + tolerance &&
			point.y >= rect.y - tolerance &&
			point.y <= rect.y + rect.height + tolerance
		);
	}

	static isPointOnObject(object: CanvasObject, point: Point2D, tolerance = 4): boolean {
		switch (object.type) {
			case 'line':
			case 'path':
				return (
					CanvasGeometryManager.getPolylineDistance(point, object.points) <=
					tolerance + (object.strokeWidth ?? 2) / 2
				);
			case 'shape':
				if (object.shape === 'ellipse') {
					const rx = object.width / 2 + tolerance;
					const ry = object.height / 2 + tolerance;
					const dx = point.x - (object.x + object.width / 2);
					const dy = point.y - (object.y + object.height / 2);
					return rx > 0 && ry > 0 && (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
				}
				return CanvasGeometryManager.isPointInRect(point, object, tolerance);
			default:
				return CanvasGeometryManager.isPointInRect(point, object, tolerance);
		}
	}

	/**
	 * Topmost object under `point`. Frames are containers, so any other object
	 * wins over a frame below it.
	 */
	static hitTest(
		objects: readonly CanvasObject[],
		point: Point2D,
		tolerance = 4
	): CanvasObject | null {
		let frame: CanvasObject | null = null;

		for (let index = objects.length - 1; index >= 0; index -= 1) {
			const object = objects[index];
			if (!CanvasGeometryManager.isPointOnObject(object, point, tolerance)) continue;
			if (object.type !== 'frame') return object;
			frame ??= object;
		}

		return frame;
	}

	static doRectsIntersect(
		left: SlotSharedCanvasObjectBounds,
		right: SlotSharedCanvasObjectBounds
	): boolean {
		return (
			left.x <= right.x + right.width &&
			right.x <= left.x + left.width &&
			left.y <= right.y + right.height &&
			right.y <= left.y + left.height
		);
	}

	/** Ids of objects touched by a selection rectangle; frames only when fully enclosed. */
	static getObjectsInRect(
		objects: readonly CanvasObject[],
		rect: SlotSharedCanvasObjectBounds
	): string[] {
		return objects
			.filter((object) => {
				const bounds = CanvasGeometryManager.getBounds(object);
				if (object.type !== 'frame') return CanvasGeometryManager.doRectsIntersect(rect, bounds);
				return (
					bounds.x >= rect.x &&
					bounds.y >= rect.y &&
					bounds.x + bounds.width <= rect.x + rect.width &&
					bounds.y + bounds.height <= rect.y + rect.height
				);
			})
			.map((object) => object.id);
	}

	/** Objects whose bounds lie inside a frame; they move together with it. */
	static getFrameChildren(objects: readonly CanvasObject[], frame: CanvasObject): string[] {
		const area = CanvasGeometryManager.getBounds(frame);
		return objects
			.filter((object) => object.id !== frame.id && object.type !== 'frame')
			.filter((object) => {
				const bounds = CanvasGeometryManager.getBounds(object);
				return (
					bounds.x >= area.x &&
					bounds.y >= area.y &&
					bounds.x + bounds.width <= area.x + area.width &&
					bounds.y + bounds.height <= area.y + area.height
				);
			})
			.map((object) => object.id);
	}

	/**
	 * Resizes `original` by dragging one of its handles to `point`: corners of a
	 * box (`nw`, `ne`, `sw`, `se`) or the ends of a line (`start`, `end`).
	 * `keepRatio` preserves the box proportions (Shift).
	 */
	static resize(
		original: CanvasObject,
		handle: CanvasResizeHandle,
		point: Point2D,
		keepRatio = false
	): CanvasObject {
		if (original.type === 'line') {
			if (handle === 'start') return { ...original, points: [{ ...point }, original.points[1]] };
			if (handle === 'end') return { ...original, points: [original.points[0], { ...point }] };
			return original;
		}

		if (original.type === 'path') {
			if (handle === 'start' || handle === 'end') return original;
			const from = CanvasGeometryManager.getBounds(original);
			const next = CanvasGeometryManager.resizeRect(from, handle, point, keepRatio);
			const scaleX = from.width ? next.width / from.width : 1;
			const scaleY = from.height ? next.height / from.height : 1;
			return {
				...original,
				points: original.points.map((p) => ({
					x: next.x + (p.x - from.x) * scaleX,
					y: next.y + (p.y - from.y) * scaleY
				}))
			};
		}

		if (handle === 'start' || handle === 'end') return original;
		return {
			...original,
			...CanvasGeometryManager.resizeRect(
				original,
				handle,
				point,
				keepRatio || original.type === 'icon'
			)
		};
	}

	static resizeRect(
		rect: SlotSharedCanvasObjectBounds,
		handle: Exclude<CanvasResizeHandle, 'start' | 'end'>,
		point: Point2D,
		keepRatio = false
	): SlotSharedCanvasObjectBounds {
		const anchor = {
			x: handle === 'nw' || handle === 'sw' ? rect.x + rect.width : rect.x,
			y: handle === 'nw' || handle === 'ne' ? rect.y + rect.height : rect.y
		};
		let width = Math.max(CanvasGeometryManager.minSize, Math.abs(point.x - anchor.x));
		let height = Math.max(CanvasGeometryManager.minSize, Math.abs(point.y - anchor.y));

		if (keepRatio && rect.width > 0 && rect.height > 0) {
			const scale = Math.max(width / rect.width, height / rect.height);
			width = rect.width * scale;
			height = rect.height * scale;
		}

		const signX = handle === 'nw' || handle === 'sw' ? -1 : 1;
		const signY = handle === 'nw' || handle === 'ne' ? -1 : 1;

		return {
			x: signX < 0 ? anchor.x - width : anchor.x,
			y: signY < 0 ? anchor.y - height : anchor.y,
			width,
			height
		};
	}
}
