/*
 * yafowil slider widget
 *
 * Requires: jquery.ui.slider
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
        this.input = $('input.slider_value', this.elem);
        this.slider_elem = $('div.slider', this.elem);

        this.slider_width = this.elem.width();
        this.offset = this.elem.offset().left;
        this.slider_handle_width = 20;
        this.value = 0;

        this.options = this.elem.data();
        this.binder();

        let slider_handle_elem = this.slider_handle_elem = $(`
            <div class="slider-handle" 
                 style="width:${this.slider_handle_width}px;
                        height:${this.slider_handle_width}px"/>
        `);
        let slider_value_track = this.slider_value_track = $(`
            <div class="slider-value-track" />
        `);
        let slider_bg = $(`
            <div class="slider-bg" />
        `);

        this.slider_elem.append(slider_bg);
        this.slider_elem.append(slider_value_track);
        this.slider_elem.append(slider_handle_elem);

        this.handle_mousedown = this.handle_mousedown.bind(this);
        this.handle_drag = this.handle_drag.bind(this);

        if (this.options.range == true) {
            let slider_handle_elem_end = this.slider_handle_elem_end = $(`
                <div class="slider-handle-end"
                     style="width:${this.slider_handle_width}px;
                            height:${this.slider_handle_width}px"/>
            `);
            this.slider_elem.append(slider_handle_elem_end);
            this.slider_handle_elem.on('mousedown', this.handle_range_slider.bind(this));
            this.slider_handle_elem_end.on('mousedown', this.handle_range_slider.bind(this));
        } else {
            this.slider_handle_elem
            .off('mousedown')
            .on('mousedown', this.handle_mousedown);
        }
    }

    binder() {
        let elements = {};
        if (this.options.range === true) {
            elements.lower_display = $('span.lower_value', this.elem);
            elements.upper_display = $('span.upper_value', this.elem);
            elements.lower_value = $('input.lower_value', this.elem);
            elements.upper_value = $('input.upper_value', this.elem);
            this.options.values = [elements.lower_value.val(),
                                   elements.upper_value.val()];
        } else {
            elements.display = $('span.slider_value', this.elem);
            elements.value = $('input.slider_value', this.elem);
            this.options.value = elements.value.val();
        }
        if (this.options.slide) {
            var path = this.options.slide;
            this.options.slide = this.lookup_callback(path);
        } else {
            this.options.slide = this.callback;
        }
        if (this.options.change) {
            var path = this.options.change;
            this.options.change = this.lookup_callback(path);
        } else {
            this.options.change = this.callback;
        }
        this.elem.data('slider_elements', elements);
    }

    handle_mousedown(e) {
        e.preventDefault();
        this.elem.off('mousemove').on('mousemove', this.handle_drag);
    }

    handle_drag(e) {
        e.preventDefault();
        e.stopPropagation();
        let mouse_x = e.clientX;
        let value_width = mouse_x - this.offset;
        let val;

        value_width = this.prevent_overflow(value_width);

        if (this.options.min && this.options.max) {
            val = this.transform_to_range(value_width);
        }
        if (this.options.step) {
            let value_to_transform = this.transform_to_range(value_width);
            val = this.transform_to_step_value(value_to_transform);
            value_width = this.transform_to_display(val);
        }

        $('span.slider_value', this.elem).text(val);
        this.slider_value_track.css('width', value_width);
        this.slider_handle_elem.css('left', value_width + 'px');

        $(window).on('mouseup', () => {
            this.elem.off('mousemove');
        });
    }

    prevent_overflow(value) {
        if (value >= this.slider_width) {
            value = this.slider_width;
        } else if (value <= 0) {
            value = 0;
        }
        return value;
    }

    handle_range_slider(e) {
        e.preventDefault();
        e.stopPropagation();

        let target = $(e.target);

        $(this.elem).off('mousemove').on('mousemove', (e) => {
            e.preventDefault();
            e.stopPropagation();

            let start = parseFloat(this.slider_handle_elem.css('left'));
            let end = parseFloat(this.slider_handle_elem_end.css('left'));

            let elem_offset = this.prevent_overflow(e.clientX - this.offset);

            let elem = target.attr('class');
            if (elem === 'slider-handle') {
                start = parseInt(elem_offset);
                let start_transformed = this.transform_to_range(start);
                $('.lower_value').text(start_transformed);
            } else if (elem === 'slider-handle-end') {
                end = parseInt(elem_offset);
                let end_transformed = this.transform_to_range(end);
                $('.upper_value').text(end_transformed);
            }

            target.css('left', elem_offset + 'px');
            let value_track_width = end - start;
            this.slider_value_track.css('width', value_track_width + 'px').css('left', start + 'px');
        });

        $(window).on('mouseup', () => {
            this.elem.off('mousemove');
        });
    }

    transform_to_step_value(value_transformed) {
        let value = value_transformed;
        let step = this.options.step;
        let range_max = this.options.max;

        if (value >= range_max - step/2) {
            value = range_max
        } else {
            value = step * parseInt(value/step)
        }

        return value
    }

    transform_to_display(value) {
        let self_min = 0;
        let self_max = this.slider_width;
        let value_transformed = value;

        let range_min = this.options.min;
        let range_max = this.options.max;

        let val = (self_max - self_min) *
        ((value_transformed - range_min) / (range_max - range_min))
        + self_min;

        val = parseInt(val);
        return val;
    }

    transform_to_range(value) {
        let self_min = 0;
        let self_max = this.slider_width;

        let range_min = this.options.min;
        let range_max = this.options.max;

        let val = (range_max - range_min) *
        ((value - self_min) / (self_max - self_min))
        + range_min;
        val = parseInt(val);

        return val;
    }

    lookup_callback(p) {
        source = p.split('.');
        var cb = window;
        var name;
        for (var idx in source) {
            name = source[idx];
            if (typeof(cb[name]) == "undefined") {
                throw "'" + name + "' not found.";
            }
            cb = cb[name];
        }
        return cb;
    }

    callback(e, ui) {
        var widget = $(e.target).parents('.yafowil_slider');
        var options = widget.data();
        var elements = widget.data('slider_elements');
        if (options.range === true) {
            elements.lower_value.attr('value', ui.values[0]);
            elements.upper_value.attr('value', ui.values[1]);
            elements.lower_display.html(ui.values[0]);
            elements.upper_display.html(ui.values[1]);
        } else {
            elements.value.attr('value', ui.value);
            elements.display.html(ui.value);
        }
    }
}
