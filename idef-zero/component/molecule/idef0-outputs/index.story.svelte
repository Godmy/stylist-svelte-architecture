<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import Idef0Outputs from './index.svelte';

	const ports = [
		{ id: 'o1', label: 'Approved order' },
		{ id: 'o2', label: 'Rejection reason' }
	];
</script>

<Story
	component={Idef0Outputs}
	title="IDEF0Outputs"
	description="Output connectors for IDEF0 black-box."
>
	{#snippet children()}
		<svg width="520" height="260">
			<rect x="40" y="30" width="220" height="200" fill="none" stroke="#cbd5e1" />
			<Idef0Outputs {ports} boxX={40} boxWidth={220} boxY={30} boxHeight={200} endX={500} />
		</svg>
	{/snippet}
</Story>
