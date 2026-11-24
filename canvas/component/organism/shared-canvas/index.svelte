<script lang="ts">
	import { untrack } from 'svelte';
	import BaseIcon from '$stylist/svg/component/atom/icon/index.svelte';
	import createSharedCanvasState from '$stylist/canvas/component/organism/shared-canvas/state.svelte';
	import { CanvasShapeManager } from '$stylist/canvas/class/manager/canvas-shape';
	import { ObjectManagerSharedCanvas } from '$stylist/canvas/class/manager/shared-canvas';
	import { CANVAS_SHAPE_KIND } from '$stylist/canvas/const/array/canvas-shape-kind';
	import { CANVAS_BOARD_ICON } from '$stylist/canvas/const/array/canvas-board-icon';
	import { CANVAS_COLOR_SWATCH } from '$stylist/canvas/const/array/canvas-color-swatch';
	import { CANVAS_FONT_FAMILY } from '$stylist/canvas/const/map/canvas-font-family';
	import { CANVAS_BOARD_GLYPH } from '$stylist/canvas/const/map/canvas-board-glyph';
	import { CANVAS_SHARED_CANVAS_MESSAGE } from '$stylist/canvas/const/record/shared-canvas-message';
	import type { RecipeSharedCanvas } from '$stylist/canvas/interface/recipe/shared-canvas';
	import type { CanvasFontFamily } from '$stylist/canvas/type/alias/canvas-font-family';
	import { useMessage } from '$stylist/localization/function/hook/use-message';

	const contract: RecipeSharedCanvas = $props();
	const state = createSharedCanvasState(() => contract);
	const t = useMessage('shared-canvas', CANVAS_SHARED_CANVAS_MESSAGE);
	const icons = ObjectManagerSharedCanvas.actionIcons;

	$effect(() => {
		const incoming = contract.objects;
		untrack(() => state.syncFromProps(incoming));
	});

	$effect(() => {
		const element = state.viewportElement;
		if (!element) return;
		const listener = (event: WheelEvent) => state.wheel(event, element);
		element.addEventListener('wheel', listener, { passive: false });
		return () => element.removeEventListener('wheel', listener);
	});

	$effect(() => {
		if (!state.editingId || !state.editorElement) return;
		const editor = state.editorElement;
		untrack(() => {
			editor.focus({ preventScroll: true });
			editor.select();
		});
	});
</script>

