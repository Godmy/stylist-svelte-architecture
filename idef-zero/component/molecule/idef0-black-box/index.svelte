<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { RecipeIdef0BlackBox } from '$stylist/idef-zero/interface/recipe/idef0-black-box';
	import createIdef0BlackBoxState from './state.svelte';
	import Idef0FunctionBox from '$stylist/idef-zero/component/atom/idef0-function-box/index.svelte';
	import Idef0Inputs from '$stylist/idef-zero/component/molecule/idef0-inputs/index.svelte';
	import Idef0Outputs from '$stylist/idef-zero/component/molecule/idef0-outputs/index.svelte';

	let props: RecipeIdef0BlackBox & HTMLAttributes<HTMLDivElement> = $props();
	const state = createIdef0BlackBoxState(() => props);

	const leftMargin = $derived(40);
	const rightMargin = $derived(40);
</script>

<g>
	<Idef0Inputs
		ports={props.inputs}
		boxX={state.boxX}
		boxY={state.boxY}
		boxHeight={state.boxHeight}
		startX={leftMargin}
	/>

	<Idef0FunctionBox
		title={props.title}
		subtitle={props.subtitle}
		x={state.boxX}
		y={state.boxY}
		width={state.boxWidth}
		height={state.boxHeight}
	/>

	<Idef0Outputs
		ports={props.outputs}
		boxX={state.boxX}
		boxWidth={state.boxWidth}
		boxY={state.boxY}
		boxHeight={state.boxHeight}
		endX={state.width - rightMargin}
	/>
</g>

<style>
</style>
