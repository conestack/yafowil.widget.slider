import $ from 'jquery';
import { SliderWidget } from "../src/widget";
import { transform } from '../src/widget';

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

    QUnit.test('vertical', assert => {
        options.orientation = 'vertical';
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
    QUnit.test('slider with range', assert => {
        options.range = true;
        options.values = [50, 100];
        elem = create_elem(dim);
        let lower_val_elem = $(`<input class="lower_value"/>`).val(options.values[0]);
        let lower_span_elem = $(`<span class="lower_value"/>`).val(options.values[0]);
        let upper_val_elem = $(`<input class="upper_value"/>`).val(options.values[1]);
        let upper_span_elem = $(`<input class="upper_value"/>`).val(options.values[1]);
        elem.append(lower_span_elem)
            .append(lower_val_elem)
            .append(upper_span_elem)
            .append(upper_val_elem);
        slider = new SliderWidget(elem, options);

        assert.strictEqual(slider.handles.length, 2);
        assert.strictEqual(slider.range, true);
        assert.strictEqual(slider.range_true, true);
        assert.strictEqual(slider.handles[0].value, String(options.values[0]));
        assert.strictEqual(slider.handles[1].value, String(options.values[1]));
    });
    QUnit.test('slider with max range', assert => {
        options.range = 'max';
        elem = create_elem(dim);
        slider = new SliderWidget(elem, options);

        assert.strictEqual(slider.handles.length, 1);
        assert.strictEqual(slider.range, 'max');
        assert.strictEqual(slider.range_max, true);
        assert.strictEqual(
            slider.slider_track.track_elem.css('right'),
            '0px'
        );
    });
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
    QUnit.test('handle_diameter/thickness', assert => {
        options.handle_diameter = 30;
        options.thickness = 50;
        elem = create_elem(dim);
        slider = new SliderWidget(elem, options);

        assert.strictEqual(slider.handle_diameter, options.handle_diameter);
        assert.strictEqual(slider.thickness, options.thickness);
        assert.strictEqual(slider.handles[0].elem.css('width'),
                           options.handle_diameter + 'px');
        assert.strictEqual(slider.handles[0].elem.css('height'),
                           options.handle_diameter + 'px');
        assert.strictEqual(slider.slider_track.track_elem.css('height'),
                           options.thickness + 'px');
    });
    QUnit.test('range_max & vertical', assert => {
        options.orientation = 'vertical';
        options.range = 'max';
        elem = create_elem(dim);
        slider = new SliderWidget(elem, options);

        assert.strictEqual(slider.slider_track.track_elem.css('bottom'), '0px');
        assert.strictEqual(slider.slider_track.track_elem.css('top'), '0px');
    });
});

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
            assert.strictEqual(handle.pos, pos);
            assert.strictEqual(handle.value, val);
            assert.strictEqual(slider.slider_track.track_elem.css('width'), pos + 'px');
        });
    });

    QUnit.module('vertical', hooks => {
        hooks.beforeEach(() => {
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
            assert.strictEqual(handle.pos, pos);
            assert.strictEqual(handle.value, val);
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

    QUnit.module('range_true', hooks => {
        hooks.beforeEach(() => {
            options.range = true;
            options.values = [50, 100];
            elem = create_elem(dim);
            let lower_val_elem = $(`<input class="lower_value"/>`).val(options.values[0]);
            let lower_span_elem = $(`<span class="lower_value"/>`).val(options.values[0]);
            let upper_val_elem = $(`<input class="upper_value"/>`).val(options.values[1]);
            let upper_span_elem = $(`<input class="upper_value"/>`).val(options.values[1]);
            elem.append(lower_span_elem)
                .append(lower_val_elem)
                .append(upper_span_elem)
                .append(upper_val_elem);
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

    QUnit.module('default', hooks => {
        hooks.beforeEach(() => {
            elem = create_elem(dim);
            slider = new SliderWidget(elem, options);
        });

        QUnit.test('move to end', assert => {
            let handle = slider.handles[0];
            let drag_end =  dim + 10;
            let assertion_value = dim;
            move_handle(assert, handle, drag_end, assertion_value, true);
        });
        QUnit.test('move to start', assert => {
            let handle = slider.handles[0];
            let drag_end =  slider.offset - 10;
            let assertion_value = 0;
            move_handle(assert, handle, drag_end, assertion_value, false);
        });

        for (let i = 0; i <= 5; i++) {
            QUnit.test.todo('random move', assert => {
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

        // QUnit.test.only('move', assert => {
        //     let handle = slider.handles[0];
        //     let drag_end =  slider.offset + 122;
        //     let assertion_value = 122;
        //     move_handle(assert, handle, drag_end, assertion_value, true);
        // });

        QUnit.test.skip('touch', assert => {
        });
    });

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

        QUnit.test.skip('touch', assert => {
        });
    });

    QUnit.module.skip('step', hooks => {
        hooks.beforeEach(() => {
            elem = create_elem(dim);
            slider = new SliderWidget(elem, options);
        });

        QUnit.test('move to end', assert => {
            let handle = slider.handles[0];
            let drag_end =  dim + 10;
            let assertion_value = dim;
            move_handle(assert, handle, drag_end, assertion_value, true);
        });
        QUnit.test('move to start', assert => {
            let handle = slider.handles[0];
            let drag_end =  slider.offset - 10;
            let assertion_value = 0;
            move_handle(assert, handle, drag_end, assertion_value, false);
        });

        QUnit.test.skip('touch', assert => {
        });
    });
});


QUnit.module.skip('horizontal range slider', hooks => {
    let elem;
    let slider;
    let container = $('<div id="container" />');
    let width = 200;

    hooks.before(assert => {
        $('body').append(container);
    });
    hooks.beforeEach(assert => {
        create_elem(width);
        elem = $('#test-slider');
    });
    hooks.afterEach(assert => {
        slider = null;
        container.empty();
    });
    hooks.after(assert => {
        container.remove();
    });

    QUnit.module('range max', hooks => {
        let options = {
            range: 'max'
        };
        QUnit.test('constructor', assert => {
            slider = new SliderWidget(elem, options);
            // helpers.test_constructor_widget(assert, slider, options, elem);
        });
        QUnit.test('set value', assert => {
            slider = new SliderWidget(elem, options);
            let start_val = slider.handles[0].value;
            let new_val = 40;
            let new_pos = transform(new_val, 'screen', width, 0, 100);
            slider.handles[0].pos = new_pos;

            assert.notStrictEqual(start_val, new_val);
            assert.strictEqual(
                slider.slider_track.track_elem.css('width'),
                (width - new_val) + 'px'
            );
        });
    });

    QUnit.module('range true', hooks => {
        let options = {
            range: true,
            values: [
                50,
                100
            ]
        };
        let vals = options.values;
        let lower_val_elem = $(`<input class="lower_value" value="${vals[0]}"/>`);
        let lower_span_elem = $(`<span class="lower_value" value="${vals[0]}"/>`);
        let upper_val_elem = $(`<input class="upper_value" value="${vals[1]}"/>`);
        let upper_span_elem = $(`<input class="upper_value" value="${vals[1]}"/>`);

        QUnit.test('constructor', assert => {
            $('.yafowil_slider')
                .append(lower_span_elem)
                .append(lower_val_elem)
                .append(upper_span_elem)
                .append(upper_val_elem);
            slider = new SliderWidget(elem, options);
            // helpers.test_constructor_widget(assert, slider, options, elem);
        });
        QUnit.test('set value', assert => {
            $('.yafowil_slider')
                .append(lower_span_elem)
                .append(lower_val_elem)
                .append(upper_span_elem)
                .append(upper_val_elem);

            slider = new SliderWidget(elem, options);
            let start_val = vals[0];
            let new_val = 60;
            let new_pos = transform(new_val, 'screen', width, 0, 100);
            slider.handles[0].pos = new_pos;
            let new_dim = slider.handles[1].pos - slider.handles[0].pos;

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
        });
    });
});

function create_elem(dim, value, vertical) {
    let slider_elem = $(`
        <div class="yafowil_slider" id="test-slider">
          <input class="slider_value" type="text" value="${value}">
          <div class="slider" />
        </div>
    `);

    $('#container').append(slider_elem);
    if (vertical) {
        slider_elem.css("height", `${dim}px`);
    } else {
        slider_elem.css("width", `${dim}px`);
    }
    return slider_elem;
}

function move_handle(assert, handle, drag_end, assertion_value, type, vertical) {
    /* 
        type=true for increase,
        type=false for decrease
    */

    let target = handle.elem;
    let changed_coord = handle.pos;
    let done = assert.async();

    function move() {
        if (type) {
            changed_coord += 1;
        } else {
            changed_coord -= 1;
        }
        let isMoving = type ? (changed_coord < drag_end) : (changed_coord > drag_end);

        let options  = {
            view: window,
            bubbles: true,
            cancelable: true
        };

        if (vertical) {
            options.clientX = 0;
            options.clientY = changed_coord;
        } else {
            options.clientX = changed_coord;
            options.clientY = 0;
        }

        let ev = new MouseEvent("mousemove", options);
        target[0].dispatchEvent(ev);

        if (isMoving) {
            setTimeout(() => {
                move();
            }, 10);
        } else {
            let ev = new MouseEvent("mouseup", {
            });
            document.dispatchEvent(ev);
            done();

            // assert here
            assert.strictEqual(
                parseInt(handle.pos),
                parseInt(assertion_value)
            );
        }
    }
    target.trigger('mousedown');
    move();
}


function old_move_handle(assert, handle, drag_end, assertion_value, type, vertical) {
    /* 
        type=true for increase,
        type=false for decrease
    */

    let target = handle.elem;
    let changed_coord = handle.pos;
    let coord_fixed = 0;

    let coordX = handle.pos; // start pos is handle.pos
    let coordY = window.innerHeight / 2; // Moving in the center

    let done = assert.async();

    function move() {
        if (type) {
            coordX += 10;
        } else {
            coordX -= 10;
        }
        let isMoving = type ? (coordX < drag_end) : (coordX > drag_end);
        let ev = new MouseEvent("mousemove", {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: coordX,
            clientY: coordY
        });
        target[0].dispatchEvent(ev);

        if (isMoving) {
            setTimeout(() => {
                move();
            }, 10);
        } else {
            let ev = new MouseEvent("mouseup", {
            });
            document.dispatchEvent(ev);
            done();

            // assert here
            assert.strictEqual(handle.pos, assertion_value);
        }
    }
    target.trigger('mousedown');
    move();
}