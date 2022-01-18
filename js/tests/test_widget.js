import $ from 'jquery';
import { SliderWidget } from "../src/widget";
import { transform } from '../src/widget';

let base_width = $(window).width();
let base_height = $(window).height();

QUnit.module('slider_widget', hooks => {

    let options = {};
    let elem;
    let slider;
    let container = $('<div id="container" />');
    let dim = 200;
    let value = 0;

    hooks.before(() => {
        $('body').append(container);
    });
    hooks.beforeEach(() => {
        elem = $(`
            <div class="yafowil_slider" id="test-slider">
              <input class="slider_value" type="text" value="0">
              <div class="slider" />
            </div>
        `);

        $('#container').append(elem);
    });
    hooks.afterEach(() => {
        slider = null;
        elem = null;
        value = null;
        options = {};
        container.empty();
    });
    hooks.after(() => {
        container.empty();
        container.remove();
        slider = null;
        elem = null;
        value = null;
        options = null;
    });

    /* test initialize function */
    QUnit.test('initialize()', assert => {
        // create options and set as data attribute
        options = {
            handle_diameter: 11,
            thickness: 9,
            min: 3,
            max: 231,
            step: 5
        }
        elem.css("width", `${dim}px`).data(options);

        SliderWidget.initialize();
        let slider = elem.data('slider_widget');
        // create object to compare given options
        let slider_options = {
            handle_diameter: slider.handle_diameter,
            thickness: slider.thickness,
            min: slider.min,
            max: slider.max,
            step: slider.step
        };

        // options and element are correctly initialized
        assert.deepEqual(options, slider_options);
        assert.deepEqual(elem, slider.elem);
    });

    QUnit.module('constructor', () => {
        /* slider without additional options given */
        QUnit.test('default slider', assert => {
            elem.css("width", `${dim}px`);
            slider = new SliderWidget(elem, options);

            // correct elements
            assert.deepEqual(slider.elem, elem);
            assert.ok(slider.slider_elem.is('div.slider'));
            // function exists
            assert.ok(slider.handle_singletouch);
            // only one handle exists
            assert.strictEqual(slider.handles.length, 1);
            // handle is unselected
            assert.false(slider.handles[0].selected);
            // no range specified
            assert.strictEqual(slider.range, false);
            // default diameter and thickness applied
            assert.strictEqual(slider.handle_diameter, 20);
            assert.strictEqual(slider.thickness, 8);
            assert.strictEqual(slider.slider_elem.css('height'), '20px');
            // default min/max applied
            assert.strictEqual(slider.min, 0);
            assert.strictEqual(slider.max, 100);
            // default value applied
            // assert.strictEqual(slider.handles[0].value, 0);
            // no step specified
            assert.strictEqual(slider.step, false);
            // default horizontal orientation
            assert.strictEqual(slider.vertical, false);
            assert.strictEqual(slider.dim_attr, 'width');
            assert.strictEqual(slider.dir_attr, 'left');
        });
    
        /* slider with vertical orientation */
        QUnit.test('vertical', assert => {
            elem.css("height", `${dim}px`);
            slider = new SliderWidget(elem, options);

            options.orientation = 'vertical';
            // on vertical orientation, height has to be specified
            options.height = dim;
            elem.css('height', dim + 'px');
            slider = new SliderWidget(elem, options);
    
            assert.strictEqual(slider.vertical, true);
            assert.strictEqual(slider.dim_attr, 'height');
            assert.strictEqual(slider.dir_attr, 'top');
            assert.ok(slider.slider_elem.hasClass('slider-vertical'));
            assert.strictEqual(slider.slider_elem.css('width'), '20px');
            assert.strictEqual(slider.offset, slider.slider_elem.offset().top);
        });
    
        /* range slider - two handles */
        QUnit.test('slider with range', assert => {
            elem.css("width", `${dim}px`);
            slider = new SliderWidget(elem, options);

            options.range = true;
            // set initial values for the two handles
            options.values = [50, 100];
            elem.css('width', dim + 'px');
    
            // append corresponding input and span elements to slider - done in widget.py
            let lower_val_elem = $(`<input class="lower_value"/>`).val(options.values[0]);
            let lower_span_elem = $(`<span class="lower_value"/>`).val(options.values[0]);
            let upper_val_elem = $(`<input class="upper_value"/>`).val(options.values[1]);
            let upper_span_elem = $(`<input class="upper_value"/>`).val(options.values[1]);
            elem.append(lower_span_elem)
                .append(lower_val_elem)
                .append(upper_span_elem)
                .append(upper_val_elem);
    
            // create slider object
            slider = new SliderWidget(elem, options);
    
            assert.strictEqual(slider.handles.length, 2);
            assert.strictEqual(slider.range, true);
            assert.strictEqual(slider.range_true, true);
            assert.strictEqual(slider.handles[0].value, options.values[0]);
            assert.strictEqual(slider.handles[1].value, options.values[1]);
        });
    
        /* slider with range set to max - user can only choose a maximum value */
        QUnit.test('slider with max range', assert => {
            elem.css("width", `${dim}px`);
            slider = new SliderWidget(elem, options);

            options.range = 'max';
            elem.css('height', dim + 'px');
            slider = new SliderWidget(elem, options);
    
            assert.strictEqual(slider.handles.length, 1);
            assert.strictEqual(slider.range, 'max');
            assert.strictEqual(slider.range_max, true);
            // track has to start at right edge instead of left
            assert.strictEqual(
                slider.slider_track.track_elem.css('right'),
                '0px'
            );
        });
    
        /* vertical slider with range set to max */
        QUnit.test('range_max & vertical', assert => {
            elem.css("height", `${dim}px`);
            slider = new SliderWidget(elem, options);

            options.orientation = 'vertical';
            options.range = 'max';
            elem.css('height', dim + 'px');
            slider = new SliderWidget(elem, options);
    
            // track has to start at bottom edge instead of top
            assert.strictEqual(slider.slider_track.track_elem.css('bottom'), '0px');
            assert.strictEqual(slider.slider_track.track_elem.css('top'), '0px');
        });
    
        /* slider with minimum and maximum value,
            to be rounded to a step value,
            and an initial value */
        QUnit.test('min/max/step/value', assert => {
            elem.css("width", `${dim}px`);
            slider = new SliderWidget(elem, options);

            value = 50;
            options.min = 30;
            options.max = 500;
            options.step = 25;
            elem.css('height', dim + 'px');
            $('.slider_value', elem).val(value);
            slider = new SliderWidget(elem, options);
    
            assert.strictEqual(slider.min, options.min);
            assert.strictEqual(slider.max, options.max);
            assert.strictEqual(slider.step, options.step);
            assert.strictEqual(parseInt(slider.handles[0].value), value);
        });
    
        /* slider with custom handle diameter and track thickness */
        QUnit.test('handle_diameter/thickness', assert => {
            elem.css("width", `${dim}px`);
            slider = new SliderWidget(elem, options);

            options.handle_diameter = 30;
            options.thickness = 50;
            elem.css('height', dim + 'px');
            slider = new SliderWidget(elem, options);
    
            // default dimensions get overriden by options parameters
            assert.strictEqual(slider.handle_diameter, options.handle_diameter);
            assert.strictEqual(slider.thickness, options.thickness);
            assert.strictEqual(slider.handles[0].elem.css('width'),
                               options.handle_diameter + 'px');
            assert.strictEqual(slider.handles[0].elem.css('height'),
                               options.handle_diameter + 'px');
            assert.strictEqual(slider.slider_track.track_elem.css('height'),
                               options.thickness + 'px');
        });
    });

    QUnit.test('value setter', assert => {
        elem.css("width", `${dim}px`);
        $('.slider_value', elem).val(0);
        slider = new SliderWidget(elem, options);

        slider.handles[0].value = 300;
        assert.strictEqual(slider.handles[0].value, 0);

        slider.handles[0].value = -200;
        assert.strictEqual(slider.handles[0].value, 0);
    });

    QUnit.module('handle_singletouch', () => {

        /* default slider with no additional options given */
        QUnit.module('default', hooks => {
            hooks.beforeEach(() => {
                elem.css("width", `${dim}px`);
                $('.slider_value', elem).val(0);
                slider = new SliderWidget(elem, options);
            });
            QUnit.test('mousedown', assert => {
                let handle = slider.handles[0];
                let x = 100;
                let evt = new $.Event('mousedown', {pageY: false, pageX: x});
                slider.slider_elem.trigger(evt);

                let offset = slider.elem.offset().left;
                let pos = x - offset;
                let val = transform(pos, 'range', dim, 0, 100);

                // actual position equals calculated position
                assert.strictEqual(handle.pos, pos);
                assert.strictEqual(handle.value, val);
                assert.strictEqual(slider.slider_track.track_elem.css('width'), pos + 'px');
            });
            QUnit.test('touch', assert => {
                let handle = slider.handles[0];
                let x = 100;
                let evt = new $.Event('touchstart');
                evt.touches = [{pageX: x, pageY: 0}];
                slider.slider_elem.trigger(evt);

                let offset = slider.elem.offset().left;
                let pos = x - offset;
                let val = transform(pos, 'range', dim, 0, 100);

                // actual position equals calculated position
                assert.strictEqual(handle.pos, pos);
                assert.strictEqual(handle.value, val);
                assert.strictEqual(slider.slider_track.track_elem.css('width'), pos + 'px');
            });
        });

        /* vertical slider with no additional options given */
        QUnit.module('vertical', hooks => {
            hooks.beforeEach(() => {
                // with a vertical slider, height has to be specified
                options.orientation = 'vertical';
                options.height = dim;
                elem.css("height", `${dim}px`);
                $('.slider_value', elem).val(0);
                slider = new SliderWidget(elem, options);
            });
            QUnit.test('mousedown', assert => {
                let handle = slider.handles[0];
                let y = 100;
                let evt = new $.Event('mousedown', {pageY: y, pageX: 0});
                slider.slider_elem.trigger(evt);

                let offset = slider.slider_elem.offset().top;
                let pos = y - offset;
                let val = transform(pos, 'range', dim, 0, 100);

                // actual position equals calculated position
                assert.strictEqual(handle.pos, pos);
                assert.strictEqual(handle.value, val);
                // actual track height equals calculated height
                assert.strictEqual(
                    parseInt(slider.slider_track.track_elem.css('height')), 
                    parseInt(pos + 'px')
                );
            });
            QUnit.test('touch', assert => {
                let handle = slider.handles[0];
                let y = 100;
                let evt = new $.Event('touchstart');
                evt.touches = [{pageX: 0, pageY: y}];
                slider.slider_elem.trigger(evt);

                let offset = slider.slider_elem.offset().top;
                let pos = y - offset;
                let val = transform(pos, 'range', dim, 0, 100);
                assert.strictEqual(handle.pos, pos);
                assert.strictEqual(handle.value, val);
                assert.strictEqual(
                    parseInt(slider.slider_track.track_elem.css('height')), 
                    parseInt(pos + 'px')
                );
            });
        });

        /* vertical slider with two handles */
        QUnit.module('range_true', hooks => {
            hooks.beforeEach(() => {
                options.range = true;
                options.values = [50, 100];
                elem.css("width", `${dim}px`);
                $('.slider_value', elem).val(0);
                // append elements - done in widget.py
                let lower_val_elem = $(`<input class="lower_value"/>`).val(options.values[0]);
                let lower_span_elem = $(`<span class="lower_value"/>`).val(options.values[0]);
                let upper_val_elem = $(`<input class="upper_value"/>`).val(options.values[1]);
                let upper_span_elem = $(`<input class="upper_value"/>`).val(options.values[1]);
                elem.append(lower_span_elem)
                    .append(lower_val_elem)
                    .append(upper_span_elem)
                    .append(upper_val_elem);

                // create slider object
                slider = new SliderWidget(elem, options);
            });
            QUnit.test('mousedown', assert => {
                // target handle 1
                let handle = slider.handles[0];
                let x = 100;
                let evt = new $.Event('mousedown', {pageY: 0, pageX: x});
                slider.slider_elem.trigger(evt);

                let offset = slider.elem.offset().left;
                let pos = x - offset;
                let val = transform(pos, 'range', dim, 0, 100);
                let width = slider.slider_dim - pos;

                assert.strictEqual(handle.pos, pos);
                assert.strictEqual(handle.value, val);
                assert.strictEqual(slider.slider_track.track_elem.css('width'), width + 'px');
                assert.strictEqual(slider.slider_track.track_elem.css('left'), pos + 'px');

                // target handle 2
                let handle_2 = slider.handles[1];
                x = 200;
                evt = new $.Event('mousedown', {pageY: 0, pageX: x});
                slider.slider_elem.trigger(evt);

                offset = slider.elem.offset().left;
                pos = x - offset;
                val = transform(pos, 'range', dim, 0, 100);
                width = pos - slider.handles[0].pos;

                assert.strictEqual(handle_2.pos, pos);
                assert.strictEqual(handle_2.value, val);
                assert.strictEqual(slider.slider_track.track_elem.css('width'), width + 'px');
                assert.strictEqual(slider.slider_track.track_elem.css('left'),
                                slider.handles[0].pos + 'px');
            });
            QUnit.test('touch', assert => {
                // target handle 1
                let handle = slider.handles[0];
                let x = 100;
                let evt = new $.Event('touchstart');
                evt.touches = [{pageX: x, pageY: 0}];
                slider.slider_elem.trigger(evt);

                let offset = slider.elem.offset().left;
                let pos = x - offset;
                let val = transform(pos, 'range', dim, 0, 100);
                let width = slider.slider_dim - pos;

                assert.strictEqual(handle.pos, pos);
                assert.strictEqual(handle.value, val);
                assert.strictEqual(slider.slider_track.track_elem.css('width'), width + 'px');
                assert.strictEqual(slider.slider_track.track_elem.css('left'), pos + 'px');

                // target handle 2
                let handle_2 = slider.handles[1];
                x = 200;
                evt = new $.Event('touchstart');
                evt.touches = [{pageX: x, pageY: 0}];
                slider.slider_elem.trigger(evt);

                offset = slider.elem.offset().left;
                pos = x - offset;
                val = transform(pos, 'range', dim, 0, 100);
                width = pos - slider.handles[0].pos;

                assert.strictEqual(handle_2.pos, pos);
                assert.strictEqual(handle_2.value, val);
                assert.strictEqual(slider.slider_track.track_elem.css('width'), width + 'px');
                assert.strictEqual(slider.slider_track.track_elem.css('left'),
                                slider.handles[0].pos + 'px');
            });
        });

        /* slider with specified step */
        QUnit.module('step', hooks => {
            hooks.beforeEach(() => {
                options.step = 10;
                elem.css("width", `${dim}px`);
                $('.slider_value', elem).val(0);
                slider = new SliderWidget(elem, options);
            });
            QUnit.test('mousedown', assert => {
                let handle = slider.handles[0];
                let x = 100;
                let evt = new $.Event('mousedown', {pageY: false, pageX: x});
                slider.slider_elem.trigger(evt);

                let offset = slider.elem.offset().left;
                let pos = x - offset;
                let val = transform(pos, 'range', dim, 0, 100);
                let new_val = transform(val, 'step', dim, 0, 100, options.step);
                let new_pos = transform(new_val, 'screen', dim, 0, 100);
                assert.strictEqual(handle.pos, new_pos);
                assert.strictEqual(handle.value, new_val);
                assert.strictEqual(slider.slider_track.track_elem.css('width'), new_pos + 'px');
            });
            QUnit.test('touch', assert => {
                let handle = slider.handles[0];
                let x = 100;
                let evt = new $.Event('touchstart');
                evt.touches = [{pageX: x, pageY: 0}];
                slider.slider_elem.trigger(evt);

                let offset = slider.elem.offset().left;
                let pos = x - offset;
                let val = transform(pos, 'range', dim, 0, 100);
                let new_val = transform(val, 'step', dim, 0, 100, options.step);
                let new_pos = transform(new_val, 'screen', dim, 0, 100);
                assert.strictEqual(handle.pos, new_pos);
                assert.strictEqual(handle.value, new_val);
                assert.strictEqual(slider.slider_track.track_elem.css('width'), new_pos + 'px');
            });
        });
    });

    QUnit.module('SliderHandle.handle_drag', () => {
        /* range slider with two handles */
        QUnit.test('horizontal', assert => {
            elem.css("width", `${dim}px`);
            $('.slider_value', elem).val(0);
            options.range = true;
            options.values = [
                50,
                100
            ];

            // append elements - done in init.py
            let vals = options.values;
            let lower_val_elem = $(`<input class="lower_value" value="${vals[0]}"/>`);
            let lower_span_elem = $(`<span class="lower_value" value="${vals[0]}"/>`);
            let upper_val_elem = $(`<input class="upper_value" value="${vals[1]}"/>`);
            let upper_span_elem = $(`<input class="upper_value" value="${vals[1]}"/>`);

            $('.yafowil_slider')
                .append(lower_span_elem)
                .append(lower_val_elem)
                .append(upper_span_elem)
                .append(upper_val_elem);

            // create slider object
            slider = new SliderWidget(elem, options);

            // value of first handle
            let start_val = vals[0];
            let new_val = 60;
            let new_pos = transform(new_val, 'screen', dim, 0, 100);
            slider.handles[0].pos = new_pos;
            let new_dim = slider.handles[1].pos - slider.handles[0].pos;

            // create and trigger custom drag event
            const event = new $.Event('slide');
            slider.slider_elem.trigger(event);

            assert.notStrictEqual(start_val, new_val);
            assert.strictEqual(
                slider.slider_track.track_elem.css('width'),
                (new_dim) + 'px'
            );
            assert.strictEqual(
                slider.slider_track.track_elem.css('left'),
                (new_pos) + 'px'
            );

            // move first handle to center
            move_handle(assert, slider.handles[0], {
                drag_end: 100,
                assertion_value: 92,
                type: false,
                vertical: false
            });
            // attempt to move right handle beyond left handle - stops at left handle
            move_handle(assert, slider.handles[1], {
                drag_end: 0,
                assertion_value: 92,
                type: false,
                vertical: false
            });

            assert.strictEqual(slider.handles[0].value, slider.handles[1].value);
        });
        QUnit.test('vertical', assert => {
            elem.css("height", `${dim}px`);
            $('.slider_value', elem).val(0);
            options.range = true;
            let vals = options.values = [
                50,
                100
            ];
            options.orientation = 'vertical';
            options.height = dim;

            // append elements - done in init.py
            let lower_val_elem = $(`<input class="lower_value" value="${vals[0]}"/>`);
            let lower_span_elem = $(`<span class="lower_value" value="${vals[0]}"/>`);
            let upper_val_elem = $(`<input class="upper_value" value="${vals[1]}"/>`);
            let upper_span_elem = $(`<input class="upper_value" value="${vals[1]}"/>`);

            $('.yafowil_slider')
                .append(lower_span_elem)
                .append(lower_val_elem)
                .append(upper_span_elem)
                .append(upper_val_elem);

            // create slider object
            slider = new SliderWidget(elem, options);

            // value of first handle
            let start_val = vals[0];
            let new_val = 60;
            let new_pos = transform(new_val, 'screen', dim, 0, 100);
            slider.handles[0].pos = new_pos;
            let new_dim = slider.handles[1].pos - slider.handles[0].pos;

            // create and trigger custom drag event
            const event = new $.Event('slide');
            slider.slider_elem.trigger(event);

            assert.notStrictEqual(start_val, new_val);
            assert.strictEqual(
                slider.slider_track.track_elem.css('height'),
                (new_dim) + 'px'
            );
            assert.strictEqual(
                slider.slider_track.track_elem.css('top'),
                (new_pos) + 'px'
            );
        });

        QUnit.test('default - move to end', assert => {
            elem.css("width", `${dim}px`);
            $('.slider_value', elem).val(0);

            // create slider object
            slider = new SliderWidget(elem, options);

            let handle = slider.handles[0];
            move_handle(assert, handle, {
                drag_end: dim + 10, // 10px over end of slider
                assertion_value: dim,
                type: true
            });
        });
        QUnit.test('default - move to start', assert => {
            elem.css("width", `${dim}px`);
            $('.slider_value', elem).val(0);

            // create slider object
            slider = new SliderWidget(elem, options);

            let handle = slider.handles[0];
            move_handle(assert, handle, {
                drag_end: slider.offset - 10, // 10px less than start of slider
                assertion_value: 0,
                type: false
            });
        });
        QUnit.test('default - touch move to end', assert => {
            elem.css("width", `${dim}px`);
            $('.slider_value', elem).val(0);

            // create slider object
            slider = new SliderWidget(elem, options);

            let handle = slider.handles[0];
            let drag_end = dim + 10;
            let target = handle.elem;

            sendTouchEvent(0, 0, target[0], 'touchstart');
            sendTouchEvent(drag_end, 0, document, 'touchmove');
            sendTouchEvent(drag_end, 0, document, 'touchend');
            assert.strictEqual(handle.pos, dim);
        });
        QUnit.test('default - touch move to start', assert => {
            elem.css("width", `${dim}px`);
            $('.slider_value', elem).val(0);

            // create slider object
            slider = new SliderWidget(elem, options);

            let handle = slider.handles[0];
            let drag_end = slider.offset - 10;
            let target = handle.elem;

            sendTouchEvent(0, 0, target[0], 'touchstart');
            sendTouchEvent(drag_end, 0, document, 'touchmove');
            sendTouchEvent(drag_end, 0, document, 'touchend');
            assert.strictEqual(handle.pos, 0);
        });

        /* vertical slider with no additional options */
        QUnit.module('vertical', hooks => {
            hooks.beforeEach(() => {
                options.orientation = 'vertical';
                options.height = dim;
                elem.css('height', dim + 'px');
                slider = new SliderWidget(elem, options);
            });

            QUnit.test('move to end', assert => {
                let handle = slider.handles[0];
                move_handle(assert, handle, {
                    drag_end: slider.offset + dim + 10,
                    assertion_value: dim,
                    type: true,
                    vertical: true
                });
            });
            QUnit.test('move to start', assert => {
                let handle = slider.handles[0];
                move_handle(assert, handle, {
                    drag_end: slider.offset - 10,
                    assertion_value: 0,
                    type: false,
                    vertical: true
                });
            });
            QUnit.test('touch move to end', assert => {
                let handle = slider.handles[0];
                let drag_end = slider.offset + dim + 10;
                let target = handle.elem;

                sendTouchEvent(0, 0, target[0], 'touchstart');
                sendTouchEvent(0, drag_end, document, 'touchmove');
                sendTouchEvent(0, drag_end, document, 'touchend');
                assert.strictEqual(handle.pos, dim);
            });
            QUnit.test('touch move to start', assert => {
                let handle = slider.handles[0];
                let drag_end = slider.offset - 10;
                let target = handle.elem;

                sendTouchEvent(0, 0, target[0], 'touchstart');
                sendTouchEvent(0, drag_end, document, 'touchmove');
                sendTouchEvent(0, drag_end, document, 'touchend');
                assert.strictEqual(handle.pos, 0);
            });
        });

        /* slider with specified step */
        QUnit.test('step_slider move', assert => {
            options.step = 10;
            elem.css('width', dim + 'px');
            slider = new SliderWidget(elem, options);

            let handle = slider.handles[0];
            // add Integer 5 to test the value rounding to step
            let drag_end = slider.offset + slider.slider_dim / 2 + 5;
            // assertion value will be actual rounded value
            let assertion_value = slider.slider_dim / 2;
            move_handle(assert, handle, {
                drag_end: drag_end,
                assertion_value: assertion_value,
                type: true,
                vertical: false
            });
        });

        /* slider with minimum and maximum value and step */
        QUnit.test('min/max/step - move to end', assert => {
            options.min = 30;
            options.max = 500;
            options.step = 25;
            elem.css('width', dim + 'px');
            $('.slider_value', elem).val(30);
            slider = new SliderWidget(elem, options);

            let handle = slider.handles[0];

            // move handle to end
            move_handle(assert, handle, {
                drag_end: dim + 10, // 10px over end of slider,
                assertion_value: dim,
                type: true,
                vertical: false
            });

            let done2 = assert.async();
            setTimeout(() => {
                assert.strictEqual(handle.value, 500)
                done2();
                // move handle to start
                move_handle(assert, handle, {
                    drag_end: slider.offset - 10,
                    assertion_value: 0,
                    type: false,
                    vertical: false
                });
            }, 300);

            let done3 = assert.async();
            setTimeout(() => {
                assert.strictEqual(handle.value, 30)
                done3();
            }, 600);
        });
    });

    QUnit.module('SliderHandle.scroll_handle', () => {
        // create synthetic wheel events
        let scroll_down = $.event.fix(new WheelEvent("mousewheel", {
            "deltaY": 1,
            "deltaMode": 0
        }));
        let scroll_up = $.event.fix(new WheelEvent("mousewheel", {
            "deltaY": -1,
            "deltaMode": 0
        }));

        /* range slider with two handles */
        QUnit.test('range_true (horizontal)', assert => {
            options.range = true;
            options.values = [
                50,
                100
            ];

            elem.css('width', dim + 'px');

            // append elements - done in init.py
            let vals = options.values;
            let lower_val_elem = $(`<input class="lower_value" value="${vals[0]}"/>`);
            let lower_span_elem = $(`<span class="lower_value" value="${vals[0]}"/>`);
            let upper_val_elem = $(`<input class="upper_value" value="${vals[1]}"/>`);
            let upper_span_elem = $(`<input class="upper_value" value="${vals[1]}"/>`);

            $('.yafowil_slider')
                .append(lower_span_elem)
                .append(lower_val_elem)
                .append(upper_span_elem)
                .append(upper_val_elem);

            // create slider object
            slider = new SliderWidget(elem, options);

            slider.handles[1].selected = true;

            // trigger scroll upward
            for (let i = 0; i < 50; i++) {
                slider.elem.trigger(scroll_up);
            }
            assert.strictEqual(slider.handles[1].pos, slider.handles[0].pos);
            assert.strictEqual(slider.handles[1].value, slider.handles[0].value);

            // trigger scroll to end
            for (let i = 0; i < 50; i++) {
                slider.elem.trigger(scroll_down);
            }
            assert.strictEqual(slider.handles[1].pos, dim);
            assert.strictEqual(slider.handles[1].value, slider.max);

            slider.handles[0].selected = true;
            for (let i = 0; i < 50; i++) {
                slider.elem.trigger(scroll_down);
            }
            assert.strictEqual(slider.handles[0].pos, dim);
            assert.strictEqual(slider.handles[0].value, slider.max);
        });
        QUnit.test('range_true (vertical)', assert => {
            options.range = true;
            let vals = options.values = [
                50,
                100
            ];
            elem.css('height', dim + 'px');
            options.orientation = 'vertical';
            options.height = dim;

            // append elements - done in init.py
            let lower_val_elem = $(`<input class="lower_value" value="${vals[0]}"/>`);
            let lower_span_elem = $(`<span class="lower_value" value="${vals[0]}"/>`);
            let upper_val_elem = $(`<input class="upper_value" value="${vals[1]}"/>`);
            let upper_span_elem = $(`<input class="upper_value" value="${vals[1]}"/>`);

            $('.yafowil_slider')
                .append(lower_span_elem)
                .append(lower_val_elem)
                .append(upper_span_elem)
                .append(upper_val_elem);

            // create slider object
            slider = new SliderWidget(elem, options);

            slider.handles[1].selected = true;

            // trigger scroll upward
            for (let i = 0; i < 50; i++) {
                slider.elem.trigger(scroll_up);
            }
            assert.strictEqual(slider.handles[1].pos, slider.handles[0].pos);
            assert.strictEqual(slider.handles[1].value, slider.handles[0].value);

            // trigger scroll to end
            for (let i = 0; i < 50; i++) {
                slider.elem.trigger(scroll_down);
            }
            assert.strictEqual(slider.handles[1].pos, dim);
            assert.strictEqual(slider.handles[1].value, slider.max);

            slider.handles[0].selected = true;
            for (let i = 0; i < 50; i++) {
                slider.elem.trigger(scroll_down);
            }
            assert.strictEqual(slider.handles[0].pos, dim);
            assert.strictEqual(slider.handles[0].value, slider.max);
        });

        /* default slider with no additional options */
        QUnit.test('move to end/start', assert => {
            elem.css('width', dim + 'px');
            slider = new SliderWidget(elem, options);
            slider.handles[0].selected = true;

            // trigger scroll downward
            for (let i = 0; i < 100; i++) {
                slider.elem.trigger(scroll_down);
            }
            assert.strictEqual(slider.handles[0].pos, dim);
            assert.strictEqual(slider.handles[0].value, slider.max);

            // trigger scroll upward
            for (let i = 0; i < 100; i++) {
                slider.elem.trigger(scroll_up);
            }
            assert.strictEqual(slider.handles[0].pos, 0);
            assert.strictEqual(slider.handles[0].value, slider.min);
        });

        /* vertical slider with no additional options */
        QUnit.test('move to end/start (vertical)', assert => {
            options.orientation = 'vertical';
            options.height = dim;
            elem.css('height', dim + 'px');
            slider = new SliderWidget(elem, options);

            slider.handles[0].selected = true;

            // trigger scroll downward
            for (let i = 0; i < 100; i++) {
                slider.elem.trigger(scroll_down);
            }
            assert.strictEqual(slider.handles[0].pos, dim);
            assert.strictEqual(slider.handles[0].value, slider.max);

            // trigger scroll upward
            for (let i = 0; i < 100; i++) {
                slider.elem.trigger(scroll_up);
            }
            assert.strictEqual(slider.handles[0].pos, 0);
            assert.strictEqual(slider.handles[0].value, slider.min);
        });

        /* slider with specified step */
        QUnit.test('step', assert => {
            options.step = 10;
            elem.css('width', dim + 'px');
            slider = new SliderWidget(elem, options);

            slider.handles[0].selected = true;

            // trigger scroll downward
            for (let i = 1; i < 4; i++) {
                slider.elem.trigger(scroll_down);
                assert.strictEqual(slider.handles[0].value, slider.scroll_step * i);
            }
            let val = slider.handles[0].value;
            // trigger scroll upnward
            for (let i = 1; i < 4; i++) {
                slider.elem.trigger(scroll_up);
                assert.strictEqual(slider.handles[0].value, val - slider.scroll_step * i);
            }
        });

        /* slider with specified scroll step */
        QUnit.test('move', assert => {
            options.scroll_step = 20;
            elem.css('width', dim + 'px');
            slider = new SliderWidget(elem, options);

            slider.handles[0].selected = true;

            // trigger scroll downward
            for (let i = 1; i < 4; i++) {
                slider.elem.trigger(scroll_down);
                assert.strictEqual(slider.handles[0].value, slider.scroll_step * i);
            }
            let val = slider.handles[0].value;
            // trigger scroll upnward
            for (let i = 1; i < 4; i++) {
                slider.elem.trigger(scroll_up);
                assert.strictEqual(slider.handles[0].value, val - slider.scroll_step * i);
            }
        });
    });

    QUnit.module('SliderHandle.key_handle', () => {
        // create synthetic key events
        let arrow_left = new KeyboardEvent("keydown", {
            key: "ArrowLeft"
        });
        let arrow_right = new KeyboardEvent("keydown", {
            key: "ArrowRight"
        });
        let arrow_up = new KeyboardEvent("keydown", {
            key: "ArrowUp"
        });
        let arrow_down = new KeyboardEvent("keydown", {
            key: "ArrowDown"
        });

        /* range slider with two handles */
        QUnit.test('horizontal', assert => {
            options.range = true;
            options.values = [
                50,
                100
            ];

            elem.css('width', dim + 'px');

            // append elements - done in init.py
            let vals = options.values;
            let lower_val_elem = $(`<input class="lower_value" value="${vals[0]}"/>`);
            let lower_span_elem = $(`<span class="lower_value" value="${vals[0]}"/>`);
            let upper_val_elem = $(`<input class="upper_value" value="${vals[1]}"/>`);
            let upper_span_elem = $(`<input class="upper_value" value="${vals[1]}"/>`);

            $('.yafowil_slider')
                .append(lower_span_elem)
                .append(lower_val_elem)
                .append(upper_span_elem)
                .append(upper_val_elem);

            // create slider object
            slider = new SliderWidget(elem, options);

            slider.handles[1].selected = true;

            // trigger keyleft presses
            for (let i = 0; i < 50; i++) {
                document.dispatchEvent(arrow_left);
            }
            assert.strictEqual(slider.handles[1].pos, slider.handles[0].pos);
            assert.strictEqual(slider.handles[1].value, slider.handles[0].value);

            // trigger keyright presses
            for (let i = 0; i < 50; i++) {
                document.dispatchEvent(arrow_right);
            }
            assert.strictEqual(slider.handles[1].pos, dim);
            assert.strictEqual(slider.handles[1].value, slider.max);

            slider.handles[0].selected = true;
            for (let i = 0; i < 50; i++) {
                document.dispatchEvent(arrow_right);
            }
            assert.strictEqual(slider.handles[0].pos, dim);
            assert.strictEqual(slider.handles[0].value, slider.max);
        });
        QUnit.test('vertical', assert => {
            options.range = true;
            let vals = options.values = [
                50,
                100
            ];
            options.orientation = 'vertical';
            options.height = dim;
            elem.css('height', dim + 'px');

            // append elements - done in init.py
            let lower_val_elem = $(`<input class="lower_value" value="${vals[0]}"/>`);
            let lower_span_elem = $(`<span class="lower_value" value="${vals[0]}"/>`);
            let upper_val_elem = $(`<input class="upper_value" value="${vals[1]}"/>`);
            let upper_span_elem = $(`<input class="upper_value" value="${vals[1]}"/>`);

            $('.yafowil_slider')
                .append(lower_span_elem)
                .append(lower_val_elem)
                .append(upper_span_elem)
                .append(upper_val_elem);

            // create slider object
            slider = new SliderWidget(elem, options);

            slider.handles[1].selected = true;

            // trigger keyup presses
            for (let i = 0; i < 50; i++) {
                document.dispatchEvent(arrow_up);
            }
            assert.strictEqual(slider.handles[1].pos, slider.handles[0].pos);
            assert.strictEqual(slider.handles[1].value, slider.handles[0].value);

            // trigger keydown presses
            for (let i = 0; i < 50; i++) {
                document.dispatchEvent(arrow_down);
            }
            assert.strictEqual(slider.handles[1].pos, dim);
            assert.strictEqual(slider.handles[1].value, slider.max);

            slider.handles[0].selected = true;
            for (let i = 0; i < 50; i++) {
                document.dispatchEvent(arrow_down);
            }
            assert.strictEqual(slider.handles[0].pos, dim);
            assert.strictEqual(slider.handles[0].value, slider.max);
        });
    });

    QUnit.module('custom event dispatch', () =>{
        QUnit.test('custom event dispatch', assert => {
            elem.css("width", `${dim}px`);
            $('.slider_value', elem).val(0);

            // add event listeners for custom event
            elem.on('slidestart', e => {
                assert.step('slidestart');
                assert.strictEqual(e.value, slider.handles[0].value);
                assert.strictEqual(e.handleIndex, 0);
                assert.strictEqual(e.handle, slider.handles[0].elem);
            });
            elem.on('slide', e => {
                assert.step('slide');
                assert.strictEqual(e.value, slider.handles[0].value);
                assert.strictEqual(e.handleIndex, 0);
                assert.strictEqual(e.handle, slider.handles[0].elem);
            });
            elem.off('slidestop').on('slidestop', e => {
                assert.step('slidestop');
                assert.strictEqual(e.value, slider.handles[0].value);
                assert.strictEqual(e.handleIndex, 0);
                assert.strictEqual(e.handle, slider.handles[0].elem);
            });
            elem.off('slidechange').on('slidechange', e => {
                assert.step('change');
            });
            elem.on('slidecreate', e => {
                assert.step('slidecreate');
            });

            // create slider object
            slider = new SliderWidget(elem, options);
            let handle = slider.handles[0];
            let target = handle.elem;

            // slidecreate on initialization
            assert.verifySteps(['change', 'slidecreate']);

            // invoke slidestart
            target.trigger('mousedown');
            assert.verifySteps(['slidestart']);

            // invoke slidestop
            document.dispatchEvent(new MouseEvent("mouseup", {}));
            assert.verifySteps(['slidestop']);

            // invoke move
            move_handle(assert, handle, {
                drag_end: slider.offset + 10, // 10px over start of slider,
                assertion_value: 10,
                type: true,
                vertical: false,
                verify: function() {
                    let arr = ['slidestart'];
                    for (let i = 0; i < 8; i++) {
                        arr.push('slide');
                    }
                    for(let i = 0; i < 5; i++) {
                        arr.push('change');
                        arr.push('slide');
                        arr.push('slide');
                    }
                    arr.push('slidestop');
                    assert.verifySteps(arr);
                },
                movestep: 1
            });
        });

        QUnit.test('custom event dispatch - scroll/step/key', assert => {
            let scroll_down = $.event.fix(new WheelEvent("mousewheel", {
                "deltaY": 1,
                "deltaMode": 0
            }));
            let scroll_up = $.event.fix(new WheelEvent("mousewheel", {
                "deltaY": -1,
                "deltaMode": 0
            }));
            let arrow_left = new KeyboardEvent("keydown", {
                key: "ArrowLeft"
            });
            let arrow_right = new KeyboardEvent("keydown", {
                key: "ArrowRight"
            });

            elem.css("width", `${dim}px`);
            $('.slider_value', elem).val(0);

            // add event listeners for custom event
            elem.on('slidestart', e => {
                assert.step('slidestart');
            });
            elem.on('slide', e => {
                assert.step('slide');
            });
            elem.on('slidestop', e => {
                assert.step('slidestop');
            });
            elem.on('slidechange', e => {
                assert.step('change');
            });

            // create slider object
            options.step = 10;
            slider = new SliderWidget(elem, options);
            let handle = slider.handles[0];

            // slidecreate on initialization
            assert.verifySteps(['change']);

            handle.selected = true;
            // trigger scroll downward
            for (let i = 1; i < 4; i++) {
                slider.elem.trigger(scroll_down);
                assert.strictEqual(slider.handles[0].value, slider.scroll_step * i);
                assert.verifySteps(['change']);
            }
            let val = handle.value;
            // trigger scroll upward
            for (let i = 1; i < 4; i++) {
                slider.elem.trigger(scroll_up);
                assert.strictEqual(slider.handles[0].value, val - slider.scroll_step * i);
                assert.verifySteps(['change']);
            }
            // trigger keyright presses
            for (let i = 0; i < 4; i++) {
                document.dispatchEvent(arrow_right);
                assert.verifySteps(['change']);
            }
            // trigger keyleft presses
            for (let i = 0; i < 4; i++) {
                document.dispatchEvent(arrow_left);
                assert.verifySteps(['change']);
            }
        });
    });
});

