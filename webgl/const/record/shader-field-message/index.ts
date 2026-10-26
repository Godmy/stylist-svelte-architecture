/** Messages of ShaderField; the title prop overrides the section label. */
export const WEBGL_SHADER_FIELD_MESSAGE = {
	en: {
		title: 'Light field',
		stage: 'Light field shader',
		renderer: 'WebGL2 / GLSL',
		unsupported: 'WebGL is unavailable. A static background is shown.',
		panel: 'Field settings',
		speed: 'Field speed',
		color: 'Field color',
		resume: 'Resume field',
		pause: 'Pause field',
		resize: 'The canvas adapts to its container. With reduced motion the scene time stays still.',
		native: 'A real WebGL shader with no Three.js dependency.'
	},
	ru: {
		title: 'Световое поле',
		stage: 'Шейдер светового поля',
		renderer: 'WebGL2 / GLSL',
		unsupported: 'WebGL недоступен. Показан статичный фон.',
		panel: 'Параметры поля',
		speed: 'Скорость поля',
		color: 'Цвет поля',
		resume: 'Продолжить поле',
		pause: 'Остановить поле',
		resize:
			'Размер canvas адаптируется к контейнеру. При reduced motion время сцены остаётся неподвижным.',
		native: 'Это настоящий WebGL-шейдер без зависимости от Three.js.'
	}
} as const;
