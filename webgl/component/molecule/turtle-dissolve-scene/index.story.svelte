<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import TurtleDissolveScene from './index.svelte';

	const controls: SlotStory[] = [
		{ name: 'progress', type: 'range', defaultValue: 0.6, min: 0, max: 1, step: 0.01 }
	];
</script>

<Story
	{controls}
	component={TurtleDissolveScene}
	title="TurtleDissolveScene"
	category="Molecules/WebGL"
	description="Procedural teal/white caustic dissolve field, intensity peaking mid-progress. The turtle-hero-morph organism's WebGL accent during the photo→mark morph window."
	tags={['webgl', 'shader', 'scene']}
>
	{#snippet children(values: any)}
		<div class="preview">
			<TurtleDissolveScene progress={Number(values.progress) || 0} />
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
		background: #0e1714;
	}
</style>
