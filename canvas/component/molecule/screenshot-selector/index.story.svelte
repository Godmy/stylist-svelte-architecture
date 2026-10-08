<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import RecipeScreenshotSelector from './index.svelte';

	const controls: SlotStory[] = [
		{ name: 'drawingMode', type: 'boolean', defaultValue: false },
		{ name: 'drawColor', type: 'color', defaultValue: '#ef4444' }
	];
</script>

<Story
	component={RecipeScreenshotSelector}
	title="Screenshot Selector"
	description="Canvas-domain overlay for selecting screenshot regions and optionally drawing annotations."
	{controls}
>
	{#snippet children(values: any)}
		<RecipeScreenshotSelector drawingMode={values.drawingMode} drawColor={values.drawColor} />
	{/snippet}
</Story>
