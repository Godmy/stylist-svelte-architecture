<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import Idef0Diagram from './index.svelte';

	const controls: SlotStory[] = [
		{ name: 'functionTitle', type: 'text', defaultValue: 'A0 Process Customer Order' }
	];

	const inputs = [
		{ id: 'i1', label: 'Customer request' },
		{ id: 'i2', label: 'Order items' },
		{ id: 'i3', label: 'Payment data' }
	];
	const outputs = [
		{ id: 'o1', label: 'Order confirmation' },
		{ id: 'o2', label: 'Invoice + receipt' },
		{ id: 'o3', label: 'Shipping task' }
	];
	const subtitle = 'Black Box Function';
</script>

<Story
	{controls}
	component={Idef0Diagram}
	title="IDEF0Diagram"
	description="IDEF0 black-box diagram for inputs and outputs."
>
	{#snippet children(values: any)}
		<Idef0Diagram title={values.functionTitle} {subtitle} {inputs} {outputs} />
	{/snippet}
</Story>
