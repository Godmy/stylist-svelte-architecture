<script lang="ts">
	import { untrack } from 'svelte';
	import SchemaDependency from '$stylist/erd/component/atom/schema-dependency/index.svelte';
	import SchemaTable from '$stylist/erd/component/molecule/schema-table/index.svelte';
	import type { RecipeErdSchemaView } from '$stylist/erd/interface/recipe/erd-schema-view';
	import createSchemaViewState from './state.svelte';

	let props: RecipeErdSchemaView = $props();

	// `props` itself is a stable reactive proxy -- handing the reference to
	// the factory doesn't need to re-run when a prop changes, only the
	// $derived reads *inside* createSchemaViewState do. untrack() says
	// exactly that instead of tripping "did you mean a closure?"
	// (state_referenced_locally).
	const state = createSchemaViewState(() => props);

	export function saveLayout(): void {
		state.saveLayout();
	}

	export function resetLayout(): void {
		state.resetLayout();
	}

	let canvasElement: HTMLDivElement | undefined;
</script>

<svelte:window
	onclick={(event) => {
		// Clicking empty canvas space clears a pinned focus -- kept as a
		// window-level listener (rather than an onclick + role="button" on
		// the canvas div) because the canvas isn't semantically a control:
		// it's the whole diagram surface, and giving a giant background
		// element a button role/tabindex would be worse for a11y than
		// better, not just a lint workaround.
		if (canvasElement && event.target === canvasElement) {
			state.clearFocus();
		}
	}}
/>

