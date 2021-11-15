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
    QUnit.test('handle_singletouch()', assert => {
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
});

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