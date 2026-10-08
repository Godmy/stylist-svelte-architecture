<script lang="ts">
	import type { RecipeGraphEdge } from '$stylist/graph/interface/recipe/graph-edge';
	import createGraphEdgeState from './state.svelte';

	let props: RecipeGraphEdge & { fromNodeId: string; toNodeId: string; label?: string } = $props();

	const state = createGraphEdgeState(() => props);
	const fromNodeId = $derived(props.fromNodeId);
	const toNodeId = $derived(props.toNodeId);
	const edgeLabel = $derived(
		props.label ?? `${fromNodeId} ${state.directed ? '->' : '-'} ${toNodeId}`
	);
	const markerId = $derived(
		`graph-edge-arrow-${fromNodeId}-${toNodeId}`.replace(/[^a-zA-Z0-9_-]/g, '-')
	);
	const visualType = $derived(
		state.type === 'straight'
			? 'straight'
			: state.type === 'polyline' || state.type === 'elbow' || state.type === 'step'
				? 'polyline'
				: 'curve'
	);
	const restProps = $derived(
		(() => {
			const {
				class: _class,
				fromNodeId: _fromNodeId,
				toNodeId: _toNodeId,
				directed: _directed,
				type: _type,
				label: _label,
				active: _active,
				style: _style,
				...rest
			} = props;
			return rest;
		})()
	);

	const STRAIGHT_PATH = 'M 8 28 L 116 28';
	const CURVE_PATH = 'M 8 36 Q 62 4 116 28';
	const POLYLINE_PATH = 'M 8 40 L 44 40 L 44 16 L 116 16';
</script>

<div
	class={`${state.classes} ${props.class ?? ''}`}
	style={state.styles}
	data-edge-type={state.type}
	data-edge-active={state.active}
	aria-label={edgeLabel}
	{...restProps as any}
>
	<svg class="graph-edge__svg" viewBox="0 0 124 56" preserveAspectRatio="none" aria-hidden="true">
		<defs>
			<marker
				id={markerId}
				markerWidth="10"
				markerHeight="10"
				refX="8"
				refY="5"
				orient="auto"
				markerUnits="strokeWidth"
			>
				<path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"></path>
			</marker>
		</defs>

		{#if visualType === 'straight'}
			<path
				class="graph-edge__path"
				d={STRAIGHT_PATH}
				marker-end={state.directed ? `url(#${markerId})` : undefined}
			></path>
		{:else if visualType === 'curve'}
			<path
				class="graph-edge__path graph-edge__path--curve"
				d={CURVE_PATH}
				marker-end={state.directed ? `url(#${markerId})` : undefined}
			></path>
		{:else}
			<path
				class="graph-edge__path graph-edge__path--polyline"
				d={POLYLINE_PATH}
				marker-end={state.directed ? `url(#${markerId})` : undefined}
			></path>
		{/if}
	</svg>
	<span class="graph-edge__label">{edgeLabel}</span>
</div>

<style>
	:global(.graph-edge) {
		position: absolute;
		left: var(--edge-left, 0px);
		top: var(--edge-top, 0px);
		width: var(--edge-length, 120px);
		height: var(--edge-height, 56px);
		transform: translateY(-50%) rotate(var(--edge-angle, 0deg));
		transform-origin: left center;
		display: block;
		color: var(--edge-color, var(--color-text-secondary));
		pointer-events: none;
		overflow: visible;
	}

	:global(.graph-edge__svg) {
		display: block;
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	:global(.graph-edge__path) {
		fill: none;
		stroke: currentColor;
		stroke-width: var(--edge-thickness, 2px);
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: var(--opacity-85);
	}

	:global(.graph-edge__label) {
		display: var(--edge-label-display, inline-flex);
		position: absolute;
		left: 50%;
		top: calc(-0.4rem - var(--edge-label-offset, 0px));
		transform: translateX(-50%) rotate(calc(-1 * var(--edge-angle, 0deg)));
		transform-origin: center;
		padding: var(--spacing-1) var(--spacing-1);
		border-radius: var(--border-radius-full);
		background: color-mix(in srgb, var(--color-background-secondary) 95%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-border-secondary) 80%, transparent);
		color: var(--color-text-primary);
		font-size: var(--font-size-3);
		font-weight: var(--font-weight-semibold);
		line-height: var(--line-height-none);
		white-space: nowrap;
	}

	:global(.graph-edge__path--curve) {
		opacity: var(--opacity-100);
	}

	:global(.graph-edge__path--polyline) {
		stroke-dasharray: 0;
		opacity: var(--opacity-100);
	}

	:global(.graph-edge.directed) {
		color: var(--edge-directed-color, var(--edge-color, var(--color-primary-600)));
	}

	:global(.graph-edge.active) {
		color: var(--edge-active-color, var(--color-text-primary));
	}
</style>
