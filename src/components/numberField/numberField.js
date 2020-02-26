import './numberField.scss'
import $ from 'jQuery'

$( document ).ready(function() {
    $('.numberField').each((i, e) => {
		let currentNumberField = $(e)
		let currentNumberFieldInput = currentNumberField.find('.numberField__input')
		let currentNumberFieldUp = currentNumberField.find('.numberField__button_up')
		let currentNumberFieldDown = currentNumberField.find('.numberField__button_down')

		currentNumberFieldUp.click(() => {
			currentNumberFieldInput.val( function(i, value) {
				return parseInt( value, 10) + 1
			})
		})
		currentNumberFieldDown.click(() => {
			currentNumberFieldInput.val( function(i, value) {
				return parseInt( value, 10) - 1
			})
		})
	})
})