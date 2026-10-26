<script lang="ts">
	import type { RecipeViewport } from '$stylist/workspace/interface/recipe/viewport';
	import createViewportState from '$stylist/workspace/component/atom/viewport/state.svelte';
	import Stage from '$stylist/workspace/component/atom/stage/index.svelte';
	import GridPattern from '$stylist/workspace/component/atom/grid-pattern/index.svelte';

	import { WORKSPACE_VIEWPORT_MESSAGE } from '$stylist/workspace/const/record/viewport-message';
	import { useMessage } from '$stylist/localization/function/hook/use-message';

	let props: RecipeViewport = $props();
	const state = createViewportState(() => props);
	const t = useMessage('viewport', WORKSPACE_VIEWPORT_MESSAGE);
</script>

<div
	class={state.classes}
	role="button"
	aria-roledescription={t('role')}
	aria-label={t('label')}
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
	<GridPattern zoom={state.camera.zoom} visible={state.showGrid} />
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
