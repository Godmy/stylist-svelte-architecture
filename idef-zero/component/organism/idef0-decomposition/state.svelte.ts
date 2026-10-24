import type {
	Idef0Activity,
	RecipeIdef0Decomposition
} from '$stylist/idef-zero/interface/recipe/idef0-decomposition';

type Point = [number, number];
type Side = 'left' | 'top' | 'right' | 'bottom';

export interface Idef0LaidLabel {
	lines: string[];
	x: number;
	y: number;
	anchor: 'start' | 'middle' | 'end';
}

export interface Idef0LaidArrow {
	key: string;
	color?: string;
	internal: boolean;
	points: Point[];
	head: string;
	label: Idef0LaidLabel;
}

export interface Idef0LaidBox {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	title: string[];
}

const LINE = 13;
const LABEL_GAP = 8;
const LANE = 16;
const MARGIN = 12;

/** Greedy word wrap to `max` characters per line. */
export function wrapIdef0Text(text: string, max: number): string[] {
	const lines: string[] = [];
	let line = '';
	for (const word of text.split(/\s+/).filter(Boolean)) {
		if (line && (line + ' ' + word).length > max) {
			lines.push(line);
			line = word;
		} else line = line ? `${line} ${word}` : word;
	}
	if (line) lines.push(line);
	return lines.length ? lines : [''];
}

function head([x, y]: Point, side: Side): string {
	// The arrow ends on the box edge pointing into it (or out of the diagram on the right).
	if (side === 'left' || side === 'right') return `${x},${y} ${x - 9},${y - 5} ${x - 9},${y + 5}`;
	if (side === 'top') return `${x},${y} ${x - 5},${y - 9} ${x + 5},${y - 9}`;
	return `${x},${y} ${x - 5},${y + 9} ${x + 5},${y + 9}`;
}

const spread = (start: number, length: number, count: number, index: number) =>
	start + (length * (index + 1)) / (count + 1);

/**
 * Staircase layout of an IDEF0 node. Boxes step down and right, so a boundary arrow of a
 * box never crosses another box: inputs run in its own row (starting a label's width before it), controls and mechanisms in its
 * own column. An output feeding a later box leaves through a lane right of its producer;
 * higher ports take outer lanes, so the lanes of one box never cross each other. Control
 * and mechanism labels are stacked so each sits beyond the ends of its neighbours' lines.
 */
