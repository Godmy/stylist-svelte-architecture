<script lang="ts">
	import type { RecipeStage } from '$stylist/workspace/interface/recipe/stage';
	import createStageState from './state.svelte';

	let props: RecipeStage = $props();
	const state = createStageState(() => props);
</script>

<div class={state.classes} style={state.worldStyle} {...state.restProps}>
	<div class={state.worldClass} style={state.transformStyle}>
		{#if props.children}{#if props.children}{@render props.children()}{/if}{/if}
	</div>
</div>

<style>
	.stage {
		position: relative;
		width: var(--world-width, 100%);
		height: var(--world-height, 100%);
		overflow: hidden;
	}

	.world {
		position: absolute;
		top: 0;
		left: 0;
		width: var(--world-width, 100%);
		height: var(--world-height, 100%);
		transform-origin: 0 0;
		will-change: transform;
	}
</style>
