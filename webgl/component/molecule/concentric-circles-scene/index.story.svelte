<script lang="ts">
	import ConcentricCirclesScene from './index.svelte';
	import type { RecipeConcentricCirclesScene } from '$stylist/webgl/interface/recipe/concentric-circles-scene';

	// Render of index.story.ts: the WebGL canvas fills its parent, so the scene needs a sized frame.
	let args: RecipeConcentricCirclesScene = $props();
</script>

<div class="preview">
	<ConcentricCirclesScene {...args} />
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
