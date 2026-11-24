import type { CanvasHistory } from '$stylist/canvas/type/struct/canvas-history';

/** Immutable undo/redo history; every method returns a new history. */
export class CanvasHistoryManager {
	static readonly defaultLimit = 100;

	static create<T>(present: T): CanvasHistory<T> {
		return { past: [], present, future: [] };
	}

	/** Records `next` as the present value, dropping the redo branch. */
	static push<T>(
		history: CanvasHistory<T>,
		next: T,
		limit: number = CanvasHistoryManager.defaultLimit
	): CanvasHistory<T> {
		const past = [...history.past, history.present];
		return {
			past: past.length > limit ? past.slice(past.length - limit) : past,
			present: next,
			future: []
		};
	}

	static undo<T>(history: CanvasHistory<T>): CanvasHistory<T> {
		if (!history.past.length) return history;
		return {
			past: history.past.slice(0, -1),
			present: history.past[history.past.length - 1],
			future: [history.present, ...history.future]
		};
	}

	static redo<T>(history: CanvasHistory<T>): CanvasHistory<T> {
		if (!history.future.length) return history;
		return {
			past: [...history.past, history.present],
			present: history.future[0],
			future: history.future.slice(1)
		};
	}

	static canUndo<T>(history: CanvasHistory<T>): boolean {
		return history.past.length > 0;
	}

	static canRedo<T>(history: CanvasHistory<T>): boolean {
		return history.future.length > 0;
	}
}
