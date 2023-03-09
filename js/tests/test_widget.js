import $ from 'jquery';
import {
    Slider,
    SliderHandle,
    SliderWidget,
    lookup_callback,
    register_array_subscribers
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
            min: 0,
            step: false
        };
        const handle = new SliderHandle(slider, 0, 0);

        assert.strictEqual(handle._align_value(1), 1);

        slider.step = 10;
        assert.strictEqual(handle._align_value(0), 0);
        assert.strictEqual(handle._align_value(100), 100);

        assert.strictEqual(handle._align_value(4), 0);
        assert.strictEqual(handle._align_value(5), 10);

        assert.strictEqual(handle._align_value(94), 90);
        assert.strictEqual(handle._align_value(95), 100);

        slider.min = 25;
        slider.step = 5;
        assert.strictEqual(handle._align_value(25), 25);
        assert.strictEqual(handle._align_value(26), 25);

        assert.strictEqual(handle._align_value(28), 30);
        assert.strictEqual(handle._align_value(30), 30);
        assert.strictEqual(handle._align_value(32), 30);

        assert.strictEqual(handle._align_value(68), 70);
        assert.strictEqual(handle._align_value(70), 70);
        assert.strictEqual(handle._align_value(72), 70);

        assert.strictEqual(handle._align_value(74), 75);
        assert.strictEqual(handle._align_value(75), 75);

        slider.min = -9;
        slider.step = 3;
        assert.strictEqual(handle._align_value(-9), -9);
        assert.strictEqual(handle._align_value(-8), -9);

        assert.strictEqual(handle._align_value(-7), -6);
        assert.strictEqual(handle._align_value(-6), -6);
        assert.strictEqual(handle._align_value(-5), -6);

        assert.strictEqual(handle._align_value(-2), -3);
        assert.strictEqual(handle._align_value(-1), 0);
        assert.strictEqual(handle._align_value(0), 0);
        assert.strictEqual(handle._align_value(1), 0);
        assert.strictEqual(handle._align_value(2), 3);

        assert.strictEqual(handle._align_value(7), 6);
        assert.strictEqual(handle._align_value(6), 6);
        assert.strictEqual(handle._align_value(5), 6);

        assert.strictEqual(handle._align_value(9), 9);
        assert.strictEqual(handle._align_value(8), 9);
    });

    QUnit.test('SliderHandle._prevent_overlap', assert => {
        const slider = {
            elem: $('<div />')
        };
        const handle_0 = new SliderHandle(slider, 0, 25);
        assert.strictEqual(handle_0._prevent_overlap(80), 80);

        const handle_1 = new SliderHandle(slider, 1, 75);
        assert.strictEqual(handle_1._prevent_overlap(20), 20);

        slider.handles = [handle_0, handle_1];
        assert.strictEqual(handle_0._prevent_overlap(80), 75);
        assert.strictEqual(handle_1._prevent_overlap(20), 25);
    });

    QUnit.test('SliderHandle.value -> horizontal', assert => {
        const elem = $('<div />').css('width', 200).appendTo(container);
        const slider = new Slider(elem, {});
        const handle = slider.handles[0];

        assert.strictEqual(slider.min, 0);
        assert.strictEqual(slider.max, 100);

        assert.strictEqual(handle.value, 0);
        assert.strictEqual(handle.pos, 0);

        handle.value = 0;
        assert.strictEqual(handle.elem.css('left'), '0px');
        handle.value = 100;
        assert.strictEqual(handle.elem.css('left'), '200px');

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

    QUnit.test('SliderHandle.value -> vertical', assert => {
        const elem = $('<div />').css('height', 200).appendTo(container);
        const slider = new Slider(elem, {orientation: 'vertical'});
        const handle = slider.handles[0];

        assert.strictEqual(slider.min, 0);
        assert.strictEqual(slider.max, 100);

        assert.strictEqual(handle.value, 0);
        assert.strictEqual(handle.pos, 200);

        handle.value = 0;
        assert.strictEqual(handle.elem.css('top'), '200px');
        handle.value = 100;
        assert.strictEqual(handle.elem.css('top'), '0px');

        handle.value = -10;
        assert.strictEqual(handle.value, 0);
        handle.value = 110;
        assert.strictEqual(handle.value, 100);

        handle.value = 0;
        assert.strictEqual(handle.pos, 200);
        handle.value = 25;
        assert.strictEqual(handle.pos, 150);
        handle.value = 75;
        assert.strictEqual(handle.pos, 50);
        handle.value = 100;
        assert.strictEqual(handle.pos, 0);

        slider.min = 50;
        handle.value = 50;
        assert.strictEqual(handle.pos, 200);
        handle.value = 75;
        assert.strictEqual(handle.pos, 100);
        handle.value = 100;
        assert.strictEqual(handle.pos, 0);

        slider.min = 0;
        slider.max = 50;
        handle.value = 0;
        assert.strictEqual(handle.pos, 200);
        handle.value = 25;
        assert.strictEqual(handle.pos, 100);
        handle.value = 50;
        assert.strictEqual(handle.pos, 0);

        slider.min = 25;
        slider.max = 75;
        handle.value = 25;
        assert.strictEqual(handle.pos, 200);
        handle.value = 50;
        assert.strictEqual(handle.pos, 100);
        handle.value = 75;
        assert.strictEqual(handle.pos, 0);

        slider.step = 10;
        handle.value = 29;
        assert.strictEqual(handle.value, 25);
        assert.strictEqual(handle.pos, 200);
        handle.value = 30;
        assert.strictEqual(handle.value, 35);
        assert.strictEqual(handle.pos, 160);
        handle.value = 60;
        assert.strictEqual(handle.value, 65);
        assert.strictEqual(handle.pos, 40);
        handle.value = 71;
        assert.strictEqual(handle.value, 75);
        assert.strictEqual(handle.pos, 0);
    });

    QUnit.test('SliderHandle.pos -> horizontal', assert => {
        const elem = $('<div />').css('width', 200).appendTo(container);
        const slider = new Slider(elem, {});
        const handle = slider.handles[0];

        assert.strictEqual(slider.min, 0);
        assert.strictEqual(slider.max, 100);

        assert.strictEqual(handle.value, 0);
        assert.strictEqual(handle.pos, 0);

        handle.pos = 0;
        assert.strictEqual(handle.value, 0);
        handle.pos = 50;
        assert.strictEqual(handle.value, 25);
        handle.pos = 150;
        assert.strictEqual(handle.value, 75);
        handle.pos = 200;
        assert.strictEqual(handle.value, 100);

        slider.min = 50;
        handle.pos = 0;
        assert.strictEqual(handle.value, 50);
        handle.pos = 100;
        assert.strictEqual(handle.value, 75);
        handle.pos = 200;
        assert.strictEqual(handle.value, 100);

        slider.min = 0;
        slider.max = 50;
        handle.pos = 0;
        assert.strictEqual(handle.value, 0);
        handle.pos = 100;
        assert.strictEqual(handle.value, 25);
        handle.pos = 200;
        assert.strictEqual(handle.value, 50);

        slider.min = 25;
        slider.max = 75;
        handle.pos = 0;
        assert.strictEqual(handle.value, 25);
        handle.pos = 100;
        assert.strictEqual(handle.value, 50);
        handle.pos = 200;
        assert.strictEqual(handle.value, 75);

        slider.step = 10;
        handle.pos = 19;
        assert.strictEqual(handle.value, 25);
        assert.strictEqual(handle.pos, 0);
        handle.pos = 20;
        assert.strictEqual(handle.value, 35);
        assert.strictEqual(handle.pos, 40);
        handle.pos = 140;
        assert.strictEqual(handle.value, 65);
        assert.strictEqual(handle.pos, 160);
        handle.pos = 181;
        assert.strictEqual(handle.value, 75);
        assert.strictEqual(handle.pos, 200);
    });

    QUnit.test('SliderHandle.pos -> vertical', assert => {
        const elem = $('<div />').css('height', 200).appendTo(container);
        const slider = new Slider(elem, {orientation: 'vertical'});
        const handle = slider.handles[0];

        assert.strictEqual(slider.min, 0);
        assert.strictEqual(slider.max, 100);

        assert.strictEqual(handle.value, 0);
        assert.strictEqual(handle.pos, 200);

        handle.pos = 0;
        assert.strictEqual(handle.value, 100);
        handle.pos = 50;
        assert.strictEqual(handle.value, 75);
        handle.pos = 150;
        assert.strictEqual(handle.value, 25);
        handle.pos = 200;
        assert.strictEqual(handle.value, 0);

        slider.min = 50;
        handle.pos = 0;
        assert.strictEqual(handle.value, 100);
        handle.pos = 100;
        assert.strictEqual(handle.value, 75);
        handle.pos = 200;
        assert.strictEqual(handle.value, 50);

        slider.min = 0;
        slider.max = 50;
        handle.pos = 0;
        assert.strictEqual(handle.value, 50);
        handle.pos = 100;
        assert.strictEqual(handle.value, 25);
        handle.pos = 200;
        assert.strictEqual(handle.value, 0);

        slider.min = 25;
        slider.max = 75;
        handle.pos = 0;
        assert.strictEqual(handle.value, 75);
        handle.pos = 100;
        assert.strictEqual(handle.value, 50);
        handle.pos = 200;
        assert.strictEqual(handle.value, 25);

        slider.step = 10;
        handle.pos = 20;
        assert.strictEqual(handle.value, 75);
        assert.strictEqual(handle.pos, 0);
        handle.pos = 21;
        assert.strictEqual(handle.value, 65);
        assert.strictEqual(handle.pos, 40);
        handle.pos = 141;
        assert.strictEqual(handle.value, 35);
        assert.strictEqual(handle.pos, 160);
        handle.pos = 181;
        assert.strictEqual(handle.value, 25);
        assert.strictEqual(handle.pos, 200);
    });

    QUnit.test('SliderHandle.selected', assert => {
        const elem = $('<div />').css('width', 200).appendTo(container);
        const slider = new Slider(elem, {});
        const handle = slider.handles[0];

        assert.false(handle.selected);
        assert.false(handle.elem.hasClass('active'));
        assert.strictEqual(handle.elem.css('z-index'), '1');

        let events = $._data(elem[0], 'events');
        assert.strictEqual(events.mousewheel, undefined);
        assert.strictEqual(events.wheel, undefined);

        events = $._data(document, 'events');
        assert.strictEqual(events, undefined);

        handle.selected = true;
        assert.true(handle.selected);
        assert.true(handle.elem.hasClass('active'));
        assert.strictEqual(handle.elem.css('z-index'), '10');

        events = $._data(elem[0], 'events');
        assert.deepEqual(events.mousewheel[0].handler, handle._on_scroll);
        assert.deepEqual(events.wheel[0].handler, handle._on_scroll);

        events = $._data(document, 'events');
        assert.deepEqual(events.keydown[0].handler, handle._on_key);
    });

    QUnit.test('SliderHandle -> drag', assert => {
        const elem = $('<div />').css('width', 200).appendTo(container);
        const slider = new Slider(elem, {});
        const handle = slider.handles[0];

        slider.on('start', (e) => {
            assert.strictEqual(e.type, 'start');
            assert.deepEqual(e.widget, handle);
            assert.step('start event triggered');
        });

        slider.on('slide', (e) => {
            assert.strictEqual(e.type, 'slide');
            assert.deepEqual(e.widget, handle);
            assert.strictEqual(e.widget.pos, 100);
            assert.strictEqual(e.widget.value, 50);
            assert.step('slide event triggered');
        });

        slider.on('stop', (e) => {
            assert.strictEqual(e.type, 'stop');
            assert.deepEqual(e.widget, handle);
            assert.step('stop event triggered');
        });

        // mouse events
        handle.elem.trigger(new $.Event('mousedown'));
        assert.verifySteps(['start event triggered']);

        let events = $._data(document, 'events');
        assert.deepEqual(events.mousemove[0].handler, handle._on_move);
        assert.deepEqual(events.mouseup[0].handler, handle._on_end);

        $(document).trigger(new $.Event('mousemove', {
            pageX: 100 + slider.elem.offset().left
        }));
        assert.verifySteps(['slide event triggered']);

        $(document).trigger(new $.Event('mouseup'));
        assert.verifySteps(['stop event triggered']);

        events = $._data(document, 'events');
        assert.strictEqual(events.mousemove, undefined);
        assert.strictEqual(events.mouseup, undefined);

        // touch events
        handle.elem.trigger(new $.Event('touchstart'));
        assert.verifySteps(['start event triggered']);

        events = $._data(document, 'events');
        assert.deepEqual(events.touchmove[0].handler, handle._on_move);
        assert.deepEqual(events.touchend[0].handler, handle._on_end);

        handle.value = 0;
        $(document).trigger(new $.Event('touchmove', {
            touches: [{pageX: 100 + slider.elem.offset().left}]
        }));
        assert.verifySteps(['slide event triggered']);

        $(document).trigger(new $.Event('touchend'));
        assert.verifySteps(['stop event triggered']);

        events = $._data(document, 'events');
        assert.strictEqual(events.touchmove, undefined);
        assert.strictEqual(events.touchend, undefined);
    });

    QUnit.test('SliderHandle -> scroll', assert => {
        const elem = $('<div />').css('width', 200).appendTo(container);
        const slider = new Slider(elem, {});
        const handle = slider.handles[0];

        slider.on('change', (e) => {
            assert.strictEqual(e.type, 'change');
            assert.deepEqual(e.widget, handle);
            assert.step('change event triggered');
        });

        slider.elem.trigger(new $.Event('mousewheel'));
        assert.verifySteps([]);
        assert.strictEqual(handle.value, 0);

        handle.selected = true;

        slider.elem.trigger(new $.Event('mousewheel', {
            originalEvent: {deltaY: 1},
            preventDefault: function() {}
        }));
        assert.verifySteps(['change event triggered']);
        assert.strictEqual(handle.value, 1);

        slider.elem.trigger(new $.Event('wheel', {
            originalEvent: {deltaY: 1},
            preventDefault: function() {}
        }));
        assert.verifySteps(['change event triggered']);
        assert.strictEqual(handle.value, 2);

        slider.elem.trigger(new $.Event('mousewheel', {
            originalEvent: {deltaY: -1},
            preventDefault: function() {}
        }));
        assert.verifySteps(['change event triggered']);
        assert.strictEqual(handle.value, 1);

        slider.elem.trigger(new $.Event('wheel', {
            originalEvent: {deltaY: -1},
            preventDefault: function() {}
        }));
        assert.verifySteps(['change event triggered']);
        assert.strictEqual(handle.value, 0);
    });

    QUnit.test('SliderHandle -> keys', assert => {
        const elem_h = $('<div />').css('width', 200).appendTo(container);
        const slider_h = new Slider(elem_h, {});
        const handle_h = slider_h.handles[0];

        slider_h.on('change', (e) => {
            assert.strictEqual(e.type, 'change');
            assert.deepEqual(e.widget, handle_h);
            assert.step('change event triggered');
        });

        slider_h.elem.trigger(new $.Event('keydown'));
        assert.verifySteps([]);
        assert.strictEqual(handle_h.value, 0);

        handle_h.selected = true;

        slider_h.elem.trigger(new $.Event('keydown', {key: 'ArrowRight'}));
        assert.verifySteps(['change event triggered']);
        assert.strictEqual(handle_h.value, 1);

        slider_h.elem.trigger(new $.Event('keydown', {key: 'ArrowLeft'}));
        assert.verifySteps(['change event triggered']);
        assert.strictEqual(handle_h.value, 0);

        const elem_v = $('<div />').css('height', 200).appendTo(container);
        const slider_v = new Slider(elem_v, {orientation: 'vertical'});
        const handle_v = slider_v.handles[0];

        slider_v.on('change', (e) => {
            assert.strictEqual(e.type, 'change');
            assert.deepEqual(e.widget, handle_v);
            assert.step('change event triggered');
        });

        slider_v.elem.trigger(new $.Event('keydown'));
        assert.verifySteps([]);
        assert.strictEqual(handle_h.value, 0);

        handle_v.selected = true;

        slider_v.elem.trigger(new $.Event('keydown', {key: 'ArrowUp'}));
        assert.verifySteps(['change event triggered']);
        assert.strictEqual(handle_v.value, 1);

        slider_v.elem.trigger(new $.Event('keydown', {key: 'ArrowDown'}));
        assert.verifySteps(['change event triggered']);
        assert.strictEqual(handle_v.value, 0);
    });

    QUnit.test('SliderTrack', assert => {
        // horizontal slider with no range
        const elem_h = $('<div />').css('width', 200).appendTo(container);
        const slider_h = new Slider(elem_h, {});
        const track_h = slider_h.track;

        assert.strictEqual(track_h.range_elem, null);
        assert.strictEqual(track_h.elem.css('height'), '8px');

        // horizontal slider with min range
        const elem_h_min = $('<div />').css('width', 200).appendTo(container);
        const slider_h_min = new Slider(elem_h_min, {
            range: 'min',
            value: 25
        });
        const track_h_min = slider_h_min.track;

        assert.strictEqual(track_h_min.range_elem.css('left'), 'auto');
        assert.strictEqual(track_h_min.range_elem.css('right'), 'auto');
        assert.strictEqual(track_h_min.range_elem.css('width'), '50px');
        assert.strictEqual(track_h_min.range_elem.css('height'), '8px');

        slider_h_min.value = 50;
        assert.strictEqual(track_h_min.range_elem.css('width'), '100px');

        // horizontal slider with max range
        const elem_h_max = $('<div />').css('width', 200).appendTo(container);
        const slider_h_max = new Slider(elem_h_max, {
            range: 'max',
            value: 25
        });
        const track_h_max = slider_h_max.track;

        assert.strictEqual(track_h_max.range_elem.css('left'), 'auto');
        assert.strictEqual(track_h_max.range_elem.css('right'), '0px');
        assert.strictEqual(track_h_max.range_elem.css('width'), '150px');
        assert.strictEqual(track_h_max.range_elem.css('height'), '8px');

        slider_h_max.value = 50;
        assert.strictEqual(track_h_max.range_elem.css('width'), '100px');

        // horizontal slider with range
        const elem_h_range = $('<div />').css('width', 200).appendTo(container);
        const slider_h_range = new Slider(elem_h_range, {
            range: true,
            value: [25, 75]
        });
        const track_h_range = slider_h_range.track;

        assert.strictEqual(track_h_range.range_elem.css('left'), '50px');
        assert.strictEqual(track_h_range.range_elem.css('right'), 'auto');
        assert.strictEqual(track_h_range.range_elem.css('width'), '100px');
        assert.strictEqual(track_h_range.range_elem.css('height'), '8px');

        slider_h_range.value = [20, 80];
        assert.strictEqual(track_h_range.range_elem.css('left'), '40px');
        assert.strictEqual(track_h_range.range_elem.css('width'), '120px');

        // vertical slider with no range
        const elem_v = $('<div />').css('height', 200).appendTo(container);
        const slider_v = new Slider(elem_v, {orientation: 'vertical'});
        const track_v = slider_v.track;

        assert.strictEqual(track_v.range_elem, null);
        assert.strictEqual(track_v.elem.css('width'), '8px');

        // vertical slider with min range
        const elem_v_min = $('<div />').css('height', 200).appendTo(container);
        const slider_v_min = new Slider(elem_v_min, {
            orientation: 'vertical',
            range: 'min',
            value: 25
        });
        const track_v_min = slider_v_min.track;

        assert.strictEqual(track_v_min.range_elem.css('top'), 'auto');
        assert.strictEqual(track_v_min.range_elem.css('bottom'), '0px');
        assert.strictEqual(track_v_min.range_elem.css('width'), '8px');
        assert.strictEqual(track_v_min.range_elem.css('height'), '50px');

        slider_v_min.value = 50;
        assert.strictEqual(track_v_min.range_elem.css('height'), '100px');

        // vertical slider with max range
        const elem_v_max = $('<div />').css('height', 200).appendTo(container);
        const slider_v_max = new Slider(elem_v_max, {
            orientation: 'vertical',
            range: 'max',
            value: 25
        });
        const track_v_max = slider_v_max.track;

        assert.strictEqual(track_v_max.range_elem.css('top'), 'auto');
        assert.strictEqual(track_v_max.range_elem.css('bottom'), 'auto');
        assert.strictEqual(track_v_max.range_elem.css('width'), '8px');
        assert.strictEqual(track_v_max.range_elem.css('height'), '150px');

        slider_v_max.value = 50;
        assert.strictEqual(track_v_max.range_elem.css('height'), '100px');

        // vertical slider with range
        const elem_v_range = $('<div />').css('height', 200).appendTo(container);
        const slider_v_range = new Slider(elem_v_range, {
            orientation: 'vertical',
            range: true,
            value: [25, 75]
        });
        const track_v_range = slider_v_range.track;

        assert.strictEqual(track_v_range.range_elem.css('top'), '50px');
        assert.strictEqual(track_v_range.range_elem.css('bottom'), 'auto');
        assert.strictEqual(track_v_range.range_elem.css('width'), '8px');
        assert.strictEqual(track_v_range.range_elem.css('height'), '100px');

        slider_v_range.value = [20, 80];
        assert.strictEqual(track_v_range.range_elem.css('top'), '40px');
        assert.strictEqual(track_v_range.range_elem.css('height'), '120px');
    });

    QUnit.module('Slider -> treibstoff integration', hooks => {
        const ts = {
            ajax: {
                assert: null,
                attach: function (inst, elem) {
                    this.assert.step('attach slider widget');
                }
            }
        };

        hooks.before(() => {
            window.ts = ts;
        });

        hooks.after(() => {
            window.ts = undefined;
        });

        QUnit.test('Slider.constructor -> ts.ajax.attach', assert => {
            ts.ajax.assert = assert;

            const elem = $('<div />').css('width', 200).appendTo(container);
            new Slider(elem, {});
            assert.verifySteps(['attach slider widget']);
        });
    });

    QUnit.test('Slider.constructor -> options', assert => {
        // defaults
        let elem = $('<div />').css('width', 200).appendTo(container),
            slider = new Slider(elem, {});
        assert.strictEqual(slider.value, 0);
        assert.false(slider.range);
        assert.strictEqual(slider.handle_diameter, 20);
        assert.strictEqual(slider.thickness, 8);
        assert.strictEqual(slider.min, 0);
        assert.strictEqual(slider.max, 100);
        assert.false(slider.step);
        assert.strictEqual(slider.scroll_step, 1);
        assert.false(slider.vertical);

        // override defaults
        elem = $('<div />').css('height', 200).appendTo(container);
        slider = new Slider(elem, {
            value: 10,
            handle_diameter: 25,
            thickness: 10,
            min: 10,
            max: 50,
            step: 10,
            orientation: 'vertical'
        });
        assert.strictEqual(slider.value, 10);
        assert.strictEqual(slider.handle_diameter, 25);
        assert.strictEqual(slider.thickness, 10);
        assert.strictEqual(slider.min, 10);
        assert.strictEqual(slider.max, 50);
        assert.strictEqual(slider.step, 10);
        assert.strictEqual(slider.scroll_step, 10);
        assert.true(slider.vertical);

        // step takes precedence over scroll_step if given
        elem = $('<div />').css('width', 200).appendTo(container);
        slider = new Slider(elem, {
            scroll_step: 10
        });
        assert.false(slider.step);
        assert.strictEqual(slider.scroll_step, 10);

        elem = $('<div />').css('width', 200).appendTo(container);
        slider = new Slider(elem, {
            step: 5,
            scroll_step: 10
        });
        assert.strictEqual(slider.step, 5);
        assert.strictEqual(slider.scroll_step, 5);

        // value is array if range is true
        elem = $('<div />').css('width', 200).appendTo(container);
        slider = new Slider(elem, {});
        assert.strictEqual(slider.value, 0);
        assert.strictEqual(slider.handles.length, 1);

        elem = $('<div />').css('width', 200).appendTo(container);
        slider = new Slider(elem, {
            range: true
        });
        assert.deepEqual(slider.value, [0, 0]);
        assert.strictEqual(slider.handles.length, 2);

        // create event
        elem = $('<div />').css('width', 200).appendTo(container);
        new Slider(elem, {
            create: function(e) {
                assert.step('create event triggered');
            }
        });
        assert.verifySteps(['create event triggered']);

        // DOM element CSS classes and dimensions
        elem = $('<div />').css('width', 200).appendTo(container);
        slider = new Slider(elem, {});
        assert.strictEqual(elem.css('height'), '20px');
        assert.strictEqual(elem[0].className, '');

        elem = $('<div />').css('height', 200).appendTo(container);
        slider = new Slider(elem, {
            orientation: 'vertical',
            height: 200
        });
        assert.strictEqual(elem.css('height'), '200px');
        assert.strictEqual(elem.css('width'), '20px');
        assert.strictEqual(elem[0].className, 'slider-vertical');
    });

    QUnit.test('Slider.value', assert => {
        const elem_s = $('<div />').css('width', 200).appendTo(container);
        const slider_s = new Slider(elem_s, {});

        slider_s.value = 0;
        assert.strictEqual(slider_s.value, 0);
        slider_s.value = 50;
        assert.strictEqual(slider_s.value, 50);
        slider_s.value = 100;
        assert.strictEqual(slider_s.value, 100);
        assert.throws(() => {slider_s.value = [1, 2]}, 'Invalid value size');
        assert.throws(() => {slider_s.value = -1}, 'Value out of bounds');
        assert.throws(() => {slider_s.value = 101}, 'Value out of bounds');

        const elem_r = $('<div />').css('width', 200).appendTo(container);
        const slider_r = new Slider(elem_r, {range: true});

        slider_r.value = [100, 100];
        assert.deepEqual(slider_r.value, [100, 100]);
        slider_r.value = [50, 50];
        assert.deepEqual(slider_r.value, [50, 50]);
        slider_r.value = [0, 0];
        assert.deepEqual(slider_r.value, [0, 0]);
        slider_r.value = [25, 75];
        assert.deepEqual(slider_r.value, [25, 75]);
        assert.throws(() => {slider_r.value = 1}, 'Invalid value size');
        assert.throws(() => {slider_r.value = [-1, 100]}, 'Value out of bounds');
        assert.throws(() => {slider_r.value = [0, 101]}, 'Value out of bounds');
        assert.throws(
            () => {slider_r.value = [75, 25]},
            'Single values in range must be in ascending order'
        );
    });

    QUnit.test('Slider.size', assert => {
        const elem_h = $('<div />').css('width', 100).appendTo(container);
        const slider_h = new Slider(elem_h, {});
        assert.strictEqual(slider_h.size, 100);

        const elem_v = $('<div />').css('height', 200).appendTo(container);
        const slider_v = new Slider(elem_v, {orientation: 'vertical'});
        assert.strictEqual(slider_v.size, 200);
    });

    QUnit.test('Slider._closest_handle', assert => {
        // horizontal single slider
        const elem_sh = $('<div />').css('width', 200).appendTo(container);
        const slider_sh = new Slider(elem_sh, {});

        assert.strictEqual(slider_sh.handles.length, 1);
        assert.deepEqual(slider_sh._closest_handle(100), slider_sh.handles[0]);

        // vertical single slider
        const elem_sv = $('<div />').css('height', 200).appendTo(container);
        const slider_sv = new Slider(elem_sv, {});

        assert.strictEqual(slider_sv.handles.length, 1);
        assert.deepEqual(slider_sv._closest_handle(100), slider_sv.handles[0]);

        // horizontal range slider
        const elem_rh = $('<div />').css('width', 200).appendTo(container);
        const slider_rh = new Slider(elem_rh, {range: true});

        assert.strictEqual(slider_rh.handles.length, 2);
        assert.deepEqual(slider_rh.value, [0, 0]);
        assert.deepEqual(slider_rh._closest_handle(-1), slider_rh.handles[0]);
        assert.deepEqual(slider_rh._closest_handle(0), slider_rh.handles[0]);
        assert.deepEqual(slider_rh._closest_handle(1), slider_rh.handles[1]);

        slider_rh.value = [25, 75];
        assert.deepEqual(slider_rh.value, [25, 75]);
        assert.deepEqual(slider_rh._closest_handle(50), slider_rh.handles[0]);
        assert.deepEqual(slider_rh._closest_handle(75), slider_rh.handles[0]);
        assert.deepEqual(slider_rh._closest_handle(100), slider_rh.handles[0]);
        assert.deepEqual(slider_rh._closest_handle(125), slider_rh.handles[1]);
        assert.deepEqual(slider_rh._closest_handle(150), slider_rh.handles[1]);
        assert.deepEqual(slider_rh._closest_handle(175), slider_rh.handles[1]);

        slider_rh.value = [100, 100];
        assert.deepEqual(slider_rh.value, [100, 100]);
        assert.deepEqual(slider_rh._closest_handle(199), slider_rh.handles[0]);
        assert.deepEqual(slider_rh._closest_handle(200), slider_rh.handles[0]);
        assert.deepEqual(slider_rh._closest_handle(201), slider_rh.handles[1]);

        // vertical range slider
        const elem_rv = $('<div />').css('height', 200).appendTo(container);
        const slider_rv = new Slider(elem_rv, {
            range: true,
            orientation: 'vertical'
        });

        assert.strictEqual(slider_rv.handles.length, 2);
        assert.deepEqual(slider_rv.value, [0, 0]);
        assert.deepEqual(slider_rv._closest_handle(199), slider_rv.handles[1]);
        assert.deepEqual(slider_rv._closest_handle(200), slider_rv.handles[1]);
        assert.deepEqual(slider_rv._closest_handle(201), slider_rv.handles[0]);

        slider_rv.value = [25, 75];
        assert.deepEqual(slider_rv.value, [25, 75]);
        assert.strictEqual(slider_rv.handles[0].pos, 150);
        assert.strictEqual(slider_rv.handles[1].pos, 50);
        assert.deepEqual(slider_rv._closest_handle(175), slider_rv.handles[0]);
        assert.deepEqual(slider_rv._closest_handle(150), slider_rv.handles[0]);
        assert.deepEqual(slider_rv._closest_handle(125), slider_rv.handles[0]);
        // XXX: should return handles[1] at value 100
        assert.deepEqual(slider_rv._closest_handle(99.99), slider_rv.handles[1]);
        assert.deepEqual(slider_rv._closest_handle(75), slider_rv.handles[1]);
        assert.deepEqual(slider_rv._closest_handle(50), slider_rv.handles[1]);

        slider_rv.value = [100, 100];
        assert.deepEqual(slider_rv.value, [100, 100]);
        assert.deepEqual(slider_rv._closest_handle(-1), slider_rv.handles[1]);
        // XXX: should return handles[0] at value 0.01
        assert.deepEqual(slider_rv._closest_handle(.01), slider_rv.handles[0]);
        assert.deepEqual(slider_rv._closest_handle(1), slider_rv.handles[0]);
    });

    QUnit.test('Slider.pos_from_evt', assert => {
        let pos;

        const elem_h = $('<div />').css('width', 200).appendTo(container);
        const slider_h = new Slider(elem_h, {});

        pos = slider_h.pos_from_evt(new $.Event('mousedown', {
            pageX: 10 + slider_h.elem.offset().left
        }));
        assert.strictEqual(pos, 10);

        pos = slider_h.pos_from_evt(new $.Event('mousemove', {
            pageX: 20 + slider_h.elem.offset().left
        }));
        assert.strictEqual(pos, 20);

        pos = slider_h.pos_from_evt(new $.Event('touchstart', {
            touches: [{pageX: 30 + slider_h.elem.offset().left}]
        }));
        assert.strictEqual(pos, 30);

        pos = slider_h.pos_from_evt(new $.Event('touchmove', {
            touches: [{pageX: 40 + slider_h.elem.offset().left}]
        }));
        assert.strictEqual(pos, 40);

        const elem_v = $('<div />').css('height', 200).appendTo(container);
        const slider_v = new Slider(elem_v, {orientation: 'vertical'});

        pos = slider_v.pos_from_evt(new $.Event('mousedown', {
            pageY: 50 + slider_v.elem.offset().top
        }));
        assert.strictEqual(pos, 50);

        pos = slider_v.pos_from_evt(new $.Event('mousemove', {
            pageY: 60 + slider_v.elem.offset().top
        }));
        assert.strictEqual(pos, 60);

        pos = slider_v.pos_from_evt(new $.Event('touchstart', {
            touches: [{pageY: 70 + slider_v.elem.offset().top}]
        }));
        assert.strictEqual(pos, 70);

        pos = slider_v.pos_from_evt(new $.Event('touchmove', {
            touches: [{pageY: 80 + slider_v.elem.offset().top}]
        }));
        assert.strictEqual(pos, 80);
    });

    QUnit.test('Slider.unselect_handles', assert => {
        const elem_1 = $('<div />').css('width', 200).appendTo(container);
        const slider_1 = new Slider(elem_1, {});

        const elem_2 = $('<div />').css('width', 200).appendTo(container);
        const slider_2 = new Slider(elem_2, {});

        const elem_3 = $('<div />').css('width', 200).appendTo(container);
        const slider_3 = new Slider(elem_3, {});

        slider_1.handles[0].selected = true;
        assert.true(slider_1.handles[0].selected)
        assert.false(slider_2.handles[0].selected)
        assert.false(slider_3.handles[0].selected)

        slider_2.handles[0].selected = true;
        assert.false(slider_1.handles[0].selected)
        assert.true(slider_2.handles[0].selected)
        assert.false(slider_3.handles[0].selected)

        slider_3.handles[0].selected = true;
        assert.false(slider_1.handles[0].selected)
        assert.false(slider_2.handles[0].selected)
        assert.true(slider_3.handles[0].selected)
    });

    QUnit.test('Slider.destroy', assert => {
        $(window).off('resize');
        let events = $._data(window, 'events');
        assert.strictEqual(events, undefined);

        const elem = $('<div />').css('width', 200).appendTo(container);
        const slider = new Slider(elem, {});

        events = $._data(window, 'events');
        assert.deepEqual(events.resize[0].handler, slider.handles[0]._on_resize);
        assert.deepEqual(events.resize[1].handler, slider.track.update);

        slider.destroy();
        events = $._data(window, 'events');
        assert.strictEqual(events, undefined);
    });

    QUnit.test('Slider -> events', assert => {
        const elem = $('<div />').css('width', 200).appendTo(container);
        const slider = new Slider(elem, {
            create: e => {assert.step('create')},
            start: e => {assert.step('start')},
            slide: e => {assert.step('slide')},
            stop: e => {assert.step('stop')},
            change: e => {assert.step('change')},
        });
        assert.verifySteps(['create']);

        let handle = slider.handles[0];
        handle.elem.trigger(new $.Event('mousedown'));
        assert.verifySteps(['start']);

        $(document).trigger(new $.Event('mousemove', {
            pageX: 100 + slider.elem.offset().left
        }));
        assert.verifySteps(['slide']);

        $(document).trigger(new $.Event('mouseup'));
        assert.verifySteps(['stop']);

        const change_evt = new $.Event('mousewheel', {
            originalEvent: {deltaY: 1},
            preventDefault: function() {}
        });
        slider.elem.trigger(change_evt);
        assert.verifySteps(['change']);

        const ext_change = e => {
            assert.step('ext_change')
        }
        slider.on('change', ext_change);
        slider.elem.trigger(change_evt);
        assert.verifySteps(['change', 'ext_change']);

        slider.off('change', ext_change);
        slider.elem.trigger(change_evt);
        assert.verifySteps(['change']);
    });

    QUnit.test('Slider -> select', assert => {
        // single slider
        const elem_s = $('<div />').css('width', 200).appendTo(container);
        const slider_s = new Slider(elem_s, {});

        slider_s.on('change', (e) => {
            assert.strictEqual(e.type, 'change');
            assert.deepEqual(e.widget, slider_s.handles[0]);
            assert.step('change event triggered');
        });

        assert.false(slider_s.handles[0].selected);

        slider_s.elem.trigger(new $.Event('mousedown', {
            pageX: 100 + slider_s.elem.offset().left,
            pageY: 0 + slider_s.elem.offset().top,
        }));

        assert.verifySteps(['change event triggered']);
        assert.true(slider_s.handles[0].selected);
        assert.strictEqual(slider_s.value, 50);

        slider_s.handles[0].selected = false;
        slider_s.elem.trigger(new $.Event('touchstart', {
            touches: [{
                pageX: 150 + slider_s.elem.offset().left,
                pageY: 0 + slider_s.elem.offset().top,
            }],
        }));

        assert.verifySteps(['change event triggered']);
        assert.true(slider_s.handles[0].selected);
        assert.strictEqual(slider_s.value, 75);

        // range slider
        const elem_r = $('<div />').css('width', 200).appendTo(container);
        const slider_r = new Slider(elem_r, {range: true});

        let current_handle = null;
        slider_r.on('change', (e) => {
            assert.strictEqual(e.type, 'change');
            assert.deepEqual(e.widget, slider_r.handles[current_handle]);
            assert.step('change event triggered');
        });

        assert.false(slider_r.handles[0].selected);
        assert.false(slider_r.handles[1].selected);

        current_handle = 1;
        slider_r.elem.trigger(new $.Event('mousedown', {
            pageX: 100 + slider_r.elem.offset().left,
            pageY: 0 + slider_r.elem.offset().top,
        }));

        assert.verifySteps(['change event triggered']);
        assert.false(slider_r.handles[0].selected);
        assert.true(slider_r.handles[1].selected);
        assert.deepEqual(slider_r.value, [0, 50]);
    });

    // QUnit.module('Slider -> resize window', hooks => {
    //     let base_width = $(window).width(),
    //         base_height = $(window).height();
    //
    //     hooks.after(() => {
    //         viewport.set(base_width, base_height);
    //     });
    //
    //     QUnit.skip('resize', assert => {
    //         const elem = $('<div />').css('width', 200).appendTo(container);
    //         const slider = new Slider(elem, {value: 50});
    //         const track = slider_h.track;
    //         const handle = slider.handles[0];
    //
    //         assert.strictEqual(slider.size, 200);
    //         assert.strictEqual(track.elem.width(), 200);
    //         assert.strictEqual(handle.pos, 50);
    //
    //         viewport.set(base_width / 2, base_height);
    //         window.dispatchEvent(new Event('resize'));
    //
    //         assert.strictEqual(slider.size, 100);
    //         assert.strictEqual(track.elem.width(), 100);
    //         assert.strictEqual(handle.pos, 25);
    //     });
    // });

    QUnit.test('SliderWidget -> single value', assert => {
        $(`
        <div class="yafowil_slider">
          <input class="slider_value" type="text" value="60"/>
          <span class="slider_value">60</span>
          <div class="slider"> </div>
        </div>
        `).appendTo(container);

        SliderWidget.initialize(container);

        const widget = $('.yafowil_slider', container).data('yafowil-slider');
        assert.strictEqual(widget.value, 60);
        assert.strictEqual(widget.elements[0].input.attr('value'), '60');
        assert.strictEqual(widget.elements[0].label.html(), '60');

        widget.value = 50;
        assert.strictEqual(widget.value, 50);
        assert.strictEqual(widget.elements[0].input.attr('value'), '50');
        assert.strictEqual(widget.elements[0].label.html(), '50');

        widget.slider.handles[0].value = 40;
        widget.slider.trigger('change', widget.slider.handles[0]);
        assert.strictEqual(widget.value, 40);
        assert.strictEqual(widget.elements[0].input.attr('value'), '40');
        assert.strictEqual(widget.elements[0].label.html(), '40');
    });

    QUnit.test('SliderWidget -> range value', assert => {
        $(`
        <div class="yafowil_slider" data-range="true">
          <input class="lower_value" type="text" value="25"/>
          <input class="upper_value" type="text" value="75"/>
          <span class="lower_value">25</span>
          <span class="upper_value">75</span>
          <div class="slider"> </div>
        </div>
        `).appendTo(container);

        SliderWidget.initialize(container);

        const widget = $('.yafowil_slider', container).data('yafowil-slider');
        assert.deepEqual(widget.value, [25, 75]);
        assert.strictEqual(widget.elements[0].input.attr('value'), '25');
        assert.strictEqual(widget.elements[0].label.html(), '25');
        assert.strictEqual(widget.elements[1].input.attr('value'), '75');
        assert.strictEqual(widget.elements[1].label.html(), '75');

        widget.value = [40, 60];
        assert.deepEqual(widget.value, [40, 60]);
        assert.strictEqual(widget.elements[0].input.attr('value'), '40');
        assert.strictEqual(widget.elements[0].label.html(), '40');
        assert.strictEqual(widget.elements[1].input.attr('value'), '60');
        assert.strictEqual(widget.elements[1].label.html(), '60');

        widget.slider.handles[0].value = 50;
        widget.slider.trigger('change', widget.slider.handles[0]);
        assert.deepEqual(widget.value, [50, 60]);
        assert.strictEqual(widget.elements[0].input.attr('value'), '50');
        assert.strictEqual(widget.elements[0].label.html(), '50');
    });

    QUnit.test('register_array_subscribers', assert => {
        let _array_subscribers = {
            on_add: []
        };

        // window.yafowil_array is undefined - return
        register_array_subscribers();
        assert.deepEqual(_array_subscribers['on_add'], []);

        // patch yafowil_array
        window.yafowil_array = {
            on_array_event: function(evt_name, evt_function) {
                _array_subscribers[evt_name] = evt_function;
            },
            inside_template(elem) {
                return elem.parents('.arraytemplate').length > 0;
            }
        };
        register_array_subscribers();

        // create table DOM
        let table = $('<table />')
            .append($('<tr />'))
            .append($('<td />'))
            .appendTo('body');

        let el = $(`<div />`).addClass('yafowil_slider');
        $('td', table).addClass('arraytemplate');
        el.appendTo($('td', table));

        // invoke array on_add - returns
        _array_subscribers['on_add'].apply(null, $('tr', table));
        let widget = el.data('yafowil-slider');
        assert.notOk(widget);
        $('td', table).removeClass('arraytemplate');

        // invoke array on_add
        _array_subscribers['on_add'].apply(null, $('tr', table));
        widget = el.data('yafowil-slider');
        assert.ok(widget);
        table.remove();
        window.yafowil_array = undefined;
        _array_subscribers = undefined;
    });
});
