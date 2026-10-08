<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { RecipeIdef0Diagram } from '$stylist/idef-zero/interface/recipe/idef0-diagram';
	import createIdef0DiagramState from './state.svelte';
	import Idef0BlackBox from '$stylist/idef-zero/component/molecule/idef0-black-box/index.svelte';

	let props: RecipeIdef0Diagram & HTMLAttributes<HTMLDivElement> = $props();
	const state = createIdef0DiagramState(() => props);
</script>

<section class={state.containerClasses}>
	{#if props.title}
		<h3 class="idef0-diagram__title">{props.title}</h3>
	{/if}
	<svg
		class={state.svgClasses}
		width={state.width}
		height={state.height}
		role="img"
		aria-label={props.title}
	>
		<Idef0BlackBox
			title={props.title}
			subtitle={props.subtitle}
			inputs={props.inputs}
			outputs={props.outputs}
			width={state.width}
			height={state.height}
		/>
	</svg>
</section>

<style>
	:global(.idef0-diagram) {
		display: inline-flex;
		flex-direction: column;
		gap: 0.75rem;
		border-radius: 0.75rem;
		border: 1px solid var(--color-border-primary);
		background-color: var(--color-background-primary);
		padding: 0.75rem;
	}

	:global(.idef0-diagram__title) {
		font-size: 0.875rem;
		font-weight: var(--font-weight-semibold, 600);
		color: var(--color-text-primary);
	}

	:global(.idef0-diagram__svg) {
		display: block;
		overflow: visible;
	}
</style>
