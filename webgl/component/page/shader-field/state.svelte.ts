import { WEBGL_SHADER_FIELD_MESSAGE } from '$stylist/webgl/const/record/shader-field-message';
import { useMessage } from '$stylist/localization/function/hook/use-message';

/** Reactive behavior of shader-field; props are read lazily when needed. */
export function createShaderFieldComponentState() {
	const t = useMessage('shader-field', WEBGL_SHADER_FIELD_MESSAGE);
	let speed = $state(1);
	let color = $state('#80b7eb');
	let supported = $state(true);
	return {
		get t(): typeof t {
			return t;
		},
		get speed(): typeof speed {
			return speed;
		},
		set speed(__nextValue: typeof speed) {
			speed = __nextValue;
		},
		get color(): typeof color {
			return color;
		},
		set color(__nextValue: typeof color) {
			color = __nextValue;
		},
		get supported(): typeof supported {
			return supported;
		},
		set supported(__nextValue: typeof supported) {
			supported = __nextValue;
		}
	};
}
export default createShaderFieldComponentState;
