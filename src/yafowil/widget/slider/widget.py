from yafowil.base import (
    factory,
    fetch_value,
)
from yafowil.common import (
    generic_extractor,
    generic_required_extractor,
)
from yafowil.utils import (
    cssid,
    managedprops,
    attr_value,
)


@managedprops('range')
def slider_extractor(widget, data):
    val = data.extracted
    if val is UNSET or val == '':
        return val
    if attr_value('range', widget, data) is True:
        # extract second value for range tuple
        pass
    return val


@managedprops('show_value', 'unit', 'orientation', 'range',
              'min', 'max', 'step', 'slide', 'change')
def slider_edit_renderer(widget, data):
    value = fetch_value(widget, data)
    if not value:
        value = ''


def slider_display_renderer(widget, data):
    raise NotImplementedError(u"``yafowil.widget.slider`` does not support "
                              u"display mode yet")


factory.register(
    'slider',
    extractors=[generic_extractor,
                generic_required_extractor,
                slider_extractor],
    edit_renderers=[slider_edit_renderer],
    display_renderers=[slider_display_renderer])

factory.doc['blueprint']['slider'] = \
"""Add-on blueprint `yafowil.widget.slider
<http://github.com/bluedynamics/yafowil.widget.slider/>`_ .
"""

factory.defaults['slider.default'] = ''

factory.defaults['slider.class'] = 'yafowil_slider'

factory.defaults['slider.show_value'] = False
factory.doc['props']['slider.show_value'] = \
"""Show value in addition to slider.
"""

factory.defaults['slider.unit'] = ''
factory.doc['props']['slider.unit'] = \
"""Slider value unit.
"""

factory.defaults['slider.orientation'] = 'horizontal'
factory.doc['props']['slider.orientation'] = \
"""Slider Orientation. Either ``horizontal`` or ``vertical``.
"""

factory.defaults['slider.range'] = False
factory.doc['props']['slider.range'] = \
"""Slider Range. Either ``True``, ``False``, ``'min'`` or ``'max'``.
"""

factory.defaults['slider.min'] = None
factory.doc['props']['slider.min'] = \
"""Minimum slider value. Defaults to 0.
"""

factory.defaults['slider.max'] = None
factory.doc['props']['slider.max'] = \
"""Maximum slider value value. Defaults to 100.
"""

factory.defaults['slider.step'] = None
factory.doc['props']['slider.step'] = \
"""Snap slider to increments.
"""

factory.defaults['slider.slide'] = None
factory.doc['props']['slider.slide'] = \
"""Optional Javascript ``slide`` callback as string.
"""

factory.defaults['slider.change'] = None
factory.doc['props']['slider.change'] = \
"""Optional Javascript ``change`` callback as string.
"""
