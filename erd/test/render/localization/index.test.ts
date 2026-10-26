import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/svelte';
import SchemaText from '$stylist/erd/component/organism/schema-text/index.svelte';
import SchemaHeader from '$stylist/erd/component/organism/schema-header/index.svelte';
import { schemaTextToDocument } from '$stylist/erd/function/transform/schema-text-to-document';
import { ManagerLocaleContext } from '$stylist/localization/class/manager/locale-context';
import { LOCALIZATION_LOCALE_CONTEXT } from '$stylist/localization/const/value/locale-context';

afterEach(cleanup);

const ru = () =>
	new Map([[LOCALIZATION_LOCALE_CONTEXT, { ...ManagerLocaleContext.DEFAULT, locale: 'ru' }]]);

describe('erd localization', () => {
	it('shows parser errors in the provider locale and English by default', () => {
		expect(schemaTextToDocument('}').errors[0]).toBe('Line 1: closing brace without a table.');
		render(SchemaText, { props: { value: '}' }, context: ru() });
		expect(document.body.textContent).toContain('Строка 1: закрывающая скобка без таблицы.');
	});

	it('translates the header stats with plural forms and the toolbar', () => {
		render(SchemaHeader, {
			props: { stats: { tables: 5, relations: 2, errors: 1 } },
			context: ru()
		});
		const text = document.body.textContent ?? '';
		expect(text).toContain('Схема');
		expect(text).toContain('5 таблиц');
		expect(text).toContain('2 связи');
		expect(text).toContain('1 ошибка');
		expect(screen.getByRole('button', { name: 'Увеличить' })).toBeTruthy();
	});
});
