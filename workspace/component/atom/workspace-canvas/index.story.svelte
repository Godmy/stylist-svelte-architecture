<script lang="ts">
	import WorkspaceNode from '$stylist/workspace/component/organism/workspace-node/index.svelte';
	import WorkspaceCanvas from '$stylist/workspace/component/atom/workspace-canvas/index.svelte';
	import type { RecipeWorkspaceCanvas } from '$stylist/workspace/interface/recipe/workspace-canvas';

	// Render of index.story.ts: the canvas is shown with workspace nodes as its children.
	let args: RecipeWorkspaceCanvas = $props();

	const detailedPresentation = {
		stage: 'detailed' as const,
		showIcon: true,
		showLabel: true,
		showDescription: false,
		showChildren: true
	};
</script>

<WorkspaceCanvas {...args}>
	<WorkspaceNode
		id="node1"
		x={100}
		y={90}
		title="Source"
		type="source"
		color="#0f766e"
		presentation={detailedPresentation}
		outputs={[{ id: 'out-1', name: 'out', direction: 'output', type: 'any', label: 'Out' }]}
	/>
	<WorkspaceNode
		id="node2"
		x={360}
		y={140}
		title="Gateway"
		type="gateway"
		color="#b45309"
		selected={true}
		presentation={detailedPresentation}
		inputs={[{ id: 'in-1', name: 'in', direction: 'input', type: 'any', label: 'In' }]}
		outputs={[{ id: 'out-2', name: 'out', direction: 'output', type: 'any', label: 'Out' }]}
	/>
	<WorkspaceNode
		id="node3"
		x={240}
		y={280}
		title="Output"
		type="output"
		color="#1d4ed8"
		presentation={detailedPresentation}
		inputs={[{ id: 'in-2', name: 'in', direction: 'input', type: 'any', label: 'In' }]}
	/>
</WorkspaceCanvas>
