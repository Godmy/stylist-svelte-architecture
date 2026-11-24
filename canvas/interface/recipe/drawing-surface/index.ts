import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { HTMLCanvasAttributes } from 'svelte/elements';
import type { SlotClass } from '$stylist/theme/interface/slot/class';
import type { SlotDimensionable } from '$stylist/layout/interface/slot/dimensionable';
import type { CanvasStroke } from '$stylist/canvas/type/object/canvas-stroke';

/**
 * Freehand sketch surface. `width`/`height` are logical pixels; colors accept
 * CSS custom properties (`var(--token)`). `strokes` is the initial or
 * controlled drawing; the surface resets when the prop changes to a different value.
 */
export interface RecipeDrawingSurface extends ComputeIntersectAll<
	[Omit<HTMLCanvasAttributes, 'width' | 'height' | 'class'>, SlotClass, SlotDimensionable]
> {
	drawingEnabled?: boolean;
	tool?: 'pen' | 'eraser';
	strokeColor?: string;
	strokeWidth?: number;
	/** Fill behind the strokes; `transparent` keeps the surface see-through. */
	backgroundColor?: string;
	strokes?: CanvasStroke[];
	/** Called after every finished stroke, undo, redo or clear with the full list. */
	onChange?: (strokes: CanvasStroke[]) => void;
	onStrokeEnd?: (stroke: CanvasStroke) => void;
	onClear?: () => void;
	onHistoryChange?: (history: { canUndo: boolean; canRedo: boolean }) => void;
}
