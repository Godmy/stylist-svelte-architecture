<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { RecipePreziScene } from '$stylist/presentation/interface/recipe/prezi-scene';
	import type { SceneNode } from '$stylist/presentation/interface/slot/scene-node';
	import usePreziState from './state.svelte';
	import PresenterNodeShell from '$stylist/presentation/component/molecule/presenter-node-shell/index.svelte';
	import Minimap from '$stylist/workspace/component/organism/minimap/index.svelte';
	import Icon from '$stylist/svg/component/atom/icon/index.svelte';
	import Grid from '$stylist/layout/component/atom/grid/index.svelte';

	type Props = RecipePreziScene & { inspector?: Snippet<[SceneNode]> };

	let { inspector, ...stateProps }: Props = $props();
	const state = usePreziState(() => stateProps as RecipePreziScene);
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<section class="prezi-scene" class:is-panning={state.isPanning}>
	{#if state.showHeader}
		<header class="prezi-scene__header">
			<div class="prezi-scene__header-content">
				{#if state.title}
					<h2 class="prezi-scene__title">{state.title}</h2>
				{/if}
				{#if state.subtitle}
					<p class="prezi-scene__subtitle">{state.subtitle}</p>
				{/if}
			</div>

			<div class="prezi-scene__controls">
				<div class="prezi-scene__control-group">
					<button
						type="button"
						class="prezi-scene__control-button"
						title="Zoom out"
						onclick={() =>
							state.setCamera({ zoom: Math.max(state.minZoom, state.camera.zoom / 1.2) })}
						disabled={!state.zoomEnabled || state.camera.zoom <= state.minZoom}
					>
						<Icon name="minus" />
					</button>
					<span class="prezi-scene__zoom-level">{Math.round(state.camera.zoom * 100)}%</span>
					<button
						type="button"
						class="prezi-scene__control-button"
						title="Zoom in"
						onclick={() =>
							state.setCamera({ zoom: Math.min(state.maxZoom, state.camera.zoom * 1.2) })}
						disabled={!state.zoomEnabled || state.camera.zoom >= state.maxZoom}
					>
						<Icon name="plus" />
					</button>
				</div>

				<div class="prezi-scene__control-group">
					<button
						type="button"
						class="prezi-scene__control-button"
						title="Reset view"
						onclick={state.resetCamera}
					>
						<Icon name="rotate-ccw" />
					</button>
				</div>

				<div class="prezi-scene__control-group">
					<button
						type="button"
						class="prezi-scene__control-button"
						title="Toggle grid"
						onclick={state.toggleGrid}
						aria-pressed={state.showGrid}
					>
						<Icon name="grid-3x3" />
					</button>
					<button
						type="button"
						class="prezi-scene__control-button"
						title="Toggle minimap"
						onclick={state.toggleMinimap}
						aria-pressed={state.showMinimap}
					>
						<Icon name="map" />
					</button>
				</div>
			</div>
		</header>
	{/if}

	<div class="prezi-scene__viewport-container">
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="prezi-scene__viewport"
			use:state.viewport
			role="application"
			aria-label="Prezi scene viewport"
			aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown + - 0 Escape"
			tabindex="0"
			onwheel={state.handleWheel}
			onpointerdown={state.handlePointerDown}
			onpointermove={state.handlePointerMove}
			onpointerup={state.handlePointerUp}
			onpointerleave={state.handlePointerUp}
			onkeydown={state.handleKeyDown}
			onclick={(event) => event.currentTarget.focus()}
		>
			{#if state.showGrid}
				<Grid class="prezi-scene__grid" />
			{/if}

			<!-- World: единый CSS-трансформ. Ноды и линки внутри — raw world-координаты. -->
			<div
				class="prezi-scene__world"
				class:prezi-scene__world--animating={state.isAnimating}
				style={state.worldStyle}
			>
				{#if state.showLinks && state.sceneLinks.length > 0}
					<svg class="prezi-scene__links" aria-hidden="true">
						{#each state.sceneLinks as link (link.id)}
							<line
								x1={link.from.position.x}
								y1={link.from.position.y}
								x2={link.to.position.x}
								y2={link.to.position.y}
								stroke={link.to.accent}
								stroke-opacity="0.35"
								stroke-width="2"
								stroke-dasharray="6 8"
							/>
						{/each}
					</svg>
				{/if}

				{#each state.nodes as node (node.id)}
					<PresenterNodeShell
						{node}
						camera={state.nodeCamera}
						selected={node.id === state.selectedNodeId}
						onselect={() => state.focusNode(node)}
					/>
				{/each}
			</div>
		</div>

		{#if state.showMinimap}
			<div class="prezi-scene__minimap">
				<Minimap
					nodes={state.nodes.map((node) => ({
						id: node.id,
						x: node.position.x,
						y: node.position.y,
						width: 200,
						height: 120,
						color: node.accent,
						selected: node.id === state.selectedNodeId
					}))}
					zoom={state.camera.zoom}
					offset={{
						x: -state.camera.x / state.camera.zoom,
						y: -state.camera.y / state.camera.zoom
					}}
					width={200}
					height={140}
					showZoomControls={false}
					showViewport={true}
				/>
			</div>
		{/if}

		{#if state.showInspector && state.selectedNode && inspector}
			<div class="prezi-scene__inspector-slot">
				{@render inspector(state.selectedNode)}
			</div>
		{/if}
	</div>
</section>

<style>
	.prezi-scene {
		position: relative;
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: var(--prezi-scene-min-height, 480px);
		background: var(--color-background-primary);
		border-radius: var(--border-radius-xl, 1rem);
		border: 1px solid var(--color-border-primary);
		overflow: hidden;
	}

	.prezi-scene__header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid var(--color-border-primary);
		background: var(--color-background-secondary);
		flex-shrink: 0;
	}

	.prezi-scene__header-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.prezi-scene__title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.prezi-scene__subtitle {
		margin: 0;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.prezi-scene__controls {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.prezi-scene__control-group {
		display: flex;
		gap: 0.25rem;
		align-items: center;
	}

	.prezi-scene__control-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border: 1px solid var(--color-border-primary);
		border-radius: var(--border-radius-md, 0.375rem);
		background: var(--color-background-primary);
		color: var(--color-text-primary);
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease;
	}

	.prezi-scene__control-button:hover:not(:disabled) {
		background: var(--color-background-hover);
		border-color: var(--color-border-secondary);
	}

	.prezi-scene__control-button[aria-pressed='true'] {
		background: var(--color-background-active);
		border-color: var(--color-border-secondary);
	}

	.prezi-scene__control-button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.prezi-scene__zoom-level {
		min-width: 3rem;
		text-align: center;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	/* ─── Viewport ─── */

	.prezi-scene__viewport-container {
		position: relative;
		flex: 1;
		overflow: hidden;
	}

	.prezi-scene__viewport {
		width: 100%;
		height: 100%;
		position: relative;
		overflow: hidden;
		cursor: grab;
		outline: none;
		-webkit-user-select: none;
		user-select: none;
	}

	.prezi-scene__viewport:active,
	.prezi-scene.is-panning .prezi-scene__viewport {
		cursor: grabbing;
	}

	/* ─── World: единый GPU-layer для всех нод ─── */

	.prezi-scene__world {
		position: absolute;
		top: 0;
		left: 0;
		transform-origin: 0 0;
		will-change: transform;
		transition: none;
	}

	/* Prezi-анимация: плавный zoom-to-node (CSS делает всё тяжёлое) */
	.prezi-scene__world--animating {
		transition: transform var(--prezi-animation-duration, 600ms) cubic-bezier(0.16, 1, 0.3, 1);
	}

	:global(.prezi-scene__grid) {
		position: absolute;
		inset: 0;
		pointer-events: none;
		opacity: 0.5;
	}

	/* ─── Links (SVG внутри world-space) ─── */

	.prezi-scene__links {
		position: absolute;
		left: 0;
		top: 0;
		width: 0;
		height: 0;
		overflow: visible;
		pointer-events: none;
	}

	/* ─── Minimap ─── */

	.prezi-scene__minimap {
		position: absolute;
		bottom: 1rem;
		left: 1rem;
		z-index: 10;
		border-radius: var(--border-radius-lg, 0.5rem);
		overflow: hidden;
		box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
	}

	/* ─── Inspector slot (positioning wrapper) ─── */

	.prezi-scene__inspector-slot {
		position: absolute;
		top: 1rem;
		right: 1rem;
		z-index: 20;
		max-height: calc(100% - 2rem);
		overflow: hidden;
	}
</style>
