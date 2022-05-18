<template>
	<input class="input"
		type="text"
		
		:ref="inputRef"
		:value="initValue"

		@input="input($event)"
		@keyup="keyup($event)"
		@select="select($event)"
		@keydown="keydown($event)"
		@dblclick="dblclick($event)"
		@mousedown="mousedown($event)"
	>
</template>

<script>
export default {
	name: 'VInput',
	props: {
		value: null,
		mask: {
			type: String,
			default: null
		}
	},
	data: () => ({
		cursor: {
			min: 0,
			end: 0,
			start: 0,
		},

		inputRef: '',
		initValue: '',
		prevValue: '',
		localValue: '',
		moveCursor: '',

		isPast: false,
		isShift: false,
		isControl: false,
		isTargetInput: false
	}),
	methods: {
		input({ target }) {
			const start = target.selectionStart
				,	value = this.clearValue(target.value, this.isPast)

			if (value.length > 10) {
				target.value = this.formatValue(
					this.localValue,
					this.mask
				)

				if (this.isPast) {
					this.setCursor(this.cursor.start)
				} else {
					this.setCursor(start - 1)
				}
			} else {
				target.value = this.formatValue(
					value,
					this.mask
				)

				const indexEmpty = this.findEmptyIndex(target)
				
				switch (this.moveCursor) {
					case 'left': {
						const leftSymbol = target.value[start]

						if (start < this.cursor.min) {
							this.setCursor(this.cursor.min)
						} else {
							if (/\W/.test(leftSymbol)) {
								const index = target.value.split('').slice(0, start)
									.findLastIndex(val => /\d/.test(val) || val === '_')

								this.setCursor(index + 1)
							} else {
								this.setCursor(start)
							}
						}
						
					}
						break


					case 'right': {
						if (indexEmpty !== -1) {
							this.setCursor(indexEmpty)
						} else {
							this.setCursor(start)
						}
					}
						break

					case 'offset': {
						if (this.isPast) {
							console.log(indexEmpty)
							if (indexEmpty !== -1) {
								this.setCursor(indexEmpty)
							} else {
								// ! ctrl + v если есть данные скидывает курсор в конец!!
								// console.error(start, target.selectionStart)
								// this.setCursor(start - 1)
							}
						} else {
							this.setCursor(start - 1)
						}
					}
						break

					case 'place': {
						this.setCursor(start)
					}
						break
				}
				

				this.localValue = value
				this.prevValue = target.value
				this.$emit('input', value)
			}

		},
		keyup({ key }) {
			if (key === 'Shift') this.isShift = false
			if (key === 'Control') this.isControl = false

			if (this.isControl && key === 'v') {
				this.isPast = false
			}
		},
		keydown({ key, target }) {
			const value = target.value

			if (key === 'Shift') this.isShift = true
			if (key === 'Control') this.isControl = true

			if (this.isControl && key === 'v') {
				this.isPast = true
			}
			
			const arrows = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown']
				,	isArrows = arrows.includes(key)

			if (!this.isShift && !isArrows) {
				switch (key) {
					case 'Delete': {
						this.moveCursor = 'place'
					}
						break
	
					case 'Backspace': {
						this.moveCursor = 'left'
					}
						break
	
					default: {
						this.moveCursor = /\D/.test(key)
							? 'offset' : 'right'
					}
				}
			} else {
				setTimeout(() => {
				// Shift + Arrow
					if (this.isShift) {

						switch (key) {
							case 'ArrowLeft': {
								const startIndex = this.findPrevDigitIndex(value, this.cursor.start)
									,	endIndex = this.findPrevDigitIndex(value, this.cursor.end)

								if (startIndex >= this.cursor.min) {
									this.setCursor(startIndex, endIndex + 1)
								}
							}
								break

							case 'ArrowRight': {
								const startIndex = this.findNextDigitIndex(value, this.cursor.start)
									,	endIndex = this.findNextDigitIndex(value, this.cursor.end)

								if (endIndex !== -1) {
									this.setCursor(startIndex, endIndex + 1)
								}
							}
								break

							case 'ArrowUp': {
								const startIndex = this.findFirstDigitIndex(value)
									,	endIndex = this.findPrevDigitIndex(value, this.cursor.end)

								if (startIndex !== -1) {
									this.setCursor(startIndex, endIndex + 1)
								}
							}
								break
							case 'ArrowDown': {
								const startIndex = this.findNextDigitIndex(value, this.cursor.start)
									,	endIndex = this.findLastDigitIndex(value)
								
								if (startIndex !== -1) {
									this.setCursor(startIndex, endIndex + 1)
								}
							}
								break
						}

						if (this.cursor.end < this.cursor.min || this.cursor.start < this.cursor.min) {
							this.setCursor(this.cursor.min)
						}
					
					// Arrow
					} else {
						const emptyIndex = this.findEmptyIndex(target)
							,	start = this.cursor.start
										= this.cursor.end
										= target.selectionStart

						switch (key) {
							case 'ArrowLeft': {
								const currentSymbol = value[start]

								if (start <= this.cursor.min) {
									this.setCursor(this.cursor.min)
								} else {
									if (/\D/.test(currentSymbol)) {
										const digitIndex = value.split('').slice(0, start)
											.findLastIndex(val=> /\d/.test(val))
										
										this.setCursor(digitIndex + 1)
									}
								}
							}
								break

							case 'ArrowRight': {
								const currentSymbol = value[start - 1]

								if (currentSymbol === '_') {
									this.setCursor(emptyIndex)
								} else {
									if (/\D/.test(currentSymbol)) {
										const digitIndex = this.findNextDigitIndex(value, start)

										if (digitIndex !== -1) {
											this.setCursor(digitIndex)
										} else {
											this.setCursor(emptyIndex)
										}
									}
								}
							}
								break

							case 'ArrowUp':
							case 'ArrowDown': {
								this.setCursor(emptyIndex)
							}
								break
						}
						
					}
				
				})
			}
		},
		mousedown({ target }) {
			this.isTargetInput = true
			const index = this.findEmptyIndex(target)

			if (index !== -1) {
				this.setCursor(index)
			}
		},
		dblclick({ target }) {
			this.setCursor(0, target.value.length)
		},
		setCursor(start, end) {
			this.cursor.start = start
			this.cursor.end = end ?? start

			this.$refs[this.inputRef]?.select()
		},
		select({ target }) {
			target.setSelectionRange(this.cursor.start, this.cursor.end)
		},


		formatValue(value, mask) {
			const arrMask = mask.split('')

			for (let val of value) {
				const index = arrMask.indexOf('_')
				
				if (index !== -1) {
					arrMask[index] = val
				}
				
			}

			return arrMask.join('')
		},
		clearValue(value, isSlice = true) {
			const { start, end, min } = this.cursor
			let clearedValue = value.replace(/\+7/g, '').replace(/\D/g, '')

			if (isSlice) {
				if ((min === start || !start) && !this.prevValue) {
					
					if (clearedValue > 10) {
						clearedValue = clearedValue.slice(-10)
					}
					
				} else {
					if (start === end) {
						const from = this.localValue.length
						let to = this.prevValue.slice(start).split('')
							.filter(val => val === '_')
						to = to !== -1 ? to.length : 0

						const pastedValues = clearedValue.split('').splice(from,  to)

						clearedValue = `${this.localValue}${pastedValues.join('')}`
					} else {
						const prevArray = this.prevValue.split('')
							,	partOfPrevArray = this.prevValue.slice(start, end)
							,	clearToIndex = partOfPrevArray.replace(/\D/g, '').length
							,	dirtyToIndex = partOfPrevArray.length

						prevArray.splice(start, dirtyToIndex, '#')


						const betweenValues = prevArray.join('').replace(/\+7/, '').replace(/[^#\d]/g, '').split('')
							,	pastedValues = value.slice(start).replace(/\+7/, '').slice(0, clearToIndex)
							,	betweenIndex = betweenValues.indexOf('#')

						betweenValues.splice(betweenIndex, 1, ...pastedValues)

						clearedValue = betweenValues.join('')
					}
				}
			}
			
			return clearedValue
		},
		findEmptyIndex(target, last = false, from = 0) {
			const method = last ? 'lastIndexOf' : 'indexOf'
			
			return typeof target === 'object'
				? target.value[method]('_', from)
				: target[method]('_', from)
		},
		formatToArray(value) {
			return Array.isArray(value)
				? value
				: value.split('')
		},
		findNextDigitIndex(value, from) {
			return this.formatToArray(value)
				.findIndex((val, i) => i >= from && /\d/.test(val))
		},
		findPrevDigitIndex(value, from) {
			return this.formatToArray(value)
				.findLastIndex((val, i) => from > i && /\d/.test(val))
		},
		findFirstDigitIndex(value) {
			return this.formatToArray(value)
				.findIndex((val, i) => i >= this.cursor.min && /\d/.test(val))
		},
		findLastDigitIndex(value) {
			return this.formatToArray(value)
				.findLastIndex(val => /\d/.test(val))
		},
	},
	created() {

		// 1. Можно вычислить и проверить разные символы маски
		// 2. Проверить инпут на сайте и мобиле
		// 4. Ctrl + Z
		// 5. Определение позиции при клике

		// 79991112233
		// +78888888887
		// +22222222221
		// +79779991178
		
		const clearedValue = this.clearValue(this.value)

		this.inputRef = `input-ref:${String(Math.random()).slice(2, 10)}`
		this.initValue = this.formatValue(clearedValue, this.mask)
		// this.char = 
		this.cursor.min = this.mask.indexOf('_')

		document.addEventListener('mouseup', () => {
			if (this.isTargetInput) {
				const input = this.$refs[this.inputRef]
					,	start = this.cursor.start = input.selectionStart
					,	end = this.cursor.end = input.selectionEnd
					
				if (start !== end) {
					this.setCursor(start, end)
				} else {
					console.log({start, end})
					console.warn('empty', this.findEmptyIndex(input))
					const emptyIndex = this.findEmptyIndex(input)

					if (start !== emptyIndex) {
						// const rangeValue = input.value.split('').slice(start - 1)
						// const symbolIndex = rangeValue.findIndex(val => /\d/.test(val))

						// console.log('rangeValue', rangeValue, symbolIndex)
						// if (symbolIndex !== -1) {
						// 	this.setCursor(symbolIndex + start)
						// } else {
						// 	this.setCursor(emptyIndex)
						// }

						// ---

						// let symbolIndex = input.value.split('').slice(this.cursor.min, start)
						// 	.findLastIndex(val => /\d/.test(val))

						// console.log(symbolIndex)

						// if (symbolIndex !== -1) {
						// 	this.setCursor(symbolIndex)
						// } else {
						// 	this.setCursor(emptyIndex)
						// }

					}
				}

				this.isTargetInput = false
			}
		})
	}
}
</script>

<style lang="scss">
	.input {
		margin: auto;
		padding: 30px;
	}
</style>