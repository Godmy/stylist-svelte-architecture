import { ClassNamesManager } from '$stylist/layout/class/manager/class-names';
import type { RecipeSceneCameraControl } from '$stylist/graph/interface/recipe/scene-camera-control';

export function createSceneCameraControlState(getProps: () => RecipeSceneCameraControl) {
	const props = $derived(getProps());
	const targetRange = 10;
	const containerClass = $derived(
		ClassNamesManager.merge(
			'scene-camera-control',
			typeof props.class === 'string' ? props.class : undefined
		)
	);
	const zoomProgress = $derived(
		((props.maxRadius - props.radius) / (props.maxRadius - props.minRadius)) * 100
	);
	const targetLeft = $derived(((props.targetX + targetRange) / (targetRange * 2)) * 100);
	const targetTop = $derived(((targetRange - props.targetY) / (targetRange * 2)) * 100);
	const roundedTargetX = $derived(Math.round(props.targetX));
	const roundedTargetY = $derived(Math.round(props.targetY));
	const radiusText = $derived(props.radius.toFixed(1));
	const sceneFitRadiusText = $derived(props.sceneFitRadius.toFixed(1));
	const restProps = $derived.by(() => {
		const {
			class: _class,
			radius: _radius,
			minRadius: _minRadius,
			maxRadius: _maxRadius,
			sceneFitRadius: _sceneFitRadius,
			targetX: _targetX,
			targetY: _targetY,
			onradiuschange: _onradiuschange,
			ontargetchange: _ontargetchange,
			...rest
		} = props;
		return rest;
	});

	function clamp(value: number, min: number, max: number): number {
		return Math.max(min, Math.min(max, value));
	}

	function updateRadius(event: Event): void {
		const input = event.currentTarget as HTMLInputElement;
		props.onradiuschange?.(Number(input.value));
	}

	function updateTarget(event: PointerEvent): void {
		const pad = event.currentTarget as HTMLElement;
		const rect = pad.getBoundingClientRect();
		const ratioX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
		const ratioY = clamp((event.clientY - rect.top) / rect.height, 0, 1);

		props.ontargetchange?.((ratioX * 2 - 1) * targetRange, (1 - ratioY * 2) * targetRange);
	}

	function startTargetDrag(event: PointerEvent): void {
		event.preventDefault();
		event.stopPropagation();
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		updateTarget(event);
	}

	function dragTarget(event: PointerEvent): void {
		if (!(event.currentTarget as HTMLElement).hasPointerCapture(event.pointerId)) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		updateTarget(event);
	}

	function stopTargetDrag(event: PointerEvent): void {
		event.stopPropagation();

		if ((event.currentTarget as HTMLElement).hasPointerCapture(event.pointerId)) {
			(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
		}
	}

	function stopPointerPropagation(event: PointerEvent): void {
		event.stopPropagation();
	}

	function stopWheelPropagation(event: WheelEvent): void {
		event.stopPropagation();
	}

	return {
		get containerClass() {
			return containerClass;
		},
		get zoomProgress() {
			return zoomProgress;
		},
		get targetLeft() {
			return targetLeft;
		},
		get targetTop() {
			return targetTop;
		},
		get roundedTargetX() {
			return roundedTargetX;
		},
		get roundedTargetY() {
			return roundedTargetY;
		},
		get radiusText() {
			return radiusText;
		},
		get sceneFitRadiusText() {
			return sceneFitRadiusText;
		},
		get restProps() {
			return restProps;
		},
		updateRadius,
		startTargetDrag,
		dragTarget,
		stopTargetDrag,
		stopPointerPropagation,
		stopWheelPropagation
	};
}

export default createSceneCameraControlState;
