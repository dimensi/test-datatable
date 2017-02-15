import arrayChunk from './arrayChunk';
import prepend from './prepend';
import detectIe from './detectIe';
import naturalSort from './naturalSort';

export default class DataTable {
	constructor(json) {
		this.container = document.querySelector('.datatable');
		this.jsonContainer = document.querySelector('.json-code');
		this.data = json;
		this.buttonStates = {};
		this.currentPage = 1;
		this.countPages = 0;
		this.formOpened = false;
	}

	render(dataJson) {
		const table = document.querySelector('table');
		let data = this.getCurrentPage(this.currentPage, dataJson).map(el => {
			return `<tr>
			<th scope="row">${el.id}</th>
			<td>${el.title}</td>
			<td>${el.amount}</td>
			<td>${el.cost} руб.</td>
			</tr>`;
		}).join('');
		const summary = this.data.reduce((prev, cur) => prev + Math.round(cur.amount * cur.cost), 0);
		const tableBody = table.querySelector('tbody') || document.createElement('tbody');
		const tableFoot = table.querySelector('tfoot') || document.createElement('tfoot');
		tableBody.innerHTML = data;
		tableFoot.innerHTML = `<tr>
				<td colspan="4" style="text-align: right">Итого: ${summary}</td>
			</tr>`;
		table.appendChild(tableBody);
		table.appendChild(tableFoot);
	}


	addRow(values) {
		const { id, title, amount, cost } = values;
		this.data.unshift({
			id,
			title,
			amount,
			cost
		});
		const jsonCode = document.querySelector('.jsonCode > code');
		if (jsonCode) {
			jsonCode.remove();
		}
		this.render(this.data);
		this.renderNavigation();
	}

	serialize(e) {
		e.preventDefault();
		const form = e.target;
		const data = new FormData(form);
		let values = {};
		for (let entry of data.entries()) {
			values[entry[0]] = entry[1];
		}
		this.addRow(values);
		this.formOpened = false;
	}


	showJson(e) {
		e.preventDefault();
		const placeToInsert = this.jsonContainer.querySelector('.json-code__modal');
		const body = document.querySelector('.page');
		const closeButton = placeToInsert.querySelector('.json-code__close-modal');
		const data = JSON.stringify(this.data, '', 4);
		const code = placeToInsert.querySelector('code') || document.createElement('code');
		code.innerHTML = `<pre>${data}</pre>`;
		placeToInsert.appendChild(code);
		placeToInsert.classList.add('json-code__modal--open');
		body.classList.add('page--modal_open');
		closeButton.onclick = () => {
			placeToInsert.classList.remove('json-code__modal--open');
			body.classList.remove('page--modal_open');
		};
	}

	sortIt(row, reverse) {
		if (typeof this.data[0][row] === 'string') {
			this.data = reverse? this.data.reverse() : naturalSort(this.data, a => a[row]);
		} else {
			this.data = this.data.sort((a, b) => {
				if (reverse) return a[row] > b[row] ? -1 : 1;
				if (!reverse) return a[row] > b[row] ? 1 : -1;
			});
		}
		this.render(this.data);
		this.formOpened = false;
	}


	addSortOnButtons() {
		const buttons = Array.from(document.querySelectorAll('table th'));
		let buttonsStates = this.buttonStates;
		buttons.reduce((prev, el) => {
			const id = el.getAttribute('data-id');
			buttonsStates[id] = {
				reverse: true
			};
			el.onclick = () => {
				buttons.forEach(el => {
					el.classList.remove('datatable__th--down', 'datatable__th--up');
				});
				if (this.buttonStates[id].reverse) {
					el.classList.remove('datatable__th--up');
					el.classList.add('datatable__th--down');
				} else {
					el.classList.remove('datatable__th--down');
					el.classList.add('datatable__th--up');
				}
				this.sortIt(id, buttonsStates[id].reverse);
				buttonsStates[id].reverse = !buttonsStates[id].reverse;
			};
		}, []);
	}


	getCurrentPage(page, array) {
		const pages = arrayChunk(array, 5);
		this.countPages = pages.length;
		return pages[page - 1];
	}
	
	renderNavigation() {
		const countPages = this.countPages;
		const placeToInsert = this.container.querySelector('.datatable__nav');
		const list = document.querySelector('.datatable__nav > ul') || document.createElement('ul');
		let li = '';
		for (let x = 1; x <= countPages; x++) {
			li += `<li><button>${x}</button></li>`;
		}
		list.innerHTML = li;
		list.onclick = this.changePage.bind(this);
		placeToInsert.appendChild(list);
	}

	changePage(e) {
		if (e.target.tagName.toLowerCase() === 'button') {
			this.currentPage = parseInt(e.target.textContent, 10);
		}
		this.render(this.data);
	}

	openFormToInsert() {
		if (!this.formOpened) {
			this.formOpened = true;
			const table = this.container.querySelector('table > tbody');
			const row = document.createElement('tr');
			row.innerHTML = `
				<td><input type="number" name="id" form="datatable" required></td>
				<td><input type="text" name="title" form="datatable" required></td>
				<td><input type="number" name="amount" form="datatable" required></td>
				<td><input type="number" name="cost" step="0.1" form="datatable" required></td>
			`;
			prepend(table, row);
			const form = this.container.querySelector('form');
			form.onsubmit = this.serialize.bind(this);
			if (detectIe()) {
				const inputs = Array.from(row.querySelectorAll('input'));
				for (let input of inputs) {
					input.onkeydown = (e) => {
						if (e.keyCode === 13) {
							const values = {};
							for (let int of inputs) {
								let key = int.getAttribute('name');
								let value = int.value;
								if (!value) {
									return false;
								}
								values[key] = value;
							}
							this.addRow(values);
							this.formOpened = false;
						}
					};
				}
			}
		}
	}

	init() {
		this.render(this.data);
		this.renderNavigation();
		const addRowButton = this.container.querySelector('.datatable__button-addRow');
		const jsonButton = document.querySelector('.json-code__button');
		addRowButton.onclick = this.openFormToInsert.bind(this);
		jsonButton.onclick = this.showJson.bind(this);
		this.addSortOnButtons();
	}
}