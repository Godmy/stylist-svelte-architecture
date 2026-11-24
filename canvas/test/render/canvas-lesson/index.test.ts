import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import SharedCanvas from '$stylist/canvas/component/organism/shared-canvas/index.svelte';
import type { CanvasObject } from '$stylist/canvas/type/alias/canvas-object';

afterEach(cleanup);

beforeAll(() => {
	// jsdom has no ResizeObserver; `bind:clientWidth` needs one.
	globalThis.ResizeObserver ??= class {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof ResizeObserver;
});

const pointer = (x: number, y: number, extra: Record<string, unknown> = {}) => ({
	clientX: x,
	clientY: y,
	button: 0,
	pointerId: 1,
	...extra
});

async function drag(element: Element, from: [number, number], to: [number, number]) {
	await fireEvent.pointerDown(element, pointer(...from));
	await fireEvent.pointerMove(element, pointer(...to));
	await fireEvent.pointerUp(element, pointer(...to));
}

const board = () => screen.getByRole('application', { name: 'Whiteboard' });
const world = () => board().firstElementChild as HTMLElement;
const card: CanvasObject = {
	id: 'card',
	type: 'sticky',
	text: 'el gato',
	x: 100,
	y: 100,
	width: 100,
	height: 100,
	locked: true
};

describe('SharedCanvas lessons', () => {
	it('keeps pinned material out of reach of students', async () => {
		const onChange = vi.fn<(objects: CanvasObject[]) => void>();
		render(SharedCanvas, { objects: [card], role: 'student', onChange });

		await drag(board(), [150, 150], [300, 300]);
		expect(world().querySelector('.c-shared-canvas__selection')).toBeNull();
		await fireEvent.click(screen.getByRole('button', { name: 'Eraser' }));
		await drag(board(), [150, 150], [160, 160]);

		expect(onChange).not.toHaveBeenCalled();
		expect(world().querySelectorAll('[data-object-id]')).toHaveLength(1);
		expect(screen.queryByRole('button', { name: /Pin in place|Unpin/ })).toBeNull();
	});

	it('lets the teacher pin and unpin; pinned objects do not move', async () => {
		const onChange = vi.fn<(objects: CanvasObject[]) => void>();
		render(SharedCanvas, { objects: [{ ...card, locked: undefined }], onChange });

		await fireEvent.pointerDown(board(), pointer(150, 150));
		await fireEvent.pointerUp(board(), pointer(150, 150));
		await fireEvent.click(screen.getByRole('button', { name: /Pin in place/ }));
		expect(onChange.mock.lastCall?.[0][0]).toMatchObject({ id: 'card', locked: true });

		await drag(board(), [150, 150], [250, 250]);
		expect(onChange.mock.lastCall?.[0][0]).toMatchObject({ x: 100, y: 100 });

		await fireEvent.click(screen.getByRole('button', { name: 'Unpin' }));
		expect(onChange.mock.lastCall?.[0][0].locked).toBeUndefined();
	});

	it('does not drag the content of a pinned frame', async () => {
		const onChange = vi.fn<(objects: CanvasObject[]) => void>();
		const objects: CanvasObject[] = [
			{ id: 'frame', type: 'frame', x: 0, y: 0, width: 300, height: 300, locked: true },
			{ id: 'inside', type: 'shape', shape: 'ellipse', x: 50, y: 50, width: 40, height: 40 }
		];
		render(SharedCanvas, { objects, onChange });

		await drag(board(), [250, 250], [280, 280]);
		expect(onChange).not.toHaveBeenCalled();
	});

	it('shows only the allowed tools', () => {
		render(SharedCanvas, { allowedTools: ['select', 'pen', 'eraser'] });
		const toolbar = screen.getByRole('toolbar', { name: 'Tools' });
		const names = [...toolbar.querySelectorAll('button')].map((button) =>
			button.getAttribute('aria-label')
		);
		expect(names).toEqual(['Select', 'Pen', 'Eraser']);
	});

	it('merges changes of others without losing the local undo history', async () => {
		const onChange = vi.fn<(objects: CanvasObject[]) => void>();
		const { rerender } = render(SharedCanvas, { objects: [], onChange });

		await fireEvent.click(screen.getByRole('button', { name: 'Shapes' }));
		await fireEvent.click(screen.getByRole('menuitemradio', { name: 'Ellipse' }));
		await drag(board(), [10, 10], [110, 110]);
		const mine = onChange.mock.lastCall?.[0] ?? [];
		expect(mine).toHaveLength(1);

		const remote: CanvasObject = { ...card, id: 'remote', locked: undefined };
		await rerender({ objects: [...mine, remote], onChange });
		expect(world().querySelectorAll('[data-object-id]')).toHaveLength(2);

		await fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
		expect(onChange.mock.lastCall?.[0]).toEqual([expect.objectContaining({ id: 'remote' })]);
	});

	it('locks panning and zooming while following', async () => {
		render(SharedCanvas, { lockView: true });
		expect(screen.queryByRole('button', { name: 'Hand (move the board)' })).toBeNull();
		expect(screen.queryByRole('button', { name: 'Zoom in' })).toBeNull();

		await fireEvent.wheel(board(), { deltaY: 100 });
		await fireEvent.keyDown(board(), { key: ' ' });
		await drag(board(), [100, 100], [200, 200]);
		expect(world().style.transform).toBe('translate(0px, 0px) scale(1)');
	});

	it('zooms with a two-finger pinch on touch screens', async () => {
		render(SharedCanvas, { selectedTool: 'pen' });
		const touch = (id: number, x: number) =>
			pointer(x, 100, { pointerId: id, pointerType: 'touch' });

		await fireEvent.pointerDown(board(), touch(1, 100));
		await fireEvent.pointerDown(board(), touch(2, 200));
		await fireEvent.pointerMove(board(), touch(2, 300));
		await fireEvent.pointerUp(board(), touch(2, 300));
		await fireEvent.pointerUp(board(), touch(1, 100));

		expect(world().style.transform).toBe('translate(-100px, -100px) scale(2)');
		// The first finger's pen stroke was cancelled by the pinch.
		expect(world().querySelectorAll('[data-object-id]')).toHaveLength(0);
	});

	it('inserts dropped pictures through onImageUpload', async () => {
		const onChange = vi.fn<(objects: CanvasObject[]) => void>();
		const onImageUpload = vi.fn(async () => 'https://cdn.example.test/gato.png');
		render(SharedCanvas, { onChange, onImageUpload });

		const file = new File(['png'], 'gato.png', { type: 'image/png' });
		await fireEvent.drop(board(), {
			clientX: 200,
			clientY: 150,
			dataTransfer: { files: [file], types: ['Files'] }
		});

		await waitFor(() => expect(onChange).toHaveBeenCalled(), { timeout: 4000 });
		expect(onImageUpload).toHaveBeenCalledWith(file);
		expect(onChange.mock.lastCall?.[0]).toEqual([
			expect.objectContaining({
				type: 'image',
				src: 'https://cdn.example.test/gato.png',
				// jsdom drops carry no coordinates: the picture is centered on the view (0, 0).
				x: -160,
				y: -120,
				width: 320,
				height: 240
			})
		]);
		expect(world().querySelector('img')?.getAttribute('src')).toBe(
			'https://cdn.example.test/gato.png'
		);
	});
});
