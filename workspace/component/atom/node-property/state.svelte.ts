import type { RecipeNodeProperty as NodePropertyProps } from '$stylist/workspace/interface/recipe/node-property';

export function createNodePropertyState(getProps: () => NodePropertyProps) {
	const props = $derived(getProps());
	const type = $derived((props.type ?? 'string') as NonNullable<NodePropertyProps['type']>);
	const size = $derived((props.size ?? 'md') as NonNullable<NodePropertyProps['size']>);
	const editable = $derived(props.editable ?? true);
	const error = $derived(Boolean(props.error));
	const hasLabel = $derived(Boolean(props.label));
	const hasDescription = $derived(Boolean(props.description));
	let currentValue = $state(props.value);
	const label = $derived(props.label ?? props.name);
	const description = $derived(props.description ?? '');
	const isBoolean = $derived(type === 'boolean');
	const isEnum = $derived(type === 'enum');
	const isColor = $derived(type === 'color');
	const isVector = $derived(type === 'vector2' || type === 'vector3');
	const isNumber = $derived(type === 'number');
	const isString = $derived(type === 'string');
	const vectorDimensions = $derived(type === 'vector3' ? 3 : 2);
	const className = $derived(props.class ?? '');

	$effect(() => {
		currentValue = props.value;
	});

	function handleFocus(event: FocusEvent) {
		props.onfocus?.(event as never);
	}

	function handleBlur(event: FocusEvent) {
		props.onblur?.(event as never);
	}

	function emitChange(nextValue: unknown) {
		currentValue = nextValue;
		props.onchange?.(props.name, nextValue);
	}

	function handleVectorChange(index: number, rawValue: string) {
		const base = Array.isArray(currentValue) ? [...currentValue] : [0, 0, 0];
		base[index] = Number(rawValue);
		emitChange(base.slice(0, vectorDimensions));
	}

	const classes = $derived(
		`node-property node-property--type-${type} node-property--${size}${error ? ' node-property--error' : ''}${editable === false ? ' node-property--readonly' : ''}`
	);
	const restProps = $derived.by(() => {
		const {
			class: _class,
			id: _id,
			name: _name,
			type: _type,
			value: _value,
			defaultValue: _defaultValue,
			size: _size,
			editable: _editable,
			typeEditable: _typeEditable,
			options: _options,
			min: _min,
			max: _max,
			step: _step,
			prefix: _prefix,
			suffix: _suffix,
			label: _label,
			description: _description,
			icon: _icon,
			error: _error,
			errorMessage: _errorMessage,
			placeholder: _placeholder,
			onchange: _onchange,
			onfocus: _onfocus,
			onblur: _onblur,
			children: _children,
			...rest
		} = props;
		return rest;
	});

	return {
		get type() {
			return type;
		},
		get size() {
			return size;
		},
		get editable() {
			return editable;
		},
		get error() {
			return error;
		},
		get hasLabel() {
			return hasLabel;
		},
		get hasDescription() {
			return hasDescription;
		},
		get currentValue() {
			return currentValue;
		},
		set currentValue(value: unknown) {
			currentValue = value;
		},
		get label() {
			return label;
		},
		get description() {
			return description;
		},
		get isBoolean() {
			return isBoolean;
		},
		get isEnum() {
			return isEnum;
		},
		get isColor() {
			return isColor;
		},
		get isVector() {
			return isVector;
		},
		get isNumber() {
			return isNumber;
		},
		get isString() {
			return isString;
		},
		get vectorDimensions() {
			return vectorDimensions;
		},
		get vectorLabels() {
			return ['X', 'Y', 'Z'];
		},
		get className() {
			return className;
		},
		get classes() {
			return classes;
		},
		get propertyState() {
			return this;
		},
		get restProps() {
			return restProps;
		},
		handleFocus,
		handleBlur,
		emitChange,
		handleVectorChange
	};
}

export default createNodePropertyState;
