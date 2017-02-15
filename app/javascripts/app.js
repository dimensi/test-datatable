import DataTable from './datatable/DataTable';
import jsonTable from './datatable/table';

const button = document.querySelector('.m-button');
const menu = document.querySelector('.nav__menu');

button.onclick = function() {
	if (!this.classList.contains('m-button--active')) {
		this.classList.add('m-button--active');
		menu.classList.add('nav__menu--active');
		let liHeight = menu.firstChild.offsetHeight;
		let liCount = menu.childElementCount;
		menu.style.height = `${liHeight * liCount}px`;
	} else {
		this.classList.remove('m-button--active');
		menu.style.height = 0;
		const removeClass = () => { 
			menu.classList.remove('nav__menu--active');
			menu.removeEventListener('transitionend', removeClass);
		};
		menu.addEventListener('transitionend', removeClass);
	}
};

const table = new DataTable(jsonTable);
table.init();