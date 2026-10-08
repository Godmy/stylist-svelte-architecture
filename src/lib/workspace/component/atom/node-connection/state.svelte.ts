import type { RecipeNodeConnection } from '$stylist/workspace/interface/recipe/node-connection';
import type { ObjectPoint2DPath } from '$stylist/canvas/interface/slot/point-2d-path';
import type { TokenTrajectory } from '$stylist/workspace/type/alias/trajectory';
import type { TokenBorderStyle as LineStyleToken } from '$stylist/layout/type/alias/border-style';

function computeResult(
	path: string,
	start: { x: number; y: number },
	end: { x: number; y: number }
): ObjectPoint2DPath {
	const dx = end.x - start.x;
	const dy = end.y - start.y;
	const length = Math.sqrt(dx * dx + dy * dy);
	const midPoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
	const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
	return { path, length, midPoint, angle };
}

function calculateBezierPath(
	start: { x: number; y: number },
	end: { x: number; y: number }
): ObjectPoint2DPath {
	const dx = Math.abs(end.x - start.x) * 0.5;
	const path = `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;
	return computeResult(path, start, end);
}

function calculateStraightPath(
	start: { x: number; y: number },
	end: { x: number; y: number }
): ObjectPoint2DPath {
	return computeResult(`M ${start.x} ${start.y} L ${end.x} ${end.y}`, start, end);
}

function calculateStepPath(
	start: { x: number; y: number },
	end: { x: number; y: number }
): ObjectPoint2DPath {
	const midX = start.x + (end.x - start.x) / 2;
	const path = `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
	const length = Math.abs(midX - start.x) + Math.abs(end.y - start.y) + Math.abs(end.x - midX);
	const midPoint = { x: midX, y: (start.y + end.y) / 2 };
	const angle = (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI;
	return { path, length, midPoint, angle };
}

function calculateArcPath(
	start: { x: number; y: number },
	end: { x: number; y: number }
): ObjectPoint2DPath {
	const dx = end.x - start.x;
	const dy = end.y - start.y;
	const dr = Math.sqrt(dx * dx + dy * dy);
	const path = `M ${start.x} ${start.y} A ${dr} ${dr} 0 0 1 ${end.x} ${end.y}`;
	return computeResult(path, start, end);
}

export function createNodeConnectionState(getProps: () => RecipeNodeConnection) {
	const props = $derived(getProps());
	const type = $derived((props.type ?? 'bezier') as TokenTrajectory);
	const lineStyle = $derived((props.lineStyle ?? 'solid') as LineStyleToken);
	const strokeWidth = $derived(props.strokeWidth ?? 2);
	const color = $derived(props.color ?? '#64748b');
	const activeColor = $derived(props.activeColor ?? '#3b82f6');
	const hoverColor = $derived(props.hoverColor ?? '#60a5fa');
	const active = $derived(Boolean(props.active));
	const animated = $derived(props.animated ?? false);
	const showArrow = $derived(props.showArrow ?? true);
	const arrowSize = $derived(props.arrowSize ?? 8);
	const hasLabel = $derived(Boolean(props.label));
	const labelPosition = $derived(props.labelPosition ?? 'middle');

	const pathData = $derived.by((): ObjectPoint2DPath => {
		const start = { x: props.startX, y: props.startY };
		const end = { x: props.endX, y: props.endY };
		switch (type) {
			case 'bezier':
				return calculateBezierPath(start, end);
			case 'straight':
				return calculateStraightPath(start, end);
			case 'step':
				return calculateStepPath(start, end);
			case 'arc':
				return calculateArcPath(start, end);
			default:
				return calculateBezierPath(start, end);
		}
	});

	const classes = $derived.by(() => {
		const parts = ['node-connection'];
		if (type) parts.push(`node-connection--${type}`);
		if (lineStyle && lineStyle !== 'solid') parts.push(`node-connection--${lineStyle}`);
		if (active) parts.push('node-connection--active');
		if (animated) parts.push('node-connection--animated');
		return parts.join(' ');
	});

	const styles = $derived.by(() => ({
		stroke: active && activeColor ? activeColor : color,
		'stroke-width': `${strokeWidth}px`,
		fill: 'none',
		'--connection-active-color': activeColor ?? color,
		'--connection-stroke-width': `${strokeWidth}px`
	}));

	return {
		get type() {
			return type;
		},
		get lineStyle() {
			return lineStyle;
		},
		get strokeWidth() {
			return strokeWidth;
		},
		get color() {
			return color;
		},
		get activeColor() {
			return activeColor;
		},
		get hoverColor() {
			return hoverColor;
		},
		get active() {
			return active;
		},
		get animated() {
			return animated;
		},
		get showArrow() {
			return showArrow;
		},
		get arrowSize() {
			return arrowSize;
		},
		get hasLabel() {
			return hasLabel;
		},
		get labelPosition() {
			return labelPosition;
		},
		get pathData() {
			return pathData;
		},
		get classes() {
			return classes;
		},
		get styles() {
			return styles;
		}
	};
}

export default createNodeConnectionState;
