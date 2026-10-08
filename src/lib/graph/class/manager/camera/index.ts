import { Matrix4 } from '$stylist/graph/class/manager/matrix4';

/**
 * Камера для WebGL сцены
 * Управляет view и projection матрицами
 */
export class Camera {
	private position: [number, number, number];
	private target: [number, number, number];
	private up: [number, number, number];
	private fov: number;
	private aspect: number;
	private near: number;
	private far: number;

	constructor(
		position: [number, number, number] = [0, 5, 10],
		target: [number, number, number] = [0, 0, 0],
		up: [number, number, number] = [0, 1, 0],
		fov: number = Math.PI / 4,
		near: number = 0.1,
		far: number = 1000
	) {
		this.position = position;
		this.target = target;
		this.up = up;
		this.fov = fov;
		this.aspect = 1;
		this.near = near;
		this.far = far;
	}

	/**
	 * Получить view матрицу
	 */
	getViewMatrix(): Matrix4 {
		return Matrix4.lookAt(this.position, this.target, this.up);
	}

	/**
	 * Получить projection матрицу
	 */
	getProjectionMatrix(): Matrix4 {
		return Matrix4.perspective(this.fov, this.aspect, this.near, this.far);
	}

	/**
	 * Установить aspect ratio
	 */
	setAspect(aspect: number): void {
		this.aspect = aspect;
	}

	/**
	 * Переместить камеру
	 */
	setPosition(position: [number, number, number]): void {
		this.position = position;
	}

	/**
	 * Получить позицию камеры
	 */
	getPosition(): [number, number, number] {
		return this.position;
	}

	getTarget(): [number, number, number] {
		return this.target;
	}

	setTarget(target: [number, number, number]): void {
		this.target = target;
	}

	getFov(): number {
		return this.fov;
	}

	/**
	 * Вращать камеру вокруг цели (сферические координаты)
	 */
	rotateAroundTarget(horizontalAngle: number, verticalAngle: number, radius: number): void {
		const x = radius * Math.sin(horizontalAngle) * Math.cos(verticalAngle);
		const y = radius * Math.sin(verticalAngle);
		const z = radius * Math.cos(horizontalAngle) * Math.cos(verticalAngle);

		this.position = [this.target[0] + x, this.target[1] + y, this.target[2] + z];
	}

	/**
	 * Zoom (приблизить/отдалить)
	 */
	zoom(delta: number, minRadius: number = 2, maxRadius: number = 50): void {
		const dx = this.position[0] - this.target[0];
		const dy = this.position[1] - this.target[1];
		const dz = this.position[2] - this.target[2];

		const currentRadius = Math.sqrt(dx * dx + dy * dy + dz * dz);
		let newRadius = currentRadius + delta;
		newRadius = Math.max(minRadius, Math.min(maxRadius, newRadius));

		const scale = newRadius / currentRadius;
		this.position = [
			this.target[0] + dx * scale,
			this.target[1] + dy * scale,
			this.target[2] + dz * scale
		];
	}
}
