<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import GraphLegend from './index.svelte';
	import type { RecipeGraphLegend } from '$stylist/graph/interface/recipe/graph-legend';

	// Render of index.story.ts: the active domains are local state toggled by onDomainClick.
	let args: RecipeGraphLegend = $props();
	const activeDomains = new SvelteSet(['graph']);

	function toggle(domain: string): void {
		if (activeDomains.has(domain)) activeDomains.delete(domain);
		else activeDomains.add(domain);
	}
</script>

<div class="graph-legend-story">
	<GraphLegend {...args} {activeDomains} onDomainClick={toggle} />
	<p class="graph-legend-story__state">
		active: {activeDomains.size ? [...activeDomains].join(', ') : 'none'}
	</p>
</div>

<style>
	.graph-legend-story {
		display: grid;
		gap: 0.75rem;
		width: 14rem;
		padding: 1rem;
		border-radius: 0.5rem;
		background: #050810;
	}

	.graph-legend-story__state {
		margin: 0;
		font-size: 0.72rem;
		color: rgb(126 148 172);
	}
</style>
