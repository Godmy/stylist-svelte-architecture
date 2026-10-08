<script lang="ts">
	import Button from '$stylist/button/component/atom/button/index.svelte';
	import ConcentricCirclesScene from '$stylist/webgl/component/molecule/concentric-circles-scene/index.svelte';
	import HyperspaceScene from '$stylist/webgl/component/molecule/hyperspace-scene/index.svelte';

	type ActiveScene = 'circle' | 'hyperspace' | null;

	type Props = {
		ringCount?: number;
	};

	let { ringCount = 100 }: Props = $props();

	let container: HTMLDivElement;
	let activeScene = $state<ActiveScene>(null);

	function handleFullscreenChange() {
		if (document.fullscreenElement !== container) {
			activeScene = null;
		}
	}

	function open(scene: ActiveScene) {
		activeScene = scene;
		container.requestFullscreen();
	}

	$effect(() => {
		document.addEventListener('fullscreenchange', handleFullscreenChange);
		return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
	});
</script>

<div bind:this={container} class="scene-launcher">
	{#if activeScene === 'circle'}
		<ConcentricCirclesScene {ringCount} />
	{:else if activeScene === 'hyperspace'}
		<HyperspaceScene />
	{:else}
		<div class="scene-launcher__buttons">
			<Button variant="primary" size="lg" onclick={() => open('circle')}>Open circle</Button>
			<Button variant="primary" size="lg" onclick={() => open('hyperspace')}>Open hyperspace</Button
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
