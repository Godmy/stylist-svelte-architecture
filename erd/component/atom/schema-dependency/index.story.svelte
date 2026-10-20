<script lang="ts">
	import SchemaDependency from './index.svelte';
	import type { RecipeErdDependency } from '$stylist/erd/interface/recipe/erd-dependency';

	// Render of index.story.ts: the marker is an SVG fragment drawn between two table boxes that follow y2.
	let args: RecipeErdDependency = $props();
</script>

<svg class="schema-dependency-story" viewBox="0 0 520 260" aria-label="Schema dependency preview">
	<rect x="28" y={args.y1 - 44} width="160" height="88" rx="8" />
	<rect x="332" y={args.y2 - 44} width="160" height="88" rx="8" />
	<SchemaDependency {...args} />
	<text x="44" y={args.y1 + 6}>User</text>
	<text x="348" y={args.y2 + 6}>Organization</text>
</svg>

<style>
	.schema-dependency-story {
		width: min(100%, 620px);
		height: 260px;
		border: 1px solid rgba(22, 31, 44, 0.12);
		border-radius: 0.5rem;
		background: #eef3f8;
	}

	.schema-dependency-story rect {
		fill: #ffffff;
		stroke: rgba(22, 31, 44, 0.16);
	}

	.schema-dependency-story text {
		fill: #263244;
		font-size: 14px;
		font-weight: 700;
	}
</style>
