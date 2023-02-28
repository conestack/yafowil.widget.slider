import $ from 'jquery';

export function lookup_callback(path) {
    if (!path) {
        return null;
    }
    let source = path.split('.'),
        cb = window,
        name;
    for (const idx in source) {
        name = source[idx];
        if (cb[name] === undefined) {
            throw "'" + name + "' not found.";
        }
        cb = cb[name];
    }
    return cb;
}

export class SliderHandle {

    constructor(slider, index, value) {
        this.slider = slider;
        let h_diam = slider.handle_diameter;
        this.elem = $('<div />')
            .addClass('slider-handle')
            .width(h_diam)
            .height(h_diam)
            .appendTo(slider.elem)
            .data('slider-handle', this);
        this.index = index;
        this.value = value;

        this._on_start = this._on_start.bind(this);
        this._on_move = this._on_move.bind(this);
        this._on_end = this._on_end.bind(this);
        this._on_scroll = this._on_scroll.bind(this);
        this._on_key = this._on_key.bind(this);
        this._on_resize = this._on_resize.bind(this);

        this.selected = false;

        this.elem.on('mousedown touchstart', this._on_start);
        $(window).on('resize', this._on_resize);

        this._force_value = false;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        let slider = this.slider,
            min = slider.min,
            max = slider.max,
            vertical = slider.vertical;
        value = this._align_value(value);
        value = this._prevent_overlap(value);
        if (value < min) {
            value = min;
        } else if (value > max) {
            value = max;
        }
        let pos = slider.size * ((value - min) / (max - min));
        pos = vertical ? slider.elem.height() - pos : pos;
        this.elem.css(`${vertical ? 'top' : 'left'}`, `${pos}px`);
        this._pos = pos;
        this._value = value;
    }

    get pos() {
        return this._pos;
    }

    set pos(pos) {
        let slider = this.slider,
            min = slider.min,
            max = slider.max,
            len = slider.size;
        pos = slider.vertical ? slider.elem.height() - pos : pos;
        this.value = (max - min) * (pos / len) + min;
    }

    get selected() {
        return this._selected;
    }

    set selected(selected) {
        let elem = this.elem,
            slider = this.slider;
        if (selected) {
            slider.unselect_handles();
            elem.addClass('active').css('z-index', 10)
            slider.elem.on('mousewheel wheel', this._on_scroll);
            $(document).on('keydown', this._on_key);
        } else {
            elem.removeClass('active').css('z-index', 1);
            slider.elem.off('mousewheel wheel', this._on_scroll);
            $(document).off('keydown', this._on_key);
        }
        this._selected = selected;
    }

    destroy() {
        $(window).off('resize', this._on_resize);
        this.selected = false;
    }

    _on_resize() {
        this.value = this.value;
    }

    _on_start(e) {
        e.preventDefault();
        e.stopPropagation();
        this.selected = true;
        this.slider.trigger('start', this);
        $(document)
            .on('mousemove touchmove', this._on_move)
            .on('mouseup touchend', this._on_end);
    }

    _on_move(e) {
        e.preventDefault();
        e.stopPropagation();
        let slider = this.slider;
        this.pos = slider.pos_from_evt(e);
        slider.trigger('slide', this);
    }

    _on_end(e) {
        e.preventDefault();
        $(document)
            .off('mousemove touchmove', this._on_move)
            .off('mouseup touchend', this._on_end);
        this.slider.trigger('stop', this);
    }

    _on_scroll(e) {
        e.preventDefault();
        let evt = e.originalEvent,
            slider = this.slider,
            step = slider.scroll_step,
            value = this.value;
        if (evt.deltaY > 0) {
            value = this.value + step;
        } else if (evt.deltaY < 0) {
            value = this.value - step;
        }
        this.value = value;
        slider.track.update();
        slider.trigger('change', this);
    }

    _on_key(e) {
        let value = this.value,
            slider = this.slider,
            step = slider.scroll_step,
            vertical = slider.vertical,
            increase = vertical ? e.key === 'ArrowUp' : e.key === 'ArrowRight',
            decrease = vertical ? e.key === 'ArrowDown' : e.key === 'ArrowLeft';
        if (increase) {
            e.preventDefault();
            value = this.value + step;
        } else if (decrease) {
            e.preventDefault();
            value = this.value - step;
        } else {
            return;
        }
        this.value = value;
        slider.track.update();
        slider.trigger('change', this);
    }

