<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { RecipeDrawingOverlay } from '$stylist/canvas/interface/recipe/drawing-overlay';
	import { createDrawingOverlayState } from './state.svelte';
	let props: RecipeDrawingOverlay & HTMLAttributes<HTMLDivElement> = $props();
	const state = createDrawingOverlayState(() => props);
</script>

<div class="drawing-overlay">
	<canvas
		bind:this={state.canvasElement}
		class="drawing-canvas"
		onpointerdown={state.handlePointerDown}
		onpointermove={state.handlePointerMove}
		onpointerup={state.handlePointerUp}
	></canvas>
</div>

<style>
	.drawing-overlay {
		position: fixed;
		inset: 0;
		z-index: var(--z-index-layer9998);
		pointer-events: none;
	}

	.drawing-canvas {
		position: absolute;
		top: 56px;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: auto;
		cursor: crosshair;
	}
</style>
