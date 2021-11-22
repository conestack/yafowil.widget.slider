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
            val = parseInt((max - min) * (val / dim) + min);
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
            this.value = this.input_elem.val() !== 'undefined' ?
                         this.input_elem.val() : 0;
            this.pos = this.transform(this.value, 'screen');
            this.vertical = this.slider.vertical;
            this.step = this.slider.step;
            this.elem.css(`${this.slider.dir_attr}`, this.pos);
            this.slide_start = this.slide_start.bind(this);
            this.handle_drag = this.handle_drag.bind(this);
            this.elem.on('mousedown touchstart', this.slide_start);
            this.resize_handle = this.resize_handle.bind(this);
            $(window).on('resize', this.resize_handle);
        }
        get offset() {
            return this.slider.offset;
        }
        get value() {
            return this._value;
        }
        set value(value) {
            this.input_elem.attr('value', value);
            this.span_elem.text(value);
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
                    if (i !== index && (
                        (pos >= handle.pos && i > index) ||
                        (pos <= handle.pos && i < index))
                    ) {
                        pos = handle.pos + 1;
                        this.value = handle.value;
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
        }
        resize_handle() {
            this.pos = this.transform(this.value, 'screen');
        }
        slide_start(event) {
            event.preventDefault();
            event.stopPropagation();
            $('.slider-handle').css('z-index', 1);
            this.elem.css('z-index', 10);
            ['mousemove', 'touchmove'].forEach( evt =>
                document.addEventListener(evt, this.handle_drag, {passive:false})
            );
            ['mouseup', 'touchend'].forEach( evt =>
                document.addEventListener(evt, () => {
                    document.removeEventListener('touchmove', this.handle_drag);
                    document.removeEventListener('mousemove', this.handle_drag);
                }, false)
            );
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
            this.value = this.transform(this.pos, 'range');
            if (this.slider.step) {
                this.value = this.transform(this.value, 'step');
                this.pos = this.transform(this.value, 'screen');
            }
            const event = new $.Event('drag');
            this.slider.slider_elem.trigger(event);
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
            this.slider.slider_elem.on('drag', this.set_value);
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
            this.thickness = options.thickness ? options.thickness : 15;
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
            this.mouseover_handle = this.mouseover_handle.bind(this);
            this.elem.on('mouseover', this.mouseover_handle);
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
        handle_singletouch(e) {
            let value, target;
            if (e.type === 'mousedown') {
                value = (this.vertical ? e.pageY : e.pageX) - this.offset;
            } else {
                value =
                    (this.vertical ? e.touches[0].pageY : e.touches[0].pageX)
                    - this.offset;
            }
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
        mouseover_handle(e) {
            let target;
            console.log('mouseover');
            if (this.range_true) {
                let distances = [];
                for (let handle of this.handles) {
                    let distance = Math.hypot(
                        handle.elem.offset().left - parseInt(e.pageX),
                        handle.elem.offset().top - parseInt(e.pageY)
                    );
                    distances.push(parseInt(distance));
                }
                let closest = distances.indexOf(Math.min(...distances));
                target = this.handles[closest];
                console.log(target);
            } else {
                target = this.handles[0];
            }
            this.elem.off('mousewheel wheel').on('mousewheel wheel', scroll_handle.bind(this));
            this.elem.on('keydown keyup', keydown_handle.bind(this));
            this.elem.on('mouseleave', () => {
                this.elem.off('mousewheel wheel');
                this.elem.off('keydown');
            });
            function keydown_handle(e) {
                e.preventDefault();
                console.log('AAAAAAAAAA');
            }
            function scroll_handle(e) {
                e.preventDefault();
                let evt = e.originalEvent;
                let value = target.value;
                let step = parseInt(this.scroll_step);
                if (typeof evt.deltaY === 'number') {
                    if(evt.deltaY > 0) {
                        value = parseInt(target.value) + step;
                    }
                    else if(evt.deltaY < 0) {
                        value = parseInt(target.value) - step;
                    }
                }
                if (value < this.min || value > this.max) {
                    return;
                }
                target.pos = target.transform(value, 'screen');
                target.value = value;
                this.slider_track.set_value(e);
            }
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
