<script lang="ts">
	type Props = {
		color: readonly [number, number, number];
		label: string;
		size?: number;
	};

	let { color, label, size = 8 }: Props = $props();

	const hex = (v: number) =>
		Math.round(v * 255)
			.toString(16)
			.padStart(2, '0');
	const cssColor = $derived(`#${hex(color[0])}${hex(color[1])}${hex(color[2])}`);
</script>

<span class="graph-dot">
	<span
		class="graph-dot__circle"
		style="width:{size}px;height:{size}px;background:{cssColor};box-shadow:0 0 {size *
			1.5}px {cssColor}88"
	></span>
	<span class="graph-dot__label">{label}</span>
</span>

<style>
	.graph-dot {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}

	.graph-dot__circle {
		display: block;
		flex-shrink: 0;
		border-radius: 50%;
	}

	.graph-dot__label {
		font-size: 0.72rem;
		color: rgb(185 198 215);
		white-space: nowrap;
	}
</style>
