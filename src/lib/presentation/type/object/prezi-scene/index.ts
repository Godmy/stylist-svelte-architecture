import type { HTMLAttributes } from 'svelte/elements';
import type { SceneNode } from '$stylist/presentation/interface/slot/scene-node';
import type { LayoutHTMLAttributes } from '$stylist/layout/interface/behavior/layout-html-attributes';

/**
 * Контракт для PreziScene компонента
 * Интегрирует viewport, camera, semantic zoom и навигацию
 */
export type PreziSceneContract = LayoutHTMLAttributes<HTMLDivElement> & {
	/** Узлы сцены (онтология) */
	nodes?: readonly SceneNode[];

	/** Начальная позиция камеры */
	initialCamera?: {
		x: number;
		y: number;
		zoom: number;
	};

	/** Начальная глубина (для semantic zoom) */
	initialDepth?: number;

	/** Показать сетку */
	showGrid?: boolean;

	/** Показать minimap */
	showMinimap?: boolean;

	/** Показать inspector (панель свойств выбранного узла) */
	showInspector?: boolean;

	/** Показать заголовок сцены */
	showHeader?: boolean;

	/** Заголовок сцены */
	title?: string;

	/** Подзаголовок сцены */
	subtitle?: string;

	/** Режим панорамирования */
	panMode?: 'drag' | 'space' | 'always';

	/** Включить зум */
	zoomEnabled?: boolean;

	/** Включить панорамирование */
	panEnabled?: boolean;

	/** Минимальный зум */
	minZoom?: number;

	/** Максимальный зум */
	maxZoom?: number;

	/** Длительность transition-анимации камеры */
	animationDurationMs?: number;

	/** Выбранный узел (controlled) */
	selectedNodeId?: string | null;

	/** Callback при выборе узла */
	onNodeSelect?: (node: SceneNode | null) => void;

	/** Callback при изменении камеры */
	onCameraChange?: (camera: { x: number; y: number; zoom: number }) => void;

	/** Callback при изменении глубины */
	onDepthChange?: (depth: number) => void;

	/** Дополнительные CSS классы */
	class?: string;
};
