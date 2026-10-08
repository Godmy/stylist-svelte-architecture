import type { CanvasToolbarDrawingTool } from '$stylist/canvas/type/alias/canvas-toolbar-drawing-tool';

export interface SlotCanvasToolbarDrawingOptions {
	lineWidth: number;
	strokeColor: string;
	tool: CanvasToolbarDrawingTool;
	mode: 'draw' | 'erase';
}
