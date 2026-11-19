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
