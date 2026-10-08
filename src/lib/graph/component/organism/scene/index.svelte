<script lang="ts">
	import { onMount } from 'svelte';
	import createSceneState from './state.svelte';
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

<div class={state.containerClass} {...state.restProps}>
	<canvas bind:this={canvasRef} class={state.canvasClass}></canvas>
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
	<div class={state.overlayClass}>
		<div class="scene__eyebrow">{state.debugInfo.context}</div>
		<h2>{state.title}</h2>
		<div class="scene__metric-grid">
			<div>
				<span>{state.debugInfo.graphNodes}</span>
				<small>nodes</small>
			</div>
			<div>
				<span>{state.debugInfo.graphConnections}</span>
				<small>links</small>
			</div>
			<div>
				<span>{state.debugInfo.drawCount}</span>
				<small>frames</small>
			</div>
		</div>
		<div class="scene__selection">
			<small>selected</small>
			<span>{state.debugInfo.selectedAtom}</span>
		</div>
		{#if state.debugInfo.lastError}
			<p class="scene__error">{state.debugInfo.lastError}</p>
		{/if}
	</div>
</div>

<style>
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
