var yafowil_slider = (function (exports, $) {
    'use strict';

    function lookup_callback(path) {
        if (!path) {
            return null;
        }
        source = path.split('.');
        let cb = window, name;
        for (let idx in source) {
            name = source[idx];
            if (cb[name] === undefined) {
                throw "'" + name + "' not found.";
            }
            cb = cb[name];
        }
        return cb;
    }
    function transform(val, type, dim, min, max, step) {
        if (type === 'step') {
            let condition = min === 0 ? max - step / 2 : max - min / 2;
            val = val > condition ? max : step * parseInt(val / step);
            val = val <= min ? min : val;
        } else if (type === 'screen') {
            val = parseInt(dim * ((val - min) / (max - min)));
        } else if (type === 'range') {
            val = Math.ceil((max - min) * (val / dim) + min);
        }
        return val;
    }
    class SliderHandle {
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
            let slider = this.slider;
            if (val < slider.min) {
                val = slider.min;
            } else if (val > slider.max) {
                val = slider.max;
            }
            val = this._prevent_overlap(val, 'value');
            let pos = this._transform(val, 'screen');
            this.elem.css(`${slider.dir_attr}`, `${pos}px`);
            this._pos = pos;
            this._value = val;
        }
        get pos() {
            return this._pos;
        }
        set pos(pos) {
            let slider = this.slider;
            if (pos > slider.slider_dim) {
                pos = slider.slider_dim;
            } else if (pos < 0) {
                pos = 0;
            }
            pos = this._prevent_overlap(pos, 'pos');
            let val;
            if (slider.step) {
                val = this._transform(this._transform(pos, 'range'), 'step');
            } else {
                val = this._transform(pos, 'range');
            }
            this.elem.css(`${slider.dir_attr}`, `${pos}px`);
            this._pos = pos;
            this._value = val;
        }
        get selected() {
            return this._selected;
        }
        set selected(selected) {
            let elem = this.elem,
                slider = this.slider;
            if (selected) {
                slider.unselect_handles();
                elem.addClass('active').css('z-index', 10);
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
            this.pos = this._transform(this.value, 'screen');
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
                increase = vertical ? e.key === 'ArrowDown' : e.key === 'ArrowRight',
                decrease = vertical ? e.key === 'ArrowUp' : e.key === 'ArrowLeft';
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
        _transform(val, type) {
            let slider = this.slider;
            return transform(
                val,
                type,
                slider.slider_dim,
                slider.min,
                slider.max,
                slider.step
            );
        }
        _prevent_overlap(value, attr) {
            let slider = this.slider;
            if (slider.range_true) {
                let handles = slider.handles,
                    index = this.index;
                for (let i in handles) {
                    let handle = handles[i],
                        val = handle[attr];
                    if (value >= val && i > index || value <= val && i < index) {
                        value = val;
                    }
                }
            }
            return value;
        }
    }
    class SliderTrack {
        constructor(slider) {
            this.slider = slider;
            this.dim_attr = slider.vertical ? 'height' : 'width';
            let thickness_attr = slider.vertical ? 'width' : 'height';
            this.bg_elem = $('<div />')
                .addClass('slider-bg')
                .css(thickness_attr, slider.thickness)
                .appendTo(slider.elem);
            this.track_elem = $('<div />')
                .addClass('slider-value-track')
                .css(thickness_attr, slider.thickness)
                .appendTo(slider.elem);
            if (slider.range_max) {
                if (slider.vertical) {
                    this.track_elem.css('bottom', 0).css('top', 'unset');
                } else {
                    this.track_elem.css('right', 0);
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
                handles = slider.handles,
                pos = handles[0].pos,
                elem = this.track_elem,
                dim_attr = this.dim_attr;
            if (slider.range_true) {
                let dim = handles[1].pos - handles[0].pos;
                elem.css(`${dim_attr}`, dim)
                    .css(`${slider.dir_attr}`, `${pos}px`);
            } else if (slider.range_max) {
                elem.css(`${dim_attr}`, slider.slider_dim - pos);
            } else {
                elem.css(`${dim_attr}`, pos);
            }
        }
    }
    class Slider {
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
            if (this.range_true) {
                this.value = opts.value || [0, 0];
                this.handles = [
                    new SliderHandle(this, 0, this.value[0]),
                    new SliderHandle(this, 1, this.value[1])
                ];
            } else {
                this.value = opts.value || 0;
                this.handles = [new SliderHandle(this, 0, this.value)];
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
        get range_max() {
            return this.range === 'max';
        }
        get range_true() {
            return this.range === true;
        }
        get offset() {
            let offset = this.elem.offset();
            return this.vertical ? offset.top : offset.left;
        }
        get slider_dim() {
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
            if (this.range_true) {
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
    class SliderWidget {
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
                },
                {
                    input: $('input.upper_value', elem),
                    label: $('span.upper_value', elem)
                }];
                opts.value = [
                    parseInt(this.elements[0].input.val()),
                    parseInt(this.elements[1].input.val())
                ];
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

    $(function() {
        if (window.ts !== undefined) {
            ts.ajax.register(SliderWidget.initialize, true);
        } else if (window.bdajax !== undefined) {
            bdajax.register(SliderWidget.initialize, true);
        } else {
            SliderWidget.initialize();
        }
    });

    exports.Slider = Slider;
    exports.SliderWidget = SliderWidget;
    exports.lookup_callback = lookup_callback;
    exports.transform = transform;

    Object.defineProperty(exports, '__esModule', { value: true });


    window.yafowil = window.yafowil || {};
    window.yafowil.slider = exports;


    return exports;

})({}, jQuery);
