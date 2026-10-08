<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { RecipeGraphNodeCard } from '$stylist/workspace/interface/recipe/graph-node-card';
	import Button from '$stylist/button/component/atom/button/index.svelte';
	import Icon from '$stylist/svg/component/atom/icon/index.svelte';
	import { createGraphNodeCardState } from './state.svelte';

	let props: RecipeGraphNodeCard & HTMLAttributes<HTMLDivElement> = $props();
	const state = createGraphNodeCardState(() => props);
</script>

<div class={state.containerClass} {...state.restProps}>
	<div
		class={state.headerClass}
		onclick={state.toggleExpanded}
		role="button"
		tabindex="0"
		onkeydown={(e: KeyboardEvent) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				state.toggleExpanded();
			}
		}}
		aria-expanded={state.isExpanded}
		aria-label={`Graph node card for ${props.node.name ?? props.node.title ?? props.node.id ?? 'node'}`}
	>
		<div class="graph-node-card__icon">
			<Icon name={state.getIconName(props.node.type ?? 'default')} size="sm" />
		</div>
		<div class={state.titleClass}>{props.node.name ?? props.node.title ?? props.node.id}</div>
		<div class={state.typeClass}>{props.node.type ?? 'default'}</div>
	</div>

	{#if state.isExpanded}
		<div class={state.contentClass}>
			{#if props.node.description}
				<div class={state.descriptionClass}>{props.node.description}</div>
			{/if}

			{#if props.node.fields && props.node.fields.length > 0}
				<div class={state.fieldsListClass}>
					{#each props.node.fields as field}
						<div
							class={state.fieldItemClass}
							onclick={() => state.handleFieldClick(field)}
							role="button"
							tabindex="0"
							onkeydown={(e: KeyboardEvent) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									state.handleFieldClick(field);
								}
							}}
							aria-label={`Field ${field.name} of type ${field.type}`}
						>
							<span class={state.fieldNameClass}>
								{field.name}
								{#if field.isRequired}<span class={state.fieldRequiredClass}>*</span>{/if}
							</span>
							<span class={state.fieldTypeClass}>{field.type}</span>
						</div>
					{/each}
				</div>
			{/if}

			<div class={state.actionsClass}>
				<Button
					size="sm"
					variant="ghost"
					onclick={state.handleViewDetails}
					aria-label={`View details for ${props.node.name ?? props.node.title ?? props.node.id ?? 'node'}`}
				>
					Details
				</Button>
				<Button
					size="sm"
					variant="ghost"
					onclick={state.handleAddField}
					aria-label={`Add field to ${props.node.name ?? props.node.title ?? props.node.id ?? 'node'}`}
				>
					Add Field
				</Button>
			</div>
		</div>
	{/if}
</div>

<style>
	.graph-node-card {
		border-radius: 0.5rem;
		border: 1px solid var(--color-border-primary);
		background-color: var(--color-background-primary);
		box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
	}
	.graph-node-card--selected {
		box-shadow: 0 0 0 2px var(--color-primary-500);
	}
	.graph-node-card--highlight {
		border-color: var(--color-primary-400);
	}
	.graph-node-card--default {
		border-color: var(--color-border-primary);
	}
	.graph-node-card__header {
		display: flex;
		cursor: pointer;
		align-items: center;
		gap: 0.5rem;
		border-bottom: 1px solid var(--color-border-primary);
		padding: 0.75rem 1rem;
	}
	.graph-node-card__icon {
		margin-right: 0.5rem;
	}
	.graph-node-card__title {
		flex: 1;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}
	.graph-node-card__type {
		border-radius: 0.25rem;
		background-color: var(--color-background-secondary);
		padding: 0.125rem 0.5rem;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}
	.graph-node-card__content {
		padding: 0.75rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.graph-node-card__description {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}
	.graph-node-card__fields {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.graph-node-card__field-item {
		display: flex;
		cursor: pointer;
		align-items: center;
		justify-content: space-between;
		border-radius: 0.25rem;
		border: 1px solid var(--color-border-primary);
		padding: 0.5rem 0.75rem;
	}
	.graph-node-card__field-item:hover {
		background-color: var(--color-background-secondary);
	}
	.graph-node-card__field-name {
		font-size: 0.875rem;
		color: var(--color-text-primary);
	}
	.graph-node-card__field-type {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}
	.graph-node-card__field-required {
		margin-left: 0.125rem;
		color: var(--color-danger-500);
	}
	.graph-node-card__actions {
		display: flex;
		gap: 0.5rem;
		padding-top: 0.5rem;
	}
</style>
