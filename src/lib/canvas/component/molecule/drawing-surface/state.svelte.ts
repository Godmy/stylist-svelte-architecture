import type { SlotDrawingSurfaceExposeMethodsEvent } from '$stylist/canvas/interface/slot/drawing-surface-expose-methods-event';
import type { RecipeDrawingSurface } from '$stylist/canvas/interface/recipe/drawing-surface';

export function createDrawingSurfaceState(
	getProps: () => RecipeDrawingSurface,
	dispatch: (
		type: 'canvas-cleared' | 'expose-methods',
		detail: {} | SlotDrawingSurfaceExposeMethodsEvent
	) => void
) {
	const props = $derived(getProps());
	let isDrawing = $state(false);

	const width = $derived(props.width ?? 800);
	const height = $derived(props.height ?? 600);
	const drawingEnabled = $derived(props.drawingEnabled ?? true);
	const tool = $derived(props.tool ?? 'pen');
	const strokeColor = $derived(props.strokeColor ?? 'var(--color-text-primary)');
	const strokeWidth = $derived(props.strokeWidth ?? 2);
	const backgroundColor = $derived(props.backgroundColor ?? 'var(--color-background-primary)');
	const canvasClass = $derived(
		['drawing-surface__canvas', props.class?.toString() ?? ''].filter(Boolean).join(' ')
	);
	const restProps = $derived.by(() => {
		const {
			width: _width,
			height: _height,
			drawingEnabled: _drawingEnabled,
			tool: _tool,
			strokeColor: _strokeColor,
			strokeWidth: _strokeWidth,
			backgroundColor: _backgroundColor,
			class: _class,
			...rest
		} = props;

		return rest;
	});

	function fillBackground(canvas: HTMLCanvasElement | null): void {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		ctx.fillStyle = backgroundColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	function startDrawing(event: MouseEvent, canvas: HTMLCanvasElement | null): void {
		if (!drawingEnabled || !canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		isDrawing = true;
		ctx.beginPath();
		const rect = canvas.getBoundingClientRect();
		ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
	}

	function draw(event: MouseEvent, canvas: HTMLCanvasElement | null): void {
		if (!isDrawing || !canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		ctx.lineWidth = strokeWidth;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		if (tool === 'eraser') {
			ctx.globalCompositeOperation = 'destination-out';
			ctx.strokeStyle = 'var(--color-text-primary)';
		} else {
			ctx.globalCompositeOperation = 'source-over';
			ctx.strokeStyle = strokeColor;
		}

		ctx.lineTo(x, y);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(x, y);
	}

	function stopDrawing(canvas: HTMLCanvasElement | null): void {
		if (!canvas) return;
		canvas.getContext('2d')?.closePath();
		isDrawing = false;
	}

	function clearCanvas(canvas: HTMLCanvasElement | null): void {
		fillBackground(canvas);
		dispatch('canvas-cleared', {});
	}

	function exposeMethods(canvas: HTMLCanvasElement | null): void {
		dispatch('expose-methods', {
			clear: () => clearCanvas(canvas)
		});
	}

	return {
		get width() {
			return width;
		},
		get height() {
			return height;
		},
		get canvasClass() {
			return canvasClass;
		},
		get restProps() {
			return restProps;
		},
		fillBackground,
		startDrawing,
		draw,
		stopDrawing,
		exposeMethods
	};
}

export default createDrawingSurfaceState;
