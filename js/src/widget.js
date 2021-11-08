/*
 * yafowil slider widget
 *
 * Optional: bdajax
 */

import $ from 'jquery';

export class Slider {
    static initialize(context) {
        $('.yafowil_slider', context).each(function() {
            new Slider($(this));
        });
    }

    constructor(elem) {
        this.elem = elem;
        this.options = this.elem.data();
        this.bind_options();
        let slider_handle_dim = 20;

        this.supports_touch = 
            'ontouchstart' in window ||
            navigator.msMaxTouchPoints;
        this.slider_handle_dim = 
            this.supports_touch ?
            slider_handle_dim + 10 : slider_handle_dim;

        this.input = $('input.slider_value', this.elem);
        this.slider_elem = $('div.slider', this.elem);

        let slider_handle_elem = this.slider_handle_elem = $(`
            <div class="slider-handle" 
                 style="width:${this.slider_handle_dim}px;
                        height:${this.slider_handle_dim}px"/>
        `);
        let slider_value_track = this.slider_value_track = $(`
            <div class="slider-value-track" />
        `);
        let slider_bg = $(`
            <div class="slider-bg" />
        `);
        this.slider_elem
            .append(slider_bg)
            .append(slider_value_track)
            .append(slider_handle_elem);

        this.handle_mousedown = this.handle_mousedown.bind(this);
        this.handle_touch = this.handle_touch.bind(this);
        this.handle_drag = this.handle_drag.bind(this);
        this.handle_touch_range = this.handle_touch_range.bind(this);
        this.handle_singletouch = this.handle_singletouch.bind(this);

        if (this.options.range == true) {
            let slider_handle_elem_end = this.slider_handle_elem_end = $(`
                <div class="slider-handle-end"
                     style="width:${this.slider_handle_dim}px;
                            height:${this.slider_handle_dim}px"/>
            `);
            this.slider_elem.append(slider_handle_elem_end);

            this.handle_drag_range = this.handle_drag_range.bind(this);
            this.slider_handle_elem.on('mousedown', this.handle_drag_range);
            this.slider_handle_elem_end.on('mousedown', this.handle_drag_range);

            if (this.supports_touch) {
                this.slider_handle_elem[0]
                    .addEventListener('touchstart', this.handle_touch_range, false);
                this.slider_handle_elem_end[0]
                    .addEventListener('touchstart', this.handle_touch_range, false);
            }
        } else {
            this.slider_handle_elem
            .off('mousedown')
            .on('mousedown', this.handle_mousedown);
            this.slider_elem.on('click', this.handle_singletouch);
            if (this.supports_touch) {
                this.slider_handle_elem[0]
                    .addEventListener('touchstart', this.handle_touch, false);
            }
        }

        this.init_position();
    }

    bind_options() {
        let elements = {};
        if (this.options.range === true) {
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
        }
        this.elem.data('slider_elements', elements);
    }

    init_position() {
        if (!this.options.min && !this.options.max) {
            this.options.min = 0;
            this.options.max = 100;
        }
        if (this.options.orientation === 'vertical') {
            this.slider_elem.addClass('slider-vertical');
            this.slider_dim = this.slider_elem.height();
            this.offset = this.slider_elem.offset().top;
        } else {
            this.slider_dim = this.elem.width();
            this.offset = this.elem.offset().left;
        }

        if (this.options.range === true) {
            let val1 = this.options.values[0];
            let val2 = this.options.values[1];

            let val_disp_1 = this.transform_to_display(val1);
            let val_disp_2 = this.transform_to_display(val2);
            let values = [val_disp_1, val_disp_2];
            this.set_position(values);
        } else
        if (this.options.value) {
            let value_transformed = this.options.value;
            let value_display = this.transform_to_display(value_transformed);
            this.set_position(value_display);
        }
        if (this.options.range === 'max') {
            if (this.options.orientation === 'vertical') {
                this.slider_value_track
                    .css('bottom', 0)
                    .css('top', 'unset');
            } else {
                this.slider_value_track.css('right', 0);
            }
        }
        if (this.supports_touch) {
            this.elem.addClass('touch-support');
        }
    }

    handle_singletouch(e) {
        console.log('singleeeee')
    }

    handle_mousedown(e) {
        e.preventDefault();
        this.elem.off('mousemove').on('mousemove', this.handle_drag);
    }

    handle_touch() {
        let handle_move = handle_touchmove.bind(this);
        document.addEventListener('touchmove', handle_move, {passive:false});

        function handle_touchmove(event) {
            event.preventDefault();
            event.stopPropagation();

            let touch_pos;
            if (this.options.orientation === 'vertical') {
                touch_pos = event.touches[0].pageY;
            } else {
                touch_pos = event.touches[0].pageX;
            }

            let value_display = this.prevent_overflow(touch_pos - this.offset);
            let value_range = this.transform_to_range(value_display);
            if (this.options.step) {
                value_range = this.transform_to_step_value(value_range);
                value_display = this.transform_to_display(value_range);
            }
            this.set_position(value_display);
            $('span.slider_value', this.elem).text(value_range);
            document.addEventListener('touchend', handle_touchend.bind(this), false);

            function handle_touchend() {
                document.removeEventListener('touchmove', handle_move);
            }
        }
    }