    _align_value(value) {
        let slider = this.slider,
            min = slider.min,
            step = slider.step;
        if (step) {
            value -= min;
            let offset = value % step;
            value = Math.floor(value / step) * step;
            if (offset >= step / 2) {
                value += step;
            }
            value += min;
        }
        return Math.round(value);
    }

    _prevent_overlap(value) {
        if (this._force_value) {
            return value;
        }
        let slider = this.slider,
            handles = slider.handles,
            index = this.index;
        if (handles === undefined) {
            return value;
        }
        if (index > 0) {
            let prev = handles[index - 1];
            if (value < prev.value) {
                value = prev.value;
            }
        }
        if (index < handles.length - 1) {
            let next = handles[index + 1];
            if (value > next.value) {
                value = next.value;
            }
        }
        return value;
    }
}

class SliderTrack {

    constructor(slider) {
        this.slider = slider;
        let vertical = slider.vertical,
            thickness = slider.thickness,
            thickness_attr = vertical ? 'width' : 'height';
        this.elem = $('<div />')
            .addClass('slider-bg')
            .css(thickness_attr, thickness)
            .appendTo(slider.elem);
        this.range_elem = null;
        let range = slider.range;
        if (range) {
            let range_elem = this.range_elem = $('<div />')
                .addClass('slider-value-track')
                .css(thickness_attr, thickness)
                .appendTo(slider.elem);
            if (range === 'min' && vertical) {
                range_elem.css('bottom', 0).css('top', 'auto');
            } else if (range === 'max' && !vertical) {
                range_elem.css('right', 0);
            }
        }
        this.update = this.update.bind(this);
        slider.elem.on('slide', this.update);
        $(window).on('resize', this.update);
        this.update();
    }

    destroy() {
        $(window).off('resize', this.update);
    }

    update() {
        let slider = this.slider,
            range = slider.range;
        if (!range) {
            return;
        }
        let handles = slider.handles,
            pos_0 = handles[0].pos,
            pos_1 = range === true ? handles[1].pos : null,
            elem = this.range_elem;
        if (slider.vertical) {
            if (range === true) {
                elem.css('height', pos_0 - pos_1).css('top', `${pos_1}px`);
            } else if (range === 'min') {
                elem.css('height', slider.size - pos_0);
            } else if (range === 'max') {
                elem.css('height', pos_0);
            }
        } else {
            if (range === true) {
                elem.css('width', pos_1 - pos_0).css('left', `${pos_0}px`);
            } else if (range === 'min') {
                elem.css('width', pos_0);
            } else if (range === 'max') {
                elem.css('width', slider.size - pos_0);
            }
        }
    }
}

export class Slider {

    constructor(elem, opts) {
        if (window.ts !== undefined) {
            ts.ajax.attach(this, elem);
        }
        this.elem = elem;
        this.range = opts.range || false;
        this.handle_diameter = opts.handle_diameter || 20;
        this.thickness = opts.thickness || 8;
        this.min = opts.min || 0;
        this.max = opts.max || 100;
        this.step = opts.step || false;
        this.scroll_step = opts.step || opts.scroll_step || 1;
        this.vertical = opts.orientation === 'vertical';
        if (this.vertical) {
            elem.addClass('slider-vertical')
                .css('width', this.handle_diameter)
                .css('height', opts.height);
        } else {
            elem.css('height', this.handle_diameter);
        }
        let value;
        if (this.range === true) {
            value = opts.value || [0, 0];
            this.handles = [
                new SliderHandle(this, 0, value[0]),
                new SliderHandle(this, 1, value[1])
            ];
        } else {
            value = opts.value || 0;
            this.handles = [new SliderHandle(this, 0, value)];
        }
        this.track = new SliderTrack(this);
        this._on_down = this._on_down.bind(this);
        this.elem.on('mousedown touchstart', this._on_down);
        for (let evt of ['change', 'create', 'slide', 'start', 'stop']) {
            if (opts[evt]) {
                this.elem.on(evt, opts[evt]);
            }
        }
        this.trigger('create', this);
    }

    get value() {
        let handles = this.handles;
        if (handles.length == 1) {
            return handles[0].value;
        }
        let value = [];
        for (let handle of handles) {
            value.push(handle.value);
        }
        return value;
    }

