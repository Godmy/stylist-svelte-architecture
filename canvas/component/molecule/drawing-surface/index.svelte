<script lang="ts">
	import { untrack } from 'svelte';
	import createDrawingSurfaceState from '$stylist/canvas/component/molecule/drawing-surface/state.svelte';
	import type { RecipeDrawingSurface } from '$stylist/canvas/interface/recipe/drawing-surface';

	const contract: RecipeDrawingSurface = $props();
	const state = createDrawingSurfaceState(() => contract);

	$effect(() => {
		const incoming = contract.strokes;
		untrack(() => state.syncFromProps(incoming));
	});

	$effect(() => {
		void state.strokes;
		void state.current;
		void state.width;
		void state.height;
		state.render(state.canvasElement);
	});

	/** Removes all strokes (undoable). */
	export function clear(): void {
		state.clear();
	}

	export function undo(): void {
		state.undo();
	}

	export function redo(): void {
		state.redo();
	}

	/** PNG data URL of the drawing over its background. */
	export function toDataUrl(): string {
		return state.toDataUrl(state.canvasElement);
	}
</script>

<canvas
	bind:this={state.canvasElement}
	class={state.canvasClass}
	style:width="{state.width}px"
	style:aspect-ratio="{state.width} / {state.height}"
	style:background={state.backgroundColor}
	onpointerdown={(event) => state.pointerDown(event, state.canvasElement)}
	onpointermove={(event) => state.pointerMove(event, state.canvasElement)}
	onpointerup={(event) => state.pointerUp(event, state.canvasElement)}
	onpointercancel={(event) => state.pointerUp(event, state.canvasElement)}
	{...state.restProps}
></canvas>

<style>
	.drawing-surface__canvas {
		display: block;
		max-width: 100%;
		cursor: crosshair;
		touch-action: none;
	}

	.drawing-surface__canvas--disabled {
		cursor: default;
	}
</style>
