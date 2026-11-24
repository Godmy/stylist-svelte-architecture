import { ZWICKY_CLUSTER_ORDER } from '$stylist/graph/const/array/zwicky-cluster-order';
import { ZWICKY_CLUSTER_COLOR } from '$stylist/graph/const/record/zwicky-cluster-color';
import { GRAPH_GRAPH_CLUSTER_FILTER_MESSAGE } from '$stylist/graph/const/record/graph-cluster-filter-message';
import { useMessage } from '$stylist/localization/function/hook/use-message';
import type { RecipeGraphClusterFilter } from '$stylist/graph/interface/recipe/graph-cluster-filter';
/** Reactive behavior of graph-cluster-filter; props are read lazily when needed. */
export function createGraphClusterFilterComponentState(
	getProps: () => Pick<RecipeGraphClusterFilter, 'clusters'>
) {
	const props = $derived(getProps());
	const t = useMessage('graph-cluster-filter', GRAPH_GRAPH_CLUSTER_FILTER_MESSAGE);
	// Own clusters, or the library's assembly layers in their fixed order.
	const entries = $derived(
		props['clusters'] ??
			ZWICKY_CLUSTER_ORDER.map((cluster) => ({
				id: cluster,
				label: cluster,
				color: ZWICKY_CLUSTER_COLOR[cluster] ?? ([0.5, 0.5, 0.5] as const)
			}))
	);
	const hex = (v: number) =>
		Math.round(v * 255)
			.toString(16)
			.padStart(2, '0');
	function toHex(c: readonly [number, number, number]) {
		return `#${hex(c[0])}${hex(c[1])}${hex(c[2])}`;
	}
	return {
		get t(): typeof t {
			return t;
		},
		get entries(): typeof entries {
			return entries;
		},
		get toHex(): typeof toHex {
			return toHex;
		}
	};
}
export default createGraphClusterFilterComponentState;
