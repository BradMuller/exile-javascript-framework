/**
 * Eventos controlados pelo tempo.
 *
 */
(function (window, $e, $, undefined) {

    var plugin = function (config) {

        this.config = {};
        $.extend(this.config, this.default_config, config);

        this.setTimeout(this.config.timeout);
        if (this.config.autoStart) {
            this.start();
        }

    };

    plugin.prototype = {

        /**
         * Configurações padrão
         */
        default_config:{
            // Período de loop do timer, padrão
            timeout:null,
            // Início automático do timer
            autoStart:true
        },

        /**
         * Eventos do timer
         */
        ev:{
            START:"START",
            STOP:"STOP",
            TIMEOUT:"TIMEOUT"
        },

        /**
         * Timeout atual
         */
        timeout:null,

        /**
         * Indica se o timer está ativo
         */
        activeTimeout:null,
        isActive:function () {
            return this.activeTimeout != null
        },

        /**
         * Configura um novo timeout
         */
        setTimeout:function (ms) {
            if (isNaN(ms)) {
                this.e("Invalid timer timeout.");
            }
            this.timeout = ms;
        },

        /**
         * Retorna o timeout
         */
        getTimeout:function () {
            return this.timeout;
        },

        /**
         * Inicia o timer
         */
        start:function () {
            if (this.isActive() || !this.getTimeout()) {
                return;
            }
            this.dispatchEvent(this.ev.START);
            var _this = this;
            var callback = function () {
                if (!_this.isActive()) {
                    return;
                }
                _this.dispatchEvent(_this.ev.TIMEOUT);
                _this.activeTimeout = window.setTimeout(arguments.callee, _this.getTimeout())
            };
            this.activeTimeout = window.setTimeout(callback, this.getTimeout());
        },

        /**
         * Para o timer
         */
        stop:function () {
            if (!this.isActive()) {
                return;
            }
            window.clearTimeout(this.activeTimeout);
            this.activeTimeout = null;
            this.dispatchEvent(this.ev.STOP)
        }

    };

    $e.registerPlugin("Timer", plugin)

})(window, window.Exile, window.jQuery);