export function layoutIdef0Decomposition(props: RecipeIdef0Decomposition) {
	const W = props.boxWidth ?? 200;
	const H = props.boxHeight ?? 104;
	const GAP_X = 120;
	const labelChars = 26;
	const label = (id: string) => props.arrows.find((arrow) => arrow.id === id);
	const activities = props.activities;
	const index = new Map(activities.map((activity, i) => [activity.id, i]));
	const producer = new Map<string, number>();
	activities.forEach((activity, i) =>
		(activity.outputs ?? []).forEach((id) => producer.has(id) || producer.set(id, i))
	);
	const consumed = new Set<string>();
	activities.forEach((activity, i) =>
		[...(activity.inputs ?? []), ...(activity.controls ?? [])].forEach((id) => {
			if ((producer.get(id) ?? Infinity) < i) consumed.add(id);
		})
	);
	const internal = (id: string, i: number) => (producer.get(id) ?? Infinity) < i;
	// Internal controls first (leftmost): boundary control labels then extend away from them.
	const controlsOf = (a: Idef0Activity, i: number) => {
		const list = a.controls ?? [];
		return [...list.filter((id) => internal(id, i)), ...list.filter((id) => !internal(id, i))];
	};
	// Boundary outputs on top, outputs feeding later boxes below: their lanes start lower.
	const outputsOf = (a: Idef0Activity) => {
		const list = a.outputs ?? [];
		return [...list.filter((id) => !consumed.has(id)), ...list.filter((id) => consumed.has(id))];
	};

	const stack = (ids: string[]) => {
		// Band height of stacked one-arrow labels, processed right to left.
		let acc = LABEL_GAP + 2;
		const offsets: number[] = [];
		for (let k = ids.length - 1; k >= 0; k--) {
			offsets[k] = acc;
			acc += wrapIdef0Text(label(ids[k])?.label ?? ids[k], labelChars).length * LINE + LABEL_GAP;
		}
		return { offsets, band: ids.length ? acc : 0 };
	};
	const controlStacks = activities.map((a, i) =>
		stack(controlsOf(a, i).filter((id) => !internal(id, i)))
	);
	const mechanismStacks = activities.map((a) => stack(a.mechanisms ?? []));
	const hasLeft = activities.some((a, i) => (a.inputs ?? []).some((id) => !internal(id, i)));
	const hasRight = activities.some((a) => (a.outputs ?? []).some((id) => !consumed.has(id)));
	const left = hasLeft ? 220 : MARGIN * 2;
	const right = hasRight ? 220 : MARGIN * 2;
	const top = Math.max(controlStacks[0]?.band ?? 0, 0) + MARGIN * 2;
	let rowGap = 56;
	for (let i = 0; i + 1 < activities.length; i++)
		rowGap = Math.max(rowGap, mechanismStacks[i].band + 12, controlStacks[i + 1].band + 12);

	const boxes: Idef0LaidBox[] = activities.map((a, i) => ({
		id: a.id,
		x: left + i * (W + GAP_X),
		y: top + i * (H + rowGap),
		width: W,
		height: H,
		title: wrapIdef0Text(a.title, Math.floor(W / 8))
	}));
	const last = boxes[boxes.length - 1];
	const width = (last ? last.x + W : left) + right;
	const height =
		(last ? last.y + H : top) + (mechanismStacks[boxes.length - 1]?.band ?? 0) + MARGIN * 2;

	// Port positions on every side of every box.
	const port = new Map<string, Point>();
	const key = (i: number, side: Side, id: string) => `${i}:${side}:${id}`;
	activities.forEach((a, i) => {
		const b = boxes[i];
		(a.inputs ?? []).forEach((id, k, all) =>
			port.set(key(i, 'left', id), [b.x, spread(b.y, H, all.length, k)])
		);
		controlsOf(a, i).forEach((id, k, all) =>
			port.set(key(i, 'top', id), [spread(b.x, W, all.length, k), b.y])
		);
		outputsOf(a).forEach((id, k, all) =>
			port.set(key(i, 'right', id), [b.x + W, spread(b.y, H, all.length, k)])
		);
		(a.mechanisms ?? []).forEach((id, k, all) =>
			port.set(key(i, 'bottom', id), [spread(b.x, W, all.length, k), b.y + H])
		);
	});

	// Lanes: per producer, outputs that feed later inputs, higher port → outer lane.
	const lane = new Map<string, number>();
	activities.forEach((a, i) => {
		const fed = outputsOf(a).filter((id) =>
			activities.some((t, j) => j > i && (t.inputs ?? []).includes(id))
		);
		fed.forEach((id, order) => lane.set(id, boxes[i].x + W + 18 + LANE * (fed.length - 1 - order)));
	});

	const arrows: Idef0LaidArrow[] = [];
	const text = (id: string) => wrapIdef0Text(label(id)?.label ?? id, labelChars);
	activities.forEach((a, i) => {
		const b = boxes[i];
		// A boundary input starts a label's width before its box, not at the far left edge.
		const from0 = Math.max(MARGIN, b.x - (left - MARGIN));
		for (const id of a.inputs ?? []) {
			const end = port.get(key(i, 'left', id))!;
			const from = producer.get(id);
			if (from !== undefined && from < i) {
				const start = port.get(key(from, 'right', id))!;
				const x = lane.get(id)!;
				arrows.push({
					key: `${id}>${a.id}`,
					color: label(id)?.color,
					internal: true,
					points: [start, [x, start[1]], [x, end[1]], end],
					head: head(end, 'left'),
					label: { lines: [label(id)?.label ?? id], x: end[0] - 12, y: end[1] - 6, anchor: 'end' }
				});
			} else {
				arrows.push({
					key: `${id}>${a.id}`,
					color: label(id)?.color,
					internal: false,
					points: [[from0, end[1]], end],
					head: head(end, 'left'),
					label: { lines: [label(id)?.label ?? id], x: from0 + 4, y: end[1] - 6, anchor: 'start' }
				});
			}
		}
		const boundaryControls = controlsOf(a, i).filter((id) => !internal(id, i));
		for (const id of controlsOf(a, i)) {
			const end = port.get(key(i, 'top', id))!;
			const from = producer.get(id);
			if (from !== undefined && from < i) {
				const start = port.get(key(from, 'right', id))!;
				arrows.push({
					key: `${id}>${a.id}`,
					color: label(id)?.color,
					internal: true,
					points: [start, [end[0], start[1]], end],
					head: head(end, 'top'),
					label: { lines: [label(id)?.label ?? id], x: end[0] - 8, y: start[1] - 6, anchor: 'end' }
				});
			} else {
				const offset = controlStacks[i].offsets[boundaryControls.indexOf(id)];
				const lines = text(id);
				arrows.push({
					key: `${id}>${a.id}`,
					color: label(id)?.color,
					internal: false,
					points: [[end[0], b.y - offset + 4], end],
					head: head(end, 'top'),
					label: { lines, x: end[0] + 5, y: b.y - offset - (lines.length - 1) * LINE - 2, anchor: 'start' }
				});
			}
		}
		for (const id of outputsOf(a)) {
			if (consumed.has(id)) continue;
			const start = port.get(key(i, 'right', id))!;
			const end: Point = [width - MARGIN, start[1]];
			arrows.push({
				key: `${a.id}>${id}`,
				color: label(id)?.color,
				internal: false,
				points: [start, end],
				head: head(end, 'right'),
				label: { lines: [label(id)?.label ?? id], x: width - MARGIN - 4, y: start[1] - 6, anchor: 'end' }
			});
		}
		(a.mechanisms ?? []).forEach((id, k) => {
			const end = port.get(key(i, 'bottom', id))!;
			const offset = mechanismStacks[i].offsets[k];
			arrows.push({
				key: `${id}>${a.id}`,
				color: label(id)?.color,
				internal: false,
				points: [[end[0], b.y + H + offset], end],
				head: head(end, 'bottom'),
				label: { lines: text(id), x: end[0] + 5, y: b.y + H + offset + LINE - 2, anchor: 'start' }
			});
		});
	});

	return { boxes, arrows, width, height, index };
}

export function createIdef0DecompositionState(getProps: () => RecipeIdef0Decomposition) {
	const props = $derived(getProps());
	const layout = $derived(layoutIdef0Decomposition(props));
	const containerClasses = $derived(
		typeof props.class === 'string' ? `idef0-decomposition ${props.class}` : 'idef0-decomposition'
	);
	return {
		get layout() {
			return layout;
		},
		get containerClasses() {
			return containerClasses;
		}
	};
}

export default createIdef0DecompositionState;
