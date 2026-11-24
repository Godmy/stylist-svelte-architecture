<script lang="ts">
	import DrawingSurface from '$stylist/canvas/component/molecule/drawing-surface/index.svelte';
	import createDrawingOverlayState from '$stylist/canvas/component/molecule/drawing-overlay/state.svelte';
	import type { RecipeDrawingOverlay } from '$stylist/canvas/interface/recipe/drawing-overlay';

	const props: RecipeDrawingOverlay = $props();
	const state = createDrawingOverlayState(() => props);

	export function clear(): void {
		state.surface?.clear();
	}

	export function undo(): void {
		state.surface?.undo();
	}

	export function redo(): void {
		state.surface?.redo();
	}
</script>

<svelte:window onkeydown={state.keyDown} />

<div
	class={['drawing-overlay', props.class]}
	style:top="{state.offsetTop}px"
	bind:clientWidth={state.width}
	bind:clientHeight={state.height}
>
	{#if state.width > 0 && state.height > 0}
		<DrawingSurface
			bind:this={state.surface}
			width={state.width}
			height={state.height}
			backgroundColor="transparent"
			strokeColor={state.drawColor}
			strokeWidth={state.strokeWidth}
			onChange={state.onChange}
		/>
	{/if}
</div>

<style>
	.drawing-overlay {
		position: fixed;
		inset: 0;
		z-index: var(--z-index-layer9998);
	}
</style>
