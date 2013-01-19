from yafowil.base import (
    factory,
    fetch_value,
    UNSET,
)
from yafowil.utils import (
    cssid,
    managedprops,
    attr_value,
    data_attrs_helper,
)


@managedprops('range')
def slider_extractor(widget, data):
    # extract range tuple
    if attr_value('range', widget, data) is True:
        lower_value_name = '%s.lower' % widget.dottedpath
        upper_value_name = '%s.upper' % widget.dottedpath
        lower_value = UNSET
        upper_value = UNSET
        if lower_value_name in data.request:
            lower_value = int(data.request[lower_value_name])
        if upper_value_name in data.request:
            upper_value = int(data.request[upper_value_name])
        return [lower_value, upper_value]
    # regular value extraction
    if widget.dottedpath in data.request:
        return int(data.request[widget.dottedpath])
    return UNSET


js_options = ['orientation', 'range', 'min', 'max', 'step', 'slide', 'change']

@managedprops(*['show_value', 'unit'] + js_options)
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
        }
        content += data.tag('input', **lower_input_attrs)
        upper_input_attrs = {
            'type': 'text',
            'name': '%s.upper' % widget.dottedpath,
            'id': cssid(widget, 'input-upper'),
            'style': 'display:none;',
            'class': 'upper_value',
        }
        content += data.tag('input', **upper_input_attrs)
    else:
        input_attrs = {
            'type': 'text',
            'name': widget.dottedpath,
            'id': cssid(widget, 'input-upper'),
            'style': 'display:none;',
            'class': 'upper_value',
        }
        content += data.tag('input', **input_attrs)
    show_value = attr_value('show_value', widget, data)
    if show_value:
        unit = attr_value('unit', widget, data)
        if unit:
            content += data.tag('span', unit, **{'class': 'unit'})
        if range is True:
            content += data.tag('span', value[0], **{'class': 'lower_value'})
            content += data.tag('span', value[1], **{'class': 'upper_value'})
        else:
            content += data.tag('span', value, **{'class': 'value'})
    content += data.tag('div', '&nbsp;', **{'class': 'slider'})
    wrapper_attrs = data_attrs_helper(widget, data, js_options)
    wrapper_attrs['class'] = cssclasses(widget,
                                        data,
                                        additional=['yafowil_slider'])
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
