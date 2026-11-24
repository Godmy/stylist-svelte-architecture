import { CanvasManager } from '$stylist/canvas/class/manager/canvas';
import { CanvasGeometryManager } from '$stylist/canvas/class/manager/canvas-geometry';
import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';
import type { CanvasObject } from '$stylist/canvas/type/alias/canvas-object';
import type { SharedCanvasTool } from '$stylist/canvas/type/alias/shared-canvas-tool';
import type { CanvasBoardStyle } from '$stylist/canvas/type/object/canvas-board-style';

/** Creation of board objects by the drawing tools: draft on press, grow on drag, finish on release. */
export class CanvasBoardManager {
	/** Size of an object placed by a click without dragging. */
	static readonly defaultSize: Record<
		'text' | 'sticky' | 'shape' | 'frame' | 'icon',
		{ width: number; height: number }
	> = {
		text: { width: 220, height: 40 },
		sticky: { width: 200, height: 200 },
		shape: { width: 160, height: 120 },
		frame: { width: 480, height: 320 },
		icon: { width: 64, height: 64 }
	};

	static readonly dragThreshold = 4;

	static readonly defaultStyle: CanvasBoardStyle = {
		color: '#111827',
		fill: 'transparent',
		stickyFill: '#fde68a',
		strokeWidth: 2,
		font: { family: 'sans', size: 20 },
		shape: 'rectangle',
		icon: 'star'
	};

	static isCreationTool(tool: SharedCanvasTool): boolean {
		return tool !== 'select' && tool !== 'hand' && tool !== 'eraser';
	}

	static createDraft(
		tool: SharedCanvasTool,
		point: Point2D,
		style: CanvasBoardStyle,
		userId?: string
	): CanvasObject | null {
		const id = CanvasManager.createCanvasObjectId();
		const box = { x: point.x, y: point.y, width: 0, height: 0 };
		const base = { id, userId, color: style.color };

		switch (tool) {
			case 'pen':
				return { ...base, type: 'path', points: [{ ...point }], strokeWidth: style.strokeWidth };
			case 'line':
			case 'arrow':
				return {
					...base,
					type: 'line',
					points: [{ ...point }, { ...point }],
					arrow: tool === 'arrow',
					strokeWidth: style.strokeWidth
				};
			case 'shape':
				return {
					...base,
					...box,
					type: 'shape',
					shape: style.shape,
					fill: style.fill,
					strokeWidth: style.strokeWidth,
					text: '',
					font: { ...style.font, align: 'center' }
				};
			case 'text':
				return { ...base, ...box, type: 'text', text: '', font: { ...style.font } };
			case 'sticky':
				return {
					...base,
					...box,
					type: 'sticky',
					text: '',
					fill: style.stickyFill,
					font: { ...style.font, size: Math.min(style.font.size, 24), align: 'center' }
				};
			case 'frame':
				return { ...base, ...box, type: 'frame', title: '', fill: '#ffffff', color: '#9ca3af' };
			case 'icon':
				return { ...base, ...box, type: 'icon', icon: style.icon };
			default:
				return null;
		}
	}

	/** Grows a draft while dragging; Shift keeps squares, circles and 45° lines. */
	static updateDraft(
		draft: CanvasObject,
		start: Point2D,
		current: Point2D,
		constrain = false
	): CanvasObject {
		switch (draft.type) {
			case 'path': {
				const last = draft.points[draft.points.length - 1];
				if (last && Math.hypot(current.x - last.x, current.y - last.y) < 1.5) return draft;
				return { ...draft, points: [...draft.points, { ...current }] };
			}
			case 'line': {
				let end = current;
				if (constrain) {
					const angle =
						Math.round(Math.atan2(current.y - start.y, current.x - start.x) / (Math.PI / 4)) *
						(Math.PI / 4);
					const length = Math.hypot(current.x - start.x, current.y - start.y);
					end = { x: start.x + Math.cos(angle) * length, y: start.y + Math.sin(angle) * length };
				}
				return { ...draft, points: [draft.points[0], { ...end }] };
			}
			default: {
				let end = current;
				if (constrain || draft.type === 'icon') {
					const size = Math.max(Math.abs(current.x - start.x), Math.abs(current.y - start.y));
					end = {
						x: start.x + Math.sign(current.x - start.x || 1) * size,
						y: start.y + Math.sign(current.y - start.y || 1) * size
					};
				}
				return { ...draft, ...CanvasGeometryManager.normalizeRect(start, end) };
			}
		}
	}

	/**
	 * Completes a draft. A click without a drag places a box object at its
	 * default size centered on the click; a zero-length line is dropped (`null`).
	 */
	static finishDraft(draft: CanvasObject, start: Point2D, dragged: boolean): CanvasObject | null {
		if (draft.type === 'path') return draft;

		if (draft.type === 'line') {
			const [from, to] = draft.points;
			return Math.hypot(to.x - from.x, to.y - from.y) >= CanvasBoardManager.dragThreshold
				? draft
				: null;
		}

		const tooSmall =
			draft.width < CanvasGeometryManager.minSize || draft.height < CanvasGeometryManager.minSize;
		if (dragged && !tooSmall) return draft;

		const size = CanvasBoardManager.defaultSize[draft.type];
		const x = draft.type === 'text' ? start.x : start.x - size.width / 2;
		const y = start.y - size.height / 2;
		return { ...draft, x, y, width: size.width, height: size.height };
	}

	/** Whether an object carries editable text (double-click opens the editor). */
	static isTextEditable(object: CanvasObject): boolean {
		return (
			object.type === 'text' ||
			object.type === 'sticky' ||
			object.type === 'shape' ||
			object.type === 'frame'
		);
	}

	static getText(object: CanvasObject): string {
		if (object.type === 'frame') return object.title ?? '';
		if (object.type === 'text' || object.type === 'sticky' || object.type === 'shape') {
			return object.text ?? '';
		}
		return '';
	}

	static setText(object: CanvasObject, text: string): CanvasObject {
		if (object.type === 'frame') return { ...object, title: text };
		if (object.type === 'text' || object.type === 'sticky' || object.type === 'shape') {
			return { ...object, text };
		}
		return object;
	}
}
