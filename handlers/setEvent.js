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
	backspace: false
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

			if (isArrow) {

				switch (code) {
					case 'ArrowUp': {
						end = start = min
					}
						break

					case 'ArrowDown': {
						end = start = findAllowedIndexLastStep(value, this.char)
					}
						break

					case 'ArrowLeft': {
						const isAllowedPrevStep = allowedPrevStep(value, start - 1)

						if (isAllowedPrevStep) {
							if (start > min) end = --start
						} else {
							const prevIndex = findAllowedIndexPrevStep(value, start, min)
							end = start = prevIndex !== -1
								? prevIndex + 1 : min
						}
					}
						break

					case 'ArrowRight': {
						const isAllowedNextStep = allowedNextStep(value, start, this.char)
						
						if (isAllowedNextStep) {
							if (start < max) end = ++start
						} else {
							const nextIndex = findAllowedIndexNextStep(value, start, this.char)
							end = start = nextIndex !== -1
								? nextIndex : max
						}
					}
						break
				}
				
				// !Только при нажатии на стрелки, ctrl && shift обрабатывать немного иначе
				event.preventDefault()
				this.update({ end, start })
				target.setSelectionRange(start, end)
			}
			
			
		}
			
			break

		case 'keyup': {
			if (code === 'Backspace') is.backspace = false
		}
			break
			
		case 'dblclick': {
			const [startIndex, endIndex] = dbclick(value, min, this.char)

			target.setSelectionRange(startIndex, endIndex)
			this.update({ start: startIndex, end: endIndex })
		}
			break

		case 'mouseup': {
			// if (eStart !== eEnd) {
			// 	const [
			// 		firstDigit,
			// 		lastDigit
			// 	] = findAllowedIndexRangeSteps(value, eStart, eEnd, min, this.char)

			// 	target.setSelectionRange(firstDigit, lastDigit)
			// 	this.update({ start: firstDigit, end: lastDigit })
			// } else {
			// 	const allowedIndex = findAllowedIndexFirstStep(value, eStart, min, this.char)
				
			// 	target.setSelectionRange(allowedIndex, allowedIndex)
			// 	this.update({ start: allowedIndex, end: allowedIndex })
			// }

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