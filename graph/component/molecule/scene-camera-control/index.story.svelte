<script lang="ts">
	import SceneCameraControl from '$stylist/graph/component/molecule/scene-camera-control/index.svelte';
	import type { RecipeSceneCameraControl } from '$stylist/graph/interface/recipe/scene-camera-control';

	// Render of index.story.ts: radius and target are local state updated by the control's callbacks.
	let args: RecipeSceneCameraControl = $props();
	let radius = $derived(args.radius);
	let targetX = $derived(args.targetX);
	let targetY = $derived(args.targetY);
</script>

<div class="_c1">
	<div class="_c2 border-white/10 bg-white/5"></div>
	<SceneCameraControl
		{...args}
		{radius}
		{targetX}
		{targetY}
		onradiuschange={(next) => {
			radius = next;
		}}
		ontargetchange={(x, y) => {
			targetX = x;
			targetY = y;
		}}
	/>
</div>

<style>
	._c1 {
		position: relative;
		min-height: 24rem;
		overflow: hidden;
		border-radius: 1.5rem;
		background-color:
			radial-gradient(circle at top, #bfdbfe, transparent 45%),
			linear-gradient(180deg, #0f172a, #1e293b);
		padding: 1.5rem;
	}
	._c2 {
		position: absolute;
		inset: 1.5rem;
		border-radius: 1rem;
		border-width: 1px;
		border-style: solid;
	}
</style>
