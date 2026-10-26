import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/svelte';
import WorkspacePalette from '$stylist/workspace/component/organism/workspace-palette/index.svelte';
import StylistGraphWorkspace from '$stylist/workspace/component/organism/stylist-graph-workspace/index.svelte';
import { ManagerLocaleContext } from '$stylist/localization/class/manager/locale-context';
import { LOCALIZATION_LOCALE_CONTEXT } from '$stylist/localization/const/value/locale-context';

afterEach(cleanup);

// jsdom has no ResizeObserver; the graph viewport only needs it to exist.
globalThis.ResizeObserver ??= class {
	observe() {}
	unobserve() {}
	disconnect() {}
};

const ru = () =>
	new Map([[LOCALIZATION_LOCALE_CONTEXT, { ...ManagerLocaleContext.DEFAULT, locale: 'ru' }]]);

describe('workspace localization', () => {
	it('translates the palette and its "all" category', () => {
		render(WorkspacePalette, { props: { isOpen: true, items: [] }, context: ru() });
		const text = document.body.textContent ?? '';
		expect(text).toContain('Палитра узлов');
		expect(text).toContain('Узлов нет');
		expect(screen.getByPlaceholderText('Поиск узлов…')).toBeTruthy();
	});

	it('translates the graph editor and the defaults of a new node', () => {
		render(StylistGraphWorkspace, { context: ru() });
		const text = document.body.textContent ?? '';
		expect(text).toContain('Новый узел');
		expect(text).toContain('Добавить узел');
		expect(text).toContain('Перемещение');
		expect((screen.getByDisplayValue('Новый узел') as HTMLInputElement).value).toBe('Новый узел');
	});
});
