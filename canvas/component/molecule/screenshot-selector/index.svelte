<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { RecipeScreenshotSelector } from '$stylist/canvas/interface/recipe/screenshot-selector';
	import { createScreenshotSelectorState } from './state.svelte';
	let props: RecipeScreenshotSelector & HTMLAttributes<HTMLDivElement> = $props();
	const state = createScreenshotSelectorState(() => props);

	$effect(() => {
		if (state.canvasElement && typeof window !== 'undefined') {
			state.canvasElement.width = window.innerWidth;
			state.canvasElement.height = window.innerHeight;
		}
	});

	// Redraw when drawing mode changes or color changes
	$effect(() => {
		if (state.drawingMode || state.drawColor) {
			state.drawOnCanvas();
		}
	});
</script>

<div
	bind:this={state.overlayElement}
	class="screenshot-overlay {state.drawingMode && state.selectionFixed ? 'drawing-mode' : ''}"
	onpointerdown={state.handlePointerDown}
	onpointermove={state.handlePointerMove}
	onpointerup={state.handlePointerUp}
	style="background: {state.selectionFixed
		? 'color-mix(in srgb, var(--color-text-primary) 30%, transparent)'
		: 'color-mix(in srgb, var(--color-text-primary) 50%, transparent)'};"
>
	<!-- Selection rectangle -->
	{#if (state.isSelecting || state.selectionFixed) && state.rect.width > 5 && state.rect.height > 5}
		<div
			class="selection-rect"
			style="left: {state.rect.x}px; top: {state.rect.y}px; width: {state.rect
				.width}px; height: {state.rect.height}px;"
		></div>
	{/if}

	<!-- Drawing canvas -->
	{#if state.selectionFixed && state.drawingMode}
		<canvas
			bind:this={state.canvasElement}
			class="drawing-canvas"
			style="pointer-events: {state.drawingMode ? 'auto' : 'none'};"
		></canvas>
	{/if}
</div>

<style>
	.screenshot-overlay {
		position: fixed;
		inset: 0;
		z-index: var(--z-index-layer9999);
		cursor: crosshair;
	}

	.selection-rect {
		position: absolute;
		border: 2px dashed var(--playground-accent, var(--color-warning-500));
		background: color-mix(in srgb, var(--color-warning-500) 10%, transparent);
		pointer-events: none;
	}

	.drawing-canvas {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.drawing-mode {
		cursor: crosshair;
	}
</style>
