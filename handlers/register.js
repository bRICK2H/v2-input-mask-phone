import setEvent from './setEvent'

const EVENTS = [
	'input',
	'keyup',
	'keydown',
	'mouseup',
	'mousedown',
]

export default function(input) {
	const listener = setEvent.bind(this)

	for (const event of EVENTS) {
		input.addEventListener(event, listener)
	}
}