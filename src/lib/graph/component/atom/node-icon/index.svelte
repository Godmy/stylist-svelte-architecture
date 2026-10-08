<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { RecipeNodeIcon } from '$stylist/graph/interface/recipe/node-icon';
	import { createNodeIconState } from './state.svelte';

	let props: RecipeNodeIcon & HTMLAttributes<HTMLDivElement> = $props();
	const state = createNodeIconState(() => props);
</script>

<div class="node-icon" style={state.iconStyle} role="img" aria-label={state.icon}>
	<span class="icon-text" style={state.iconTextStyle}>{state.icon}</span>
</div>

<style>
	.node-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-icon, 8px);
		box-shadow: var(--elevation-icon, 0 2px 4px rgba(0, 0, 0, 0.1));
		transition: all 200ms var(--easing-standard, ease);
	}

	.icon-text {
		line-height: 1;
	}
</style>
