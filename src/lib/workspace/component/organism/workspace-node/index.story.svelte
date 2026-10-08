<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import type { SlotWorkspaceNode } from '$stylist/workspace/interface/slot/workspace-node';
	import LiteGraphNode from './index.svelte';

	const controls: SlotStory[] = [
		{
			name: 'mode',
			type: 'select',
			defaultValue: 'default',
			options: ['default', 'once', 'always', 'never']
		},
		{
			name: 'status',
			type: 'select',
			defaultValue: 'idle',
			options: ['idle', 'running', 'completed', 'error']
		},
		{ name: 'size', type: 'select', defaultValue: 'md', options: ['sm', 'md', 'lg'] },
		{ name: 'color', type: 'color', defaultValue: '#3b82f6' },
		{ name: 'selected', type: 'boolean', defaultValue: false },
		{ name: 'draggable', type: 'boolean', defaultValue: true },
		{ name: 'hideHeader', type: 'boolean', defaultValue: false },
		{ name: 'hidePorts', type: 'boolean', defaultValue: false },
		{ name: 'hideProperties', type: 'boolean', defaultValue: false }
	];

	const inputs: SlotWorkspaceNode[] = [
		{ id: 'in-1', direction: 'input', label: 'Data In', dataType: 'string' },
		{ id: 'in-2', direction: 'input', label: 'Config', dataType: 'object' }
	];

	const outputs: SlotWorkspaceNode[] = [
		{ id: 'out-1', direction: 'output', label: 'Result', dataType: 'string' },
		{ id: 'out-2', direction: 'output', label: 'Error', dataType: 'object' }
	];

	const properties: SlotWorkspaceNode[] = [
		{ id: 'prop-1', name: 'timeout', type: 'number', value: 30, label: 'Timeout (s)' },
		{ id: 'prop-2', name: 'retry', type: 'boolean', value: true, label: 'Retry on Failure' }
	];
</script>

<Story
	component={LiteGraphNode}
	title="LiteGraphNode"
	description="Node component for litegraph-based node editors with inputs, outputs, and properties."
	{controls}
>
	{#snippet children(values: any)}
		<div
			style="position: relative; width: 100%; height: 400px; padding: 0 2rem; box-sizing: border-box; background: var(--color-background-secondary); border-radius: var(--border-radius-md);"
		>
			<LiteGraphNode
				id="node-1"
				title="Process Data"
				type="processor"
				mode={values.mode}
				status={values.status}
				x={50}
				y={50}
				width={200}
				color={values.color}
				size={values.size}
				inputs={values.hidePorts ? [] : inputs}
				outputs={values.hidePorts ? [] : outputs}
				properties={values.hideProperties ? [] : properties}
				selected={values.selected}
				draggable={values.draggable}
				hideHeader={values.hideHeader}
			/>
		</div>
	{/snippet}
</Story>
