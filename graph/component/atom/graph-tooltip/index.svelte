<script lang="ts">
	import type { ZwickyNode } from '$stylist/graph/interface/slot/zwicky-node';

	type Props = {
		node: ZwickyNode | null;
		x: number;
		y: number;
		containerWidth?: number;
		containerHeight?: number;
	};

	let { node, x, y, containerWidth = 800, containerHeight = 600 }: Props = $props();

	const TOOLTIP_W = 280;
	const TOOLTIP_H = 200;

	// Keep tooltip inside container
	const left = $derived(x + TOOLTIP_W + 16 > containerWidth ? x - TOOLTIP_W - 12 : x + 16);
	const top = $derived(y + TOOLTIP_H + 8 > containerHeight ? y - TOOLTIP_H : y + 8);

	const maxDeps = 6;
	const shownDeps = $derived(node?.dependencyIds.slice(0, maxDeps) ?? []);
	const extraDeps = $derived((node?.dependencyIds.length ?? 0) - maxDeps);

	const hex = (v: number) =>
		Math.round(v * 255)
			.toString(16)
			.padStart(2, '0');
	const dotColor = $derived(
		node ? `#${hex(node.color[0])}${hex(node.color[1])}${hex(node.color[2])}` : '#888'
	);
</script>

{#if node}
	<div class="graph-tooltip" style="left:{left}px;top:{top}px" role="tooltip" aria-live="polite">
		<!-- Header -->
		<div class="graph-tooltip__header">
			<span class="graph-tooltip__dot" style="background:{dotColor};box-shadow:0 0 8px {dotColor}88"
			></span>
			<span class="graph-tooltip__family">{node.family || node.joint || node.domain}</span>
		</div>

		<!-- Path -->
		<code class="graph-tooltip__path">{node.path}</code>

		<!-- Chips -->
		<div class="graph-tooltip__chips">
			<span class="graph-tooltip__chip graph-tooltip__chip--domain">{node.domain}</span>
			{#if node.cluster}
				<span class="graph-tooltip__chip">{node.cluster}</span>
			{/if}
			{#if node.joint}
				<span class="graph-tooltip__chip">{node.joint}</span>
			{/if}
		</div>

		<!-- Deps -->
		{#if node.dependencyIds.length > 0}
			<div class="graph-tooltip__deps">
				<span class="graph-tooltip__deps-label">{node.dependencyIds.length} deps</span>
				<ul class="graph-tooltip__dep-list">
					{#each shownDeps as dep (dep)}
						<li class="graph-tooltip__dep-item">{dep}</li>
					{/each}
					{#if extraDeps > 0}
						<li class="graph-tooltip__dep-more">+{extraDeps} more</li>
					{/if}
				</ul>
			</div>
		{:else}
			<span class="graph-tooltip__no-deps">no dependencies</span>
		{/if}
	</div>
{/if}

<style>
	.graph-tooltip {
		position: absolute;
		z-index: 10;
		pointer-events: none;
		width: 280px;
		background: rgb(8 11 18 / 92%);
		border: 1px solid rgb(255 255 255 / 12%);
		border-radius: 0.6rem;
		padding: 0.8rem 0.9rem;
		box-shadow:
			0 0 0 1px rgb(255 255 255 / 4%),
			0 1.5rem 3rem rgb(0 0 0 / 55%);
		backdrop-filter: blur(16px);
		font-family:
			Inter,
			ui-sans-serif,
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 0.8rem;
		color: rgb(210 225 242);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		animation: tooltip-in 0.12s ease-out;
	}

	@keyframes tooltip-in {
		from {
			opacity: 0;
			transform: translateY(4px) scale(0.97);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.graph-tooltip__header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.graph-tooltip__dot {
		display: block;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.graph-tooltip__family {
		font-weight: 650;
		font-size: 0.88rem;
		color: rgb(240 250 255);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.graph-tooltip__path {
		display: block;
		font-family: 'Fira Code', 'Cascadia Code', ui-monospace, monospace;
		font-size: 0.65rem;
		color: rgb(120 210 185);
		word-break: break-all;
		line-height: 1.45;
		border-left: 2px solid rgb(120 210 185 / 30%);
		padding-left: 0.5rem;
	}

	.graph-tooltip__chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.graph-tooltip__chip {
		padding: 0.12rem 0.45rem;
		border-radius: 999px;
		background: rgb(255 255 255 / 8%);
		font-size: 0.65rem;
		color: rgb(175 195 220);
		border: 1px solid rgb(255 255 255 / 6%);
	}

	.graph-tooltip__chip--domain {
		border-color: rgb(100 200 255 / 20%);
		color: rgb(140 215 255);
	}

	.graph-tooltip__deps {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.graph-tooltip__deps-label {
		font-size: 0.66rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: rgb(140 160 185);
		font-weight: 600;
	}

	.graph-tooltip__dep-list {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.graph-tooltip__dep-item {
		font-family: 'Fira Code', ui-monospace, monospace;
		font-size: 0.62rem;
		color: rgb(160 180 205);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.graph-tooltip__dep-more {
		font-size: 0.62rem;
		color: rgb(110 130 160);
		font-style: italic;
	}

	.graph-tooltip__no-deps {
		font-size: 0.66rem;
		color: rgb(100 120 145);
		font-style: italic;
	}
</style>
