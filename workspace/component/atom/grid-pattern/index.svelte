<script lang="ts">
	import type { RecipeGridPattern } from '$stylist/workspace/interface/recipe/grid-pattern';
	import createGridPatternState from '$stylist/workspace/component/atom/grid-pattern/state.svelte';

	let props: RecipeGridPattern = $props();
	const state = createGridPatternState(() => props);
	// Unique per instance: several grids on one page must not share a pattern id.
	const uid = $props.id();
	const patternId = `grid-pattern-${uid}`;
</script>

<svg
	class={['workspace-grid-pattern', state.hostClass].filter(Boolean).join(' ')}
	style={state.svgStyle}
	{...state.restProps}
>
	<defs>
		<pattern
			id={patternId}
			x={0}
			y={0}
			width={state.scaledSize}
			height={state.scaledSize}
			patternUnits="userSpaceOnUse"
		>
			<path
				d="M {state.scaledSize} 0 L 0 0 0 {state.scaledSize}"
				fill="none"
				stroke="var(--grid-color)"
				stroke-width="1"
				style="opacity: var(--grid-opacity);"
			/>
		</pattern>
	</defs>
	<rect width="100%" height="100%" fill="url(#{patternId})" />
</svg>

<style>
	.workspace-grid-pattern {
		display: block;
		pointer-events: none;
	}
</style>
