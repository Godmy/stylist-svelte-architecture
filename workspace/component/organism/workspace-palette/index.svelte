<script lang="ts">
	import IconButton from '$stylist/button/component/atom/icon-button/index.svelte';
	import InputText from '$stylist/input/component/molecule/input-text/index.svelte';
	import Icon from '$stylist/svg/component/atom/icon/index.svelte';
	import Separator from '$stylist/layout/component/atom/separator/index.svelte';
	import createWorkspacePaletteState from './state.svelte';
	import type { RecipeWorkspacePalette as WorkspacePaletteProps } from '$stylist/workspace/interface/recipe/workspace-palette';

	let {
		items = [],
		isOpen = true,
		x = 0,
		y = 0,
		width = 320,
		height = 480,
		searchQuery = '',
		viewMode = 'list',
		selectedCategory = 'all',
		categories = ['all', 'default', 'source', 'processor', 'output', 'gateway', 'custom'],
		dismissible = true,
		onSearch,
		onNodeSelect,
		onClose,
		onViewModeChange,
		onCategorySelect,
		class: className = '',
		children,
		...restProps
	}: WorkspacePaletteProps = $props();

	const state = createWorkspacePaletteState({
		items,
		isOpen,
		x,
		y,
		width,
		height,
		searchQuery,
		viewMode,
		selectedCategory,
		categories,
		dismissible,
		onSearch,
		onNodeSelect,
		onClose,
		onViewModeChange,
		onCategorySelect,
		children,
		class: className
	});
</script>

