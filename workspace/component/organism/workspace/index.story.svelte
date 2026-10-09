<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import Workspace from '$stylist/workspace/component/organism/workspace/index.svelte';
	import type { SlotWorkspaceNode } from '$stylist/workspace/interface/slot/workspace-node';
	import type { SlotNodeConnection } from '$stylist/workspace/interface/slot/node-connection';

	const HEADER_HEIGHT = 40;
	const PORT_ROW_HEIGHT = 32;

	function portAnchor(
		node: SlotWorkspaceNode,
		direction: 'input' | 'output',
		portId: string | undefined
	): { x: number; y: number } {
		const ports = direction === 'input' ? (node.inputs ?? []) : (node.outputs ?? []);
		const index = Math.max(
			0,
			ports.findIndex((port) => port.id === portId)
		);
		const width = node.width ?? 200;
		const x = (node.x ?? 0) + (direction === 'input' ? 0 : width);
		const y = (node.y ?? 0) + HEADER_HEIGHT + index * PORT_ROW_HEIGHT + PORT_ROW_HEIGHT / 2;
		return { x, y };
	}

	let nodes = $state<SlotWorkspaceNode[]>([
		{
			id: 'node-1',
			title: 'Data Source',
			type: 'source',
			x: 100,
			y: 100,
			color: 'var(--color-success-500)',
			inputs: [],
			outputs: [{ id: 'node-1-out-1', direction: 'output', dataType: 'any', label: 'Data' }],
			properties: []
		},
		{
			id: 'node-2',
			title: 'Processor',
			type: 'processor',
			x: 420,
			y: 160,
			color: 'var(--color-secondary-500)',
			inputs: [{ id: 'node-2-in-1', direction: 'input', dataType: 'any', label: 'Input' }],
			outputs: [{ id: 'node-2-out-1', direction: 'output', dataType: 'any', label: 'Result' }],
			properties: []
		},
		{
			id: 'node-3',
			title: 'Output',
			type: 'output',
			x: 740,
			y: 100,
			color: 'var(--color-warning-500)',
			inputs: [{ id: 'node-3-in-1', direction: 'input', dataType: 'any', label: 'Result' }],
			outputs: [],
			properties: []
		}
	]);

	let connections = $state<SlotNodeConnection[]>([]);

	function connectNodes(
		fromNodeId: string,
		fromPortId: string | undefined,
		toNodeId: string,
		toPortId: string | undefined
	) {
		const fromNode = nodes.find((node) => node.id === fromNodeId);
		const toNode = nodes.find((node) => node.id === toNodeId);
		if (!fromNode || !toNode) return;

		const start = portAnchor(fromNode, 'output', fromPortId);
		const end = portAnchor(toNode, 'input', toPortId);

		connections.push({
			id: `conn-${fromNodeId}-${toNodeId}-${Date.now()}`,
			fromNodeId,
			toNodeId,
			fromPort: fromPortId,
			toPort: toPortId,
			startX: start.x,
			startY: start.y,
			endX: end.x,
			endY: end.y,
			type: 'bezier',
			color: 'var(--color-primary-500)',
			active: true
		});
	}

	// seed the two starting connections through the same path a real drag would take
	connectNodes('node-1', 'node-1-out-1', 'node-2', 'node-2-in-1');
	connectNodes('node-2', 'node-2-out-1', 'node-3', 'node-3-in-1');

	function recomputeConnectionsForNode(nodeId: string) {
		const node = nodes.find((candidate) => candidate.id === nodeId);
		if (!node) return;

		connections = connections.map((connection) => {
			if (connection.fromNodeId === nodeId) {
				const anchor = portAnchor(node, 'output', connection.fromPort);
				return { ...connection, startX: anchor.x, startY: anchor.y };
			}
			if (connection.toNodeId === nodeId) {
				const anchor = portAnchor(node, 'input', connection.toPort);
				return { ...connection, endX: anchor.x, endY: anchor.y };
			}
			return connection;
		});
	}

	let selectedNodeIds = $state<string[]>([]);
	let zoom = $state(1);
	let offset = $state({ x: 0, y: 0 });

	function findNodeIdByPort(port: SlotWorkspaceNode, direction: 'input' | 'output') {
		return nodes.find((node) =>
			(direction === 'input' ? (node.inputs ?? []) : (node.outputs ?? [])).some(
				(candidate) => candidate.id === port.id
			)
		)?.id;
	}

	function handleNodeSelect(nodeId: string) {
		selectedNodeIds = [nodeId];
	}

	function handleNodeDrag(nodeId: string, position: { x: number; y: number }) {
		nodes = nodes.map((node) => (node.id === nodeId ? { ...node, ...position } : node));
		recomputeConnectionsForNode(nodeId);
	}

	function handleNodeDelete(nodeId: string) {
		nodes = nodes.filter((node) => node.id !== nodeId);
		connections = connections.filter(
			(connection) => connection.fromNodeId !== nodeId && connection.toNodeId !== nodeId
		);
		selectedNodeIds = selectedNodeIds.filter((id) => id !== nodeId);
	}

	function handleNodeDuplicate(nodeId: string) {
		const source = nodes.find((node) => node.id === nodeId);
		if (!source) return;

		const id = `${nodeId}-copy-${Date.now()}`;
		nodes = [...nodes, { ...source, id, x: (source.x ?? 0) + 32, y: (source.y ?? 0) + 32 }];
	}

	function handleNodeAdd(node: SlotWorkspaceNode) {
		nodes = [...nodes, node];
	}

	function handleConnectionEnd(fromPort: SlotWorkspaceNode, toPort: SlotWorkspaceNode) {
		const fromNodeId = findNodeIdByPort(fromPort, 'output');
		const toNodeId = findNodeIdByPort(toPort, 'input');
		if (!fromNodeId || !toNodeId || fromNodeId === toNodeId) return;

		connectNodes(fromNodeId, fromPort.id, toNodeId, toPort.id);
	}

	function handlePropertyChange(nodeId: string, propertyId: string, value: unknown) {
		nodes = nodes.map((node) =>
			node.id === nodeId
				? {
						...node,
						properties: (node.properties ?? []).map((property) =>
							property.id === propertyId ? { ...property, value } : property
						)
					}
				: node
		);
	}

	const controls: SlotStory[] = [];
