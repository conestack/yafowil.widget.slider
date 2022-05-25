from yafowil.base import factory
from yafowil.utils import entry_point
import os
import webresource as wr


resources_dir = os.path.join(os.path.dirname(__file__), 'resources')


##############################################################################
# Default
##############################################################################

# webresource ################################################################

scripts = wr.ResourceGroup(
    name='yafowil-slider-scripts',
    path='yafowil.widget.slider'
)
scripts.add(wr.ScriptResource(
    name='yafowil-slider-js',
    depends='jquery-js',
    directory=resources_dir,
    resource='widget.js',
    compressed='widget.min.js'
))

styles = wr.ResourceGroup(
    name='yafowil-slider-styles',
    path='yafowil.widget.slider'
)
styles.add(wr.StyleResource(
    name='yafowil-slider-css',
    directory=resources_dir,
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

    # Default
    factory.register_theme(
        'default', 'yafowil.widget.slider', resources_dir,
        js=js, css=css
    )
    factory.register_scripts('default', 'yafowil.widget.slider', scripts)
    factory.register_styles('default', 'yafowil.widget.slider', styles)
