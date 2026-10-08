<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import Idef0Connector from './index.svelte';

	const controls: SlotStory[] = [
		{ name: 'label', type: 'text', defaultValue: 'Validated request' },
		{ name: 'direction', type: 'select', options: ['input', 'output'], defaultValue: 'input' }
	];
</script>

<Story
	{controls}
	component={Idef0Connector}
	title="IDEF0Connector"
	description="Input/output connection arrow for IDEF0."
>
	{#snippet children(values: any)}
		<svg width="420" height="120">
			{#if values.direction === 'input'}
				<Idef0Connector direction="input" label={values.label} x1={20} y1={60} x2={220} y2={60} />
			{:else}
				<Idef0Connector direction="output" label={values.label} x1={200} y1={60} x2={400} y2={60} />
			{/if}
		</svg>
	{/snippet}
</Story>
