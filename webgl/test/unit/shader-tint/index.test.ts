import { describe, expect, it } from 'vitest';
import { shaderTint } from '$stylist/webgl/function/resolve/shader-tint';

describe('shaderTint', () => {
	it('normalizes #rrggbb channels', () => {
		expect(shaderTint('#ff0080')).toEqual([1, 0, 128 / 255]);
	});

	it('falls back for malformed colors', () => {
		expect(shaderTint('red', '#000000')).toEqual([0, 0, 0]);
		expect(shaderTint('#fff', '#ffffff')).toEqual([1, 1, 1]);
	});
});
