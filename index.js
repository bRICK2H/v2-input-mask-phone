export default class InputMask {

	constructor({ el, mask, char }) {
		this.enableHandlers(el)
		
		
		this.initValue = ''
		this._value 	= ''
		this._caret 	= {
			start: 0,
			end: 0,
			min: null,
			max: null,
		}
		
		this.mask 		= mask
		this.char 		= char
		this.type 		= null
		this.node		= null
		
		this.isMask = this.isMaskUsed(mask, char)
	}

	get caret() {
		return this._caret
	}

	get value() {
		return this._value
	}

	/**
	 * @param { String, Object (node) } el 
	 * @returns Node
	 */

	getInput(el) {
		if (!el) return null
		
		return typeof el === 'object'
			? el : document.querySelector(el)
	}

	/**
	 * Определить, подключена ли маска и существует ли вообще актуальный шаблон обработки
	 * @param { String } mask 
	 * @param { String } char 
	 * @returns Boolean
	 */

	isMaskUsed(mask, char) {
		if (!mask) return false

		if (typeof mask !== 'string') {
			console.warn(
				'[InputMask]: Укажите корректный тип (String) для маски. Пример: "+7 (___)  ___-__-__"'
			)

			return false
		}

		const maskedChar = this.defineChar(mask)
		
		if (!char) {
			this.char = maskedChar
		} else {
			this.mask = this.defineMask(char, maskedChar)
		}
		
		this.type = this.defineMaskType()
		
		return Boolean(this.type)
	}
	
	/**
	 * Определить текущий символ маски
	 * @param { String } mask 
	 * @returns String char
	 */
	
	defineChar(mask) {
		let resultArray = []
		const maskArray = mask.split('')
			, uniqueArray = [...new Set(maskArray)]

		for (const item of uniqueArray) {
			resultArray.push(maskArray.filter(sym => sym === item))
		}

		const maxLength = Math.max(
			...resultArray
				.map(arrItem => arrItem.length)
		)
		const [resChar] = [...new Set([
			...resultArray
				.filter(arrItem => arrItem.length === maxLength)
				.flat()
		])]

		return resChar
	}
	
	/**
	 * Определить текущую маску, в зависимости от символа
	 * @param { String } char 
	 * @param { String } maskedChar 
	 * @returns String mask
	 */
	
	defineMask(char, maskedChar) {
		const pattern = new RegExp(`${maskedChar}`, 'g')

		return this.mask.replace(pattern, char)
	}

	/**
	 * Возвращает тип маски
	 * @returns String mask of type
	 */
	
	defineMaskType() {
		let type = ''
		
		const pattern = new RegExp(`[^${this.char}]`, 'g')
			, chars = this.mask.replace(pattern, '')
		
		switch (chars.length) {

			// Phone
			case 10: {
				if (!/\+7/.test(this.mask)) {
					this.mask = `+7 ${this.mask}`
				}

				type = 'phone'
			}
				break
		
			default: {
				console.warn(
					'[InputMask]: Указанного шаблона маски в данный момент не существует'
				)

				type = null
			}
		}

		this._caret.min = this.defineMinLength()
		this._caret.max = this.defineMaxLength()

		return type
	}
	
	// defineMaskType() {
	// 	const pattern = new RegExp(`[^${this.char}]`, 'g')
	// 		, chars = this.mask.replace(pattern, '')
		
	// 	switch (chars.length) {
	// 		case 10: return 'phone'
		
	// 		default: {
	// 			console.warn(
	// 				'[InputMask]: Указанного шаблона маски в данный момент не существует'
	// 			)

	// 			return null
	// 		}
	// 	}
	// }

	/**
	 * Вернет минимальный шаг для каретки
	 * @returns Number
	 */

	defineMinLength() {
		return this.mask.indexOf(this.char)
	}

	/**
	 * Вернет максимальный шаг для каретки
	 * @returns Number
	 */

	defineMaxLength() {
		return this.mask.length
	}

	/**
	 * Вернет максимальный шаг для каретки
	 * @returns Number
	 */

	getFirstEmptyChar(value) {
		return !value
			? this.defineMinLength()
			: value.indexOf(this.char)
	}

	/**
	 * Привязка необходимых обработчиков к узлу input
	 * @param { Object (node) } el 
	 */
	
	enableHandlers(el) {
		document.addEventListener('DOMContentLoaded', () => {
			const node = this.getInput(el)
				,	{ value } = node

			this.node = node
			this.initValue = value
			this.update({ value })

			node.addEventListener('input', this.input.bind(this))
			node.addEventListener('keydown', this.keydown.bind(this))
			node.addEventListener('mouseup', this.mouseup.bind(this))
			node.addEventListener('mousedown', this.mousedown.bind(this))
		})
	}

	/**
	 * Обработчик - ввод данных
	 * @param { Object } $event 
	 */

	input({ target }) {
		this.update({
			value: target.value,
			end: target.selectionEnd,
			start: target.selectionStart
		})
	}
	
	/**
	 * Обработчик - кнопка нажата
	 * @param { Object } $event 
	 */

	keydown({ target, code }) {
		let {
			start, end
		} = this._caret
		const { value } = target
			, 	ARROWS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
			,	isArrow = ARROWS.includes(code)

		if (isArrow) {
			switch (code) {
				case 'ArrowUp': end = start = 0
					break
	
				case 'ArrowDown': end = start = value.length
					break
	
				case 'ArrowLeft': if (start > 0) end = --start
					break
	
				case 'ArrowRight': if (start < value.length) end = ++start
					break
			}


			this.update({ end, start })
		}

	}
	
	mousedown({ target }) {
		const start = target.selectionStart
			, 	end = target.selectionEnd
			,	value = target.value
			, 	firstEmpty = this.getFirstEmptyChar(value)

		setTimeout(() => {
			this.update({ start: firstEmpty, end: firstEmpty })
			target.setSelectionRange(firstEmpty, firstEmpty)
		})
	}

	// 1. Разобратся со структурой, процесс кликов
	
	mouseup({ target }) {
		const start = target.selectionStart
			,	end = target.selectionEnd
			,	value = target.value
			,	{ min } = this._caret
			, 	firstEmpty = this.getFirstEmptyChar(value)
			
		if (start !== end) {

			if (start < min) {
				this.update({ start: firstEmpty, end: firstEmpty })
				target.setSelectionRange(firstEmpty, firstEmpty)
			} else {
				this.update({ start, end })
				target.setSelectionRange(start, end)
			}
		} else {
			this.update({ start: firstEmpty, end: firstEmpty })
			target.setSelectionRange(firstEmpty, firstEmpty)
		}
	}

	/**
	 * Обновление данных
	 * @param { Ojbect } { vlaue, start, end }
	 */

	update({ start = 0, end = 0, value }) {
		this._caret.end = end
		this._caret.start = start
		
		if (value !== undefined) {
			
			if (this.isMask) {
				this._value = this.maskHandler(value)
			} else {
				this._value = value
			}
			
		}
	}

	maskHandler(val) {
		switch (this.type) {
			case 'phone': {
				return this.phoneHandler(val)
			}
		}
	}

	phoneHandler(val) {
		console.warn('phoneHandler')
		const { start, end, min } = this._caret
		const clearedValue = val
			.replace(/\+7/, '')
			.replace(/\D/g, '')

		const arrayValue = clearedValue.split('')
		const maskedValue = this.mask.split('')
			.map(char => {
				if (char === this.char) {
					const [n] = arrayValue.splice(0, 1)
					return n ?? char
				}

				return char
			}).join('')

		this.node.value = maskedValue

		if (start < min) {
			this.node.setSelectionRange(min, min)
		} else {
			this.node.setSelectionRange(start, end)
		}
		
		return clearedValue
	}

}