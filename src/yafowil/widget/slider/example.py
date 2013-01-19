from yafowil.base import factory


DOC_DEFAULT_SLIDER = """
Default Slider
--------------

jQuery UI slider. Default behavior.

.. code-block:: python

    slider = factory('#field:slider', value=20, props={
        'label': 'Default Slider'})
"""

def default_slider():
    form = factory('fieldset',
                   name='yafowil.widget.slider.slider')
    slider = form['slider'] = factory('#field:slider', value=20, props={
        'label': 'Default Slider'})
    return {'widget': form,
            'doc': DOC_DEFAULT_SLIDER,
            'title': 'Default Slider'}


def get_example():
    return [
        default_slider(),
    ]
