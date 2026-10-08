import type { HTMLAttributes } from 'svelte/elements';
import type { RecipeScreenshotSelector } from '$stylist/canvas/interface/recipe/screenshot-selector';
export function createScreenshotSelectorState(
	getProps: () => RecipeScreenshotSelector & HTMLAttributes<HTMLDivElement>
) {
	const props = $derived(getProps());
	const drawingMode = $derived(props.drawingMode ?? false);
	const drawColor = $derived(props.drawColor ?? 'var(--color-error-500)');

	let isSelecting = $state(false);
	let startX = $state(0);
	let startY = $state(0);
	let currentX = $state(0);
	let currentY = $state(0);
	let selectionFixed = $state(false);
	let isDrawing = $state(false);
	const paths: Array<{ points: Array<{ x: number; y: number }>; color: string }> = $state([]);
	let currentPath: Array<{ x: number; y: number }> = $state([]);
	let overlayElement: HTMLDivElement | undefined = $state();
	let canvasElement: HTMLCanvasElement | undefined = $state();

	const rect = $derived({
		x: Math.min(startX, currentX),
		y: Math.min(startY, currentY),
		width: Math.abs(currentX - startX),
		height: Math.abs(currentY - startY)
	});

	function handlePointerDown(e: PointerEvent) {
		if (!drawingMode) {
			isSelecting = true;
			selectionFixed = false;
			startX = e.clientX;
			startY = e.clientY;
			currentX = e.clientX;
			currentY = e.clientY;
		} else if (selectionFixed) {
			isDrawing = true;
			currentPath = [{ x: e.clientX, y: e.clientY }];
		}
	}

	function handlePointerMove(e: PointerEvent) {
		if (isSelecting && !selectionFixed) {
			currentX = e.clientX;
			currentY = e.clientY;
		} else if (isDrawing && drawingMode) {
			currentPath.push({ x: e.clientX, y: e.clientY });
			drawOnCanvas();
		}
	}

	function handlePointerUp(e: PointerEvent) {
		if (isSelecting && !selectionFixed) {
			currentX = e.clientX;
			currentY = e.clientY;
			isSelecting = false;
			selectionFixed = true;
		} else if (isDrawing) {
			paths.push({ points: [...currentPath], color: drawColor });
			currentPath = [];
			isDrawing = false;
		}
	}

	function drawOnCanvas() {
		if (!canvasElement) return;
		const ctx = canvasElement.getContext('2d');
		if (!ctx) return;
		ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
		paths.forEach((path) => {
			if (path.points.length < 2) return;
			ctx.strokeStyle = path.color;
			ctx.lineWidth = 3;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.beginPath();
			ctx.moveTo(path.points[0].x, path.points[0].y);
			for (let i = 1; i < path.points.length; i++) {
				ctx.lineTo(path.points[i].x, path.points[i].y);
			}
			ctx.stroke();
		});
		if (currentPath.length > 1) {
			ctx.strokeStyle = drawColor;
			ctx.lineWidth = 3;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.beginPath();
			ctx.moveTo(currentPath[0].x, currentPath[0].y);
			for (let i = 1; i < currentPath.length; i++) {
				ctx.lineTo(currentPath[i].x, currentPath[i].y);
			}
			ctx.stroke();
		}
	}

	return {
		get drawingMode() {
			return drawingMode;
		},
		get drawColor() {
			return drawColor;
		},
		get isSelecting() {
			return isSelecting;
		},
		get startX() {
			return startX;
		},
		get startY() {
			return startY;
		},
		get currentX() {
			return currentX;
		},
		get currentY() {
			return currentY;
		},
		get selectionFixed() {
			return selectionFixed;
		},
		get isDrawing() {
			return isDrawing;
		},
		get rect() {
			return rect;
		},
		get canvasElement() {
			return canvasElement;
		},
		get overlayElement() {
			return overlayElement;
		},
		set canvasElement(value: HTMLCanvasElement | undefined) {
			canvasElement = value;
		},
		set overlayElement(value: HTMLDivElement | undefined) {
			overlayElement = value;
		},
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		drawOnCanvas
	};
}
