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
            this.init_options();
            let handle_dim = this.slider_handle_dim = 20;
            this.input = $('input.slider_value', this.elem);
            this.slider_elem = $('div.slider', this.elem);
            this.handle_elem = $('<div></div>')
                .addClass('slider-handle')
                .width(handle_dim)
                .height(handle_dim);
            this.slider_value_track = $('<div></div>')
                .addClass('slider-value-track');
            this.slider_elem
                .append($('<div></div>').addClass('slider-bg'))
                .append(this.slider_value_track)
                .append(this.handle_elem);
            this.handle_singletouch = this.handle_singletouch.bind(this);
            this.handle_start = this.slide_start.bind(this);
            this.handle_range = this.handle_range.bind(this);
            if (this.range_true) {
                this.handle_elem_end = $('<div></div>')
                    .addClass('slider-handle-end')
                    .width(handle_dim)
                    .height(handle_dim);
                this.slider_elem.append(this.handle_elem_end);
                this.handle_elem.on('mousedown touchstart', this.handle_range);
                this.handle_elem_end.on('mousedown touchstart', this.handle_range);
                this.slider_elem.on('mousedown touchstart', this.handle_singletouch);
            } else {
                this.handle_elem.on('mousedown touchstart', this.handle_start);
                this.slider_elem.on('mousedown touchstart', this.handle_singletouch);
            }
            this.init_position();
        }
        get vertical() {
            return this.options.orientation === 'vertical';
        }
        get range_max() {
            return this.options.range === 'max';
        }
        get range_true(){
            return this.options.range === true;
        }
        get step() {
            return this.options.step;
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
            }
            this.elem.data('slider_elements', elements);
        }
        init_position() {
            let options = this.options;
            options.min = options.min ?? 0;
            options.max = options.max ?? 100;
            if (this.vertical) {
                this.slider_elem.addClass('slider-vertical');
                this.slider_dim = this.slider_elem.height();
                this.offset = this.slider_elem.offset().top;
            } else {
                this.slider_dim = this.elem.width();
                this.offset = this.elem.offset().left;
            }
            if (this.range_true) {
                let values = [
                    this.transform(options.values[0], 'display'),
                    this.transform(options.values[1], 'display')
                ];
                this.set_position(values);
            } else if (options.value) {
                let value = this.transform(options.value, 'display');
                this.set_position(value);
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
            let pos;
            if (e.type === 'mousedown') {
                pos = this.vertical ? e.pageY : e.pageX;
            } else {
                pos = this.vertical ? e.touches[0].pageY : e.touches[0].pageX;
            }
            let value = pos - this.offset,
                value_transformed = this.transform(value, 'range');
            if (this.step) {
                value_transformed = this.transform(value_transformed, 'step');
                value = this.transform(value_transformed, 'display');
            }
            if (this.range_true) {
                let dir = this.vertical ? 'top' : 'left',
                    values = [
                        parseInt(this.handle_elem.css(dir)),
                        parseInt(this.handle_elem_end.css(dir))
                    ],
                    isLeft = value < values[0] || value < (values[0] + values[1])/2,
                    value_target = isLeft ? '.lower_value' : '.upper_value';
                values = isLeft ? [value, values[1]]  : [values[0], value];
                this.set_position(values);
                this.set_values(value_transformed, value_target);
            } else {
                this.set_position(value);
                this.set_values(value_transformed);
            }
        }
        slide_start(event) {
            event.preventDefault();
            event.stopPropagation();
            let handle = this.handle_drag.bind(this);
            ['mousemove','touchmove'].forEach( evt =>
                document.addEventListener(evt, handle, {passive:false})
            );
            ['mouseup','touchend'].forEach( evt =>
                document.addEventListener(evt, () => {
                    document.removeEventListener('touchmove', handle);
                    document.removeEventListener('mousemove', handle);
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
                pos = (this.vertical ? e.touches[0].pageY : e.touches[0].pageX)
                       - this.offset;
            }
            let value_display = this.prevent_overflow(pos);
            let value_range = this.transform(value_display, 'range');
            if (this.step) {
                value_range = this.transform(value_range, 'step');
                value_display = this.transform(value_range, 'display');
            }
            this.set_position(value_display);
            this.set_values(value_range);
        }
        handle_range(event) {
            event.preventDefault();
            event.stopPropagation();
            let target = event.target,
                dir = this.vertical ? 'top' : 'left',
                handles = [this.handle_elem, this.handle_elem_end],
                handle_move = handle_moving.bind(this);
            ['mousemove','touchmove'].forEach( evt =>
                document.addEventListener(evt, handle_move, {passive:false})
            );
            ['mouseup','touchend'].forEach( evt =>
                document.addEventListener(evt, () => {
                    document.removeEventListener('touchmove', handle_move);
                    document.removeEventListener('mousemove', handle_move);
                }, false)
            );
            function handle_moving(event) {
                event.preventDefault();
                event.stopPropagation();
                let pos;
                if (event.type === 'mousemove') {
                    pos = this.vertical ? event.pageY : event.pageX;
                } else {
                    pos = this.vertical ? event.touches[0].pageY : event.touches[0].pageX;
                }
                pos = this.prevent_overflow(pos - this.offset);
                let value = this.transform(pos, 'range');
                let values = [
                    parseInt(handles[0].css(dir)),
                    parseInt(handles[1].css(dir))
                ];
                if (target === handles[0][0]) {
                    if (pos >= values[1]) {
                        return;
                    }
                    values[0] = pos;
                    this.set_values(value, '.lower_value');
                } else if (target === handles[1][0]) {
                    if (pos <= values[0]) {
                        return;
                    }
                    values[1] = pos;
                    this.set_values(value, '.upper_value');
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
            let track = this.slider_value_track,
                handle = this.handle_elem,
                handle_end = this.handle_elem_end;
            if (this.vertical) {
                if (this.range_max) {
                    track.css('height', this.slider_dim - val);
                    handle.css('top', val + 'px');
                } else if (this.range_true) {
                    handle.css('top', val[0]);
                    handle_end.css('top', val[1]);
                    let height = val[1] - val[0];
                    track.css('height', height).css('top', `${val[0]}px`);
                } else {
                    track.css('height', val);
                    handle.css('top', val + 'px');
                }
            } else {
                if (this.range_max) {
                    track.css('width', this.slider_dim - val);
                    handle.css('left', val + 'px');
                } else if (this.range_true) {
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
            if (this.range_true) {
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
                val = val > max - step / 2 ? max : step * parseInt(val/step);
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
