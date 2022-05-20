import setEvent from './setEvent'

const EVENTS = [
	'input',
	'keyup',
	'keydown',
	'mouseup',
	'mousedown',
]

export default function(input) {
	for (const event of EVENTS) {
		input.addEventListener(event, setEvent.bind(this, event))
	}
}