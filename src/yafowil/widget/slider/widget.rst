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
