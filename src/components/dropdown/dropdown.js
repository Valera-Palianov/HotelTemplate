import '../label/label'
import '../numberField/numberField'

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
			if(currentDropdown.hasClass('dropdown_opened')) {
				currentDropdown.removeClass('dropdown_opened')
			} else {
				$('.dropdown_opened').removeClass('dropdown_opened')
				currentDropdown.addClass('dropdown_opened')
			}
		})
	})
})