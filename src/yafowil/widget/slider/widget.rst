Slider widget
=============

Load requirements::

    >>> import yafowil.loader
    >>> import yafowil.widget.slider

Test widget::

    >>> from yafowil.base import factory

Render no range::

    >>> widget = factory('slider', 'sliderfield')
    >>> pxml(widget())
    <div class="yafowil_slider">
      <input class="slider_value" id="input-sliderfield" name="sliderfield" style="display:none;" type="text" value=""/>
      <div class="slider"> </div>
    </div>
    <BLANKLINE>

Extract no range::

    >>> request = {'sliderfield': ''}
    >>> data = widget.extract(request)
    >>> data
    <RuntimeData sliderfield, value=<UNSET>, extracted=<UNSET> at ...>

    >>> request = {'sliderfield': '5'}
    >>> data = widget.extract(request)
    >>> data
    <RuntimeData sliderfield, value=<UNSET>, extracted=5 at ...>

Render no range, preset value::

    >>> widget = factory('slider', 'sliderfield', value=3)
    >>> pxml(widget())
    <div class="yafowil_slider">
      <input class="slider_value" id="input-sliderfield" name="sliderfield" style="display:none;" type="text" value="3"/>
      <div class="slider"> </div>
    </div>
    <BLANKLINE>

Extract no range, preset value::

    >>> request = {'sliderfield': ''}
    >>> data = widget.extract(request)
    >>> data
    <RuntimeData sliderfield, value=3, extracted=<UNSET> at ...>

    >>> request = {'sliderfield': '5'}
    >>> data = widget.extract(request)
    >>> data
    <RuntimeData sliderfield, value=3, extracted=5 at ...>

Render range::

    >>> widget = factory('slider', 'sliderfield', props={'range': True})
    >>> pxml(widget())
    <div class="yafowil_slider" data-range="true">
      <input class="lower_value" id="input-lower-sliderfield" name="sliderfield.lower" style="display:none;" type="text" value=""/>
      <input class="upper_value" id="input-upper-sliderfield" name="sliderfield.upper" style="display:none;" type="text" value=""/>
      <div class="slider"> </div>
    </div>
    <BLANKLINE>

Extract range::

    >>> request = {
    ...     'sliderfield.lower': '',
    ...     'sliderfield.upper': '',
    ... }
    >>> data = widget.extract(request)
    >>> data
    <RuntimeData sliderfield, value=<UNSET>, extracted=[<UNSET>, <UNSET>] at ...>

    >>> request = {
    ...     'sliderfield.lower': '4',
    ...     'sliderfield.upper': '6',
    ... }
    >>> data = widget.extract(request)
    >>> data
    <RuntimeData sliderfield, value=<UNSET>, extracted=[4, 6] at ...>

Render range, preset value::

    >>> widget = factory('slider', 'sliderfield', value=[2, 4], props={
    ...     'range': True})
    >>> pxml(widget())
    <div class="yafowil_slider" data-range="true">
      <input class="lower_value" id="input-lower-sliderfield" name="sliderfield.lower" style="display:none;" type="text" value="2"/>
      <input class="upper_value" id="input-upper-sliderfield" name="sliderfield.upper" style="display:none;" type="text" value="4"/>
      <div class="slider"> </div>
    </div>
    <BLANKLINE>

Extract range, preset value::

    >>> request = {
    ...     'sliderfield.lower': '',
    ...     'sliderfield.upper': '',
    ... }
    >>> data = widget.extract(request)
    >>> data
    <RuntimeData sliderfield, value=[2, 4], extracted=[<UNSET>, <UNSET>] at ...>

    >>> request = {
    ...     'sliderfield.lower': '4',
    ...     'sliderfield.upper': '6',
    ... }
    >>> data = widget.extract(request)
    >>> data
    <RuntimeData sliderfield, value=[2, 4], extracted=[4, 6] at ...>
