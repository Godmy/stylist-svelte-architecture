<script lang="ts">
	import type { RecipeMinimap } from '$stylist/workspace/interface/recipe/minimap';
	import type { LayoutHTMLAttributes } from '$stylist/layout/interface/behavior/layout-html-attributes';
	import IconButton from '$stylist/button/component/atom/icon-button/index.svelte';
	import Icon from '$stylist/svg/component/atom/icon/index.svelte';
	import createMinimapState from './state.svelte';

	const contract: LayoutHTMLAttributes<HTMLDivElement> & RecipeMinimap & { class?: string } =
		$props();
	const state = createMinimapState(() => contract);
</script>

<div
	class={state.hostClass}
	style={`--minimap-width: ${state.width}px; --minimap-height: ${state.height}px;`}
	{...state.restProps}
>
	<!-- MiniMap Canvas -->
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions a11y_no_noninteractive_tabindex -->
	<svg
		class="minimap__canvas"
		width={state.width}
		height={state.height}
		onclick={state.handleMapClick}
		onkeydown={state.handleKeyDown}
		role="button"
		aria-label="Mini map navigation"
		tabindex="0"
	>
		<rect width={state.width} height={state.height} fill={state.backgroundColor} rx={8} />

		<pattern
			id="minimap-grid"
			width={20 * state.miniMapZoom}
			height={20 * state.miniMapZoom}
			patternUnits="userSpaceOnUse"
		>
			<circle cx={1} cy={1} r={1} fill={state.gridColor} />
		</pattern>
		<rect width={state.width} height={state.height} fill="url(#minimap-grid)" />

		{#each state.nodes as node}
			{@const rect = state.getNodeRect(node)}
			<rect
				x={rect.x}
				y={rect.y}
				width={Math.max(rect.width, 8)}
				height={Math.max(rect.height, 6)}
				fill={node.selected ? state.activeNodeColor : state.nodeColor}
				rx={2}
				class="minimap__node"
				data-node-id={node.id}
			/>
		{/each}

		{#if state.showViewport}
			<rect
				x={state.viewport.x}
				y={state.viewport.y}
				width={state.viewport.width}
				height={state.viewport.height}
				fill="none"
				stroke={state.viewportColor}
				stroke-width={2}
				stroke-opacity={0.35}
				rx={4}
				class="minimap__viewport"
			/>
		{/if}
	</svg>

	{#if state.showZoomControls}
		<div class="minimap__controls">
			<IconButton
				variant="ghost"
				size="sm"
				aria-label="Zoom in"
				title="Zoom in"
				onclick={state.handleZoomIn}
			>
				<Icon name="zoom-in" size={14} />
			</IconButton>
			<IconButton
				variant="ghost"
				size="sm"
				aria-label="Zoom out"
				title="Zoom out"
				onclick={state.handleZoomOut}
			>
				<Icon name="zoom-out" size={14} />
			</IconButton>
			<IconButton
				variant="ghost"
				size="sm"
				aria-label="Zoom to fit"
				title="Zoom to fit"
				onclick={state.handleZoomToFit}
			>
				<Icon name="maximize" size={14} />
			</IconButton>
		</div>
	{/if}

	{#if contract.children}
		{@render contract.children()}
	{/if}
</div>

<style>
	:global(.minimap) {
		position: relative;
		display: inline-block;
	}

	:global(.minimap__canvas) {
		border: 1px solid var(--color-border-primary);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-custom39);
		cursor: pointer;
		transition: border-color var(--duration-120) var(--animation-ease);
	}

	:global(.minimap__canvas:hover) {
		border-color: var(--color-border-secondary);
	}

	:global(.minimap__node) {
		transition: fill var(--duration-120) var(--animation-ease);
		cursor: pointer;
	}

	:global(.minimap__node:hover) {
		fill: var(--color-primary-400);
		filter: brightness(1.2);
	}

	:global(.minimap__viewport) {
		cursor: move;
		transition: all var(--duration-120) var(--animation-ease);
		animation: minimap-viewport-pulse var(--duration-2000) var(--animation-ease-in-out) infinite;
	}

	@keyframes minimap-viewport-pulse {
		0%,
		100% {
			opacity: var(--opacity-100);
		}
		50% {
			opacity: var(--opacity-70);
		}
	}

	:global(.minimap__controls) {
		position: absolute;
		top: var(--spacing-2);
		right: var(--spacing-2);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
		background: color-mix(in srgb, var(--color-background-primary) 90%, transparent);
		border-radius: var(--border-radius-base);
		padding: var(--spacing-1);
		backdrop-filter: blur(4px);
	}
</style>
