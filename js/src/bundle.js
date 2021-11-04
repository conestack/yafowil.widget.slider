import $ from 'jquery';

import {Slider} from './widget.js';

export * from './widget.js';

$(function() {
    if (window.ts !== undefined) {
        ts.ajax.register(Slider.initialize, true);
    } else {
        Slider.initialize();
    }
});