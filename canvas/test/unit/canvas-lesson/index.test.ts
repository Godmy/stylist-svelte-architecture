import { describe, expect, it } from 'vitest';
import { CanvasBoardManager } from '$stylist/canvas/class/manager/canvas-board';
import { CanvasHistoryManager } from '$stylist/canvas/class/manager/canvas-history';
import { CanvasImageManager } from '$stylist/canvas/class/manager/canvas-image';
import { CanvasManager } from '$stylist/canvas/class/manager/canvas';
import { CanvasViewportManager } from '$stylist/canvas/class/manager/canvas-viewport';
import type { CanvasObject } from '$stylist/canvas/type/alias/canvas-object';

const box = (id: string, x = 0): CanvasObject => ({
	id,
	type: 'shape',
	shape: 'rectangle',
	x,
	y: 0,
	width: 10,
	height: 10
});

describe('Board changes of other participants', () => {
	it('applies added, updated and removed objects and keeps the rest intact', () => {
		const a = box('a');
		const b = box('b');
		const result = CanvasManager.applyCanvasChange([a, b], {
			added: [box('c'), box('a', 5)],
			updated: [box('b', 9), box('missing')],
			removed: []
		});
		expect(result.map((object) => object.id)).toEqual(['a', 'b', 'c']);
		expect(result[0]).toMatchObject({ x: 5 });
		expect(result[1]).toMatchObject({ x: 9 });

		const removed = CanvasManager.applyCanvasChange(result, {
			added: [],
			updated: [],
			removed: ['b']
		});
		expect(removed.map((object) => object.id)).toEqual(['a', 'c']);
		expect(removed[1]).toBe(result[2]);
	});

	it('rebases history, so undo keeps a remote object', () => {
		let history = CanvasHistoryManager.create<CanvasObject[]>([]);
		history = CanvasHistoryManager.push(history, [box('mine')]);
		const change = CanvasManager.diffCanvasObjects(history.present, [box('mine'), box('theirs')]);
		history = CanvasHistoryManager.rebase(history, (snapshot) =>
			CanvasManager.applyCanvasChange(snapshot, change)
		);
		history = CanvasHistoryManager.undo(history);
		expect(history.present.map((object) => object.id)).toEqual(['theirs']);
	});
});

describe('Views, pictures and pinned objects', () => {
	it('converts a viewport to a size-independent view and back', () => {
		const viewport = { x: -100, y: 40, zoom: 2 };
		const view = CanvasViewportManager.getView(viewport, 800, 600);
		expect(view).toEqual({ center: { x: 250, y: 130 }, zoom: 2 });
		// A smaller screen shows the same middle point.
		const other = CanvasViewportManager.fromView(view, 400, 300);
		expect(CanvasViewportManager.screenToWorld({ x: 200, y: 150 }, other)).toEqual({
			x: 250,
			y: 130
		});
	});

	it('fits pictures and validates image and pinned objects', () => {
		expect(CanvasImageManager.fitSize({ width: 1600, height: 800 })).toEqual({
			width: 400,
			height: 200
		});
		expect(CanvasImageManager.fitSize({ width: 100, height: 50 })).toEqual({
			width: 100,
			height: 50
		});
		expect(CanvasImageManager.fitSize(null)).toEqual(CanvasImageManager.fallbackSize);

		const image = CanvasBoardManager.createImage(
			'data:image/png;base64,AA',
			{ x: 100, y: 100 },
			{
				width: 40,
				height: 20
			}
		);
		expect(image).toMatchObject({ type: 'image', x: 80, y: 90, width: 40, height: 20 });
		expect(CanvasManager.isCanvasObject(image)).toBe(true);
		expect(CanvasManager.isCanvasObject({ ...image, src: '' })).toBe(false);
		expect(CanvasManager.isCanvasObject({ ...box('p'), locked: true })).toBe(true);
		expect(CanvasManager.isCanvasObject({ ...box('p'), locked: 'yes' })).toBe(false);
	});

	it('picks only image files', () => {
		const files = [
			new File(['a'], 'a.png', { type: 'image/png' }),
			new File(['b'], 'b.txt', { type: 'text/plain' })
		];
		const list = Object.assign(files, {
			item: (index: number) => files[index]
		}) as unknown as FileList;
		expect(CanvasImageManager.getImageFiles({ files: list }).map((file) => file.name)).toEqual([
			'a.png'
		]);
		expect(CanvasImageManager.getImageFiles(null)).toEqual([]);
	});
});
