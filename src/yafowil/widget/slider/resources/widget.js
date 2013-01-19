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
                    var options = widget.data();
                    if (options.range === true) {
                        var lower_value = $('input.lower_value', widget);
                        var upper_value = $('input.upper_value', widget);
                        options.values = [lower_value.val(), upper_value.val()];
                    } else {
                        var value = $('input.slider_value', widget);
                        options.value = value.val();
                    }
                    if (options.slide) {
                        var path = options.slide;
                        options.slide = yafowil.slider.lookup_callback(path);
                    } else {
                        options.slide = function(event, ui) {
                        };
                    }
                    if (options.change) {
                        var path = options.change;
                        options.change = yafowil.slider.lookup_callback(path);
                    } else {
                        options.change = function(event, ui) {
                        };
                    }
                    var slider_elem = $('div.slider', widget);
                    slider_elem.slider(options);
                });
            }
        }
    });

})(jQuery);
