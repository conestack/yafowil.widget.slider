from yafowil.base import factory


DOC_SLIDER = """
Slider
------

jQuery UI slider

.. code-block:: python

    slider = factory('#field:slider', value=100, props={
        'label': 'My Slider',
        'range': (0, 255)})
"""

def slider():
    form = factory('fieldset',
                   name='yafowil.widget.slider.slider')
    slider = form['slider'] = factory('#field:slider', value=100, props={
        'label': 'My Slider',
        'range': (0, 255)})
    return {'widget': form,
            'doc': DOC_SLIDER,
            'title': 'Slider'}


def get_example():
    return [
        slider(),
    ]
