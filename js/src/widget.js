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
        this.min = this.options.min ?? 0;
        this.max = this.options.max ?? 100;
        this.step = this.options.step ?? 1;
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

        this.handle_singletouch = this.handle_singletouch.bind(this);
        this.slider_elem.on('mousedown touchstart', this.handle_singletouch);

        this.init_position();
        this.set_value_track();
        this.slider_elem.on('drag', this.set_value_track.bind(this));
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

    set_value_track(e) {
        let value = this.handles[0].pos;
        if (this.range_true) {
            let dimension = this.handles[1].pos - this.handles[0].pos;
            this.slider_value_track
                .css(`${this.dim}`, dimension)
                .css(`${this.dir}`, `${value}px`);
        } else if (this.range_max) {
            this.slider_value_track.css(`${this.dim}`, this.slider_dim - value);
        } else {
            this.slider_value_track.css(`${this.dim}`, value);
        }
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
        let value, target;
        if (e.type === 'mousedown') {
            value = (this.vertical ? e.pageY : e.pageX) - this.offset;
        } else {
            value = 
                (this.vertical ? e.touches[0].pageY : e.touches[0].pageX)
                - this.offset;
        }
        if (this.range_true){
            let values = [this.handles[0].pos, this.handles[1].pos];
            let isFirst = value < values[0] || value < (values[0] + values[1])/2;
            target = isFirst ? this.handles[0] : this.handles[1];
        } else {
            target = this.handles[0];
        }
        target.pos = value;
        target.value = target.transform(value, 'range');
        this.set_value_track();
    }
}

class SliderHandle {
    constructor(slider, input, span) {
        this.slider = slider;
        this.elem = $('<div></div>')
            .addClass('slider-handle')
            .width(20)
            .height(20);

        this.slider.slider_elem.append(this.elem);
        this.input_elem = input;
        this.span_elem = span;

        this.value = this.input_elem.val();
        this.pos = this.transform(this.value, 'screen');
        this.vertical = this.slider.vertical;
        this.elem.css(`${this.slider.dir}`, this.pos);

        this.slide_start = this.slide_start.bind(this);
        this.handle_drag = this.handle_drag.bind(this);
        this.elem.on('mousedown touchstart', this.slide_start);

        $(window).on('resize', this.resize.bind(this));
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

    set pos(value) {
        if (value >= this.slider.slider_dim) {
            value = this.slider.slider_dim;
        } else if (value <= 0) {
            value = 0;
        }
        this.elem.css(`${this.slider.dir}`, `${value}px`);
        this._pos = value;
    }

    resize() {
        this.pos = this.transform(this.value, 'screen');
    }

    slide_start(event) {
        event.preventDefault();
        event.stopPropagation();
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

    handle_drag(e){
        e.preventDefault();
        e.stopPropagation();

        let pos;
        if (e.type === 'mousemove') {
            pos = (this.vertical ? e.pageY : e.pageX) - this.offset;
        } else {
            pos =
                (this.vertical ? e.touches[0].pageY : e.touches[0].pageX)
                - this.offset;
        }
        if (this.slider.options.range === true) {
            let handle1 = this.slider.handles[0],
                handle2 = this.slider.handles[1];
            if (this === handle1 && pos >= handle2.pos ||
                this === handle2 && pos <= handle1.pos
            ){
                return;
            }
        }
        this.pos = pos;
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