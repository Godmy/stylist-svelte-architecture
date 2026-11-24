/** Fields every object on a shared canvas carries; the full shape is `CanvasObject`. */
export interface SlotCanvasObject {
	id: string;
	color?: string;
	/** Author of the object on a shared canvas. */
	userId?: string;
	/**
	 * Pinned by the teacher: nobody can move, resize, erase or delete it, and
	 * students cannot select it (pen strokes go on top of it).
	 */
	locked?: boolean;
}
