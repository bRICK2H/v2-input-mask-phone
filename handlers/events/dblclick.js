export const dbclick = (value, min, char) => {
	const arrayValue = value.split('')
		, startIndex = arrayValue.findIndex((val, i) => i >= min && (/\d/.test(val) || val === char))
	let endIndex = arrayValue.findLastIndex((val, i) => i > startIndex && (/\d/.test(val)))

	if (endIndex !== -1) {
		endIndex += 1
	} else {
		endIndex = startIndex
	}

	return [startIndex, endIndex]
}