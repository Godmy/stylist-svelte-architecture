<script lang="ts">
	import type { RecipeNodeHeader } from '$stylist/workspace/interface/recipe/node-header';
	import { createNodeHeaderState } from './state.svelte';
	import BaseIcon from '$stylist/svg/component/atom/icon/index.svelte';

	let props: RecipeNodeHeader = $props();
	const state = createNodeHeaderState(() => props);
</script>

<div
	class={`${state.classes} ${props.class ?? ''}`}
	style={state.styles}
	data-header-id={props.id}
	data-header-selected={state.selected}
	{...state.restProps}
>
	{#if state.isEditing}
		<input
			type="text"
			class="node-header__title-input"
			bind:value={state.editValue}
			onblur={state.handleBlur}
			onkeydown={state.handleKeydown}
		/>
	{:else}
		<button
			type="button"
			class="node-header__title-button"
			ondblclick={state.handleDoubleClick}
			onclick={state.handleDoubleClick}
			disabled={!props.editable}
			aria-label={props.editable ? `Edit ${state.title}` : state.title}
		>
			<span class="node-header__title">{state.title}</span>
		</button>
	{/if}

	{#if state.showActions || props.actions}
		<div class="node-header__actions">
			{#if props.actions}
				{@render props.actions()}
			{/if}
			{#if props.showDuplicate}
				<button
					type="button"
					class="node-header__action-btn"
					onclick={() => props.onduplicate?.()}
					title="Duplicate"
					aria-label="Duplicate node"><BaseIcon name="copy" size={14} /></button
				>
			{/if}
			{#if props.showSettings}
				<button
					type="button"
					class="node-header__action-btn"
					onclick={() => props.onsettings?.()}
					title="Settings"
					aria-label="Node settings"><BaseIcon name="settings" size={14} /></button
				>
			{/if}
			{#if props.showClose}
				<button
					type="button"
					class="node-header__action-btn node-header__action-btn--danger"
					onclick={() => props.onclose?.()}
					title="Close"
					aria-label="Close node"><BaseIcon name="x" size={14} /></button
				>
			{:else if props.showDelete}
				<button
					type="button"
					class="node-header__action-btn node-header__action-btn--danger"
					onclick={() => props.ondelete?.()}
					title="Delete"
					aria-label="Delete node"><BaseIcon name="trash-2" size={14} /></button
				>
			{/if}
		</div>
	{/if}

	{#if props.children}{@render props.children()}{/if}
</div>

<style>
	.node-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: var(--node-header-color, var(--color-primary-600));
		color: var(--color-text-inverse);
		border-radius: var(--node-radius, 0.5rem) var(--node-radius, 0.5rem) 0 0;
		cursor: grab;
		user-select: none;
	}
	.node-header:active {
		cursor: grabbing;
	}
	.node-header__title-button {
		flex: 1 1 auto;
		display: flex;
		align-items: center;
		padding: 0;
		background: transparent;
		border: none;
		color: inherit;
		text-align: left;
	}
	.node-header__title-button:not(:disabled) {
		cursor: pointer;
	}
	.node-header__title-button:not(:disabled):hover {
		background: color-mix(in srgb, var(--color-background-primary) 10%, transparent);
		border-radius: 0.25rem;
	}
	.node-header__title-button:focus-visible {
		outline: 2px solid var(--color-text-inverse);
		outline-offset: 2px;
	}
	.node-header__title {
		flex: 1 1 auto;
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1.2;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.node-header__title-input {
		flex: 1 1 auto;
		padding: 0.25rem 0.5rem;
		font-size: inherit;
		font-weight: inherit;
		font-family: inherit;
		color: var(--color-text-primary);
		background: var(--color-background-primary);
		border: 2px solid var(--color-primary-400);
		border-radius: 0.25rem;
		outline: none;
	}
	.node-header__actions {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		flex-shrink: 0;
	}
	.node-header__action-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem;
		background: transparent;
		border: none;
		border-radius: 0.25rem;
		color: inherit;
		opacity: 0.7;
		cursor: pointer;
		transition:
			opacity 120ms ease,
			background-color 120ms ease;
	}
	.node-header__action-btn:hover {
		opacity: 1;
		background: color-mix(in srgb, var(--color-background-primary) 15%, transparent);
	}
	.node-header__action-btn:active {
		background: color-mix(in srgb, var(--color-background-primary) 20%, transparent);
	}
	.node-header__action-btn--danger:hover {
		background: color-mix(in srgb, var(--color-danger-500) 30%, transparent);
	}
	.node-header--selected {
		box-shadow: 0 0 0 2px var(--color-primary-400);
	}
	.node-header--size-xs {
		padding: 0.25rem 0.5rem;
	}
	.node-header--size-xs .node-header__title {
		font-size: 0.75rem;
	}
	.node-header--size-sm {
		padding: 0.5rem;
	}
	.node-header--size-sm .node-header__title {
		font-size: 0.75rem;
	}
	.node-header--size-md {
		padding: 0.5rem 0.75rem;
	}
	.node-header--size-md .node-header__title {
		font-size: 0.75rem;
	}
	.node-header--size-lg {
		padding: 0.5rem 0.75rem;
	}
	.node-header--size-lg .node-header__title {
		font-size: 0.75rem;
	}
</style>
