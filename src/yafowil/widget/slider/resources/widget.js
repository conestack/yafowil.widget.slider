(function (exports, $) {
    'use strict';

    class SliderWidget {
        static initialize(context) {
            $('.yafowil_slider', context).each(function() {
                new SliderWidget($(this));
            });
        }
        constructor(elem) {
            this.elem = elem;
            this.options = this.elem.data();
            this.min = this.options.min ?? 0;
            this.max = this.options.max ?? 100;
            this.step = this.options.step ?? 1;
            this.slider_handle_dim = 20;
            this.slider_elem = $('div.slider', this.elem);
            this.vertical = this.options.orientation === 'vertical';
            this.dim = this.vertical ? 'height' : 'width';
            this.dir = this.vertical ? 'top' : 'left';
            if (this.vertical) {
                this.slider_elem.addClass('slider-vertical');
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
        }
        get range_max() {
            return this.options.range === 'max';
        }
        get range_true() {
            return this.options.range === true;
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
                    let distance = Math.hypot(
                        handle.elem.offset().left - parseInt(e.clientX),
                        handle.elem.offset().top - parseInt(e.clientY)
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
    }
    class SliderTrack {
        constructor(slider) {
            this.slider = slider;
            this.track = $('<div />')
                .addClass('slider-value-track');
            this.slider.slider_elem
                .append($('<div />').addClass('slider-bg'))
                .append(this.track);
            if (this.slider.range_max) {
                if (this.slider.vertical) {
                    this.track
                        .css('bottom', 0)
                        .css('top', 'unset');
                } else {
                    this.track.css('right', 0);
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
                this.track
                    .css(`${this.slider.dim}`, dimension)
                    .css(`${this.slider.dir}`, `${value}px`);
            } else if (this.slider.range_max) {
                this.track.css(`${this.slider.dim}`, this.slider.slider_dim - value);
            } else {
                this.track.css(`${this.slider.dim}`, value);
            }
        }
    }
    class SliderHandle {
        constructor(slider, input, span) {
            this.slider = slider;
            this.elem = $('<div />')
                .addClass('slider-handle')
                .width(20)
                .height(20);
            this.slider.slider_elem.append(this.elem);
            this.input_elem = input;
            this.span_elem = span;
            this.value = this.input_elem.val();
            this.pos = this.transform(this.value, 'screen');
            this.vertical = this.slider.vertical;
            this.step = this.slider.step;
            this.elem.css(`${this.slider.dir}`, this.pos);
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
                    }
                }
            }
            if (pos >= this.slider.slider_dim) {
                pos = this.slider.slider_dim;
            } else if (pos <= 0) {
                pos = 0;
            }
            this.elem.css(`${this.slider.dir}`, `${pos}px`);
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
            ['mousemove','touchmove'].forEach( evt =>
                document.addEventListener(evt, this.handle_drag, {passive:false})
            );
            ['mouseup','touchend'].forEach( evt =>
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
                step = this.slider.step;
            if (type === 'step') {
                let condition = min === 0 ? max - step / 2 : max - min / 2;
                val = val > condition ? max : step * parseInt(val / step);
                val = val <= min ? min : val;
            } else if (type === 'screen') {
                val = parseInt(this.slider.slider_dim * ((val - min) / (max - min)));
            } else if (type === 'range') {
                val = parseInt((max - min) * (val / this.slider.slider_dim) + min);
            }
            return val;
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

    Object.defineProperty(exports, '__esModule', { value: true });


    if (window.yafowil === undefined) {
        window.yafowil = {};
    }

    window.yafowil.slider = exports;


    return exports;

})({}, jQuery);
