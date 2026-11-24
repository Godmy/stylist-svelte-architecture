import type { SlotCanvasToolbarDrawingOptions } from '$stylist/canvas/interface/slot/canvas-toolbar-drawing-options';
import type { CanvasToolbarDrawingTool } from '$stylist/canvas/type/alias/canvas-toolbar-drawing-tool';
import type { RecipeCanvasToolbar } from '$stylist/canvas/interface/recipe/canvas-toolbar';

/** Tool, line width and color of a sketch toolbar; props reset the local choice when they change. */
export function createCanvasToolbarState(getProps: () => RecipeCanvasToolbar) {
	const props = $derived(getProps());
	let options = $derived<SlotCanvasToolbarDrawingOptions>({
		lineWidth: props.drawingOptions?.lineWidth ?? 2,
		strokeColor: props.drawingOptions?.strokeColor ?? '#111827',
		tool: props.selectedTool ?? props.drawingOptions?.tool ?? 'pen',
		mode: (props.selectedTool ?? props.drawingOptions?.tool) === 'eraser' ? 'erase' : 'draw'
	});
	const canUndo = $derived(props.canUndo ?? false);
	const canRedo = $derived(props.canRedo ?? false);

	function update(patch: Partial<SlotCanvasToolbarDrawingOptions>): void {
		const tool = patch.tool ?? options.tool;
		options = { ...options, ...patch, tool, mode: tool === 'eraser' ? 'erase' : 'draw' };
		props.onToolChange?.(options.tool, { ...options });
	}

	function selectTool(tool: CanvasToolbarDrawingTool): void {
		update({ tool });
	}

	function setLineWidth(lineWidth: number): void {
		if (Number.isFinite(lineWidth)) update({ lineWidth });
	}

	function setStrokeColor(strokeColor: string): void {
		update({ strokeColor });
	}

	return {
		get currentTool() {
			return options.tool;
		},
		get currentOptions() {
			return options;
		},
		get canUndo() {
			return canUndo;
		},
		get canRedo() {
			return canRedo;
		},
		selectTool,
		setLineWidth,
		setStrokeColor,
		clearCanvas: () => props.onClear?.(),
		undo: () => props.onUndo?.(),
		redo: () => props.onRedo?.(),
		save: () => props.onSave?.()
	};
}

export default createCanvasToolbarState;
