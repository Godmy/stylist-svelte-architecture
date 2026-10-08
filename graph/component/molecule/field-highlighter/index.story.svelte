<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import FieldHighlighter from './index.svelte';
	import type { TokenControllerType } from '$stylist/domain/type/alias/controller-type';

	type SlotGraphNode = {
		id: string;
		name: string;
		type: string;
		description?: string;
		position?: { x: number; y: number };
		width?: number;
		height?: number;
		fields?: Array<{ name: string; type: string; isRequired?: boolean }>;
	};

	type SlotGraphEdge = {
		id: string;
		source: string;
		target: string;
		type: string;
		label?: string;
	};

	const graphData: { nodes: SlotGraphNode[]; edges: SlotGraphEdge[] } = {
		nodes: [
			{
				id: 'customer',
				name: 'Customer',
				type: 'table',
				description: 'Profile attributes',
				position: { x: 40, y: 60 },
				width: 220,
				height: 160,
				fields: [
					{ name: 'id', type: 'uuid', isRequired: true },
					{ name: 'email', type: 'string', isRequired: true },
					{ name: 'first_name', type: 'string' },
					{ name: 'lifecycle_stage', type: 'enum' }
				]
			},
			{
				id: 'order',
				name: 'SlotOrder',
				type: 'table',
				position: { x: 320, y: 220 },
				width: 220,
				height: 140,
				fields: [
					{ name: 'order_id', type: 'uuid', isRequired: true },
					{ name: 'customer_id', type: 'uuid', isRequired: true },
					{ name: 'total', type: 'number' },
					{ name: 'status', type: 'enum' }
				]
			},
			{
				id: 'engagement',
				name: 'Engagement',
				type: 'view',
				description: 'Product usage events',
				position: { x: 620, y: 80 },
				width: 240,
				height: 180,
				fields: [
					{ name: 'session_id', type: 'uuid', isRequired: true },
					{ name: 'customer_id', type: 'uuid' },
					{ name: 'event', type: 'string' },
					{ name: 'occurred_at', type: 'timestamp' }
				]
			}
		],
		edges: [
			{
				id: 'customer-order',
				source: 'customer',
				target: 'order',
				type: 'relation',
				label: '1 -> n'
			},
			{
				id: 'customer-engagement',
				source: 'customer',
				target: 'engagement',
				type: 'relation',
				label: '1 -> n'
			}
		]
	};

	const controls = [
		{
			name: 'selectedNodeId',
			type: 'select' as TokenControllerType,
			defaultValue: 'customer',
			options: graphData.nodes.map((n) => n.id),
			description: 'Selected node ID'
		}
	];

	let selectedNodeId = $state('customer');
	let selectedFieldName = $state('email');

	const selectedNode = $derived(
		graphData.nodes.find((node: SlotGraphNode) => node.id === selectedNodeId) ?? graphData.nodes[0]
	);
	const selectedField = $derived(
		selectedNode?.fields?.find((field: { name: string }) => field.name === selectedFieldName) ??
			null
	);

	function handleNodeSelection(node: SlotGraphNode) {
		selectedNodeId = node.id;
		selectedFieldName = node.fields?.[0]?.name ?? '';
	}
</script>

<Story
	{controls}
	title="FieldHighlighter Component"
	description="Interactive field highlighter with graph visualization"
>
	{#snippet children(controlValues: any)}
		<div class="_c1">
			<div class="_c2">
				<div class="_c3">
					<div>
						<label for="node-select" class="_c4">Active entity</label>
						<select id="node-select" class="_c5" bind:value={selectedNodeId}>
							{#each graphData.nodes as node}
								<option value={node.id}>{node.name}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="field-select" class="_c4">Highlighted field</label>
						<select
							id="field-select"
							class="_c5"
							bind:value={selectedFieldName}
							disabled={!selectedNode?.fields?.length}
						>
							{#if selectedNode?.fields}
								{#each selectedNode.fields as field}
									<option value={field.name}>{field.name}</option>
								{/each}
							{/if}
						</select>
					</div>

					<div class="_c6">
						<p class="_c7">{selectedNode?.name}</p>
						<p>{selectedNode?.description ?? 'No description available'}</p>
						{#if selectedField}
							<p class="_c8">
								Selected field: <span class="_c7">{selectedField.name}</span>
							</p>
						{/if}
					</div>
				</div>

				<div class="_c9">
					<FieldHighlighter
						data={graphData as any}
						selectedNode={selectedNode as any}
						{selectedField}
					/>
				</div>
			</div>
		</div>
	{/snippet}
</Story>

<style>
	._c1 {
		padding: 1rem;
	}
	._c2 {
		display: grid;
		gap: 1.5rem;
	}
	@media (min-width: 1024px) {
		._c2 {
			grid-template-columns: 280px 1fr;
		}
	}
	._c3 > * + * {
		margin-top: 1rem;
	}
	._c4 {
		font-size: 0.875rem;
		line-height: 1.25rem;
		font-weight: 500;
		color: var(--color-text-secondary);
	}
	._c5 {
		margin-top: 0.25rem;
		width: 100%;
		border-radius: 0.5rem;
		border-width: 1px;
		border-style: solid;
		border-color: var(--color-border-primary);
		padding-left: 0.75rem;
		padding-right: 0.75rem;
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
	}
	._c6 {
		border-radius: 0.75rem;
		background-color: var(--color-background-secondary);
		padding: 1rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
		color: var(--color-text-secondary);
	}
	._c7 {
		font-weight: 600;
		color: var(--color-text-primary);
	}
	._c8 {
		margin-top: 0.75rem;
		font-size: 0.75rem;
		line-height: 1rem;
		letter-spacing: 0.025em;
		color: var(--color-text-secondary);
		text-transform: uppercase;
	}
	._c9 {
		position: relative;
		min-height: 360px;
		overflow: hidden;
		border-radius: 1rem;
		border-width: 1px;
		border-style: dashed;
		border-color: var(--color-border-primary);
		background-color: var(--color-background-secondary);
		padding: 1rem;
	}
</style>
