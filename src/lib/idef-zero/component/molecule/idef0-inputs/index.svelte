<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { RecipeIdef0Io } from '$stylist/idef-zero/interface/recipe/idef0-io';
	import createIdef0InputsState from './state.svelte';
	import Idef0Connector from '$stylist/idef-zero/component/atom/idef0-connector/index.svelte';

	let props: RecipeIdef0Io & HTMLAttributes<HTMLDivElement> = $props();
	const state = createIdef0InputsState(() => props);
</script>

<g>
	{#each state.positions as item (item.port.id)}
		<Idef0Connector
			label={item.port.label ?? ''}
			direction="input"
			x1={state.startX}
			y1={item.y}
			x2={props.boxX}
			y2={item.y}
			color={(item.port as { color?: string }).color}
		/>
	{/each}
</g>

<style>
</style>