<section class={`schema-view ${state.compact ? 'schema-view--compact' : ''}`}>
	<div
		class="schema-view__scaled-space"
		style={`width:${state.scaledCanvasSize.width}px; height:${state.scaledCanvasSize.height}px;`}
	>
		<div
			bind:this={canvasElement}
			class="schema-view__canvas"
			style={`width:${state.canvasSize.width}px; height:${state.canvasSize.height}px; transform: scale(${state.zoom});`}
		>
			{#if state.clusterPanels.length > 0}
				<div class="schema-view__cluster-layer">
					{#each state.clusterPanels as panel (panel.domain)}
						<div
							class="schema-view__cluster-panel"
							style={`left:${panel.x}px; top:${panel.y}px; width:${panel.width}px; height:${panel.height}px; --cluster-color:${panel.color};`}
						>
							<button
								type="button"
								class={`schema-view__cluster-label ${state.draggable ? 'schema-view__cluster-label--draggable' : ''} ${state.draggedClusterDomain === panel.domain ? 'schema-view__cluster-label--dragging' : ''}`}
								aria-label={`Drag the ${panel.label} domain`}
								onpointerdown={(event) => state.startClusterDrag(event, panel.domain)}
								onpointermove={(event) => state.moveClusterDrag(event, panel.domain)}
								onpointerup={(event) => state.stopClusterDrag(event, panel.domain)}
								onpointercancel={(event) => state.stopClusterDrag(event, panel.domain)}
							>
								{panel.label}
							</button>
						</div>
					{/each}
				</div>
			{/if}

			{#if state.showRelations}
				<svg
					class="schema-view__relations"
					width={state.canvasSize.width}
					height={state.canvasSize.height}
					aria-hidden="true"
				>
					{#each state.document.dependencies as dependency (dependency.id)}
						{@const points = state.getDependencyPoints(dependency)}
						{@const focused = state.isDependencyFocused(dependency)}
						{@const dimmed = state.focusTableId !== null && !focused}
						{#if points}
							<SchemaDependency
								{dependency}
								x1={points.x1}
								y1={points.y1}
								x2={points.x2}
								y2={points.y2}
								active={!dimmed && (state.highlightRelations || focused)}
								{dimmed}
							/>
						{/if}
					{/each}
				</svg>
			{/if}

			{#each state.document.tables as table (table.id)}
				{@const position = state.positionByTable.get(table.id)}
				{#if position}
					<div
						class={`schema-view__table ${state.draggable ? 'schema-view__table--draggable' : ''} ${state.draggedTableId === table.id ? 'schema-view__table--dragging' : ''}`}
						style={`left:${position.x}px; top:${position.y}px;`}
						role="group"
						aria-roledescription={state.draggable ? 'draggable table' : 'table'}
						aria-label={`Table ${table.name}`}
						onpointerdown={(event) => state.startTableDrag(event, table.id)}
						onpointermove={(event) => state.moveTable(event, table.id)}
						onpointerup={(event) => state.stopTableDrag(event, table.id)}
						onpointercancel={(event) => state.stopTableDrag(event, table.id)}
						onpointerenter={() => state.setHoveredTable(table.id)}
						onpointerleave={() => state.setHoveredTable(null)}
					>
						<SchemaTable
							{table}
							active={state.activeTableId === table.id || state.focusTableId === table.id}
							dimmed={state.focusTableId !== null &&
								state.focusTableId !== table.id &&
								!state.focusNeighborIds.has(table.id)}
							relatedFieldIds={state.highlightRelations ? state.relatedFieldIds : []}
						/>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</section>

<style>
	.schema-view {
		height: 100%;
		min-height: 560px;
		overflow: auto;
		border: 1px solid var(--color-border-primary, rgba(22, 31, 44, 0.12));
		border-radius: 0.5rem;
		background:
			linear-gradient(
					color-mix(in srgb, var(--color-border-primary, #22314c) 55%, transparent) 1px,
					transparent 1px
				)
				0 0,
			linear-gradient(
					90deg,
					color-mix(in srgb, var(--color-border-primary, #22314c) 55%, transparent) 1px,
					transparent 1px
				)
				0 0,
			var(--color-background-secondary, #eef3f8);
		background-size: 32px 32px;
	}

	.schema-view__scaled-space,
	.schema-view__canvas {
		position: relative;
	}

	.schema-view__canvas {
		transform-origin: top left;
	}

	.schema-view__relations {
		position: absolute;
		inset: 0;
		overflow: visible;
		pointer-events: none;
	}

	.schema-view__cluster-layer {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.schema-view__cluster-panel {
		position: absolute;
		border-radius: 0.9rem;
		border: 1.5px dashed color-mix(in srgb, var(--cluster-color) 45%, transparent);
		background: color-mix(in srgb, var(--cluster-color) 7%, transparent);
	}

	.schema-view__cluster-label {
		position: absolute;
		top: 0.5rem;
		left: 0.85rem;
		/* Was a plain <span>; now the drag handle for moving the whole domain,
		   so it needs to opt back into pointer events despite the layer
		   above disabling them (pointer-events is inherited, not blocked). */
		appearance: none;
		border: none;
		margin: 0;
		padding: 0.15rem 0.5rem;
		border-radius: 0.4rem;
		font: inherit;
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--cluster-color) 65%, #172033 35%);
		background: color-mix(in srgb, var(--cluster-color) 16%, transparent);
		pointer-events: auto;
		user-select: none;
		touch-action: none;
	}

	.schema-view__cluster-label--draggable {
		cursor: grab;
	}

	.schema-view__cluster-label--draggable:hover {
		background: color-mix(in srgb, var(--cluster-color) 28%, transparent);
	}

	.schema-view__cluster-label--dragging {
		cursor: grabbing;
		z-index: 3;
		background: color-mix(in srgb, var(--cluster-color) 32%, transparent);
	}

	.schema-view--compact .schema-view__cluster-label {
		font-size: 0.6rem;
	}

	.schema-view__table {
		position: absolute;
		user-select: none;
		touch-action: none;
	}

	.schema-view__table--draggable {
		cursor: grab;
	}

	.schema-view__table--dragging {
		z-index: 2;
		cursor: grabbing;
	}

	/* Hover cue so the focus/dim interaction (see schema-table's --active /
	   --dimmed classes, driven from schema-view's state) is discoverable
	   without a written instruction -- brighten the card and lift it above
	   its dimmed neighbors while the pointer is over it. */
	.schema-view__table:hover {
		z-index: 1;
	}

	.schema-view__table:hover :global(.schema-table:not(.schema-table--dimmed)) {
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary-500, #4d92cf) 55%, transparent);
	}

	:global(.schema-view--compact .schema-table) {
		width: 150px;
		border-radius: 0.35rem;
		box-shadow: 0 8px 18px rgba(15, 23, 42, 0.1);
	}

	:global(.schema-view--compact .schema-table-header) {
		gap: 0.35rem;
		padding: 0.38rem 0.48rem;
	}

	:global(.schema-view--compact .schema-table-header strong) {
		font-size: 0.62rem;
	}

	:global(.schema-view--compact .schema-table-header span) {
		font-size: 0.54rem;
	}

	:global(.schema-view--compact .schema-table-field) {
		gap: 0.28rem;
		min-height: 21px;
		padding: 0.22rem 0.42rem;
	}

	:global(.schema-view--compact .schema-table-field__main) {
		grid-template-columns: minmax(0, 1fr);
		gap: 0.05rem;
	}

	:global(.schema-view--compact .schema-table-field__name) {
		font-size: 0.54rem;
		font-weight: 650;
	}

	:global(.schema-view--compact .schema-table-field__type) {
		display: none;
	}

	:global(.schema-view--compact .schema-table-field__badges) {
		gap: 0.12rem;
	}

	:global(.schema-view--compact .schema-table-field__badges span) {
		padding: 0.04rem 0.12rem;
		border-radius: 0.18rem;
		font-size: 0.42rem;
	}
</style>
