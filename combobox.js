const listbox = (() => {
    let list, option;
    const options = [];
    
    const clear = () => {
        if ( option ) {
            option.removeAttribute('aria-selected');
            option = null;
        }
        
        options.forEach(option => option.hidden = false);
    };

        const filter = term => {
    
            clear();
    
            if( term ) {
                options
                    .filter(option => !option.textContent.toLowerCase().startsWith(term.toLowerCase()))
                    .forEach(option => option.hidden = true);
            }
        };

    const toggle = toggle => {            
        const current = list.hidden;
        list.hidden = typeof toggle !== 'undefined' ? !toggle : !current;
        dispatch('display', { hidden: list.hidden });
    };

    const dispatch = (type, detail) => {
        const event = new CustomEvent(type, { detail });
        list.parentNode.dispatchEvent(event);
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

    const click = event => {
        if( options.indexOf(event.target) > -1 ) {
            option && option.removeAttribute('aria-selected');
            option = event.target;
            option.setAttribute('aria-selected', true);
            dispatch('change', { id: option.id, value: option.textContent });
        }
    };

    const hidden = () => list.hidden;
    
    const init = ({datalist, label, parent}) => {
        list = document.createElement('ul');
        list.setAttribute('role', 'listbox');
        
        Array.from(datalist.children).forEach((option, index) => {
            const li = document.createElement('li');
            li.textContent = option.value;
            li.id = `option-${datalist.id}-index`;
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
                    blur() {
                        list.clear();
                        textbox.focus();
                        window.setTimeout(() => list.toggle(false), 10);
                    },
                    click() {
                        list.toggle();
                    },

        };

    return { init };
})();

document.querySelectorAll('input[list]').forEach(combobox.init);
