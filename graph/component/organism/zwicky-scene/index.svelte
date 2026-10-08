<script lang="ts">
	import { onMount } from 'svelte';
	import createZwickySceneState from './state.svelte';
	import GraphClusterFilter from '$stylist/graph/component/molecule/graph-cluster-filter/index.svelte';
	import GraphLegend from '$stylist/graph/component/molecule/graph-legend/index.svelte';
	import GraphTooltip from '$stylist/graph/component/atom/graph-tooltip/index.svelte';
	import type { RecipeZwickyScene } from '$stylist/graph/interface/recipe/zwicky-scene';

	let props: RecipeZwickyScene = $props();
	const state = createZwickySceneState(() => props);
	let canvasRef: HTMLCanvasElement | null = null;

	onMount(() => {
		state.mount(canvasRef);
		return () => state.destroy();
	});

	const hasFilter = $derived(state.domainFilter.size > 0 || state.clusterFilter.size > 0);
</script>

<div class={state.containerClass} {...state.restProps}>
	<canvas bind:this={canvasRef} class={state.canvasClass}></canvas>

	<!-- Hover tooltip -->
	<GraphTooltip
		node={state.hoveredNode}
		x={state.hoverPos?.x ?? 0}
		y={state.hoverPos?.y ?? 0}
		containerWidth={state.containerWidth}
		containerHeight={state.containerHeight}
	/>

	<!-- Main info overlay -->
	<div class={state.overlayClass}>
		<span class="zwicky-scene__badge">WebGL2 · Instanced</span>
		<h2 class="zwicky-scene__title">{state.title}</h2>

		<div class="zwicky-scene__metrics">
			<div class="zwicky-scene__metric">
				<span>{state.nodeCount.toLocaleString()}</span>
				<small>nodes</small>
			</div>
			<div class="zwicky-scene__metric">
				<span>{state.edgeCount.toLocaleString()}</span>
				<small>edges</small>
			</div>
			<div class="zwicky-scene__metric">
				<span>{state.isLoaded ? 'GPU' : '—'}</span>
				<small>render</small>
			</div>
		</div>

		{#if state.selectedNode}
			<div class="zwicky-scene__selection">
				<small>selected</small>
				<code class="zwicky-scene__path">{state.selectedNode.path}</code>
				<div class="zwicky-scene__tags">
					<span class="zwicky-scene__tag--domain">{state.selectedNode.domain}</span>
					<span>{state.selectedNode.cluster}</span>
					{#if state.selectedNode.joint}<span>{state.selectedNode.joint}</span>{/if}
				</div>
				<span class="zwicky-scene__deps-count">{state.selectedNode.dependencyIds.length} deps</span>
			</div>
		{/if}

		<!-- Cluster filter pills (primary) -->
		<div class="zwicky-scene__panel">
			<GraphClusterFilter
				activeClusters={state.clusterFilter}
				onClusterClick={state.toggleCluster}
			/>
		</div>

		<!-- Domain legend (secondary) -->
		<div class="zwicky-scene__panel">
			<GraphLegend activeDomains={state.domainFilter} onDomainClick={state.toggleDomain} />
		</div>

		{#if hasFilter}
			<button class="zwicky-scene__clear-btn" onclick={state.clearFilter}>
				✕ clear all filters
			</button>
		{/if}

		<p class="zwicky-scene__hint">Drag · Wheel · F fit · Click select · Pills filter</p>
	</div>
</div>

<style>
	.zwicky-scene {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 640px;
		overflow: hidden;
		background:
			radial-gradient(ellipse at 20% 15%, rgb(18 56 88 / 40%), transparent 40%),
			radial-gradient(ellipse at 80% 85%, rgb(64 22 88 / 30%), transparent 38%),
			radial-gradient(ellipse at 60% 10%, rgb(22 80 56 / 22%), transparent 32%),
			linear-gradient(145deg, #04080f, #0c0e18 55%, #100c14);
	}

	.zwicky-scene__canvas {
		width: 100%;
		height: 100%;
		display: block;
		min-height: inherit;
	}

	.zwicky-scene__overlay {
		position: absolute;
		top: 1rem;
		left: 1rem;
		width: min(20rem, calc(100vw - 2rem));
		background: rgb(6 9 14 / 86%);
		border: 1px solid rgb(255 255 255 / 9%);
		color: rgb(225 235 248);
		padding: 0.9rem 1rem;
		border-radius: 0.6rem;
		box-shadow:
			0 0 0 1px rgb(255 255 255 / 4%),
			0 2rem 5rem rgb(0 0 0 / 42%);
		font-family:
			Inter,
			ui-sans-serif,
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 0.85rem;
		backdrop-filter: blur(20px);
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		max-height: calc(100% - 2rem);
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: rgb(255 255 255 / 12%) transparent;
	}

	.zwicky-scene__badge {
		display: block;
		width: fit-content;
		padding: 0.16rem 0.5rem;
		border-radius: 999px;
		border: 1px solid rgb(100 220 180 / 25%);
		color: rgb(120 230 190);
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.zwicky-scene__title {
		margin: 0;
		font-size: 1.2rem;
		font-weight: 660;
		line-height: 1.15;
		color: rgb(240 248 255);
	}

	.zwicky-scene__metrics {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.45rem;
	}

	.zwicky-scene__metric {
		padding: 0.5rem 0.6rem;
		border: 1px solid rgb(255 255 255 / 8%);
		border-radius: 0.4rem;
		background: rgb(255 255 255 / 4%);
	}

	.zwicky-scene__metric span {
		display: block;
		font-size: 0.95rem;
		font-weight: 700;
		color: rgb(240 250 255);
	}

	.zwicky-scene__metric small {
		display: block;
		margin-top: 0.1rem;
		font-size: 0.64rem;
		text-transform: uppercase;
		color: rgb(155 175 200);
	}

	.zwicky-scene__selection {
		padding: 0.55rem 0.65rem;
		border: 1px solid rgb(255 255 255 / 8%);
		border-radius: 0.4rem;
		background: rgb(255 255 255 / 4%);
		display: flex;
		flex-direction: column;
		gap: 0.28rem;
	}

	.zwicky-scene__selection > small {
		font-size: 0.64rem;
		text-transform: uppercase;
		color: rgb(155 175 200);
	}

	.zwicky-scene__path {
		font-family: 'Fira Code', ui-monospace, monospace;
		font-size: 0.64rem;
		color: rgb(140 220 200);
		word-break: break-all;
	}

	.zwicky-scene__tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.22rem;
	}

	.zwicky-scene__tags span {
		padding: 0.1rem 0.38rem;
		border-radius: 999px;
		background: rgb(255 255 255 / 8%);
		font-size: 0.63rem;
		color: rgb(190 210 230);
	}

	.zwicky-scene__tag--domain {
		border: 1px solid rgb(100 180 255 / 20%);
		color: rgb(140 200 255) !important;
	}

	.zwicky-scene__deps-count {
		font-size: 0.65rem;
		color: rgb(140 165 195);
	}

	/* Scrollable sub-panels */
	.zwicky-scene__panel {
		pointer-events: all;
		border-top: 1px solid rgb(255 255 255 / 6%);
		padding-top: 0.55rem;
	}

	.zwicky-scene__clear-btn {
		all: unset;
		cursor: pointer;
		display: block;
		text-align: center;
		padding: 0.3rem 0.6rem;
		border-radius: 0.35rem;
		border: 1px solid rgb(220 80 80 / 28%);
		background: rgb(220 80 80 / 8%);
		color: rgb(230 130 130);
		font-size: 0.7rem;
		transition: background 0.1s;
		pointer-events: all;
	}

	.zwicky-scene__clear-btn:hover {
		background: rgb(220 80 80 / 16%);
	}

	.zwicky-scene__hint {
		margin: 0;
		font-size: 0.6rem;
		color: rgb(90 110 135);
		line-height: 1.5;
		border-top: 1px solid rgb(255 255 255 / 5%);
		padding-top: 0.45rem;
	}

	@media (max-width: 640px) {
		.zwicky-scene {
			min-height: 520px;
		}
		.zwicky-scene__overlay {
			right: 0.75rem;
			left: 0.75rem;
			width: auto;
		}
	}
</style>
