<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import type { SceneNode } from '$stylist/presentation/interface/slot/scene-node';
	import { SemanticZoomManager } from '$stylist/presentation/class/manager/semantic-zoom';
	import PreziScene from './index.svelte';

	const VIEWPORT_WIDTH = 1320;
	const VIEWPORT_HEIGHT = 760;

	const controls: SlotStory[] = [
		{ name: 'showGrid', type: 'boolean', defaultValue: true },
		{ name: 'showMinimap', type: 'boolean', defaultValue: true },
		{ name: 'showInspector', type: 'boolean', defaultValue: true },
		{ name: 'panMode', type: 'select', defaultValue: 'drag', options: ['drag', 'space', 'always'] },
		{ name: 'cameraDepth', type: 'range', defaultValue: 480, min: 0, max: 1000, step: 1 },
		{ name: 'localDepth', type: 'range', defaultValue: 420, min: 0, max: 1000, step: 1 }
	];

	const sceneNodes: readonly SceneNode[] = [
		{
			id: 'landscape',
			title: 'Ontology Landscape',
			label: 'Core map',
			description: 'The top-level knowledge map of services, entities and flows.',
			iconText: 'O',
			position: { x: 160, y: 120, z: 180, space: 'world' },
			depth: 180,
			accent: '#0f766e'
		},
		{
			id: 'identity',
			title: 'Customer Identity Graph',
			label: 'Identity',
			description: 'Profiles, access and verification are bundled into one semantic surface.',
			iconText: 'I',
			position: { x: 620, y: 260, z: 480, space: 'world' },
			depth: 480,
			accent: '#2563eb',
			children: [
				{
					id: 'profile',
					title: 'Profile',
					label: 'Profile',
					description: 'Human-readable core identity data.',
					iconText: 'P',
					position: { x: 540, y: 180, z: 150, space: 'world' },
					depth: 150,
					accent: '#2563eb'
				},
				{
					id: 'access',
					title: 'Access',
					label: 'Access',
					description: 'Roles, gates and permissions.',
					iconText: 'A',
					position: { x: 760, y: 320, z: 420, space: 'world' },
					depth: 420,
					accent: '#7c3aed'
				},
				{
					id: 'risk',
					title: 'Risk',
					label: 'Risk',
					description: 'Signals, anomalies and fraud posture.',
					iconText: 'R',
					position: { x: 920, y: 210, z: 760, space: 'world' },
					depth: 760,
					accent: '#dc2626'
				}
			]
		},
		{
			id: 'billing',
			title: 'Billing Summary',
			label: 'Billing',
			description: 'An aggregate view of invoices, balance and payment health.',
			iconText: 'B',
			position: { x: 340, y: 560, z: 760, space: 'world' },
			depth: 760,
			accent: '#d97706'
		},
		{
			id: 'alerts',
			title: 'Risk Alerts',
			label: 'Alerts',
			description: 'High-signal monitoring surface for operators.',
			iconText: '!',
			position: { x: 860, y: 600, z: 920, space: 'world' },
			depth: 920,
			accent: '#be123c'
		}
	];

	let selectedNodeId = $state<string | null>('identity');

	function worldX(percent: number): number {
		return Math.round((percent / 100) * VIEWPORT_WIDTH);
	}

	function worldY(percent: number): number {
		return Math.round((percent / 100) * VIEWPORT_HEIGHT);
	}

	function getWorldStyle(card: ReturnType<typeof SemanticZoomManager.resolveNode>): string {
		return [
			`left:${worldX(card.node.position.x)}px`,
			`top:${worldY(card.node.position.y)}px`,
			`width:${card.width}px`,
			`height:${card.height}px`,
			`--accent:${card.node.accent}`
		].join(';');
	}

	function getLocalStyle(
		card: ReturnType<typeof SemanticZoomManager.resolvePresentation> & { node: SceneNode }
	): string {
		return [
			`left:${Math.round(worldX(card.node.position.x) * 0.45)}px`,
			`top:${Math.round(worldY(card.node.position.y) * 0.26)}px`,
			`width:${card.width}px`,
			`height:${card.height}px`,
			`--accent:${card.node.accent}`
		].join(';');
	}
