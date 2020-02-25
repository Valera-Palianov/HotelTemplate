import './dropdown.scss'
import $ from 'jQuery'

$( document ).ready(function() {
    $('.dropdown').each((i, e) => {
		let currentDropdown = $(e)
		let currentDropdownHead = currentDropdown.find('.dropdown__head')
		let currentDropdownWrap = currentDropdown.find('.dropdown__wrap')
		let currentDropdownWrapHeight = currentDropdownWrap.height()
		currentDropdown.height(currentDropdownWrapHeight)

		currentDropdownHead.click(() => {
			currentDropdown.toggleClass('dropdown_opened')
		})
	})
})