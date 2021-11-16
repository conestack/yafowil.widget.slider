import $ from 'jquery';
import { SliderWidget } from "../src/widget";

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
        create_elem(width);
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
        assert.deepEqual(slider.elem, elem);
        assert.strictEqual(slider.range, false);
        assert.strictEqual(slider.handle_diameter, 20);
        assert.strictEqual(slider.thickness, 15);
        assert.strictEqual(slider.min, 0);
        assert.strictEqual(slider.max, 100);
        assert.strictEqual(slider.step, false);
        assert.strictEqual(slider.vertical, false);
        assert.strictEqual(slider.dim_attr, 'width');
        assert.strictEqual(slider.dir_attr, 'left');

        assert.ok(slider.slider_elem.is('div'));
        assert.strictEqual(slider.slider_elem.css('height'), '20px');
        assert.strictEqual(slider.handles.length, 1);
        let handle = slider.handles[0];
        assert.strictEqual(handle.elem.attr('class'), 'slider-handle');
        assert.strictEqual(handle.elem.css('width'), '20px');
        assert.strictEqual(handle.elem.css('height'), '20px');

        assert.ok(slider.handle_singletouch);
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
            let val = transform(pos, 'range', width, 0, 100);
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
            let val = transform(pos, 'range', width, 0, 100);
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
        create_elem(height, true);
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
        assert.deepEqual(slider.elem, elem);
        assert.strictEqual(slider.range, false);
        assert.strictEqual(slider.handle_diameter, 20);
        assert.strictEqual(slider.thickness, 15);
        assert.strictEqual(slider.min, 0);
        assert.strictEqual(slider.max, 100);
        assert.strictEqual(slider.step, false);
        assert.strictEqual(slider.vertical, true);
        assert.strictEqual(slider.dim_attr, 'height');
        assert.strictEqual(slider.dir_attr, 'top');
        assert.ok(slider.slider_elem.hasClass('slider-vertical'));

        assert.ok(slider.slider_elem.is('div'));
        assert.strictEqual(slider.slider_elem.css('width'), '20px');
        assert.strictEqual(slider.handles.length, 1);
        let handle = slider.handles[0];
        assert.strictEqual(handle.elem.attr('class'), 'slider-handle');
        assert.strictEqual(handle.elem.css('width'), '20px');
        assert.strictEqual(handle.elem.css('height'), '20px');

        assert.ok(slider.handle_singletouch);
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
        let val = transform(pos, 'range', height, 0, 100);
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
            let val = transform(pos, 'range', height, 0, 100);
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
            let val = transform(pos, 'range', height, 0, 100);
            assert.strictEqual(handle.pos, pos);
            assert.strictEqual(handle.value, val);
            assert.strictEqual(slider.slider_track.track_elem.css('height'), pos + 'px');
        });
    });
});

QUnit.module('range max slider', hooks => {
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
            assert.deepEqual(slider.elem, elem);
            assert.strictEqual(slider.range, 'max');
            assert.strictEqual(slider.range_max, true);
            assert.strictEqual(slider.handles.length, 1);
            assert.strictEqual(
                slider.slider_track.track_elem.css('right'),
                '0px'
            );
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
        let lower_val_elem = $(`<input class="lower_value" />`);
        let lower_span_elem = $(`<span class="lower_value" />`);
        let upper_val_elem = $(`<input class="upper_value" />`);
        let upper_span_elem = $(`<input class="upper_value" />`);

        QUnit.test('constructor', assert => {
            slider = new SliderWidget(elem, options);
            assert.deepEqual(slider.elem, elem);
            assert.strictEqual(slider.range, true);
            assert.strictEqual(slider.range_true, true);
            assert.strictEqual(slider.handles.length, 2);
        });
        QUnit.test('set value', assert => {
            assert.ok(true)

            $('.yafowil_slider')
                .append(lower_span_elem)
                .append(lower_val_elem)
                .append(upper_span_elem)
                .append(upper_val_elem);

            slider = new SliderWidget(elem, options);
            console.log(slider.handles[0].value)
        });
    });
});


///// outsource to helpers

function transform(val, type, dim, min, max, step) {
    if (type === 'step') {
        let condition = min === 0 ? max - step / 2 : max - min / 2;
        val = val > condition ? max : step * parseInt(val / step);
        val = val <= min ? min : val;
    } else if (type === 'screen') {
        val = parseInt(dim * ((val - min) / (max - min)));
    } else if (type === 'range') {
        val = parseInt((max - min) * (val / dim) + min);
    }
    return val;
}

function create_elem(dim, vertical) {
    let form_group = $(`
      <div class="form-group">
        <label class="col-sm-2 control-label">
          Slider
        </label>

        <div class="col-sm-10">
          <div class="yafowil_slider" id="test-slider">
            <input class="slider_value" 
                   style="display:none;" 
                   type="text" 
                   value="20">
          <div class="slider" />
        </div>
      </div>
    `);

    $('#container').append(form_group);
    if (vertical) {
        form_group.css("height", `${dim}px`);
    } else {
        form_group.css("width", `${dim}px`);
    }
}