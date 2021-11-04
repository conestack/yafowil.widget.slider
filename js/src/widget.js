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

        let slider_handle_elem = this.slider_handle_elem = $(`
            <div class="slider-handle" 
                 style="width:${this.slider_handle_width}px;
                        height:${this.slider_handle_width}px"/>
        `);
        let slider_value_track = this.slider_value_track = $(`
            <div class="slider-value-track" />
        `);
        this.slider_elem.append(slider_value_track);
        this.slider_elem.append(slider_handle_elem);

        this.handle_mousedown = this.handle_mousedown.bind(this);
        this.handle_drag = this.handle_drag.bind(this);
        this.handle_mouseup = this.handle_mouseup.bind(this);

        this.slider_handle_elem.off('mousedown')
                               .on('mousedown', this.handle_mousedown);
        $(window).off('mouseup')
                 .on('mouseup', this.handle_mouseup);
    }

    handle_mousedown(e) {
        console.log('handle mousedown');

        $(window).off('mousemove').on('mousemove', this.handle_drag);
    }

    handle_drag(e) {
        e.preventDefault();
        let mouse_x = e.clientX;
        let value_width = mouse_x - this.offset;
        let handle_pos = value_width + 10 + 'px';

        let padding = 15; // parent padding, fix

        if (value_width >= this.slider_width - padding) {
            value_width = this.slider_width;
            handle_pos = this.slider_width + padding - this.slider_handle_width + 'px';
        } else if (value_width <= 0) {
            value_width = 0;
            handle_pos = padding + 'px'; // defined by parent gutter
        }

        console.log(handle_pos)

        this.slider_value_track.css('width', value_width);
        this.slider_handle_elem.css('left', handle_pos);
    }

    handle_mouseup(e) {
        console.log('handle mouseup');

        $(window).off('mousemove');
    }
}
