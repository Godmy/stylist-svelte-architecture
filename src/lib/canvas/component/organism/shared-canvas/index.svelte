<script lang="ts">
	import { CanvasManager } from '$stylist/canvas/class/manager/canvas';
	import type { RecipeSharedCanvas } from '$stylist/canvas/interface/recipe/shared-canvas';
	import BaseIcon from '$stylist/svg/component/atom/icon/index.svelte';
	import { ObjectManagerSharedCanvas } from '$stylist/canvas/class/manager/shared-canvas/index';
	import createSharedCanvasState from './state.svelte';

	const contract: RecipeSharedCanvas = $props();
	const state = createSharedCanvasState(() => contract);

	let canvasRef: HTMLCanvasElement | null = null;
	let ctx: CanvasRenderingContext2D | null = null;

	$effect(() => {
		state.syncFromProps(contract.objects ?? []);
	});

	$effect(() => {
		if (!canvasRef) return;
		ctx = canvasRef.getContext('2d');
		state.redrawCanvas(ctx, canvasRef);
	});

	$effect(() => {
		state.redrawCanvas(ctx, canvasRef);
	});

	function handleMouseDown(event: MouseEvent): void {
		if (!canvasRef) return;
		state.beginDrawing(CanvasManager.getCanvasPointerPosition(event, canvasRef));
		state.redrawCanvas(ctx, canvasRef);
	}

	function handleMouseMove(event: MouseEvent): void {
		if (!canvasRef) return;
		state.updateDrawing(CanvasManager.getCanvasPointerPosition(event, canvasRef));
		state.redrawCanvas(ctx, canvasRef);
	}

	function handleMouseUp(): void {
		state.endDrawing();
		state.redrawCanvas(ctx, canvasRef);
	}
</script>

