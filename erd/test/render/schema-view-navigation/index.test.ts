import { render, cleanup, fireEvent } from '@testing-library/svelte';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import View from '$stylist/erd/component/organism/schema-view/index.svelte';
import type { SchemaDocument } from '$stylist/erd/type/object/schema-document';
const document: SchemaDocument = {
	tables: ['a', 'b', 'c', 'd', 'e'].map((id) => ({
		id,
		name: id,
		fields: [
			{
				id: id + '.id',
				name: 'id',
				type: 'int',
				primary: true,
				required: true,
				unique: true,
				notes: []
			}
		]
	})),
	dependencies: [
		['ab', 'a', 'b'],
		['bc', 'b', 'c'],
		['de', 'd', 'e']
	].map(([id, sourceTable, targetTable]) => ({
		id,
		sourceTable,
		targetTable,
		sourceField: 'id',
		targetField: 'id',
		label: id
	}))
};
const props = {
	document,
	layout: 'clusters' as const,
	tableGroups: { a: 'alpha', b: 'alpha', c: 'beta', d: 'gamma', e: 'gamma' },
	highlightRelations: false
};
const pointerCaptureDescriptors = Object.fromEntries(
	['setPointerCapture', 'hasPointerCapture', 'releasePointerCapture'].map((name) => [
		name,
		Object.getOwnPropertyDescriptor(HTMLElement.prototype, name)
	])
);
beforeEach(() => {
	vi.stubGlobal(
		'ResizeObserver',
		class {
			observe() {}
			disconnect() {}
		}
	);
	vi.stubGlobal(
		'PointerEvent',
		class extends MouseEvent {
			pointerId: number;
			pointerType: string;
			constructor(name: string, init: PointerEventInit = {}) {
				super(name, init);
				this.pointerId = init.pointerId ?? 1;
				this.pointerType = init.pointerType ?? 'mouse';
			}
		}
	);
	HTMLElement.prototype.setPointerCapture = vi.fn();
	HTMLElement.prototype.hasPointerCapture = vi.fn(() => true);
	HTMLElement.prototype.releasePointerCapture = vi.fn();
});
afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
	for (const [name, descriptor] of Object.entries(pointerCaptureDescriptors)) {
		if (descriptor) Object.defineProperty(HTMLElement.prototype, name, descriptor);
		else Reflect.deleteProperty(HTMLElement.prototype, name);
	}
});
test('leading reference cluster has its own left column, including after changing the reference group', async () => {
	const view = render(View, {...props, leadingCluster:'beta', clusterAspectRatio:0.85});
	const assertLeading = (ids: string[]) => {
		const group = props.tableGroups[ids[0] as keyof typeof props.tableGroups];
		const panels = [...view.container.querySelectorAll<HTMLElement>('.schema-view__cluster-panel')];
		const root = panels.find(panel=>panel.querySelector('button')?.textContent?.trim().startsWith(group))!;
		const rootRight = Number.parseFloat(root.style.left)+Number.parseFloat(root.style.width);
		for (const panel of panels.filter(panel=>panel!==root)) {
			expect(Number.parseFloat(panel.style.left)).toBeGreaterThan(rootRight);
		}
	};
	assertLeading(['c']);
	await view.rerender({...props,leadingCluster:'gamma',clusterAspectRatio:0.85});
	assertLeading(['d','e']);
	await view.rerender({...props,leadingCluster:'missing',clusterAspectRatio:0.85});
	expect(view.container.querySelectorAll('[data-table-id]').length).toBe(document.tables.length);
});

