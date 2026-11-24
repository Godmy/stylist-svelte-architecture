import type { RecipeDrawingOverlay } from '$stylist/canvas/interface/recipe/drawing-overlay';

/** Settings of the annotation layer and its Escape handling. */
export function createDrawingOverlayState(getProps: () => RecipeDrawingOverlay) {
	const props = $derived(getProps());
	const drawColor = $derived(props.drawColor ?? 'var(--color-error-500, #ef4444)');
	const strokeWidth = $derived(props.strokeWidth ?? 3);
	const offsetTop = $derived(props.offsetTop ?? 0);
	let width = $state(0);
	let height = $state(0);
	let surface = $state<{ clear(): void; undo(): void; redo(): void } | undefined>();

	function keyDown(event: KeyboardEvent): void {
		if (event.key !== 'Escape' || !props.onClose) return;
		event.preventDefault();
		props.onClose();
	}

	return {
		get width() {
			return width;
		},
		set width(value: number) {
			width = value;
		},
		get height() {
			return height;
		},
		set height(value: number) {
			height = value;
		},
		get surface() {
			return surface;
		},
		set surface(value: { clear(): void; undo(): void; redo(): void } | undefined) {
			surface = value;
		},
		get drawColor() {
			return drawColor;
		},
		get strokeWidth() {
			return strokeWidth;
		},
		get offsetTop() {
			return offsetTop;
		},
		get onChange() {
			return props.onChange;
		},
		keyDown
	};
}

export default createDrawingOverlayState;
