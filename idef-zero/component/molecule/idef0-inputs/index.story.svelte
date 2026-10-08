<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import Idef0Inputs from './index.svelte';

	const ports = [
		{ id: 'i1', label: 'SlotOrder request' },
		{ id: 'i2', label: 'Customer profile' },
		{ id: 'i3', label: 'Business rules' }
	];
</script>

<Story
	component={Idef0Inputs}
	title="IDEF0Inputs"
	description="Input connectors for IDEF0 black-box."
>
	{#snippet children()}
		<svg width="460" height="260">
			<rect x="180" y="30" width="220" height="200" fill="none" stroke="#cbd5e1" />
			<Idef0Inputs {ports} boxX={180} boxY={30} boxHeight={200} startX={20} />
		</svg>
	{/snippet}
</Story>
