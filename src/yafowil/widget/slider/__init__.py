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
    resource='default/widget.js',
    compressed='default/widget.min.js'
))
resources.add(wr.StyleResource(
    name='yafowil-slider-css',
    resource='default/widget.css'
))

# B/C resources ##############################################################

js = [{
    'group': 'yafowil.widget.slider.common',
    'resource': 'default/widget.min.js',
    'order': 20,
}]
css = [{
    'group': 'yafowil.widget.slider.common',
    'resource': 'default/widget.css',
    'order': 20,
}]

##############################################################################
# Bootstrap 5
##############################################################################

# webresource ################################################################

bootstrap5_resources = wr.ResourceGroup(
    name='yafowil.widget.slider',
    directory=resources_dir,
    path='yafowil-slider'
)
bootstrap5_resources.add(wr.ScriptResource(
    name='yafowil-slider-js',
    depends='jquery-js',
    resource='default/widget.js',
    compressed='default/widget.min.js'
))
bootstrap5_resources.add(wr.StyleResource(
    name='yafowil-slider-css',
    resource='bootstrap5/widget.css'
))

# B/C resources ##############################################################

bootstrap5_css = [{
    'group': 'yafowil.widget.slider.common',
    'resource': 'bootstrap5/widget.css',
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

    # Bootstrap 5
    factory.register_theme(
        ['bootstrap5'],
        widget_name,
        resources_dir,
        js=js,
        css=bootstrap5_css
    )

    factory.register_resources(
        ['bootstrap5'],
        widget_name,
        bootstrap5_resources
    )
