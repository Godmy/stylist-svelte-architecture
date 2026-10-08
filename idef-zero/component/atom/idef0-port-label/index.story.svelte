<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import Idef0PortLabel from './index.svelte';

	const controls: SlotStory[] = [{ name: 'text', type: 'text', defaultValue: 'Customer request' }];
</script>

<Story
	{controls}
	component={Idef0PortLabel}
	title="IDEF0PortLabel"
	description="Label for IDEF0 ports."
>
	{#snippet children(values: any)}
		<svg width="320" height="100">
			<Idef0PortLabel text={values.text} x={16} y={40} anchor="start" />
		</svg>
	{/snippet}
</Story>