test('empty canvas pans the native viewport and does not reposition tables', async () => {
	const view = render(View, props),
		viewport = view.container.querySelector<HTMLElement>('.schema-view')!,
		canvas = view.container.querySelector('.schema-view__canvas')!;
	const table = view.container.querySelector<HTMLElement>('[data-table-id="a"]')!,
		position = table.getAttribute('style');
	viewport.scrollLeft = 400;
	viewport.scrollTop = 300;
	await fireEvent.pointerDown(canvas, {
		button: 0,
		buttons: 1,
		clientX: 300,
		clientY: 250,
		pointerId: 1
	});
	await fireEvent.pointerMove(viewport, { buttons: 1, clientX: 220, clientY: 210, pointerId: 1 });
	expect(viewport.scrollLeft).toBe(480);
	expect(viewport.scrollTop).toBe(340);
	expect(table.getAttribute('style')).toBe(position);
	await fireEvent.pointerUp(viewport, { button: 0, buttons: 0, pointerId: 1 });
	expect(viewport.classList.contains('schema-view--panning')).toBe(false);
	await fireEvent.pointerMove(viewport, { buttons: 0, clientX: 100, clientY: 100, pointerId: 1 });
	expect(viewport.scrollLeft).toBe(480);
});
test('ordinary wheel scrolls natively; held-button wheel changes zoom around the cursor and reports it', async () => {
	const onZoomChange = vi.fn(),
		view = render(View, { ...props, onZoomChange }),
		viewport = view.container.querySelector<HTMLElement>('.schema-view')!;
	viewport.scrollLeft = 400;
	viewport.scrollTop = 300;
	const ordinary = new WheelEvent('wheel', { deltaY: 100, cancelable: true, bubbles: true });
	viewport.dispatchEvent(ordinary);
	expect(ordinary.defaultPrevented).toBe(false);
	expect(onZoomChange).not.toHaveBeenCalled();
	const event = new WheelEvent('wheel', {
		buttons: 1,
		deltaY: -100,
		clientX: 200,
		clientY: 100,
		cancelable: true,
		bubbles: true
	});
	await fireEvent(viewport, event);
	expect(event.defaultPrevented).toBe(true);
	expect(onZoomChange).toHaveBeenCalledWith(1.22);
	expect(viewport.scrollLeft).toBeCloseTo(532);
	expect(viewport.scrollTop).toBeCloseTo(388);
	await fireEvent(
		viewport,
		new WheelEvent('wheel', { buttons: 1, deltaY: -10000, cancelable: true, bubbles: true })
	);
	expect(onZoomChange).toHaveBeenLastCalledWith(1.8);
	await fireEvent(
		viewport,
		new WheelEvent('wheel', { buttons: 1, deltaY: 10000, cancelable: true, bubbles: true })
	);
	expect(onZoomChange).toHaveBeenLastCalledWith(0.08);
});
test('cluster hover includes internal and external edges, table hover narrows them, leaving restores cluster', async () => {
	const view = render(View, props),
		viewport = view.container.querySelector<HTMLElement>('.schema-view')!,
		panel = view.container.querySelector<HTMLElement>('.schema-view__cluster-panel')!;
	const left = Number.parseFloat(panel.style.left),
		top = Number.parseFloat(panel.style.top);
	await fireEvent.pointerMove(viewport, { clientX: left + 2, clientY: top + 2 });
	expect(view.container.querySelectorAll('.schema-dependency--active')).toHaveLength(2);
	expect(view.container.querySelectorAll('.schema-dependency--dimmed')).toHaveLength(1);
	const table = view.container.querySelector<HTMLElement>('[data-table-id="a"]')!;
	await fireEvent.pointerEnter(table);
	expect(view.container.querySelectorAll('.schema-dependency--active')).toHaveLength(1);
	await fireEvent.pointerLeave(table);
	expect(view.container.querySelectorAll('.schema-dependency--active')).toHaveLength(2);
	await fireEvent.pointerLeave(viewport);
	expect(view.container.querySelectorAll('.schema-dependency--active')).toHaveLength(0);
	expect(view.container.querySelectorAll('.schema-dependency--dimmed')).toHaveLength(0);
});
test('table and cluster drag remain separate from viewport panning', async () => {
	const view = render(View, props),
		viewport = view.container.querySelector<HTMLElement>('.schema-view')!,
		table = view.container.querySelector<HTMLElement>('[data-table-id="a"]')!;
	const x = Number.parseFloat(table.style.left);
	viewport.scrollLeft = 100;
	await fireEvent.pointerDown(table, {
		button: 0,
		buttons: 1,
		clientX: 100,
		clientY: 100,
		pointerId: 1
	});
	await fireEvent.pointerMove(table, { buttons: 1, clientX: 130, clientY: 100, pointerId: 1 });
	await fireEvent.pointerUp(table, { buttons: 0, pointerId: 1 });
	expect(Number.parseFloat(table.style.left)).toBe(x + 30);
	expect(viewport.scrollLeft).toBe(100);
	expect(viewport.classList.contains('schema-view--panning')).toBe(false);
	const label = view.getByRole('button', { name: 'Drag the alpha · 2 domain' }),
		before = Number.parseFloat(table.style.left);
	await fireEvent.pointerDown(label, {
		button: 0,
		buttons: 1,
		clientX: 100,
		clientY: 100,
		pointerId: 1
	});
	await fireEvent.pointerMove(label, { buttons: 1, clientX: 150, clientY: 120, pointerId: 1 });
	await fireEvent.pointerUp(label, { buttons: 0, pointerId: 1 });
	expect(Number.parseFloat(table.style.left)).toBe(before + 50);
	expect(viewport.scrollLeft).toBe(100);
});

