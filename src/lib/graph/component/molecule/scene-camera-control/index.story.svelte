<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import SceneCameraControl from './index.svelte';

	let radius = $state(8.4);
	let targetX = $state(1.5);
	let targetY = $state(-2.2);
</script>

<Story
	component={SceneCameraControl}
	title="SceneCameraControl"
	description="Camera plane and zoom control for interactive scene navigation."
>
	{#snippet children()}
		<div class="_c1">
			<div class="_c2 border-white/10 bg-white/5"></div>
			<SceneCameraControl
				{radius}
				minRadius={4}
				maxRadius={16}
				sceneFitRadius={10.5}
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
	{/snippet}
</Story>

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
