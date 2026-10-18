<script lang="ts">
	// Render of index.story.ts: the graph data is fetched from the indexation output at mount.
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import ZwickyScene from './index.svelte';
	import type { RecipeZwickyScene } from '$stylist/graph/interface/recipe/zwicky-scene';
	import type { GraphJsonInput } from '$stylist/graph/interface/slot/graph-json-input';

	let args: RecipeZwickyScene = $props();
	let fullData = $state<GraphJsonInput | null>(null);
	let loadError = $state<string | null>(null);

	onMount(async () => {
		try {
			const response = await fetch(`${base}/data/step-2-dependencies.json`);

			if (!response.ok) {
				throw new Error(`Failed to load graph data: ${response.status} ${response.statusText}`);
			}

			fullData = (await response.json()) as GraphJsonInput;
		} catch (error) {
			loadError = error instanceof Error ? error.message : String(error);
		}
	});
</script>

<div style="width:100%;height:100vh;background:#050810">
	{#if fullData}
		<ZwickyScene {...args} data={fullData} style="height:100%" />
	{:else if loadError}
		<p style="margin:0;padding:1rem;color:#fecaca">{loadError}</p>
	{:else}
		<p style="margin:0;padding:1rem;color:#cbd5e1">Loading graph data...</p>
	{/if}
</div>
