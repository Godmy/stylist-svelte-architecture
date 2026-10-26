import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/svelte';
import ShaderField from '$stylist/webgl/component/page/shader-field/index.svelte';
import SceneLauncher from '$stylist/webgl/component/organism/scene-launcher/index.svelte';
import { ManagerLocaleContext } from '$stylist/localization/class/manager/locale-context';
import { LOCALIZATION_LOCALE_CONTEXT } from '$stylist/localization/const/value/locale-context';

afterEach(cleanup);

const ru = () =>
	new Map([[LOCALIZATION_LOCALE_CONTEXT, { ...ManagerLocaleContext.DEFAULT, locale: 'ru' }]]);

describe('webgl localization', () => {
	it('uses English as the base text of the former Russian shader field', () => {
		render(ShaderField);
		expect(document.body.textContent).toContain('Field settings');
		cleanup();
		render(ShaderField, { context: ru() });
		expect(document.body.textContent).toContain('Параметры поля');
		expect(document.body.querySelector('.c-shader-field')?.getAttribute('aria-label')).toBe(
			'Световое поле'
		);
	});

	it('translates the scene launcher', () => {
		render(SceneLauncher, { context: ru() });
		expect(screen.getByRole('button', { name: 'Открыть круги' })).toBeTruthy();
	});
});