////////////////////////////////////////////////////////////////////////////////
// various window resize functionality
////////////////////////////////////////////////////////////////////////////////

QUnit.module('resize_handle', hooks => {
    let options = {};
    let elem;
    let slider;
    // set width and dim property to 100% to allow for container dimension change
    let container = $('<div id="container" style="width:100%"/>');
    let dim = '100%';

    hooks.before(() => {
        $('body').append(container);
    });
    hooks.beforeEach(() => {
        elem = $(`
            <div class="yafowil_slider" id="test-slider">
              <input class="slider_value" type="text" value="0">
              <div class="slider" />
            </div>
        `);

        $('#container').append(elem);
    });
    hooks.afterEach(() => {
        elem = null;
        slider = null;
        options = {};
        container.empty();
        // reset viewport to initial value after tests
        viewport.set(base_width, base_height);
    });
    hooks.after(() => {
        container.remove();
    });

    QUnit.test('resize', assert => {
        options.value = 50;
        elem.css('height', dim + 'px');
        $('.slider_value', elem).val(options.value);
        slider = new SliderWidget(elem, options);
        let handle = slider.handles[0];

        // variables before resize
        let dim_before = slider.slider_dim;
        let pos_before = handle.pos;
        let track_val_before = slider.slider_track.track_elem.css('width');

        // resize viewport
        let new_window_width = 320;
        viewport.set(new_window_width);
        $(window).trigger('resize');

        // variables and positions after resize
        assert.notStrictEqual(pos_before, handle.pos);
        assert.notStrictEqual(dim_before, slider.slider_dim);
        assert.notStrictEqual(
            track_val_before,
            slider.slider_track.track_elem.css('width')
        );
    });

    QUnit.test('unload', assert => {
        options.value = 50;
        elem.css('height', dim + 'px');
        $('.slider_value', elem).val(options.value);
        slider = new SliderWidget(elem, options);
        let handle = slider.handles[0];

        let pos_before = handle.pos;
        let track_val_before = slider.slider_track.track_elem.css('width');

        // trigger unload
        slider.unload();

        // resize viewport
        let new_window_width = 320;
        viewport.set(new_window_width);
        $(window).trigger('resize');

        // scroll events unbound
        let scroll_down = $.event.fix(new WheelEvent("mousewheel", {
            "deltaY": 1,
            "deltaMode": 0
        }));
        slider.elem.trigger(scroll_down);

        // key events unbound
        let arrow_left = new KeyboardEvent("keydown", {
            key: "ArrowLeft"
        });
        document.dispatchEvent(arrow_left);

        // triggered events invoke no change
        assert.strictEqual(pos_before, handle.pos);
        assert.strictEqual(
            track_val_before,
            slider.slider_track.track_elem.css('width')
        );
    });
});

