<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { RecipeIdef0PortLabel } from '$stylist/idef-zero/interface/recipe/idef0-port-label';
	import createIdef0PortLabelState from './state.svelte';

	let props: RecipeIdef0PortLabel & HTMLAttributes<HTMLSpanElement> = $props();
	const state = createIdef0PortLabelState(() => props);
</script>

<text
	class={state.classes}
	x={props.x}
	y={props.y}
	text-anchor={props.anchor ?? 'middle'}
	fill={props.color ?? 'var(--color-text-secondary)'}
>
	{props.text}
</text>

<style>
	:global(.idef0-port-label) {
		fill: var(--color-text-secondary);
		font-size: 0.75rem;
		font-weight: var(--font-weight-medium, 500);
	}
</style>
