<script lang="ts">
	import type { RecipeScreenshotSelector } from '$stylist/canvas/interface/recipe/screenshot-selector';
	import createScreenshotSelectorState from '$stylist/canvas/component/molecule/screenshot-selector/state.svelte';
	import { CANVAS_SCREENSHOT_SELECTOR_MESSAGE } from '$stylist/canvas/const/record/screenshot-selector-message';
	import { useMessage } from '$stylist/localization/function/hook/use-message';

	const props: RecipeScreenshotSelector = $props();
	const state = createScreenshotSelectorState(() => props);
	const t = useMessage('screenshot-selector', CANVAS_SCREENSHOT_SELECTOR_MESSAGE);

	$effect(() => {
		void state.paths;
		void state.currentPath;
		void state.viewport;
		state.render(state.canvasElement);
	});
</script>

<svelte:window
	bind:innerWidth={state.viewportWidth}
	bind:innerHeight={state.viewportHeight}
	onkeydown={state.keyDown}
/>

<div
	role="application"
	aria-label={t('label')}
	class={['screenshot-overlay', state.selectionFixed && 'screenshot-overlay--fixed', props.class]}
	onpointerdown={state.pointerDown}
	onpointermove={state.pointerMove}
	onpointerup={state.pointerUp}
	onpointercancel={state.pointerUp}
>
	{#if state.hasSelection}
		<div
			class="selection-rect"
			style="left: {state.rect.x}px; top: {state.rect.y}px; width: {state.rect
				.width}px; height: {state.rect.height}px;"
		></div>
	{/if}

	{#if state.selectionFixed}
		<canvas
			bind:this={state.canvasElement}
			class="drawing-canvas"
			style:width="{state.viewportWidth}px"
			style:height="{state.viewportHeight}px"
			aria-hidden="true"
		></canvas>
	{/if}
</div>

<style>
	.screenshot-overlay {
		position: fixed;
		inset: 0;
		z-index: var(--z-index-layer9999);
		cursor: crosshair;
		touch-action: none;
		background: color-mix(in srgb, var(--color-text-primary) 50%, transparent);
	}

	.screenshot-overlay--fixed {
		background: color-mix(in srgb, var(--color-text-primary) 30%, transparent);
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
</style>
