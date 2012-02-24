/**
 * Controla um servidor de eventos.
 *
 */
(function (window, $e, $, undefined) {

    $e.requirePlugin("Timer");

    var plugin = function (config) {

        this.config = {};
        $.extend(this.config, this.default_config, config);

        if (!this.config.serverUrl) {
            this.e("A server event URL must be defined.");
        }

        var _this = this;
        this.subscribed_observers = {};

        this.updateTimer = new $ep.Timer({
            timeout:this.config.updateTimeout,
            autoStart:this.config.updateAutoStart
        });
        this.updateTimer.addEventListener(this.updateTimer.ev.TIMEOUT, function(){
            _this.update()
        })

    };

    plugin.prototype = {

        /**
         * Configurações padrão
         */
        default_config:{
            // Caminho para o servidor de eventos
            serverUrl:null,
            // Timeout para atualizar o estado dos eventos
            updateTimeout:null,
            // Indica se o update deve começar automaticamente
            updateAutoStart:true,
            // Método de comunicação com o servidor
            httpMethod:'post'
        },

        /**
         * Eventos
         */
        ev:{
            EVENTS_FETCHED:"EVENTS_FETCHED",
            EVENT_SUBSCRIBED:"EVENT_SUBSCRIBED",
            EVENT_UNSUBSCRIBED:"EVENT_UNSUBSCRIBED",
            EVENT_FIRED:"EVENT_FIRED"
        },

        /**
         * Eventos observados
         *  .state - define o estado atual do observador
         *  .callback - define o procedimento que controla eventos recebidos
         */
        subscribed_observers:null,

        /**
         * Timer controlando o update periódico
         */
        updateTimer:null,

        /**
         * Adiciona um observador de evento
         */
        subscribe:function (name, state, callback) {
            this.subscribed_observers[name] = {state:state, callback:callback};
            this.dispatchEvent(this.ev.EVENT_SUBSCRIBED, {name:name, observer:this.subscribed_observers[name] })
        },

        /**
         * Remove o observador de evento
         */
        unsubscribe:function (name) {
            var observer = this.subscribed_observers[name];
            delete this.subscribed_observers[name];
            this.dispatchEvent(this.ev.EVENT_UNSUBSCRIBED, {name:name, observer:observer})
        },

        /**
         * Indica se o observador está declarado
         */
        isObserved: function(name){
            return this.subscribed_observers[name] != undefined;
        },

        /**
         * Sincroniza com o servidor
         */
        update:function () {
            this.fetchEvents();
        },

        /**
         * Atualiza o estado dos eventos
         */
        fetchEvents:function () {
            var data = this.getObserversStateData();
            if (!data){
                return;
            }
            var _this = this;
            this.ajax({
                url:this.config.serverUrl,
                dataType:'json',
                type:'get',
                data:data,
                success:function (response) {
                    _this.dispatchEvent(_this.ev.EVENTS_FETCHED, {response:response});
                    _this.handleServerResponse(response);
                }
            })
        },

        /**
         * Trata a resposta do servidor de eventos
         */
        handleServerResponse:function (response) {
            if (response instanceof Object) {
                for (var name in this.subscribed_observers) {
                    if (response[name] != undefined && this.subscribed_observers[name].callback instanceof Function) {
                        this.subscribed_observers[name].callback(response[name]);
                    }
                }
            }
        },

        /**
         * Retorna os estados de todos os observadores
         */
        getObserversStateData:function () {
            var data = '';
            for (var name in this.subscribed_observers) {
                data = name + "=" + encodeURIComponent(this.getObserverStateData(name)) + "&";
            }
            return data;
        },

        /**
         * Retorna o estado, em texto, de um observador
         */
        getObserverStateData:function (name) {
            var observer = this.subscribed_observers[name];
            var state = observer.state;
            if (!state) {
                return "";
            }
            if (state instanceof Function) {
                return state();
            }
            if (state instanceof Object) {
                var data = '';
                for (var key in state) {
                    data = key + "=" + encodeURIComponent(state[key]) + "&";
                }
                return data;
            }
            return null;
        }

    };

    $e.registerPlugin("EventServer", plugin)

}
    )(window, window.Exile, window.jQuery);