<script lang="ts">
	import PresentationWorkspace from '$stylist/presentation/component/organism/presentation-workspace/index.svelte';

	let { class: className = '' }: { class?: string } = $props();
</script>

<div class="c-presentation-workplace {className}">
	<PresentationWorkspace />
</div>

<style>
	.c-presentation-workplace {
		min-height: 100vh;
	}
</style>
