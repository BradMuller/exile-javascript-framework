/**
 * Plugin que representa um input de dados via ajax.
 */
(function (window, $e, $, undefined) {

    var plugin = function (element, config) {

        this.element = $(element);
        this.config = {};
        $.extend(this.config, this.default_config, config);

        if (this.config.initEventHandlers) {
            this.initElementEventHandlers();
        }

    };

    plugin.prototype = {

        /**
         * Configurações padrão
         */
        default_config:{

            /**
             * URL para onde os dados devem ser enviados
             */
            submitUrl:null,

            /**
             * Limpa os dados do input ao submeter os dados
             */
            clearOnSubmit:true,

            /**
             * Põe foco no elemento ao submit
             */
            focusOnSubmit:true,

            /**
             * Configura os eventos do elemento dado
             */
            initEventHandlers:true,

            /**
             * Ignora dados em branco
             */
            ignoreEmptyData:true

        },

        element:null,

        /**
         * Eventos do input
         */
        ev:{
            // Algum dado foi enviado
            DATA_SENT:"DATA_SENT",
            DATA_SENT_RESPONSE:"DATA_SENT_RESPONSE"
        },

        /**
         * Envia os dados atuais do elemento
         */
        submit:function () {
            this.submitData(this.getElementData());
            if (this.config.clearOnSubmit) {
                this.clearElementData();
            }
            if (this.config.focusOnSubmit) {
                this.focusElement();
            }
        },

        /**
         * Envia os dados passados
         */
        submitData:function (data) {
            if (!data && this.config.ignoreEmptyData) {
                return;
            }
            var _this = this;
            $.post(this.config.submitUrl, this.getPOSTParams(data),
                function (response) {
                    _this.dispatchEvent(_this.ev.DATA_SENT_RESPONSE, {sentData:data, receivedData:response})
                }
            );
            _this.dispatchEvent(_this.ev.DATA_SENT, {sentData:data})
        },

        /**
         * Retorna os parâmetros a serem enviados no POST
         */
        getPOSTParams:function (data) {
            return "data=" + encodeURIComponent(data);
        },

        /**
         * Wrapper do elemento
         */

        /**
         * Configura os event handlers do elemento
         */
        initElementEventHandlers:function () {
            var _this = this;
            this.element.keyup(function (ev) {
                    if (ev.which == 13) {
                        _this.submit();
                    }
                }
            )
        },

        /**
         * Obtém os dados do elemento
         */
        getElementData:function () {
            return this.element.val();
        },

        /**
         * Limpa os dados do elemento
         */
        clearElementData:function () {
            this.element.val("");
        },

        /**
         * Limpa os dados do elemento
         */
        focusElement:function () {
            this.element.focus();
        }

    };

    $e.registerPlugin("AjaxTextInput", plugin)

})(window, window.Exile, window.jQuery);