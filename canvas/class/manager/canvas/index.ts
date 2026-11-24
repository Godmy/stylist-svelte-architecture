import { CANVAS_SHAPE_KIND } from '$stylist/canvas/const/array/canvas-shape-kind';
import type { CanvasChange } from '$stylist/canvas/type/struct/canvas-change';
import type { CanvasObject } from '$stylist/canvas/type/alias/canvas-object';

/** Identity, copying, ordering, diffing and serialization of shared canvas objects. */
export class CanvasManager {
	static #sequence = 0;

	static createCanvasObjectId(): string {
		const uuid = globalThis.crypto?.randomUUID?.();
		if (uuid) return `obj_${uuid}`;

		CanvasManager.#sequence += 1;
		return `obj_${Date.now().toString(36)}_${CanvasManager.#sequence}`;
	}

	/** Deep copy; also unwraps reactive proxies. */
	static cloneCanvasObjects(value: readonly CanvasObject[] = []): CanvasObject[] {
		return JSON.parse(JSON.stringify(value)) as CanvasObject[];
	}

	static areCanvasObjectsEqual(
		left: readonly CanvasObject[],
		right: readonly CanvasObject[]
	): boolean {
		return left === right || JSON.stringify(left) === JSON.stringify(right);
	}

	/** Objects added, changed and removed between two snapshots, matched by `id`. */
	static diffCanvasObjects(
		before: readonly CanvasObject[],
		after: readonly CanvasObject[]
	): CanvasChange {
		const previous = new Map(before.map((object) => [object.id, JSON.stringify(object)]));
		const nextIds = new Set(after.map((object) => object.id));
		const added: CanvasObject[] = [];
		const updated: CanvasObject[] = [];

		for (const object of after) {
			const old = previous.get(object.id);
			if (old === undefined) added.push(object);
			else if (old !== JSON.stringify(object)) updated.push(object);
		}

		return {
			added,
			updated,
			removed: before.map((object) => object.id).filter((id) => !nextIds.has(id))
		};
	}

	/**
	 * Applies a change made elsewhere: replaces updated objects in place,
	 * appends added ones (an id that already exists is updated instead) and
	 * drops removed ids. Unchanged objects keep their identity.
	 */
	static applyCanvasChange(objects: readonly CanvasObject[], change: CanvasChange): CanvasObject[] {
		const removed = new Set(change.removed);
		const replacements = new Map(
			[...change.added, ...change.updated].map((object) => [object.id, object])
		);
		const result = objects
			.filter((object) => !removed.has(object.id))
			.map((object) => {
				const replacement = replacements.get(object.id);
				if (!replacement) return object;
				replacements.delete(object.id);
				return replacement;
			});
		for (const object of change.added) {
			if (replacements.has(object.id)) result.push(object);
		}
		return result;
	}

	static moveCanvasObject(object: CanvasObject, dx: number, dy: number): CanvasObject {
		switch (object.type) {
			case 'line':
				return {
					...object,
					points: [
						{ x: object.points[0].x + dx, y: object.points[0].y + dy },
						{ x: object.points[1].x + dx, y: object.points[1].y + dy }
					]
				};
			case 'path':
				return {
					...object,
					points: object.points.map((point) => ({ x: point.x + dx, y: point.y + dy }))
				};
			default:
				return { ...object, x: object.x + dx, y: object.y + dy };
		}
	}

	static moveCanvasObjects(
		objects: readonly CanvasObject[],
		ids: ReadonlySet<string>,
		dx: number,
		dy: number
	): CanvasObject[] {
		return objects.map((object) =>
			ids.has(object.id) ? CanvasManager.moveCanvasObject(object, dx, dy) : object
		);
	}

	static updateCanvasObjects(
		objects: readonly CanvasObject[],
		ids: ReadonlySet<string>,
		update: (object: CanvasObject) => CanvasObject
	): CanvasObject[] {
		return objects.map((object) => (ids.has(object.id) ? update(object) : object));
	}

	/** Copies of the selected objects shifted by `offset`, appended on top. */
	static duplicateCanvasObjects(
		objects: readonly CanvasObject[],
		ids: ReadonlySet<string>,
		offset = 24
	): { objects: CanvasObject[]; ids: string[] } {
		const copies = CanvasManager.cloneCanvasObjects(
			objects.filter((object) => ids.has(object.id))
		).map((object) => ({
			...CanvasManager.moveCanvasObject(object, offset, offset),
			id: CanvasManager.createCanvasObjectId()
		}));

		return { objects: [...objects, ...copies], ids: copies.map((object) => object.id) };
	}

	/** Moves the selected objects to the top or bottom of the stack, keeping their order. */
	static reorderCanvasObjects(
		objects: readonly CanvasObject[],
		ids: ReadonlySet<string>,
		direction: 'front' | 'back'
	): CanvasObject[] {
		const selected = objects.filter((object) => ids.has(object.id));
		const rest = objects.filter((object) => !ids.has(object.id));
		return direction === 'front' ? [...rest, ...selected] : [...selected, ...rest];
	}

	static isCanvasObject(value: unknown): value is CanvasObject {
		if (!value || typeof value !== 'object') return false;

		const object = value as Record<string, unknown>;
		const isNumber = (field: unknown) => typeof field === 'number' && Number.isFinite(field);
		const isPoint = (field: unknown) =>
			Boolean(field) &&
			typeof field === 'object' &&
			isNumber((field as Record<string, unknown>).x) &&
			isNumber((field as Record<string, unknown>).y);
		const isBox = () =>
			isNumber(object.x) && isNumber(object.y) && isNumber(object.width) && isNumber(object.height);
		const isText = (field: unknown) => typeof field === 'string';

		if (typeof object.id !== 'string' || !object.id) return false;
		if (object.color !== undefined && typeof object.color !== 'string') return false;
		if (object.userId !== undefined && typeof object.userId !== 'string') return false;
		if (object.locked !== undefined && typeof object.locked !== 'boolean') return false;

		switch (object.type) {
			case 'shape':
				return (
					isBox() &&
					(CANVAS_SHAPE_KIND as readonly unknown[]).includes(object.shape) &&
					(object.text === undefined || isText(object.text)) &&
					(object.vertices === undefined ||
						(Array.isArray(object.vertices) && object.vertices.every(isPoint))) &&
					(object.shape !== 'polygon' ||
						(Array.isArray(object.vertices) && object.vertices.length >= 3))
				);
			case 'text':
			case 'sticky':
				return isBox() && isText(object.text);
			case 'frame':
				return isBox() && (object.title === undefined || isText(object.title));
			case 'icon':
				return isBox() && isText(object.icon);
			case 'image':
				return (
					isBox() &&
					typeof object.src === 'string' &&
					Boolean(object.src) &&
					(object.alt === undefined || isText(object.alt))
				);
			case 'line':
				return (
					Array.isArray(object.points) && object.points.length === 2 && object.points.every(isPoint)
				);
			case 'path':
				return (
					Array.isArray(object.points) && object.points.length > 0 && object.points.every(isPoint)
				);
			default:
				return false;
		}
	}

	static serializeCanvasObjects(objects: readonly CanvasObject[]): string {
		return JSON.stringify(objects, null, 2);
	}

	/** Reads objects saved by `serializeCanvasObjects`; invalid entries are skipped. */
	static parseCanvasObjects(json: string): CanvasObject[] {
		try {
			const value: unknown = JSON.parse(json);
			return Array.isArray(value) ? value.filter(CanvasManager.isCanvasObject) : [];
		} catch {
			return [];
		}
	}
}
