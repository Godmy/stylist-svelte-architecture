import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { LayoutHTMLAttributes } from '$stylist/layout/interface/behavior/layout-html-attributes';
import type { CanvasUser } from '$stylist/canvas/type/object/canvas-user';
import type { CanvasObject } from '$stylist/canvas/type/alias/canvas-object';
import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';
import type { SharedCanvasTool } from '$stylist/canvas/type/alias/shared-canvas-tool';
import type { SlotDimensionable } from '$stylist/layout/interface/slot/dimensionable';
import type { CanvasBoardRole } from '$stylist/canvas/type/alias/canvas-board-role';
import type { CanvasView } from '$stylist/canvas/type/object/canvas-view';

/**
 * Infinite whiteboard: `width` (optional, defaults to the container) and
 * `height` size the visible viewport in CSS pixels; objects live in world
 * coordinates. `objects` is the initial or controlled content: when the prop
 * changes (for example, with changes of other participants), the difference
 * is merged in, keeping the local undo history and the text being edited.
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
	/**
	 * Objects being moved or resized, on every pointer move of the gesture, so others can
	 * watch them move. Not a history step: `onChange` still follows when the gesture ends.
	 * Called often; throttle before sending over the network.
	 */
	onLiveUpdate?: (objects: CanvasObject[]) => void;
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
	/** Lesson role; `teacher` (default) edits everything and pins objects. */
	role?: CanvasBoardRole;
	/** Tools shown and usable on the board (all when omitted), e.g. a simple set for children. */
	allowedTools?: SharedCanvasTool[];
	/** View to show (to follow the teacher); the board centers on it whenever it changes. */
	view?: CanvasView;
	/** Called when this user's view changes, to let others follow it. */
	onViewChange?: (view: CanvasView) => void;
	/** Forbids panning and zooming, e.g. while students follow the teacher. */
	lockView?: boolean;
	/**
	 * Stores an inserted picture and returns its URL. Without it pictures are
	 * embedded as `data:` URLs, which is heavy for boards shared over the network.
	 */
	onImageUpload?: (file: File) => Promise<string>;
}
