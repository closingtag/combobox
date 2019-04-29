const combobox = (() => {
	let list, textbox;

	const keyCodes = {
		'BACKSPACE': 8,
		'DEL': 46,
		'RETURN': 13,
		'ESC': 27,
		'LEFT': 37,
		'UP': 38,
		'RIGHT': 39,
		'DOWN': 40
	};

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
		textbox.setAttribute('aria-autocompletelist', 'list');

		textbox.setAttribute('role', 'combobox');
		textbox.setAttribute('autocomplete', 'off');
		textbox.setAttribute('aria-expanded', 'false');
		textbox.setAttribute('aria-owns', target.id);
		textbox.setAttribute('aria-haspopup', true);

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
			if( [keyCodes.DEL, keyCodes.BACKSPACE].indexOf(event.keyCode) > -1 || isPrintable(event.key) ) {
				list.filter(textbox.value);
				list.toggle(true);
			}
		},
		keydown(event) {
			const actions = {
				[keyCodes.RETURN]() {
					event.preventDefault();
					list.select();
					list.toggle(false);
					list.filter(textbox.value);
				},
				[keyCodes.ESC](){
					textbox.value = '';
					list.clear();
					list.toggle(false);
				},
				[keyCodes.DOWN](){
					event.preventDefault();
					if( list.hidden() ) {
						list.toggle();
					}
					list.select(true);
				},
				[keyCodes.UP]() {
					event.preventDefault();
					if( list.hidden() ) {
						list.toggle();
					}
					list.select(false);
				}
			};

			actions[event.keyCode] && actions[event.keyCode]();
		},
	};

	return { init };
})();
