<script lang="ts">
	import { onMount } from 'svelte';
	import createSceneState from '$stylist/graph/component/organism/scene/state.svelte';
	import type { RecipeScene } from '$stylist/graph/interface/recipe/scene';
	import SceneCameraControl from '$stylist/graph/component/molecule/scene-camera-control/index.svelte';

	let props: RecipeScene = $props();
	const state = createSceneState(() => props);
	let canvasRef: HTMLCanvasElement | null = null;

	onMount(() => {
		if (canvasRef) {
			state.mount(canvasRef);
		}

		return () => {
			state.destroy();
		};
	});
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') state.hideHint();
	}}
/>

<div class={state.containerClass} data-theme={state.theme} {...state.restProps}>
	<canvas
		bind:this={canvasRef}
		class={state.canvasClass}
		onmousemove={state.showHint}
		onmouseleave={state.hideHint}
		aria-label={state.title}
	></canvas>
	{#if state.hint}
		<div
			class="scene__hint"
			role="tooltip"
			style:left="{state.hint.x}px"
			style:top="{state.hint.y}px"
		>
			<strong>{state.hint.label}</strong>{#if state.hint.description}<span
					>{state.hint.description}</span
				>{/if}
		</div>
	{/if}
	<SceneCameraControl
		radius={state.cameraControl.radius}
		minRadius={state.cameraControl.minRadius}
		maxRadius={state.cameraControl.maxRadius}
		sceneFitRadius={state.cameraControl.sceneFitRadius}
		targetX={state.cameraControl.targetX}
		targetY={state.cameraControl.targetY}
		onradiuschange={state.setCameraRadius}
		ontargetchange={state.setCameraTarget}
	/>
	{#if props.showOverlay !== false}
		<div class={state.overlayClass}>
			<div class="scene__eyebrow">{state.debugInfo.context}</div>
			<h2>{state.title}</h2>
			<div class="scene__metric-grid">
				<div>
					<span>{state.debugInfo.graphNodes}</span>
					<small>{state.text.nodes}</small>
				</div>
				<div>
					<span>{state.debugInfo.graphConnections}</span>
					<small>{state.text.links}</small>
				</div>
				<div>
					<span>{state.debugInfo.drawCount}</span>
					<small>{state.text.frames}</small>
				</div>
			</div>
			<div class="scene__selection">
				<small>{state.text.selected}</small>
				<span>{state.debugInfo.selectedAtom}</span>
			</div>
			{#if state.debugInfo.lastError}
				<p class="scene__error">{state.debugInfo.lastError}</p>
			{/if}
		</div>
	{:else if state.debugInfo.lastError}
		<p class="scene__error scene__error--standalone" role="alert">{state.debugInfo.lastError}</p>
	{/if}
</div>

<style>
	.scene__error--standalone {
		position: absolute;
		top: 1rem;
		left: 1rem;
		max-width: calc(100% - 2rem);
		margin: 0;
		padding: 12px 16px;
		border-radius: 6px;
		background: #fffffff0;
	}
	.scene__hint {
		position: fixed;
		z-index: 1000;
		max-width: 310px;
		background: #153348;
		color: white;
		padding: 12px 15px;
		border-radius: 8px;
		font:
			13px/1.5 system-ui,
			sans-serif;
		pointer-events: none;
		overflow-wrap: anywhere;
		box-shadow: 0 8px 28px #0003;
	}
	.scene__hint span {
		display: block;
		margin-top: 5px;
	}
	.scene {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 600px;
		overflow: hidden;
		background:
			radial-gradient(circle at 22% 18%, rgb(40 102 136 / 34%), transparent 34%),
			radial-gradient(circle at 78% 12%, rgb(150 83 190 / 22%), transparent 30%),
			linear-gradient(140deg, #071018, #11131b 54%, #15131a);
	}

	.scene__canvas {
		width: 100%;
		height: 100%;
		display: block;
		min-height: inherit;
	}

	.scene__overlay {
		position: absolute;
		top: 1rem;
		left: 1rem;
		width: min(22rem, calc(100vw - 2rem));
		background: rgb(8 12 18 / 78%);
		border: 1px solid rgb(255 255 255 / 10%);
		color: rgb(240 246 252);
		padding: 1rem;
		border-radius: 0.5rem;
		box-shadow: 0 1.5rem 4rem rgb(0 0 0 / 34%);
		font-family:
			Inter,
			ui-sans-serif,
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
		font-size: 0.875rem;
		pointer-events: none;
		backdrop-filter: blur(18px);
	}

	.scene__overlay h2 {
		margin: 0;
		font-size: 1.35rem;
		font-weight: 650;
		line-height: 1.15;
	}

	.scene__eyebrow {
		width: fit-content;
		margin-bottom: 0.55rem;
		padding: 0.18rem 0.45rem;
		border: 1px solid rgb(102 222 242 / 22%);
		border-radius: 999px;
		color: rgb(126 232 244);
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0;
		text-transform: uppercase;
	}

	.scene__metric-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.55rem;
		margin-top: 0.9rem;
	}

	.scene__metric-grid div,
	.scene__selection {
		border: 1px solid rgb(255 255 255 / 8%);
		border-radius: 0.45rem;
		background: rgb(255 255 255 / 5%);
	}

	.scene__metric-grid div {
		min-width: 0;
		padding: 0.65rem 0.7rem;
	}

	.scene__metric-grid span,
	.scene__selection span {
		display: block;
		color: white;
		font-weight: 700;
	}

	.scene__metric-grid span {
		font-size: 1.1rem;
	}

	.scene__metric-grid small,
	.scene__selection small {
		display: block;
		margin-top: 0.18rem;
		color: rgb(171 184 198);
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0;
	}

	.scene__selection {
		margin-top: 0.55rem;
		padding: 0.7rem 0.75rem;
	}

	.scene__selection span {
		margin-top: 0.28rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.scene__error {
		margin: 0.75rem 0 0;
		color: rgb(255 160 150);
	}

	/* Light theme: warm paper canvas, white panels, dark ink; the camera control follows. */
	.scene[data-theme='light'] {
		background:
			radial-gradient(circle at 22% 18%, rgb(120 170 210 / 16%), transparent 34%),
			radial-gradient(circle at 78% 12%, rgb(200 160 110 / 14%), transparent 30%),
			linear-gradient(145deg, #f8f6f1, #f3f0ea 55%, #efeae2);
	}
	[data-theme='light'] .scene__overlay {
		background: rgb(255 255 255 / 90%);
		border-color: rgb(23 32 51 / 10%);
		color: #1d2633;
		box-shadow: 0 1rem 2.5rem rgb(23 32 51 / 12%);
	}
	[data-theme='light'] .scene__eyebrow {
		border-color: rgb(20 130 150 / 30%);
		color: #137085;
	}
	[data-theme='light'] .scene__metric-grid div,
	[data-theme='light'] .scene__selection {
		border-color: rgb(23 32 51 / 8%);
		background: rgb(23 32 51 / 3%);
	}
	[data-theme='light'] .scene__metric-grid span,
	[data-theme='light'] .scene__selection span {
		color: #172033;
	}
	[data-theme='light'] .scene__metric-grid small,
	[data-theme='light'] .scene__selection small {
		color: #5f6b7a;
	}
	[data-theme='light'] .scene__error {
		color: #b42323;
	}
	[data-theme='light'] :global(.scene-camera-control) {
		border-color: rgb(23 32 51 / 12%);
		background: rgb(255 255 255 / 88%);
		color: #172033;
	}
	[data-theme='light'] :global(.scene-camera-control__label-row),
	[data-theme='light'] :global(.scene-camera-control__fit),
	[data-theme='light'] :global(.scene-camera-control__depth-readout) {
		color: #3a4656;
	}
	[data-theme='light'] :global(.scene-camera-control__depth-readout strong) {
		color: #172033;
	}
	[data-theme='light'] :global(.scene-camera-control__pad) {
		border-color: rgb(23 32 51 / 15%);
	}

	@media (max-width: 640px) {
		.scene {
			min-height: 520px;
		}

		.scene__overlay {
			right: 0.75rem;
			left: 0.75rem;
			width: auto;
		}
	}
</style>
