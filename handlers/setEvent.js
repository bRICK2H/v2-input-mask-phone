const allowedNextStep = (value, pos, char) => {
	return /\d/.test(value[pos]) && value[pos] !== char
}

const allowedPrevStep = (value, pos) => {
	return /\d/.test(value[pos])
}

const findAllowedIndexNextStep = (value, pos, char) => {
	return value.split('')
		.findIndex((val, i) => i >= pos && /\d/.test(val) || val === char)
}

const findAllowedIndexPrevStep = (value, pos, min) => {
	return value.split('')
		.findLastIndex((val, i) => i > min && i < pos && /\d/.test(val))
}

const findAllowedIndexLastStep = (value, char) => {
	const arrayValue = value.split('')

	return value.indexOf(char) !== -1
		? arrayValue.findIndex(val => val === char)
		: arrayValue.findLastIndex(val => /\d/.test(val)) + 1
}

export default function(name, event) {
	const { target, code } = event
		,	{ value } = target

	// console.log(name, target, this, target.value, target.selectionStart)

	switch (name) {
		case 'keydown': {
			let {
				start, end, min, max
			} = this._caret

			const ARROWS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
				, isArrow = ARROWS.includes(code)


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
				target.setSelectionRange(start, end)
			}

			this.update({ end, start })
			
		}
			
			break

		case 'keyup': {}
			
		case 'mousedown': {
			if (event instanceof MouseEvent) {
				event.preventDefault()

				const lastIndex = findAllowedIndexLastStep(value, this.char)
				
				target.focus()
				target.setSelectionRange(lastIndex, lastIndex)
				this.update({ end: lastIndex, start: lastIndex })
			}
		}
			break

		case 'mouseup': {
			
			// const start = target.selectionStart
			// 	, end = target.selectionEnd
			// 	, value = target.value
			// 	, { min } = this._caret
			// 	, firstEmpty = this.getFirstEmptyChar(value)

			// if (start !== end) {

			// 	if (start < min) {
			// 		this.update({ start: firstEmpty, end: firstEmpty })
			// 		target.setSelectionRange(firstEmpty, firstEmpty)
			// 	} else {
			// 		this.update({ start, end })
			// 		target.setSelectionRange(start, end)
			// 	}
			// } else {
			// 	this.update({ start: firstEmpty, end: firstEmpty })
			// 	target.setSelectionRange(firstEmpty, firstEmpty)
			// }
		}
			break
	
		default: {
			this.update({
				value: target.value,
				end: target.selectionEnd,
				start: target.selectionStart
			})
		}
			break
	}

	
}