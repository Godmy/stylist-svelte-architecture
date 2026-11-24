import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import SharedCanvas from '$stylist/canvas/component/organism/shared-canvas/index.svelte';
import DrawingSurface from '$stylist/canvas/component/molecule/drawing-surface/index.svelte';
import CanvasToolbar from '$stylist/canvas/component/molecule/canvas-toolbar/index.svelte';
import ScreenshotSelector from '$stylist/canvas/component/molecule/screenshot-selector/index.svelte';
import CollaborativeEditor from '$stylist/canvas/component/organism/collaborative-editor/index.svelte';
import type { CanvasObject } from '$stylist/canvas/type/alias/canvas-object';
import type { CanvasStroke } from '$stylist/canvas/type/object/canvas-stroke';

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
	await fireEvent.pointerMove(element, pointer((from[0] + to[0]) / 2, (from[1] + to[1]) / 2));
	await fireEvent.pointerMove(element, pointer(...to));
	await fireEvent.pointerUp(element, pointer(...to));
}

const board = () => screen.getByRole('application', { name: 'Whiteboard' });
const world = () => board().firstElementChild as HTMLElement;

describe('SharedCanvas whiteboard', () => {
	it('draws a shape by dragging, then undoes and redoes it', async () => {
		const onChange = vi.fn<(objects: CanvasObject[]) => void>();
		const onObjectAdd = vi.fn();
		render(SharedCanvas, { onChange, onObjectAdd });

		await fireEvent.click(screen.getByRole('button', { name: 'Shapes' }));
		await fireEvent.click(screen.getByRole('menuitemradio', { name: 'Triangle' }));
		await drag(board(), [100, 100], [220, 180]);

		expect(onObjectAdd).toHaveBeenCalledTimes(1);
		expect(onChange.mock.lastCall?.[0]).toEqual([
			expect.objectContaining({
				type: 'shape',
				shape: 'triangle',
				x: 100,
				y: 100,
				width: 120,
				height: 80
			})
		]);
		expect(world().querySelectorAll('[data-object-id]')).toHaveLength(1);

		await fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
		expect(onChange.mock.lastCall?.[0]).toEqual([]);
		expect(world().querySelectorAll('[data-object-id]')).toHaveLength(0);

		await fireEvent.click(screen.getByRole('button', { name: 'Redo' }));
		expect(world().querySelectorAll('[data-object-id]')).toHaveLength(1);
	});

	it('pans the board with the hand tool and zooms with the controls', async () => {
		render(SharedCanvas);

		await fireEvent.click(screen.getByRole('button', { name: 'Hand (move the board)' }));
		await drag(board(), [100, 100], [160, 130]);
		expect(world().style.transform).toBe('translate(60px, 30px) scale(1)');

		await fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
		expect(screen.getByText('120%')).toBeTruthy();
	});

	it('selects, moves and deletes objects in select mode', async () => {
		const onChange = vi.fn<(objects: CanvasObject[]) => void>();
		const onObjectDelete = vi.fn();
		const objects: CanvasObject[] = [
			{ id: 'a', type: 'shape', shape: 'rectangle', x: 10, y: 10, width: 50, height: 50 },
			{ id: 'b', type: 'sticky', text: 'Note', x: 200, y: 10, width: 100, height: 100 }
		];
		render(SharedCanvas, { objects, onChange, onObjectDelete });

		await drag(board(), [30, 30], [80, 50]);
		expect(onChange.mock.lastCall?.[0][0]).toMatchObject({ id: 'a', x: 60, y: 30 });

		board().focus();
		await fireEvent.keyDown(board(), { key: 'Delete' });
		expect(onObjectDelete).toHaveBeenCalledWith('a');
		expect(onChange.mock.lastCall?.[0].map((object: CanvasObject) => object.id)).toEqual(['b']);
	});

	it('switches tools with keyboard shortcuts and shows the style panel', async () => {
		render(SharedCanvas);
		board().focus();
		await fireEvent.keyDown(board(), { key: 't' });

		expect(screen.getByRole('button', { name: 'Text' }).getAttribute('aria-pressed')).toBe('true');
		expect(screen.getByRole('combobox', { name: 'Font' })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Bold' })).toBeTruthy();
	});

	it('creates and edits a sticky note', async () => {
		const onChange = vi.fn<(objects: CanvasObject[]) => void>();
		render(SharedCanvas, { onChange });

		await fireEvent.click(screen.getByRole('button', { name: 'Sticky note' }));
		await fireEvent.pointerDown(board(), pointer(300, 300));
		await fireEvent.pointerUp(board(), pointer(300, 300));

		const editor = screen.getByPlaceholderText('Type something') as HTMLTextAreaElement;
		await fireEvent.input(editor, { target: { value: 'Plan' } });
		await fireEvent.blur(editor);

		expect(onChange.mock.lastCall?.[0]).toEqual([
			expect.objectContaining({ type: 'sticky', text: 'Plan', width: 200, height: 200 })
		]);
	});

	it('keeps readonly boards view-only', () => {
		render(SharedCanvas, { readonly: true });
		expect(screen.queryByRole('button', { name: 'Pen' })).toBeNull();
		expect(screen.getByRole('button', { name: 'Hand (move the board)' })).toBeTruthy();
	});
});

describe('DrawingSurface and CanvasToolbar', () => {
	it('records strokes and reports undo availability', async () => {
		const onStrokeEnd = vi.fn<(stroke: CanvasStroke) => void>();
		const onHistoryChange = vi.fn();
		const { container } = render(DrawingSurface, {
			width: 200,
			height: 100,
			strokeColor: '#ff0000',
			onStrokeEnd,
			onHistoryChange
		});
		const canvas = container.querySelector('canvas')!;

		await drag(canvas, [10, 10], [50, 40]);
		expect(onStrokeEnd.mock.lastCall?.[0]).toMatchObject({ tool: 'pen', color: '#ff0000' });
		expect(onStrokeEnd.mock.lastCall?.[0].points.length).toBeGreaterThan(1);
		expect(onHistoryChange).toHaveBeenLastCalledWith({ canUndo: true, canRedo: false });
	});

	it('enables undo from props and forwards tool changes', async () => {
		const onToolChange = vi.fn();
		const onUndo = vi.fn();
		render(CanvasToolbar, { canUndo: true, onToolChange, onUndo });

		await fireEvent.click(screen.getByRole('button', { name: 'Eraser' }));
		expect(onToolChange).toHaveBeenCalledWith('eraser', expect.objectContaining({ mode: 'erase' }));

		await fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
		expect(onUndo).toHaveBeenCalledTimes(1);
		expect((screen.getByRole('button', { name: 'Redo' }) as HTMLButtonElement).disabled).toBe(true);
	});
});

describe('ScreenshotSelector and CollaborativeEditor', () => {
	it('reports the selected region and cancels with Escape', async () => {
		const onSelect = vi.fn();
		const onCancel = vi.fn();
		render(ScreenshotSelector, { onSelect, onCancel });
		const overlay = screen.getByRole('application');

		await drag(overlay, [100, 50], [20, 150]);
		expect(onSelect).toHaveBeenCalledWith({ x: 20, y: 50, width: 80, height: 100 });

		await fireEvent.keyDown(window, { key: 'Escape' });
		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	it('does not leak component props as DOM attributes', () => {
		const { container } = render(CollaborativeEditor, {
			content: 'Hello',
			showUserList: false,
			onContentChange: () => {}
		});
		const root = container.querySelector('.c-collaborative-editor')!;
		expect(root.hasAttribute('content')).toBe(false);
		expect(root.hasAttribute('showuserlist')).toBe(false);
	});
});