    handle_touch_range(event) {
        let target = event.target;
        let handle_move = handle_touchmove.bind(this);

        document.addEventListener('touchmove', handle_move, {passive:false});

        function handle_touchmove(event) {
            event.preventDefault();
            event.stopPropagation();
            let touch_pos, values = [];

            if (this.options.orientation === 'vertical') {
                values[0] = parseInt(this.slider_handle_elem.css('top'));
                values[1] = parseInt(this.slider_handle_elem_end.css('top'));
                touch_pos = event.touches[0].pageY;
            } else {
                values[0] = parseInt(this.slider_handle_elem.css('left'));
                values[1] = parseInt(this.slider_handle_elem_end.css('left'));
                touch_pos = event.touches[0].pageX;
            }

            let offset = this.prevent_overflow(touch_pos - this.offset);
            offset = parseInt(offset);
            let value_range = this.transform_to_range(offset);
            let elem = $(target).attr('class');

            if (elem === 'slider-handle') {
                if (touch_pos - this.offset > values[1] - this.slider_handle_dim + 10) {
                    return;
                }
                values[0] = offset;
                $('.lower_value').text(value_range);
            } else if (elem === 'slider-handle-end') {
                if (touch_pos - this.offset < values[0] + this.slider_handle_dim - 10) {
                    return;
                }
                values[1] = offset;
                $('.upper_value').text(value_range);
            }
            this.set_position(values);
        }
        document.addEventListener('touchend', handle_touchend.bind(this), false);
        function handle_touchend() {
            document.removeEventListener('touchmove', handle_move);
        }
    }

    handle_drag(e) {
        e.preventDefault();
        e.stopPropagation();
        let mouse_pos;
        if (this.options.orientation === 'vertical') {
            mouse_pos = e.pageY;
        } else {
            mouse_pos = e.pageX;
        }
        let value_display = this.prevent_overflow(mouse_pos - this.offset);
        let value_range = this.transform_to_range(value_display);
        if (this.options.step) {
            value_range = this.transform_to_step_value(value_range);
            value_display = this.transform_to_display(value_range);
        }
        this.set_position(value_display);
        $('span.slider_value', this.elem).text(value_range);

        $(window).on('mouseup', () => {
            this.elem.off('mousemove');
        });
    }

    handle_drag_range(e) {
        e.preventDefault();
        e.stopPropagation();
        let target = $(e.target);

        $(this.elem).off('mousemove').on('mousemove', (e) => {
            e.preventDefault();
            e.stopPropagation();
            let mouse_pos, values = [];

            if (this.options.orientation === 'vertical') {
                values[0] = parseInt(this.slider_handle_elem.css('top'));
                values[1] = parseInt(this.slider_handle_elem_end.css('top'));
                mouse_pos = e.pageY;
            } else {
                values[0] = parseInt(this.slider_handle_elem.css('left'));
                values[1] = parseInt(this.slider_handle_elem_end.css('left'));
                mouse_pos = e.pageX;
            }

            let offset = this.prevent_overflow(mouse_pos - this.offset);
            offset = parseInt(offset);
            let value_range = this.transform_to_range(offset);
            let elem = target.attr('class');

            if (elem === 'slider-handle') {
                if (mouse_pos - this.offset > values[1] - this.slider_handle_dim) {
                    return;
                }
                values[0] = offset;
                $('.lower_value').text(value_range);
            } else if (elem === 'slider-handle-end') {
                if (mouse_pos - this.offset < values[0] + this.slider_handle_dim) {
                    return;
                }
                values[1] = offset;
                $('.upper_value').text(value_range);
            }

            this.set_position(values);
        });

        $(window).on('mouseup', () => {
            this.elem.off('mousemove');
        });
    }

    prevent_overflow(value) {
        if (value >= this.slider_dim) {
            value = this.slider_dim;
        } else if (value <= 0) {
            value = 0;
        }
        return value;
    }

    set_position(value_display) {
        let orientation = this.options.orientation;
        let range = this.options.range;

        if (orientation === 'vertical') {
            if (range === 'max') {
                this.slider_value_track.css(
                    'height', this.slider_dim - value_display
                );
                this.slider_handle_elem.css('top', value_display + 'px');
            } else if (range === true) {
                this.slider_handle_elem.css('top', value_display[0]);
                this.slider_handle_elem_end.css('top', value_display[1]);
                let width = value_display[1] - value_display[0];
                this.slider_value_track
                    .css('height', width + 'px')
                    .css('top', value_display[0] + 'px');
            } else {
                this.slider_value_track.css('height', value_display);
                this.slider_handle_elem.css('top', value_display + 'px');
            }
        } else {
            if (range === 'max') {
                this.slider_value_track.css(
                    'width', this.slider_dim - value_display
                );
                this.slider_handle_elem.css('left', value_display + 'px');
            } else if (range === true) {
                this.slider_handle_elem.css('left', value_display[0]);
                this.slider_handle_elem_end.css('left', value_display[1]);
                let width = value_display[1] - value_display[0];
                this.slider_value_track
                    .css('width', width + 'px')
                    .css('left', value_display[0] + 'px');
            } else {
                this.slider_value_track.css('width', value_display);
                this.slider_handle_elem.css('left', value_display + 'px');
            }
        }
    }

    transform_to_step_value(val) {
        let step = this.options.step;
        let range_max = this.options.max;
        if (val >= range_max - step/2) {
            val = range_max
        } else {
            val = step * parseInt(val/step)
        }
        return val
    }

    transform_to_display(value) {
        let val =
            this.slider_dim *
            ((value - this.options.min) / (this.options.max - this.options.min));
        val = parseInt(val);
        return val;
    }

    transform_to_range(value) {
        let val = (this.options.max - this.options.min) *
                  (value / this.slider_dim) + this.options.min;
        val = parseInt(val);
        return val;
    }
}
