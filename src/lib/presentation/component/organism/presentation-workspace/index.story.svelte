<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import PresentationWorkspace from './index.svelte';
</script>

<Story
	id="organisms-architecture-presentation-workspace"
	title="Organisms / Architecture / Presentation Workspace"
	component={PresentationWorkspace}
	category="Organisms/Architecture"
	description="Route-level presentation workspace with step editing, presenter notes, playback controls, and semantic-zoom scene navigation."
>
	{#snippet children()}
		<PresentationWorkspace />
	{/snippet}
</Story>