{#if isOpen}
	<div class={state.rootClass} style={state.paletteStyle} {...restProps}>
		<div class="workspace-palette__header">
			<div class="workspace-palette__header-title">
				<h3 class="workspace-palette__title">Workspace Palette</h3>
				{#if dismissible}
					<IconButton
						variant="ghost"
						size="sm"
						aria-label="Close palette"
						onclick={state.handleClose}
					>
						<Icon name="x" size={16} />
					</IconButton>
				{/if}
			</div>

			<div class="workspace-palette__search">
				<InputText
					placeholder="Search nodes..."
					value={searchQuery}
					size="sm"
					oninput={(event: Event) => state.handleSearch((event.target as HTMLInputElement).value)}
				/>
			</div>

			<div class="workspace-palette__actions">
				<IconButton
					variant={viewMode === 'list' ? 'primary' : 'ghost'}
					size="sm"
					aria-label="List view"
					title="List view"
					onclick={() => {
						if (viewMode !== 'list') state.handleViewModeToggle();
					}}
				>
					<Icon name="list" size={16} />
				</IconButton>
				<IconButton
					variant={viewMode === 'grid' ? 'primary' : 'ghost'}
					size="sm"
					aria-label="Grid view"
					title="Grid view"
					onclick={() => {
						if (viewMode !== 'grid') state.handleViewModeToggle();
					}}
				>
					<Icon name="grid-3x3" size={16} />
				</IconButton>
			</div>
		</div>

		<div class="workspace-palette__categories">
			{#each state.categories as category}
				<button
					type="button"
					class={`workspace-palette__category${category === selectedCategory ? ' workspace-palette__category--active' : ''}`}
					onclick={() => state.handleCategorySelect(category)}
				>
					{state.getCategoryLabel(category)}
				</button>
			{/each}
		</div>

		<Separator orientation="horizontal" />

		<div class="workspace-palette__content">
			{#if state.filteredItems.length === 0}
				<div class="workspace-palette__empty">
					{#if searchQuery}
						<p>No nodes found for "{searchQuery}"</p>
					{:else}
						<p>No nodes available</p>
					{/if}
				</div>
			{:else}
				{#each Object.entries(state.groupedItems) as [category, categoryItems]}
					{#if viewMode === 'list'}
						<div class="workspace-palette__group">
							{#if category !== 'all'}
								<h4 class="workspace-palette__group-title">{category}</h4>
							{/if}
							{#each categoryItems as item}
								<button
									type="button"
									class="workspace-palette__item"
									onclick={() => state.handleNodeClick(item)}
								>
									<div
										class="workspace-palette__item-icon"
										style={`background-color: ${item.color ?? 'var(--color-primary-500)'};`}
									></div>
									<div class="workspace-palette__item-info">
										<span class="workspace-palette__item-title">{item.title}</span>
										{#if item.description}
											<span class="workspace-palette__item-description">{item.description}</span>
										{/if}
									</div>
								</button>
							{/each}
						</div>
					{:else}
						<div class="workspace-palette__grid">
							{#each categoryItems as item}
								<button
									type="button"
									class="workspace-palette__grid-item"
									onclick={() => state.handleNodeClick(item)}
								>
									<div
										class="workspace-palette__grid-item-icon"
										style={`background-color: ${item.color ?? 'var(--color-primary-500)'};`}
									></div>
									<span class="workspace-palette__grid-item-title">{item.title}</span>
								</button>
							{/each}
						</div>
					{/if}
				{/each}
			{/if}

			{#if children}{@render children()}{/if}
		</div>
	</div>
{/if}

<style>
	.workspace-palette {
		position: absolute;
		top: var(--palette-y, 0px);
		left: var(--palette-x, 0px);
		width: var(--palette-width, 320px);
		max-height: var(--palette-height, 480px);
		display: flex;
		flex-direction: column;
		background: var(--color-background-primary);
		border: 1px solid var(--color-border-primary);
		border-radius: 0.5rem;
		box-shadow: var(--layout-box-shadow-custom42, 0 10px 15px -3px rgb(0 0 0 / 0.1));
		z-index: 100;
		overflow: hidden;
	}
	.workspace-palette__header {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		background: var(--color-background-secondary);
		border-bottom: 1px solid var(--color-border-primary);
	}
	.workspace-palette__header-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.workspace-palette__title {
		margin: 0;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}
	.workspace-palette__search {
		flex: 1 1 auto;
	}
	.workspace-palette__actions {
		display: flex;
		gap: 0.25rem;
	}
	.workspace-palette__categories {
		display: flex;
		gap: 0.25rem;
		padding: 0.75rem 1rem;
		overflow-x: auto;
		background: var(--color-background-tertiary);
	}
	.workspace-palette__category {
		padding: 0.25rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		background: var(--color-background-secondary);
		border: 1px solid var(--color-border-primary);
		border-radius: 0.25rem;
		cursor: pointer;
		white-space: nowrap;
		transition: all 120ms ease;
	}
	.workspace-palette__category:hover {
		color: var(--color-text-primary);
		background: var(--color-border-primary);
	}
	.workspace-palette__category--active {
		color: var(--color-text-primary);
		background: var(--color-primary-500);
		border-color: var(--color-primary-500);
	}
	.workspace-palette__content {
		flex: 1 1 auto;
		overflow-y: auto;
		padding: 0.75rem;
	}
	.workspace-palette__empty {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		min-height: 200px;
	}
	.workspace-palette__empty p {
		margin: 0;
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
		text-align: center;
	}
	.workspace-palette__group {
		margin-bottom: 1rem;
	}
	.workspace-palette__group:last-child {
		margin-bottom: 0;
	}
	.workspace-palette__group-title {
		margin: 0 0 0.5rem 0;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.workspace-palette__item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem;
		background: var(--color-background-tertiary);
		border: 1px solid transparent;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 120ms ease;
		margin-bottom: 0.5rem;
		width: 100%;
		text-align: left;
	}
	.workspace-palette__item:last-child {
		margin-bottom: 0;
	}
	.workspace-palette__item:hover {
		background: var(--color-background-secondary);
		border-color: var(--color-border-primary);
		transform: translateX(2px);
	}
	.workspace-palette__item:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
	}
	.workspace-palette__item-icon {
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		flex-shrink: 0;
	}
	.workspace-palette__item-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
		flex: 1 1 auto;
	}
	.workspace-palette__item-title {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.workspace-palette__item-description {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.workspace-palette__grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
		gap: 0.75rem;
	}
	.workspace-palette__grid-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		background: var(--color-background-tertiary);
		border: 1px solid transparent;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 120ms ease;
	}
	.workspace-palette__grid-item:hover {
		background: var(--color-background-secondary);
		border-color: var(--color-border-primary);
		transform: translateY(-2px);
	}
	.workspace-palette__grid-item-icon {
		width: 3rem;
		height: 3rem;
		border-radius: 0.5rem;
	}
	.workspace-palette__grid-item-title {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-primary);
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		width: 100%;
	}
	.workspace-palette__content::-webkit-scrollbar {
		width: 0.5rem;
	}
	.workspace-palette__content::-webkit-scrollbar-track {
		background: var(--color-background-primary);
	}
	.workspace-palette__content::-webkit-scrollbar-thumb {
		background: var(--color-border-secondary);
		border-radius: 0.25rem;
	}
	.workspace-palette__content::-webkit-scrollbar-thumb:hover {
		background: var(--color-text-tertiary);
	}
	.workspace-palette__categories::-webkit-scrollbar {
		height: 0.5rem;
	}
	.workspace-palette__categories::-webkit-scrollbar-thumb {
		background: var(--color-border-secondary);
		border-radius: 0.125rem;
	}
</style>
