/*
 * yafowil slider widget
 *
 * Requires: jquery.ui.slider
 * Optional: bdajax
 */

if (typeof(window.yafowil) == "undefined") yafowil = {};

(function($) {

    $(document).ready(function() {
        // initial binding
        yafowil.slider.binder();

        // add after ajax binding if bdajax present
        if (typeof(window.bdajax) != "undefined") {
            $.extend(bdajax.binders, {
                yafowil_slider_binder: yafowil.slider.binder
            });
        }
    });

    $.extend(yafowil, {

        slider: {

            lookup_callback: function(path) {
                source = path.split('.');
                var cb = window;
                var name;
                for (var idx in source) {
                    name = source[idx];
                    if (typeof(cb[name]) == "undefined") {
                        throw "'" + name + "' not found.";
                    }
                    cb = cb[name];
                }
                return cb;
            },

            callback: function(event, ui) {
                var widget = $(event.target).parents('.yafowil_slider');
                var options = widget.data();
                var elements = widget.data('slider_elements');
                if (options.range === true) {
                    elements.lower_value.attr('value', ui.values[0]);
                    elements.upper_value.attr('value', ui.values[1]);
                    elements.lower_display.html(ui.values[0]);
                    elements.upper_display.html(ui.values[1]);
                } else {
                    elements.value.attr('value', ui.value);
                    elements.display.html(ui.value);
                }
            },

            binder: function(context) {
                var sliders = $('.yafowil_slider', context);
                sliders.each(function() {
                    var widget = $(this);
                    var input = $('input.slider_value', widget);
                    var slider_elem = $('div.slider', widget);
                    var options = widget.data();
                    var elements = {};
                    widget.data('slider_elements', elements);
                    if (options.range === true) {
                        elements.lower_display = $('span.lower_value', widget);
                        elements.upper_display = $('span.upper_value', widget);
                        elements.lower_value = $('input.lower_value', widget);
                        elements.upper_value = $('input.upper_value', widget);
                        options.values = [elements.lower_value.val(),
                                          elements.upper_value.val()];
                    } else {
                        elements.display = $('span.slider_value', widget);
                        elements.value = $('input.slider_value', widget);
                        options.value = elements.value.val();
                    }
                    if (options.slide) {
                        var path = options.slide;
                        options.slide = yafowil.slider.lookup_callback(path);
                    } else {
                        options.slide = yafowil.slider.callback;
                    }
                    if (options.change) {
                        var path = options.change;
                        options.change = yafowil.slider.lookup_callback(path);
                    } else {
                        options.change = yafowil.slider.callback;
                    }
                    slider_elem.slider(options);
                });
            }
        }
    });

})(jQuery);
