from yafowil.base import factory
from yafowil.utils import entry_point
import os
import webresource as wr


resources_dir = os.path.join(os.path.dirname(__file__), 'resources')


##############################################################################
# Default
##############################################################################

# webresource ################################################################

resources = wr.ResourceGroup(
    name='yafowil.widget.slider',
    directory=resources_dir,
    path='yafowil-slider'
)
resources.add(wr.ScriptResource(
    name='yafowil-slider-js',
    depends='jquery-js',
    resource='widget.js',
    compressed='widget.min.js'
))
resources.add(wr.StyleResource(
    name='yafowil-slider-css',
    resource='widget.css'
))

# B/C resources ##############################################################

js = [{
    'group': 'yafowil.widget.slider.common',
    'resource': 'widget.min.js',
    'order': 20,
}]
css = [{
    'group': 'yafowil.widget.slider.common',
    'resource': 'widget.css',
    'order': 20,
}]


##############################################################################
# Registration
##############################################################################

@entry_point(order=10)
def register():
    from yafowil.widget.slider import widget  # noqa

    widget_name = 'yafowil.widget.slider'

    # Default
    factory.register_theme(
        'default', widget_name, resources_dir,
        js=js, css=css
    )
    factory.register_resources('default', widget_name, resources)
