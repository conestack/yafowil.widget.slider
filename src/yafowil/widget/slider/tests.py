from yafowil.compat import IS_PY2

if not IS_PY2:
    from importlib import reload 

from node.utils import UNSET
from yafowil.base import ExtractionError
from yafowil.base import factory
from yafowil.tests import YafowilTestCase
from yafowil.tests import fxml
import yafowil.loader


class TestSliderWidget(YafowilTestCase):

    def setUp(self):
        super(TestSliderWidget, self).setUp()
        from yafowil.widget.slider import widget
        reload(widget)

    def test_render_no_range(self):
        # Render no range
        widget = factory(
            'slider',
            name='sliderfield')
        self.check_output("""
        <div class="yafowil_slider">
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
        self.check_output("""
        <div class="yafowil_slider">
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
        self.check_output("""
        <div class="yafowil_slider">
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
        self.check_output("""
        <div class="yafowil_slider" data-range="true">
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
        self.check_output("""
        <div class="yafowil_slider" data-range="true">
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
            'data-max=\'50\' '
            'data-min=\'1\' '
            'data-mydata=\'1\' '
            'data-orientation=\'vertical\' '
            'data-range=\'true\' '
            'data-slide=\'some_ns.some_callback\' '
            'data-step=\'5\'><input '
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
        err = self.expect_error(
            NotImplementedError,
            widget
        )
        msg = '``yafowil.widget.slider`` does not support display mode yet'
        self.assertEqual(str(err), msg)

    def test_reserved_data_attribute(self):
        # Render reserved data attribute, fails
        widget = factory(
            'slider',
            name='sliderfield',
            props={
                'data': {'min': 1}
            })
        err = self.expect_error(
            ValueError,
            widget
        )
        msg = "Additional data dict contains reserved attribute name 'min'"
        self.assertEqual(str(err), msg)


if __name__ == '__main__':
    unittest.main()                                          # pragma: no cover
