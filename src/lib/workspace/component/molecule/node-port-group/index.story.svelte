<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import type { RecipeNodePort } from '$stylist/workspace/interface/recipe/node-port';
	import NodePortGroup from './index.svelte';

	const controls: SlotStory[] = [
		{ name: 'direction', type: 'select', defaultValue: 'input', options: ['input', 'output'] },
		{ name: 'portSize', type: 'select', defaultValue: 'md', options: ['xs', 'sm', 'md', 'lg'] },
		{ name: 'showLabels', type: 'boolean', defaultValue: true },
		{ name: 'compact', type: 'boolean', defaultValue: false },
		{ name: 'divider', type: 'boolean', defaultValue: false },
		{ name: 'title', type: 'text', defaultValue: '' }
	];

	const inputPorts: RecipeNodePort[] = [
		{ id: 'in-1', direction: 'input', label: 'Data In', dataType: 'string', connected: true },
		{ id: 'in-2', direction: 'input', label: 'Config', dataType: 'object', connected: false },
		{ id: 'in-3', direction: 'input', label: 'Options', dataType: 'array', connected: true }
	];

	const outputPorts: RecipeNodePort[] = [
		{ id: 'out-1', direction: 'output', label: 'Result', dataType: 'string', connected: true },
		{ id: 'out-2', direction: 'output', label: 'Error', dataType: 'object', connected: false }
	];
</script>

<Story
	component={NodePortGroup}
	title="NodePortGroup"
	description="Group of connection ports for node inputs/outputs with labels and dividers."
	{controls}
>
	{#snippet children(values: any)}
		<div
			style="position: relative; width: 220px; margin-{values.direction === 'input'
				? 'left'
				: 'right'}: 2rem; padding: var(--spacing-4) 1.5rem; background: var(--color-background-secondary); border: 1px solid var(--color-border-primary); border-radius: var(--border-radius-md);"
		>
			<NodePortGroup
				id="node-port-group-1"
				direction={values.direction}
				ports={values.direction === 'input' ? inputPorts : outputPorts}
				portSize={values.portSize}
				showLabels={values.showLabels}
				compact={values.compact}
				divider={values.divider}
				title={values.title || undefined}
				style="position: relative; width: 100%;"
			/>
		</div>
	{/snippet}
</Story>
