<script lang="ts">
	import type { RecipeWorkspaceToolbar } from '$stylist/workspace/interface/recipe/workspace-toolbar';
	import { createWorkspaceToolbarState } from './state.svelte';
	import IconButton from '$stylist/button/component/atom/icon-button/index.svelte';
	import Separator from '$stylist/layout/component/atom/separator/index.svelte';

	let props: RecipeWorkspaceToolbar = $props();
	const state = createWorkspaceToolbarState(() => props);
</script>

<div class={state.classes} data-toolbar-id={props.id} {...state.restProps}>
	{#each state.items as item (item.id)}
		{#if item.type === 'button'}
			<IconButton
				variant={item.active ? 'primary' : 'ghost'}
				size={state.size === 'sm' ? 'sm' : 'md'}
				disabled={item.disabled}
				icon={item.icon}
				aria-label={item.tooltip ?? item.label ?? item.id}
				title={state.showTooltips ? (item.tooltip ?? item.label) : undefined}
				onclick={() => state.handleItemClick(item)}
			>
				{#if !item.icon && item.label}
					{item.label}
				{/if}
			</IconButton>
		{:else if item.type === 'select'}
			<select
				class="workspace-toolbar__select"
				value={String(item.value ?? '')}
				disabled={item.disabled}
				title={state.showTooltips ? item.tooltip : undefined}
				onchange={(event) =>
					state.handleValueChange(item, (event.target as HTMLSelectElement).value)}
			>
				{#each item.options ?? [] as option}
					<option value={option}>{option}</option>
				{/each}
			</select>
		{:else if item.type === 'input'}
			<input
				type="text"
				class="workspace-toolbar__input"
				value={String(item.value ?? '')}
				placeholder={item.label}
				disabled={item.disabled}
				title={state.showTooltips ? item.tooltip : undefined}
				onchange={(event) =>
					state.handleValueChange(item, (event.target as HTMLInputElement).value)}
			/>
		{:else if item.type === 'separator'}
			<Separator
				orientation={state.orientation === 'vertical' ? 'horizontal' : 'vertical'}
				class="workspace-toolbar__separator"
			/>
		{/if}
	{/each}

	{#if props.children}{@render props.children()}{/if}
</div>

<style>
	.workspace-toolbar {
		display: flex;
		gap: 0.25rem;
		padding: 0.5rem;
		background: var(--color-background-primary);
		border: 1px solid var(--color-border-primary);
		border-radius: 0.5rem;
		box-shadow: var(--layout-box-shadow-custom27, 0 1px 2px 0 rgb(0 0 0 / 0.05));
	}
	.workspace-toolbar--horizontal {
		flex-direction: row;
		align-items: center;
		flex-wrap: wrap;
	}
	.workspace-toolbar--vertical {
		flex-direction: column;
		align-items: stretch;
	}
	.workspace-toolbar--compact {
		padding: 0.5rem;
		gap: 0.25rem;
	}
	.workspace-toolbar__separator {
		margin: 0 0.25rem;
	}
	.workspace-toolbar__select,
	.workspace-toolbar__input {
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		color: var(--color-text-primary);
		background: var(--color-background-secondary);
		border: 1px solid var(--color-border-primary);
		border-radius: 0.25rem;
		outline: none;
		cursor: pointer;
		transition:
			border-color 120ms ease,
			box-shadow 120ms ease;
	}
	.workspace-toolbar__select:hover,
	.workspace-toolbar__input:hover {
		border-color: var(--color-border-secondary);
	}
	.workspace-toolbar__select:focus,
	.workspace-toolbar__input:focus {
		border-color: var(--color-primary-500);
		box-shadow: 0 0 0 3px rgb(14 165 233 / 0.2);
	}
	.workspace-toolbar__select:disabled,
	.workspace-toolbar__input:disabled {
		background: color-mix(
			in srgb,
			var(--color-background-primary) 85%,
			var(--color-background-secondary) 15%
		);
		color: var(--color-text-tertiary);
		cursor: not-allowed;
	}
</style>
