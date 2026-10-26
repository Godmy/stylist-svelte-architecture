import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/svelte';
import CanvasToolbar from '$stylist/canvas/component/molecule/canvas-toolbar/index.svelte';
import CollaborativeEditor from '$stylist/canvas/component/organism/collaborative-editor/index.svelte';
import { ManagerLocaleContext } from '$stylist/localization/class/manager/locale-context';
import { LOCALIZATION_LOCALE_CONTEXT } from '$stylist/localization/const/value/locale-context';

afterEach(cleanup);

const ru = () =>
	new Map([[LOCALIZATION_LOCALE_CONTEXT, { ...ManagerLocaleContext.DEFAULT, locale: 'ru' }]]);

describe('canvas localization', () => {
	it('translates the drawing toolbar', () => {
		render(CanvasToolbar, { context: ru() });
		expect(screen.getByRole('button', { name: 'Ластик' })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Очистить' })).toBeTruthy();
		expect(document.body.textContent).toContain('Толщина линии:');
	});

	it('names the formatting buttons in the provider locale', () => {
		render(CollaborativeEditor);
		expect(screen.getByRole('button', { name: 'Bold' })).toBeTruthy();
		cleanup();
		render(CollaborativeEditor, { context: ru() });
		expect(screen.getByRole('button', { name: 'Полужирный' })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Добавить комментарий' })).toBeTruthy();
	});
});
