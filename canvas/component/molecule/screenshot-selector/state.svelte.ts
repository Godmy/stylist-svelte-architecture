import { CanvasSurfaceManager } from '$stylist/canvas/class/manager/canvas-surface';
import { CanvasGeometryManager } from '$stylist/canvas/class/manager/canvas-geometry';
import { canvasColor } from '$stylist/canvas/function/resolve/canvas-color';
import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';
import type { RecipeScreenshotSelector } from '$stylist/canvas/interface/recipe/screenshot-selector';

/** Region selection and freehand annotation over the viewport. */
export function createScreenshotSelectorState(getProps: () => RecipeScreenshotSelector) {
	const props = $derived(getProps());
	const drawingMode = $derived(props.drawingMode ?? false);
	const drawColor = $derived(props.drawColor ?? 'var(--color-error-500, #ef4444)');
	const strokeWidth = $derived(props.strokeWidth ?? 3);

	let start = $state<Point2D>({ x: 0, y: 0 });
	let end = $state<Point2D>({ x: 0, y: 0 });
	let isSelecting = $state(false);
	let selectionFixed = $state(false);
	let paths = $state<{ points: Point2D[]; color: string; width: number }[]>([]);
	let currentPath = $state<Point2D[] | null>(null);
	let viewport = $state({ width: 0, height: 0 });
	let canvasElement = $state<HTMLCanvasElement | null>(null);

	const rect = $derived(CanvasGeometryManager.normalizeRect(start, end));
	const hasSelection = $derived(
		(isSelecting || selectionFixed) && rect.width > 5 && rect.height > 5
	);

	function pointerDown(event: PointerEvent): void {
		if (event.button !== 0) return;
		const point = { x: event.clientX, y: event.clientY };
		(event.currentTarget as Element | null)?.setPointerCapture?.(event.pointerId);

		if (drawingMode && selectionFixed) {
			currentPath = [point];
			return;
		}

		isSelecting = true;
		selectionFixed = false;
		paths = [];
		start = point;
		end = point;
	}

	function pointerMove(event: PointerEvent): void {
		const point = { x: event.clientX, y: event.clientY };
		if (isSelecting) end = point;
		else if (currentPath) currentPath = [...currentPath, point];
	}

	function pointerUp(event: PointerEvent): void {
		const target = event.currentTarget as Element | null;
		if (target?.hasPointerCapture?.(event.pointerId)) target.releasePointerCapture(event.pointerId);

		if (isSelecting) {
			end = { x: event.clientX, y: event.clientY };
			isSelecting = false;
			selectionFixed = rect.width > 5 && rect.height > 5;
			if (selectionFixed) props.onSelect?.({ ...rect });
			return;
		}

		if (currentPath) {
			if (currentPath.length > 1) {
				paths = [...paths, { points: currentPath, color: drawColor, width: strokeWidth }];
			}
			currentPath = null;
		}
	}

	function keyDown(event: KeyboardEvent): void {
		if (event.key !== 'Escape') return;
		event.preventDefault();
		isSelecting = false;
		selectionFixed = false;
		paths = [];
		currentPath = null;
		props.onCancel?.();
	}

	function render(canvas: HTMLCanvasElement | null | undefined): void {
		if (!canvas || !viewport.width || !viewport.height) return;
		const context = CanvasSurfaceManager.prepare(canvas, viewport.width, viewport.height);
		if (!context) return;

		CanvasSurfaceManager.clear(context, canvas);
		const all = currentPath
			? [...paths, { points: currentPath, color: drawColor, width: strokeWidth }]
			: paths;

		for (const path of all) {
			if (path.points.length < 2) continue;
			context.strokeStyle = canvasColor(path.color, canvas);
			context.lineWidth = path.width;
			context.lineCap = 'round';
			context.lineJoin = 'round';
			context.beginPath();
			context.moveTo(path.points[0].x, path.points[0].y);
			for (const point of path.points.slice(1)) context.lineTo(point.x, point.y);
			context.stroke();
		}
	}

	return {
		get drawingMode() {
			return drawingMode;
		},
		get selectionFixed() {
			return selectionFixed;
		},
		get hasSelection() {
			return hasSelection;
		},
		get rect() {
			return rect;
		},
		get paths() {
			return paths;
		},
		get currentPath() {
			return currentPath;
		},
		get canvasElement() {
			return canvasElement;
		},
		set canvasElement(value: HTMLCanvasElement | null) {
			canvasElement = value;
		},
		get viewportWidth() {
			return viewport.width;
		},
		set viewportWidth(value: number) {
			viewport = { ...viewport, width: value };
		},
		get viewportHeight() {
			return viewport.height;
		},
		set viewportHeight(value: number) {
			viewport = { ...viewport, height: value };
		},
		get viewport() {
			return viewport;
		},
		pointerDown,
		pointerMove,
		pointerUp,
		keyDown,
		render
	};
}

export default createScreenshotSelectorState;
