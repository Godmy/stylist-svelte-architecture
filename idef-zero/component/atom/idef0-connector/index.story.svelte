<script lang="ts">
	import Idef0Connector from '$stylist/idef-zero/component/atom/idef0-connector/index.svelte';
	import type { RecipeIdef0Connector } from '$stylist/idef-zero/interface/recipe/idef0-connector';

	// Render of index.story.ts: the connector is an SVG fragment that needs an svg parent.
	let args: RecipeIdef0Connector = $props();
</script>

<svg width="420" height="120">
	<Idef0Connector {...args} />
</svg>
