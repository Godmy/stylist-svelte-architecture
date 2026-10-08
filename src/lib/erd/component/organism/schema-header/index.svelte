<script lang="ts">
	import SchemaTool from '$stylist/erd/component/organism/schema-tool/index.svelte';
	import type { RecipeSchemaHeader } from '$stylist/erd/interface/recipe/schema-header';

	let {
		title = 'Schema',
		stats,
		zoom = 1,
		showRelations = true,
		highlightRelations = true,
		layout = 'grid',
		canImport = true,
		canExport = true,
		mode = 'live',
		textPanelVisible = true,
		persistLayout = false
	}: RecipeSchemaHeader = $props();
</script>

<header class="schema-header">
	<div class="schema-header__titles">
		<h1 class="schema-header__title">{title}</h1>
		{#if stats}
			<div class="schema-header__stats">
				<span>{stats.tables} tables</span>
				<span>{stats.relations} relations</span>
				<span class={stats.errors > 0 ? 'schema-header__stats-error' : ''}>
					{stats.errors} errors
				</span>
				<span class="schema-header__hint"
					>hover/click a table to trace its relations · drag a domain's label to move it</span
				>
			</div>
		{/if}
	</div>
	<SchemaTool
		{zoom}
		{showRelations}
		{highlightRelations}
		{layout}
		{canImport}
		{canExport}
		{mode}
		{textPanelVisible}
		{persistLayout}
		on:import
		on:export
		on:zoom-in
		on:zoom-out
		on:zoom-reset
		on:layout-change
		on:toggle-relations
		on:toggle-highlight
		on:mode-change
		on:toggle-text-panel
		on:save-layout
		on:reset-layout
	/>
</header>

<style>
	.schema-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.75rem;
		padding: 0.55rem 0.85rem;
		border-bottom: 1px solid var(--color-border-primary, rgba(22, 31, 44, 0.12));
		background: var(--color-background-primary, #ffffff);
	}

	.schema-header__titles {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		min-width: 0;
	}

	.schema-header__title {
		margin: 0;
		font-size: 1.05rem;
		font-weight: 700;
		color: var(--color-text-primary, #17212e);
		white-space: nowrap;
	}

	.schema-header__stats {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.schema-header__stats span {
		padding: 0.22rem 0.42rem;
		border-radius: 0.4rem;
		background: var(--color-background-secondary, #edf2f7);
		color: var(--color-text-secondary, #334155);
		font-size: 0.74rem;
	}

	.schema-header__hint {
		background: transparent !important;
		padding-left: 0 !important;
		color: var(--color-text-tertiary, #8896a8);
		font-style: italic;
	}

	.schema-header__stats-error {
		background: color-mix(in srgb, var(--color-danger-600, #dc2626) 16%, transparent) !important;
		color: var(--color-danger-600, #dc2626) !important;
	}
</style>
