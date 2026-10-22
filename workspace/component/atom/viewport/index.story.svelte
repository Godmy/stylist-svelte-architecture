<script lang="ts">
	import Viewport from '$stylist/workspace/component/atom/viewport/index.svelte';
	import type { RecipeViewport } from '$stylist/workspace/interface/recipe/viewport';

	// Render of index.story.ts: the viewport moves the camera it receives, so the story owns it as local state, with world content.
	let args: RecipeViewport = $props();
	let camera = $state({ x: 0, y: 0, zoom: 1 });

	$effect.pre(() => {
		const { x, y, zoom } = args.camera;
		camera.x = x;
		camera.y = y;
		camera.zoom = zoom;
	});

	const tiles = [
		{ label: 'Source', left: 80, top: 80, color: '#16a34a' },
		{ label: 'Processor', left: 360, top: 200, color: '#2563eb' },
		{ label: 'Output', left: 640, top: 320, color: '#d97706' }
	];
</script>

<div class="viewport-story">
	<Viewport {...args} {camera}>
		{#each tiles as tile (tile.label)}
			<div
				class="viewport-story__tile"
				style:left="{tile.left}px"
				style:top="{tile.top}px"
				style:background={tile.color}
			>
				{tile.label}
			</div>
		{/each}
	</Viewport>
</div>
<p class="viewport-story__camera">
	x {Math.round(camera.x)} / y {Math.round(camera.y)} / zoom {camera.zoom.toFixed(2)}
</p>

<style>
	.viewport-story {
		height: 320px;
		border: 1px solid var(--color-border-primary);
		border-radius: var(--border-radius-md);
		overflow: hidden;
		background: var(--color-background-secondary);
	}

	.viewport-story__tile {
		position: absolute;
		width: 180px;
		height: 96px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--border-radius-lg);
		color: #ffffff;
		font-weight: 600;
	}

	.viewport-story__camera {
		margin: var(--spacing-2) 0 0;
		font-size: 0.8rem;
		color: var(--color-text-secondary);
	}
</style>
