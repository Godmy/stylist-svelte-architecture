<script lang="ts">
	import Idef0PortLabel from './index.svelte';
	import type { RecipeIdef0PortLabel } from '$stylist/idef-zero/interface/recipe/idef0-port-label';

	// Render of index.story.ts: the label is an SVG text element that needs an svg parent.
	let args: RecipeIdef0PortLabel = $props();
</script>

<svg width="320" height="100">
	<Idef0PortLabel {...args} />
</svg>
