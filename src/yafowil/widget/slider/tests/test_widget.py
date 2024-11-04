from node.utils import UNSET
from yafowil.base import factory
from yafowil.compat import IS_PY2
from yafowil.tests import fxml
from yafowil.tests import YafowilTestCase
import os
import unittest


if not IS_PY2:
    from importlib import reload


def np(path):
    return path.replace('/', os.path.sep)


class TestSliderWidget(YafowilTestCase):

    def setUp(self):
        super(TestSliderWidget, self).setUp()
        from yafowil.widget import slider
        from yafowil.widget.slider import widget
        reload(widget)
        slider.register()

    def test_render_no_range(self):
        # Render no range
        widget = factory(
            'slider',
            name='sliderfield')
        self.checkOutput("""
        <div class="yafowil_slider" data-handle_diameter="20" data-max="100"
             data-min="0" data-step="1" data-thickness="8">
          <input class="slider_value" id="input-sliderfield" name="sliderfield"
                 style="display:none;" type="text" value=""/>
          <div class="slider"> </div>
        </div>
        """, fxml(widget()))

    def test_extract_no_range(self):
        # Extract no range
        widget = factory(
            'slider',
            name='sliderfield')
        request = {'sliderfield': ''}
        data = widget.extract(request)
        self.assertEqual(
            [data.name, data.value, data.extracted, data.errors],
            ['sliderfield', UNSET, UNSET, []]
        )
        request = {'sliderfield': '5'}
        data = widget.extract(request)
        self.assertEqual(
            [data.name, data.value, data.extracted, data.errors],
            ['sliderfield', UNSET, 5, []]
        )

    def test_render_no_range_preset_value(self):
        # Render no range, preset value
        widget = factory(
            'slider',
            name='sliderfield',
            value=3)
        self.checkOutput("""
        <div class="yafowil_slider" data-handle_diameter="20" data-max="100"
             data-min="0" data-step="1" data-thickness="8">
          <input class="slider_value" id="input-sliderfield" name="sliderfield"
                 style="display:none;" type="text" value="3"/>
          <div class="slider">
          </div>
        </div>
        """, fxml(widget()))

    def test_extract_no_range_preset_value(self):
        # Extract no range, preset value
        widget = factory(
            'slider',
            name='sliderfield',
            value=3)
        request = {'sliderfield': ''}
        data = widget.extract(request)
        self.assertEqual(
            [data.name, data.value, data.extracted, data.errors],
            ['sliderfield', 3, UNSET, []]
        )
        request = {'sliderfield': '5'}
        data = widget.extract(request)
        self.assertEqual(
            [data.name, data.value, data.extracted, data.errors],
            ['sliderfield', 3, 5, []]
        )

    def test_render_no_range_display_value(self):
        # Render no range, display value
        widget = factory(
            'slider',
            name='sliderfield',
            value=20,
            props={
                'show_value': True,
                'unit': 'Unit'
            })
        self.checkOutput("""
        <div class="yafowil_slider" data-handle_diameter="20" data-max="100"
             data-min="0" data-step="1" data-thickness="8">
          <input class="slider_value" id="input-sliderfield" name="sliderfield"
                 style="display:none;" type="text" value="20"/>
          <span class="unit">Unit: </span>
          <span class="slider_value">20</span>
          <div class="slider"> </div>
        </div>
        """, fxml(widget()))

    def test_render_range(self):
        # Render range
        widget = factory(
            'slider',
            name='sliderfield',
            props={
                'range': True
            })
        self.checkOutput("""
        <div class="yafowil_slider" data-handle_diameter="20" data-max="100"
             data-min="0" data-range="true" data-step="1" data-thickness="8">
          <input class="lower_value" id="input-lower-sliderfield"
                 name="sliderfield.lower" style="display:none;"
                 type="text" value=""/>
          <input class="upper_value" id="input-upper-sliderfield"
                 name="sliderfield.upper" style="display:none;"
                 type="text" value=""/>
          <div class="slider">
          </div>
        </div>
        """, fxml(widget()))

    def test_extract_range(self):
        # Extract range
        widget = factory(
            'slider',
            name='sliderfield',
            props={
                'range': True
            })
        request = {
            'sliderfield.lower': '',
            'sliderfield.upper': ''
        }
        data = widget.extract(request)
        self.assertEqual(
            [data.name, data.value, data.extracted, data.errors],
            ['sliderfield', UNSET, [UNSET, UNSET], []]
        )
        request = {
            'sliderfield.lower': '4',
            'sliderfield.upper': '6'
        }
        data = widget.extract(request)
        self.assertEqual(
            [data.name, data.value, data.extracted, data.errors],
            ['sliderfield', UNSET, [4, 6], []]
        )

    def test_render_range_preset_value(self):
        # Render range, preset value
        widget = factory(
            'slider',
            name='sliderfield',
            value=[2, 4],
            props={
                'range': True
            })
        self.checkOutput("""
        <div class="yafowil_slider" data-handle_diameter="20" data-max="100"
             data-min="0" data-range="true" data-step="1" data-thickness="8">
          <input class="lower_value" id="input-lower-sliderfield"
                 name="sliderfield.lower" style="display:none;"
                 type="text" value="2"/>
          <input class="upper_value" id="input-upper-sliderfield"
                 name="sliderfield.upper" style="display:none;"
                 type="text" value="4"/>
          <div class="slider"> </div>
        </div>
        """, fxml(widget()))

    def test_extract_range_preset_value(self):
        # Extract range, preset value
        widget = factory(
            'slider',
            name='sliderfield',
            value=[2, 4],
            props={
                'range': True
            })
        request = {
            'sliderfield.lower': '',
            'sliderfield.upper': ''
        }
        data = widget.extract(request)
        self.assertEqual(
            [data.name, data.value, data.extracted, data.errors],
            ['sliderfield', [2, 4], [UNSET, UNSET], []]
        )
        request = {
            'sliderfield.lower': '4',
            'sliderfield.upper': '6'
        }
        data = widget.extract(request)
        self.assertEqual(
            [data.name, data.value, data.extracted, data.errors],
            ['sliderfield', [2, 4], [4, 6], []]
        )

    def test_render_with_all_options(self):
        # Render with all options
        widget = factory(
            'slider',
            name='sliderfield',
            value=[2, 4],
            props={
                'show_value': True,
                'unit': 'Kg',
                'orientation': 'vertical',
                'height': 120,
                'range': True,
                'min': 1,
                'max': 50,
                'step': 5,
                'slide': 'some_ns.some_callback',
                'change': 'some_ns.some_callback',
                'data': {'mydata': 1}
            })
        self.assertEqual(widget(), (
            '<div class="yafowil_slider" '
            'data-change=\'some_ns.some_callback\' '
            'data-handle_diameter=\'20\' '
            'data-max=\'50\' '
            'data-min=\'1\' '
            'data-mydata=\'1\' '
            'data-orientation=\'vertical\' '
            'data-range=\'true\' '
            'data-slide=\'some_ns.some_callback\' '
            'data-step=\'5\' '
            'data-thickness=\'8\'><input '
            'class="lower_value" '
            'id="input-lower-sliderfield" '
            'name="sliderfield.lower" '
            'style="display:none;" '
            'type="text" '
            'value="2" /><input '
            'class="upper_value" '
            'id="input-upper-sliderfield" '
            'name="sliderfield.upper" '
            'style="display:none;" '
            'type="text" '
            'value="4" /><span '
            'class="unit">Kg: </span><span '
            'class="lower_value">2</span> - <span '
            'class="upper_value">4</span><div '
            'class="slider" '
            'style="height:120px;"> </div></div>'
        ))

    def test_render_display_mode(self):
        # Render display mode, fails
        widget = factory(
            'slider',
            name='sliderfield',
            mode='display')
        with self.assertRaises(NotImplementedError) as arc:
            widget()
        msg = '``yafowil.widget.slider`` does not support display mode yet'
        self.assertEqual(str(arc.exception), msg)

    def test_reserved_data_attribute(self):
        # Render reserved data attribute, fails
        widget = factory(
            'slider',
            name='sliderfield',
            props={
                'data': {'min': 1}
            })
        with self.assertRaises(ValueError) as arc:
            widget()
        msg = "Additional data dict contains reserved attribute name 'min'"
        self.assertEqual(str(arc.exception), msg)

    def test_resources(self):
        factory.theme = 'default'
        resources = factory.get_resources('yafowil.widget.slider')
        self.assertTrue(resources.directory.endswith(np('/slider/resources')))
        self.assertEqual(resources.name, 'yafowil.widget.slider')
        self.assertEqual(resources.path, 'yafowil-slider')

        scripts = resources.scripts
        self.assertEqual(len(scripts), 1)

        self.assertTrue(scripts[0].directory.endswith(np('/slider/resources')))
        self.assertEqual(scripts[0].path, 'yafowil-slider')
        self.assertEqual(scripts[0].file_name, 'widget.min.js')
        self.assertTrue(os.path.exists(scripts[0].file_path))

        styles = resources.styles
        self.assertEqual(len(styles), 1)

        self.assertTrue(styles[0].directory.endswith(np('/slider/resources')))
        self.assertEqual(styles[0].path, 'yafowil-slider')
        self.assertEqual(styles[0].file_name, 'widget.css')
        self.assertTrue(os.path.exists(styles[0].file_path))


if __name__ == '__main__':
    unittest.main()
