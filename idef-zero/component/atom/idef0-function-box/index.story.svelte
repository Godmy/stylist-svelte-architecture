<script lang="ts">
	import Idef0FunctionBox from '$stylist/idef-zero/component/atom/idef0-function-box/index.svelte';
	import type { RecipeIdef0FunctionBox } from '$stylist/idef-zero/interface/recipe/idef0-function-box';

	// Render of index.story.ts: the function box is an SVG fragment that needs an svg parent.
	let args: RecipeIdef0FunctionBox = $props();
</script>

<svg width="420" height="250">
	<Idef0FunctionBox {...args} />
</svg>
