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

        this.vertical = this.options.orientation === 'vertical';
        this.dim = this.vertical ? 'height' : 'width';
        this.dir = this.vertical ? 'top' : 'left';

        this.slider_value_track = $('<div></div>')
            .addClass('slider-value-track');
        this.slider_elem
            .append($('<div></div>').addClass('slider-bg'))
            .append(this.slider_value_track);

        this.handles = [];
        if (this.range_true) {
            let handle1 = new SliderHandle(this, this.options.values[0]);
            let handle2 = new SliderHandle(this, this.options.values[1]);
            this.handles.push(handle1);
            this.handles.push(handle2);
        } else {
            let handle = new SliderHandle(this);
            this.handles.push(handle);
        }

        this.handle_singletouch = this.handle_singletouch.bind(this);
        this.slider_elem.on('mousedown touchstart', this.handle_singletouch);

        this.init_position();
        this.set_value_track();
        this.slider_elem.on('drag', this.set_value_track.bind(this));
        this.slider_elem.on('drag', this.set_values.bind(this));
        $(window).on('resize', this.set_value_track.bind(this));
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

    handle_singletouch(e) {
        let value,
            target;
        if (e.type === 'mousedown') {
            value = (this.vertical ? e.pageY : e.pageX) - this.offset;
        } else {
            value = 
                (this.vertical ? e.touches[0].pageY : e.touches[0].pageX)
                - this.offset;
        }
        if (this.range_true){
            let values = [this.handles[0].value_screen, this.handles[1].value_screen];
            let isFirst = value < values[0] || value < (values[0] + values[1])/2;
            target = isFirst ? this.handles[0] : this.handles[1];
        } else {
            target = this.handles[0];
        }
        target.value_screen = value;
        target.value = target.transform(value, 'range');
        target.set_position();
        this.set_value_track();
        this.set_values();
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
    constructor(slider, value) {
        this.slider = slider;
        this.elem = $('<div></div>')
            .addClass('slider-handle')
            .width(20)
            .height(20);

        this.slider.slider_elem.append(this.elem);
        this.value = value ?? this.slider.options.value;
        this.value_screen = this.transform(this.value, 'screen');
        this.vertical = this.slider.vertical;
        this.elem.css(`${this.slider.dir}`, this.value_screen);

        this.slide_start = this.slide_start.bind(this);
        this.handle = this.handle_drag.bind(this);
        this.elem.on('mousedown touchstart', this.slide_start);

        $(window).on('resize', this.resize.bind(this));
    }

    get offset() {
        return this.slider.offset;
    }

    get value_screen() {
        return this._value_screen;
    }

    set value_screen(value) {
        if (value >= this.slider.slider_dim) {
            value = this.slider.slider_dim;
        } else if (value <= 0) {
            value = 0;
        }
        this._value_screen = value;
    }

    resize() {
        this.value_screen = this.transform(this.value, 'screen');
        this.set_position();
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
        if (this.slider.options.step) {
            this.value = this.transform(this.value, 'step');
            this.value_screen = this.transform(this.value, 'screen');
        }

        if (this.slider.options.range === true &&
            this.slider.handles[0].value >=this.slider.handles[1].value) 
            {return;}
        this.set_position();
        const event = new $.Event('drag');
        this.slider.slider_elem.trigger(event);
    }

    set_position() {
        this.elem.css(`${this.slider.dir}`, this.value_screen + 'px');
    }

    transform(val, type) {
        let min = this.slider.options.min,
            max = this.slider.options.max,
            step = this.slider.options.step;
        if (type === 'step') {
            let condition = min === 0 ? max - step / 2 : max - min / 2;
            val = val > condition ? max : step * parseInt(val/step);
            val = val <= min ? min : val;
        } else if (type === 'screen') {
            val = parseInt(this.slider.slider_dim * ((val - min) / (max - min)));
        } else if (type === 'range') {
            val = parseInt((max - min) * (val / this.slider.slider_dim) + min);
        }
        return val;
    }
}