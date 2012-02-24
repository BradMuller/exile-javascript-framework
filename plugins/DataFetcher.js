/**
 * Plugin para buscar dados no servidor
 *
 */
(function (window, $e, $, undefined) {

    var plugin = function (config) {

        this.setupConfig(config);

    };

    plugin.prototype = {

        /**
         * Configurações da instância
         */
        config:null,

        /**
         * Configurações padrão
         */
        default_config:{
            // Url onde buscar os dados
            url: null,
            // Função que controla os parâmetros
            parameters: null,
            // Indica se pedidos podem ser efetuados simultaneamente
            concurrentFetch: false
        },

        /**
         * Eventos do timer
         */
        ev:{
            DATA_FETCHED:"DATA_FETCHED"
        },

        /**
         * Retorna os parâmetros a serem usados no pedido
         */
        getParameters: function(){
            if (this.config.parameters instanceof Function){
                return this.config.parameters.apply(this);
            }
            return this.config.parameters;
        },

        /**
         * Busca dados no servidor
         */
        fetch: function(config){
            var _this = this;
            // Não devemos carregar dados mais ou ainda!
            if ((this.isLoading('fetch') && !this.config.concurrentFetch)) {
                return;
            }
            var url = config && config.url ? config.url : this.config.url;
            var parameters = config && config.parameters ? config.parameters : this.getParameters();
            this.json(url, parameters, function (response) {
                _this.dispatchEvent(_this.ev.DATA_FETCHED, {response:response, parameters:parameters});
            }, 'fetch')
        },

        /**
         * Aborta os pedidos ativos
         */
        abort:function(){
            this.abortActiveJSONRequests('fetch');
        }

    };

    $e.registerPlugin("DataFetcher", plugin)

})(window, window.Exile, window.jQuery);