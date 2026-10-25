<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { RecipeNodeIcon } from '$stylist/graph/interface/recipe/node-icon';
	import { createNodeIconState } from '$stylist/graph/component/atom/node-icon/state.svelte';

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
		border-radius: var(--radius-2, 0.5rem);
		box-shadow: var(--elevation-icon, 0 2px 4px rgba(0, 0, 0, 0.1));
		transition: all 200ms var(--easing-ease, ease);
	}

	.icon-text {
		line-height: 1;
	}
</style>
