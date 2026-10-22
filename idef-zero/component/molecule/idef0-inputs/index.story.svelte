<script lang="ts">
	import Idef0Inputs from '$stylist/idef-zero/component/molecule/idef0-inputs/index.svelte';
	import type { RecipeIdef0Io } from '$stylist/idef-zero/interface/recipe/idef0-io';

	// Render of index.story.ts: the connectors are an SVG group drawn against a box outline.
	let args: RecipeIdef0Io = $props();
</script>

<svg width="460" height="260">
	<rect
		x={args.boxX}
		y={args.boxY ?? 0}
		width="220"
		height={args.boxHeight}
		fill="none"
		stroke="#cbd5e1"
	/>
	<Idef0Inputs {...args} />
</svg>
