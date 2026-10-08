<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Svg from '$stylist/svg/component/atom/svg/index.svelte';
	import ThemeModeToggle from '$stylist/theme/component/atom/theme-mode-toggle/index.svelte';
	import type { RecipeSchemaTool } from '$stylist/erd/interface/recipe/schema-tool';

	// Inlined instead of `Icon` (which statically drags in the ~650-file icon
	// registry barrel) -- that eager import graph is slow enough to resolve
	// that it can hang the whole dev server on first touch. Only the handful
	// of icons this toolbar actually uses are needed here.
	const ICON_IMPORT = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
  <polyline points="17 8 12 3 7 8"/>
  <line x1="12" y1="3" x2="12" y2="15"/>
</svg>
` as const;

	const ICON_EXPORT = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
  <polyline points="7 10 12 15 17 10"/>
  <line x1="12" y1="15" x2="12" y2="3"/>
</svg>
` as const;

	const ICON_ZOOM_IN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="6"/>
  <path d="m20 20-4.2-4.2"/>
  <path d="M11 8v6M8 11h6"/>
</svg>
` as const;

	const ICON_ZOOM_OUT = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="6"/>
  <path d="m20 20-4.2-4.2"/>
  <path d="M8 11h6"/>
</svg>
` as const;

	const ICON_LINK = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
  <path d="M10.5 13.5l3-3"/>
  <path d="M8 15.5l-1.5 1.5a3 3 0 0 1-4.2-4.2l3-3a3 3 0 0 1 4.2 0"/>
  <path d="M16 8.5l1.5-1.5a3 3 0 0 1 4.2 4.2l-3 3a3 3 0 0 1-4.2 0"/>
</svg>
` as const;

	const ICON_SEARCH = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="7" />
  <path d="m20 20-3.5-3.5" />
</svg>
` as const;

	const ICON_PANEL = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="4" width="18" height="16" rx="2"/>
  <line x1="9" y1="4" x2="9" y2="20"/>
</svg>
` as const;

	const ICON_SAVE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/>
  <path d="M17 21v-8H7v8"/>
  <path d="M7 3v5h8"/>
</svg>
` as const;

	const ICON_RESET = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 12a9 9 0 1 0 3-6.7"/>
  <polyline points="3 4 3 9 8 9"/>
