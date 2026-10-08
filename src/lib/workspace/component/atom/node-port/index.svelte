<script lang="ts">
	import BaseIcon from '$stylist/svg/component/atom/icon/index.svelte';
	import type { RecipeNodePort } from '$stylist/workspace/interface/recipe/node-port';
	import type { TokenPropertyType } from '$stylist/workspace/type/alias/property-type';
	import createNodePortState from './state.svelte';

	let props: RecipeNodePort = $props();

	const state = createNodePortState(() => props);
	const label = $derived(props.label ?? '');
	const dataType = $derived((props.dataType ?? 'any') as TokenPropertyType);

	const restProps = $derived(
		(() => {
			const {
				class: _class,
				id: _id,
				direction: _direction,
				dataType: _dataType,
				label: _label,
				size: _size,
				index: _index,
				connected: _connected,
				active: _active,
				color: _color,
				icon: _icon,
				children: _children,
				...rest
			} = props;
			return rest;
		})()
	);
</script>

<div
	class={`${state.stateClasses} ${state.sizeClasses} ${props.class ?? ''}`}
	style={state.styles}
	data-port-id={props.id}
	data-port-direction={props.direction}
	data-port-type={dataType}
	data-port-connected={state.connected}
	aria-label={label || `Port ${props.id}`}
	role="button"
	tabindex={0}
	onmousedown={(event) => props.onConnectionStart?.(event)}
	onmouseup={(event) => props.onConnectionEnd?.(event)}
	onclick={(event) =>
		props.onclick?.(event as MouseEvent & { currentTarget: EventTarget & HTMLDivElement })}
	{...restProps}
>
	<div class="node-port__hit-area" aria-hidden="true"></div>
	<div class="node-port__circle" style={`background-color: ${state.color};`}></div>
	{#if label}
		<span class="node-port__label">{label}</span>
	{/if}
	{#if props.icon}
		<span class="node-port__icon">
			{#if typeof props.icon === 'string'}
				<BaseIcon name={props.icon} size={14} />
			{:else}
				{@render props.icon()}
			{/if}
		</span>
	{/if}
	{#if props.children}{@render props.children()}{/if}
</div>

<style>
	.node-port {
		position: absolute;
		top: 50%;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		cursor: crosshair;
		user-select: none;
		transition:
			transform 120ms ease,
			opacity 120ms ease;
	}
	.node-port:focus-visible {
		outline: 2px solid var(--node-port-color, var(--color-border-secondary));
		outline-offset: 2px;
	}
	.node-port__hit-area {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: var(--hit-area-size, 24px);
		height: var(--hit-area-size, 24px);
		border-radius: 50%;
		cursor: crosshair;
		opacity: 0;
	}
	.node-port:hover .node-port__hit-area {
		opacity: 0.1;
		background: var(
			--color-graph-port-state-hovered,
			var(--node-port-color, var(--color-border-secondary))
		);
	}
	.node-port__circle {
		position: relative;
		width: var(--port-size, 12px);
		height: var(--port-size, 12px);
		border-radius: 50%;
		border: 2px solid var(--color-background-primary);
		box-shadow: var(--layout-box-shadow-custom27, 0 1px 2px 0 rgb(0 0 0 / 0.05));
		transition:
			transform 120ms ease,
			box-shadow 120ms ease;
		z-index: 1;
	}
	.node-port:hover .node-port__circle {
		transform: scale(1.2);
		box-shadow: var(--layout-box-shadow-custom34, 0 0 0 3px rgb(59 130 246 / 0.5));
	}
	.node-port--connected .node-port__circle {
		border-color: var(--color-background-primary);
		box-shadow:
			0 0 0 2px var(--color-graph-port-state-connected),
			var(--layout-box-shadow-custom12, 0 2px 4px rgb(0 0 0 / 0.1));
	}
	.node-port--active .node-port__circle {
		box-shadow:
			0 0 0 2px var(--color-graph-port-state-active),
			var(--layout-box-shadow-custom34, 0 0 0 3px rgb(59 130 246 / 0.5));
		animation: node-port-pulse 1500ms ease-in-out infinite;
	}
	@keyframes node-port-pulse {
		0%,
		100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.3);
			opacity: 0.8;
		}
	}
	.node-port__label {
		position: relative;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-primary);
		white-space: nowrap;
		pointer-events: none;
		z-index: 1;
	}
	.node-port[data-port-direction='input'] .node-port__label {
		margin-left: 0.75rem;
	}
	.node-port[data-port-direction='output'] .node-port__label {
		margin-right: 0.75rem;
	}
	.node-port__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: inherit;
		z-index: 1;
	}
	.node-port--xs {
		--port-size: 8px;
		--hit-area-size: 16px;
	}
	.node-port--sm {
		--port-size: 10px;
		--hit-area-size: 20px;
	}
	.node-port--md {
		--port-size: 12px;
		--hit-area-size: 24px;
	}
	.node-port--lg {
		--port-size: 16px;
		--hit-area-size: 32px;
	}
	.node-port[data-port-direction='input'] {
		left: -6px;
		transform: translate(-100%, -50%);
	}
	.node-port[data-port-direction='output'] {
		right: -6px;
		transform: translate(100%, -50%);
	}
	.node-port[data-port-direction='input']:hover {
		transform: translate(-100%, -50%) scale(1.1);
	}
	.node-port[data-port-direction='output']:hover {
		transform: translate(100%, -50%) scale(1.1);
	}
</style>
