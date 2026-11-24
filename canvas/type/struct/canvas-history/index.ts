/**
 * Undo/redo history of canvas snapshots: `present` is the current value,
 * `past` holds older snapshots (oldest first), `future` holds undone ones (next first).
 */
export type CanvasHistory<T> = {
	past: T[];
	present: T;
	future: T[];
};
