<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import type { RecipeIdef0Connector } from '$stylist/idef-zero/interface/recipe/idef0-connector';
	import createIdef0ConnectorState from './state.svelte';
	import Idef0PortLabel from '$stylist/idef-zero/component/atom/idef0-port-label/index.svelte';

	let props: RecipeIdef0Connector & SVGAttributes<SVGGElement> = $props();
	const state = createIdef0ConnectorState(() => props);
</script>

<g class={state.groupClasses}>
	<line
		class={state.lineClasses}
		x1={props.x1}
		y1={props.y1}
		x2={props.x2}
		y2={props.y2}
		stroke={state.color}
		stroke-width="1.5"
	/>
	{#if state.showArrow}
		<polygon points={state.arrow} fill={state.color} />
	{/if}
	<Idef0PortLabel
		text={props.label}
		x={state.labelX}
		y={props.y1 - 6}
		anchor={state.labelAnchor}
		color={props.color}
		class={state.labelClasses}
	/>
</g>

<style>
	:global(.idef0-connector__line) {
		stroke: var(--color-text-secondary);
	}

	:global(.idef0-connector__label) {
		fill: var(--color-text-secondary);
		font-size: 0.75rem;
	}
</style>
