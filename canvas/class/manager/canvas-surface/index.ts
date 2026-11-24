import type { Point2D } from '$stylist/canvas/interface/slot/point-2d';

/**
 * Backing store and pointer geometry of a 2D canvas. Components draw in
 * logical pixels (`width` x `height`); the store is scaled by the device
 * pixel ratio, and pointer positions are mapped back through the CSS size.
 */
export class CanvasSurfaceManager {
	static getPixelRatio(): number {
		return typeof window !== 'undefined' && window.devicePixelRatio > 0
			? window.devicePixelRatio
			: 1;
	}

	/**
	 * Sizes the backing store for crisp output and returns a context whose
	 * unit is one logical pixel. Returns `null` when 2D is unavailable.
	 */
	static prepare(
		canvas: HTMLCanvasElement,
		width: number,
		height: number,
		pixelRatio: number = CanvasSurfaceManager.getPixelRatio()
	): CanvasRenderingContext2D | null {
		const storeWidth = Math.max(1, Math.round(width * pixelRatio));
		const storeHeight = Math.max(1, Math.round(height * pixelRatio));

		if (canvas.width !== storeWidth) canvas.width = storeWidth;
		if (canvas.height !== storeHeight) canvas.height = storeHeight;

		const context = canvas.getContext('2d');
		context?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
		return context;
	}

	/** Clears the whole backing store regardless of the current transform. */
	static clear(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
		context.save();
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.restore();
	}

	/**
	 * Pointer position in logical pixels; accounts for the canvas being
	 * stretched or shrunk by CSS.
	 */
	static getPointerPosition(
		event: Pick<MouseEvent, 'clientX' | 'clientY'>,
		canvas: HTMLCanvasElement,
		width: number,
		height: number
	): Point2D {
		const rect = canvas.getBoundingClientRect();
		const scaleX = rect.width > 0 ? width / rect.width : 1;
		const scaleY = rect.height > 0 ? height / rect.height : 1;

		return {
			x: (event.clientX - rect.left) * scaleX,
			y: (event.clientY - rect.top) * scaleY
		};
	}

	/** Downloads the canvas as a PNG file. */
	static download(canvas: HTMLCanvasElement | null | undefined, filename: string): void {
		if (!canvas || typeof document === 'undefined') return;

		const link = document.createElement('a');
		link.download = filename;
		link.href = canvas.toDataURL('image/png');
		link.click();
	}
}
