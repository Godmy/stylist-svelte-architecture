<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import type { RecipeIdef0FunctionBox as Idef0FunctionBoxProps } from '$stylist/idef-zero/interface/recipe/idef0-function-box';
	import createIdef0FunctionBoxState from './state.svelte';

	let props: Idef0FunctionBoxProps & SVGAttributes<SVGGElement> = $props();
	const state = createIdef0FunctionBoxState(() => props);
</script>

<g class={state.groupClasses}>
	<rect
		class={state.rectClasses}
		x={state.x}
		y={state.y}
		width={state.width}
		height={state.height}
		rx="10"
		ry="10"
		stroke-width="1.5"
	/>
	<text class={state.titleClasses} x={state.centerX} y={state.titleY} text-anchor="middle">
		{props.title}
	</text>
	{#if props.subtitle}
		<text class={state.subtitleClasses} x={state.centerX} y={state.subtitleY} text-anchor="middle">
			{props.subtitle}
		</text>
	{/if}
</g>

<style>
	:global(.idef0-function-box__rect) {
		fill: var(--color-background-secondary);
		stroke: var(--color-border-primary);
	}

	:global(.idef0-function-box__title) {
		fill: var(--color-text-primary);
		font-size: 0.875rem;
		font-weight: var(--font-weight-semibold, 600);
	}

	:global(.idef0-function-box__subtitle) {
		fill: var(--color-text-secondary);
		font-size: 0.75rem;
	}
</style>
