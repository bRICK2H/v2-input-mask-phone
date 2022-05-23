import register from './handlers/register'

export default class InputMask {

	constructor({ el, mask, char }) {
		console.log('ho')
		this.initValue = ''
		this.maskValue = ''
		this._value = ''
		this._caret = {
			start: 0,
			end: 0,
			min: null,
			max: null,
		}

		this.mask = mask
		this.char = char
		this.type = null
		this.node = null
		this.isMask = this.isMaskUsed(mask, char)

		this.enableHandlers(el)
	}

	get caret() {
		return this._caret
	}

	get value() {
		return this._value
	}

	set value(val) {
		this._valuel = val
	}

	// set value(val) {
	// 	this._value = val
	// }

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
		return this.mask.lastIndexOf(this.char) + 1
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
		setTimeout(() => {
			const node = this.getInput(el)
				,	{ value } = node

			this.node = node
			this.initValue = value
			this.setValue(value)

			register.call(this, node)
		})
		// document.addEventListener('DOMContentLoaded', () => {
		// 	const node = this.getInput(el)
		// 		,	{ value } = node

		// 	this.node = node
		// 	this.initValue = value
		// 	this.setValue(value)

		// 	register.call(this, node)
		// })
	}

	/**
	 * Обновление данных
	 * @param { Ojbect } { vlaue, start, end }
	 */

	update({ start = 0, end = 0 }) {
		this._caret.end = end
		this._caret.start = start
	}

	setValue(value) {
		if (value !== undefined) {

			if (this.isMask) {
				this.value = this.maskHandler(value)
			} else {
				this.value = value
			}

		}
	}

	maskHandler(value) {
		switch (this.type) {
			case 'phone': {
				return this.phoneHandler(value)
			}
		}
	}

	phoneHandler(value) {
		console.warn('phoneHandler')
		const clearedValue = value
			.replace(/\+7/, '')
			.replace(/\D/g, '')

		this.node.value = this.maskValue = this.maskedValue(clearedValue)

		return clearedValue
	}

	maskedValue(value) {
		const arrayValue = value.split('')
		const maskedValue = this.mask.split('')
			.map(char => {
				if (char === this.char) {
					const [n] = arrayValue.splice(0, 1)
					return n ?? char
				}

				return char
			}).join('')

		return maskedValue
	}

}