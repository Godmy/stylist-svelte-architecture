/** Interference field shader: tint and animation speed are live props. */
export interface RecipeInterferenceFieldScene {
	/** Time multiplier, clamped to 0..3; 0 freezes the field. */
	speed?: number;
	/** `#rrggbb` tint of the field. */
	color?: string;
	/** The browser has no WebGL2; the host shows its own fallback. */
	onUnsupported?: () => void;
}
