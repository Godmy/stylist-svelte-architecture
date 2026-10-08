<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import PresentationWorkplace from './index.svelte';
</script>

<Story
	id="pages-presentation-presentation-workplace"
	title="Pages / Presentation / Presentation Workplace"
	component={PresentationWorkplace}
	category="Pages/Presentation"
	description="Route-level Prezi-style presentation workplace: step editing, presenter notes, playback controls, and semantic-zoom scene navigation."
>
	{#snippet children()}
		<PresentationWorkplace />
	{/snippet}
</Story>
