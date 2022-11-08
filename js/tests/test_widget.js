import $ from 'jquery';
import {
    Slider,
    SliderHandle,
    SliderWidget,
    lookup_callback
} from '../src/widget';

QUnit.module('slider_widget', hooks => {
    const container = $('<div />');

    hooks.before(() => {
        $('body').append(container);
    });

    hooks.afterEach(() => {
        container.empty();
    });

    hooks.after(() => {
        container.remove();
    });

    QUnit.test('lookup_callback', assert => {
        window.namespace = {
            callback: function() {}
        };

        assert.strictEqual(lookup_callback(), null);
        assert.deepEqual(
            lookup_callback('namespace.callback'),
            window.namespace.callback
        );
        assert.raises(function() {
            lookup_callback('inexistent');
        }, "'inexistent' not found.");

        delete window.namespace;
    });

    QUnit.test('SliderHandle.constructor', assert => {
        const elem = $('<div />').css('width', 100).appendTo(container);
        const slider = new Slider(elem, {});
        const handle = slider.handles[0];

        assert.deepEqual(handle.slider, slider);
        assert.deepEqual(handle.elem.data('slider-handle'), handle);

        assert.deepEqual(elem.position(), handle.elem.position());
        assert.deepEqual(elem.children()[0], handle.elem[0]);

        assert.true(handle.elem.hasClass('slider-handle'));
        assert.strictEqual(handle.elem.width(), 20);
        assert.strictEqual(handle.elem.height(), 20);

        assert.strictEqual(handle.index, 0);
        assert.strictEqual(handle.value, 0);
        assert.false(handle.selected);
    });

    QUnit.test('SliderHandle._align_value', assert => {
        const slider = {
            elem: $('<div />'),
            handle_diameter: 20,
        };
        const handle = new SliderHandle(slider, 0, 0);

        assert.deepEqual(handle._align_value(1, 0, false), 1);

        assert.deepEqual(handle._align_value(0, 0, 10), 0);
        assert.deepEqual(handle._align_value(100, 0, 10), 100);

        assert.deepEqual(handle._align_value(4, 0, 10), 0);
        assert.deepEqual(handle._align_value(5, 0, 10), 10);

        assert.deepEqual(handle._align_value(94, 0, 10), 90);
        assert.deepEqual(handle._align_value(95, 0, 10), 100);

        assert.deepEqual(handle._align_value(25, 25, 5), 25);
        assert.deepEqual(handle._align_value(26, 25, 5), 25);

        assert.deepEqual(handle._align_value(28, 25, 5), 30);
        assert.deepEqual(handle._align_value(30, 25, 5), 30);
        assert.deepEqual(handle._align_value(32, 25, 5), 30);

        assert.deepEqual(handle._align_value(68, 25, 5), 70);
        assert.deepEqual(handle._align_value(70, 25, 5), 70);
        assert.deepEqual(handle._align_value(72, 25, 5), 70);

        assert.deepEqual(handle._align_value(74, 25, 5), 75);
        assert.deepEqual(handle._align_value(75, 25, 5), 75);

        assert.deepEqual(handle._align_value(-9, -9, 3), -9);
        assert.deepEqual(handle._align_value(-8, -9, 3), -9);

        assert.deepEqual(handle._align_value(-7, -9, 3), -6);
        assert.deepEqual(handle._align_value(-6, -9, 3), -6);
        assert.deepEqual(handle._align_value(-5, -9, 3), -6);

        assert.deepEqual(handle._align_value(-2, -9, 3), -3);
        assert.deepEqual(handle._align_value(-1, -9, 3), 0);
        assert.deepEqual(handle._align_value(0, -9, 3), 0);
        assert.deepEqual(handle._align_value(1, -9, 3), 0);
        assert.deepEqual(handle._align_value(2, -9, 3), 3);

        assert.deepEqual(handle._align_value(7, -9, 3), 6);
        assert.deepEqual(handle._align_value(6, -9, 3), 6);
        assert.deepEqual(handle._align_value(5, -9, 3), 6);

        assert.deepEqual(handle._align_value(9, -9, 3), 9);
        assert.deepEqual(handle._align_value(8, -9, 3), 9);
    });

    QUnit.test('SliderHandle.value -> horizontal', assert => {
        const elem = $('<div />').css('width', 200).appendTo(container);
        const slider = new Slider(elem, {});
        const handle = slider.handles[0];

        assert.strictEqual(slider.min, 0);
        assert.strictEqual(slider.max, 100);

        assert.strictEqual(handle.value, 0);
        assert.strictEqual(handle.pos, 0);

        handle.value = -10;
        assert.strictEqual(handle.value, 0);
        handle.value = 110;
        assert.strictEqual(handle.value, 100);

        handle.value = 0;
        assert.strictEqual(handle.pos, 0);
        handle.value = 25;
        assert.strictEqual(handle.pos, 50);
        handle.value = 75;
        assert.strictEqual(handle.pos, 150);
        handle.value = 100;
        assert.strictEqual(handle.pos, 200);

        slider.min = 50;
        handle.value = 50;
        assert.strictEqual(handle.pos, 0);
        handle.value = 75;
        assert.strictEqual(handle.pos, 100);
        handle.value = 100;
        assert.strictEqual(handle.pos, 200);

        slider.min = 0;
        slider.max = 50;
        handle.value = 0;
        assert.strictEqual(handle.pos, 0);
        handle.value = 25;
        assert.strictEqual(handle.pos, 100);
        handle.value = 50;
        assert.strictEqual(handle.pos, 200);

        slider.min = 25;
        slider.max = 75;
        handle.value = 25;
        assert.strictEqual(handle.pos, 0);
        handle.value = 50;
        assert.strictEqual(handle.pos, 100);
        handle.value = 75;
        assert.strictEqual(handle.pos, 200);

        slider.step = 10;
        handle.value = 29;
        assert.strictEqual(handle.value, 25);
        assert.strictEqual(handle.pos, 0);
        handle.value = 30;
        assert.strictEqual(handle.value, 35);
        assert.strictEqual(handle.pos, 40);
        handle.value = 60;
        assert.strictEqual(handle.value, 65);
        assert.strictEqual(handle.pos, 160);
        handle.value = 71;
        assert.strictEqual(handle.value, 75);
        assert.strictEqual(handle.pos, 200);
    });
});

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

