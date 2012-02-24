/**
 * Controla um elemento na forma de um dropdown
 *
 */
(function (window, $e, $, undefined) {

    /**
     *
     * @param element Elemento a ser exibido no dropdown
     * @param button Botão que controla o dropdown
     * @param config Configurações do plugin
     */
    var plugin = function (element, button, config) {

        this.config = {};
        $.extend(this.config, this.default_config, config);

        this.element = $(element);
        this.button = $(button);

        var _this = this;

        /**
         * Configura os handlers
         */
        this.button.click(function (ev) {
            if (_this.isVisible()) {
                _this.hide();
            } else {
                _this.show();
            }
        });
        this.element.click(function (ev) {
            ev.stopPropagation();
        });
        $('body').click(function (ev) {
            if (ev.target != _this.button.get(0)) {
                _this.hide();
            }
        });

        /**
         * Inicialização dos elementos
         */
        if (this.config.startsHidden) {
            this.element.hide();
        }

        if (this.config.defaultCSS) {
            this.element.css(this.config.defaultCSS)
        }

    };


    plugin.prototype = {

        /**
         * Configurações padrão
         */
        default_config:{
            // Classe CSS para o botão ativo
            css_button_active:'active',

            // Alinhamento relativo ao botão
            relativeAligment:'BottomRight',
            // Alinhamento relativo ao elemento
            aligment:'TopRight',

            // Indica se o dropdown inicia escondido
            startsHidden:true,

            // CSS padrão a ser aplicado ao elemento
            defaultCSS:{
                position:'absolute'
            }

        },

        /**
         * Elemento do dropdown
         */
        element:null,

        /**
         * Botão responsável por exibir o dropdown
         */
        button:null,

        ev:{
            SHOWN:"SHOWN",
            HIDDEN:"HIDDEN",
            MOVED:"MOVED"
        },

        /**
         * Exibe o dropdown
         */
        show:function () {
            if (!this.isVisible()) {
                this.element.show();
                this.refreshPosition();
                this.button.addClass(this.config.css_button_active);
                this.dispatchEvent(this.ev.SHOWN);
            }
        },

        /**
         * Posiciona o dropdown
         */
        refreshPosition:function () {
            if (this.config.relativeAligment == 'BottomRight' && this.config.aligment == 'TopRight') {
                this.element.css({
                    left:this.button.position().left + this.button.width() - this.element.width(),
                    top:this.button.position().top + this.button.height()
                });
                this.dispatchEvent(this.ev.MOVED);
            }
        },

        /**
         * Esconde o dropdown
         */
        hide:function () {
            if (this.isVisible()) {
                this.element.hide();
                this.button.removeClass(this.config.css_button_active);
                this.dispatchEvent(this.ev.HIDDEN);
            }
        },

        /**
         * Indica se o elemento está visível
         */
        isVisible:function () {
            return this.element.is(':visible');
        }



    };

    $e.registerPlugin("Dropdown", plugin)

})(window, window.Exile, window.jQuery);