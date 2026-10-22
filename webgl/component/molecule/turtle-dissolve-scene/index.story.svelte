<script lang="ts">
	import TurtleDissolveScene from '$stylist/webgl/component/molecule/turtle-dissolve-scene/index.svelte';
	import type { RecipeTurtleDissolveScene } from '$stylist/webgl/interface/recipe/turtle-dissolve-scene';

	// Render of index.story.ts: the scene is absolutely positioned over its parent, so it needs a sized, positioned frame.
	let args: RecipeTurtleDissolveScene = $props();
</script>

<div class="preview">
	<TurtleDissolveScene {...args} />
</div>

<style>
	.preview {
		position: relative;
		width: min(100%, 42rem);
		height: 24rem;
		overflow: hidden;
		border: 1px solid var(--color-border-primary, #d1d5db);
		border-radius: 0.5rem;
		background: #0e1714;
	}
</style>
