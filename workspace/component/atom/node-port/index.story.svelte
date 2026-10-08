<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import NodePort from './index.svelte';

	type PortProps = {
		direction: 'input' | 'output';
		dataType: 'number' | 'string' | 'boolean' | 'object' | 'array' | 'any' | 'event' | 'action';
		size: 'xs' | 'sm' | 'md' | 'lg';
		label: string;
		connected: boolean;
		active: boolean;
	};

	type PortCard = {
		id: string;
		label: string;
		dataType: PortProps['dataType'];
	};

	const controls: SlotStory[] = [
		{ name: 'direction', type: 'select', defaultValue: 'input', options: ['input', 'output'] },
		{
			name: 'dataType',
			type: 'select',
			defaultValue: 'number',
			options: ['number', 'string', 'boolean', 'object', 'array', 'any', 'event', 'action']
		},
		{ name: 'size', type: 'select', defaultValue: 'md', options: ['xs', 'sm', 'md', 'lg'] },
		{ name: 'label', type: 'text', defaultValue: 'Value' },
		{ name: 'connected', type: 'boolean', defaultValue: false },
		{ name: 'active', type: 'boolean', defaultValue: false }
	];

	const portCards: PortCard[] = [
		{ id: 'port-number', label: 'Number', dataType: 'number' },
		{ id: 'port-string', label: 'String', dataType: 'string' },
		{ id: 'port-boolean', label: 'Boolean', dataType: 'boolean' },
		{ id: 'port-object', label: 'Object', dataType: 'object' },
		{ id: 'port-array', label: 'Array', dataType: 'array' },
		{ id: 'port-any', label: 'Any', dataType: 'any' },
		{ id: 'port-event', label: 'Event', dataType: 'event' },
		{ id: 'port-action', label: 'Action', dataType: 'action' }
	];
</script>

<Story
	{controls}
	component={NodePort}
	title="Graph Port"
	category="Atoms/Architecture/Canvas"
	description="Connection point for graph nodes. Use the live controls to inspect direction, size, type and state."
	tags={['graph', 'port', 'canvas']}
>
	{#snippet children(values: any)}
		{@const typed = values as PortProps}
		<div class="story-shell">
			<div class="story-stage">
				<div class="story-node"></div>
				<div class="story-port-row">
					<NodePort
						id="story-port"
						direction={typed.direction}
						dataType={typed.dataType}
						size={typed.size}
						label={typed.label}
						connected={typed.connected}
						active={typed.active}
					/>
				</div>
			</div>
			<div class="story-meta">
				<div class="meta-chip">{typed.direction}</div>
				<div class="meta-chip">{typed.dataType}</div>
				<div class="meta-chip">{typed.size}</div>
				<div class="meta-chip">{typed.connected ? 'connected' : 'idle'}</div>
				<div class="meta-chip">{typed.active ? 'active' : 'quiet'}</div>
			</div>
		</div>
	{/snippet}

	{#snippet variants()}
		<div class="variants-shell">
			<div class="variant-panel">
				<h3>Size Ladder</h3>
				<div class="size-ladder">
					<div class="ladder-row">
						<NodePort id="port-xs" size="xs" label="XS" direction="output" />
					</div>
					<div class="ladder-row">
						<NodePort id="port-sm" size="sm" label="SM" direction="output" />
					</div>
					<div class="ladder-row">
						<NodePort id="port-md" size="md" label="MD" direction="output" />
					</div>
					<div class="ladder-row">
						<NodePort id="port-lg" size="lg" label="LG" direction="output" />
					</div>
				</div>
			</div>
			<div class="variant-panel">
				<h3>Type Gallery</h3>
				<div class="type-gallery">
					{#each portCards as portCard}
						<div class="type-row">
							<NodePort
								id={portCard.id}
								direction="input"
								dataType={portCard.dataType}
								label={portCard.label}
								connected={portCard.dataType !== 'event'}
								active={portCard.dataType === 'event'}
							/>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/snippet}
</Story>

<style>
	.story-shell,
	.variants-shell {
		display: grid;
		gap: 1rem;
		padding: 1.25rem;
		border-radius: 1rem;
		background: linear-gradient(180deg, #0f172a, #111827);
	}

	.story-stage,
	.variant-panel {
		border: 1px solid rgba(148, 163, 184, 0.18);
		border-radius: 1rem;
		background: linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.92));
	}

	.story-stage {
		position: relative;
		height: 160px;
		overflow: hidden;
	}

	.story-node {
		position: absolute;
		inset: 1.5rem auto 1.5rem 50%;
		width: 7rem;
		transform: translateX(-50%);
		border-radius: 1rem;
		background: linear-gradient(180deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.18));
		border: 1px solid rgba(96, 165, 250, 0.35);
	}

	.story-port-row {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 10rem;
		transform: translate(-50%, -50%);
	}

	.story-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.meta-chip {
		padding: 0.35rem 0.6rem;
		border-radius: 999px;
		background: rgba(15, 23, 42, 0.88);
		border: 1px solid rgba(148, 163, 184, 0.18);
		color: #cbd5e1;
		font-size: 0.78rem;
		text-transform: lowercase;
	}

	.variant-panel {
		padding: 1rem;
	}

	.variant-panel h3 {
		margin: 0 0 0.75rem;
		color: #e2e8f0;
		font-size: 0.95rem;
	}

	.size-ladder,
	.type-gallery {
		position: relative;
	}

	.size-ladder {
		height: 148px;
	}

	.ladder-row,
	.type-row {
		position: absolute;
		left: 0;
		right: 0;
	}

	.ladder-row:nth-child(1) {
		top: 10px;
	}
	.ladder-row:nth-child(2) {
		top: 42px;
	}
	.ladder-row:nth-child(3) {
		top: 76px;
	}
	.ladder-row:nth-child(4) {
		top: 112px;
	}

	.type-gallery {
		height: 272px;
	}

	.type-row:nth-child(1) {
		top: 10px;
	}
	.type-row:nth-child(2) {
		top: 42px;
	}
	.type-row:nth-child(3) {
		top: 74px;
	}
	.type-row:nth-child(4) {
		top: 106px;
	}
	.type-row:nth-child(5) {
		top: 138px;
	}
	.type-row:nth-child(6) {
		top: 170px;
	}
	.type-row:nth-child(7) {
		top: 202px;
	}
	.type-row:nth-child(8) {
		top: 234px;
	}
</style>
