import { afterEach, describe, expect, it } from 'vitest';
import { CanvasManager } from '$stylist/canvas/class/manager/canvas';
import { CanvasBoardManager } from '$stylist/canvas/class/manager/canvas-board';
import { CanvasGeometryManager } from '$stylist/canvas/class/manager/canvas-geometry';
import { CanvasHistoryManager } from '$stylist/canvas/class/manager/canvas-history';
import { CanvasShapeManager } from '$stylist/canvas/class/manager/canvas-shape';
import { CanvasSurfaceManager } from '$stylist/canvas/class/manager/canvas-surface';
import { CanvasViewportManager } from '$stylist/canvas/class/manager/canvas-viewport';
import { CANVAS_SHAPE_KIND } from '$stylist/canvas/const/array/canvas-shape-kind';
import { canvasColor } from '$stylist/canvas/function/resolve/canvas-color';
import type { CanvasObject } from '$stylist/canvas/type/alias/canvas-object';

const rect = (id: string, x: number, y: number, size = 10): CanvasObject => ({
	id,
	type: 'shape',
	shape: 'rectangle',
	x,
	y,
	width: size,
	height: size
});

describe('CanvasHistoryManager', () => {
	it('undoes and redoes snapshots and drops the redo branch on push', () => {
		let history = CanvasHistoryManager.create(0);
		history = CanvasHistoryManager.push(history, 1);
		history = CanvasHistoryManager.push(history, 2);
		history = CanvasHistoryManager.undo(history);
		expect(history.present).toBe(1);
		expect(CanvasHistoryManager.canRedo(history)).toBe(true);

		history = CanvasHistoryManager.redo(history);
		expect(history.present).toBe(2);

		history = CanvasHistoryManager.undo(history);
		history = CanvasHistoryManager.push(history, 5);
		expect(history).toEqual({ past: [0, 1], present: 5, future: [] });
	});

	it('keeps at most `limit` past entries and ignores impossible steps', () => {
		let history = CanvasHistoryManager.create(0);
		for (let value = 1; value <= 5; value += 1) {
			history = CanvasHistoryManager.push(history, value, 3);
		}
		expect(history.past).toEqual([2, 3, 4]);

		const empty = CanvasHistoryManager.create('a');
		expect(CanvasHistoryManager.undo(empty)).toBe(empty);
		expect(CanvasHistoryManager.redo(empty)).toBe(empty);
	});
});

describe('canvasColor', () => {
	afterEach(() => document.documentElement.style.removeProperty('--canvas-test'));

	it('resolves custom properties, nested fallbacks and plain colors', () => {
		document.documentElement.style.setProperty('--canvas-test', '#123456');
		expect(canvasColor('var(--canvas-test)')).toBe('#123456');
		expect(canvasColor('var(--missing, var(--canvas-test))')).toBe('#123456');
		expect(canvasColor('var(--missing, red)')).toBe('red');
		expect(canvasColor('var(--missing)', null, '#000')).toBe('#000');
		expect(canvasColor('  #fff ')).toBe('#fff');
		expect(canvasColor(undefined, null, 'blue')).toBe('blue');
	});
});

describe('CanvasSurfaceManager', () => {
	it('maps pointer positions through the CSS size of the canvas', () => {
		const canvas = document.createElement('canvas');
		canvas.getBoundingClientRect = () =>
			({ left: 10, top: 20, width: 400, height: 300 }) as DOMRect;

		expect(
			CanvasSurfaceManager.getPointerPosition({ clientX: 210, clientY: 170 }, canvas, 800, 600)
		).toEqual({
			x: 400,
			y: 300
		});
	});
});

