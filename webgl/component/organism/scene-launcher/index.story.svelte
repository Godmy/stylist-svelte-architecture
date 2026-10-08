<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import SceneLauncher from './index.svelte';

	const controls: SlotStory[] = [
		{ name: 'ringCount', type: 'range', defaultValue: 100, min: 8, max: 180, step: 1 }
	];
</script>

<Story
	{controls}
	component={SceneLauncher}
	title="SceneLauncher"
	category="Organisms/WebGL"
	description="Fullscreen launcher for WebGL shader scenes."
	tags={['webgl', 'fullscreen', 'scene']}
>
	{#snippet children(values: any)}
		<div class="preview">
			<SceneLauncher ringCount={Number(values.ringCount) || 100} />
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
		background: var(--color-background-secondary, #f9fafb);
	}
</style>
