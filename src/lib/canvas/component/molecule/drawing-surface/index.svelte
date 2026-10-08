<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import createDrawingSurfaceState from './state.svelte';
	import type { RecipeDrawingSurface } from '$stylist/canvas/interface/recipe/drawing-surface';
	import type { SlotDrawingSurfaceCanvasClearedEvent } from '$stylist/canvas/interface/slot/drawing-surface-canvas-cleared-event';
	import type { SlotDrawingSurfaceExposeMethodsEvent } from '$stylist/canvas/interface/slot/drawing-surface-expose-methods-event';

	let dispatch = createEventDispatcher<{
		'canvas-cleared': SlotDrawingSurfaceCanvasClearedEvent;
		'expose-methods': SlotDrawingSurfaceExposeMethodsEvent;
	}>();

	const contract: RecipeDrawingSurface = $props();
	let canvasRef: HTMLCanvasElement | null = null;
	const state = createDrawingSurfaceState(() => contract, (type, detail) =>
		dispatch(type as 'canvas-cleared' | 'expose-methods', detail as never)
	);

	$effect(() => {
		state.fillBackground(canvasRef);
		state.exposeMethods(canvasRef);
	});
</script>

<canvas
	bind:this={canvasRef}
	width={state.width}
	height={state.height}
	class={state.canvasClass}
	onmousedown={(event) => state.startDrawing(event, canvasRef)}
	onmousemove={(event) => state.draw(event, canvasRef)}
	onmouseup={() => state.stopDrawing(canvasRef)}
	onmouseleave={() => state.stopDrawing(canvasRef)}
	{...state.restProps}
></canvas>

<style>
	.drawing-surface__canvas {
		display: block;
		cursor: crosshair;
		touch-action: none;
	}
</style>
