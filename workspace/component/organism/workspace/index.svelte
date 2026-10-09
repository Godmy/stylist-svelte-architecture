<script lang="ts">
	import IconButton from '$stylist/button/component/atom/icon-button/index.svelte';
	import Icon from '$stylist/svg/component/atom/icon/index.svelte';
	import Separator from '$stylist/layout/component/atom/separator/index.svelte';
	import WorkspaceCanvas from '$stylist/workspace/component/atom/workspace-canvas/index.svelte';
	import NodeConnection from '$stylist/workspace/component/atom/node-connection/index.svelte';
	import WorkspaceToolbar from '$stylist/workspace/component/molecule/workspace-toolbar/index.svelte';
	import NodeProperties from '$stylist/workspace/component/molecule/node-properties/index.svelte';
	import WorkspaceNode from '$stylist/workspace/component/organism/workspace-node/index.svelte';
	import WorkspacePalette from '$stylist/workspace/component/organism/workspace-palette/index.svelte';
	import Minimap from '$stylist/workspace/component/organism/minimap/index.svelte';
	import type { RecipeWorkspace } from '$stylist/workspace/interface/recipe/workspace';
	import createWorkspaceState from './state.svelte';

	let props: RecipeWorkspace = $props();
	const state = createWorkspaceState(props);
</script>

<svelte:window
	onresize={state.recalculatePalettePosition}
	onmousemove={state.handleCanvasMouseMove}
	onmouseup={state.handleCanvasMouseUp}
/>

