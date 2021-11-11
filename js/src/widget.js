/*
 * yafowil slider widget
 *
 * Optional: bdajax
 */

import $ from 'jquery';

export class SliderWidget {
    static initialize(context) {
        $('.yafowil_slider', context).each(function() {
            new SliderWidget($(this));
        });
    }

    constructor(elem) {
        this.elem = elem;
        this.options = this.elem.data();
        this.init_options();
        this.slider_handle_dim = 20;
        this.input = $('input.slider_value', this.elem);
        this.slider_elem = $('div.slider', this.elem);

        this.slider_value_track = $('<div></div>')
            .addClass('slider-value-track');
        this.slider_elem
            .append($('<div></div>').addClass('slider-bg'))
            .append(this.slider_value_track);

        this.handles = [];
        if (this.range_true) {
            let handle1 = new SliderHandle(this.slider_elem, this.options, this.options.values[0]);
            let handle2 = new SliderHandle(this.slider_elem, this.options, this.options.values[1]);
            this.handles.push(handle1);
            this.handles.push(handle2);
        } else {
            let handle = new SliderHandle(this.slider_elem, this.options);
            this.handles.push(handle);
        }

        this.handle_singletouch = this.handle_singletouch.bind(this);
        this.slider_elem.on('mousedown touchstart', this.handle_singletouch);

        this.init_position();
        this.set_value_track();
        this.slider_elem.on('drag', this.set_value_track.bind(this));
        this.slider_elem.on('drag', this.set_values.bind(this));

        this.resize_handle = this.resize_handle.bind(this);
        $(window).on('resize', this.resize_handle);
    }

    get vertical() {
        return this.options.orientation === 'vertical';
    }

    get dim() {
        return this.vertical ? 'height' : 'width';
    }

    get dir() {
        return this.vertical ? 'top' : 'left';
    }

    get range_max() {
        return this.options.range === 'max';
    }

    get range_true(){
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

    set_value_track() {
        let value = this.handles[0].value_screen;
        if (this.range_true) {
            let dimension =
                this.handles[1].value_screen -
                this.handles[0].value_screen;
            this.slider_value_track
                .css(`${this.dim}`, dimension)
                .css(`${this.dir}`, `${value}px`);
        } else if (this.range_max) {
            this.slider_value_track.css(`${this.dim}`, this.slider_dim - value);
        } else {
            this.slider_value_track.css(`${this.dim}`, value);
        }
    }

    init_options() {
        let elements = {};
        if (this.range_true) {
            elements.lower_display = $('span.lower_value', this.elem);
            elements.upper_display = $('span.upper_value', this.elem);
            elements.lower_value = $('input.lower_value', this.elem);
            elements.upper_value = $('input.upper_value', this.elem);
            this.options.values = [
                elements.lower_value.val(),
                elements.upper_value.val()
            ];
        } else {
            elements.display = $('span.slider_value', this.elem);
            elements.value = $('input.slider_value', this.elem);
            this.options.value = elements.value.val();
            this.value = this.options.value;
        }
        this.elem.data('slider_elements', elements);
        this.options.min = this.options.min ?? 0;
        this.options.max = this.options.max ?? 100;
    }

    init_position() {
        if (this.vertical) {
            this.slider_elem.addClass('slider-vertical');
        }
        if (this.range_max) {
            if (this.vertical) {
                this.slider_value_track
                    .css('bottom', 0)
                    .css('top', 'unset');
            } else {
                this.slider_value_track.css('right', 0);
            }
        }
    }

    resize_handle() {
        if (this.range !== true) {
            this.value_screen = this.transform(this.value, 'display');
            this.set_position(this.value_screen);
        }
    }

    handle_singletouch(e) {
        let pos;

        if (e.type === 'mousedown') {
            pos = this.vertical ? e.pageY : e.pageX;
        } else {
            pos = this.vertical ? e.touches[0].pageY : e.touches[0].pageX;
        }

        let value = pos - this.offset;

        this.handles[0].elem.css('left', value);
        this.slider_value_track.css('width', value);
    }

    set_values() {
        if (this.range_true) {
            let lower_val = this.handles[0].value;
            let upper_val = this.handles[1].value;
            $(`span.lower_value`, this.elem).text(lower_val);
            $(`input.lower_value`, this.elem).attr('value', lower_val);
            $(`span.upper_value`, this.elem).text(upper_val);
            $(`input.upper_value`, this.elem).attr('value', upper_val);

        } else {
            let value = this.handles[0].value;
            $('span.slider_value', this.elem).text(value);
            this.input.attr('value', value);
        }
    }
}

class SliderHandle {
    constructor(slider, options, value) {
        this.slider = slider;
        this.elem = $('<div></div>')
            .addClass('slider-handle')
            .width(20)
            .height(20);

        this.slider.append(this.elem);

        if(value) {
            this.value = value;
        } else {
            this.value = options.value;
        }

        this.min = options.min;
        this.max = options.max;
        this.step = options.step;
        this.value_screen = this.transform(this.value, 'screen');
        this.vertical = options.orientation === 'vertical';
        this.dir = this.vertical ? 'top' : 'left';

        this.elem.css(`${this.dir}`, this.value_screen);

        this.slide_start = this.slide_start.bind(this);
        this.handle = this.handle_drag.bind(this);
        this.elem.on('mousedown touchstart', this.slide_start);
    }

    get slider_dim() {
        let dim = this.vertical ? this.slider.height() : this.slider.width();
        return dim;
    }

    get value_screen() {
        return this._value_screen;
    }

    set value_screen(value) {
        if (value >= this.slider_dim) {
            value = this.slider_dim;
        } else if (value <= 0) {
            value = 0;
        }
        this._value_screen = value;
    }

    get offset() {
        let offset = this.vertical ? this.slider.offset().top :
                     this.slider.offset().left;
        return offset;
    }

    slide_start(event) {
        event.preventDefault();
        event.stopPropagation();
        ['mousemove','touchmove'].forEach( evt =>
            document.addEventListener(evt, this.handle, {passive:false})
        );
        ['mouseup','touchend'].forEach( evt =>
            document.addEventListener(evt, () => {
                document.removeEventListener('touchmove', this.handle);
                document.removeEventListener('mousemove', this.handle);
            }, false)
        );
    }

    handle_drag(e){
        console.log('handle drag');
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'mousemove') {
            this.value_screen = (this.vertical ? e.pageY : e.pageX) - this.offset;
        } else {
            this.value_screen =
                (this.vertical ? e.touches[0].pageY : e.touches[0].pageX)
                - this.offset;
        }
        this.value = this.transform(this.value_screen, 'range');
        if (this.step) {
            this.value = this.transform(this.value, 'step');
            this.value_screen = this.transform(this.value, 'screen');
        }

        this.elem.css(`${this.dir}`, this.value_screen + 'px');

        const event = new $.Event('drag');
        this.slider.trigger(event);
    }

    transform(val, type) {
        let min = this.min,
            max = this.max,
            step = this.step;

        if (type === 'step') {
            let condition = min === 0 ? max - step / 2 : max - min / 2;
            val = val > condition ? max : step * parseInt(val/step);
            if (val <= min) {
                val = min;
            }
        } else if (type === 'screen') {
            val = parseInt(this.slider_dim * ((val - min) / (max - min)));
        } else if (type === 'range') {
            val = parseInt((max - min) * (val / this.slider_dim) + min);
        }
        return val;
    }
}