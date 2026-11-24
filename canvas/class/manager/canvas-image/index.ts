/**
 * Pictures on a board: picking image files from a drop, paste or file input,
 * reading them as `data:` URLs and sizing them to fit the board.
 */
export class CanvasImageManager {
	/** Longest side (world px) of a newly inserted picture. */
	static readonly maxSize = 400;

	/** How long to wait for a picture to report its natural size. */
	static readonly loadTimeout = 1500;

	/** Size used when the natural size is unknown (still loading, or not an image). */
	static readonly fallbackSize = { width: 320, height: 240 };

	/** Image files of a drop or paste. */
	static getImageFiles(data: { files: FileList | null } | null | undefined): File[] {
		return Array.from(data?.files ?? []).filter((file) => file.type.startsWith('image/'));
	}

	static readAsDataUrl(file: Blob): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(String(reader.result));
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(file);
		});
	}

	/** Natural size of the picture at `src`, or `null` when it does not load in time. */
	static getNaturalSize(src: string): Promise<{ width: number; height: number } | null> {
		if (typeof Image === 'undefined') return Promise.resolve(null);
		return new Promise((resolve) => {
			const image = new Image();
			const timer = setTimeout(() => resolve(null), CanvasImageManager.loadTimeout);
			image.onload = () => {
				clearTimeout(timer);
				resolve(
					image.naturalWidth && image.naturalHeight
						? { width: image.naturalWidth, height: image.naturalHeight }
						: null
				);
			};
			image.onerror = () => {
				clearTimeout(timer);
				resolve(null);
			};
			image.src = src;
		});
	}

	/** `size` scaled down (never up) so its longest side is at most `max`. */
	static fitSize(
		size: { width: number; height: number } | null,
		max: number = CanvasImageManager.maxSize
	): { width: number; height: number } {
		const source = size ?? CanvasImageManager.fallbackSize;
		const scale = Math.min(1, max / Math.max(source.width, source.height));
		return {
			width: Math.round(source.width * scale),
			height: Math.round(source.height * scale)
		};
	}
}
