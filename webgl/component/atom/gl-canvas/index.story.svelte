<script lang="ts">
	import GlCanvas from './index.svelte';
	import type { RecipeGlCanvas } from '$stylist/webgl/interface/recipe/gl-canvas';

	// Render of index.story.ts: the canvas draws only through the frame callback, and it fills a sized frame.
	let args: RecipeGlCanvas = $props();

	function frame(gl: WebGL2RenderingContext, timeMs: number) {
		const pulse = (Math.sin(timeMs * 0.001) + 1) * 0.5;
		gl.clearColor(0.05, 0.08 + pulse * 0.16, 0.14 + pulse * 0.24, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}
</script>

<div class="preview">
	<GlCanvas {frame} {...args} />
</div>

<style>
	.preview {
		width: min(100%, 42rem);
		height: 18rem;
		overflow: hidden;
		border: 1px solid var(--color-border-primary, #d1d5db);
		border-radius: 0.5rem;
		background: #020617;
	}
</style>
