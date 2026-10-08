<script lang="ts">
	import type { RecipeNodeConnection } from '$stylist/workspace/interface/recipe/node-connection';
	import createNodeConnectionState from './state.svelte';

	let props: RecipeNodeConnection = $props();
	const state = createNodeConnectionState(() => props);
</script>

<g class={state.classes} data-connection-id={props.id}>
	{#if state.showArrow}
		<defs>
			<marker
				id={`arrow-${props.id}`}
				markerWidth={state.arrowSize}
				markerHeight={state.arrowSize * 0.7}
				refX={state.arrowSize * 0.9}
				refY={state.arrowSize * 0.35}
				orient="auto"
			>
				<polygon
					points={`0 0, ${state.arrowSize} ${state.arrowSize * 0.35}, 0 ${state.arrowSize * 0.7}`}
					fill={state.activeColor}
				/>
			</marker>
		</defs>
	{/if}

	<path
		d={state.pathData.path}
		class="node-connection__path"
		fill="none"
		stroke={state.styles.stroke}
		stroke-width={state.styles['stroke-width']}
		stroke-linecap="round"
		{...state.showArrow ? { 'marker-end': `url(#arrow-${props.id})` } : {}}
	>
		{#if state.animated}
			<animate
				attributeName="stroke-dasharray"
				from="0, 1000"
				to="1000, 0"
				dur="1.5s"
				repeatCount="indefinite"
			/>
		{/if}
	</path>

	<path
		d={state.pathData.path}
		class="node-connection__hit-area"
		fill="none"
		stroke="transparent"
		stroke-width="calc(var(--connection-stroke-width, 2px) + 10px)"
		style="pointer-events: stroke;"
	/>

	{#if props.label}
		<text
			x={state.pathData.midPoint.x}
			y={state.pathData.midPoint.y}
			text-anchor="middle"
			dominant-baseline="middle"
			class="node-connection__label"
			fill="var(--color-text-primary)"
			font-size="10"
			font-weight="500"
		>
			{props.label}
		</text>
	{/if}
</g>

<style>
	.node-connection {
		cursor: pointer;
		transition: opacity 120ms ease;
	}
	.node-connection__path {
		transition:
			stroke 120ms ease,
			stroke-width 120ms ease;
	}
	.node-connection--animated .node-connection__path {
		stroke-dasharray: 10, 5;
	}
	.node-connection--active .node-connection__path {
		stroke: var(--connection-active-color, var(--color-primary-500));
		stroke-width: calc(var(--connection-stroke-width, 2px) + 2px);
		filter: drop-shadow(0 0 4px var(--connection-active-color, var(--color-primary-500)));
	}
	.node-connection:hover .node-connection__path {
		stroke: var(--connection-hover-color, var(--color-primary-400));
	}
	.node-connection__hit-area {
		pointer-events: stroke;
		cursor: pointer;
	}
	.node-connection__label {
		user-select: none;
		pointer-events: none;
	}
	.node-connection--dashed .node-connection__path {
		stroke-dasharray: 5, 5;
	}
	.node-connection--dotted .node-connection__path {
		stroke-dasharray: 2, 4;
	}
</style>