    set value(value) {
        if (!(value instanceof Array)) {
            value = [value];
        }
        let handles = this.handles;
        if (value.length !== handles.length) {
            throw new Error('Invalid value size');
        }
        let prev = 0;
        for (let val of value) {
            if (val < this.min || val > this.max) {
                throw new Error('Value out of bounds');
            }
            if (prev > val) {
                let msg = 'Single values in range must be in ascending order';
                throw new Error(msg);
            }
            prev = val;
        }
        let handle;
        for (let i in handles) {
            handle = handles[i];
            handle._force_value = true;
            handle.value = value[i];
            handle._force_value = false;
        }
        this.track.update();
    }

    get size() {
        let elem = this.elem;
        return this.vertical ? elem.height() : elem.width();
    }

    on(names, handle) {
        this.elem.on(names, handle);
    }

    off(names, handle) {
        this.elem.off(names, handle);
    }

    trigger(name, widget) {
        this.elem.trigger(new $.Event(name, {widget: widget}));
    }

    destroy() {
        this.track.destroy();
        for (let handle of this.handles) {
            handle.destroy();
        }
    }

    unselect_handles() {
        $('div.slider-handle').each(function() {
            $(this).data('slider-handle').selected = false;
        });
    }

    pos_from_evt(e) {
        let vertical = this.vertical,
            e_offset = this.elem.offset(),
            offset = vertical ? e_offset.top : e_offset.left;
        if (e.type === 'mousedown' || e.type === 'mousemove') {
            return (vertical ? e.pageY : e.pageX) - offset;
        }
        return (vertical ? e.touches[0].pageY : e.touches[0].pageX) - offset;
    }

    _on_down(e) {
        let handle;
        if (this.range === true) {
            handle = this._closest_handle(this.pos_from_evt(e));
        } else {
            handle = this.handles[0];
        }
        handle.selected = true;
        handle.pos = this.pos_from_evt(e);
        this.track.update();
        this.trigger('change', handle);
    }

    _closest_handle(pos) {
        let handles = this.handles,
            vertical = this.vertical,
            first = vertical ? handles[handles.length - 1] : handles[0],
            last = vertical ? handles[0] : handles[handles.length - 1];
        if (pos <= first.pos) {
            return first;
        } else if (pos >= last.pos) {
            return last;
        }
        let distances = [];
        for (let handle of handles) {
            distances.push(Math.abs(pos - handle.pos));
        }
        return handles[distances.indexOf(Math.min(...distances))];
    }
}

export class SliderWidget {

    static initialize(context) {
        $('.yafowil_slider', context).each(function() {
            let elem = $(this);
            new SliderWidget(elem, {
                min: elem.data('min'),
                max: elem.data('max'),
                step: elem.data('step'),
                scroll_step: elem.data('scroll_step'),
                range: elem.data('range'),
                handle_diameter: elem.data('handle_diameter'),
                thickness: elem.data('thickness'),
                orientation: elem.data('orientation'),
                height: elem.data('height'),
                change: lookup_callback(elem.data('change')),
                create: lookup_callback(elem.data('create')),
                slide: lookup_callback(elem.data('slide')),
                start: lookup_callback(elem.data('start')),
                stop: lookup_callback(elem.data('stop'))
            });
        });
    }

    constructor(elem, opts) {
        elem.data('yafowil-slider', this);
        this.elem = elem;
        this.range = opts.range;
        if (this.range === true) {
            this.elements = [{
                input: $('input.lower_value', elem),
                label: $('span.lower_value', elem)
            }, {
                input: $('input.upper_value', elem),
                label: $('span.upper_value', elem)
            }];
            opts.value = [
                parseInt(this.elements[0].input.val()),
                parseInt(this.elements[1].input.val())
            ]
        } else {
            this.elements = [{
                input: $('input.slider_value', elem),
                label: $('span.slider_value', elem)
            }];
            opts.value = parseInt(this.elements[0].input.val());
        }
        this.slider = new Slider($('div.slider', elem), opts);
        this.slider.on('change slide stop', e => {
            this._update_value(e.widget);
        });
    }

    get value() {
        return this.slider.value;
    }

    set value(value) {
        let slider = this.slider;
        slider.value = value;
        for (let handle of slider.handles) {
            this._update_value(handle);
        }
    }

    _update_value(handle) {
        let index = handle.index,
            element = this.elements[index];
        element.input.attr('value', handle.value);
        element.label.html(handle.value);
    }
}
