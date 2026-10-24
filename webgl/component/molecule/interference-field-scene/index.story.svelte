<script lang="ts">
	import InterferenceFieldScene from '$stylist/webgl/component/molecule/interference-field-scene/index.svelte';
	import type { RecipeInterferenceFieldScene } from '$stylist/webgl/interface/recipe/interference-field-scene';

	// Render of index.story.ts: the WebGL canvas fills its parent, so the scene needs a sized frame.
	let args: RecipeInterferenceFieldScene = $props();
</script>

<div class="preview">
	<InterferenceFieldScene {...args} />
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