<div bind:this={state.editorRef} class={`workspace ${props.class ?? ''}`} {...state.restProps}>
	<div class="workspace__body">
		<div class="workspace__main">
			{#if props.showToolbar ?? true}
				<div class="workspace__toolbar">
					<WorkspaceToolbar
						id="workspace-toolbar"
						items={state.toolbarItems}
						orientation="horizontal"
						size="sm"
						onItemClick={state.handleToolbarItemClick}
					>
						{#if props.toolbarContent}
							{@render props.toolbarContent()}
						{/if}
					</WorkspaceToolbar>
				</div>
			{/if}

			<div class="workspace__canvas-container" bind:this={state.canvasHostRef}>
				<WorkspaceCanvas
					width={state.canvasSize.width}
					height={state.canvasSize.height}
					zoom={state.internalZoom}
					minZoom={0.1}
					maxZoom={3}
					offsetX={state.internalOffset.x}
					offsetY={state.internalOffset.y}
					gridMode={state.effectiveGridMode}
					gridColor={state.isGridVisible ? undefined : 'transparent'}
					panMode={state.effectivePanMode}
					snapToGrid={true}
					onzoomchange={state.updateZoom}
					onoffsetchange={state.updateOffset}
					oncanvasclick={state.handleCanvasClick}
					class="workspace__canvas"
				>
					<svg class="workspace__connections" style="overflow: visible;">
						{#each props.connections ?? [] as connection}
							<NodeConnection
								id={connection.id}
								startX={connection.startX ?? 0}
								startY={connection.startY ?? 0}
								endX={connection.endX ?? 0}
								endY={connection.endY ?? 0}
								type={connection.type}
								color={connection.color}
								active={connection.active}
								onclick={connection.onclick}
							/>
						{/each}
						{#if state.isConnecting && state.connectionStartPosition && state.connectionCurrentPosition}
							<NodeConnection
								id="connection-dragging"
								startX={state.connectionStartPosition.x}
								startY={state.connectionStartPosition.y}
								endX={state.connectionCurrentPosition.x}
								endY={state.connectionCurrentPosition.y}
								type="bezier"
								color="var(--color-primary-500)"
								active={true}
								showArrow={false}
								animated={true}
							/>
						{/if}
					</svg>

					{#each props.nodes ?? [] as node}
						<WorkspaceNode
							id={node.id}
							title={node.title}
							type={node.type as
								| 'default'
								| 'custom'
								| 'source'
								| 'processor'
								| 'output'
								| 'gateway'}
							x={node.x ?? 0}
							y={node.y ?? 0}
							canvasZoom={state.internalZoom}
							color={node.color}
							selected={(props.selectedNodeIds ?? []).includes(node.id ?? '')}
							inputs={node.inputs ? [...node.inputs] : undefined}
							outputs={node.outputs ? [...node.outputs] : undefined}
							properties={node.properties ? [...node.properties] : undefined}
							draggable={true}
							selectable={true}
							deletable={props.allowDeleteNodes ?? true}
							duplicable={props.allowDuplicateNodes ?? true}
							onNodeSelect={(nodeId) => state.handleNodeSelect(nodeId ?? '')}
							onNodeDrag={(nodeId, position) => state.handleNodeDrag(nodeId ?? '', position)}
							ondelete={(nodeId) => state.handleNodeDelete(nodeId ?? '')}
							onduplicate={(nodeId) => state.handleNodeDuplicate(nodeId ?? '')}
							onConnectionStart={state.handlePortConnectionStart}
							onConnectionEnd={state.handlePortConnectionEnd}
						/>
					{/each}

					{#if props.children}{@render props.children()}{/if}
				</WorkspaceCanvas>

				{#if props.showMiniMap ?? false}
					<div class="workspace__minimap" style="width: 220px; height: 150px;">
						<Minimap />
					</div>
				{/if}
			</div>
		</div>

		{#if (props.showPropertiesPanel ?? true) && state.isPropertiesPanelOpen && state.selectedNode}
			<aside class="workspace__properties">
				<NodeProperties
					id="properties-panel"
					nodeId={state.selectedNode.id}
					title="Node Properties"
					properties={state.selectedNode.properties ?? []}
					size="md"
					editable={true}
					showHeader={true}
					showClose={true}
					onPropertyChange={state.handlePropertyChange}
					onclose={() => (state.isPropertiesPanelOpen = false)}
				/>
			</aside>
		{/if}
	</div>

	{#if props.showWorkspacePalette ?? true}
		<div class="workspace__palette">
			<WorkspacePalette
				isOpen={state.isPaletteOpen}
				x={state.anchoredPalettePosition.x}
				y={state.anchoredPalettePosition.y}
				items={state.defaultPaletteNodes}
				searchQuery={state.paletteSearchQuery}
				selectedCategory={state.paletteSelectedCategory}
				viewMode="list"
				onSearch={(query: string) => (state.paletteSearchQuery = query)}
				onNodeSelect={state.handlePaletteNodeSelect}
				onClose={() => (state.isPaletteOpen = false)}
				onCategorySelect={(category: string) => (state.paletteSelectedCategory = category)}
			/>
		</div>
	{/if}

	<div class="workspace__quick-actions">
		<div class="workspace__quick-anchor" bind:this={state.addButtonAnchorRef}>
			<IconButton
				variant="primary"
				size="md"
				aria-label="Add node"
				title="Add Node"
				onclick={state.handleTogglePalette}
			>
				<Icon name="plus" size={20} />
			</IconButton>
		</div>

		<Separator orientation="vertical" />

		<IconButton
			variant="ghost"
			size="md"
			aria-label="Toggle properties panel"
			title="Toggle Properties"
			onclick={state.handleToggleProperties}
		>
			<Icon name="settings" size={18} />
		</IconButton>

		<IconButton variant="ghost" size="md" aria-label="Help" title="Help">
			<Icon name="info" size={18} />
		</IconButton>
	</div>
</div>

<style>
	.workspace {
		position: relative;
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: var(--color-background-primary);
	}
	.workspace__body {
		position: relative;
		display: flex;
		flex-direction: row;
		flex: 1 1 auto;
		min-height: 0;
		overflow: hidden;
	}
	.workspace__main {
		position: relative;
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
		min-width: 0;
		height: 100%;
		overflow: hidden;
	}
	.workspace__toolbar {
		display: flex;
		align-items: center;
		padding: 0.75rem;
		background: color-mix(
			in srgb,
			var(--color-background-primary) 90%,
			var(--color-background-secondary) 10%
		);
		border-bottom: 1px solid var(--color-border-primary);
	}
	.workspace__canvas-container {
		position: relative;
		flex: 1 1 auto;
		display: flex;
		overflow: hidden;
	}
	.workspace__canvas {
		flex: 1 1 auto;
	}
	.workspace__connections {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 5;
	}
	.workspace__connections > :global(*) {
		pointer-events: stroke;
	}
	.workspace__minimap {
		position: absolute;
		bottom: 1rem;
		right: 1rem;
		z-index: 10;
	}
	.workspace__palette {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 50;
		pointer-events: none;
	}
	.workspace__palette > :global(*) {
		pointer-events: auto;
	}
	.workspace__properties {
		position: relative;
		flex: 0 0 300px;
		width: 300px;
		height: 100%;
		overflow-y: auto;
		border-left: 1px solid var(--color-border-primary);
		background: var(--color-background-primary);
	}
	.workspace__properties > :global(.node-properties) {
		width: 100%;
		height: 100%;
		max-height: none;
		border: none;
		border-radius: 0;
	}
	.workspace__quick-actions {
		position: absolute;
		bottom: 1.5rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: color-mix(in srgb, var(--color-background-primary) 95%, transparent);
		border: 1px solid var(--color-border-primary);
		border-radius: 0.75rem;
		box-shadow: var(--layout-box-shadow-custom42, 0 10px 15px -3px rgb(0 0 0 / 0.1));
		z-index: 50;
		backdrop-filter: blur(8px);
	}
	.workspace__quick-actions :global(.separator) {
		height: 1.5rem;
		margin: 0 0.25rem;
	}
	.workspace__quick-anchor {
		display: inline-flex;
	}
</style>
