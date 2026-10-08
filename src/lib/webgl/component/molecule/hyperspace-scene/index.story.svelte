<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import HyperspaceScene from './index.svelte';

	const controls: SlotStory[] = [];
</script>

<Story
	{controls}
	component={HyperspaceScene}
	title="HyperspaceScene"
	category="Molecules/WebGL"
	description="Animated hyperspace shader scene."
	tags={['webgl', 'shader', 'scene']}
>
	{#snippet children()}
		<div class="preview">
			<HyperspaceScene />
		</div>
	{/snippet}
</Story>

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
