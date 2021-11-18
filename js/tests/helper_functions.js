import $ from 'jquery';

export function transform(val, type, dim, min, max, step) {
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

export function create_elem(dim, vertical) {
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

export function test_constructor_widget(assert, slider, options, elem, dim) {
    assert.deepEqual(slider.elem, elem);
    assert.ok(slider.handle_singletouch);

    if ($.isEmptyObject(options)) {
        assert.strictEqual(slider.handles.length, 1);
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
    } else {
        if (options.orientation) {
            assert.strictEqual(slider.vertical, true);
            assert.strictEqual(slider.dim_attr, 'height');
            assert.strictEqual(slider.dir_attr, 'top');
            assert.ok(slider.slider_elem.hasClass('slider-vertical'));
            assert.strictEqual(slider.slider_elem.css('width'), '20px');
        } else {
            assert.strictEqual(slider.vertical, false);
            assert.strictEqual(slider.dim_attr, 'width');
            assert.strictEqual(slider.dir_attr, 'left');
            assert.notOk(slider.slider_elem.hasClass('slider-vertical'));
            assert.strictEqual(slider.slider_elem.css('height'), '20px');
        }
        if (options.range === true) {
            assert.strictEqual(slider.handles.length, 2);
            assert.strictEqual(slider.range, true);
            assert.strictEqual(slider.range_true, true);
            assert.strictEqual(slider.handles[0].value, String(options.values[0]));
            assert.strictEqual(slider.handles[1].value, String(options.values[1]));
        } else if (options.range === 'max') {
            assert.strictEqual(slider.handles.length, 1);
            assert.strictEqual(slider.range, 'max');
            assert.strictEqual(slider.range_max, true);
            assert.strictEqual(
                slider.slider_track.track_elem.css('right'),
                '0px'
            );
        } else {
            assert.strictEqual(slider.handles.length, 1);
            assert.strictEqual(slider.range_max, false);
        }
    }
    
}

export function test_constructor_handle(assert, handle) {
    assert.strictEqual(handle.elem.attr('class'), 'slider-handle');
    assert.strictEqual(handle.elem.css('width'), '20px');
    assert.strictEqual(handle.elem.css('height'), '20px');
}