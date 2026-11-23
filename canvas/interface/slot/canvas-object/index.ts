/** Fields every object on a shared canvas carries; the full shape is `CanvasObject`. */
export interface SlotCanvasObject {
	id: string;
	color?: string;
	/** Author of the object on a shared canvas. */
	userId?: string;
}
