from yafowil.base import factory


DOC_DEFAULT_SLIDER = """
Default slider
--------------

.. code-block:: python

    slider = factory('#field:slider', value=20, props={
        'label': 'Default Slider',
    })
"""


def default_slider():
    form = factory(
        'fieldset',
        name='yafowil.widget.slider.default'
    )
    form['slider'] = factory(
        '#field:slider',
        value=20,
        props={
            'label': 'Default Slider',
        }
    )
    return {
        'widget': form,
        'doc': DOC_DEFAULT_SLIDER,
        'title': 'Default slider',
    }


DOC_FIXED_MIN_RANGE_SLIDER = """
Range with fixed minimum
------------------------

Fix the minimum value of the range slider so that the user can only select a
maximum. Set the ``range`` option to ``'min'``.

.. code-block:: python

    slider = factory('#field:slider', value=50, props={
        'label': 'Range with fixed minimum',
        'range': 'min',
        'min': 50,
        'max': 200,
        'show_value': True,
        'unit': 'Pieces',
    })
"""


def fixed_minimum_range():
    form = factory(
        'fieldset',
        name='yafowil.widget.slider.fixed_minimum_range'
    )
    form['slider'] = factory(
        '#field:slider',
        value=50,
        props={
            'label': 'Range with fixed minimum',
            'range': 'min',
            'min': 50,
            'max': 200,
            'show_value': True,
            'unit': 'Pieces',
        }
    )
    return {
        'widget': form,
        'doc': DOC_FIXED_MIN_RANGE_SLIDER,
        'title': 'Fixed minimum',
    }


DOC_FIXED_MAX_RANGE_SLIDER = """
Range with fixed maximum
------------------------

Fix the maximum value of the range slider so that the user can only select a
minimum. Set the ``range`` option to ``'max'``.

.. code-block:: python

    slider = factory('#field:slider', value=2, props={
        'label': 'Range with fixed maximum',
        'range': 'max',
        'min': 1,
        'max': 10,
        'show_value': True,
        'unit': 'Minimum number',
    })
"""


def fixed_maximum_range():
    form = factory(
        'fieldset',
        name='yafowil.widget.slider.fixed_maximum_range'
    )
    form['slider'] = factory(
        '#field:slider',
        value=2,
        props={
            'label': 'Range with fixed maximum',
            'range': 'max',
            'min': 1,
            'max': 10,
            'show_value': True,
            'unit': 'Minimum number',
        }
    )
    return {
        'widget': form,
        'doc': DOC_FIXED_MAX_RANGE_SLIDER,
        'title': 'Fixed maximum',
    }


DOC_RANGE_SLIDER = """
Range slider
------------

Set the range option to True to capture a range of values with two drag
handles. The space between the handles is filled with a different background
color to indicate those values are selected.

.. code-block:: python

    slider = factory('#field:slider', value=[75, 300], props={
        'label': 'Range slider',
        'range': True,
        'min': 0,
        'max': 500,
        'show_value': True,
        'unit': 'Price range (EUR)',
    })
"""


def range_slider():
    form = factory(
        'fieldset',
        name='yafowil.widget.slider.range'
    )
    form['slider'] = factory(
        '#field:slider',
        value=[75, 300],
        props={
            'label': 'Range slider',
            'range': True,
            'min': 0,
            'max': 500,
            'show_value': True,
            'unit': 'Price range (EUR)',
        }
    )
    return {
        'widget': form,
        'doc': DOC_RANGE_SLIDER,
        'title': 'Range slider',
    }


DOC_STEP_SLIDER = """
Step slider
-----------

Increment slider values with the step option set to an integer, commonly a
dividend of the slider's maximum value. The default increment is '1'.

.. code-block:: python

    slider = factory('#field:slider', value=100, props={
        'label': 'Step slider',
        'min': 0,
        'max': 500,
        'step': 50,
        'show_value': True,
        'unit': 'Donation (50 EUR increments)',
    })
"""


def step_slider():
    form = factory(
        'fieldset',
        name='yafowil.widget.slider.step'
    )
    form['slider'] = factory(
        '#field:slider',
        value=100,
        props={
            'label': 'Step slider',
            'min': 0,
            'max': 500,
            'step': 50,
            'show_value': True,
            'unit': 'Donation (50 EUR increments)',
        }
    )
    return {
        'widget': form,
        'doc': DOC_STEP_SLIDER,
        'title': 'Step slider',
    }


