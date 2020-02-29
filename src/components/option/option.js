import './option.scss'
import $ from 'jQuery'

class Option {
	constructor(option, dropdownUpdate = false) {
		this.option = option
		this.optionIncrement = this.option.find('.option__button_increment')
		this.optionDecrement = this.option.find('.option__button_decrement')
		this.optionDisplay = this.option.find('.option__display')
		this.optionHidden = this.option.find('input[type="hidden"]')

		this.optionMin = parseInt(this.option.attr('data-min'))
		this.optionMax = parseInt(this.option.attr('data-max'))
		this.optionStep = parseInt(this.option.attr('data-step'))

		this.optionCurrentValue = parseInt(this.optionDisplay.html())

		this.incrementButtonDisable = false
		this.decrementButtonDisable = false

		this.dropdownUpdate = dropdownUpdate
		this.itsDropdown = typeof this.dropdownUpdate === 'function'
		if(this.itsDropdown) {
			this.dropdownStringResult = false
			this.itemNameSingular = this.option.attr('data-item-name-singular')
			this.itemNamePlural = this.option.attr('data-item-name-plural')
			this.itemName = this.option.attr('data-item-name')
		}

		this.handleIncrement = this.handleIncrement.bind(this)
		this.handleDecrement = this.handleDecrement.bind(this)

		this.init()
	}

	init() {
		this.optionIncrement.on('click', this.handleIncrement)
		this.optionDecrement.on('click', this.handleDecrement)

		this.changeValue(this.optionCurrentValue)
	}

	handleIncrement() {
		if(!this.incrementButtonDisable) {
			this.changeValue(this.optionCurrentValue + this.optionStep)
		}
	}

	handleDecrement() {
		if(!this.decrementButtonDisable) {
			this.changeValue(this.optionCurrentValue - this.optionStep)
		}
	}

	changeValue(value) {
		if(value <= this.optionMin) {
			this.disableButton('dec')
			if (value < this.optionMin) {
				value = this.optionMin
			}
		} else {
			if(this.decrementButtonDisable) {
				this.enableButton('dec')
			}
		}

		if(value >= this.optionMax) {
			this.disableButton('inc')
			if (value > this.optionMax) {
				value = this.optionMax
			}
		} else {
			if(this.incrementButtonDisable) {
				this.enableButton('inc')
			}
		}

		if(this.itsDropdown) {
			let string = false
			if(value != 0) {
				if(value == 1) {
					string = "1 "+this.itemNameSingular
				} else if(value > 1 && value < 5) {
					string = value.toString()+" "+this.itemNamePlural
				} else {
					string = value.toString()+" "+this.itemName
				}
			}
			this.dropdownStringResult = string
			this.dropdownUpdate()
		}
		this.optionCurrentValue = value
		this.optionDisplay.html(this.optionCurrentValue)
		this.optionHidden.val(this.optionCurrentValue)
	}

	disableButton(type) {
		if(type=='inc') {
			this.optionIncrement.addClass('option__button_disabled')
			this.incrementButtonDisable = true
		} else {
			this.optionDecrement.addClass('option__button_disabled')
			this.decrementButtonDisable = true
		}
	}

	enableButton(type) {
		if(type=='inc') {
			this.optionIncrement.removeClass('option__button_disabled')
			this.incrementButtonDisable = false
		} else {
			this.optionDecrement.removeClass('option__button_disabled')
			this.decrementButtonDisable = false
		}
	}

	returnStringResult() {
		return this.dropdownStringResult
	}
}

export default Option

$( document ).ready(function() {
    $('.option:not(.dropdown__option)').each((i, e) => {
		new Option($(e))
	})
})