import $ from 'jquery';
import { register_array_subscribers, SliderWidget } from './widget.js';

export * from './widget.js';

$(() => {
    if (window.ts !== undefined) {
        ts.ajax.register(SliderWidget.initialize, true);
    } else if (window.bdajax !== undefined) {
        bdajax.register(SliderWidget.initialize, true);
    } else {
        SliderWidget.initialize();
    }
    register_array_subscribers();
});
