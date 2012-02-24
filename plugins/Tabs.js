/**
 * Gerenciador de Tabs
 */
(function (window, $e, $, undefined) {

    /**
     * @param HTMLElement[] tabs Array de tabs
     */
    var plugin = function (tabs, config) {

        this.setupConfig(config);

        this.tabs = [];

        if (tabs instanceof Array) {
            // Adicionamos as tabs do construtor
            for (var i = 0; i < tabs.length; i++) {
                this.addTab(tabs[i])
            }
        }
    }

    plugin.prototype = {

        /**
         * Configurações padrão
         */
        default_config:{

            /**
             * CSS
             */
            // Classe CSS para um botão com o mouse sobre
            css_button_hover:'hover',
            // Classe CSS para um botão selecionado
            css_button_active:'active',
            // Classe CSS para um botão não selecionado
            css_button_inactive:'inactive'

        },

        /**
         * Eventos
         */
        ev:{
            ACTIVE_TAB_CHANGED:"ACTIVE_TAB_CHANGED"
        },

        /**
         * Tab ativa
         */
        activeTab: null,

        /**
         * Elementos HTML que devem ser alternados
         */
        tabs:null,

        /**
         * Adiciona uma nova tab
         */
        addTab:function (tab) {
            var _this = this;
            // Inicializamos o botão
            if (tab.button) {
                tab.button_clickHandler = function () {
                    _this.setActiveTab(tab)
                }
                tab.button_mouseOverHandler = function () {
                    $(tab.button).addClass(_this.config.css_button_hover)
                }
                tab.button_mouseOutHandler = function () {
                    $(tab.button).removeClass(_this.config.css_button_hover)
                }
                $(tab.button)
                    .click(tab.button_clickHandler)
                    .mouseover(tab.button_mouseOverHandler)
                    .mouseout(tab.button_mouseOutHandler)
            }
            this.tabs.push(tab);
            // Primeira tab a ser adicionada deve ser a tab ativa
            if (this.tabs.length == 1) {
                this.setActiveTab(tab)
            } else {
                this.hideTab(tab)
            }
        },

        /**
         * Remove todas as tabs
         */
        clearTabs:function () {
            if (this.tabs) {
                for (var i in this.tabs) {
                    this.removeTab(this.tabs[i]);
                }
            }
            this.activeTab = null;
        },

        /**
         * Remove a tab dada
         */
        removeTab:function (tab) {
            if (tab.button_clickHandler) {
                ($tab.button).unbind('click', tab.button_clickHandler)
            }
            if (tab.button_mouseOverHandler) {
                ($tab.button).unbind('mouseover', tab.button_mouseOverHandler)
            }
            if (tab.button_mouseOutHandler) {
                ($tab.button).unbind('mouseout', tab.button_mouseOutHandler)
            }
            this.tabs.remove(tab)
        },

        /**
         * Retorna uma tab através de uma propriedade dada
         */
        findTab: function(property, value){
            if (!this.tabs){
                return null;
            }
            for(var i=0;i<this.tabs.length;i++){
                if (this.tabs[i][property] == value){
                    return this.tabs[i];
                }
            }
        },

        /**
         * Define qual é a tab ativa
         */
        setActiveTab:function (tab) {
            if (tab == this.activeTab){
                return;
            }
            var lastTab = this.activeTab;
            for (var i = 0; i < this.tabs.length; i++) {
                if (this.tabs[i] === tab) {
                    this.showTab(tab);
                    this.activeTab = tab;
                } else {
                    this.hideTab(this.tabs[i]);
                }
            }
            this.dispatchEvent(this.ev.ACTIVE_TAB_CHANGED, {activeTab: tab, lastTab:lastTab})
        },

        /**
         * Retorna a tab atual
         */
        getActiveTab:function(){
            return this.activeTab;
        },

        /**
         * Esconde a tab
         */
        hideTab:function (tab) {
            $(tab.button).removeClass(this.config.css_button_active).addClass(this.config.css_button_inactive);
            $(tab.element).hide();
        },

        /**
         * Exibe a tab
         */
        showTab:function (tab) {
            $(tab.button).addClass(this.config.css_button_active).removeClass(this.config.css_button_inactive);
            $(tab.element).show();
        }
    }

    $e.registerPlugin("Tabs", plugin)

})(window, window.Exile, window.jQuery);