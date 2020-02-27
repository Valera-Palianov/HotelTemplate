import '../label/label'

import './dropdown.scss'
import $ from 'jQuery'

class Dropdown {
	constructor(dropdown) {
		this.dropdown = dropdown
		this.dropdownHead = this.dropdown.find('.dropdown__head')
		this.dropdownWrap = this.dropdown.find('.dropdown__wrap')

		this.dropdownIsOpen = false

		this.handleOutsideClick = this.handleOutsideClick.bind(this)
		this.handleDropdownClick = this.handleDropdownClick.bind(this)

		this.init()
	}

	init() {
		this.dropdown.height(this.dropdownWrap.height())
		this.dropdownHead.on('click', this.handleDropdownClick)
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
}

export default Dropdown

$( document ).ready(function() {
    $('.dropdown').each((i, e) => {
		new Dropdown($(e))
	})
})