const findAllowedIndexNextStep = (value, pos, char) => {
	return value.split('')
		.findIndex((val, i) => i >= pos && /\d/.test(val) || val === char)
}

const findAllowedIndexPrevStep = (value, pos, min) => {
	return value.split('')
		.findLastIndex((val, i) => i > min && i < pos && /\d/.test(val))
}

export {
	findAllowedIndexNextStep,
	findAllowedIndexPrevStep
}