import '../label/label'
import Option from '../option/option'

import './dropdown.scss'
import $ from 'jQuery'

class Dropdown {
	constructor(dropdown) {
		this.dropdown = dropdown
		this.dropdownHead = this.dropdown.find('.dropdown__head')
		this.dropdownValue = this.dropdown.find('.dropdown__value')
		this.dropdownWrap = this.dropdown.find('.dropdown__wrap')
		this.dropdownResetButton = this.dropdown.find('.dropdown__button_reset')
		this.dropdownApplyButton = this.dropdown.find('.dropdown__button_apply')

		this.dropdownOptions = []
		this.dropdownValueDefault = this.dropdownValue.html()
		this.dropdownIsOpen = false

		this.handleOutsideClick = this.handleOutsideClick.bind(this)
		this.handleDropdownClick = this.handleDropdownClick.bind(this)
		this.dropdownUpdate = this.dropdownUpdate.bind(this)
		this.handleApply = this.handleApply.bind(this)
		this.handleReset = this.handleReset.bind(this)

		this.init()
	}

	init() {
		this.dropdown.height(this.dropdownWrap.height())
		this.dropdownHead.on('click', this.handleDropdownClick)
		this.dropdownResetButton.on('click', this.handleReset)
		this.dropdownApplyButton.on('click', this.handleApply)

		this.dropdown.find('.dropdown__option').each((i, e) => {
			this.dropdownOptions.push(new Option($(e), this.dropdownUpdate))
		})
	}

	dropdownUpdate() {
		let result = ""
		this.dropdownOptions.forEach((e, i) => {
			let splitter = result == '' ? '' : ', '
			result += e.returnStringResult() != false ? splitter+e.returnStringResult() : ""
		})
		this.dropdownValue.html(result == '' ? this.dropdownValueDefault : result)
	}

	handleDropdownClick() {
		if(this.dropdownIsOpen) {
			this.hideDropdown()
		} else {
			this.showDropdown()
		}
	}

	handleOutsideClick(event) {
		const target = event.target
		const dropdown = this.dropdown.get(0)
		const itsDropdown = target === dropdown || $.contains(dropdown, target)
		if(!itsDropdown) this.hideDropdown()
	}

	showDropdown() {
		this.dropdown.addClass('dropdown_opened')
		this.dropdownIsOpen = true
    	$(document).on('click', this.handleOutsideClick)
	}

	hideDropdown() {
		this.dropdown.removeClass('dropdown_opened')
		this.dropdownIsOpen = false
		$(document).off('click', this.handleOutsideClick)
	}

	handleApply() {
		console.log('apply')
		this.hideDropdown()
	}

	handleReset() {
		this.dropdownOptions.forEach((e, i) => {
			e.changeValue(e.optionMin)
		})
	}
}

export default Dropdown

$( document ).ready(function() {
    $('.dropdown').each((i, e) => {
		new Dropdown($(e))
	})
})