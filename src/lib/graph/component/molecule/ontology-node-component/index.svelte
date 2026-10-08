<script lang="ts">
	import Icon from '$stylist/svg/component/atom/icon/index.svelte';
	import type { RecipeOntologyNodeComponent } from '$stylist/graph/interface/recipe/ontology-node-component';
	import createOntologyNodeComponentState from './state.svelte';

	let props: RecipeOntologyNodeComponent = $props();
	const state = createOntologyNodeComponentState(() => props);
</script>

<div class={state.baseClasses}>
	<div class="ontology-node-component__inner">
		<Icon
			name={state.iconName}
			style="width: 1rem; height: 1rem; margin-right: 0.25rem; color: currentColor;"
		/>
		{#if props.showLabel}
			<span class="ontology-node-component__label" title={state.label}>{state.label}</span>
		{/if}
	</div>

	{#if props.node.attributes && props.node.attributes.length > 0}
		<div class="ontology-node-component__attributes">
			{#each props.node.attributes as attr}
				<span class="ontology-node-component__attr">{attr}</span>
			{/each}
		</div>
	{/if}
</div>

<style>
	:global(.ontology-node-component) {
		border-width: 2px;
		border-style: solid;
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		font-size: 0.75rem;
		font-weight: var(--font-weight-medium, 500);
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
		transition: box-shadow var(--duration-200, 200ms);
		border-radius: 0.5rem;
	}

	:global(.ontology-node-component:hover) {
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	:global(.ontology-node-component--class) {
		border-color: var(--color-info-500);
		background-color: var(--color-info-50);
		color: var(--color-info-700);
	}

	:global(.ontology-node-component--object-property) {
		border-color: var(--color-success-500);
		background-color: var(--color-success-50);
		color: var(--color-success-700);
		border-radius: 9999px;
	}

	:global(.ontology-node-component--datatype-property) {
		border-color: var(--color-secondary-500);
		background-color: var(--color-secondary-50);
		color: var(--color-secondary-700);
		border-radius: 0.375rem;
	}

	:global(.ontology-node-component--datatype) {
		border-color: var(--color-warning-500);
		background-color: var(--color-warning-50);
		color: var(--color-warning-700);
		border-radius: 0.25rem;
	}

	:global(.ontology-node-component--deprecated) {
		border-color: var(--color-neutral-400);
		background-color: var(--color-neutral-100);
		color: var(--color-neutral-500);
		text-decoration: line-through;
	}

	:global(.ontology-node-component--equivalent-class) {
		border-color: var(--color-primary-500);
		background-color: var(--color-primary-50);
		color: var(--color-primary-700);
		border-style: dashed;
	}

	:global(.ontology-node-component__inner) {
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: center;
	}

	:global(.ontology-node-component__label) {
		max-width: 80px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(.ontology-node-component__attributes) {
		margin-top: 0.25rem;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.25rem;
		font-size: 0.6rem;
		opacity: var(--opacity-75, 0.75);
	}

	:global(.ontology-node-component__attr) {
		border-radius: 0.25rem;
		background-color: currentColor;
		opacity: 0.1;
		padding: 0 0.25rem;
	}
</style>
