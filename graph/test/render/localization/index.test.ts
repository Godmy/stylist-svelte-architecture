import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/svelte';
import GraphTooltip from '$stylist/graph/component/atom/graph-tooltip/index.svelte';
import GraphClusterFilter from '$stylist/graph/component/molecule/graph-cluster-filter/index.svelte';
import type { ZwickyNode } from '$stylist/graph/interface/slot/zwicky-node';
import { ManagerLocaleContext } from '$stylist/localization/class/manager/locale-context';
import { LOCALIZATION_LOCALE_CONTEXT } from '$stylist/localization/const/value/locale-context';

afterEach(cleanup);

const ru = () =>
	new Map([[LOCALIZATION_LOCALE_CONTEXT, { ...ManagerLocaleContext.DEFAULT, locale: 'ru' }]]);

const node = (dependencyIds: string[]) =>
	({
		id: 'n',
		path: 'design-system/html',
		domain: 'html',
		cluster: 'design-system',
		joint: 'component',
		family: 'button',
		level: 'family',
		x: 0,
		y: 0,
		z: 0,
		size: 1,
		color: [0.5, 0.5, 0.5],
		dependencyIds
	}) as ZwickyNode;

describe('graph localization', () => {
	it('counts dependencies with Russian plural forms', () => {
		render(GraphTooltip, {
			props: { node: node(['a', 'b', 'c', 'd', 'e']), x: 0, y: 0 },
			context: ru()
		});
		expect(document.body.textContent).toContain('5 зависимостей');
		cleanup();
		render(GraphTooltip, { props: { node: node([]), x: 0, y: 0 }, context: ru() });
		expect(document.body.textContent).toContain('нет зависимостей');
	});

	it('labels the cluster filter and keeps the title prop', () => {
		render(GraphClusterFilter, { context: ru() });
		expect(screen.getByRole('navigation').getAttribute('aria-label')).toBe('Фильтр кластеров');
		expect(document.body.textContent).toContain('Слой сборки');
		cleanup();
		render(GraphClusterFilter, { props: { title: 'Домены' }, context: ru() });
		expect(document.body.textContent).toContain('Домены');
	});
});