DOC_VERTICAL_SLIDER = """
Vertical slider
---------------

Change the orientation of the slider to vertical. Assign a height value via
``height`` or by setting the height through CSS, and set the ``orientation``
option to ``vertical``.

.. code-block:: python

    slider = factory('#field:slider', value=50, props={
        'label': 'Vertical slider',
        'orientation': 'vertical',
        'height': 200,
        'show_value': True,
        'unit': 'mmHg',
    })
"""


def vertical_slider():
    form = factory(
        'fieldset',
        name='yafowil.widget.slider.vertical'
    )
    form['slider'] = factory(
        '#field:slider',
        value=50,
        props={
            'label': 'Vertical slider',
            'orientation': 'vertical',
            'height': 200,
            'show_value': True,
            'unit': 'mmHg',
        }
    )
    return {
        'widget': form,
        'doc': DOC_VERTICAL_SLIDER,
        'title': 'Vertical slider',
    }


DOC_VERTICAL_FIXED_MIN_RANGE_SLIDER = """
Vertical range with fixed minimum
---------------------------------

.. code-block:: python

    slider = factory('#field:slider', value=50, props={
        'label': 'Vertical range with fixed minimum',
        'orientation': 'vertical',
        'height': 200,
        'range': 'min',
        'min': 50,
        'max': 200,
        'show_value': True,
        'unit': 'Pieces',
    })
"""


def vertical_fixed_minimum_range():
    form = factory(
        'fieldset',
        name='yafowil.widget.slider.fixed_minimum_range'
    )
    form['slider'] = factory(
        '#field:slider',
        value=50,
        props={
            'label': 'Vertical range with fixed minimum',
            'orientation': 'vertical',
            'height': 200,
            'range': 'min',
            'min': 50,
            'max': 200,
            'show_value': True,
            'unit': 'Pieces',
        }
    )
    return {
        'widget': form,
        'doc': DOC_VERTICAL_FIXED_MIN_RANGE_SLIDER,
        'title': 'Vertical fixed minimum',
    }


DOC_VERTICAL_FIXED_MAX_RANGE_SLIDER = """
Vertical range with fixed maximum
---------------------------------

.. code-block:: python

    slider = factory('#field:slider', value=2, props={
        'label': 'Vertical range with fixed maximum',
        'orientation': 'vertical',
        'height': 200,
        'range': 'max',
        'min': 1,
        'max': 10,
        'show_value': True,
        'unit': 'Minimum number',
    })
"""


def vertical_fixed_maximum_range():
    form = factory(
        'fieldset',
        name='yafowil.widget.slider.fixed_maximum_range'
    )
    form['slider'] = factory(
        '#field:slider',
        value=2,
        props={
            'label': 'Vertical range with fixed maximum',
            'orientation': 'vertical',
            'height': 200,
            'range': 'max',
            'min': 1,
            'max': 10,
            'show_value': True,
            'unit': 'Minimum number',
        }
    )
    return {
        'widget': form,
        'doc': DOC_VERTICAL_FIXED_MAX_RANGE_SLIDER,
        'title': 'Vertical fixed maximum',
    }


DOC_VERTICAL_RANGE_SLIDER = """
Vertical range slider
---------------------

.. code-block:: python

    slider = factory('#field:slider', value=[75, 300], props={
        'label': 'Vertical range slider',
        'orientation': 'vertical',
        'height': 200,
        'range': True,
        'min': 0,
        'max': 500,
        'show_value': True,
        'unit': 'Price range (EUR)',
    })
"""


def vertical_range_slider():
    form = factory(
        'fieldset',
        name='yafowil.widget.slider.range'
    )
    form['slider'] = factory(
        '#field:slider',
        value=[75, 300],
        props={
            'label': 'Vertical range slider',
            'orientation': 'vertical',
            'height': 200,
            'range': True,
            'min': 0,
            'max': 500,
            'show_value': True,
            'unit': 'Price range (EUR)',
        }
    )
    return {
        'widget': form,
        'doc': DOC_VERTICAL_RANGE_SLIDER,
        'title': 'Vertical range slider',
    }


def get_example():
    return [
        default_slider(),
        fixed_minimum_range(),
        fixed_maximum_range(),
        range_slider(),
        step_slider(),
        vertical_slider(),
        vertical_fixed_minimum_range(),
        vertical_fixed_maximum_range(),
        vertical_range_slider()
    ]
