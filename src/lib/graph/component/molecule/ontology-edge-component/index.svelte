<script lang="ts">
	import type { RecipeOntologyEdgeComponent } from '$stylist/graph/interface/recipe/ontology-edge-component';
	import createOntologyEdgeComponentState from './state.svelte';

	let props: RecipeOntologyEdgeComponent = $props();
	const state = createOntologyEdgeComponentState(() => props);
</script>

<svg
	class={state.containerClass}
	style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
>
	<defs>
		<marker
			id="arrowhead-subclass"
			markerWidth="10"
			markerHeight="7"
			refX="9"
			refY="3.5"
			orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="var(--color-info-500)" /></marker
		>
		<marker
			id="arrowhead-equivalent"
			markerWidth="10"
			markerHeight="7"
			refX="9"
			refY="3.5"
			orient="auto"
			><polygon points="0 0, 10 3.5, 0 7" fill="var(--color-secondary-500)" /><polygon
				points="0 7, 10 3.5, 0 0"
				fill="var(--color-secondary-500)"
			/></marker
		>
		<marker
			id="arrowhead-disjoint"
			markerWidth="10"
			markerHeight="7"
			refX="9"
			refY="3.5"
			orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="var(--color-danger-500)" /></marker
		>
		<marker
			id="arrowhead-domain-range"
			markerWidth="10"
			markerHeight="7"
			refX="9"
			refY="3.5"
			orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="var(--color-success-500)" /></marker
		>
		<marker
			id="arrowhead-subproperty"
			markerWidth="10"
			markerHeight="7"
			refX="9"
			refY="3.5"
			orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="var(--color-warning-500)" /></marker
		>
		<marker
			id="arrowhead-default"
			markerWidth="10"
			markerHeight="7"
			refX="9"
			refY="3.5"
			orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="var(--color-neutral-400)" /></marker
		>
	</defs>

	<line
		x1={state.startX}
		y1={state.startY}
		x2={state.endX}
		y2={state.endY}
		stroke={state.strokeColor}
		stroke-dasharray={state.strokeDasharray}
		stroke-width="2"
		marker-end={`url(#${state.markerId})`}
	/>

	{#if props.showLabel && props.edge.label}
		<text
			x={(state.startX + state.endX) / 2}
			y={(state.startY + state.endY) / 2 - 10}
			text-anchor="middle"
			class="ontology-edge-component__label"
			fill="currentColor">{props.edge.label}</text
		>
	{/if}

	{#if props.edge.cardinality}
		<text
			x={(state.startX + state.endX) / 2}
			y={(state.startY + state.endY) / 2 + 10}
			text-anchor="middle"
			class="ontology-edge-component__label"
			fill="currentColor">{props.edge.cardinality}</text
		>
	{/if}
</svg>

<style>
	:global(.ontology-edge-component) {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	:global(.ontology-edge-component__label) {
		font-size: 0.75rem;
		font-weight: var(--font-weight-medium, 500);
		fill: currentColor;
	}
</style>