let base_width = $(window).width();
let base_height = $(window).height();

function do_move_handle(assert, handle, specs) {
    // type=true for value increase,
    // type=false for value decrease

    let target = handle.elem;
    // the coordinate (x or y) which is going to be changed
    let changed_coord = handle.pos;
    // we need asynchronous testing for mousemove
    let done = assert.async();

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
        let isMoving =
            specs.type ?
            (changed_coord < specs.drag_end) :
            (changed_coord > specs.drag_end);

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
        let ev = new MouseEvent('mousemove', options);
        target[0].dispatchEvent(ev);

        // if handle has not met drag end, continue moving
        if (isMoving) {
            setTimeout(() => {
                move();
            }, 1);
        } else {
            // create and trigger mouseup event
            let ev = new MouseEvent('mouseup', {});
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

function send_touch_event(x, y, element, eventType) {
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

QUnit.module('slider_widget', hooks => {

    let options = {};
    let elem;
    let widget;
    let slider;
    let container = $('<div id="container" />');
    let len = 200;
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
        widget = null;
        slider = null;
        elem = null;
        value = null;
        options = {};
        container.empty();
    });

    hooks.after(() => {
        container.empty();
        container.remove();
        widget = null;
        slider = null;
        elem = null;
        value = null;
        options = null;
    });

    /* test initialize function */
    QUnit.skip('initialize()', assert => {
        // create options and set as data attribute
        options = {
            handle_diameter: 11,
            thickness: 9,
            min: 3,
            max: 231,
            step: 5
        }
        elem.data(options);

        SliderWidget.initialize();
        widget = elem.data('yafowil-slider');
        slider = widget.slider;

        // options and element are correctly initialized
        assert.deepEqual(options, {
            handle_diameter: slider.handle_diameter,
            thickness: slider.thickness,
            min: slider.min,
            max: slider.max,
            step: slider.step
        });
        assert.deepEqual(elem, widget.elem);
    });

    QUnit.module('constructor', () => {

        /* slider without additional options given */
        QUnit.skip('default slider', assert => {
            widget = new SliderWidget(elem, options);
            slider = widget.slider;

            // correct elements
            assert.deepEqual(widget.elem, elem);
            assert.ok(slider.elem.is('div.slider'));
            // function exists
            assert.ok(slider._on_down);
            // only one handle exists
            assert.strictEqual(slider.handles.length, 1);
            // handle is unselected
            assert.false(slider.handles[0].selected);
            // no range specified
            assert.strictEqual(slider.range, false);
            // default diameter and thickness applied
            assert.strictEqual(slider.handle_diameter, 20);
            assert.strictEqual(slider.thickness, 8);
            assert.strictEqual(slider.elem.css('height'), '20px');
            // default min/max applied
            assert.strictEqual(slider.min, 0);
            assert.strictEqual(slider.max, 100);
            // default value applied
            assert.strictEqual(slider.value, 0);
            assert.strictEqual(slider.handles[0].value, 0);
            // no step specified
            assert.strictEqual(slider.step, false);
            // default horizontal orientation
            assert.strictEqual(slider.vertical, false);
            assert.strictEqual(slider.track.len_attr, 'width');
            assert.strictEqual(slider.dir_attr, 'left');
        });
    
        /* slider with vertical orientation */
        QUnit.skip('vertical', assert => {
            options.orientation = 'vertical';
            options.height = len;
            widget = new SliderWidget(elem, options);
            slider = widget.slider
    
            assert.strictEqual(slider.vertical, true);
            assert.strictEqual(slider.track.len_attr, 'height');
            assert.strictEqual(slider.dir_attr, 'top');
            assert.ok(slider.elem.hasClass('slider-vertical'));
            assert.strictEqual(slider.elem.css('width'), '20px');
            assert.strictEqual(slider.offset, slider.elem.offset().top);
        });
    
        /* range slider - two handles */
        QUnit.skip('slider with range', assert => {
            options.range = true;
            options.value = [50, 100];
    
            // append corresponding input and span elements to slider - done in widget.py
            let lower_val_elem = $(`<input class="lower_value"/>`).val(options.value[0]);
            let lower_span_elem = $(`<span class="lower_value"/>`).val(options.value[0]);
            let upper_val_elem = $(`<input class="upper_value"/>`).val(options.value[1]);
            let upper_span_elem = $(`<input class="upper_value"/>`).val(options.value[1]);
            elem.append(lower_span_elem)
                .append(lower_val_elem)
                .append(upper_span_elem)
                .append(upper_val_elem);
    
            // create slider object
            widget = new SliderWidget(elem, options);
            slider = widget.slider;
    
            assert.strictEqual(slider.handles.length, 2);
            assert.strictEqual(slider.range, true);
            assert.strictEqual(slider.handles[0].value, options.value[0]);
            assert.strictEqual(slider.handles[1].value, options.value[1]);
        });
    
        /* slider with range set to max - user can only choose a maximum value */
        QUnit.skip('slider with max range', assert => {
            options.range = 'max';
            widget = new SliderWidget(elem, options);
            slider = widget.slider;
    
            assert.strictEqual(slider.handles.length, 1);
            assert.strictEqual(slider.range, 'max');
            // track has to start at right edge instead of left
            assert.strictEqual(slider.track.range_elem.css('right'), '0px');
        });
    
        /* vertical slider with range set to max */
        QUnit.skip('range max & vertical', assert => {
            options.orientation = 'vertical';
            options.range = 'max';
            widget = new SliderWidget(elem, options);
            slider = widget.slider;
    
            // track has to start at bottom edge instead of top
            assert.strictEqual(slider.track.range_elem.css('bottom'), '0px');
            assert.strictEqual(slider.track.range_elem.css('top'), '0px');
        });
    
        /* slider with minimum and maximum value, to be rounded to a step
         * value, and an initial value */
        QUnit.skip('min/max/step/value', assert => {
            value = 50;
            $('.slider_value', elem).val(value);

            options.min = 30;
            options.max = 500;
            options.step = 25;
            widget = new SliderWidget(elem, options);
            slider = widget.slider;
    
            assert.strictEqual(slider.min, options.min);
            assert.strictEqual(slider.max, options.max);
            assert.strictEqual(slider.step, options.step);
            assert.strictEqual(parseInt(slider.handles[0].value), value);
        });
    
        /* slider with custom handle diameter and track thickness */
        QUnit.skip('handle_diameter/thickness', assert => {
            options.handle_diameter = 30;
            options.thickness = 50;
            options.range = true;
            widget = new SliderWidget(elem, options);
            slider = widget.slider;
    
            // default dimensions get overriden by options parameters
            assert.strictEqual(slider.handle_diameter, options.handle_diameter);
            assert.strictEqual(slider.thickness, options.thickness);
            assert.strictEqual(
                slider.handles[0].elem.css('width'),
                `${options.handle_diameter}px`
            );
            assert.strictEqual(
                slider.handles[0].elem.css('height'),
                `${options.handle_diameter}px`
            );
            assert.strictEqual(
                slider.handles[1].elem.css('width'),
                `${options.handle_diameter}px`
            );
            assert.strictEqual(
                slider.handles[1].elem.css('height'),
                `${options.handle_diameter}px`
            );
            assert.strictEqual(
                slider.track.range_elem.css('height'),
                `${options.thickness}px`
            );
        });
    });

    QUnit.skip('value setter', assert => {
        $('.slider_value', elem).val(10);
        widget = new SliderWidget(elem, options);
        slider = widget.slider;

        slider.handles[0].value = 300;
        assert.strictEqual(slider.handles[0].value, 100);

        slider.handles[0].value = -200;
        assert.strictEqual(slider.handles[0].value, 0);
    });

    QUnit.module('_on_down', () => {

        /* default slider with no additional options given */
        QUnit.module('default', hooks => {

            hooks.beforeEach(() => {
                elem.css('width', `${len}px`);
                $('.slider_value', elem).val(0);
                widget = new SliderWidget(elem, options);
                slider = widget.slider;
            });

            QUnit.skip('mousedown', assert => {
                let handle = slider.handles[0];
                let x = 100;
                let evt = new $.Event('mousedown', {pageY: 0, pageX: x});
                slider.elem.trigger(evt);

                let offset = slider.elem.offset().left;
                let pos = x - offset;
                let val = transform(pos, 'range', len, 0, 100);

                // actual position equals calculated position
                assert.strictEqual(handle.pos, pos);
                assert.strictEqual(handle.value, val);
            });

            QUnit.skip('touch', assert => {
                let handle = slider.handles[0];
                let x = 100;
                let evt = new $.Event('touchstart');
                evt.touches = [{pageX: x, pageY: 0}];
                slider.elem.trigger(evt);

                let offset = slider.elem.offset().left;
                let pos = x - offset;
                let val = transform(pos, 'range', len, 0, 100);

                // actual position equals calculated position
                assert.strictEqual(handle.pos, pos);
                assert.strictEqual(handle.value, val);
            });
        });

        /* vertical slider with no additional options given */
        QUnit.module('vertical', hooks => {

            hooks.beforeEach(() => {
                // with a vertical slider, height has to be specified
                options.orientation = 'vertical';
                options.height = len;
                elem.css('height', `${len}px`);
                $('.slider_value', elem).val(0);
                widget = new SliderWidget(elem, options);
                slider = widget.slider;
            });

            QUnit.skip('mousedown', assert => {
                let handle = slider.handles[0];
                let y = 100;
                let evt = new $.Event('mousedown', {pageY: y, pageX: 0});
                slider.elem.trigger(evt);

                let offset = slider.elem.offset().top;
                let pos = y - offset;
                let val = transform(pos, 'range', len, 0, 100);

                // actual position equals calculated position
                assert.strictEqual(handle.pos, pos);
                assert.strictEqual(handle.value, val);
            });

            QUnit.skip('touch', assert => {
                let handle = slider.handles[0];
                let y = 100;
                let evt = new $.Event('touchstart');
                evt.touches = [{pageX: 0, pageY: y}];
                slider.elem.trigger(evt);

                let offset = slider.elem.offset().top;
                let pos = y - offset;
                let val = transform(pos, 'range', len, 0, 100);
                assert.strictEqual(handle.pos, pos);
                assert.strictEqual(handle.value, val);
            });
        });

        /* vertical slider with two handles */
        QUnit.module('range true', hooks => {

            hooks.beforeEach(() => {
                options.range = true;
                options.value = [50, 100];
                elem.css('width', `${len}px`);
                $('.slider_value', elem).val(0);
                let lower_val_elem = $(`<input class="lower_value"/>`)
                    .val(options.value[0]);
                let lower_span_elem = $(`<span class="lower_value"/>`)
                    .val(options.value[0]);
                let upper_val_elem = $(`<input class="upper_value"/>`)
                    .val(options.value[1]);
                let upper_span_elem = $(`<input class="upper_value"/>`)
                    .val(options.value[1]);
                elem.append(lower_span_elem)
                    .append(lower_val_elem)
                    .append(upper_span_elem)
                    .append(upper_val_elem);
                widget = new SliderWidget(elem, options);
                slider = widget.slider;
            });

            QUnit.skip('mousedown', assert => {
                // target handle 1
                let handle = slider.handles[0];
                let x = 100;
                let evt = new $.Event('mousedown', {pageY: 0, pageX: x});
                slider.elem.trigger(evt);

                let offset = slider.elem.offset().left;
                let pos = x - offset;
                let val = transform(pos, 'range', len, 0, 100);
                let width = slider.slider_len - pos;

                assert.strictEqual(handle.pos, pos);
                assert.strictEqual(handle.value, val);
                assert.strictEqual(
                    slider.track.range_elem.css('width'),
                    `${width}px`
                );
                assert.strictEqual(
                    slider.track.range_elem.css('left'),
                    `${pos}px`
                );

                // target handle 2
                let handle_2 = slider.handles[1];
                x = 200;
                evt = new $.Event('mousedown', {pageY: 0, pageX: x});
                slider.elem.trigger(evt);

                offset = slider.elem.offset().left;
                pos = x - offset;
                val = transform(pos, 'range', len, 0, 100);
                width = pos - slider.handles[0].pos;

                assert.strictEqual(handle_2.pos, pos);
                assert.strictEqual(handle_2.value, val);
                assert.strictEqual(
                    slider.track.range_elem.css('width'),
                    `${width}px`
                );
                assert.strictEqual(
                    slider.track.range_elem.css('left'),
                    `${slider.handles[0].pos}px`
                );
            });

            QUnit.skip('touch', assert => {
                // target handle 1
                let handle = slider.handles[0];
                let x = 100;
                let evt = new $.Event('touchstart');
                evt.touches = [{pageX: x, pageY: 0}];
                slider.elem.trigger(evt);

                let offset = slider.elem.offset().left;
                let pos = x - offset;
                let val = transform(pos, 'range', len, 0, 100);
                let width = slider.slider_len - pos;

                assert.strictEqual(handle.pos, pos);
                assert.strictEqual(handle.value, val);
                assert.strictEqual(
                    slider.track.range_elem.css('width'),
                    `${width}px`
                );
                assert.strictEqual(
                    slider.track.range_elem.css('left'),
                    `${pos}px`
                );

                // target handle 2
                let handle_2 = slider.handles[1];
                x = 200;
                evt = new $.Event('touchstart');
                evt.touches = [{pageX: x, pageY: 0}];
                slider.elem.trigger(evt);

                offset = slider.elem.offset().left;
                pos = x - offset;
                val = transform(pos, 'range', len, 0, 100);
                width = pos - slider.handles[0].pos;

                assert.strictEqual(handle_2.pos, pos);
                assert.strictEqual(handle_2.value, val);
                assert.strictEqual(
                    slider.track.range_elem.css('width'),
                    `${width}px`
                );
                assert.strictEqual(
                    slider.track.range_elem.css('left'),
                    `${slider.handles[0].pos}px`
                );
            });
        });

        /* slider with specified step */
        QUnit.module('step', hooks => {

            hooks.beforeEach(() => {
                options.step = 10;
                elem.css('width', `${len}px`);
                $('.slider_value', elem).val(0);
                widget = new SliderWidget(elem, options);
                slider = widget.slider;
            });

            QUnit.skip('mousedown', assert => {
                let handle = slider.handles[0];
                let x = 100;
                let evt = new $.Event('mousedown', {pageY: 0, pageX: x});
                slider.elem.trigger(evt);

                let offset = slider.elem.offset().left;
                let pos = x - offset;
                let val = transform(pos, 'range', len, 0, 100);
                let new_val = transform(val, 'step', len, 0, 100, options.step);
                let new_pos = transform(new_val, 'screen', len, 0, 100);
                assert.strictEqual(handle.pos, new_pos);
                assert.strictEqual(handle.value, new_val);
            });

            QUnit.skip('touch', assert => {
                let handle = slider.handles[0];
                let x = 100;
                let evt = new $.Event('touchstart');
                evt.touches = [{pageX: x, pageY: 0}];
                slider.elem.trigger(evt);

                let offset = slider.elem.offset().left;
                let pos = x - offset;
                let val = transform(pos, 'range', len, 0, 100);
                let new_val = transform(val, 'step', len, 0, 100, options.step);
                let new_pos = transform(new_val, 'screen', len, 0, 100);
                assert.strictEqual(handle.pos, new_pos);
                assert.strictEqual(handle.value, new_val);
            });
        });
    });

    QUnit.module('SliderHandle.on_move', () => {

        /* range slider with two handles */
        QUnit.skip('horizontal', assert => {
            elem.css('width', `${len}px`);
            $('.slider_value', elem).val(0);
            options.range = true;
            options.value = [50, 100];
            let val = options.value;
            let lower_val_elem = $(`<input class="lower_value" value="${val[0]}"/>`);
            let lower_span_elem = $(`<span class="lower_value" value="${val[0]}"/>`);
            let upper_val_elem = $(`<input class="upper_value" value="${val[1]}"/>`);
            let upper_span_elem = $(`<input class="upper_value" value="${val[1]}"/>`);
            $('.yafowil_slider')
                .append(lower_span_elem)
                .append(lower_val_elem)
                .append(upper_span_elem)
                .append(upper_val_elem);

            // create slider object
            widget = new SliderWidget(elem, options);
            slider = widget.slider;

            // value of first handle
            let start_val = val[0];
            let new_val = 60;
            let new_pos = transform(new_val, 'screen', len, 0, 100);
            slider.handles[0].pos = new_pos;
            let new_len = slider.handles[1].pos - slider.handles[0].pos;

            // create and trigger custom drag event
            const event = new $.Event('slide', {widget: slider.handles[0]});
            slider.elem.trigger(event);

            assert.notStrictEqual(start_val, new_val);
            assert.strictEqual(
                slider.track.range_elem.css('width'),
                `${new_len}px`
            );
            assert.strictEqual(
                slider.track.range_elem.css('left'),
                `${new_pos}px`
            );

            // move first handle to center
            do_move_handle(assert, slider.handles[0], {
                drag_end: 100,
                assertion_value: 92,
                type: false,
                vertical: false
            });
            // attempt to move right handle beyond left handle - stops at left handle
            do_move_handle(assert, slider.handles[1], {
                drag_end: 0,
                assertion_value: 92,
                type: false,
                vertical: false
            });

            assert.strictEqual(slider.handles[0].value, slider.handles[1].value);
        });

        QUnit.skip('vertical', assert => {
            elem.css('height', `${len}px`);
            $('.slider_value', elem).val(0);
            options.range = true;
            let val = options.values = [50, 100];
            options.orientation = 'vertical';
            options.height = len;
            let lower_val_elem = $(`<input class="lower_value" value="${val[0]}"/>`);
            let lower_span_elem = $(`<span class="lower_value" value="${val[0]}"/>`);
            let upper_val_elem = $(`<input class="upper_value" value="${val[1]}"/>`);
            let upper_span_elem = $(`<input class="upper_value" value="${val[1]}"/>`);
            $('.yafowil_slider')
                .append(lower_span_elem)
                .append(lower_val_elem)
                .append(upper_span_elem)
                .append(upper_val_elem);

            // create slider object
            widget = new SliderWidget(elem, options);
            slider = widget.slider;

            // value of first handle
            let start_val = val[0];
            let new_val = 60;
            let new_pos = transform(new_val, 'screen', len, 0, 100);
            slider.handles[0].pos = new_pos;
            let new_len = slider.handles[1].pos - slider.handles[0].pos;

            // create and trigger custom drag event
            const event = new $.Event('slide', {widget: slider.handles[0]});
            slider.elem.trigger(event);

            assert.notStrictEqual(start_val, new_val);
            assert.strictEqual(
                slider.track.range_elem.css('height'),
                `${new_len}px`
            );
            assert.strictEqual(
                slider.track.range_elem.css('top'),
                `${new_pos}px`
            );
        });

        QUnit.skip('default - move to end', assert => {
            elem.css('width', `${len}px`);
            $('.slider_value', elem).val(0);

            // create slider object
            widget = new SliderWidget(elem, options);
            slider = widget.slider;

            let handle = slider.handles[0];
            do_move_handle(assert, handle, {
                drag_end: len + 10, // 10px over end of slider
                assertion_value: len,
                type: true
            });
        });

        QUnit.skip('default - move to start', assert => {
            elem.css('width', `${len}px`);
            $('.slider_value', elem).val(0);

            // create slider object
            widget = new SliderWidget(elem, options);
            slider = widget.slider;

            let handle = slider.handles[0];
            do_move_handle(assert, handle, {
                drag_end: slider.offset - 10, // 10px less than start of slider
                assertion_value: 0,
                type: false
            });
        });

        QUnit.skip('default - touch move to end', assert => {
            elem.css('width', `${len}px`);
            $('.slider_value', elem).val(0);

            // create slider object
            widget = new SliderWidget(elem, options);
            slider = widget.slider;

            let handle = slider.handles[0];
            let drag_end = len + 10;
            let target = handle.elem;

            send_touch_event(0, 0, target[0], 'touchstart');
            send_touch_event(drag_end, 0, document, 'touchmove');
            send_touch_event(drag_end, 0, document, 'touchend');
            assert.strictEqual(handle.pos, len);
        });

        QUnit.skip('default - touch move to start', assert => {
            elem.css('width', `${len}px`);
            $('.slider_value', elem).val(0);

            // create slider object
            widget = new SliderWidget(elem, options);
            slider = widget.slider;

            let handle = slider.handles[0];
            let drag_end = slider.offset - 10;
            let target = handle.elem;

            send_touch_event(0, 0, target[0], 'touchstart');
            send_touch_event(drag_end, 0, document, 'touchmove');
            send_touch_event(drag_end, 0, document, 'touchend');
            assert.strictEqual(handle.pos, 0);
        });

        /* vertical slider with no additional options */
        QUnit.module('vertical', hooks => {

            hooks.beforeEach(() => {
                options.orientation = 'vertical';
                options.height = len;
                elem.css('height', `${len}px`);
                widget = new SliderWidget(elem, options);
                slider = widget.slider;
            });

            QUnit.skip('move to end', assert => {
                let handle = slider.handles[0];
                do_move_handle(assert, handle, {
                    drag_end: slider.offset + len + 10,
                    assertion_value: len,
                    type: true,
                    vertical: true
                });
            });

            QUnit.skip('move to start', assert => {
                let handle = slider.handles[0];
                do_move_handle(assert, handle, {
                    drag_end: slider.offset - 10,
                    assertion_value: 0,
                    type: false,
                    vertical: true
                });
            });

            QUnit.skip('touch move to end', assert => {
                let handle = slider.handles[0];
                let drag_end = slider.offset + len + 10;
                let target = handle.elem;

                send_touch_event(0, 0, target[0], 'touchstart');
                send_touch_event(0, drag_end, document, 'touchmove');
                send_touch_event(0, drag_end, document, 'touchend');
                assert.strictEqual(handle.pos, len);
            });

            QUnit.skip('touch move to start', assert => {
                let handle = slider.handles[0];
                let drag_end = slider.offset - 10;
                let target = handle.elem;

                send_touch_event(0, 0, target[0], 'touchstart');
                send_touch_event(0, drag_end, document, 'touchmove');
                send_touch_event(0, drag_end, document, 'touchend');
                assert.strictEqual(handle.pos, 0);
            });
        });

        /* slider with specified step */
        QUnit.skip('step_slider move', assert => {
            options.step = 10;
            elem.css('width', `${len}px`);
            widget = new SliderWidget(elem, options);
            slider = widget.slider;

            let handle = slider.handles[0];
            // add Integer 5 to test the value rounding to step
            let drag_end = slider.offset + slider.slider_len / 2 + 5;
            // assertion value will be actual rounded value
            let assertion_value = slider.slider_len / 2;
            do_move_handle(assert, handle, {
                drag_end: drag_end,
                assertion_value: assertion_value,
                type: true,
                vertical: false
            });
        });

        /* slider with minimum and maximum value and step */
        QUnit.skip('min/max/step - move to end', assert => {
            options.min = 30;
            options.max = 500;
            options.step = 25;
            elem.css('width', `${len}px`);
            $('.slider_value', elem).val(30);
            widget = new SliderWidget(elem, options);
            slider = widget.slider;
            let handle = slider.handles[0];

            // move handle to end
            do_move_handle(assert, handle, {
                drag_end: len + 10, // 10px over end of slider,
                assertion_value: len,
                type: true,
                vertical: false
            });

            let done2 = assert.async();
            setTimeout(() => {
                assert.strictEqual(handle.value, 500)
                done2();
                // move handle to start
                do_move_handle(assert, handle, {
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

    QUnit.module('SliderHandle.on_scroll', () => {

        // create synthetic wheel events
        let scroll_down = $.event.fix(new WheelEvent('mousewheel', {
            'deltaY': 1,
            'deltaMode': 0
        }));
        let scroll_up = $.event.fix(new WheelEvent('mousewheel', {
            'deltaY': -1,
            'deltaMode': 0
        }));

        /* range slider with two handles */
        QUnit.skip('range true (horizontal)', assert => {
            options.range = true;
            options.values = [50, 100];
            elem.css('width', `${len}px`);
            let val = options.values;
            let lower_val_elem = $(`<input class="lower_value" value="${val[0]}"/>`);
            let lower_span_elem = $(`<span class="lower_value" value="${val[0]}"/>`);
            let upper_val_elem = $(`<input class="upper_value" value="${val[1]}"/>`);
            let upper_span_elem = $(`<input class="upper_value" value="${val[1]}"/>`);
            $('.yafowil_slider')
                .append(lower_span_elem)
                .append(lower_val_elem)
                .append(upper_span_elem)
                .append(upper_val_elem);

            // create slider object
            widget = new SliderWidget(elem, options);
            slider = widget.slider;
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
            assert.strictEqual(slider.handles[1].pos, len);
            assert.strictEqual(slider.handles[1].value, slider.max);

            slider.handles[0].selected = true;
            for (let i = 0; i < 50; i++) {
                slider.elem.trigger(scroll_down);
            }
            assert.strictEqual(slider.handles[0].pos, len);
            assert.strictEqual(slider.handles[0].value, slider.max);
        });

        QUnit.skip('range true (vertical)', assert => {
            options.range = true;
            let val = options.values = [50, 100];
            elem.css('height', `${len}px`);
            options.orientation = 'vertical';
            options.height = len;
            let lower_val_elem = $(`<input class="lower_value" value="${val[0]}"/>`);
            let lower_span_elem = $(`<span class="lower_value" value="${val[0]}"/>`);
            let upper_val_elem = $(`<input class="upper_value" value="${val[1]}"/>`);
            let upper_span_elem = $(`<input class="upper_value" value="${val[1]}"/>`);
            $('.yafowil_slider')
                .append(lower_span_elem)
                .append(lower_val_elem)
                .append(upper_span_elem)
                .append(upper_val_elem);

            // create slider object
            widget = new SliderWidget(elem, options);
            slider = widget.slider;
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
            assert.strictEqual(slider.handles[1].pos, len);
            assert.strictEqual(slider.handles[1].value, slider.max);

            slider.handles[0].selected = true;
            for (let i = 0; i < 50; i++) {
                slider.elem.trigger(scroll_down);
            }
            assert.strictEqual(slider.handles[0].pos, len);
            assert.strictEqual(slider.handles[0].value, slider.max);
        });

        /* default slider with no additional options */
        QUnit.skip('move to end/start', assert => {
            elem.css('width', `${len}px`);
            widget = new SliderWidget(elem, options);
            slider = widget.slider;
            slider.handles[0].selected = true;

            // trigger scroll downward
            for (let i = 0; i < 100; i++) {
                slider.elem.trigger(scroll_down);
            }
            assert.strictEqual(slider.handles[0].pos, len);
            assert.strictEqual(slider.handles[0].value, slider.max);

            // trigger scroll upward
            for (let i = 0; i < 100; i++) {
                slider.elem.trigger(scroll_up);
            }
            assert.strictEqual(slider.handles[0].pos, 0);
            assert.strictEqual(slider.handles[0].value, slider.min);
        });

        /* vertical slider with no additional options */
        QUnit.skip('move to end/start (vertical)', assert => {
            options.orientation = 'vertical';
            options.height = len;
            elem.css('height', `${len}px`);
            widget = new SliderWidget(elem, options);
            slider = widget.slider;
            slider.handles[0].selected = true;

            // trigger scroll downward
            for (let i = 0; i < 100; i++) {
                slider.elem.trigger(scroll_down);
            }
            assert.strictEqual(slider.handles[0].pos, len);
            assert.strictEqual(slider.handles[0].value, slider.max);

            // trigger scroll upward
            for (let i = 0; i < 100; i++) {
                slider.elem.trigger(scroll_up);
            }
            assert.strictEqual(slider.handles[0].pos, 0);
            assert.strictEqual(slider.handles[0].value, slider.min);
        });

        /* slider with specified step */
        QUnit.skip('step', assert => {
            options.step = 10;
            elem.css('width', `${len}px`);
            widget = new SliderWidget(elem, options);
            slider = widget.slider;
            slider.handles[0].selected = true;

            // trigger scroll downward
            for (let i = 1; i < 4; i++) {
                slider.elem.trigger(scroll_down);
                assert.strictEqual(
                    slider.handles[0].value,
                    slider.scroll_step * i
                );
            }
            let val = slider.handles[0].value;
            // trigger scroll upnward
            for (let i = 1; i < 4; i++) {
                slider.elem.trigger(scroll_up);
                assert.strictEqual(
                    slider.handles[0].value,
                    val - slider.scroll_step * i
                );
            }
        });

        /* slider with specified scroll step */
        QUnit.skip('move', assert => {
            options.scroll_step = 20;
            elem.css('width', `${len}px`);
            widget = new SliderWidget(elem, options);
            slider = widget.slider;
            slider.handles[0].selected = true;

            // trigger scroll downward
            for (let i = 1; i < 4; i++) {
                slider.elem.trigger(scroll_down);
                assert.strictEqual(
                    slider.handles[0].value,
                    slider.scroll_step * i
                );
            }
            let val = slider.handles[0].value;
            // trigger scroll upnward
            for (let i = 1; i < 4; i++) {
                slider.elem.trigger(scroll_up);
                assert.strictEqual(
                    slider.handles[0].value,
                    val - slider.scroll_step * i
                );
            }
        });
    });

    QUnit.module('SliderHandle.key_handle', () => {

        // create synthetic key events
        let arrow_left = new KeyboardEvent('keydown', {
            key: 'ArrowLeft'
        });
        let arrow_right = new KeyboardEvent('keydown', {
            key: 'ArrowRight'
        });
        let arrow_up = new KeyboardEvent('keydown', {
            key: 'ArrowUp'
        });
        let arrow_down = new KeyboardEvent('keydown', {
            key: 'ArrowDown'
        });

        /* range slider with two handles */
        QUnit.skip('horizontal', assert => {
            options.range = true;
            options.values = [50, 100];
            elem.css('width', `${len}px`);
            let val = options.values;
            let lower_val_elem = $(`<input class="lower_value" value="${val[0]}"/>`);
            let lower_span_elem = $(`<span class="lower_value" value="${val[0]}"/>`);
            let upper_val_elem = $(`<input class="upper_value" value="${val[1]}"/>`);
            let upper_span_elem = $(`<input class="upper_value" value="${val[1]}"/>`);
            $('.yafowil_slider')
                .append(lower_span_elem)
                .append(lower_val_elem)
                .append(upper_span_elem)
                .append(upper_val_elem);

            // create slider object
            widget = new SliderWidget(elem, options);
            slider = widget.slider;
            slider.handles[1].selected = true;

            // trigger keyleft presses
            for (let i = 0; i < 50; i++) {
                document.dispatchEvent(arrow_left);
            }
            assert.strictEqual(
                slider.handles[1].pos,
                slider.handles[0].pos
            );
            assert.strictEqual(
                slider.handles[1].value,
                slider.handles[0].value
            );

            // trigger keyright presses
            for (let i = 0; i < 50; i++) {
                document.dispatchEvent(arrow_right);
            }
            assert.strictEqual(slider.handles[1].pos, len);
            assert.strictEqual(slider.handles[1].value, slider.max);

            slider.handles[0].selected = true;
            for (let i = 0; i < 50; i++) {
                document.dispatchEvent(arrow_right);
            }
            assert.strictEqual(slider.handles[0].pos, len);
            assert.strictEqual(slider.handles[0].value, slider.max);
        });

        QUnit.skip('vertical', assert => {
            options.range = true;
            let val = options.values = [50, 100];
            options.orientation = 'vertical';
            options.height = len;
            elem.css('height', `${len}px`);
            let lower_val_elem = $(`<input class="lower_value" value="${val[0]}"/>`);
            let lower_span_elem = $(`<span class="lower_value" value="${val[0]}"/>`);
            let upper_val_elem = $(`<input class="upper_value" value="${val[1]}"/>`);
            let upper_span_elem = $(`<input class="upper_value" value="${val[1]}"/>`);
            $('.yafowil_slider')
                .append(lower_span_elem)
                .append(lower_val_elem)
                .append(upper_span_elem)
                .append(upper_val_elem);

            // create slider object
            widget = new SliderWidget(elem, options);
            slider = widget.slider;
            slider.handles[1].selected = true;

            // trigger keyup presses
            for (let i = 0; i < 50; i++) {
                document.dispatchEvent(arrow_up);
            }
            assert.strictEqual(
                slider.handles[1].pos,
                slider.handles[0].pos
            );
            assert.strictEqual(
                slider.handles[1].value,
                slider.handles[0].value
            );

            // trigger keydown presses
            for (let i = 0; i < 50; i++) {
                document.dispatchEvent(arrow_down);
            }
            assert.strictEqual(slider.handles[1].pos, len);
            assert.strictEqual(slider.handles[1].value, slider.max);

            slider.handles[0].selected = true;
            for (let i = 0; i < 50; i++) {
                document.dispatchEvent(arrow_down);
            }
            assert.strictEqual(slider.handles[0].pos, len);
            assert.strictEqual(slider.handles[0].value, slider.max);
        });
    });

    QUnit.module('custom event dispatch', () => {

        QUnit.skip('custom event dispatch', assert => {
            elem.css('width', `${len}px`);
            $('.slider_value', elem).val(0);

            // add event listeners for custom event
            elem.on('start', e => {
                assert.step('start');
                assert.strictEqual(
                    e.widget.value,
                    slider.handles[0].value
                );
                assert.strictEqual(e.widget.index, 0);
                assert.strictEqual(e.widget.elem, slider.handles[0].elem);
            });
            elem.on('slide', e => {
                assert.step('slide');
                assert.strictEqual(
                    e.widget.value,
                    slider.handles[0].value
                );
                assert.strictEqual(e.widget.index, 0);
                assert.strictEqual(e.widget.elem, slider.handles[0].elem);
            });
            elem.off('stop').on('stop', e => {
                assert.step('stop');
                assert.strictEqual(
                    e.widget.value,
                    slider.handles[0].value
                );
                assert.strictEqual(e.widget.index, 0);
                assert.strictEqual(e.widget.elem, slider.handles[0].elem);
            });
            elem.off('change').on('change', e => {
                assert.step('change');
                assert.strictEqual(
                    e.widget.value,
                    slider.handles[0].value
                );
                assert.strictEqual(e.widget.index, 0);
                assert.strictEqual(e.widget.elem, slider.handles[0].elem);
            });
            elem.on('create', e => {
                assert.step('create');
            });

            // create slider object
            widget = new SliderWidget(elem, options);
            slider = widget.slider;
            let handle = slider.handles[0];
            let target = handle.elem;

            // create on initialization
            assert.verifySteps(['create']);

            // invoke start
            target.trigger('mousedown');
            assert.verifySteps(['start']);

            // invoke stop
            document.dispatchEvent(new MouseEvent('mouseup', {}));
            assert.verifySteps(['stop']);

            // invoke move
            target.trigger('mousedown');
            assert.verifySteps(['start']);
            let client_x = slider.offset;
            for(let i = 0; i < 1; i++) {
                client_x += 1;
                let slide_options  = {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    clientY: 0,
                    clientX: client_x
                };
                let ev = new MouseEvent('mousemove', slide_options);
                target[0].dispatchEvent(ev);
                assert.verifySteps(['slide']);
            }
        });

        QUnit.skip('custom event dispatch - scroll/step/key', assert => {

            let scroll_down = $.event.fix(new WheelEvent('mousewheel', {
                'deltaY': 1,
                'deltaMode': 0
            }));
            let scroll_up = $.event.fix(new WheelEvent('mousewheel', {
                'deltaY': -1,
                'deltaMode': 0
            }));
            let arrow_left = new KeyboardEvent('keydown', {
                key: 'ArrowLeft'
            });
            let arrow_right = new KeyboardEvent('keydown', {
                key: 'ArrowRight'
            });

            elem.css('width', `${len}px`);
            $('.slider_value', elem).val(0);

            // add event listeners for custom event
            elem.on('create', e => {
                assert.step('create');
            });
            elem.on('start', e => {
                assert.step('start');
            });
            elem.on('slide', e => {
                assert.step('slide');
            });
            elem.on('stop', e => {
                assert.step('stop');
            });
            elem.on('change', e => {
                assert.step('change');
            });

            // create slider object
            options.step = 10;
            widget = new SliderWidget(elem, options);
            slider = widget.slider;
            let handle = slider.handles[0];

            // slidecreate on initialization
            assert.verifySteps(['create']);

            handle.selected = true;
            // trigger scroll downward
            for (let i = 1; i < 4; i++) {
                slider.elem.trigger(scroll_down);
                assert.strictEqual(
                    slider.handles[0].value,
                    slider.scroll_step * i
                );
                assert.verifySteps(['change']);
            }
            let val = handle.value;
            // trigger scroll upward
            for (let i = 1; i < 4; i++) {
                slider.elem.trigger(scroll_up);
                assert.strictEqual(
                    slider.handles[0].value,
                    val - slider.scroll_step * i
                );
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

QUnit.module('on_resize', hooks => {
    let options = {};
    let elem;
    let widget;
    let slider;
    // set width and len property to 100% to allow for container dimension change
    let container = $('<div id="container" style="width:100%"/>');
    let len = '100%';

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
        widget = null;
        slider = null;
        options = {};
        container.empty();
        // reset viewport to initial value after tests
        viewport.set(base_width, base_height);
    });

    hooks.after(() => {
        container.remove();
    });

    QUnit.skip('resize', assert => {
        options.value = 50;
        options.range = 'min';
        elem.css('height', `${len}px`);
        $('.slider_value', elem).val(options.value);
        widget = new SliderWidget(elem, options);
        slider = widget.slider;
        let handle = slider.handles[0];

        // variables before resize
        let len_before = slider.slider_len;
        let pos_before = handle.pos;
        let track_val_before = slider.track.range_elem.css('width');

        // resize viewport
        let new_window_width = 320;
        viewport.set(new_window_width);
        $(window).trigger('resize');

        // variables and positions after resize
        assert.notStrictEqual(pos_before, handle.pos);
        assert.notStrictEqual(len_before, slider.slider_len);
        assert.notStrictEqual(
            track_val_before,
            slider.track.range_elem.css('width')
        );
    });

    QUnit.skip('unload', assert => {
        options.value = 50;
        options.range = 'min';
        elem.css('height', `${len}px`);
        $('.slider_value', elem).val(options.value);
        widget = new SliderWidget(elem, options);
        slider = widget.slider;
        let handle = slider.handles[0];

        let pos_before = handle.pos;
        let track_val_before = slider.track.range_elem.css('width');

        // trigger unload
        slider.unload();

        // resize viewport
        let new_window_width = 320;
        viewport.set(new_window_width);
        $(window).trigger('resize');

        // scroll events unbound
        let scroll_down = $.event.fix(new WheelEvent('mousewheel', {
            'deltaY': 1,
            'deltaMode': 0
        }));
        slider.elem.trigger(scroll_down);

        // key events unbound
        let arrow_left = new KeyboardEvent('keydown', {
            key: 'ArrowLeft'
        });
        document.dispatchEvent(arrow_left);

        // triggered events invoke no change
        assert.strictEqual(pos_before, handle.pos);
        assert.strictEqual(
            track_val_before,
            slider.track.range_elem.css('width')
        );
    });
});
