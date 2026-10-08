<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import Idef0BlackBox from './index.svelte';

	const controls: SlotStory[] = [
		{ name: 'title', type: 'text', defaultValue: 'A0 Fulfill SlotOrder' },
		{ name: 'subtitle', type: 'text', defaultValue: 'Black Box' }
	];

	const inputs = [
		{ id: 'i1', label: 'SlotOrder' },
		{ id: 'i2', label: 'Customer data' },
		{ id: 'i3', label: 'Pricing rules' }
	];

	const outputs = [
		{ id: 'o1', label: 'Shipment' },
		{ id: 'o2', label: 'Invoice' }
	];
</script>

<Story
	{controls}
	component={Idef0BlackBox}
	title="IDEF0BlackBox"
	description="Complete IDEF0 black-box molecule."
>
	{#snippet children(values: any)}
		<svg width="920" height="420">
			<Idef0BlackBox
				title={values.title}
				subtitle={values.subtitle}
				{inputs}
				{outputs}
				width={920}
				height={420}
			/>
		</svg>
	{/snippet}
</Story>
