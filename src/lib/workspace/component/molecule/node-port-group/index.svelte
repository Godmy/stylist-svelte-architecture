<script lang="ts">
	import type { RecipeNodePortGroup } from '$stylist/workspace/interface/recipe/node-port-group';
	import createNodePortGroupState from './state.svelte';
	import NodePort from '$stylist/workspace/component/atom/node-port/index.svelte';
	import Divider from '$stylist/layout/component/atom/divider/index.svelte';

	let props: RecipeNodePortGroup = $props();
	const state = createNodePortGroupState(() => props);
</script>

<div
	class={`${state.classes} ${props.class ?? ''}`}
	data-node-port-group-id={props.id}
	data-node-port-group-direction={props.direction}
	{...state.restProps}
>
	{#if state.hasTitle}
		<div class="node-port-group__title">{state.title}</div>
	{/if}

	<div class="node-port-group__list">
		{#each state.ports as port, index}
			{#if state.divider && index > 0}
				<Divider orientation="horizontal" class="node-port-group__divider" />
			{/if}

			<div
				class={`node-port-group__item ${state.divider && index > 0 ? 'node-port-group__item--divider' : ''}`}
			>
				<NodePort
					id={port.id}
					direction={state.direction}
					dataType={port.dataType}
					label={state.showLabels ? port.label : undefined}
					size={state.portSize as 'xs' | 'sm' | 'md' | 'lg'}
					connected={port.connected}
					color={port.color}
					onclick={(event?: MouseEvent) => {
						if (event) state.handlePortClick(port, event);
					}}
					onConnectionStart={(event: MouseEvent) => state.handleConnectionStart(port, event)}
					onConnectionEnd={(event: MouseEvent) => state.handleConnectionEnd(port, event)}
				/>
			</div>
		{/each}

		{#if props.children}{@render props.children()}{/if}
	</div>
</div>

<style>
	.node-port-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.5rem 0;
	}
	.node-port-group__title {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0 0.75rem;
		margin-bottom: 0.25rem;
	}
	.node-port-group__list {
		display: flex;
		flex-direction: column;
	}
	.node-port-group__item {
		position: relative;
		display: flex;
		align-items: center;
	}
	.node-port-group__item--divider {
		padding-top: 0.5rem;
		margin-top: 0.5rem;
	}
	.node-port-group__divider {
		margin: 0.5rem 0.75rem;
		opacity: 0.3;
	}
	.node-port-group--input {
		align-items: flex-start;
	}
	.node-port-group--input .node-port-group__item {
		justify-content: flex-start;
	}
	.node-port-group--output {
		align-items: flex-end;
	}
	.node-port-group--output .node-port-group__item {
		justify-content: flex-end;
	}
	.node-port-group--compact {
		gap: 0;
		padding: 0.25rem 0;
	}
	.node-port-group--compact .node-port-group__item {
		padding: 0.25rem 0;
	}
</style>
