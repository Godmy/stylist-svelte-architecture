import { ZWICKY_DOMAIN_COLOR } from '$stylist/graph/const/record/zwicky-domain-color';

import type { RecipeGraphLegend } from '$stylist/graph/interface/recipe/graph-legend';
/** Reactive behavior of graph-legend; props are read lazily when needed. */
export function createGraphLegendComponentState(
	getProps: () => Pick<RecipeGraphLegend, 'domains'>
) {
	const props = $derived(getProps());
	// Own domains, or every library domain with its colour.
	const entries = $derived(
		props['domains'] ??
			Object.entries(ZWICKY_DOMAIN_COLOR).map(([id, color]) => ({ id, label: id, color }))
	);
	return {
		get entries(): typeof entries {
			return entries;
		}
	};
}
export default createGraphLegendComponentState;
