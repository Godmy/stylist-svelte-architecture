<script lang="ts">
	import { ZWICKY_CLUSTER_ORDER } from '$stylist/graph/const/array/zwicky-cluster-order';
	import { ZWICKY_CLUSTER_COLOR } from '$stylist/graph/const/record/zwicky-cluster-color';

	type Props = {
		activeClusters?: ReadonlySet<string>;
		onClusterClick?: (cluster: string) => void;
	};

	let { activeClusters, onClusterClick }: Props = $props();

	const hex = (v: number) =>
		Math.round(v * 255)
			.toString(16)
			.padStart(2, '0');
	function toHex(c: readonly [number, number, number]) {
		return `#${hex(c[0])}${hex(c[1])}${hex(c[2])}`;
	}
</script>

<nav class="graph-cluster-filter" aria-label="Cluster filter">
	<p class="graph-cluster-filter__label">Assembly layer</p>
	<ul class="graph-cluster-filter__list">
		{#each ZWICKY_CLUSTER_ORDER as cluster (cluster)}
			{@const color = ZWICKY_CLUSTER_COLOR[cluster] ?? [0.5, 0.5, 0.5]}
			{@const cssColor = toHex(color)}
			{@const active = activeClusters?.has(cluster) ?? false}
			<li>
				<button
					class="graph-cluster-filter__pill"
					class:graph-cluster-filter__pill--active={active}
					style="--c:{cssColor}"
					onclick={() => onClusterClick?.(cluster)}
					title="Toggle {cluster} layer"
				>
					<span class="graph-cluster-filter__dot"></span>
					{cluster}
				</button>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.graph-cluster-filter {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.graph-cluster-filter__label {
		margin: 0;
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: rgb(126 148 172);
	}

	.graph-cluster-filter__list {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.22rem;
	}

	.graph-cluster-filter__pill {
		all: unset;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.28rem 0.65rem 0.28rem 0.45rem;
		border-radius: 999px;
		border: 1px solid rgb(255 255 255 / 8%);
		background: rgb(255 255 255 / 4%);
		color: rgb(175 195 220);
		font-size: 0.75rem;
		font-weight: 500;
		transition:
			background 0.12s,
			border-color 0.12s,
			color 0.12s,
			box-shadow 0.12s;
		width: 100%;
		box-sizing: border-box;
	}

	.graph-cluster-filter__pill:hover {
		background: rgb(255 255 255 / 9%);
		border-color: color-mix(in srgb, var(--c) 40%, transparent);
		color: rgb(220 235 250);
	}

	.graph-cluster-filter__pill--active {
		background: color-mix(in srgb, var(--c) 18%, transparent);
		border-color: color-mix(in srgb, var(--c) 55%, transparent);
		color: rgb(235 245 255);
		box-shadow: 0 0 10px color-mix(in srgb, var(--c) 22%, transparent);
	}

	.graph-cluster-filter__dot {
		display: block;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--c);
		box-shadow: 0 0 6px color-mix(in srgb, var(--c) 70%, transparent);
		flex-shrink: 0;
	}
</style>
