from yafowil.base import factory
from yafowil.utils import entry_point
import os


resourcedir = os.path.join(os.path.dirname(__file__), 'resources')
js = [{
    'group': 'yafowil.widget.slider.dependencies',
    'resource': 'jquery.ui.slider.min.js',
    'order': 20,
}, {
    'group': 'yafowil.widget.slider.common',
    'resource': 'widget.js',
    'order': 21,
}]
default_css = [{
    'group': 'yafowil.widget.slider.dependencies',
    'resource': 'jquery.ui.slider.css',
    'order': 20,
}, {
    'group': 'yafowil.widget.slider.common',
    'resource': 'widget.css',
    'order': 21,
}]
bootstrap_css = [{
    'group': 'yafowil.widget.slider.dependencies',
    'resource': 'jquery.ui.slider.bootstrap.css',
    'order': 20,
}, {
    'group': 'yafowil.widget.slider.common',
    'resource': 'widget.css',
    'order': 21,
}]
plone5_css = [{
    'group': 'yafowil.widget.slider.dependencies',
    'resource': 'jquery.ui.slider.plone5.css',
    'order': 20,
}, {
    'group': 'yafowil.widget.slider.common',
    'resource': 'widget.css',
    'order': 21,
}]


@entry_point(order=10)
def register():
    import widget
    factory.register_theme('default', 'yafowil.widget.slider',
                           resourcedir, js=js, css=default_css)
    factory.register_theme('bootstrap', 'yafowil.widget.slider',
                           resourcedir, js=js, css=bootstrap_css)
    factory.register_theme('plone5', 'yafowil.widget.slider',
                           resourcedir, js=js, css=plone5_css)