describe('CanvasGeometryManager', () => {
	it('hits the topmost object and prefers objects over frames', () => {
		const frame: CanvasObject = { id: 'f', type: 'frame', x: 0, y: 0, width: 200, height: 200 };
		const objects = [frame, rect('a', 10, 10, 50), rect('b', 30, 30, 50)];

		expect(CanvasGeometryManager.hitTest(objects, { x: 40, y: 40 })?.id).toBe('b');
		expect(CanvasGeometryManager.hitTest(objects, { x: 15, y: 15 })?.id).toBe('a');
		expect(CanvasGeometryManager.hitTest(objects, { x: 150, y: 150 })?.id).toBe('f');
		expect(CanvasGeometryManager.hitTest(objects, { x: 500, y: 500 })).toBeNull();
	});

	it('hits lines and ellipses by their real outline', () => {
		const line: CanvasObject = {
			id: 'l',
			type: 'line',
			points: [
				{ x: 0, y: 0 },
				{ x: 100, y: 100 }
			]
		};
		const ellipse: CanvasObject = { ...rect('e', 0, 0, 100), shape: 'ellipse' } as CanvasObject;

		expect(CanvasGeometryManager.isPointOnObject(line, { x: 50, y: 52 })).toBe(true);
		expect(CanvasGeometryManager.isPointOnObject(line, { x: 90, y: 10 })).toBe(false);
		expect(CanvasGeometryManager.isPointOnObject(ellipse, { x: 50, y: 50 })).toBe(true);
		expect(CanvasGeometryManager.isPointOnObject(ellipse, { x: 2, y: 2 })).toBe(false);
	});

	it('selects by rectangle; frames only when enclosed', () => {
		const frame: CanvasObject = { id: 'f', type: 'frame', x: 0, y: 0, width: 100, height: 100 };
		const objects = [frame, rect('a', 10, 10), rect('b', 300, 300)];

		expect(
			CanvasGeometryManager.getObjectsInRect(objects, { x: 5, y: 5, width: 20, height: 20 })
		).toEqual(['a']);
		expect(
			CanvasGeometryManager.getObjectsInRect(objects, { x: -1, y: -1, width: 120, height: 120 })
		).toEqual(['f', 'a']);
		expect(CanvasGeometryManager.getFrameChildren(objects, frame)).toEqual(['a']);
	});

	it('resizes boxes from a corner and keeps the ratio on demand', () => {
		const box = rect('a', 0, 0, 100);
		expect(CanvasGeometryManager.resize(box, 'se', { x: 200, y: 50 })).toMatchObject({
			x: 0,
			y: 0,
			width: 200,
			height: 50
		});
		expect(CanvasGeometryManager.resize(box, 'nw', { x: -50, y: 80 })).toMatchObject({
			x: -50,
			y: 80,
			width: 150,
			height: 20
		});
		expect(CanvasGeometryManager.resize(box, 'se', { x: 200, y: 50 }, true)).toMatchObject({
			width: 200,
			height: 200
		});
	});
});

describe('CanvasViewportManager', () => {
	it('zooms around an anchor and converts coordinates both ways', () => {
		const viewport = CanvasViewportManager.zoomAt(
			CanvasViewportManager.initial,
			{ x: 100, y: 100 },
			2
		);
		expect(viewport).toEqual({ zoom: 2, x: -100, y: -100 });
		expect(CanvasViewportManager.screenToWorld({ x: 100, y: 100 }, viewport)).toEqual({
			x: 100,
			y: 100
		});
		expect(CanvasViewportManager.worldToScreen({ x: 0, y: 0 }, viewport)).toEqual({
			x: -100,
			y: -100
		});
		expect(CanvasViewportManager.zoomAt(viewport, { x: 0, y: 0 }, 100).zoom).toBe(4);
	});

	it('fits content into the screen without enlarging it', () => {
		const viewport = CanvasViewportManager.fit({ x: 0, y: 0, width: 100, height: 100 }, 400, 400);
		expect(viewport).toEqual({ zoom: 1, x: 150, y: 150 });
		expect(CanvasViewportManager.fit(null, 400, 400)).toEqual(CanvasViewportManager.initial);
	});
});