</script>

<Story
	component={Workspace}
	title="Workspace"
	description="Full graph workspace: canvas, toolbar, node palette and properties panel in one organism. Fully wired — drag a node, drag from an output port to an input port, add nodes from the palette."
	{controls}
>
	{#snippet children()}
		<div style="height: 600px; padding: var(--spacing-6);">
			<div
				style="height: 100%; border: 1px solid var(--color-border-primary); border-radius: var(--border-radius-xl); overflow: hidden; background: var(--color-background-primary);"
			>
				<Workspace
					{nodes}
					{connections}
					{selectedNodeIds}
					{zoom}
					{offset}
					showToolbar={true}
					showMiniMap={true}
					showWorkspacePalette={true}
					showPropertiesPanel={true}
					showGrid={true}
					allowAddNodes={true}
					allowDeleteNodes={true}
					allowDuplicateNodes={true}
					onNodeSelect={handleNodeSelect}
					onNodeDrag={handleNodeDrag}
					onNodeDelete={handleNodeDelete}
					onNodeDuplicate={handleNodeDuplicate}
					onNodeAdd={handleNodeAdd}
					onConnectionEnd={handleConnectionEnd}
					onPropertyChange={handlePropertyChange}
					onZoomChange={(next: number) => (zoom = next)}
					onOffsetChange={(next: { x: number; y: number }) => (offset = next)}
				/>
			</div>
		</div>
	{/snippet}
</Story>
