import { ObjectManagerColorPalette } from '$stylist/canvas/class/manager/color-palette';
import type { RecipeColorPalette } from '$stylist/canvas/interface/recipe/color-palette';

export function createColorPaletteState(getProps: () => RecipeColorPalette) {
	const props = $derived(getProps());
	let isOpen = $state(false);
	let internalValue = $state(ObjectManagerColorPalette.resolveValue(props.value));

	$effect(() => {
		internalValue = ObjectManagerColorPalette.resolveValue(props.value);
	});

	const palette = $derived(ObjectManagerColorPalette.resolvePalette());
	const rootClass = $derived(['c-color-picker', props.class].filter(Boolean).join(' '));
	const triggerClass = $derived('c-color-picker__trigger');
	const panelClass = $derived('c-color-picker__panel');
	const previewClass = $derived('c-color-picker__preview');
	const textInputClass = $derived('c-color-picker__text-input');
	const paletteClass = $derived('c-color-picker__palette');
	const paletteButtonClass = $derived('c-color-picker__palette-btn');
	const acceptButtonClass = $derived('c-color-picker__accept-btn');

	const restProps = $derived.by(() => {
		const {
			value: _value,
			disabled: _disabled,
			showInput: _showInput,
			showPalette: _showPalette,
			class: _class,
			onInput: _onInput,
			onChange: _onChange,
			...rest
		} = props;
		return rest;
	});

	function setOpen(nextValue: boolean): void {
		isOpen = nextValue;
	}

	function toggleOpen(): void {
		if (!props.disabled) {
			isOpen = !isOpen;
		}
	}

	function setColor(color: string): void {
		internalValue = color;
		props.onInput?.(color);
		props.onChange?.(color);
	}

	function handleInput(): void {
		props.onInput?.(internalValue);
	}

	function handleChange(): void {
		props.onChange?.(internalValue);
	}

	return {
		get isOpen() {
			return isOpen;
		},
		get internalValue() {
			return internalValue;
		},
		set internalValue(value: string) {
			internalValue = value;
		},
		get palette() {
			return palette;
		},
		get rootClass() {
			return rootClass;
		},
		get triggerClass() {
			return triggerClass;
		},
		get panelClass() {
			return panelClass;
		},
		get previewClass() {
			return previewClass;
		},
		get textInputClass() {
			return textInputClass;
		},
		get paletteClass() {
			return paletteClass;
		},
		get paletteButtonClass() {
			return paletteButtonClass;
		},
		get acceptButtonClass() {
			return acceptButtonClass;
		},
		get restProps() {
			return restProps;
		},
		setOpen,
		toggleOpen,
		setColor,
		handleInput,
		handleChange
	};
}

export default createColorPaletteState;
