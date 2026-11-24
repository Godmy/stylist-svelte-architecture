<script lang="ts">
	import Button from '$stylist/button/component/atom/button/index.svelte';
	import ConcentricCirclesScene from '$stylist/webgl/component/molecule/concentric-circles-scene/index.svelte';
	import HyperspaceScene from '$stylist/webgl/component/molecule/hyperspace-scene/index.svelte';

	import type { RecipeSceneLauncher } from '$stylist/webgl/interface/recipe/scene-launcher';
	import createSceneLauncherComponentState from '$stylist/webgl/component/organism/scene-launcher/state.svelte';
	type ActiveScene = 'circle' | 'hyperspace' | null;
	let { ringCount = 100 }: RecipeSceneLauncher = $props();

	const state = createSceneLauncherComponentState();
</script>

<div bind:this={state.container} class="scene-launcher">
	{#if state.activeScene === 'circle'}
		<ConcentricCirclesScene {ringCount} />
	{:else if state.activeScene === 'hyperspace'}
		<HyperspaceScene />
	{:else}
		<div class="scene-launcher__buttons">
			<Button variant="primary" size="lg" onclick={() => state.open('circle')}
				>{state.t('circle')}</Button
			>
			<Button variant="primary" size="lg" onclick={() => state.open('hyperspace')}
				>{state.t('hyperspace')}</Button
			>
		</div>
	{/if}
</div>

<style>
	.scene-launcher {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.scene-launcher:fullscreen {
		background: #000;
	}

	.scene-launcher__buttons {
		display: flex;
		gap: 1rem;
	}
</style>
