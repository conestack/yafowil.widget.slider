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

            binder: function(context) {
                $('.yafowil_slider').each(function() {
                    var widget = $(this);
                    var input = $('input.slider_value', widget);
                    var slider_elem = $('div.slider', widget);
                    var options = widget.data();
                    var value, lower_value, upper_value;
                    if (options.range === true) {
                        lower_value = $('input.lower_value', widget);
                        upper_value = $('input.upper_value', widget);
                        options.values = [lower_value.val(), upper_value.val()];
                    } else {
                        value = $('input.slider_value', widget);
                        options.value = value.val();
                    }
                    var callback = function(event, ui) {
                        if (options.range === true) {
                            lower_value.attr('value', ui.values[0]);
                            upper_value.attr('value', ui.values[1]);
                            $('span.lower_value', widget).html(ui.values[0]);
                            $('span.upper_value', widget).html(ui.values[1]);
                        } else {
                            value.attr('value', ui.value);
                            $('span.slider_value', widget).html(ui.value);
                        }
                    };
                    if (options.slide) {
                        var path = options.slide;
                        options.slide = yafowil.slider.lookup_callback(path);
                    } else {
                        options.slide = callback;
                    }
                    if (options.change) {
                        var path = options.change;
                        options.change = yafowil.slider.lookup_callback(path);
                    } else {
                        options.change = callback;
                    }
                    slider_elem.slider(options);
                });
            }
        }
    });

})(jQuery);
