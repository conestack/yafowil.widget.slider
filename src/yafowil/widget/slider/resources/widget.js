(function (exports, $) {
    'use strict';

    function transform(val, type, dim, min, max, step) {
        if (type === 'step') {
            let condition = min === 0 ? max - step / 2 : max - min / 2;
            val = val > condition ? max : step * parseInt(val / step);
            val = val <= min ? min : val;
        } else if (type === 'screen') {
            val = parseInt(dim * ((val - min) / (max - min)));
        } else if (type === 'range') {
            let value = Math.ceil((max - min) * (val / dim) + min);
            val = parseInt(value);
        }
        return val;
    }
    class SliderHandle {
        constructor(slider, input, span) {
            this.slider = slider;
            this.elem = $('<div />')
                .addClass('slider-handle')
                .width(this.slider.handle_diameter)
                .height(this.slider.handle_diameter);
            this.slider.slider_elem.append(this.elem);
            this.input_elem = input;
            this.span_elem = span;
            this.value = (this.input_elem.val() !== undefined) ?
                         parseInt(this.input_elem.val()) : 0;
            this.pos = this.transform(this.value, 'screen');
            this.vertical = this.slider.vertical;
            this.step = this.slider.step;
            this.scroll_step = this.slider.scroll_step;
            this.selected = false;
            this.elem.css(`${this.slider.dir_attr}`, this.pos);
            this.slide_start = this.slide_start.bind(this);
            this.handle_drag = this.handle_drag.bind(this);
            this.resize_handle = this.resize_handle.bind(this);
            this.scroll_handle = this.scroll_handle.bind(this);
            this.key_handle = this.key_handle.bind(this);
            this.elem.on('mousedown touchstart', this.slide_start);
            $(window).on('resize', this.resize_handle);
        }
        get offset() {
            return this.slider.offset;
        }
        get value() {
            return this._value;
        }
        get selected() {
            return this._selected;
        }
        set selected(selected) {
            if (selected) {
                $('.yafowil_slider').each(function() {
                    for (let handle of $(this).data('slider_widget').handles) {
                        handle.selected = false;
                    }
                });
                this.elem.addClass('active');
                this.slider.elem.on('mousewheel wheel', this.scroll_handle);
                $(document).off('keydown').on('keydown', this.key_handle);
            } else {
                this.elem.removeClass('active');
                this.slider.elem.off('mousewheel wheel', this.scroll_handle);
                $(document).off('keydown', this.key_handle);
            }
            this._selected = selected;
        }
        set value(value) {
            if (value < this.slider.min || value > this.slider.max) return;
            let index = this.slider.handles.indexOf(this);
            if (this.slider.range_true && index >= 0) {
                for (let i in this.slider.handles) {
                    let handle = this.slider.handles[i];
                    if (value >= handle.value && i > index ||
                        value <= handle.value && i < index) {
                            value = handle.value;
                    }
                }
            }
            this.input_elem.attr('value', value);
            this.span_elem.text(value);
            if (value !== this.value) {
                let slidechange = new $.Event('slidechange', {
                    handle: this.elem,
                    handleIndex: index,
                    value: value
                });
                this.slider.elem.trigger(slidechange);
            }
            this._value = value;
        }
        get pos() {
            return this._pos;
        }
        set pos(pos) {
            let index = this.slider.handles.indexOf(this);
            if (this.slider.range_true && index >= 0) {
                for (let i in this.slider.handles) {
                    let handle = this.slider.handles[i];
                    if (pos >= handle.pos && i > index ||
                        pos <= handle.pos && i < index) {
                            pos = handle.pos;
                    }
                }
            }
            if (pos >= this.slider.slider_dim) {
                pos = this.slider.slider_dim;
            } else if (pos <= 0) {
                pos = 0;
            }
            this.elem.css(`${this.slider.dir_attr}`, `${pos}px`);
            this._pos = pos;
        }
        unload() {
            $(window).off('resize', this.resize_handle);
            this.selected = false;
        }
        resize_handle() {
            this.pos = this.transform(this.value, 'screen');
        }
        slide_start(event) {
            this.selected = true;
            event.preventDefault();
            event.stopPropagation();
            $('.slider-handle').css('z-index', 1);
            this.elem.css('z-index', 10);
            let slidestart = new $.Event('slidestart', {
                handle: this.elem,
                handleIndex: this.slider.handles.indexOf(this),
                value: this.value
            });
            this.slider.elem.trigger(slidestart);
            ['mousemove', 'touchmove'].forEach( evt =>
                document.addEventListener(evt, this.handle_drag, {passive:false})
            );
            ['mouseup', 'touchend'].forEach( evt =>
                document.addEventListener(evt, () => {
                    document.removeEventListener('touchmove', this.handle_drag);
                    document.removeEventListener('mousemove', this.handle_drag);
                    let slidestop = new $.Event('slidestop', {
                        handle: this.elem,
                        handleIndex: this.slider.handles.indexOf(this),
                        value: this.value
                    });
                    this.slider.elem.trigger(slidestop);
                }, false)
            );
        }
        scroll_handle(e) {
            e.preventDefault();
            let evt = e.originalEvent,
                value = this.value;
            if (evt.deltaY > 0) value = parseInt(this.value) + this.scroll_step;
            else if (evt.deltaY < 0) value = parseInt(this.value) - this.scroll_step;
            this.pos = this.transform(value, 'screen');
            this.value = value;
            this.slider.slider_track.set_value(e);
        }
        key_handle(e) {
            let value = this.value,
                increase = this.vertical ? e.key === 'ArrowDown' : e.key === 'ArrowRight',
                decrease = this.vertical ? e.key === 'ArrowUp' : e.key === 'ArrowLeft';
            if (increase) {
                e.preventDefault();
                value = parseInt(this.value) + this.scroll_step;
            } else if (decrease) {
                e.preventDefault();
                value = parseInt(this.value) - this.scroll_step;
            }
            this.pos = this.transform(value, 'screen');
            this.value = value;
            this.slider.slider_track.set_value(e);
        }
        handle_drag(e) {
            e.preventDefault();
            e.stopPropagation();
            if (e.type === 'mousemove') {
                this.pos = (this.vertical ? e.pageY : e.pageX) - this.offset;
            } else {
                this.pos =
                    (this.vertical ? e.touches[0].pageY : e.touches[0].pageX)
                    - this.offset;
            }
            if (this.slider.step) {
                let val = this.transform(this.pos, 'range');
                this.value = this.transform(val, 'step');
                this.pos = this.transform(this.value, 'screen');
            } else {
                this.value = this.transform(this.pos, 'range');
            }
            const event = new $.Event('slide', {
                handle: this.elem,
                handleIndex: this.slider.handles.indexOf(this),
                value: this.value,
                values: [
                    this.slider.handles[0].value,
                    this.slider.handles[1] ? this.slider.handles[1].value : null
                ]
            });
            this.slider.elem.trigger(event);
        }
        transform(val, type) {
            let min = this.slider.min,
                max = this.slider.max,
                step = this.slider.step,
                dim = this.slider.slider_dim;
            let value = transform(val, type, dim, min, max, step);
            return value;
        }
    }
    class SliderTrack {
        constructor(slider) {
            this.slider = slider;
            this.track_elem = $('<div />')
                .addClass('slider-value-track');
            this.bg_elem = $('<div />')
                .addClass('slider-bg');
            this.slider.slider_elem
                .append(this.bg_elem)
                .append(this.track_elem);
            if (this.slider.vertical) {
                this.track_elem.css('width', this.slider.thickness);
                this.bg_elem.css('width', this.slider.thickness);
            } else {
                this.track_elem.css('height', this.slider.thickness);
                this.bg_elem.css('height', this.slider.thickness);
            }
            if (this.slider.range_max) {
                if (this.slider.vertical) {
                    this.track_elem
                        .css('bottom', 0)
                        .css('top', 'unset');
                } else {
                    this.track_elem.css('right', 0);
                }
            }
            this.set_value();
            this.set_value = this.set_value.bind(this);
            this.slider.elem.on('slide', this.set_value);
            $(window).on('resize', this.set_value);
        }
        unload() {
            $(window).off('resize', this.set_value);
        }
        set_value(e) {
            let value = this.slider.handles[0].pos;
            if (this.slider.range_true) {
                let dimension = this.slider.handles[1].pos - this.slider.handles[0].pos;
                this.track_elem
                    .css(`${this.slider.dim_attr}`, dimension)
                    .css(`${this.slider.dir_attr}`, `${value}px`);
            } else if (this.slider.range_max) {
                this.track_elem.css(`${this.slider.dim_attr}`, this.slider.slider_dim - value);
            } else {
                this.track_elem.css(`${this.slider.dim_attr}`, value);
            }
        }
    }
    class SliderWidget {
        static initialize(context) {
            $('.yafowil_slider', context).each(function() {
                let elem = $(this);
                let options = elem.data();
                new SliderWidget(elem, options);
            });
        }
        constructor(elem, options) {
            elem.data('slider_widget', this);
            this.elem = elem;
            this.range = options.range ? options.range : false;
            this.handle_diameter = options.handle_diameter ? options.handle_diameter : 20;
            this.thickness = options.thickness ? options.thickness : 8;
            this.min = options.min ? options.min : 0;
            this.max = options.max ? options.max : 100;
            this.step = options.step ? options.step : false;
            let scroll_step = options.scroll_step ? options.scroll_step : 1;
            this.scroll_step = options.step ? options.step : scroll_step;
            this.slider_elem = $('div.slider', this.elem);
            this.vertical = options.orientation === 'vertical';
            this.dim_attr = this.vertical ? 'height' : 'width';
            this.dir_attr = this.vertical ? 'top' : 'left';
            if (this.vertical) {
                this.slider_elem.addClass('slider-vertical');
                this.slider_elem.css('width', this.handle_diameter);
                this.slider_elem.css('height', options.height);
            } else {
                this.slider_elem.css('height', this.handle_diameter);
            }
            this.handles = [];
            if (this.range_true) {
                this.handles.push(
                    new SliderHandle(
                        this,
                        $('input.lower_value', this.elem),
                        $('span.lower_value', this.elem)
                    )
                );
                this.handles.push(
                    new SliderHandle(
                        this,
                        $('input.upper_value', this.elem),
                        $('span.upper_value', this.elem)
                    )
                );
            } else {
                this.handles.push(
                    new SliderHandle(
                        this,
                        $('input.slider_value', this.elem),
                        $('span.slider_value', this.elem)
                    )
                );
            }
            this.slider_track = new SliderTrack(this);
            this.handle_singletouch = this.handle_singletouch.bind(this);
            this.slider_elem.on('mousedown touchstart', this.handle_singletouch);
            this.elem.trigger(new $.Event('slidecreate', {slider: this}));
        }
        get range_max() {
            return this.range === 'max';
        }
        get range_true() {
            return this.range === true;
        }
        get offset() {
            let offset = this.vertical ? this.slider_elem.offset().top :
                         this.elem.offset().left;
            return offset;
        }
        get slider_dim() {
            let dim = this.vertical ? this.slider_elem.height() : this.elem.width();
            return dim;
        }
        unload() {
            this.slider_track.unload();
            for (let handle of this.handles) {
                handle.unload();
            }
        }
        handle_singletouch(e) {
            let value, target;
            if (this.range_true) {
                let distances = [];
                for (let handle of this.handles) {
                    let evt_x = (e.type === 'mousedown') ? e.pageX : e.touches[0].pageX;
                    let evt_y = (e.type === 'mousedown') ? e.pageY : e.touches[0].pageY;
                    let distance = Math.hypot(
                        handle.elem.offset().left - parseInt(evt_x),
                        handle.elem.offset().top - parseInt(evt_y)
                    );
                    distances.push(parseInt(distance));
                }
                let closest = distances.indexOf(Math.min(...distances));
                target = this.handles[closest];
            } else {
                target = this.handles[0];
            }
            target.selected = true;
            if (e.type === 'mousedown') {
                value = (this.vertical ? e.pageY : e.pageX) - this.offset;
            } else {
                value =
                    (this.vertical ? e.touches[0].pageY : e.touches[0].pageX)
                    - this.offset;
            }
            if (this.step) {
                value = target.transform(value, 'range');
                target.value = target.transform(value, 'step');
                target.pos = target.transform(target.value, 'screen');
            } else {
                target.pos = value;
                target.value = target.transform(value, 'range');
            }
            this.slider_track.set_value(e);
        }
    }

    $(function() {
        if (window.ts !== undefined) {
            ts.ajax.register(SliderWidget.initialize, true);
        } else {
            SliderWidget.initialize();
        }
    });

    exports.SliderWidget = SliderWidget;
    exports.transform = transform;

    Object.defineProperty(exports, '__esModule', { value: true });


    if (window.yafowil === undefined) {
        window.yafowil = {};
    }

    window.yafowil.slider = exports;


    return exports;

})({}, jQuery);
