import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { CanvasToolbarDrawingTool } from '$stylist/canvas/type/alias/canvas-toolbar-drawing-tool';
import type { SlotCanvasToolbarDrawingOptions } from '$stylist/canvas/interface/slot/canvas-toolbar-drawing-options';

export interface RecipeCanvasToolbar extends ComputeIntersectAll<[]> {
	selectedTool?: CanvasToolbarDrawingTool;
	drawingOptions?: SlotCanvasToolbarDrawingOptions;
}