describe('CanvasBoardManager', () => {
	const style = CanvasBoardManager.defaultStyle;

	it('places a clicked shape at its default size centered on the click', () => {
		const draft = CanvasBoardManager.createDraft('shape', { x: 100, y: 100 }, style);
		expect(draft).not.toBeNull();
		const placed = CanvasBoardManager.finishDraft(draft!, { x: 100, y: 100 }, false);
		expect(placed).toMatchObject({ type: 'shape', x: 20, y: 40, width: 160, height: 120 });
	});

	it('grows dragged drafts and constrains squares and 45° lines with Shift', () => {
		const start = { x: 0, y: 0 };
		const shape = CanvasBoardManager.createDraft('shape', start, style)!;
		expect(CanvasBoardManager.updateDraft(shape, start, { x: 40, y: -10 }, true)).toMatchObject({
			x: 0,
			y: -40,
			width: 40,
			height: 40
		});

		const line = CanvasBoardManager.createDraft('arrow', start, style)!;
		const grown = CanvasBoardManager.updateDraft(line, start, { x: 100, y: 90 }, true);
		expect(grown.type === 'line' && grown.arrow).toBe(true);
		if (grown.type === 'line') expect(grown.points[1].x).toBeCloseTo(grown.points[1].y, 5);
	});

	it('drops zero-length lines and keeps freehand dots', () => {
		const line = CanvasBoardManager.createDraft('line', { x: 5, y: 5 }, style)!;
		expect(CanvasBoardManager.finishDraft(line, { x: 5, y: 5 }, false)).toBeNull();

		const path = CanvasBoardManager.createDraft('pen', { x: 5, y: 5 }, style)!;
		expect(CanvasBoardManager.finishDraft(path, { x: 5, y: 5 }, false)).toBe(path);
		expect(CanvasBoardManager.createDraft('select', { x: 0, y: 0 }, style)).toBeNull();
	});

	it('reads and writes text of text-bearing objects', () => {
		const frame: CanvasObject = { id: 'f', type: 'frame', x: 0, y: 0, width: 10, height: 10 };
		expect(CanvasBoardManager.getText(CanvasBoardManager.setText(frame, 'Plan'))).toBe('Plan');
		expect(
			CanvasBoardManager.isTextEditable({
				id: 'i',
				type: 'icon',
				icon: 'star',
				x: 0,
				y: 0,
				width: 1,
				height: 1
			})
		).toBe(false);
	});
});

describe('CanvasManager', () => {
	it('diffs snapshots by id', () => {
		const before = [rect('a', 0, 0), rect('b', 0, 0)];
		const after = [rect('a', 5, 0), rect('c', 0, 0)];
		const diff = CanvasManager.diffCanvasObjects(before, after);

		expect(diff.added.map((object) => object.id)).toEqual(['c']);
		expect(diff.updated.map((object) => object.id)).toEqual(['a']);
		expect(diff.removed).toEqual(['b']);
	});

	it('duplicates, reorders and moves selected objects', () => {
		const objects = [rect('a', 0, 0), rect('b', 0, 0), rect('c', 0, 0)];
		const ids = new Set(['a']);
		const duplicated = CanvasManager.duplicateCanvasObjects(objects, ids);

		expect(duplicated.objects).toHaveLength(4);
		expect(duplicated.objects[3]).toMatchObject({ x: 24, y: 24 });
		expect(duplicated.ids[0]).not.toBe('a');
		expect(CanvasManager.reorderCanvasObjects(objects, ids, 'front').map((o) => o.id)).toEqual([
			'b',
			'c',
			'a'
		]);
		expect(
			CanvasManager.reorderCanvasObjects(objects, new Set(['c']), 'back').map((o) => o.id)
		).toEqual(['c', 'a', 'b']);
		expect(CanvasManager.moveCanvasObjects(objects, ids, 3, 4)[0]).toMatchObject({ x: 3, y: 4 });
	});

	it('round-trips JSON and skips invalid entries', () => {
		const objects: CanvasObject[] = [
			rect('a', 1, 2),
			{ id: 'p', type: 'path', points: [{ x: 0, y: 0 }], color: '#000' },
			{
				id: 't',
				type: 'text',
				text: 'Hi',
				x: 0,
				y: 0,
				width: 10,
				height: 10,
				font: { family: 'serif', bold: true }
			}
		];
		const json = CanvasManager.serializeCanvasObjects(objects);

		expect(CanvasManager.parseCanvasObjects(json)).toEqual(objects);
		expect(
			CanvasManager.parseCanvasObjects(
				JSON.stringify([
					...objects,
					{ id: 'x', type: 'shape', shape: 'blob', x: 0, y: 0, width: 1, height: 1 },
					{ type: 'line' }
				])
			)
		).toHaveLength(3);
		expect(CanvasManager.parseCanvasObjects('not json')).toEqual([]);
	});

	it('creates unique ids', () => {
		const ids = new Set(Array.from({ length: 50 }, () => CanvasManager.createCanvasObjectId()));
		expect(ids.size).toBe(50);
	});
});

describe('CanvasShapeManager', () => {
	it('builds a closed outline for every shape kind', () => {
		for (const shape of CANVAS_SHAPE_KIND) {
			const path = CanvasShapeManager.getPath(shape, 100, 60, 1);
			expect(path, shape).toMatch(/^M/);
			expect(path.trim().endsWith('Z'), shape).toBe(true);
			expect(path, shape).not.toContain('NaN');
		}
	});
});
