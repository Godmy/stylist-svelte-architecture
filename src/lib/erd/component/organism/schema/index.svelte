<script lang="ts">
	import { untrack } from 'svelte';
	import SchemaText from '$stylist/erd/component/organism/schema-text/index.svelte';
	import SchemaHeader from '$stylist/erd/component/organism/schema-header/index.svelte';
	import SchemaView from '$stylist/erd/component/organism/schema-view/index.svelte';
	import type { RecipeSchema } from '$stylist/erd/interface/recipe/schema';
	import createSchemaState from './state.svelte';

	let props: RecipeSchema = $props();

	// `props` itself is a stable reactive proxy -- handing the reference to
	// the factory doesn't need to re-run when a prop changes, only the
	// $derived reads *inside* createSchemaState do. untrack() says exactly
	// that instead of tripping "did you mean a closure?" (state_referenced_locally).
	const state = createSchemaState(() => props);
</script>

<section class="schema">
	<input
		bind:this={state.fileInput}
		class="schema__file-input"
		type="file"
		accept=".txt,.schema,.erd,text/plain"
		onchange={state.handleFileImport}
	/>

	<SchemaHeader
		title={props.title ?? 'Schema'}
		stats={{
			tables: state.parseResult.document.tables.length,
			relations: state.parseResult.document.dependencies.length,
			errors: state.parseResult.errors.length
		}}
		zoom={state.currentZoom}
		showRelations={state.relationsVisible}
		highlightRelations={state.relationHighlight}
		layout={state.currentLayout}
		mode={state.currentMode}
		textPanelVisible={state.textPanelVisible}
		persistLayout={props.persistLayout ?? false}
		on:import={state.importSchema}
		on:export={state.exportSchema}
		on:zoom-in={state.zoomIn}
		on:zoom-out={state.zoomOut}
		on:zoom-reset={state.zoomReset}
		on:layout-change={(event) => state.setLayout(event.detail.layout)}
		on:toggle-relations={(event) => state.setRelationsVisible(event.detail.enabled)}
		on:toggle-highlight={(event) => state.setRelationHighlight(event.detail.enabled)}
		on:mode-change={(event) => state.setMode(event.detail.mode)}
		on:toggle-text-panel={(event) => state.setTextPanelVisible(event.detail.visible)}
		on:save-layout={state.saveLayout}
		on:reset-layout={state.resetLayout}
	/>

	<div class={`schema__workspace ${state.textPanelVisible ? '' : 'schema__workspace--full'}`}>
		<div class="schema__view">
			<SchemaView
				bind:this={state.schemaView}
				document={state.parseResult.document}
				zoom={state.currentZoom}
				showRelations={state.relationsVisible}
				highlightRelations={state.relationHighlight}
				layout={state.currentLayout}
				draggable={props.draggable ?? true}
				persistLayout={props.persistLayout ?? false}
			/>
		</div>

		{#if state.textPanelVisible}
			<aside class="schema__editor">
				{#if state.currentMode === 'edit'}
					<SchemaText bind:value={state.editSource} />
				{:else if state.currentMode === 'migrate'}
					<SchemaText value={state.activeSource} />
				{:else}
					<SchemaText bind:value={state.liveSource} />
				{/if}
			</aside>
		{/if}
	</div>
</section>

<style>
	.schema {
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
		height: 100%;
	}

	.schema__file-input {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}

	.schema__workspace {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(14.4rem, 0.336fr);
		gap: 0;
		min-width: 0;
		min-height: 0;
		flex: 1;
	}

	.schema__workspace--full {
		grid-template-columns: minmax(0, 1fr);
	}

	.schema__editor,
	.schema__view {
		min-width: 0;
		min-height: 0;
	}

	.schema__editor {
		display: grid;
	}

	.schema__view {
		display: grid;
	}

	@media (max-width: 980px) {
		.schema__workspace {
			grid-template-columns: 1fr;
		}
	}
</style>
