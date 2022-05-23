import {
	findAllowedIndexNextStep,
	findAllowedIndexPrevStep
} from './helpers'


import { dbclick } from './events/dblclick'
import { mouseup } from './events/mouseup'

const allowedNextStep = (value, pos, char) => {
	return /\d/.test(value[pos]) && value[pos] !== char
}

const allowedPrevStep = (value, pos) => {
	return /\d/.test(value[pos])
}

const findAllowedIndexLastStep = (value, char) => {
	const arrayValue = value.split('')

	return value.indexOf(char) !== -1
		? arrayValue.findIndex(val => val === char)
		: arrayValue.findLastIndex(val => /\d/.test(val)) + 1
}

const findAllowedNextDigitIndex = ({ value, end, min, char }) => {
	const arrayValue = value.split('')
		, nextDigitIndex = arrayValue.findIndex((val, i) => i > end && /\d/.test(val))
		, lastDigitIndex = arrayValue.findLastIndex((val, i) => i > min && /\d/.test(val))

	return nextDigitIndex !== -1
		? nextDigitIndex + 1
		: lastDigitIndex !== -1
			? lastDigitIndex + 1
			: value.indexOf(char)
}

const findInputIndex = (maskValue, start, min, char) => {
	const val = maskValue[start]
		, valueArray = maskValue.split('')

	if (is.backspace) {

		if (/\D/.test(val) && char !== val) {
			if (start >= min) {
				return valueArray.findLastIndex(val => /\d/.test(val)) + 1
			} else {
				return min
			}
		} else {
			return start
		}

	} else {
		return maskValue.indexOf(char)
	}
}

const is = {
	shift: false,
	backspace: false,
}

export default function (event) {
	let {
		start, end, min, max
	} = this._caret
	const { target, code, type } = event
		, 	{ value, selectionStart: eStart, selectionEnd: eEnd } = target
	console.log(type, code)

	switch (type) {
		case 'keydown': {
			const ARROWS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
				, isArrow = ARROWS.includes(code)

			if (code === 'Backspace') is.backspace = true
			if (['ShiftLeft', 'ShiftRight'].includes(code)) {
				is.shift = true
			}

			if (isArrow) {
				switch (code) {
					case 'ArrowUp': {
						if (is.shift) {
							const endIndex = findAllowedIndexPrevStep(value, end, min)

							start = findAllowedIndexNextStep(value, min, this.char)
							end = endIndex !== -1 ? endIndex + 1 : end

						} else {
							end = start = min
						}
					}
						break

					case 'ArrowDown': {
						if (is.shift) {
							end = findAllowedNextDigitIndex({ value, end: max, char: this.char, min })
							start = /\D/.test(value[start])
								? findAllowedIndexNextStep(value, start, this.char)
								: start
						} else {
							end = start = findAllowedIndexLastStep(value, this.char)
						}
					}
						break

					case 'ArrowLeft': {
						if (is.shift) {
							const findAllowedLastDigitIndex = ({ value, min, max, char }) => {
								const arrayValue = value.split('')

								const lastDigitIndex = arrayValue.findLastIndex((val, i) => i >= min && i < max && /\d/.test(val))
								return lastDigitIndex !== -1
									? lastDigitIndex + 1
									: min
							}

							const prevIndex = findAllowedIndexPrevStep(value, start, min)
							
							start = prevIndex !== -1 ? prevIndex : min
							end = /\D/.test(value[end - 1])
								? findAllowedLastDigitIndex({ value, min, max: end })
								: end
						} else {
							const isAllowedPrevStep = allowedPrevStep(value, start - 1)
	
							if (isAllowedPrevStep) {
								if (start > min) end = --start
							} else {
								const prevIndex = findAllowedIndexPrevStep(value, start, min)
								end = start = prevIndex !== -1
									? prevIndex + 1 : min
							}
						}
					}
						break

					case 'ArrowRight': {
						if (is.shift) {
							end = /\D/.test(value[end]) || value[end] === this.char
								? findAllowedNextDigitIndex({ value, end, char: this.char, min })
								: ++end
						} else {
							if (start !== end) {
								end = start = end
							} else {
								const isAllowedNextStep = allowedNextStep(value, start, this.char)
		
								if (isAllowedNextStep) {
									if (start < max) end = ++start
								} else {
									const nextIndex = findAllowedIndexNextStep(value, start, this.char)
									end = start = nextIndex !== -1
										? nextIndex : max
								}
							}
						}
					}
						break
				}

				event.preventDefault()
				this.update({ end, start })
				target.setSelectionRange(start, end)
			}
			
		}
			
			break

		case 'keyup': {
			if (code === 'Backspace') is.backspace = false
			if (['ShiftLeft', 'ShiftRight'].includes(code)) {
				is.shift = false
			}
		}
			break
			
		case 'dblclick': {
			const [startIndex, endIndex] = dbclick(value, min, this.char)

			target.setSelectionRange(startIndex, endIndex)
			this.update({ start: startIndex, end: endIndex })
		}
			break

		case 'mouseup': {
			const [startIndex, endIndex] = mouseup(value, eStart, eEnd,  min, this.char)

			this.update({ start: startIndex, end: endIndex })
			target.setSelectionRange(startIndex, endIndex)
			
		}
			break

		case 'input': {
			this.setValue(value)
			const index = findInputIndex(this.maskValue, eStart, min, this.char)
			
			this.update({ start: index, end: index })
			target.setSelectionRange(index, index)
		}
			break
	
		default: {
			this.update({ start, end })
		}
			break
	}

	
}