{#snippet glyph(name: keyof typeof CANVAS_BOARD_GLYPH, size: number)}
	<svg
		viewBox="0 0 24 24"
		width={size}
		height={size}
		fill="none"
		stroke="currentColor"
		stroke-width="1.7"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<path d={CANVAS_BOARD_GLYPH[name]} />
	</svg>
{/snippet}

<svelte:window
	onkeydown={(event) => state.hasFocus() && state.keyDown(event)}
	onkeyup={(event) => state.keyUp(event)}
/>

<div
	bind:this={state.rootElement}
	class={[
		'c-shared-canvas',
		contract.variant === 'minimal' && 'c-shared-canvas--minimal',
		contract.class
	]}
	style:width={contract.width ? `${contract.width}px` : '100%'}
	style:height={`${contract.height ?? 600}px`}
	{...state.restProps}
>
	<!-- The board is a focusable WAI-ARIA application: it handles its own keys and pointer gestures. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		bind:this={state.viewportElement}
		bind:clientWidth={state.viewportWidth}
		bind:clientHeight={state.viewportHeight}
		class={[
			'c-shared-canvas__viewport',
			(contract.showGrid ?? true) && 'c-shared-canvas__viewport--grid',
			contract.canvasClass
		]}
		style="cursor: {state.cursor}; {state.gridStyle}"
		role="application"
		aria-label={t('label')}
		tabindex="0"
		onpointerdown={(event) =>
			state.viewportElement && state.pointerDown(event, state.viewportElement)}
		onpointermove={(event) =>
			state.viewportElement && state.pointerMove(event, state.viewportElement)}
		onpointerup={(event) => state.viewportElement && state.pointerUp(event, state.viewportElement)}
		onpointercancel={(event) =>
			state.viewportElement && state.pointerUp(event, state.viewportElement)}
		ondblclick={(event) => state.viewportElement && state.doubleClick(event, state.viewportElement)}
	>
		<div
			class="c-shared-canvas__world"
			style="transform: translate({state.viewport.x}px, {state.viewport.y}px) scale({state.viewport
				.zoom}); --zoom: {state.viewport.zoom};"
		>
			{#each state.layers as object (object.id)}
				{#if object.type === 'line' || object.type === 'path'}
					{@const frame = ObjectManagerSharedCanvas.getStrokeFrame(object)}
					<svg
						class="c-shared-canvas__item c-shared-canvas__stroke"
						style={frame.style}
						viewBox={frame.viewBox}
						aria-hidden="true"
					>
						<path
							d={frame.d}
							fill="none"
							stroke={object.color ?? 'currentColor'}
							stroke-width={object.strokeWidth ?? 2}
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						{#if frame.head}
							<path d={frame.head} fill={object.color ?? 'currentColor'} />
						{/if}
					</svg>
				{:else}
					<div
						class="c-shared-canvas__item c-shared-canvas__item--{object.type}"
						style={ObjectManagerSharedCanvas.getBoxStyle(object)}
						style:color={object.color}
						style:background={object.type === 'sticky' || object.type === 'frame'
							? object.fill
							: undefined}
						data-object-id={object.id}
					>
						{#if object.type === 'shape'}
							<svg
								class="c-shared-canvas__shape"
								viewBox="0 0 {Math.max(1, object.width)} {Math.max(1, object.height)}"
								preserveAspectRatio="none"
								aria-hidden="true"
							>
								<path
									d={CanvasShapeManager.getPath(
										object.shape,
										object.width,
										object.height,
										(object.strokeWidth ?? 2) / 2
									)}
									fill={object.fill ?? 'transparent'}
									stroke={object.color ?? 'currentColor'}
									stroke-width={object.strokeWidth ?? 2}
									stroke-linejoin="round"
								/>
							</svg>
						{/if}
						{#if object.type === 'frame'}
							<div class="c-shared-canvas__frame-title">
								{state.editingId === object.id ? '' : object.title || t('frameTitle')}
							</div>
						{:else if object.type === 'icon'}
							<BaseIcon
								name={object.icon}
								size={Math.max(8, Math.min(object.width, object.height))}
								color={object.color}
							/>
						{:else if state.editingId !== object.id && object.text}
							<div
								class="c-shared-canvas__text c-shared-canvas__text--{object.type}"
								style={ObjectManagerSharedCanvas.getFontStyle(object.font)}
							>
								{object.text}
							</div>
						{/if}
					</div>
				{/if}
			{/each}

			{#if state.editingObject}
				{@const editing = state.editingObject}
				{#if editing.type === 'frame'}
					<textarea
						bind:this={state.editorElement}
						class="c-shared-canvas__editor c-shared-canvas__editor--frame"
						style="left: {editing.x}px; top: {editing.y}px; width: {editing.width}px;"
						value={editing.title ?? ''}
						placeholder={t('frameTitle')}
						rows="1"
						oninput={(event) => state.setEditingText(event.currentTarget.value)}
						onblur={() => state.finishEditing()}
						onpointerdown={(event) => event.stopPropagation()}
						ondblclick={(event) => event.stopPropagation()}></textarea>
				{:else if editing.type === 'text' || editing.type === 'sticky' || editing.type === 'shape'}
					<textarea
						bind:this={state.editorElement}
						class="c-shared-canvas__editor c-shared-canvas__editor--{editing.type}"
						style="{ObjectManagerSharedCanvas.getBoxStyle(
							editing
						)} {ObjectManagerSharedCanvas.getFontStyle(editing.font)}"
						style:color={editing.color}
						value={editing.text ?? ''}
						placeholder={t('textPlaceholder')}
						oninput={(event) => {
							const editor = event.currentTarget;
							if (editing.type === 'text') editor.style.height = 'auto';
							state.setEditingText(editor.value, editor.scrollHeight);
							editor.style.height = '';
						}}
						onblur={() => state.finishEditing()}
						onpointerdown={(event) => event.stopPropagation()}
						ondblclick={(event) => event.stopPropagation()}></textarea>
				{/if}
			{/if}

			{#if state.selectionBounds && !state.editingId}
				{@const bounds = state.selectionBounds}
				{@const single = state.singleSelected}
				<div
					class="c-shared-canvas__selection"
					style={ObjectManagerSharedCanvas.getBoxStyle(bounds)}
					aria-hidden="true"
				></div>
				{#if single && !state.readonly}
					{#if single.type === 'line'}
						{#each [['start', single.points[0]], ['end', single.points[1]]] as const as [handle, point] (handle)}
							<div
								class="c-shared-canvas__handle"
								style="left: {point.x}px; top: {point.y}px; cursor: move;"
								role="presentation"
								onpointerdown={(event) =>
									state.viewportElement && state.beginResize(event, state.viewportElement, handle)}
							></div>
						{/each}
					{:else}
						{#each [['nw', bounds.x, bounds.y], ['ne', bounds.x + bounds.width, bounds.y], ['sw', bounds.x, bounds.y + bounds.height], ['se', bounds.x + bounds.width, bounds.y + bounds.height]] as const as [handle, x, y] (handle)}
							<div
								class="c-shared-canvas__handle"
								style="left: {x}px; top: {y}px; cursor: {handle}-resize;"
								role="presentation"
								onpointerdown={(event) =>
									state.viewportElement && state.beginResize(event, state.viewportElement, handle)}
							></div>
						{/each}
					{/if}
				{/if}
			{/if}

			{#if state.marquee}
				<div
					class="c-shared-canvas__marquee"
					style={ObjectManagerSharedCanvas.getBoxStyle(state.marquee)}
					aria-hidden="true"
				></div>
			{/if}

			{#if contract.showUsers ?? true}
				{#each contract.users ?? [] as user (user.id)}
					{#if user.cursorPosition && user.id !== contract.currentUserId}
						<div
							class="c-shared-canvas__cursor"
							style="left: {user.cursorPosition.x}px; top: {user.cursorPosition.y}px;"
							style:--cursor-color={user.color}
							aria-label={t('cursor', { name: user.name })}
						>
							<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
								<path d="M1 1 L1 13 L4.5 9.5 L7 15 L9 14 L6.5 8.5 L11 8.5 Z" />
							</svg>
							<span>{user.name}</span>
						</div>
					{/if}
				{/each}
			{/if}
		</div>
	</div>

	{#if contract.showToolbar ?? true}
		<div
			class={['c-shared-canvas__toolbar', contract.toolbarClass]}
			role="toolbar"
			aria-label={t('tools')}
			aria-orientation="vertical"
		>
			{#each ObjectManagerSharedCanvas.toolDefinitions as definition (definition.id)}
				{#if !state.readonly || definition.id === 'select' || definition.id === 'hand'}
					<button
						type="button"
						class={['c-shared-canvas__tool', state.tool === definition.id && 'is-active']}
						aria-pressed={state.tool === definition.id}
						title="{t(definition.id)} ({definition.key.toUpperCase()})"
						aria-label={t(definition.id)}
						onclick={() => state.selectTool(definition.id)}
					>
						{#if definition.id === 'shape'}
							<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
								<path
									d={CanvasShapeManager.getPath(state.style.shape, 24, 24, 3)}
									fill="none"
									stroke="currentColor"
									stroke-width="1.7"
									stroke-linejoin="round"
								/>
							</svg>
						{:else if definition.id === 'icon'}
							<BaseIcon name={state.style.icon} size={20} />
						{:else}
							{@render glyph(definition.id, 20)}
						{/if}
					</button>
				{/if}
			{/each}
		</div>

		{#if !state.readonly}
			<div class="c-shared-canvas__toolbar c-shared-canvas__toolbar--history">
				<button
					type="button"
					class="c-shared-canvas__tool"
					title="{t('undo')} (Ctrl+Z)"
					aria-label={t('undo')}
					disabled={!state.canUndo}
					onclick={() => state.undo()}
				>
					{@render glyph('undo', 20)}
				</button>
				<button
					type="button"
					class="c-shared-canvas__tool"
					title="{t('redo')} (Ctrl+Shift+Z)"
					aria-label={t('redo')}
					disabled={!state.canRedo}
					onclick={() => state.redo()}
				>
					{@render glyph('redo', 20)}
				</button>
			</div>
		{/if}

		{#if state.openMenu === 'shape'}
			<div class="c-shared-canvas__flyout" role="menu" aria-label={t('shape')}>
				{#each CANVAS_SHAPE_KIND as shape (shape)}
					<button
						type="button"
						role="menuitemradio"
						aria-checked={state.style.shape === shape}
						class={['c-shared-canvas__tool', state.style.shape === shape && 'is-active']}
						title={t(shape)}
						aria-label={t(shape)}
						onclick={() => state.selectShape(shape)}
					>
						<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
							<path
								d={CanvasShapeManager.getPath(shape, 24, 24, 2.5)}
								fill="none"
								stroke="currentColor"
								stroke-width="1.7"
								stroke-linejoin="round"
							/>
						</svg>
					</button>
				{/each}
			</div>
		{:else if state.openMenu === 'icon'}
			<div
				class="c-shared-canvas__flyout c-shared-canvas__flyout--icons"
				role="menu"
				aria-label={t('icon')}
			>
				{#each CANVAS_BOARD_ICON as icon (icon)}
					<button
						type="button"
						role="menuitemradio"
						aria-checked={state.style.icon === icon}
						class={['c-shared-canvas__tool', state.style.icon === icon && 'is-active']}
						title={icon}
						aria-label={icon}
						onclick={() => state.selectIcon(icon)}
					>
						<BaseIcon name={icon} size={20} />
					</button>
				{/each}
			</div>
		{/if}

		{#if state.showStylePanel}
			<div class="c-shared-canvas__panel" role="toolbar" aria-label={t('style')}>
				{#if state.styleKinds.color}
					<div class="c-shared-canvas__group" role="group" aria-label={t('color')}>
						{#each CANVAS_COLOR_SWATCH.filter((color) => color !== 'transparent') as color (color)}
							<button
								type="button"
								class={['c-shared-canvas__swatch', state.activeColor === color && 'is-active']}
								style:background={color}
								aria-label="{t('color')} {color}"
								aria-pressed={state.activeColor === color}
								onclick={() => state.setColor(color)}
							></button>
						{/each}
						<input
							type="color"
							class="c-shared-canvas__color-input"
							value={/^#[0-9a-f]{6}$/i.test(state.activeColor) ? state.activeColor : '#111827'}
							aria-label={t('color')}
							onchange={(event) => state.setColor(event.currentTarget.value)}
						/>
					</div>
				{/if}

				{#if state.styleKinds.fill}
					<span class="c-shared-canvas__divider"></span>
					<div class="c-shared-canvas__group" role="group" aria-label={t('fill')}>
						{#each CANVAS_COLOR_SWATCH as color (color)}
							<button
								type="button"
								class={[
									'c-shared-canvas__swatch c-shared-canvas__swatch--fill',
									color === 'transparent' && 'is-empty',
									state.activeFill === color && 'is-active'
								]}
								style:background={color === 'transparent' ? undefined : color}
								aria-label={color === 'transparent' ? t('noFill') : `${t('fill')} ${color}`}
								aria-pressed={state.activeFill === color}
								onclick={() => state.setFill(color)}
							></button>
						{/each}
					</div>
				{/if}

				{#if state.styleKinds.stroke}
					<span class="c-shared-canvas__divider"></span>
					<div class="c-shared-canvas__group" role="group" aria-label={t('strokeWidth')}>
						{#each ObjectManagerSharedCanvas.strokeWidths as width (width)}
							<button
								type="button"
								class={['c-shared-canvas__chip', state.activeStrokeWidth === width && 'is-active']}
								aria-label="{t('strokeWidth')} {width}"
								aria-pressed={state.activeStrokeWidth === width}
								onclick={() => state.setStrokeWidth(width)}
							>
								<span class="c-shared-canvas__stroke-sample" style:height="{width}px"></span>
							</button>
						{/each}
					</div>
				{/if}

				{#if state.styleKinds.font}
					<span class="c-shared-canvas__divider"></span>
					<div class="c-shared-canvas__group">
						<select
							class="c-shared-canvas__select"
							aria-label={t('fontFamily')}
							value={state.activeFont.family ?? 'sans'}
							onchange={(event) =>
								state.setFont({ family: event.currentTarget.value as CanvasFontFamily })}
						>
							{#each ObjectManagerSharedCanvas.fontFamilies as family (family)}
								<option value={family} style:font-family={CANVAS_FONT_FAMILY[family]}>
									{t(`font-${family}`)}
								</option>
							{/each}
						</select>
						<select
							class="c-shared-canvas__select"
							aria-label={t('fontSize')}
							value={String(state.activeFont.size ?? 20)}
							onchange={(event) => state.setFont({ size: Number(event.currentTarget.value) })}
						>
							{#each ObjectManagerSharedCanvas.fontSizes as size (size)}
								<option value={String(size)}>{size}</option>
							{/each}
						</select>
						{#each [['bold', icons.bold], ['italic', icons.italic], ['underline', icons.underline]] as const as [key, icon] (key)}
							<button
								type="button"
								class={['c-shared-canvas__chip', state.activeFont[key] && 'is-active']}
								aria-label={t(key)}
								title={t(key)}
								aria-pressed={Boolean(state.activeFont[key])}
								onclick={() => state.toggleFont(key)}
							>
								<BaseIcon name={icon} size={16} />
							</button>
						{/each}
						{#each [['left', 'alignLeft', icons.alignLeft], ['center', 'alignCenter', icons.alignCenter], ['right', 'alignRight', icons.alignRight]] as const as [align, label, icon] (align)}
							<button
								type="button"
								class={[
									'c-shared-canvas__chip',
									(state.activeFont.align ?? 'left') === align && 'is-active'
								]}
								aria-label={t(label)}
								title={t(label)}
								aria-pressed={(state.activeFont.align ?? 'left') === align}
								onclick={() => state.setFont({ align })}
							>
								<BaseIcon name={icon} size={16} />
							</button>
						{/each}
					</div>
				{/if}

				{#if state.selectedIds.length}
					<span class="c-shared-canvas__divider"></span>
					<div class="c-shared-canvas__group">
						{#each ['front', 'back'] as const as direction (direction)}
							<button
								type="button"
								class="c-shared-canvas__chip"
								aria-label={t(direction)}
								title={t(direction)}
								onclick={() => state.reorderSelected(direction)}
							>
								{@render glyph(direction, 16)}
							</button>
						{/each}
						<button
							type="button"
							class="c-shared-canvas__chip"
							aria-label={t('duplicate')}
							title="{t('duplicate')} (Ctrl+D)"
							onclick={() => state.duplicateSelected()}
						>
							{@render glyph('duplicate', 16)}
						</button>
						<button
							type="button"
							class="c-shared-canvas__chip"
							aria-label={t('delete')}
							title="{t('delete')} (Delete)"
							onclick={() => state.deleteSelected()}
						>
							{@render glyph('delete', 16)}
						</button>
					</div>
				{/if}
			</div>
		{/if}
	{/if}

	<div class="c-shared-canvas__corner">
		{#if contract.showUsers ?? true}
			{#if contract.users?.length}
				<div class="c-shared-canvas__users" role="list" aria-label={t('collaborators')}>
					{#each contract.users as user (user.id)}
						<span
							class="c-shared-canvas__avatar"
							role="listitem"
							style:background={user.color}
							title={user.id === contract.currentUserId ? `${user.name} ${t('you')}` : user.name}
						>
							{#if user.avatar}
								<img src={user.avatar} alt={user.name} />
							{:else}
								{user.name.charAt(0).toUpperCase()}
							{/if}
						</span>
					{/each}
				</div>
			{/if}
		{/if}
		<button
			type="button"
			class="c-shared-canvas__tool"
			aria-label={t('export')}
			title={t('export')}
			onclick={() => state.exportFile()}
		>
			{@render glyph('export', 18)}
		</button>
		{#if !state.readonly}
			<button
				type="button"
				class="c-shared-canvas__tool"
				aria-label={t('import')}
				title={t('import')}
				onclick={() => state.fileInput?.click()}
			>
				{@render glyph('import', 18)}
			</button>
			<input
				bind:this={state.fileInput}
				type="file"
				accept="application/json,.json"
				hidden
				onchange={(event) => state.importFile(event.currentTarget)}
			/>
		{/if}
	</div>

	{#if contract.showZoomControls ?? true}
		<div class="c-shared-canvas__zoom" role="group" aria-label={t('zoomReset')}>
			<button
				type="button"
				class="c-shared-canvas__tool"
				aria-label={t('zoomOut')}
				title="{t('zoomOut')} (Ctrl+−)"
				onclick={() => state.zoomOut()}
			>
				{@render glyph('zoomOut', 18)}
			</button>
			<button
				type="button"
				class="c-shared-canvas__zoom-value"
				title="{t('zoomReset')} (Ctrl+0)"
				onclick={() => state.resetZoom()}
			>
				{state.zoomPercent}%
			</button>
			<button
				type="button"
				class="c-shared-canvas__tool"
				aria-label={t('zoomIn')}
				title="{t('zoomIn')} (Ctrl++)"
				onclick={() => state.zoomIn()}
			>
				{@render glyph('zoomIn', 18)}
			</button>
			<button
				type="button"
				class="c-shared-canvas__tool"
				aria-label={t('fit')}
				title={t('fit')}
				onclick={() => state.fitToContent()}
			>
				{@render glyph('fit', 18)}
			</button>
		</div>
	{/if}
</div>

<style>
	.c-shared-canvas {
		position: relative;
		max-width: 100%;
		overflow: hidden;
		border: 1px solid var(--color-border-primary);
		border-radius: 0.75rem;
		/* The board is paper: objects carry explicit colors, so it stays light in every theme. */
		background: var(--canvas-board-surface, #f5f6f8);
		color: #111827;
		user-select: none;
		touch-action: none;
	}

	.c-shared-canvas--minimal {
		border: none;
		border-radius: 0;
	}

	.c-shared-canvas__viewport {
		position: absolute;
		inset: 0;
		overflow: hidden;
		outline: none;
	}

	.c-shared-canvas__viewport--grid {
		background-image: radial-gradient(circle, rgb(17 24 39 / 0.18) 1px, transparent 1.2px);
	}

	.c-shared-canvas__viewport:focus-visible {
		box-shadow: inset 0 0 0 2px var(--color-primary-500);
	}

	.c-shared-canvas__world {
		position: absolute;
		left: 0;
		top: 0;
		width: 0;
		height: 0;
		transform-origin: 0 0;
	}

	.c-shared-canvas__item {
		position: absolute;
		box-sizing: border-box;
		pointer-events: none;
		overflow: visible;
	}

	.c-shared-canvas__item--icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.c-shared-canvas__item--sticky {
		padding: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 6px rgb(0 0 0 / 0.15);
	}

	.c-shared-canvas__item--frame {
		border: 1px solid color-mix(in srgb, var(--color-text-primary) 20%, transparent);
	}

	.c-shared-canvas__item--shape {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 12px;
	}

	.c-shared-canvas__shape {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	.c-shared-canvas__stroke {
		overflow: visible;
	}

	.c-shared-canvas__frame-title {
		position: absolute;
		left: 0;
		bottom: 100%;
		padding-bottom: calc(4px / var(--zoom));
		font-size: calc(13px / var(--zoom));
		line-height: 1.2;
		white-space: nowrap;
		color: var(--color-text-secondary);
	}

	.c-shared-canvas__text {
		position: relative;
		width: 100%;
		line-height: 1.3;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		color: inherit;
	}

	.c-shared-canvas__editor {
		position: absolute;
		box-sizing: border-box;
		margin: 0;
		padding: 0;
		border: none;
		outline: calc(1.5px / var(--zoom)) solid var(--color-primary-500);
		background: transparent;
		line-height: 1.3;
		resize: none;
		overflow: hidden;
		color: inherit;
		user-select: text;
	}

	.c-shared-canvas__editor--sticky {
		padding: 16px;
		padding-top: 0;
		padding-bottom: 0;
		align-content: center;
	}

	.c-shared-canvas__editor--shape {
		padding: 12px;
		align-content: center;
	}

	.c-shared-canvas__editor--frame {
		transform: translateY(-100%);
		height: calc(20px / var(--zoom));
		font-size: calc(13px / var(--zoom));
		background: var(--color-background-primary, #fff);
	}

	.c-shared-canvas__selection {
		position: absolute;
		box-sizing: border-box;
		pointer-events: none;
		outline: calc(1.5px / var(--zoom)) solid var(--color-primary-500, #3b82f6);
		outline-offset: calc(2px / var(--zoom));
	}

	.c-shared-canvas__handle {
		position: absolute;
		width: calc(10px / var(--zoom));
		height: calc(10px / var(--zoom));
		transform: translate(-50%, -50%);
		box-sizing: border-box;
		border: calc(1.5px / var(--zoom)) solid var(--color-primary-500, #3b82f6);
		border-radius: 2px;
		background: #fff;
	}

	.c-shared-canvas__marquee {
		position: absolute;
		pointer-events: none;
		border: calc(1px / var(--zoom)) solid var(--color-primary-500, #3b82f6);
		background: color-mix(in srgb, var(--color-primary-500, #3b82f6) 10%, transparent);
	}

	.c-shared-canvas__cursor {
		position: absolute;
		display: flex;
		align-items: flex-start;
		gap: 2px;
		pointer-events: none;
		transform: scale(calc(1 / var(--zoom)));
		transform-origin: 0 0;
		transition:
			left 80ms linear,
			top 80ms linear;
	}

	.c-shared-canvas__cursor path {
		fill: var(--cursor-color);
		stroke: #fff;
		stroke-width: 1;
	}

	.c-shared-canvas__cursor span {
		margin-top: 12px;
		padding: 1px 6px;
		border-radius: 4px;
		font-size: 12px;
		white-space: nowrap;
		color: #fff;
		background: var(--cursor-color);
	}

	.c-shared-canvas__toolbar {
		color: var(--color-text-primary);
		position: absolute;
		left: 12px;
		top: 12px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 4px;
		border-radius: 10px;
		background: var(--color-background-primary, #fff);
		box-shadow:
			0 1px 3px rgb(0 0 0 / 0.12),
			0 4px 12px rgb(0 0 0 / 0.06);
		max-height: calc(100% - 96px);
		overflow-y: auto;
	}

	.c-shared-canvas__toolbar--history {
		top: auto;
		bottom: 12px;
	}

	.c-shared-canvas__tool {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		padding: 0;
		border: none;
		border-radius: 8px;
		background: transparent;
		color: inherit;
		cursor: pointer;
	}

	.c-shared-canvas__tool:hover:not(:disabled) {
		background: var(--color-background-secondary, #f3f4f6);
	}

	.c-shared-canvas__tool.is-active {
		background: color-mix(in srgb, var(--color-primary-500, #3b82f6) 14%, transparent);
		color: var(--color-primary-600, #2563eb);
		box-shadow: inset 0 0 0 1.5px var(--color-primary-500, #3b82f6);
	}

	.c-shared-canvas__tool:disabled {
		opacity: 0.35;
		cursor: default;
	}

	.c-shared-canvas__flyout {
		color: var(--color-text-primary);
		position: absolute;
		left: 64px;
		top: 12px;
		display: grid;
		grid-template-columns: repeat(4, 36px);
		gap: 2px;
		padding: 6px;
		border-radius: 10px;
		background: var(--color-background-primary, #fff);
		box-shadow: 0 4px 16px rgb(0 0 0 / 0.14);
	}

	.c-shared-canvas__flyout--icons {
		grid-template-columns: repeat(6, 36px);
	}

	.c-shared-canvas__panel {
		color: var(--color-text-primary);
		position: absolute;
		top: 12px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 6px;
		max-width: calc(100% - 200px);
		padding: 6px 8px;
		border-radius: 10px;
		background: var(--color-background-primary, #fff);
		box-shadow:
			0 1px 3px rgb(0 0 0 / 0.12),
			0 4px 12px rgb(0 0 0 / 0.06);
	}

	.c-shared-canvas__group {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 3px;
	}

	.c-shared-canvas__divider {
		align-self: stretch;
		width: 1px;
		background: var(--color-border-primary);
	}

	.c-shared-canvas__swatch {
		width: 20px;
		height: 20px;
		padding: 0;
		border: 1px solid color-mix(in srgb, var(--color-text-primary) 20%, transparent);
		border-radius: 50%;
		cursor: pointer;
	}

	.c-shared-canvas__swatch--fill {
		border-radius: 5px;
	}

	.c-shared-canvas__swatch.is-empty {
		background: linear-gradient(
			135deg,
			transparent 45%,
			var(--color-error-500, #ef4444) 45% 55%,
			transparent 55%
		);
	}

	.c-shared-canvas__swatch.is-active {
		box-shadow:
			0 0 0 2px var(--color-background-primary, #fff),
			0 0 0 4px var(--color-primary-500, #3b82f6);
	}

	.c-shared-canvas__color-input {
		width: 24px;
		height: 24px;
		padding: 0;
		border: none;
		background: none;
		cursor: pointer;
	}

	.c-shared-canvas__chip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 28px;
		height: 28px;
		padding: 0 4px;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: inherit;
		cursor: pointer;
	}

	.c-shared-canvas__chip:hover {
		background: var(--color-background-secondary, #f3f4f6);
	}

	.c-shared-canvas__chip.is-active {
		background: color-mix(in srgb, var(--color-primary-500, #3b82f6) 14%, transparent);
		color: var(--color-primary-600, #2563eb);
	}

	.c-shared-canvas__stroke-sample {
		display: block;
		width: 18px;
		border-radius: 4px;
		background: currentColor;
	}

	.c-shared-canvas__select {
		height: 28px;
		padding: 0 4px;
		border: 1px solid var(--color-border-primary);
		border-radius: 6px;
		background: var(--color-background-primary, #fff);
		color: inherit;
		font-size: 13px;
	}

	.c-shared-canvas__corner {
		color: var(--color-text-primary);
		position: absolute;
		top: 12px;
		right: 12px;
		display: flex;
		align-items: center;
		gap: 2px;
		padding: 4px;
		border-radius: 10px;
		background: var(--color-background-primary, #fff);
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.12);
	}

	.c-shared-canvas__users {
		display: flex;
		padding-right: 6px;
	}

	.c-shared-canvas__avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		margin-left: -6px;
		overflow: hidden;
		border: 2px solid var(--color-background-primary, #fff);
		border-radius: 50%;
		font-size: 12px;
		font-weight: 600;
		color: #fff;
	}

	.c-shared-canvas__avatar:first-child {
		margin-left: 0;
	}

	.c-shared-canvas__avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.c-shared-canvas__zoom {
		color: var(--color-text-primary);
		position: absolute;
		right: 12px;
		bottom: 12px;
		display: flex;
		align-items: center;
		gap: 2px;
		padding: 4px;
		border-radius: 10px;
		background: var(--color-background-primary, #fff);
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.12);
	}

	.c-shared-canvas__zoom-value {
		min-width: 52px;
		height: 36px;
		border: none;
		border-radius: 8px;
		background: transparent;
		color: inherit;
		font-size: 13px;
		font-variant-numeric: tabular-nums;
		cursor: pointer;
	}

	.c-shared-canvas__zoom-value:hover {
		background: var(--color-background-secondary, #f3f4f6);
	}
</style>
