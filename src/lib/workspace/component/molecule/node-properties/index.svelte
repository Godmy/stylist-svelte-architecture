<script lang="ts">
	import type { RecipeNodeProperties as NodePropertiesProps } from '$stylist/workspace/interface/recipe/node-properties';
	import createNodePropertiesState from './state.svelte';
	import IconButton from '$stylist/button/component/atom/icon-button/index.svelte';
	import NodeProperty from '$stylist/workspace/component/atom/node-property/index.svelte';
	import type { TokenPropertyType } from '$stylist/workspace/type/alias/property-type';

	let props: NodePropertiesProps = $props();
	const state = createNodePropertiesState(() => props);
	const title = $derived(props.title ?? 'Properties');
</script>

<aside
	class={`${state.classes} ${props.class ?? ''}`}
	data-node-id={props.nodeId}
	data-has-properties={state.hasProperties}
	{...state.restProps}
>
	{#if state.showHeader}
		<header class="node-properties__header">
			<h3 class="node-properties__title">{title}</h3>
			{#if state.showClose}
				<IconButton
					variant="ghost"
					size="sm"
					icon="x"
					aria-label="Close properties panel"
					onclick={state.handleCloseClick}
				/>
			{/if}
		</header>
	{/if}

	<div class="node-properties__content">
		{#if state.hasProperties}
			{#if state.groupByType}
				{#each state.propertyGroups as [groupName, groupProperties]}
					<section class="node-properties__group">
						<h4 class="node-properties__group-title">{groupName}</h4>
						<div class="node-properties__list">
							{#each groupProperties as property (property.id)}
								<NodeProperty
									id={property.id}
									name={property.name ?? property.id ?? ''}
									type={property.type as TokenPropertyType | undefined}
									value={property.value}
									label={property.label}
									description={property.description}
									options={property.options}
									size={props.size}
									editable={state.editable}
									onchange={state.handlePropertyChange}
								/>
							{/each}
						</div>
					</section>
				{/each}
			{:else}
				<div class="node-properties__list">
					{#each props.properties ?? [] as property (property.id)}
						<NodeProperty
							id={property.id}
							name={property.name ?? property.id ?? ''}
							type={property.type as TokenPropertyType | undefined}
							value={property.value}
							label={property.label}
							description={property.description}
							options={property.options}
							size={props.size}
							editable={state.editable}
							onchange={state.handlePropertyChange}
						/>
					{/each}
				</div>
			{/if}
		{:else}
			<p class="node-properties__empty">No properties available.</p>
		{/if}

		{#if props.children}{@render props.children()}{/if}
	</div>
</aside>

<style>
	.node-properties {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		width: 280px;
		max-height: 60vh;
		overflow-y: auto;
		padding: 1rem;
		background: var(--color-background-primary);
		border: 1px solid var(--color-border-primary);
		border-radius: 0.5rem;
		box-shadow: var(--layout-box-shadow-custom42, 0 10px 15px -3px rgb(0 0 0 / 0.1));
	}
	.node-properties__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}
	.node-properties__title {
		margin: 0;
		font-size: 0.75rem;
		font-weight: 600;
	}
	.node-properties__content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.node-properties__group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.node-properties__group-title {
		margin: 0;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		opacity: 0.7;
	}
	.node-properties__list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.node-properties__empty {
		margin: 0;
		opacity: 0.7;
	}
</style>