<div class={state.containerClass} {...state.restProps}>
	{#if state.showToolbar}
		<div class={state.toolbarClass}>
			<div class={state.toolbarGroupClass}>
				{#each state.toolDefinitions as tool (tool.id)}
					<button
						type="button"
						class={state.toolButtonClass(tool.id)}
						onclick={() => state.selectTool(tool.id)}
						title={tool.title}
						aria-label={tool.title}
					>
						<BaseIcon name={tool.icon} class="_c1" />
					</button>
				{/each}
			</div>

			<div class={state.toolbarDividerClass}></div>

			<div class={state.toolbarGroupClass}>
				<label class={state.colorLabelClass}>
					<BaseIcon name={state.actionIcons.color} class="_c2" />
					Color:
					<input
						type="color"
						class={state.colorInputClass}
						value={state.selectedColor}
						oninput={(event) =>
							state.setSelectedColor((event.currentTarget as HTMLInputElement).value)}
						aria-label="Select color"
					/>
				</label>
			</div>

			<div class={state.toolbarDividerClass}></div>

			<div class={state.toolbarGroupClass}>
				<button
					type="button"
					class={state.actionButtonClass}
					onclick={state.undo}
					title="Undo"
					aria-label="Undo"
					disabled={state.undoStack.length === 0}
				>
					<BaseIcon name={state.actionIcons.undo} class="_c1" />
				</button>
				<button
					type="button"
					class={state.actionButtonClass}
					onclick={state.redo}
					title="Redo"
					aria-label="Redo"
					disabled={state.redoStack.length === 0}
				>
					<BaseIcon name={state.actionIcons.redo} class="_c1" />
				</button>
				<button
					type="button"
					class={state.actionButtonClass}
					onclick={state.deleteSelected}
					title="Delete Selected"
					aria-label="Delete Selected"
					disabled={state.localObjects.length === 0}
				>
					<BaseIcon name={state.actionIcons.delete} class="_c1" />
				</button>
				<button
					type="button"
					class={state.actionButtonClass}
					onclick={() =>
						CanvasManager.exportCanvasImage(canvasRef, ObjectManagerSharedCanvas.exportFilename)}
					title="Export Canvas"
					aria-label="Export Canvas"
				>
					<BaseIcon name={state.actionIcons.export} class="_c1" />
				</button>
			</div>
		</div>
	{/if}

	<div class={state.workspaceClass}>
		<div class={state.canvasPaneClass}>
			<canvas
				bind:this={canvasRef}
				width={state.width}
				height={state.height}
				class={state.canvasClass}
				onmousedown={handleMouseDown}
				onmousemove={handleMouseMove}
				onmouseup={handleMouseUp}
				onmouseleave={handleMouseUp}
			></canvas>

			{#if state.showUsers && contract.users && contract.users.length > 0}
				{#each contract.users as user}
					{#if user.cursorPosition && user.id !== contract.currentUserId}
						<div
							class={state.remoteCursorClass}
							style={`left: ${user.cursorPosition.x}px; top: ${user.cursorPosition.y}px; background-color: ${user.color};`}
							title={user.name}
							aria-label={`Cursor of ${user.name}`}
						></div>
					{/if}
				{/each}
			{/if}
		</div>

		{#if state.showUsers}
			<div class={state.userPanelClass}>
				<h4 class={state.userPanelTitleClass}>Collaborators</h4>
				<div class={state.userListClass}>
					{#each contract.users ?? [] as user}
						<div class={state.userItemClass}>
							<div
								class={state.userSwatchClass}
								style={`background-color: ${user.color}`}
								title={user.name}
								aria-label={user.name}
							></div>
							<span class={state.userNameClass}>{user.name}</span>
							{#if user.id === contract.currentUserId}
								<span class={state.currentUserClass}>(You)</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.c-shared-canvas {
		border: 1px solid var(--color-border-primary);
		border-radius: 0.5rem;
		overflow: hidden;
		background: var(--color-background-primary);
		box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
	}

	.c-shared-canvas--minimal {
		box-shadow: none;
	}

	.c-shared-canvas__toolbar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		border-bottom: 1px solid var(--color-border-primary);
		background: var(--color-background-primary);
	}

	.c-shared-canvas__toolbar-group {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.c-shared-canvas__toolbar-divider {
		height: 1.25rem;
		width: 1px;
		border-left: 1px solid var(--color-border-primary);
		margin-inline: 0.5rem;
	}

	.c-shared-canvas__color-label {
		display: flex;
		align-items: center;
		font-size: 0.875rem;
	}

	.c-shared-canvas__color-input {
		margin-left: 0.25rem;
		width: 2rem;
		height: 2rem;
		padding: 0.25rem;
		border: 1px solid var(--color-border-primary);
		border-radius: 0.25rem;
		cursor: pointer;
	}

	.c-shared-canvas__tool-btn {
		padding: 0.5rem;
		border-radius: 0.25rem;
		background: none;
		border: none;
		cursor: pointer;
		transition: background var(--duration-150, 150ms) ease;
	}

	.c-shared-canvas__tool-btn:hover {
		background: var(--color-background-secondary);
	}

	.c-shared-canvas__tool-btn--active {
		background: var(--color-primary-500);
		color: var(--color-text-inverse);
	}

	.c-shared-canvas__tool-btn--active:hover {
		background: var(--color-primary-600);
	}

	.c-shared-canvas__action-btn {
		padding: 0.375rem 0.75rem;
		font-size: 0.875rem;
		border-radius: 0.375rem;
		background: var(--color-primary-500);
		color: var(--color-text-inverse);
		border: none;
		cursor: pointer;
		transition: background var(--duration-150, 150ms) ease;
	}

	.c-shared-canvas__action-btn:hover {
		background: var(--color-primary-600);
	}

	.c-shared-canvas__action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.c-shared-canvas__workspace {
		display: flex;
	}

	.c-shared-canvas__pane {
		flex: 1;
		position: relative;
	}

	.c-shared-canvas__canvas {
		position: relative;
		width: 100%;
		height: 31.25rem;
		background: var(--color-background-primary);
		display: block;
	}

	.c-shared-canvas__cursor {
		position: absolute;
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 9999px;
		pointer-events: none;
	}

	.c-shared-canvas__user-panel {
		width: 14rem;
		flex-shrink: 0;
		border-left: 1px solid var(--color-border-primary);
		padding: 0.75rem;
	}

	.c-shared-canvas__user-panel-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		margin-bottom: 0.5rem;
	}

	.c-shared-canvas__user-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.c-shared-canvas__user-item {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
	}

	.c-shared-canvas__user-item:hover {
		background: var(--color-background-secondary);
	}

	.c-shared-canvas__user-swatch {
		width: 1rem;
		height: 1rem;
		border-radius: 9999px;
		margin-right: 0.5rem;
		flex-shrink: 0;
	}

	.c-shared-canvas__user-name {
		font-size: 0.875rem;
		color: var(--color-text-primary);
	}

	.c-shared-canvas__current-user {
		margin-left: 0.25rem;
		font-size: 0.75rem;
		color: var(--color-text-tertiary, var(--color-text-secondary));
	}

	._c1 {
		height: 1rem;
		width: 1rem;
	}
	._c2 {
		margin-right: 0.25rem;
		height: 1rem;
		width: 1rem;
	}
</style>
