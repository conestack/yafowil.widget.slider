import $ from 'jquery';

QUnit.module('bundle', (hooks) => {
    let ready_callback, bundle;

    hooks.before(async () => {
        // capture DOM ready callback registered by the bundle
        const orig_ready = $.fn.ready;
        $.fn.ready = function (fn) {
            ready_callback = fn;
            return this;
        };
        try {
            bundle = await import('../src/default/bundle.js');
        } finally {
            $.fn.ready = orig_ready;
        }
    });

    hooks.afterEach(() => {
        delete window.ts;
        delete window.bdajax;
        window.yafowil_array = undefined;
    });

    QUnit.test('exports', (assert) => {
        assert.deepEqual(Object.keys(bundle).sort(), [
            'Slider',
            'SliderHandle',
            'SliderWidget',
            'lookup_callback',
            'register_array_subscribers',
        ]);
    });

    QUnit.test('DOM ready registration', (assert) => {
        const SliderWidget = bundle.SliderWidget;
        let registered = [];
        const register = (callback, instant) => {
            registered.push([callback, instant]);
        };

        window.ts = { ajax: { register } };
        ready_callback();
        assert.deepEqual(registered, [[SliderWidget.initialize, true]]);
        delete window.ts;

        registered = [];
        window.bdajax = { register };
        ready_callback();
        assert.deepEqual(registered, [[SliderWidget.initialize, true]]);
        delete window.bdajax;

        const orig_initialize = SliderWidget.initialize;
        const initialized = [];
        SliderWidget.initialize = (...args) => {
            initialized.push(args);
        };
        const subscribers = {};
        window.yafowil_array = {
            on_array_event: (evt_name, evt_function) => {
                subscribers[evt_name] = evt_function;
            },
        };
        try {
            ready_callback();
        } finally {
            SliderWidget.initialize = orig_initialize;
        }
        assert.deepEqual(initialized, [[]]);
        assert.deepEqual(Object.keys(subscribers), ['on_add']);
    });
});
