(function (exports, $) {
    'use strict';

    class Slider {
        static initialize(context) {
            $('.yafowil_slider', context).each(function() {
                new Slider($(this));
            });
        }
        constructor(elem) {
            this.elem = elem;
            this.options = this.elem.data();
            this.bind_options();
            this.slider_handle_dim = 20;
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
            this.handle_singletouch = this.handle_singletouch.bind(this);
            this.handle_start = this.mousedown_touchstart.bind(this);
            this.handle_range = this.handle_range.bind(this);
            if (this.options.range === true) {
                let slider_handle_elem_end = this.slider_handle_elem_end = $(`
                <div class="slider-handle-end"
                     style="width:${this.slider_handle_dim}px;
                            height:${this.slider_handle_dim}px"/>
            `);
                this.slider_elem.append(slider_handle_elem_end);
                this.slider_handle_elem.on('mousedown touchstart', this.handle_range);
                this.slider_handle_elem_end.on('mousedown touchstart', this.handle_range);
                this.slider_elem.on('mousedown touchstart', this.handle_singletouch);
            } else {
                this.slider_handle_elem.on('mousedown touchstart', this.handle_start);
                this.slider_elem.on('mousedown touchstart', this.handle_singletouch);
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
            if (this.options.range === true) {
                let dir = vertical ? 'top' : 'left',
                    values = [
                        parseInt(this.slider_handle_elem.css(dir)),
                        parseInt(this.slider_handle_elem_end.css(dir))
                    ],
                    isLeft = value < values[0] || value < (values[0] + values[1])/2,
                    value_target = isLeft ? '.lower_value' : '.upper_value';
                values = isLeft ? [value, values[1]]  : [values[0], value];
                this.set_position(values);
                this.set_values(value_transformed, value_target);
                return;
            }
            this.set_position(value);
            this.set_values(value_transformed);
        }
        mousedown_touchstart(e) {
            e.preventDefault();
            e.stopPropagation();
            let vertical = this.options.orientation === "vertical",
                step = this.options.step,
                handle = handle_drag.bind(this);
            if (e.pageY) {
                this.elem.off('mousemove').on('mousemove', handle);
            } else {
                document.addEventListener('touchmove', handle, {passive:false});
            }
            function handle_drag(event){
                event.preventDefault();
                event.stopPropagation();
                let pos;
                if (event.pageY) {
                    pos = (vertical ? event.pageY : event.pageX) - this.offset;
                    $(window).on('mouseup', () => {
                        this.elem.off('mousemove');
                    });
                } else {
                    pos = (vertical ? event.touches[0].pageY :
                           event.touches[0].pageX)
                           - this.offset;
                    document.addEventListener('touchend', () => {
                        document.removeEventListener('touchmove', handle);
                    }, false);
                }
                let value_display = this.prevent_overflow(pos),
                    value_range = this.transform(value_display, 'range');
                if (step) {
                    value_range = this.transform(value_range, 'step');
                    value_display = this.transform(value_range, 'display');
                }
                this.set_position(value_display);
                this.set_values(value_range);
            }
        }
        handle_range(event) {
            event.preventDefault();
            event.stopPropagation();
            let target = event.target;
            let vertical = this.options.orientation === 'vertical';
            let dir = vertical ? 'top' : 'left';
            let handles = [this.slider_handle_elem, this.slider_handle_elem_end];
            let handle_move = handle_moving.bind(this);
            if (event.pageY) {
                $(this.elem).off('mousemove').on('mousemove', handle_move);
                $(window).on('mouseup', () => {
                    this.elem.off('mousemove');
                });
            } else {
                document.addEventListener('touchmove', handle_move, {passive:false});
                document.addEventListener('touchend', () => {
                    document.removeEventListener('touchmove', handle_move);
                }, false);
            }
            function handle_moving(event) {
                event.preventDefault();
                event.stopPropagation();
                let pos;
                if (event.pageY) {
                    pos = vertical ? event.pageY : event.pageX;
                } else {
                    pos = vertical ? event.touches[0].pageY : event.touches[0].pageX;
                }
                pos = this.prevent_overflow(pos - this.offset);
                let value_range = this.transform(pos, 'range');
                let values = [
                    parseInt(handles[0].css(dir)),
                    parseInt(handles[1].css(dir))
                ];
                if (target === handles[0][0]) {
                    if (pos >= values[1]) {
                        return;
                    }
                    values[0] = pos;
                    this.set_values(value_range, '.lower_value');
                } else if (target === handles[1][0]) {
                    if (pos <= values[0]) {
                        return;
                    }
                    values[1] = pos;
                    this.set_values(value_range, '.upper_value');
                }
                this.set_position(values);
            }
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
        set_values(value, target) {
            if (this.options.range === true) {
                $(`span${target}`).text(value);
                $(`input${target}`).attr('value', value);
            } else {
                $('span.slider_value', this.elem).text(value);
                this.input.attr('value', value);
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

    $(function() {
        if (window.ts !== undefined) {
            ts.ajax.register(Slider.initialize, true);
        } else {
            Slider.initialize();
        }
    });

    exports.Slider = Slider;

    Object.defineProperty(exports, '__esModule', { value: true });


    if (window.yafowil === undefined) {
        window.yafowil = {};
    }

    window.yafowil.slider = exports;


    return exports;

})({}, jQuery);
