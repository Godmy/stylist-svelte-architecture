import { COLORS_SCALES_AMBER } from '$stylist/theme/const/record/colors-scales/amber';
import { COLORS_SCALES_BLUE } from '$stylist/theme/const/record/colors-scales/blue';
import { COLORS_SCALES_GREEN } from '$stylist/theme/const/record/colors-scales/green';
import { COLORS_SCALES_NEUTRAL } from '$stylist/theme/const/record/colors-scales/neutral';
import { COLORS_SCALES_RED } from '$stylist/theme/const/record/colors-scales/red';

export class ObjectManagerColorPalette {
	static readonly defaultValue = COLORS_SCALES_NEUTRAL[900];

	static readonly palette = [
		COLORS_SCALES_NEUTRAL[900],
		COLORS_SCALES_NEUTRAL[600],
		COLORS_SCALES_RED[600],
		COLORS_SCALES_AMBER[500],
		COLORS_SCALES_AMBER[200],
		COLORS_SCALES_GREEN[500],
		COLORS_SCALES_BLUE[500],
		COLORS_SCALES_BLUE[600],
		COLORS_SCALES_NEUTRAL[300],
		COLORS_SCALES_NEUTRAL[50]
	] as const;

	static resolveValue(value?: string): string {
		return value || ObjectManagerColorPalette.defaultValue;
	}

	static resolvePalette(): readonly string[] {
		return ObjectManagerColorPalette.palette;
	}
}
