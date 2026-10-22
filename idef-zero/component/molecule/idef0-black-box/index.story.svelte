<script lang="ts">
	import Idef0BlackBox from '$stylist/idef-zero/component/molecule/idef0-black-box/index.svelte';
	import type { RecipeIdef0BlackBox } from '$stylist/idef-zero/interface/recipe/idef0-black-box';

	// Render of index.story.ts: the black box is an SVG group that needs an svg parent.
	let args: RecipeIdef0BlackBox = $props();
</script>

<svg width={args.width ?? 920} height={args.height ?? 420}>
	<Idef0BlackBox {...args} />
</svg>