test('hovering one relation isolates it and its endpoints, then restores a pinned table', async () => {
	const view=render(View,props);
	const table=view.container.querySelector<HTMLElement>('[data-table-id="a"]')!;
	await fireEvent.pointerDown(table,{button:0,buttons:1,clientX:100,clientY:100,pointerId:1});
	await fireEvent.pointerUp(table,{button:0,buttons:0,clientX:100,clientY:100,pointerId:1});
	await fireEvent.pointerLeave(table);
	const active=()=>[...view.container.querySelectorAll<HTMLElement>('.schema-dependency--active')].map(node=>node.dataset.dependencyId);
	expect(active()).toEqual(['ab']);
	const edge=view.container.querySelector('[data-dependency-id="bc"]')!;
	await fireEvent.pointerEnter(edge);
	expect(active()).toEqual(['bc']);
	expect(view.container.querySelectorAll('.schema-dependency--dimmed')).toHaveLength(2);
	expect(view.container.querySelectorAll('.schema-table--active')).toHaveLength(2);
	await fireEvent.pointerLeave(edge);
	expect(active()).toEqual(['ab']);
});
test('blur and pointer cancellation release a background drag', async () => {
	const view = render(View, props),
		viewport = view.container.querySelector<HTMLElement>('.schema-view')!,
		canvas = view.container.querySelector('.schema-view__canvas')!;
	await fireEvent.pointerDown(canvas, { button: 0, buttons: 1, pointerId: 1 });
	await fireEvent(window, new Event('blur'));
	expect(viewport.classList.contains('schema-view--panning')).toBe(false);
	await fireEvent.pointerDown(canvas, { button: 0, buttons: 1, pointerId: 1 });
	await fireEvent.pointerCancel(viewport, { pointerId: 1 });
	expect(viewport.classList.contains('schema-view--panning')).toBe(false);
});

test('wheel uses the captured mouse button when a browser omits wheel.buttons, and stops after release', async () => {
	const onZoomChange = vi.fn(),
		view = render(View, { ...props, onZoomChange }),
		viewport = view.container.querySelector<HTMLElement>('.schema-view')!,
		canvas = view.container.querySelector('.schema-view__canvas')!;
	await fireEvent.pointerDown(canvas, { button: 0, buttons: 1, pointerId: 1 });
	await fireEvent(
		viewport,
		new WheelEvent('wheel', { buttons: 0, deltaY: -100, cancelable: true, bubbles: true })
	);
	expect(onZoomChange).toHaveBeenCalledWith(1.22);
	await fireEvent.pointerUp(window, { button: 0, buttons: 0, pointerId: 1 });
	onZoomChange.mockClear();
	const event = new WheelEvent('wheel', {
		buttons: 0,
		deltaY: -100,
		cancelable: true,
		bubbles: true
	});
	await fireEvent(viewport, event);
	expect(event.defaultPrevented).toBe(false);
	expect(onZoomChange).not.toHaveBeenCalled();
});

test('zoom during a table drag rebases its origin instead of jumping on the next move', async () => {
	const view = render(View, props),
		table = view.container.querySelector<HTMLElement>('[data-table-id="a"]')!,
		x = Number.parseFloat(table.style.left);
	await fireEvent.pointerDown(table, {
		button: 0,
		buttons: 1,
		clientX: 100,
		clientY: 100,
		pointerId: 1
	});
	await fireEvent.pointerMove(table, { buttons: 1, clientX: 130, clientY: 100, pointerId: 1 });
	await fireEvent(
		table,
		new WheelEvent('wheel', {
			buttons: 1,
			deltaY: -100,
			clientX: 130,
			clientY: 100,
			cancelable: true,
			bubbles: true
		})
	);
	await fireEvent.pointerMove(table, { buttons: 1, clientX: 152, clientY: 100, pointerId: 1 });
	expect(Number.parseFloat(table.style.left)).toBeCloseTo(x + 30 + 22 / 1.22);
	await fireEvent.pointerUp(table, { button: 0, buttons: 0, pointerId: 1 });
});
