from yafowil.base import factory
from yafowil.utils import entry_point
import os


resourcedir = os.path.join(os.path.dirname(__file__), 'resources')

js = [{
    'group': 'yafowil.widget.slider.common',
    'resource': 'widget.min.js',
    'order': 20,
}]

default_css = [{
    'group': 'yafowil.widget.slider.common',
    'resource': 'widget.css',
    'order': 20,
}]


@entry_point(order=10)
def register():
    from yafowil.widget.slider import widget  # noqa
    factory.register_theme(
        themename='default',
        widgetname='yafowil.widget.slider',
        resourcedir=resourcedir,
        js=js,
        css=default_css
    )
