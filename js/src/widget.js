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
            .appendTo(slider.elem);
        this.elem.data('slider-handle', this);
        this.index = index;
        this.value = value;
        this.selected = false;

        this._on_start = this._on_start.bind(this);
        this._on_move = this._on_move.bind(this);
        this._on_end = this._on_end.bind(this);
        this._on_scroll = this._on_scroll.bind(this);
        this._on_key = this._on_key.bind(this);
        this._on_resize = this._on_resize.bind(this);

        this.elem.on('mousedown touchstart', this._on_start);
        $(window).on('resize', this._on_resize);
    }

    get value() {
        return this._value;
    }

    set value(val) {
        let slider = this.slider,
            min = slider.min,
            max = slider.max;
        val = this._align_value(val, min, slider.step);
        val = this._prevent_overlap(val);
        if (val < min) {
            val = min;
        } else if (val > max) {
            val = max;
        }
        let pos = slider.slider_len * ((val - min) / (max - min));
        pos = slider.vertical ? slider.elem.height() - pos : pos;
        this.elem.css(`${slider.dir_attr}`, `${pos}px`);
        this._pos = pos;
        this._value = val;
    }

    get pos() {
        return this._pos;
    }

    set pos(pos) {
        let slider = this.slider,
            min = slider.min,
            max = slider.max,
            len = slider.slider_len;
        pos = slider.vertical ? slider.elem.height() - pos : pos;
        this.value = Math.round((max - min) * (pos / len) + min);
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
            $(document).off('keydown', this._on_key).on('keydown', this._on_key);
        } else {
            elem.removeClass('active').css('z-index', 1);
            slider.elem.off('mousewheel wheel', this._on_scroll);
            $(document).off('keydown', this._on_key);
        }
        this._selected = selected;
    }

    unload() {
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
        $(document).on('mousemove touchmove', this._on_move);
        $(document).one('mouseup touchend', this._on_end);
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
        $(document).off('mousemove touchmove', this._on_move);
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

    _align_value(value, min, step) {
        if (!step) {
            return value;
        }
        value -= min;
        let offset = value % step;
        value = Math.floor(value / step) * step;
        if (offset >= step / 2) {
            value += step;
        }
        return value + min;
    }

    _prevent_overlap(value) {
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
        this.len_attr = slider.vertical ? 'height' : 'width';
        let thickness_attr = slider.vertical ? 'width' : 'height';
        this.elem = $('<div />')
            .addClass('slider-bg')
            .css(thickness_attr, slider.thickness)
            .appendTo(slider.elem);
        this.range_elem = null;
        let range = slider.range;
        if (range) {
            this.range_elem = $('<div />')
                .addClass('slider-value-track')
                .css(thickness_attr, slider.thickness)
                .appendTo(slider.elem);
            if (range === 'max') {
                if (slider.vertical) {
                    this.range_elem.css('bottom', 0).css('top', 'unset');
                } else {
                    this.range_elem.css('right', 0);
                }
            }
        }
        this.update = this.update.bind(this);
        slider.elem.on('slide', this.update);
        $(window).on('resize', this.update);
        this.update();
    }

    unload() {
        $(window).off('resize', this.update);
    }

    update() {
        let slider = this.slider,
            range = slider.range;
        if (!range) {
            return;
        }
        let handles = slider.handles,
            pos = handles[0].pos,
            elem = this.range_elem,
            len_attr = this.len_attr;
        if (range === true) {
            elem.css(`${len_attr}`, handles[1].pos - handles[0].pos)
                .css(`${slider.dir_attr}`, `${pos}px`);
        } else if (range === 'min') {
            elem.css(`${len_attr}`, pos);
        } else if (range === 'max') {
            elem.css(`${len_attr}`, slider.slider_len - pos);
        }
    }
}

export class Slider {

    constructor(elem, opts) {
        this.elem = elem;
        this.range = opts.range || false;
        this.handle_diameter = opts.handle_diameter || 20;
        this.thickness = opts.thickness || 8;
        this.min = opts.min || 0;
        this.max = opts.max || 100;
        this.step = opts.step || false;
        let scroll_step = opts.scroll_step || 1;
        this.scroll_step = opts.step || scroll_step;
        this.vertical = opts.orientation === 'vertical';
        this.dir_attr = this.vertical ? 'top' : 'left';
        if (this.vertical) {
            elem.addClass('slider-vertical')
                .css('width', this.handle_diameter)
                .css('height', opts.height);
        } else {
            elem.css('height', this.handle_diameter);
        }
        let value;
        if (this.range === true) {
            value = this._value = opts.value || [0, 0];
            this.handles = [
                new SliderHandle(this, 0, value[0]),
                new SliderHandle(this, 1, value[1])
            ];
        } else {
            value = this._value = opts.value || 0;
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
        return this._value;
    }

    set value(value) {
        if (!value instanceof Array) {
            value = [value];
        }
        for (let i in this.handles) {
            this.handles[i] = value[i];
        }
        this._value = value;
    }

    get offset() {
        let offset = this.elem.offset();
        return this.vertical ? offset.top : offset.left;
    }

    get slider_len() {
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

    unload() {
        this.track.unload();
        for (let handle of this.handles) {
            handle.unload();
        }
    }

    unselect_handles() {
        $('div.slider-handle').each(function() {
            $(this).data('slider-handle').selected = false;
        });
    }

    pos_from_evt(e) {
        let offset = this.offset,
            vertical = this.vertical;
        if (e.type === 'mousedown' || e.type === 'mousemove') {
            return (vertical ? e.pageY : e.pageX) - offset;
        }
        return (vertical ? e.touches[0].pageY : e.touches[0].pageX) - offset;
    }

    _on_down(e) {
        let index = 0,
            handle;
        if (this.range === true) {
            let distances = [];
            for (let handle of this.handles) {
                let e_x = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX,
                    e_y = e.type === 'mousedown' ? e.pageY : e.touches[0].pageY,
                    offset = handle.elem.offset();
                let distance = Math.hypot(
                    offset.left - parseInt(e_x),
                    offset.top - parseInt(e_y)
                );
                distances.push(parseInt(distance));
            }
            index = distances.indexOf(Math.min(...distances));
        }
        handle = this.handles[index];
        handle.selected = true;
        handle.pos = this.pos_from_evt(e);
        this.track.update();
        this.trigger('change', handle);
    }
}

export class SliderWidget {

    static initialize(context) {
        $('.yafowil_slider', context).each(function() {
            let elem = $(this);
            let id = $('input.slider_value', elem).attr('id');
            if (id && id.includes('TEMPLATE')) {
                return;
            }
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
            },
            {
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
        this.update_value = this.update_value.bind(this);
        this.slider = new Slider($('div.slider', elem), opts);
        this.slider.on('change slide stop', this.update_value);
    }

    update_value(e) {
        let handle = e.widget,
            index = handle.index,
            element = this.elements[index];
        element.input.attr('value', handle.value);
        element.label.html(handle.value);
    }
}

//////////////////////////////////////////////////////////////////////////////
// yafowil.widget.array integration
//////////////////////////////////////////////////////////////////////////////

function slider_on_array_add(inst, context) {
    SliderWidget.initialize(context, true);
}

$(function() {
    if (yafowil_array === undefined) {
        return;
    }
    yafowil_array.on_array_event('on_add', slider_on_array_add);
});
