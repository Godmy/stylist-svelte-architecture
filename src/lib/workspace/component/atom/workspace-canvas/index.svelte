<script lang="ts">
	import type { RecipeWorkspaceCanvas } from '$stylist/workspace/interface/recipe/workspace-canvas';
	import { createWorkspaceCanvasState } from './state.svelte';
	let props: RecipeWorkspaceCanvas = $props();
	const state = createWorkspaceCanvasState(() => props);

	let canvasRef: HTMLDivElement;
	let contentRef: HTMLDivElement;

	$effect(() => {
		const customEvent = new CustomEvent('workspace-canvas-ready', {
			detail: {
				resetView: state.resetView,
				zoomToFit: () => state.zoomToFit(canvasRef, contentRef),
				snapToGrid: state.snapToGrid
			}
		});
		canvasRef?.dispatchEvent(customEvent);
	});
</script>

<div
	bind:this={canvasRef}
	class={state.containerClass}
	style={`width: ${state.width}px; height: ${state.height}px; overflow: hidden;`}
	onwheel={state.handleWheel}
	onmousedown={state.handleMouseDown}
	onmousemove={state.handleMouseMove}
	onmouseup={state.handleMouseUp}
	onmouseleave={state.handleMouseUp}
	onclick={state.handleClick}
	ondblclick={state.handleDoubleClick}
	oncontextmenu={state.handleContextMenu}
	{...state.restProps}
>
	<!-- Grid layer -->
	<div
		class={state.gridClass}
		style={`${state.gridStyles} ${state.transformStyle}`}
		aria-hidden="true"
	></div>

	<!-- Content layer -->
	<div bind:this={contentRef} class={state.contentClass} style={state.transformStyle}>
		{#if props.children}{@render props.children()}{/if}
	</div>
</div>

<style>
	.workspace-canvas {
		position: relative;
		overflow: hidden;
		background: var(--background-color, #1e1e1e);
		touch-action: none;
	}

	.workspace-canvas__grid {
		position: absolute;
		top: 0;
		left: 0;
		width: 5000%;
		height: 5000%;
		margin-left: -2500%;
		margin-top: -2500%;
		pointer-events: none;
	}

	.workspace-canvas__grid--dot {
		background-image: radial-gradient(var(--grid-color) 1px, transparent 0);
		background-size: var(--grid-size) var(--grid-size);
	}

	.workspace-canvas__content {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>
