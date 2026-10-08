<script lang="ts">
	import type { RecipeSceneCameraControl } from '$stylist/graph/interface/recipe/scene-camera-control';
	import createSceneCameraControlState from './state.svelte';

	let props: RecipeSceneCameraControl = $props();
	const state = createSceneCameraControlState(() => props);
</script>

<section
	class={state.containerClass}
	aria-label="Camera zoom and movement"
	{...state.restProps}
	onpointerdown={state.stopPointerPropagation}
	onwheel={state.stopWheelPropagation}
>
	<div class="scene-camera-control__map">
		<div class="scene-camera-control__label-row">
			<span>Camera plane</span>
			<span>{state.roundedTargetX}, {state.roundedTargetY}</span>
		</div>
		<div
			class="scene-camera-control__pad"
			role="slider"
			aria-label="Camera movement plane"
			aria-valuetext={`x ${state.roundedTargetX}, y ${state.roundedTargetY}`}
			aria-valuenow={props.targetX}
			aria-valuemin={-100}
			aria-valuemax={100}
			tabindex="0"
			onpointerdown={state.startTargetDrag}
			onpointermove={state.dragTarget}
			onpointerup={state.stopTargetDrag}
			onpointercancel={state.stopTargetDrag}
		>
			<span class="scene-camera-control__axis scene-camera-control__axis--x"></span>
			<span class="scene-camera-control__axis scene-camera-control__axis--y"></span>
			<span
				class="scene-camera-control__target"
				style:left={`${state.targetLeft}%`}
				style:top={`${state.targetTop}%`}
			></span>
		</div>
	</div>

	<div class="scene-camera-control__depth">
		<div class="scene-camera-control__label-row">
			<span>Zoom depth</span>
			<span>{Math.round(state.zoomProgress)}%</span>
		</div>
		<div class="scene-camera-control__slider-row">
			<input
				class="scene-camera-control__slider"
				type="range"
				min={props.minRadius}
				max={props.maxRadius}
				step="0.1"
				value={props.radius}
				aria-label="Zoom depth"
				oninput={state.updateRadius}
			/>
			<div class="scene-camera-control__depth-readout">
				<span>near</span>
				<strong>{state.radiusText}</strong>
				<span>far</span>
			</div>
		</div>
		<div class="scene-camera-control__fit">
			<span>fit radius</span>
			<span>{state.sceneFitRadiusText}</span>
		</div>
	</div>
</section>

<style>
	.scene-camera-control {
		position: absolute;
		right: 1rem;
		top: 1rem;
		z-index: 12;
		display: grid;
		grid-template-columns: 12rem 4.5rem;
		gap: 0.75rem;
		padding: 0.75rem;
		width: min(18rem, calc(100vw - 2rem));
		border: 1px solid rgb(255 255 255 / 14%);
		border-radius: 0.5rem;
		background: rgb(7 12 22 / 78%);
		color: white;
		box-shadow: 0 18px 40px rgb(0 0 0 / 28%);
		backdrop-filter: blur(12px);
		font-family: system-ui, sans-serif;
		pointer-events: auto;
	}

	.scene-camera-control__map,
	.scene-camera-control__depth {
		min-width: 0;
		display: grid;
		gap: 0.5rem;
	}

	.scene-camera-control__label-row,
	.scene-camera-control__fit {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		color: rgb(226 232 240 / 86%);
		font-size: 0.72rem;
		font-weight: 600;
		line-height: 1.2;
	}

	.scene-camera-control__pad {
		position: relative;
		aspect-ratio: 1;
		min-height: 9.25rem;
		overflow: hidden;
		border: 1px solid rgb(255 255 255 / 15%);
		border-radius: 0.375rem;
		background:
			linear-gradient(rgb(255 255 255 / 9%) 1px, transparent 1px),
			linear-gradient(90deg, rgb(255 255 255 / 9%) 1px, transparent 1px),
			radial-gradient(circle at center, rgb(34 197 94 / 18%), transparent 58%), rgb(15 23 42 / 88%);
		background-size:
			25% 25%,
			25% 25%,
			auto,
			auto;
		touch-action: none;
		cursor: crosshair;
	}

	.scene-camera-control__axis {
		position: absolute;
		background: rgb(148 163 184 / 52%);
		pointer-events: none;
	}

	.scene-camera-control__axis--x {
		left: 0;
		top: 50%;
		width: 100%;
		height: 1px;
	}

	.scene-camera-control__axis--y {
		left: 50%;
		top: 0;
		width: 1px;
		height: 100%;
	}

	.scene-camera-control__target {
		position: absolute;
		width: 1rem;
		height: 1rem;
		border: 2px solid white;
		border-radius: 999px;
		background: #22c55e;
		box-shadow: 0 0 0 4px rgb(34 197 94 / 22%);
		transform: translate(-50%, -50%);
		pointer-events: none;
	}

	.scene-camera-control__slider-row {
		display: grid;
		grid-template-columns: 2rem 2rem;
		gap: 0.5rem;
		align-items: center;
		min-height: 9.25rem;
	}

	.scene-camera-control__slider {
		width: 9.25rem;
		accent-color: #f59e0b;
		transform: rotate(-90deg);
		transform-origin: center;
	}

	.scene-camera-control__depth-readout {
		display: grid;
		justify-items: center;
		gap: 0.35rem;
		color: rgb(226 232 240 / 72%);
		font-size: 0.68rem;
	}

	.scene-camera-control__depth-readout strong {
		color: white;
		font-size: 0.82rem;
	}

	@media (max-width: 720px) {
		.scene-camera-control {
			top: auto;
			right: 0.75rem;
			bottom: 0.75rem;
			grid-template-columns: 1fr;
		}

		.scene-camera-control__slider-row {
			min-height: 3rem;
			grid-template-columns: 1fr 3rem;
		}

		.scene-camera-control__slider {
			width: 100%;
			transform: none;
		}
	}
</style>
