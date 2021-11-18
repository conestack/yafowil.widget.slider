import $ from 'jquery';
import { SliderWidget } from "../src/widget";
import * as helpers from "./helper_functions.js";

QUnit.test('test', assert => {
    assert.ok(true);
});

QUnit.module('horizontal slider', hooks => {
    let options = {};
    let elem;
    let slider;
    let container = $('<div id="container" />');
    let width = 200;

    hooks.before(assert => {
        $('body').append(container);
    });
    hooks.beforeEach(assert => {
        helpers.create_elem(width);
        elem = $('#test-slider');
        slider = new SliderWidget(elem, options);
    });
    hooks.afterEach(assert => {
        slider = null;
        container.empty();
    });
    hooks.after(assert => {
        container.remove();
    });

    QUnit.test('constructor', assert => {
        helpers.test_constructor_widget(assert, slider, options, elem);
    });
    QUnit.test('get range_max', assert => {
        assert.strictEqual(slider.range_max, false);
    });
    QUnit.test('get range_true', assert => {
        assert.strictEqual(slider.range_true, false);
    });
    QUnit.test('get offset', assert => {
        let offset_left = slider.elem.offset().left;
        assert.strictEqual(slider.offset, offset_left);
    });
    QUnit.test('get slider_dim', assert => {
        let slider_dim = slider.elem.width();
        assert.strictEqual(slider.slider_dim, slider_dim);
    });
    QUnit.module('handle_singletouch()', () => {
        QUnit.test('mousedown', assert => {
            let handle = slider.handles[0];
            let x = 100;
            let evt = new $.Event('mousedown', {pageY: false, pageX: x});
            slider.slider_elem.trigger(evt);

            let offset = slider.elem.offset().left;
            let pos = x - offset;
            let val = helpers.transform(pos, 'range', width, 0, 100);
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
            let val = helpers.transform(pos, 'range', width, 0, 100);
            assert.strictEqual(handle.pos, pos);
            assert.strictEqual(handle.value, val);
            assert.strictEqual(slider.slider_track.track_elem.css('width'), pos + 'px');
        });
    });
});

QUnit.module('vertical slider', hooks => {
    let height = 200;
    let options = {
        orientation: "vertical",
        height: height
    };
    let elem;
    let slider;
    let container = $('<div id="container" />');

    hooks.before(assert => {
        $('body').append(container);
    });
    hooks.beforeEach(assert => {
        helpers.create_elem(height, true);
        elem = $('#test-slider');
        slider = new SliderWidget(elem, options);
    });
    hooks.afterEach(assert => {
        slider = null;
        container.empty();
    });
    hooks.after(assert => {
        container.remove();
    });

    QUnit.test('constructor', assert => {
        helpers.test_constructor_widget(assert, slider, options, elem);
        helpers.test_constructor_handle(assert, slider.handles[0]);
    });
    QUnit.test('get slider_dim', assert => {
        let slider_dim = slider.slider_elem.height();
        assert.strictEqual(slider.slider_dim, slider_dim);
    });
    QUnit.test('handle_singletouch()', assert => {
        let handle = slider.handles[0];
        let y = 150;
        let evt = new $.Event('mousedown', {pageX: null, pageY: y});
        slider.slider_elem.trigger(evt);

        let offset = slider.slider_elem.offset().top;
        let pos = y - offset;
        let val = helpers.transform(pos, 'range', height, 0, 100);
        assert.strictEqual(handle.pos, pos);
        assert.strictEqual(handle.value, val);
        assert.strictEqual(
            parseInt(slider.slider_track.track_elem.css('height')),
            parseInt(pos));
    });
    QUnit.module.skip('handle_singletouch()', () => { ////////
        QUnit.test('mousedown', assert => {
            let handle = slider.handles[0];
            let y = 150;
            let evt = new $.Event('mousedown', {pageY: y, pageX: false});
            slider.slider_elem.trigger(evt);

            let offset = slider.elem.offset().top;
            let pos = y - offset;
            let val = helpers.transform(pos, 'range', height, 0, 100);
            assert.strictEqual(handle.pos, pos);
            assert.strictEqual(handle.value, val);
            assert.strictEqual(slider.slider_track.track_elem.css('height'), pos + 'px');
        });
        QUnit.test('touch', assert => {
            let handle = slider.handles[0];
            let y = 150;
            let evt = new $.Event('touchstart');
            evt.touches = [{pageX: false, pageY: y}];
            slider.slider_elem.trigger(evt);

            let offset = slider.elem.offset().top;
            let pos = y - offset;
            let val = helpers.transform(pos, 'range', height, 0, 100);
            assert.strictEqual(handle.pos, pos);
            assert.strictEqual(handle.value, val);
            assert.strictEqual(slider.slider_track.track_elem.css('height'), pos + 'px');
        });
    });
});

QUnit.module('horizontal range slider', hooks => {
    let elem;
    let slider;
    let container = $('<div id="container" />');
    let width = 200;

    hooks.before(assert => {
        $('body').append(container);
    });
    hooks.beforeEach(assert => {
        helpers.create_elem(width);
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
            helpers.test_constructor_widget(assert, slider, options, elem);
        });
        QUnit.test('set value', assert => {
            slider = new SliderWidget(elem, options);
            let start_val = slider.handles[0].value;
            let new_val = 40;
            let new_pos = helpers.transform(new_val, 'screen', width, 0, 100);
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
            helpers.test_constructor_widget(assert, slider, options, elem);
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
            let new_pos = helpers.transform(new_val, 'screen', width, 0, 100);
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
