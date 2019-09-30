const combobox = (() => {
	let list, textbox;

	const init = input => {
		const target = input.list || document.getElementById(input.getAttribute('list'));

		if( !target ) {
			return;
		}

		textbox = input;

		const label = document.querySelector(`label[for="${textbox.id}"]`);
		label.id = `label-for-${textbox.id}`;

		const wrapper = document.createElement('div');

		textbox.parentNode.insertBefore(wrapper, textbox);
		wrapper.appendChild(textbox);
		textbox.removeAttribute('list');

		const attributes = {
			'aria-autocompletelist': 'list',
			'role': 'combobox',
			'autocomplete': 'off',
			'aria-expanded': 'false',
			'aria-owns': target.id,
			'aria-haspopup': true,
		};

		Object.keys(attributes).forEach(key => textbox.setAttribute(key, attributes[key]));

		list = listbox.init({
			datalist: target,
			label,
			parent: wrapper
		});

		target.parentNode.removeChild(target);

		['keydown', 'keyup', 'click', 'blur'].forEach(e => textbox.addEventListener(e, handleEvents));

		// Bind events dispatched from listbox
		['change', 'display'].forEach(e => wrapper.addEventListener(e, handleEvents));
	};

	const isPrintable = str => str.length === 1 && str.match(/\S/);

	const handleEvents = {
		handleEvent(event) {
			if (event.type in this ) {
				this[event.type](event);
			}
		},
		display() {
			textbox.setAttribute('aria-expanded', !event.detail.hidden);
		},
		change(event) {
			if( event.detail ) {
				const { id, value } = event.detail;
				textbox.setAttribute('aria-activedescendant', id);
				if ( value ) {
					textbox.value = value;
				}
			}
		},
		click() {
			list.toggle();
		},
		blur() {
			list.clear();
			textbox.focus();
			window.setTimeout(() => list.toggle(false), 10);
		},
		keyup(event) {
			if( ['Delete', 'Backspace'].indexOf(event.key) > -1 || isPrintable(event.key) ) {
				list.filter(textbox.value);
				list.toggle(true);
			}
		},
		keydown(event) {
			const key = event.key.replace(/(Arrow|ape)/, '');

			const actions = {
				Enter() {
					event.preventDefault();
					list.select();
					list.toggle(false);
					list.filter(textbox.value);
				},
				Esc(){
					textbox.value = '';
					list.clear();
					list.toggle(false);
				},
				Down(){
					event.preventDefault();
					if( list.hidden() ) {
						list.toggle();
					}
					list.select(true);
				},
				Up() {
					event.preventDefault();
					if( list.hidden() ) {
						list.toggle();
					}
					list.select(false);
				}
			};

			actions[key] && actions[key]();
		},
	};

	return { init };
})();
