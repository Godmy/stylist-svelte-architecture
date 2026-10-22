<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import GraphClusterFilter from '$stylist/graph/component/molecule/graph-cluster-filter/index.svelte';
	import type { RecipeGraphClusterFilter } from '$stylist/graph/interface/recipe/graph-cluster-filter';

	// Render of index.story.ts: the active layers are local state toggled by onClusterClick.
	let args: RecipeGraphClusterFilter = $props();
	const activeClusters = new SvelteSet(['component']);

	function toggle(cluster: string): void {
		if (activeClusters.has(cluster)) activeClusters.delete(cluster);
		else activeClusters.add(cluster);
	}
</script>

<div class="graph-cluster-filter-story">
	<GraphClusterFilter {...args} {activeClusters} onClusterClick={toggle} />
	<p class="graph-cluster-filter-story__state">
		active: {activeClusters.size ? [...activeClusters].join(', ') : 'none'}
	</p>
</div>

<style>
	.graph-cluster-filter-story {
		display: grid;
		gap: 0.75rem;
		width: 14rem;
		padding: 1rem;
		border-radius: 0.5rem;
		background: #050810;
	}

	.graph-cluster-filter-story__state {
		margin: 0;
		font-size: 0.72rem;
		color: rgb(126 148 172);
	}
</style>
