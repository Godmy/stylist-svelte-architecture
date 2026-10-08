<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import RecipeDrawingOverlay from './index.svelte';

	const controls: SlotStory[] = [{ name: 'drawColor', type: 'color', defaultValue: '#ff0000' }];
</script>

<Story
	component={RecipeDrawingOverlay}
	title="Drawing Overlay"
	description="Canvas-domain annotation layer for freehand drawing over previews or captured regions."
	{controls}
>
	{#snippet children(values: any)}
		<RecipeDrawingOverlay drawColor={values.drawColor} />
	{/snippet}
</Story>
