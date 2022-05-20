import $ from 'jquery';

import {SliderWidget} from './widget.js';

export * from './widget.js';

$(function() {
    if (window.ts !== undefined) {
        ts.ajax.register(SliderWidget.initialize, true);
    } else if (window.bdajax !== undefined) {
        bdajax.register(SliderWidget.initialize, true);
    } else {
        SliderWidget.initialize();
    }
});