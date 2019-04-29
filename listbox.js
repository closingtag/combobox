const listbox = (() => {
	let list, option;
	const options = [];

	const toggle = toggle => {
		const current = list.hidden;
		list.hidden = typeof toggle !== 'undefined' ? !toggle : !current;
		dispatch('display', { hidden: list.hidden });
	};

	const filter = term => {

		clear();

		if( term ) {
			options
				.filter(option => !option.textContent.toLowerCase().startsWith(term.toLowerCase()))
				.forEach(option => option.hidden = true);
		}
	};

	const select = down => {

		if( typeof down === 'undefined' ) {
			dispatch('change', { id: option.id, value: option.textContent });
			return;
		}

		const sibling = down ? 'nextElementSibling' : 'previousElementSibling';
		const startEl = down ? 'firstElementChild' : 'lastElementChild';
		let nextElement;

		if( option ) {
			nextElement = option[sibling];
			while( nextElement && nextElement.hidden ) {
				nextElement = nextElement[sibling] || null;
			}
		}
		else {
			nextElement = list[startEl];
			while( nextElement && nextElement.hidden ) {
				nextElement = nextElement[sibling] || null;
			}
		}

		if( nextElement) {
			option && option.removeAttribute('aria-selected');
			option = nextElement;
			option.setAttribute('aria-selected', true);
		}

		dispatch('change', { id: option.id });
	};

	const hidden = () => list.hidden;

	const clear = () => {
		if ( option ) {
			option.removeAttribute('aria-selected');
			option = null;
		}

		options.forEach(option => option.hidden = false);
	};

	const click = event => {
		if( options.indexOf(event.target) > -1 ) {
			option && option.removeAttribute('aria-selected');
			option = event.target;
			option.setAttribute('aria-selected', true);
			dispatch('change', { id: option.id, value: option.textContent });
		}
	};

	const dispatch = (type, detail) => {
		const event = new CustomEvent(type, { detail });
		list.parentNode.dispatchEvent(event);
	};

	const init = ({datalist, label, parent}) => {

		list = document.createElement('ul');
		list.setAttribute('role', 'listbox');

		Array.from(datalist.children).forEach((option, index) => {
			const li = document.createElement('li');
			li.textContent = option.value;
			li.id = `option-${datalist.id}-${index}`;
			li.setAttribute('role', 'option');

			options.push(li);

			list.appendChild(li);
		});

		list.id = datalist.id;
		list.hidden = true;
		list.setAttribute('aria-labelledby', label.id);

		parent.appendChild(list);

		list.addEventListener('click', click);

		return { filter, toggle, hidden, select, clear };
	};

	return { init }
})();
