<script lang="ts">
	import { onMount } from 'svelte';
	import createZwickySceneState from '$stylist/graph/component/organism/zwicky-scene/state.svelte';
	import GraphClusterFilter from '$stylist/graph/component/molecule/graph-cluster-filter/index.svelte';
	import GraphLegend from '$stylist/graph/component/molecule/graph-legend/index.svelte';
	import GraphTooltip from '$stylist/graph/component/atom/graph-tooltip/index.svelte';
	import type { RecipeZwickyScene } from '$stylist/graph/interface/recipe/zwicky-scene';

	import { useFormat } from '$stylist/localization/function/hook/use-format';

	let props: RecipeZwickyScene = $props();
	const state = createZwickySceneState(() => props);
	const format = useFormat();
	let canvasRef: HTMLCanvasElement | null = null;

	onMount(() => {
		state.mount(canvasRef);
		return () => state.destroy();
	});

	const hasFilter = $derived(state.facetFilter.size > 0 || state.domainFilter.size > 0 || state.clusterFilter.size > 0);
</script>

<div class={state.containerClass} data-theme={state.theme} {...state.restProps}>
	<canvas bind:this={canvasRef} class={state.canvasClass}></canvas>
	{#if state.scheme?.filterGroups}
		<button class="zwicky-scene__filter-toggle" aria-expanded={state.panelOpen} onclick={state.togglePanel}>
			{state.panelOpen ? state.text.hideFilters : state.text.showFilters}
			{#if state.activeFacets.length}<span>{state.activeFacets.length}</span>{/if}
		</button>
	{/if}

	<!-- Hover tooltip -->
	<GraphTooltip
		node={state.hoveredNode}
		x={state.hoverPos?.x ?? 0}
		y={state.hoverPos?.y ?? 0}
		containerWidth={state.containerWidth}
		containerHeight={state.containerHeight}
	/>

	<!-- Main info overlay -->
	{#if !state.scheme?.filterGroups || state.panelOpen}
	<div class={state.overlayClass}>
		{#if props.panelHeading !== false}
		<span class="zwicky-scene__badge">{state.text.badge}</span>
		<h2 class="zwicky-scene__title">{state.title}</h2>
		{/if}

		{#if props.panelMetrics !== false}
		<div class="zwicky-scene__metrics">
			<div class="zwicky-scene__metric">
				<span>{format.number(state.scheme?.filterGroups ? state.viewCounts.nodes : state.nodeCount)}
					{#if state.scheme?.filterGroups}<small> / {format.number(state.nodeCount)}</small>{/if}</span>
				<small>{state.text.nodes}</small>
			</div>
			<div class="zwicky-scene__metric">
				<span>{format.number(state.scheme?.filterGroups ? state.viewCounts.edges : state.edgeCount)}
					{#if state.scheme?.filterGroups}<small> / {format.number(state.edgeCount)}</small>{/if}</span>
				<small>{state.text.edges}</small>
			</div>
			<div class="zwicky-scene__metric">
				<span>{state.scheme?.filterGroups ? state.activeFacets.length : state.isLoaded ? 'GPU' : '—'}</span>
				<small>{state.scheme?.filterGroups ? state.text.filters : state.text.render}</small>
			</div>
		</div>
		{/if}

		{#if state.selectedNode}
			<div class="zwicky-scene__selection">
				<small>{state.text.selected}</small>
				{#if state.selectedNode.label}<strong class="zwicky-scene__label"
						>{state.selectedNode.label}</strong
					>{/if}
				{#if !state.scheme?.filterGroups}<code class="zwicky-scene__path">{state.selectedNode.path}</code>{/if}
				<div class="zwicky-scene__tags">
					{#if state.scheme?.filterGroups}
						<span>{state.scheme.clusters.find((group) => group.id === state.selectedNode?.cluster)?.label}</span>
					{:else}
					<span class="zwicky-scene__tag--domain">{state.selectedNode.domain}</span>
					<span>{state.selectedNode.cluster}</span>
					{#if state.selectedNode.joint}<span>{state.selectedNode.joint}</span>{/if}
					{/if}
				</div>
				<span class="zwicky-scene__deps-count"
					>{state.scheme?.filterGroups ? state.viewCounts.edges : state.selectedNode.dependencyIds.length} {state.text.dependencies}</span
				>
				{#if state.scheme?.filterGroups}
					<p class="zwicky-scene__filter-note">{state.text.selectionHint}</p>
					<button class="zwicky-scene__clear-btn" onclick={state.clearSelection}>{state.text.clearSelection}</button>
				{/if}
			</div>
		{/if}

		{#if state.scheme?.filterGroups}
			<div class="zwicky-scene__facets">
				<label class="zwicky-scene__search">
					<span>{state.text.searchFilters}</span>
					<input type="search" value={state.filterQuery} oninput={(event) => state.setFilterQuery(event.currentTarget.value)} />
				</label>
				<div class="zwicky-scene__view-options">
					<label><input type="checkbox" checked={state.showLinks} onchange={state.toggleLinks} />{state.text.showLinks}</label>
					<label><input type="checkbox" checked={state.includeRelated} onchange={state.toggleRelated} />{state.text.related}</label>
				</div>
				{#if hasFilter}
					<p class="zwicky-scene__filter-summary" aria-live="polite">{state.text.matched}: {format.number(state.viewCounts.matched)}
						{#if state.includeRelated} · {state.text.context}: {format.number(state.viewCounts.related)}{/if}</p>
					<div class="zwicky-scene__active-filters">
						{#each state.activeFacets as item (item.group + ':' + item.id)}
							<button onclick={() => state.toggleFacet(item.group, item.id)}>{item.label} ×</button>
						{/each}
					</div>
					<button class="zwicky-scene__clear-btn" onclick={state.clearFilter}>{state.text.clear}</button>
				{:else}
					<p class="zwicky-scene__filter-note">{state.text.filtersEmpty}</p>
				{/if}
				{#if hasFilter && state.viewCounts.matched === 0}<p role="status" class="zwicky-scene__filter-note">{state.text.empty}</p>{/if}
				<p class="zwicky-scene__filter-note">{state.text.filterHelp}</p>
				{#each state.filterGroups as group (group.id)}
					<details class="zwicky-scene__facet-group" data-filter-group={group.id} open={group.id === 'sections' || !!state.filterQuery.trim()}>
						<summary>{group.label} <span>{group.options.length}</span>
							{#if state.facetFilter.get(group.id)?.size}<strong> · {state.facetFilter.get(group.id)?.size}</strong>{/if}</summary>
						<div class="zwicky-scene__facet-options">
							{#each group.options as option (option.id)}
								<label class:active={state.facetFilter.get(group.id)?.has(option.id)}>
									<input type="checkbox" checked={state.facetFilter.get(group.id)?.has(option.id) ?? false} onchange={() => state.toggleFacet(group.id, option.id)} />
									<span>{option.label}</span><small>{option.nodeIds.length}</small>
								</label>
							{/each}
						</div>
					</details>
				{/each}
				{#if state.filterGroups.length === 0}<p class="zwicky-scene__filter-note">{state.text.noOptions}</p>{/if}
			</div>
		{:else}
		<!-- Cluster filter pills (primary) -->
		<div class="zwicky-scene__panel">
			<GraphClusterFilter
				activeClusters={state.clusterFilter}
				onClusterClick={state.toggleCluster}
				clusters={state.scheme?.clusters}
				title={state.text.clusters}
			/>
		</div>

		<!-- Domain legend (secondary) -->
		<div class="zwicky-scene__panel">
			<GraphLegend
				activeDomains={state.domainFilter}
				onDomainClick={state.toggleDomain}
				domains={state.scheme?.domains}
				title={state.text.domains}
			/>
		</div>

		{#if hasFilter}
			<button class="zwicky-scene__clear-btn" onclick={state.clearFilter}>
				{state.text.clear}
			</button>
		{/if}
		{/if}

		<p class="zwicky-scene__hint">{state.text.hint}</p>
	</div>
	{/if}
</div>

<style>
	.zwicky-scene__filter-toggle {
		position: absolute; top: 1rem; right: 1rem; z-index: 2;
		border: 1px solid #a2b8b2; border-radius: 0.5rem; padding: 0.6rem 0.8rem;
		background: #fff; color: #183b35; cursor: pointer; font: inherit; font-size: 0.8rem;
	}
	.zwicky-scene__facets { display: grid; gap: 0.7rem; }
	.zwicky-scene__metric > span > small { display: inline; }
	.zwicky-scene__search { display: grid; gap: 0.3rem; font-size: 0.75rem; }
	.zwicky-scene__search input { min-width: 0; padding: 0.6rem; border-radius: 0.4rem; border: 1px solid #a2b8b2; background: #fff; color: #183b35; font: inherit; }
	.zwicky-scene__view-options { display: grid; gap: 0.4rem; font-size: 0.75rem; }
	.zwicky-scene__view-options label { display: flex; align-items: center; gap: 0.45rem; cursor: pointer; }
	.zwicky-scene__facets input[type='checkbox'] { accent-color: #16877b; flex: 0 0 auto; width: 1rem; height: 1rem; }
	.zwicky-scene__filter-note { margin: 0; font-size: 0.72rem; line-height: 1.5; opacity: 0.8; }
	.zwicky-scene__filter-summary { margin: 0; font-size: 0.75rem; font-weight: 650; }
	.zwicky-scene__active-filters { display: flex; flex-wrap: wrap; gap: 0.3rem; }
	.zwicky-scene__active-filters button { border: 1px solid #8dbbb0; border-radius: 1rem; padding: 0.3rem 0.5rem; background: #e8f5ef; color: #183b35; cursor: pointer; font: inherit; font-size: 0.7rem; }
	.zwicky-scene__facet-group { border-top: 1px solid #93b5ac50; padding-top: 0.5rem; }
	.zwicky-scene__facet-group summary { cursor: pointer; font-weight: 650; font-size: 0.8rem; }
	.zwicky-scene__facet-group summary span { opacity: 0.6; font-size: 0.7rem; }
	.zwicky-scene__facet-options { display: grid; gap: 0.15rem; margin-top: 0.4rem; }
	.zwicky-scene__facet-options label { display: flex; gap: 0.45rem; align-items: center; padding: 0.35rem; border-radius: 0.35rem; cursor: pointer; font-size: 0.75rem; }
	.zwicky-scene__facet-options label:hover, .zwicky-scene__facet-options label.active { background: #16877b18; }
	.zwicky-scene__facet-options label span { flex: 1; }
	.zwicky-scene__facet-options small { opacity: 0.65; }
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

	.zwicky-scene__label {
		display: block;
		font-weight: 600;
		line-height: 1.3;
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

	/* Light theme: warm paper canvas, white panels, dark ink; nested panels follow. */
	.zwicky-scene[data-theme='light'] {
		background:
			radial-gradient(ellipse at 20% 15%, rgb(120 170 210 / 16%), transparent 40%),
			radial-gradient(ellipse at 80% 85%, rgb(200 160 110 / 14%), transparent 38%),
			linear-gradient(145deg, #f8f6f1, #f3f0ea 55%, #efeae2);
	}
	[data-theme='light'] .zwicky-scene__overlay {
		background: rgb(255 255 255 / 90%);
		border-color: rgb(23 32 51 / 10%);
		color: #1d2633;
		box-shadow: 0 1rem 2.5rem rgb(23 32 51 / 12%);
		scrollbar-color: rgb(23 32 51 / 18%) transparent;
	}
	[data-theme='light'] .zwicky-scene__badge {
		border-color: rgb(20 130 100 / 30%);
		color: #157a5f;
	}
	[data-theme='light'] .zwicky-scene__title,
	[data-theme='light'] .zwicky-scene__metric span {
		color: #172033;
	}
	[data-theme='light'] .zwicky-scene__metric,
	[data-theme='light'] .zwicky-scene__selection {
		border-color: rgb(23 32 51 / 8%);
		background: rgb(23 32 51 / 3%);
	}
	[data-theme='light'] .zwicky-scene__metric small,
	[data-theme='light'] .zwicky-scene__selection > small,
	[data-theme='light'] .zwicky-scene__deps-count,
	[data-theme='light'] .zwicky-scene__hint {
		color: #5f6b7a;
	}
	[data-theme='light'] .zwicky-scene__path {
		color: #157a5f;
	}
	[data-theme='light'] .zwicky-scene__tags span {
		background: rgb(23 32 51 / 6%);
		color: #3a4656;
	}
	[data-theme='light'] .zwicky-scene__tag--domain {
		border-color: rgb(40 110 200 / 25%);
		color: #2563a8 !important;
	}
	[data-theme='light'] .zwicky-scene__clear-btn {
		color: #b42323;
	}
	[data-theme='light'] :global(.graph-legend__title),
	[data-theme='light'] :global(.graph-cluster-filter__label) {
		color: #5f6b7a;
	}
	[data-theme='light'] :global(.graph-legend) {
		scrollbar-color: rgb(23 32 51 / 18%) transparent;
	}
	[data-theme='light'] :global(.graph-legend__item:hover) {
		background: rgb(23 32 51 / 5%);
	}
	[data-theme='light'] :global(.graph-legend__item--active) {
		background: rgb(23 32 51 / 9%);
	}
	[data-theme='light'] :global(.graph-dot__label) {
		color: #2b3644;
	}
	[data-theme='light'] :global(.graph-cluster-filter__pill) {
		border-color: rgb(23 32 51 / 12%);
		background: rgb(255 255 255 / 70%);
		color: #2b3644;
	}
	[data-theme='light'] :global(.graph-cluster-filter__pill:hover),
	[data-theme='light'] :global(.graph-cluster-filter__pill--active) {
		color: #172033;
	}
	[data-theme='light'] :global(.graph-tooltip) {
		background: rgb(255 255 255 / 96%);
		border-color: rgb(23 32 51 / 12%);
		color: #2b3644;
		box-shadow: 0 0.75rem 2rem rgb(23 32 51 / 16%);
	}
	[data-theme='light'] :global(.graph-tooltip__family) {
		color: #172033;
	}
	[data-theme='light'] :global(.graph-tooltip__path) {
		color: #157a5f;
	}
	[data-theme='light'] :global(.graph-tooltip__chip) {
		background: rgb(23 32 51 / 5%);
		border-color: rgb(23 32 51 / 8%);
		color: #3a4656;
	}
	[data-theme='light'] :global(.graph-tooltip__chip--domain) {
		color: #2563a8;
	}
	[data-theme='light'] :global(.graph-tooltip__deps-label),
	[data-theme='light'] :global(.graph-tooltip__dep-item),
	[data-theme='light'] :global(.graph-tooltip__dep-more),
	[data-theme='light'] :global(.graph-tooltip__no-deps) {
		color: #5f6b7a;
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
