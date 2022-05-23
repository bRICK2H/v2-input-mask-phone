import {
	findAllowedIndexNextStep,
	findAllowedIndexPrevStep
} from '../helpers'

const findAllowedIndexFirstStep = (value, index, min, char) => {
	const arrayValue = value.split('')
		, firstChar = value.indexOf(char)
		, firstDigit = arrayValue.findIndex((val, i) => {
			return i >= min && i >= index - 1 && /\d/.test(val)
		})
		, prevDigit = findAllowedIndexPrevStep(value, index, min)
		, nextDigit = findAllowedIndexNextStep(value, index, char)
		, offsetPrev = index - (prevDigit + 1)
		, offsetNext = nextDigit - index

	return index < min
		? firstDigit !== -1
			? firstDigit
			: firstChar
		: value[index] === char || value[index - 1] === char
			? firstChar
			: /\D/.test(value[index - 1]) && value[index - 1] !== char
				? offsetPrev < offsetNext ? prevDigit + 1 : nextDigit
				: index
}

const findAllowedIndexRangeSteps = (value, start, end, min, char) => {
	const firstChar = value.indexOf(char)
		, arrayValue = value.split('')
		, getIndex = (val, i) => i >= min && i >= start && i < end && /\d/.test(val)
		, firstDigit = arrayValue.findIndex((val, i) => getIndex(val, i))
		, lastDigit = arrayValue.findLastIndex((val, i) => getIndex(val, i))

	return firstDigit !== -1 && lastDigit !== -1
		? [firstDigit, lastDigit + 1]
		: start < min
			? [min, min]
			: [firstChar, firstChar]
}

export const mouseup = (value, start, end, min, char) => {
	if (start !== end) {
		return findAllowedIndexRangeSteps(value, start, end, min, char)
	} else {
		const index = findAllowedIndexFirstStep(value, start, min, char)

		return [index, index]
	}
}