</svg>
` as const;

	let dispatch = createEventDispatcher<{
		import: undefined;
		export: undefined;
		'zoom-in': undefined;
		'zoom-out': undefined;
		'zoom-reset': undefined;
		'layout-change': { layout: NonNullable<RecipeSchemaTool['layout']> };
		'toggle-relations': { enabled: boolean };
		'toggle-highlight': { enabled: boolean };
		'mode-change': { mode: NonNullable<RecipeSchemaTool['mode']> };
		'toggle-text-panel': { visible: boolean };
		'save-layout': undefined;
		'reset-layout': undefined;
	}>();

	let {
		zoom = 1,
		showRelations = true,
		highlightRelations = true,
		layout = 'grid',
		canImport = true,
		canExport = true,
		mode = 'live',
		textPanelVisible = true,
		persistLayout = false
	}: RecipeSchemaTool = $props();
</script>

<nav class="schema-tool" aria-label="Schema tools">
	<button
		type="button"
		aria-label="Import schema"
		title="Import schema"
		disabled={!canImport}
		onclick={() => dispatch('import')}
	>
		<Svg svg={ICON_IMPORT} size={18} />
	</button>
	<button
		type="button"
		aria-label="Export schema"
		title="Export schema"
		disabled={!canExport}
		onclick={() => dispatch('export')}
	>
		<Svg svg={ICON_EXPORT} size={18} />
	</button>
	<div class="schema-tool__separator"></div>
	<label class="schema-tool__select" title="Mode">
		<span>Mode</span>
		<select
			aria-label="Mode"
			value={mode}
			onchange={(event) =>
				dispatch('mode-change', {
					mode: (event.currentTarget as HTMLSelectElement).value as NonNullable<RecipeSchemaTool['mode']>
				})}
		>
			<option value="live">Live</option>
			<option value="edit">Edit</option>
			<option value="migrate">Migrate</option>
		</select>
	</label>
	<div class="schema-tool__separator"></div>
	<button type="button" aria-label="Zoom out" title="Zoom out" onclick={() => dispatch('zoom-out')}>
		<Svg svg={ICON_ZOOM_OUT} size={18} />
	</button>
	<button
		type="button"
		class="schema-tool__value"
		aria-label="Reset zoom"
		title="Reset zoom"
		onclick={() => dispatch('zoom-reset')}
	>
		{Math.round(zoom * 100)}%
	</button>
	<button type="button" aria-label="Zoom in" title="Zoom in" onclick={() => dispatch('zoom-in')}>
		<Svg svg={ICON_ZOOM_IN} size={18} />
	</button>
	<div class="schema-tool__separator"></div>
	<label class="schema-tool__select" title="Layout">
		<span>Layout</span>
		<select
			aria-label="Layout"
			value={layout}
			onchange={(event) =>
				dispatch('layout-change', {
					layout: (event.currentTarget as HTMLSelectElement).value as NonNullable<
						RecipeSchemaTool['layout']
					>
				})}
		>
			<option value="grid">Grid</option>
			<option value="wide">Wide</option>
			<option value="columns">Columns</option>
			<option value="radial">Radial</option>
			<option value="clusters">Clusters</option>
			<option value="star">Star</option>
		</select>
	</label>
	{#if persistLayout}
		<div class="schema-tool__separator"></div>
		<button
			type="button"
			aria-label="Save layout"
			title="Save the current table positions so you can come back to them"
			onclick={() => dispatch('save-layout')}
		>
			<Svg svg={ICON_SAVE} size={18} />
		</button>
		<button
			type="button"
			aria-label="Reset layout"
			title="Discard the saved positions and recompute the layout"
			onclick={() => dispatch('reset-layout')}
		>
			<Svg svg={ICON_RESET} size={18} />
		</button>
	{/if}
	<div class="schema-tool__separator"></div>
	<button
		type="button"
		class={showRelations ? 'schema-tool__button--active' : ''}
		aria-label="Show relations"
		title="Show relations"
		onclick={() => dispatch('toggle-relations', { enabled: !showRelations })}
	>
		<Svg svg={ICON_LINK} size={18} />
	</button>
	<button
		type="button"
		class={highlightRelations ? 'schema-tool__button--active' : ''}
		aria-label="Highlight relations"
		title="Highlight relations"
		onclick={() => dispatch('toggle-highlight', { enabled: !highlightRelations })}
	>
		<Svg svg={ICON_SEARCH} size={18} />
	</button>
	<div class="schema-tool__separator"></div>
	<button
		type="button"
		class={textPanelVisible ? 'schema-tool__button--active' : ''}
		aria-label={textPanelVisible ? 'Hide schema text' : 'Show schema text'}
		title={textPanelVisible ? 'Hide schema text' : 'Show schema text'}
		onclick={() => dispatch('toggle-text-panel', { visible: !textPanelVisible })}
	>
		<Svg svg={ICON_PANEL} size={18} />
	</button>
	<div class="schema-tool__separator"></div>
	<ThemeModeToggle class="schema-tool__theme-toggle" />
</nav>

<style>
	.schema-tool {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem;
	}

	.schema-tool button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2.35rem;
		min-height: 2.15rem;
		padding: 0 0.62rem;
		border: 1px solid var(--color-border-primary, rgba(22, 31, 44, 0.12));
		border-radius: 0.4rem;
		background: var(--color-background-secondary, #f8fafc);
		color: var(--color-text-primary, #263244);
		cursor: pointer;
		font: inherit;
		font-size: 0.78rem;
	}

	.schema-tool__select {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		min-height: 2.15rem;
		padding: 0 0.62rem;
		border: 1px solid var(--color-border-primary, rgba(22, 31, 44, 0.12));
		border-radius: 0.4rem;
		background: var(--color-background-secondary, #f8fafc);
		color: var(--color-text-primary, #263244);
		font-size: 0.78rem;
	}

	.schema-tool__select span {
		color: var(--color-text-secondary, #5a6678);
	}

	.schema-tool__select select {
		min-width: 6.2rem;
		border: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}

	.schema-tool__select select option {
		background: var(--color-background-primary, #ffffff);
		color: var(--color-text-primary, #263244);
	}

	.schema-tool__value {
		min-width: 3.45rem !important;
		font-variant-numeric: tabular-nums;
	}

	.schema-tool button:hover:not(:disabled),
	.schema-tool__button--active {
		border-color: var(--color-primary-500, #4d92cf);
		background: var(--color-primary-50, #eaf3ff);
		color: var(--color-primary-700, #174a7c);
	}

	.schema-tool button:disabled {
		cursor: not-allowed;
		opacity: 0.45;
	}

	.schema-tool__separator {
		width: 1px;
		height: 1.75rem;
		background: var(--color-border-primary, rgba(22, 31, 44, 0.12));
	}

	:global(.schema-tool__theme-toggle) {
		min-width: 2.35rem;
		min-height: 2.15rem;
		padding: 0 0.62rem;
	}
</style>
