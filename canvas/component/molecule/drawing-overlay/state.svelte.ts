import type { HTMLAttributes } from 'svelte/elements';
import type { RecipeDrawingOverlay } from '$stylist/canvas/interface/recipe/drawing-overlay';
export function createDrawingOverlayState(
	getProps: () => RecipeDrawingOverlay & HTMLAttributes<HTMLDivElement>
) {
	const props = $derived(getProps());
	const drawColor = $derived(props.drawColor ?? 'var(--color-error-500)');
	const onClose = $derived(props.onClose);

	let isDrawing = $state(false);
	const paths: Array<{ points: Array<{ x: number; y: number }>; color: string }> = $state([]);
	let lastPoint: { x: number; y: number } | null = null;
	let canvasElement: HTMLCanvasElement | undefined = $state();
	let ctx: CanvasRenderingContext2D | null = null;

	function handlePointerDown(e: PointerEvent) {
		if (!ctx) return;
		isDrawing = true;
		const x = e.clientX;
		const y = e.clientY - 56;
		lastPoint = { x, y };
		ctx.strokeStyle = drawColor;
		ctx.lineWidth = 3;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.beginPath();
		ctx.moveTo(x, y);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDrawing || !ctx || !lastPoint) return;
		const x = e.clientX;
		const y = e.clientY - 56;
		ctx.lineTo(x, y);
		ctx.stroke();
		lastPoint = { x, y };
	}

	function handlePointerUp() {
		if (isDrawing && ctx) {
			isDrawing = false;
			lastPoint = null;
		}
	}

	function clearCanvas() {
		if (!canvasElement || !ctx) return;
		ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
	}

	return {
		get drawColor() {
			return drawColor;
		},
		get isDrawing() {
			return isDrawing;
		},
		get canvasElement() {
			return canvasElement;
		},
		set canvasElement(value: HTMLCanvasElement | undefined) {
			canvasElement = value;
		},
		set ctx(value: CanvasRenderingContext2D | null) {
			ctx = value;
		},
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		clearCanvas,
		get onClose() {
			return onClose;
		}
	};
}
