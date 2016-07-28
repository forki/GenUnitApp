/**
 * @module views/templates/bottomBar
 */

/*global webix, $$ */

(function () {
    "use strict";

    /**
     * Create the view
     * @param app {app} provides the app functionality
     * @returns {view} Returns the view
     */
    exports.view = function (app) {
        //noinspection JSUnresolvedFunction
        var debug = app.debug('client:views:templates:bottomBar');
        var id = 'bottom_bar_template';
        var view = { template: '</>', id: id, height: 30, html: '' };

        debug('view');
        //noinspection JSValidateTypes
        return view;
    };

    /**
     * Initializes the view
     * Uses the webix $$ to get the view
     * @param app {app} provides the app functionality
     */
    exports.init = function (app) {
        //noinspection JSUnresolvedFunction
        var debug = app.debug('client:views:templates:bottomBar');
        var view = $$('bottom_bar_template');

        debug('init');

        webix.event(view.$view, 'click', function () {
            app.bus.view.publish('bottomBar.click', {
                text: view.html
            });
        });

        //noinspection JSUnresolvedVariable
        app.bus.controller.subscribe('*.err', function (data /*, envelope */) {
            //noinspection JSUnresolvedFunction
            debug('result', data.result);
            $$('bottom_bar_template').html = data.err;
            $$('bottom_bar_template').setHTML(data.err);
        });

    };


})();