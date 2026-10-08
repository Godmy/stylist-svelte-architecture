<script lang="ts">
	import type { RecipeGraphvizDirectedEdge } from '$stylist/graph/interface/recipe/graphviz-directed-edge';
	import createGraphvizDirectedEdgeState from './state.svelte';

	let props: RecipeGraphvizDirectedEdge = $props();
	const state = createGraphvizDirectedEdgeState(() => props);
</script>

<svg class={state.rootClass} style="position: absolute; width: 100%; height: 100%;">
	<defs>
		<marker
			id={`arrowhead-${state.id}`}
			markerWidth="10"
			markerHeight="7"
			refX="9"
			refY="3.5"
			orient="auto"
		>
			<polygon points="0 0, 10 3.5, 0 7" fill={state.color} />
		</marker>
	</defs>

	<line
		x1={state.sourceX}
		y1={state.sourceY}
		x2={state.targetX}
		y2={state.targetY}
		stroke={state.color}
		stroke-width={state.width}
		stroke-dasharray={state.dashArray}
		marker-end={`url(#arrowhead-${state.id})`}
	/>

	{#if state.text}
		<text
			x={state.labelX}
			y={state.labelY}
			text-anchor="middle"
			fill={state.color}
			font-size="12"
			class="graphviz-directed-edge__label">{state.text}</text
		>
	{/if}
</svg>

<style>
	:global(.graphviz-directed-edge) {
		position: absolute;
		inset: 0;
	}

	:global(.graphviz-directed-edge__label) {
		pointer-events: none;
		user-select: none;
	}
</style>
