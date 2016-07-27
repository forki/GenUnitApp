/**
 * @module views/ui
 */

/*global webix */

(function () {
    "use strict";


    /**
     * Initialize ui with app.
     * app provides: </br>
     * </br>
     * - debug function</br>
     * - bus object</br>
     *</br>
     * expects: require function and webix lib
     * @param app {app} - Provides app functionality
     */
    exports.init = function (app) {
        var convert = require('./forms/convert.js');
        var expression = require('./forms/expression.js');
        var result = require('./lists/result.js');
        var debug = app.debug('views:ui');

        debug('init');

        webix.ui({
            rows: [
                { type: 'header', template: 'GenUnitApp' },
                { cols: [
                    {rows: [
                        expression.view(app),
                        convert.view(app)
                    ]},
                    result.view(app)
                ]}
            ]
        });

        convert.init(app);
        expression.init(app);
        result.init(app);

        app.bus.view.publish('ui.init');
    };

})();