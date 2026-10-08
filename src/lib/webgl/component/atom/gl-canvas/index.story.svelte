<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import GlCanvas from './index.svelte';

	const controls: SlotStory[] = [];

	function frame(gl: WebGL2RenderingContext, timeMs: number) {
		const pulse = (Math.sin(timeMs * 0.001) + 1) * 0.5;
		gl.clearColor(0.05, 0.08 + pulse * 0.16, 0.14 + pulse * 0.24, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}
</script>

<Story
	{controls}
	component={GlCanvas}
	title="GlCanvas"
	category="Atoms/WebGL"
	description="Base WebGL2 canvas with init, frame, and resize hooks."
	tags={['webgl', 'canvas', 'rendering']}
>
	{#snippet children()}
		<div class="preview">
			<GlCanvas {frame} />
		</div>
	{/snippet}
</Story>

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
