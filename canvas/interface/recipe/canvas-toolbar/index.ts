import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { SlotClass } from '$stylist/theme/interface/slot/class';
import type { CanvasToolbarDrawingTool } from '$stylist/canvas/type/alias/canvas-toolbar-drawing-tool';
import type { SlotCanvasToolbarDrawingOptions } from '$stylist/canvas/interface/slot/canvas-toolbar-drawing-options';

/** Controls of a sketch surface; pair it with DrawingSurface through the callbacks. */
export interface RecipeCanvasToolbar extends ComputeIntersectAll<[SlotClass]> {
	selectedTool?: CanvasToolbarDrawingTool;
	drawingOptions?: Partial<SlotCanvasToolbarDrawingOptions>;
	canUndo?: boolean;
	canRedo?: boolean;
	onToolChange?: (tool: CanvasToolbarDrawingTool, options: SlotCanvasToolbarDrawingOptions) => void;
	onClear?: () => void;
	onUndo?: () => void;
	onRedo?: () => void;
	onSave?: () => void;
}
