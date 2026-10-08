<script lang="ts">
	import type { RecipeViewport } from '$stylist/workspace/interface/recipe/viewport';
	import createViewportState from './state.svelte';
	import Stage from '$stylist/workspace/component/atom/stage/index.svelte';
	import Grid from '$stylist/layout/component/atom/grid/index.svelte';

	let props: RecipeViewport = $props();
	const state = createViewportState(() => props);
</script>

<div
	class={state.classes}
	role="button"
	aria-roledescription="pan and zoom viewport"
	aria-label="Interactive viewport"
	aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown + - 0"
	tabindex="0"
	onmousedown={state.handleMouseDown}
	onmousemove={state.handleMouseMove}
	onmouseup={state.handleMouseUp}
	onmouseleave={state.handleMouseUp}
	onwheel={state.handleWheel}
	onkeydown={state.handleKeyDown}
	{...state.restProps}
>
	<Grid zoom={state.camera.zoom} visible={state.showGrid} />
	<Stage camera={state.camera} worldWidth={state.worldWidth} worldHeight={state.worldHeight}>
		{#if props.children}{#if props.children}{@render props.children()}{/if}{/if}
	</Stage>
</div>

<style>
	.viewport {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		cursor: grab;
		user-select: none;
		outline: none;
	}

	.viewport.dragging {
		cursor: grabbing;
	}
</style>