</script>

<Story
	{controls}
	component={PreziScene}
	title="PreziScene"
	description="Full semantic-zoom workbench with the real scene component and a parallel diagnostics viewport."
>
	{#snippet children(values: any)}
		{@const worldCards = sceneNodes.map((node) =>
			SemanticZoomManager.resolveNode(node, Number(values.cameraDepth))
		)}
		{@const activeWorldCard = worldCards.reduce(
			(best, current) => (current.distance < best.distance ? current : best),
			worldCards[0]
		)}
		{@const localCards = (activeWorldCard?.node.children ?? []).map((child) => ({
			node: child,
			...SemanticZoomManager.resolvePresentation(child.depth, Number(values.localDepth))
		}))}

		<div class="prezi-story">
			<section class="hero-panel">
				<div>
					<p class="eyebrow">Semantic Zoom Workbench</p>
					<h1>Prezi-like depth with a live component and a raw resolver audit.</h1>
					<p class="lede">
						This story replaces the route-level prototype: the top section tests the actual
						<code>PreziScene</code> component, and the lower sections expose the semantic zoom math in
						plain HTML so debugging stays local.
					</p>
				</div>

				<div class="metrics">
					<div class="metric">
						<span class="metric-label">World depth</span>
						<strong>{values.cameraDepth}</strong>
					</div>
					<div class="metric">
						<span class="metric-label">Active stage</span>
						<strong>{activeWorldCard?.stage ?? 'dot'}</strong>
					</div>
					<div class="metric">
						<span class="metric-label">Local depth</span>
						<strong>{values.localDepth}</strong>
					</div>
				</div>
			</section>

			<section class="component-shell">
				<div class="component-shell__head">
					<div>
						<p class="section-kicker">Component Surface</p>
						<h2>Real `PreziScene` integration</h2>
					</div>
					<div class="component-badge">Selected: {selectedNodeId ?? 'none'}</div>
				</div>

				<div class="component-frame">
					<PreziScene
						nodes={[...sceneNodes]}
						title="Story Coverage Map"
						subtitle="Pan, zoom, inspect, and compare the rendered scene with the diagnostics below."
						showGrid={Boolean(values.showGrid)}
						showMinimap={Boolean(values.showMinimap)}
						showInspector={Boolean(values.showInspector)}
						panMode={values.panMode as 'drag' | 'space' | 'always'}
						initialCamera={{ x: 0, y: 0, zoom: 1 }}
						initialDepth={0}
						{selectedNodeId}
						onNodeSelect={(node) => {
							selectedNodeId = node?.id ?? null;
						}}
						class="_c1"
					/>
				</div>
			</section>

			<section class="control-panel">
				<div class="range-field">
					<div class="range-head">
						<span>Camera depth in world space</span>
						<span>{values.cameraDepth}</span>
					</div>
					<input value={values.cameraDepth} type="range" min="0" max="1000" step="1" disabled />
				</div>

				<div class="range-field">
					<div class="range-head">
						<span>Local depth inside active component</span>
						<span>{values.localDepth}</span>
					</div>
					<input value={values.localDepth} type="range" min="0" max="1000" step="1" disabled />
				</div>
			</section>

			<section class="viewport-shell">
				<div class="viewport-grid"></div>
				{#each worldCards as card (card.node.id)}
					<div
						class="world-node"
						class:is-active={card.node.id === activeWorldCard?.node.id}
						data-stage={card.stage}
						style={getWorldStyle(card)}
					>
						<div class="world-node__icon">{card.node.iconText}</div>
						{#if card.showLabel}
							<div class="world-node__copy">
								<div class="world-node__title">{card.node.title}</div>
								<div class="world-node__meta">
									World Depth {card.node.depth} | Distance {Math.round(card.distance)}
								</div>
								{#if card.showDescription}
									<div class="world-node__description">{card.node.description}</div>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</section>

			<section class="local-shell">
				<div class="local-shell__head">
					<div>
						<h2>Local Axis</h2>
						<p>Active node: {activeWorldCard?.node.title ?? 'none'}</p>
					</div>
					<div class="local-shell__metrics">
						<span>World Depth: {activeWorldCard?.node.depth ?? 0}</span>
						<span>Local Depth: {values.localDepth}</span>
					</div>
				</div>

				<div class="local-shell__viewport">
					{#each localCards as card (card.node.id)}
						<div class="local-node" data-stage={card.stage} style={getLocalStyle(card)}>
							<div class="local-node__icon">{card.node.iconText}</div>
							{#if card.showLabel}
								<div class="local-node__copy">
									<div class="local-node__title">{card.node.title}</div>
									<div class="local-node__meta">
										Local Depth {card.node.depth} | Stage {card.stage}
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</section>

			<section class="audit-panel">
				<h2>Resolver Output</h2>
				<div class="audit-grid">
					{#each worldCards as card (card.node.id)}
						<article class="audit-card">
							<div class="audit-title-row">
								<strong>{card.node.title}</strong>
								<span>{card.stage}</span>
							</div>
							<p>
								{card.architecture} | {card.shape} | {card.size} | distance {Math.round(
									card.distance
								)}
							</p>
						</article>
					{/each}
				</div>
			</section>
		</div>
	{/snippet}
</Story>

<style>
	.prezi-story {
		font-family: 'IBM Plex Sans', 'Segoe UI', sans-serif;
		padding: 1rem;
		display: grid;
		gap: 1.25rem;
		color: #10223b;
		background:
			radial-gradient(circle at top, rgba(37, 99, 235, 0.12), transparent 28%),
			linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
		border-radius: 2rem;
	}

	.hero-panel,
	.component-shell,
	.control-panel,
	.audit-panel,
	.local-shell {
		background: rgba(255, 255, 255, 0.78);
		backdrop-filter: blur(18px);
		border: 1px solid rgba(148, 163, 184, 0.28);
		border-radius: 24px;
		box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
	}

	.hero-panel {
		padding: 1.5rem;
		display: grid;
		grid-template-columns: 1.4fr 0.8fr;
		gap: 1rem;
	}

	.component-shell {
		padding: 1rem;
		display: grid;
		gap: 1rem;
	}

	.component-shell__head {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: end;
	}

	.component-frame {
		overflow: hidden;
		border-radius: 1.6rem;
		background: #020617;
		border: 1px solid rgba(15, 23, 42, 0.18);
	}

	.component-badge {
		padding: 0.45rem 0.8rem;
		border-radius: 999px;
		background: rgba(37, 99, 235, 0.1);
		color: #1d4ed8;
		font-size: 0.78rem;
		font-weight: 700;
	}

	.eyebrow,
	.section-kicker {
		margin: 0 0 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.16em;
		font-size: 0.72rem;
		color: #2563eb;
		font-weight: 700;
	}

	h1,
	h2,
	p {
		margin: 0;
	}

	h1 {
		font-size: clamp(2rem, 4vw, 3.4rem);
		line-height: 0.98;
		max-width: 13ch;
	}

	h2 {
		font-size: 1rem;
	}

	.lede {
		margin: 1rem 0 0;
		max-width: 68ch;
		font-size: 1rem;
		line-height: 1.65;
		color: #42526b;
	}

	.lede code {
		padding: 0.15rem 0.42rem;
		border-radius: 0.55rem;
		background: rgba(37, 99, 235, 0.08);
	}

	.metrics,
	.audit-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.metric,
	.audit-card {
		padding: 1rem;
		border-radius: 18px;
		background: linear-gradient(180deg, rgba(241, 245, 249, 0.9), rgba(226, 232, 240, 0.72));
	}

	.metric-label {
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #64748b;
	}

	.metric strong {
		font-size: 1.4rem;
	}

	.control-panel {
		padding: 1rem 1.25rem;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	.range-field {
		display: grid;
		gap: 0.55rem;
	}

	.range-head {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.92rem;
		font-weight: 600;
	}

	.range-field input {
		width: 100%;
		accent-color: #2563eb;
	}

	.viewport-shell,
	.local-shell__viewport {
		position: relative;
		overflow: hidden;
		border-radius: 34px;
		border: 1px solid rgba(59, 130, 246, 0.18);
		background:
			radial-gradient(circle at top right, rgba(191, 219, 254, 0.6), transparent 26%),
			linear-gradient(160deg, rgba(255, 255, 255, 0.96), rgba(226, 232, 240, 0.9));
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.9),
			0 24px 50px rgba(15, 23, 42, 0.08);
	}

	.viewport-shell {
		height: 760px;
	}

	.local-shell {
		padding: 1rem 1.25rem 1.25rem;
	}

	.local-shell__head {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: flex-start;
		margin-bottom: 0.85rem;
	}

	.local-shell__head p {
		margin: 0.35rem 0 0;
		color: #526277;
		font-size: 0.9rem;
	}

	.local-shell__metrics {
		display: grid;
		gap: 0.35rem;
		font-size: 0.85rem;
		font-weight: 600;
		color: #334155;
	}

	.local-shell__viewport {
		height: 280px;
	}

	.viewport-grid {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background-image:
			linear-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px),
			linear-gradient(90deg, rgba(148, 163, 184, 0.12) 1px, transparent 1px);
		background-size: 40px 40px;
	}

	.world-node,
	.local-node {
		position: absolute;
		transform: translate(-50%, -50%);
		display: flex;
		align-items: center;
		gap: 0.8rem;
		padding: 0.85rem 1rem;
		border-radius: 24px;
		border: 1px solid color-mix(in srgb, var(--accent) 36%, white);
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.88)),
			color-mix(in srgb, var(--accent) 10%, white);
		box-shadow: 0 10px 25px rgba(15, 23, 42, 0.12);
		overflow: hidden;
		transition: all 180ms ease;
	}

	.world-node[data-stage='dot'],
	.local-node[data-stage='dot'] {
		padding: 0;
		border-radius: 999px;
	}

	.world-node[data-stage='icon'],
	.local-node[data-stage='icon'] {
		padding: 0.25rem;
		border-radius: 999px;
	}

	.world-node.is-active {
		box-shadow:
			0 0 0 2px color-mix(in srgb, var(--accent) 44%, white),
			0 16px 42px rgba(15, 23, 42, 0.18);
	}

	.world-node__icon,
	.local-node__icon {
		display: grid;
		place-items: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--accent) 82%, white);
		color: white;
		font-weight: 700;
		flex: 0 0 auto;
	}

	.world-node__copy,
	.local-node__copy {
		min-width: 0;
	}

	.world-node__title,
	.local-node__title {
		font-weight: 700;
		line-height: 1.1;
	}

	.world-node__meta,
	.local-node__meta,
	.world-node__description {
		margin-top: 0.25rem;
		font-size: 0.78rem;
		color: #526277;
	}

	.audit-panel {
		padding: 1rem 1.25rem 1.25rem;
	}

	.audit-panel h2 {
		margin: 0 0 0.85rem;
		font-size: 1rem;
	}

	.audit-title-row {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: baseline;
	}

	.audit-card p {
		margin: 0.55rem 0 0;
		font-size: 0.84rem;
		color: #526277;
	}

	@media (max-width: 900px) {
		.hero-panel,
		.control-panel,
		.metrics,
		.audit-grid {
			grid-template-columns: 1fr;
		}

		.component-shell__head,
		.local-shell__head {
			flex-direction: column;
		}

		.prezi-story {
			padding: 0.75rem;
		}

		.viewport-shell {
			height: 980px;
		}
	}

	._c1 {
		height: 42rem;
		border-radius: 1.5rem;
	}
</style>
