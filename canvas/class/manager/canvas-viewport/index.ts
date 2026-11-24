import { CANVAS_ZOOM_LIMITS } from '$stylist/canvas/const/map/canvas-zoom-limits';
import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';
import type { SlotSharedCanvasObjectBounds } from '$stylist/canvas/interface/slot/shared-canvas-object-bounds';
import type { CanvasViewport } from '$stylist/canvas/type/object/canvas-viewport';

/** Pan and zoom of an infinite canvas; screen points are relative to the viewport element. */
export class CanvasViewportManager {
	static readonly initial: CanvasViewport = { x: 0, y: 0, zoom: 1 };

	static clampZoom(
		zoom: number,
		limits: { min: number; max: number } = CANVAS_ZOOM_LIMITS
	): number {
		return Math.min(limits.max, Math.max(limits.min, zoom));
	}

	static screenToWorld(point: Point2D, viewport: CanvasViewport): Point2D {
		return {
			x: (point.x - viewport.x) / viewport.zoom,
			y: (point.y - viewport.y) / viewport.zoom
		};
	}

	static worldToScreen(point: Point2D, viewport: CanvasViewport): Point2D {
		return {
			x: point.x * viewport.zoom + viewport.x,
			y: point.y * viewport.zoom + viewport.y
		};
	}

	/** Zooms by `factor` keeping the world point under `anchor` in place. */
	static zoomAt(
		viewport: CanvasViewport,
		anchor: Point2D,
		factor: number,
		limits: { min: number; max: number } = CANVAS_ZOOM_LIMITS
	): CanvasViewport {
		const zoom = CanvasViewportManager.clampZoom(viewport.zoom * factor, limits);
		const world = CanvasViewportManager.screenToWorld(anchor, viewport);

		return { zoom, x: anchor.x - world.x * zoom, y: anchor.y - world.y * zoom };
	}

	static pan(viewport: CanvasViewport, dx: number, dy: number): CanvasViewport {
		return { ...viewport, x: viewport.x + dx, y: viewport.y + dy };
	}

	/** Viewport that shows `bounds` centered in a `width` x `height` screen; zoom never exceeds 1. */
	static fit(
		bounds: SlotSharedCanvasObjectBounds | null,
		width: number,
		height: number,
		padding = 48
	): CanvasViewport {
		if (!bounds || width <= 0 || height <= 0) return CanvasViewportManager.initial;

		const zoom = CanvasViewportManager.clampZoom(
			Math.min(
				1,
				(width - padding * 2) / Math.max(1, bounds.width),
				(height - padding * 2) / Math.max(1, bounds.height)
			)
		);

		return {
			zoom,
			x: width / 2 - (bounds.x + bounds.width / 2) * zoom,
			y: height / 2 - (bounds.y + bounds.height / 2) * zoom
		};
	}
}