////////////////////////////////////////////////////////////////////////////////
// helper functions
////////////////////////////////////////////////////////////////////////////////

function move_handle(assert, handle, specs) {
    /* 
        type=true for value increase,
        type=false for value decrease
    */

    let target = handle.elem;
    let changed_coord = handle.pos; // the coordinate (x or y) which is going to be changed
    let done = assert.async(); // we need asynchronous testing for mousemove

    if (!specs.movestep) {
        // default increase/decrease by 5px for performance
        specs.movestep = 5;
    }

    function move() {
        // if type is increase, increase value
        if (specs.type) {
            changed_coord += specs.movestep;
        } else {
            changed_coord -= specs.movestep;
        }
        // check if handle has already met the given drag end point
        let isMoving = specs.type ? (changed_coord < specs.drag_end) : (changed_coord > specs.drag_end);

        // options are required to create a MouseEvent
        let options  = {
            view: window,
            bubbles: true,
            cancelable: true
        };

        // set coordinates
        if (specs.vertical) {
            options.clientX = 0;
            options.clientY = changed_coord;
        } else {
            options.clientX = changed_coord;
            options.clientY = 0;
        }

        // create MouseEvent and dispatch to handle element (native js)
        let ev = new MouseEvent("mousemove", options);
        target[0].dispatchEvent(ev);

        // if handle has not met drag end, continue moving
        if (isMoving) {
            setTimeout(() => {
                move();
            }, 1);
        } else {
            // create and trigger mouseup event
            let ev = new MouseEvent("mouseup", {});
            document.dispatchEvent(ev);
            done();

            // assert here:
            // position of handle equals given value
            assert.strictEqual(
                parseInt(handle.pos),
                parseInt(specs.assertion_value)
            );

            if (specs.verify) {
                specs.verify();
            }
        }
    }

    // trigger mousedown and start moving process
    target.trigger('mousedown');
    move();
}

function sendTouchEvent(x, y, element, eventType) {
    /* dispatch a TouchEvent with given options */

    // create the touch - options are required!
    const touchObj = new Touch({
        identifier: Date.now(),
        target: element,
        pageX: x,
        pageY: y,
        radiusX: 2.5,
        radiusY: 2.5,
        rotationAngle: 10,
        force: 0.5,
    });

    // create the touch event - options are required!
    const touchEvent = new TouchEvent(eventType, {
        cancelable: true,
        bubbles: true,
        touches: [touchObj],
        targetTouches: [],
        changedTouches: [touchObj],
        shiftKey: true,
    });

    // dispatch touch event
    element.dispatchEvent(touchEvent);
}