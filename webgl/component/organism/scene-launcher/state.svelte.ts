import { WEBGL_SCENE_LAUNCHER_MESSAGE } from '$stylist/webgl/const/record/scene-launcher-message';
import { useMessage } from '$stylist/localization/function/hook/use-message';

/** Reactive behavior of scene-launcher; props are read lazily when needed. */
export function createSceneLauncherComponentState() {
	type ActiveScene = 'circle' | 'hyperspace' | null;

	const t = useMessage('scene-launcher', WEBGL_SCENE_LAUNCHER_MESSAGE);
	let container: HTMLDivElement;
	let activeScene = $state<ActiveScene>(null);
	function handleFullscreenChange() {
		if (document.fullscreenElement !== container) {
			activeScene = null;
		}
	}
	function open(scene: ActiveScene) {
		activeScene = scene;
		container.requestFullscreen();
	}
	$effect(() => {
		document.addEventListener('fullscreenchange', handleFullscreenChange);
		return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
	});
	return {
		get t(): typeof t {
			return t;
		},
		get container(): typeof container {
			return container;
		},
		set container(__nextValue: typeof container) {
			container = __nextValue;
		},
		get activeScene(): typeof activeScene {
			return activeScene;
		},
		set activeScene(__nextValue: typeof activeScene) {
			activeScene = __nextValue;
		},
		get open(): typeof open {
			return open;
		}
	};
}
export default createSceneLauncherComponentState;
