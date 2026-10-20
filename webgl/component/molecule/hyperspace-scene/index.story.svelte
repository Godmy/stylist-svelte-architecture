<script lang="ts">
	import HyperspaceScene from './index.svelte';
	import type { RecipeHyperspaceScene } from '$stylist/webgl/interface/recipe/hyperspace-scene';

	// Render of index.story.ts: the WebGL canvas fills its parent, so the scene needs a sized frame.
	let args: RecipeHyperspaceScene = $props();
</script>

<div class="preview">
	<HyperspaceScene {...args} />
</div>

<style>
	.preview {
		width: min(100%, 42rem);
		height: 24rem;
		overflow: hidden;
		border: 1px solid var(--color-border-primary, #d1d5db);
		border-radius: 0.5rem;
		background: #020617;
	}
</style>
