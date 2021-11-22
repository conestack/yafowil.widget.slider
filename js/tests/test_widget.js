import $ from 'jquery';
import { SliderWidget } from "../src/widget";
import { transform } from '../src/widget';

let base_width = $(window).width();
let base_height = $(window).height();

////////////////////////////////////////////////////////////////////////////////
// yafowil slider widget tests
////////////////////////////////////////////////////////////////////////////////

QUnit.module('constructor cases', hooks => {
    let options = {};
    let elem;
    let slider;
    let container = $('<div id="container" />');
    let dim = 200;
    let value;

    hooks.before(() => {
        $('body').append(container);
    });
    hooks.after(() => {
        container.remove();
    });
    hooks.afterEach(() => {
        slider = null;
        elem = null;
        value = null;
        options = {};
        container.empty();
    });

    /* slider without additional options given */
    QUnit.test('default slider', assert => {
        elem = create_elem(dim);
        slider = new SliderWidget(elem, options);

        // correct elements
        assert.deepEqual(slider.elem, elem);
        assert.ok(slider.slider_elem.is('div.slider'));
        // function exists
        assert.ok(slider.handle_singletouch);
        // only one handle exists
        assert.strictEqual(slider.handles.length, 1);
        // no range specified
        assert.strictEqual(slider.range, false);
        // default diameter and thickness applied
        assert.strictEqual(slider.handle_diameter, 20);
        assert.strictEqual(slider.thickness, 15);
        assert.strictEqual(slider.slider_elem.css('height'), '20px');
        // default min/max applied
        assert.strictEqual(slider.min, 0);
        assert.strictEqual(slider.max, 100);
        // default value applied
        assert.strictEqual(slider.handles[0].value, 0);
        // no step specified
        assert.strictEqual(slider.step, false);
        // default horizontal orientation
        assert.strictEqual(slider.vertical, false);
        assert.strictEqual(slider.dim_attr, 'width');
        assert.strictEqual(slider.dir_attr, 'left');
    });

    /* slider with vertical orientation */
    QUnit.test('vertical', assert => {
        options.orientation = 'vertical';
        // on vertical orientation, height has to be specified
        options.height = dim;
        elem = create_elem(dim, 0, true);
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
        options.range = true;
        // set initial values for the two handles
        options.values = [50, 100];
        elem = create_elem(dim);

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
        assert.strictEqual(slider.handles[0].value, String(options.values[0]));
        assert.strictEqual(slider.handles[1].value, String(options.values[1]));
    });

    /* slider with range set to max - user can only choose a maximum value */
    QUnit.test('slider with max range', assert => {
        options.range = 'max';
        elem = create_elem(dim);
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
        options.orientation = 'vertical';
        options.range = 'max';
        elem = create_elem(dim);
        slider = new SliderWidget(elem, options);

        // track has to start at bottom edge instead of top
        assert.strictEqual(slider.slider_track.track_elem.css('bottom'), '0px');
        assert.strictEqual(slider.slider_track.track_elem.css('top'), '0px');
    });

    /* slider with minimum and maximum value,
        to be rounded to a step value,
        and an initial value */
    QUnit.test('min/max/step/value', assert => {
        value = 50;
        options.min = 30;
        options.max = 500;
        options.step = 25;
        elem = create_elem(dim, value);
        slider = new SliderWidget(elem, options);

        assert.strictEqual(slider.min, options.min);
        assert.strictEqual(slider.max, options.max);
        assert.strictEqual(slider.step, options.step);
        assert.strictEqual(parseInt(slider.handles[0].value), value);
    });

    /* slider with custom handle diameter and track thickness */
    QUnit.test('handle_diameter/thickness', assert => {
        options.handle_diameter = 30;
        options.thickness = 50;
        elem = create_elem(dim);
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

////////////////////////////////////////////////////////////////////////////////
// SliderWidget.handle_singletouch()
////////////////////////////////////////////////////////////////////////////////

QUnit.module('handle_singletouch', hooks => {
    let options = {};
    let elem;
    let slider;
    let container = $('<div id="container" />');
    let dim = 200;

    hooks.before(() => {
        $('body').append(container);
    });
    hooks.afterEach(() => {
        elem = null;
        slider = null;
        options = {};
        container.empty();
    });
    hooks.after(() => {
        container.remove();
    });

    /* default slider with no additional options given */
    QUnit.module('default', hooks => {
        hooks.beforeEach(() => {
            elem = create_elem(dim);
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
            elem = create_elem(dim, 0, true);
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
            elem = create_elem(dim);
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
            elem = create_elem(dim);
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
        elem = create_elem(dim, options.value);
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
        elem = create_elem(dim, options.value);
        slider = new SliderWidget(elem, options);
        let handle = slider.handles[0];

        let pos_before = handle.pos;
        let track_val_before = slider.slider_track.track_elem.css('width');

        // trigger unload
        slider.slider_track.unload();
        slider.handles[0].unload();

        // resize viewport
        let new_window_width = 320;
        viewport.set(new_window_width);
        $(window).trigger('resize');

        // resize event is unbound
        assert.strictEqual(pos_before, handle.pos);
        assert.strictEqual(
            track_val_before,
            slider.slider_track.track_elem.css('width')
        );
    });
});

////////////////////////////////////////////////////////////////////////////////
// SliderHandle.handle_drag()
////////////////////////////////////////////////////////////////////////////////

QUnit.module('SliderHandle.handle_drag', hooks => {
    let options = {};
    let elem;
    let slider;
    let container = $('<div id="container" />');
    let dim = 200;

    hooks.before(() => {
        $('body').append(container);
    });
    hooks.afterEach(() => {
        elem = null;
        slider = null;
        options = {};
        container.empty();
    });
    hooks.after(() => {
        container.remove();
    });

    /* range slider with two handles */
    QUnit.module('range true', () => {
        QUnit.test('horizontal', assert => {
            options.range = true;
            options.values = [
                50,
                100
            ];
            
            elem = create_elem(dim);

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
            const event = new $.Event('drag');
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
            move_handle(assert, slider.handles[0], 100, 92, false, false);
            // attempt to move right handle beyond left handle - stops at left handle
            move_handle(assert, slider.handles[1], 0, 93, false, false);

            assert.strictEqual(slider.handles[0].value, slider.handles[1].value - 1);
        });
        QUnit.test('vertical', assert => {
            options.range = true;
            let vals = options.values = [
                50,
                100
            ];
            options.orientation = 'vertical';
            options.height = dim;

            elem = create_elem(dim, 0, true);

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
            const event = new $.Event('drag');
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
    });

    /* default slider with no additional options */
    QUnit.module('default', hooks => {
        hooks.beforeEach(() => {
            elem = create_elem(dim);
            slider = new SliderWidget(elem, options);
        });

        QUnit.test('move to end', assert => {
            let handle = slider.handles[0];
            let drag_end =  dim + 10; // 10px over end of slider
            let assertion_value = dim;
            move_handle(assert, handle, drag_end, assertion_value, true);
        });
        QUnit.test('move to start', assert => {
            let handle = slider.handles[0];
            let drag_end =  slider.offset - 10; // 10px less than start of slider
            let assertion_value = 0;
            move_handle(assert, handle, drag_end, assertion_value, false);
        });
        QUnit.test('touch move to end', assert => {
            let handle = slider.handles[0];
            let drag_end =  dim + 10;
            let target = handle.elem;

            sendTouchEvent(0, 0, target[0], 'touchstart');
            sendTouchEvent(drag_end, 0, document, 'touchmove');
            sendTouchEvent(drag_end, 0, document, 'touchend');
            assert.strictEqual(handle.pos, dim);
        });
        QUnit.test('touch move to start', assert => {
            let handle = slider.handles[0];
            let drag_end =  slider.offset - 10;
            let target = handle.elem;

            sendTouchEvent(0, 0, target[0], 'touchstart');
            sendTouchEvent(drag_end, 0, document, 'touchmove');
            sendTouchEvent(drag_end, 0, document, 'touchend');
            assert.strictEqual(handle.pos, 0);
        });

        for (let i = 0; i <= 5; i++) {
            QUnit.test.skip('random move', assert => {
                // random movement tests - wip
                let num = parseInt(Math.random() * (dim));
                console.log(num)
                let handle = slider.handles[0];
                handle.pos = 100;
                let drag_end = slider.offset + num;
    
                let dir;
                if (num < handle.pos) {
                    console.log('decrease')
                    dir = false;
                } else if (num > handle.pos) {
                    console.log('increase')
                    dir = true;
                }
                move_handle(assert, handle, drag_end, num, dir);
            });
        }
    });

    /* vertical slider with no additional options */
    QUnit.module('vertical', hooks => {
        hooks.beforeEach(() => {
            options.orientation = 'vertical';
            options.height = dim;
            elem = create_elem(dim, 0, true);
            slider = new SliderWidget(elem, options);
        });

        QUnit.test('move to end', assert => {
            let handle = slider.handles[0];
            let drag_end = slider.offset + dim + 10;
            let assertion_value = dim;
            move_handle(assert, handle, drag_end, assertion_value, true, true);
        });
        QUnit.test('move to start', assert => {
            let handle = slider.handles[0];
            let drag_end =  slider.offset - 10;
            let assertion_value = 0;
            move_handle(assert, handle, drag_end, assertion_value, false, true);
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
            let drag_end =  slider.offset - 10;
            let target = handle.elem;

            sendTouchEvent(0, 0, target[0], 'touchstart');
            sendTouchEvent(0, drag_end, document, 'touchmove');
            sendTouchEvent(0, drag_end, document, 'touchend');
            assert.strictEqual(handle.pos, 0);
        });
    });

    /* slider with specified step */
    QUnit.module('step', hooks => {
        hooks.beforeEach(() => {
            options.step = 10;
            elem = create_elem(dim);
            slider = new SliderWidget(elem, options);
        });

        QUnit.test('move', assert => {
            let handle = slider.handles[0];
            // add Integer 5 to test the value rounding to step
            let drag_end =  slider.offset + slider.slider_dim / 2 + 5;
            // assertion value will be actual rounded value
            let assertion_value = slider.slider_dim / 2;
            move_handle(assert, handle, drag_end, assertion_value, true, false);
        });
    });
});


////////////////////////////////////////////////////////////////////////////////
// helper functions
////////////////////////////////////////////////////////////////////////////////

function create_elem(dim, value, vertical) {
    /* 
    create the base element
    SliderWidget reads input value as initial value, so we have to set in
    certain cases, else it defaults to 0
    */
    let slider_elem = $(`
        <div class="yafowil_slider" id="test-slider">
          <input class="slider_value" type="text" value="${value}">
          <div class="slider" />
        </div>
    `);

    $('#container').append(slider_elem);

    /* specify the height or width of the element */
    if (vertical) {
        slider_elem.css("height", `${dim}px`);
    } else {
        slider_elem.css("width", `${dim}px`);
    }
    return slider_elem;
}

function move_handle(assert, handle, drag_end, assertion_value, type, vertical) {
    /* 
        type=true for value increase,
        type=false for value decrease
    */

    let target = handle.elem;
    let changed_coord = handle.pos; // the coordinate (x or y) which is going to be changed
    let done = assert.async(); // we need asynchronous testing for mousemove

    function move() {
        // if type is increase, increase value
        if (type) {
            changed_coord += 1;
        } else {
            changed_coord -= 1;
        }
        // check if handle has already met the given drag end point
        let isMoving = type ? (changed_coord < drag_end) : (changed_coord > drag_end);

        // options are required to create a MouseEvent
        let options  = {
            view: window,
            bubbles: true,
            cancelable: true
        };

        // set coordinates
        if (vertical) {
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
            }, 10);
        } else {
            // create and trigger mouseup event
            let ev = new MouseEvent("mouseup", {});
            document.dispatchEvent(ev);
            done();

            // assert here:
            // position of handle equals given value
            assert.strictEqual(
                parseInt(handle.pos),
                parseInt(assertion_value)
            );
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