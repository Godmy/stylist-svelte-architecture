import { untrack } from 'svelte';
import { CanvasHistoryManager } from '$stylist/canvas/class/manager/canvas-history';
import { CanvasManager } from '$stylist/canvas/class/manager/canvas';
import { CanvasSurfaceManager } from '$stylist/canvas/class/manager/canvas-surface';
import { canvasColor } from '$stylist/canvas/function/resolve/canvas-color';
import type { RecipeDrawingSurface } from '$stylist/canvas/interface/recipe/drawing-surface';
import type { CanvasStroke } from '$stylist/canvas/type/object/canvas-stroke';

/** Vector sketch state: strokes with undo/redo, pointer drawing and rendering to a canvas. */
export function createDrawingSurfaceState(getProps: () => RecipeDrawingSurface) {
	const props = $derived(getProps());
	const copy = (value: readonly CanvasStroke[]): CanvasStroke[] =>
		JSON.parse(JSON.stringify(value)) as CanvasStroke[];

	let history = $state(CanvasHistoryManager.create(untrack(() => copy(props.strokes ?? []))));
	let current = $state<CanvasStroke | null>(null);
	let pointerId: number | null = null;
	let canvasElement = $state<HTMLCanvasElement | null>(null);

	const width = $derived(props.width ?? 800);
	const height = $derived(props.height ?? 600);
	const drawingEnabled = $derived(props.drawingEnabled ?? true);
	const tool = $derived(props.tool ?? 'pen');
	const strokeColor = $derived(props.strokeColor ?? 'var(--color-text-primary)');
	const strokeWidth = $derived(props.strokeWidth ?? 2);
	const backgroundColor = $derived(props.backgroundColor ?? 'var(--color-background-primary)');
	const strokes = $derived(history.present);
	const canUndo = $derived(CanvasHistoryManager.canUndo(history));
	const canRedo = $derived(CanvasHistoryManager.canRedo(history));
	const canvasClass = $derived(
		['drawing-surface__canvas', !drawingEnabled && 'drawing-surface__canvas--disabled', props.class]
			.filter(Boolean)
			.join(' ')
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
			strokes: _strokes,
			onChange: _onChange,
			onStrokeEnd: _onStrokeEnd,
			onClear: _onClear,
			onHistoryChange: _onHistoryChange,
			class: _class,
			...rest
		} = props;

		return rest;
	});

	function emit(): void {
		props.onChange?.(copy(history.present));
		props.onHistoryChange?.({ canUndo, canRedo });
	}

	function syncFromProps(incoming: readonly CanvasStroke[] | undefined): void {
		const next = copy(incoming ?? []);
		if (JSON.stringify(next) === JSON.stringify(history.present)) return;
		history = CanvasHistoryManager.create(next);
		current = null;
	}

	function drawStroke(context: CanvasRenderingContext2D, stroke: CanvasStroke, element: Element) {
		if (!stroke.points.length) return;

		context.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
		context.strokeStyle = canvasColor(stroke.color, element);
		context.lineWidth = stroke.width;
		context.lineCap = 'round';
		context.lineJoin = 'round';
		context.beginPath();
		context.moveTo(stroke.points[0].x, stroke.points[0].y);
		for (const point of stroke.points.slice(1)) context.lineTo(point.x, point.y);
		if (stroke.points.length === 1) context.lineTo(stroke.points[0].x + 0.01, stroke.points[0].y);
		context.stroke();
		context.globalCompositeOperation = 'source-over';
	}

	/** Redraws all strokes; the background is painted by CSS so the eraser reveals it. */
	function render(canvas: HTMLCanvasElement | null): void {
		if (!canvas) return;
		const context = CanvasSurfaceManager.prepare(canvas, width, height);
		if (!context) return;

		CanvasSurfaceManager.clear(context, canvas);
		for (const stroke of current ? [...strokes, current] : strokes) {
			drawStroke(context, stroke, canvas);
		}
	}

	function pointerDown(event: PointerEvent, canvas: HTMLCanvasElement | null): void {
		if (!drawingEnabled || !canvas || event.button !== 0) return;
		event.preventDefault();
		canvas.setPointerCapture?.(event.pointerId);
		pointerId = event.pointerId;
		current = {
			id: CanvasManager.createCanvasObjectId(),
			tool,
			color: strokeColor,
			width: tool === 'eraser' ? Math.max(strokeWidth, 8) : strokeWidth,
			points: [CanvasSurfaceManager.getPointerPosition(event, canvas, width, height)]
		};
	}

	function pointerMove(event: PointerEvent, canvas: HTMLCanvasElement | null): void {
		if (!current || !canvas || event.pointerId !== pointerId) return;
		const events = event.getCoalescedEvents?.() ?? [];
		const points = (events.length ? events : [event]).map((entry) =>
			CanvasSurfaceManager.getPointerPosition(entry, canvas, width, height)
		);
		current = { ...current, points: [...current.points, ...points] };
	}

	function pointerUp(event: PointerEvent, canvas: HTMLCanvasElement | null): void {
		if (!current || event.pointerId !== pointerId) return;
		if (canvas?.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId);

		const finished = current;
		current = null;
		pointerId = null;
		history = CanvasHistoryManager.push(history, [...copy(history.present), finished]);
		props.onStrokeEnd?.(copy([finished])[0]);
		emit();
	}

	function clear(): void {
		if (!history.present.length) return;
		history = CanvasHistoryManager.push(history, []);
		props.onClear?.();
		emit();
	}

	function undo(): void {
		if (!canUndo) return;
		history = CanvasHistoryManager.undo(history);
		emit();
	}

	function redo(): void {
		if (!canRedo) return;
		history = CanvasHistoryManager.redo(history);
		emit();
	}

	/** PNG of the drawing over its background color. */
	function toDataUrl(canvas: HTMLCanvasElement | null): string {
		if (!canvas || typeof document === 'undefined') return '';
		const output = document.createElement('canvas');
		output.width = canvas.width;
		output.height = canvas.height;
		const context = output.getContext('2d');
		if (!context) return '';

		const background = canvasColor(backgroundColor, canvas, 'transparent');
		if (background !== 'transparent') {
			context.fillStyle = background;
			context.fillRect(0, 0, output.width, output.height);
		}
		context.drawImage(canvas, 0, 0);
		return output.toDataURL('image/png');
	}

	return {
		get canvasElement() {
			return canvasElement;
		},
		set canvasElement(value: HTMLCanvasElement | null) {
			canvasElement = value;
		},
		get width() {
			return width;
		},
		get height() {
			return height;
		},
		get strokes() {
			return strokes;
		},
		get current() {
			return current;
		},
		get canUndo() {
			return canUndo;
		},
		get canRedo() {
			return canRedo;
		},
		get backgroundColor() {
			return backgroundColor;
		},
		get canvasClass() {
			return canvasClass;
		},
		get restProps() {
			return restProps;
		},
		syncFromProps,
		render,
		pointerDown,
		pointerMove,
		pointerUp,
		clear,
		undo,
		redo,
		toDataUrl
	};
}

export default createDrawingSurfaceState;
