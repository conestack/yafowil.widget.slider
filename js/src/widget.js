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

        if (this.options.range === true) {
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
                this.slider_elem[0].addEventListener('touchstart', this.handle_singletouch, false);
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
        let options = this.options;
        options.min = options.min ?? 0;
        options.max = options.max ?? 100;

        if (options.orientation === 'vertical') {
            this.slider_elem.addClass('slider-vertical');
            this.slider_dim = this.slider_elem.height();
            this.offset = this.slider_elem.offset().top;
        } else {
            this.slider_dim = this.elem.width();
            this.offset = this.elem.offset().left;
        }

        if (options.range === true) {
            let values = [
                this.transform(options.values[0], 'display'),
                this.transform(options.values[1], 'display')
            ];
            this.set_position(values);
        } else if (options.value) {
            let value_display = this.transform(options.value, 'display');
            this.set_position(value_display);
        }

        if (options.range === 'max') {
            if (options.orientation === 'vertical') {
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
        let vertical = this.options.orientation === 'vertical',
            pos = vertical ? e.pageY : e.pageX,
            value = pos - this.offset,
            value_transformed = this.transform(value, 'range');
        if (this.options.step) {
            value_transformed = this.transform(value_transformed, 'step');
            value = this.transform(value_transformed, 'display');
        }
        this.set_position(value);
        $('span.slider_value', this.elem).text(value_transformed);
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

            let vertical = this.options.orientation === 'vertical';
            let pos = vertical ? event.touches[0].pageY : event.touches[0].pageX;

            let value_display = this.prevent_overflow(pos - this.offset);
            let value_range = this.transform(value_display, 'range');
            if (this.options.step) {
                value_range = this.transform(value_range, 'step');
                value_display = this.transform(value_range, 'display');
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
        let target = event.target,
            handle_move = handle_touchmove.bind(this),
            vertical = this.options.orientation === 'vertical',
            handles = [this.slider_handle_elem, this.slider_handle_elem_end];

        document.addEventListener('touchmove', handle_move, {passive:false});
        function handle_touchmove(event) {
            event.preventDefault();
            event.stopPropagation();
            let touch = vertical ? event.touches[0].pageY : event.touches[0].pageX;
            let dir = vertical ? 'top' : 'left';
            let values = [
                parseInt(handles[0].css(dir)),
                parseInt(handles[1].css(dir))
            ];

            let offset = parseInt(this.prevent_overflow(touch - this.offset));
            let value_range = this.transform(offset, 'range');

            if (target === handles[0][0]) {
                if (touch_pos - this.offset > values[1] - this.slider_handle_dim + 10) {
                    return;
                }
                values[0] = offset;
                $('.lower_value').text(value_range);
            } else if (target === handles[1][0]) {
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

        let orientation = this.options.orientation === "vertical",
            step = this.options.step,
            pos = (orientation ? e.pageY : e.pageX) - this.offset,
            value_display = this.prevent_overflow(pos),
            value_range = this.transform(value_display, 'range');

        if (step) {
            value_range = this.transform(value_range, 'step');
            value_display = this.transform(value_range, 'display');
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
        let target = e.target;
        let vertical = this.options.orientation === 'vertical';
        let handles = [this.slider_handle_elem, this.slider_handle_elem_end];

        $(this.elem).off('mousemove').on('mousemove', (e) => {
            e.preventDefault();
            e.stopPropagation();

            let dir = vertical ? e.pageY : e.pageX,
                pos = this.prevent_overflow(dir - this.offset),
                value_range = this.transform(pos, 'range'),
                val_dir = vertical ? 'top' : 'left',
                values = [
                    parseInt(handles[0].css(val_dir)),
                    parseInt(handles[1].css(val_dir))
                ];

            if (target === handles[0][0]) {
                if (pos > values[1] - this.slider_handle_dim) {
                    return;
                }
                values[0] = pos;
                $('.lower_value').text(value_range);
            } else if (target === handles[1][0]) {
                if (pos < values[0] + this.slider_handle_dim) {
                    return;
                }
                values[1] = pos;
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

    set_position(val) {
        let vertical = this.options.orientation === 'vertical',
            range = this.options.range,
            track = this.slider_value_track,
            handle = this.slider_handle_elem,
            handle_end = this.slider_handle_elem_end;

        if (vertical) {
            if (range === 'max') {
                track.css('height', this.slider_dim - val);
                handle.css('top', val + 'px');
            } else if (range === true) {
                handle.css('top', val[0]);
                handle_end.css('top', val[1]);
                let height = val[1] - val[0];
                track.css('height', height).css('top', `${val[0]}px`);
            } else {
                track.css('height', val);
                handle.css('top', val + 'px');
            }
        } else {
            if (range === 'max') {
                track.css('width', this.slider_dim - val);
                handle.css('left', val + 'px');
            } else if (range === true) {
                handle.css('left', val[0]);
                handle_end.css('left', val[1]);
                let width = val[1] - val[0];
                track.css('width', width).css('left', `${val[0]}px`);
            } else {
                track.css('width', val);
                handle.css('left', val + 'px');
            }
        }
    }

    transform(val, type) {
        let min = this.options.min,
            max = this.options.max,
            step = this.options.step;

        if (type === "step") {
            val = val > max - step/2 ? max : step * parseInt(val/step);
        } else if (type === "display") {
            val = parseInt(this.slider_dim * ((val - min) / (max - min)));
        } else if (type === "range") {
            val = parseInt((max - min) * (val / this.slider_dim) + min);
        }
        return val;
    }
}
