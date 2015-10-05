from node.utils import UNSET
from yafowil.base import factory
from yafowil.base import fetch_value
from yafowil.utils import attr_value
from yafowil.utils import cssclasses
from yafowil.utils import cssid
from yafowil.utils import data_attrs_helper
from yafowil.utils import managedprops


@managedprops('range')
def slider_extractor(widget, data):
    # extract range tuple
    if attr_value('range', widget, data) is True:
        lower_value_name = '%s.lower' % widget.dottedpath
        upper_value_name = '%s.upper' % widget.dottedpath
        lower_value = UNSET
        if lower_value_name in data.request:
            lower_value = data.request[lower_value_name]
            if lower_value:
                lower_value = int(lower_value)
            else:
                lower_value = UNSET
        upper_value = UNSET
        if upper_value_name in data.request:
            upper_value = data.request[upper_value_name]
            if upper_value:
                upper_value = int(upper_value)
            else:
                upper_value = UNSET
        return [lower_value, upper_value]
    # regular value extraction
    if widget.dottedpath in data.request:
        val = data.request[widget.dottedpath]
        if val:
            return int(val)
    return UNSET


js_options = ['orientation', 'range', 'min', 'max', 'step', 'slide', 'change']

@managedprops(*['show_value', 'unit', 'height', 'data'] + js_options)
def slider_edit_renderer(widget, data):
    value = fetch_value(widget, data)
    content = ''
    range = attr_value('range', widget, data)
    if range is True:
        lower_input_attrs = {
            'type': 'text',
            'name': '%s.lower' % widget.dottedpath,
            'id': cssid(widget, 'input-lower'),
            'style': 'display:none;',
            'class': 'lower_value',
            'value': value and value[0],
        }
        content += data.tag('input', **lower_input_attrs)
        upper_input_attrs = {
            'type': 'text',
            'name': '%s.upper' % widget.dottedpath,
            'id': cssid(widget, 'input-upper'),
            'style': 'display:none;',
            'class': 'upper_value',
            'value': value and value[1],
        }
        content += data.tag('input', **upper_input_attrs)
    else:
        input_attrs = {
            'type': 'text',
            'name': widget.dottedpath,
            'id': cssid(widget, 'input'),
            'style': 'display:none;',
            'class': 'slider_value',
            'value': value,
        }
        content += data.tag('input', **input_attrs)
    show_value = attr_value('show_value', widget, data)
    if show_value:
        unit = attr_value('unit', widget, data)
        if unit:
            content += data.tag('span', '%s: ' % unit, **{'class': 'unit'})
        if range is True:
            content += data.tag('span', value[0], **{'class': 'lower_value'})
            content += ' - '
            content += data.tag('span', value[1], **{'class': 'upper_value'})
        else:
            content += data.tag('span', value, **{'class': 'slider_value'})
    slider_attrs = {'class': 'slider'}
    if attr_value('orientation', widget, data) == 'vertical':
        height = attr_value('height', widget, data)
        if height:
            slider_attrs['style'] = 'height:%spx;' % height
    content += data.tag('div', ' ', **slider_attrs)
    wrapper_attrs = data_attrs_helper(widget, data, js_options)
    wrapper_attrs['class'] = cssclasses(widget, data)
    html_data = widget.attrs['data']
    data_keys = html_data.keys()
    for key in data_keys:
        if key in js_options:
            raise ValueError(u"Additional data dict contains reserved "
                             u"attribute name '%s'" % key)
        wrapper_attrs['data-%s' % key] = html_data[key]
    return data.tag('div', content, **wrapper_attrs)


def slider_display_renderer(widget, data):
    raise NotImplementedError(u"``yafowil.widget.slider`` does not support "
                              u"display mode yet")


factory.register(
    'slider',
    extractors=[slider_extractor],
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

factory.defaults['slider.orientation'] = None
factory.doc['props']['slider.orientation'] = \
"""Slider Orientation. Either ``horizontal`` or ``vertical``.
"""

factory.defaults['slider.height'] = None
factory.doc['props']['slider.height'] = \
"""Height of slider if orientation is ``vertical`` in pixel.
"""

factory.defaults['slider.range'] = None
factory.doc['props']['slider.range'] = \
"""Slider Range. Either ``True``, ``'min'`` or ``'max'``.
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

factory.defaults['slider.data'] = dict()
factory.doc['props']['slider.data'] = \
"""Additional data redered as HTML data attributes on slider wrapper
DOM Element.
"""
