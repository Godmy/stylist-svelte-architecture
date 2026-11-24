import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { LayoutHTMLAttributes } from '$stylist/layout/interface/behavior/layout-html-attributes';
import type { CanvasUser } from '$stylist/canvas/type/object/canvas-user';
import type { CanvasObject } from '$stylist/canvas/type/alias/canvas-object';
import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';
import type { SharedCanvasTool } from '$stylist/canvas/type/alias/shared-canvas-tool';
import type { SlotDimensionable } from '$stylist/layout/interface/slot/dimensionable';

/**
 * Infinite whiteboard: `width` (optional, defaults to the container) and
 * `height` size the visible viewport in CSS pixels; objects live in world
 * coordinates. `objects` is the initial or controlled content; the board
 * resets to it whenever the prop changes to a different value.
 */
export interface RecipeSharedCanvas extends ComputeIntersectAll<
	[LayoutHTMLAttributes<HTMLDivElement>, SlotDimensionable]
> {
	objects?: CanvasObject[];
	users?: CanvasUser[];
	currentUserId?: string;
	/** Called after every committed change with the full list. */
	onChange?: (objects: CanvasObject[]) => void;
	onObjectAdd?: (object: CanvasObject) => void;
	onObjectUpdate?: (object: CanvasObject) => void;
	onObjectDelete?: (id: string) => void;
	/** Pointer position of the current user in world coordinates, for sharing cursors. */
	onCursorMove?: (point: Point2D) => void;
	/** Disables editing: only the hand tool, zoom and selection remain. */
	readonly?: boolean;
	showUsers?: boolean;
	showToolbar?: boolean;
	showZoomControls?: boolean;
	/** Dotted background grid. */
	showGrid?: boolean;
	selectedTool?: SharedCanvasTool;
	selectedColor?: string;
	toolbarClass?: string;
	canvasClass?: string;
	variant?: 'default' | 'minimal';
}
