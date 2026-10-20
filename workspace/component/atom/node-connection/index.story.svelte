<script lang="ts">
	import NodeConnection from './index.svelte';
	import type { RecipeNodeConnection } from '$stylist/workspace/interface/recipe/node-connection';

	// Render of index.story.ts: the connection draws an SVG group and needs an <svg> parent.
	let args: RecipeNodeConnection = $props();
</script>

<svg viewBox="0 0 480 220" width="480" height="220" style="overflow: visible; display: block;">
	<NodeConnection {...args} />
</svg>
