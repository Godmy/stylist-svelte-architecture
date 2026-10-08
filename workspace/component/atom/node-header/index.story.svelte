<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import NodeHeader from './index.svelte';

	const controls: SlotStory[] = [
		{ name: 'color', type: 'color', defaultValue: '#3b82f6' },
		{ name: 'size', type: 'select', defaultValue: 'md', options: ['xs', 'sm', 'md', 'lg'] },
		{ name: 'selected', type: 'boolean', defaultValue: false },
		{ name: 'editable', type: 'boolean', defaultValue: true },
		{ name: 'showClose', type: 'boolean', defaultValue: true },
		{ name: 'showDuplicate', type: 'boolean', defaultValue: true },
		{ name: 'showSettings', type: 'boolean', defaultValue: true }
	];
</script>

<Story
	component={NodeHeader}
	title="NodeHeader"
	description="Header for node components with title, actions, and edit functionality."
	{controls}
>
	{#snippet children(values: any)}
		<NodeHeader
			id="node-header-1"
			title="Data Processor"
			color={values.color}
			size={values.size}
			selected={values.selected}
			editable={values.editable}
			showClose={values.showClose}
			showDuplicate={values.showDuplicate}
			showSettings={values.showSettings}
		/>
	{/snippet}
</Story>
