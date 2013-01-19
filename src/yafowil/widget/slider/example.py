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
                   name='yafowil.widget.slider.default')
    slider = form['slider'] = factory('#field:slider', value=20, props={
        'label': 'Default Slider'})
    return {'widget': form,
            'doc': DOC_DEFAULT_SLIDER,
            'title': 'Default Slider'}


DOC_FIXED_MIN_RANGE_SLIDER = """
Range with fixed minimum
------------------------

Fix the minimum value of the range slider so that the user can only select a
maximum. Set the ``range`` option to ``'min'``.

.. code-block:: python

    slider = factory('#field:slider', value=37, props={
        'label': 'Range with fixed minimum',
        'range': 'min',
        'min': 1,
        'max': 200,
        'show_value': True,
        'unit': 'Pieces'})
"""

def fixed_minimum_range():
    form = factory('fieldset',
                   name='yafowil.widget.slider.fixed_minimum_range')
    slider = form['slider'] = factory('#field:slider', value=37, props={
        'label': 'Range with fixed minimum',
        'range': 'min',
        'min': 1,
        'max': 200,
        'show_value': True,
        'unit': 'Pieces'})
    return {'widget': form,
            'doc': DOC_FIXED_MIN_RANGE_SLIDER,
            'title': 'Default Slider'}


def get_example():
    return [
        default_slider(),
        fixed_minimum_range(),
    ]
