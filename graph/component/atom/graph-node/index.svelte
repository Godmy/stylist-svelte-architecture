<script lang="ts">
	import type { RecipeGraphNode } from '$stylist/graph/interface/recipe/graph-node';
	import createGraphNodeState from './state.svelte';

	let props: RecipeGraphNode = $props();

	const state = createGraphNodeState(() => props);
	const label = $derived(props.label ?? props.id);
	const restProps = $derived(
		(() => {
			const {
				class: _class,
				id: _id,
				x: _x,
				y: _y,
				label: _label,
				type: _type,
				color: _color,
				size: _size,
				selected: _selected,
				interactive: _interactive,
				children: _children,
				...rest
			} = props;
			return rest;
		})()
	);
</script>

<div
	class={`${state.stateClasses} ${state.sizeClasses} ${props.class ?? ''}`}
	style={state.style}
	data-node-id={props.id}
	data-node-type={props.type ?? 'default'}
	aria-label={`Graph node ${label}`}
	{...restProps}
>
	{#if props.children}
		{#if props.children}{#if props.children}{@render props.children()}{/if}{/if}
	{:else}
		{label}
	{/if}
</div>

<style>
	:global(.graph-node) {
		position: absolute;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--border-radius-full);
		border: 2px solid var(--color-border-secondary);
		background: var(--graph-node-color, var(--color-primary-500));
		color: var(--color-text-inverse);
		font-size: var(--font-size-3);
		font-weight: var(--font-weight-bold);
		line-height: var(--line-height-none);
		box-shadow: var(--shadow-custom26);
		user-select: none;
		cursor: pointer;
		transition:
			transform var(--duration-120) var(--animation-ease),
			box-shadow var(--duration-120) var(--animation-ease),
			border-color var(--duration-120) var(--animation-ease);
	}

	:global(.graph-node:hover) {
		transform: translateY(-1px);
		box-shadow: var(--shadow-custom37);
	}

	:global(.graph-node:focus-visible) {
		outline: 2px solid var(--color-text-primary);
		outline-offset: 2px;
	}

	:global(.graph-node.selected) {
		border-color: var(--color-text-primary);
		box-shadow: var(--shadow-custom15);
	}

	:global(.graph-node[data-node-type='source']) {
		border-style: solid;
	}

	:global(.graph-node[data-node-type='gateway']) {
		border-style: dashed;
	}
</style>
