/**
 * Lista de conteúdo que carrega dados via AJAX.
 *
 */
(function (window, $e, $, undefined) {

    $e.requirePlugin('Collection', 'Timer', 'DataFetcher');

    var plugin = function (config, items, container) {

        this.__parent(config, items);

        var _this = this;
        this.container = $(container);

        /**
         * Controladores de eventos
         */
        this.addEventListener(this.ev.ITEM_ADDED, this.handleItemAdded);
        this.addEventListener(this.ev.ITEM_REMOVED, this.handleItemRemoved);
        this.addEventListener(this.ev.INDEX_CHANGED, this.handleIndexChanged);
        this.addEventListener(this.ev.ITEMS_CLEAR, this.handleItemsClear);

        this.updateTimer = new $ep.Timer({timeout:this.config.updateTimeout});
        this.updateTimer.addEventListener($ep.Timer.ev.TIMEOUT, [this, this.handleUpdateTimeout]);

        if (this.config.dataFetcher) {
            this.dataFetcher = this.config.dataFetcher;
        } else {
            if (this.config.fetchDataParameters instanceof Function) {
                var f = this.config.fetchDataParameters;
                this.config.fetchDataParameters = function(){
                    f.apply(_this, arguments);
                }
            }
            this.dataFetcher = new $ep.DataFetcher({url:this.config.fetchDataUrl, parameters:this.config.fetchDataParameters})
        }
        this.dataFetcher.addEventListener($ep.DataFetcher.ev.DATA_FETCHED, [this, this.handleDataFetch]);
    };

    plugin.prototype = {

        /**
         * Configurações padrão
         */
        default_config:{

            /**
             * CSS
             */
            // Classe CSS para um item com o mouse sobre
            css_item_hover:'hover',
            // Classe CSS para um item selecionado
            css_item_selected:'active',

            /**
             * Parâmetros do DataFetcher
             */
            // Caminho para o servidor de pedido AJAX
            fetchDataUrl:null,
            // Função que monta parâmetros do pedido
            fetchDataParameters:function () {
            },
            // Função que monta parâmetros de um pedido para mais elementos
            fetchShowMoreParameters:function (total) {
                return 'start=' + parseInt(this.getLength()) + '&limit=' + parseInt(total)
            },
            // DataFetcher personalizado, opcional
            dataFetcher:null,

            /**
             * Updates periódicos
             */
            // Indica se a lista deve atualizar-se periodicamente, e se sim, qual o período (int)
            updateTimeout:null,
            // Procedimento a ser invocado a cada vez que a lista é atualizada
            update:function () {
                this.fetchLoadEnabled = true;
                this.showAll();
            }

        },

        /**
         * Timer responsável por controlar o update
         */
        updateTimer:null,

        /**
         * DataFetcher
         */
        dataFetcher:null,

        /**
         * Eventos da lista
         */
        ev:{
            ITEM_RENDERED:"ITEM_RENDERED",
            ITEM_CLICKED:"ITEM_CLICKED",
            RESET:"RESET"
        },

        /**
         * Handlers
         */
        handleItemAdded:function (ev) {
            this.renderItem(ev.item, ev.index);
        },
        handleItemRemoved:function (ev) {
            this.removeItemRenderer(ev.item, ev.index);
        },
        handleIndexChanged:function (ev) {
            if (ev.lastItem !== null && ev.lastItem.__renderer) {
                ev.lastItem.__renderer.removeClass(this.config.css_item_selected);
            }
            if (ev.item !== null && ev.item.__renderer) {
                ev.item.__renderer.addClass(this.config.css_item_selected);
            }
        },
        handleUpdateTimeout:function () {
            this.config.update.apply(this);
        },
        handleDataFetch:function (ev) {
            if ((ev.response instanceof Array) && ev.response.length) {
                this.addItems(ev.response)
            } else {

            }
        },
        handleItemsClear:function (ev) {
            this.container.empty();
        },

        /**
         * Reseta a lista
         */
        reset:function () {
            this.dataFetcher.abort();
            this.clear();
            this.dispatchEvent(this.ev.RESET)
        },

        /**
         * Carrega mais itens a serem exibidos
         */
        showMore:function (num) {
            // Buscamos mais dados no servidor
            this.dataFetcher.fetch({ parameters:this.config.fetchShowMoreParameters.apply(this, [num]) });
        },

        /**
         * Carrega itens até um limite dado
         */
        showTo:function (total) {
            if (this.getLength() >= total) {
                return;
            }
            // Buscamos mais dados no servidor
            this.dataFetcher.fetch({ parameters:this.config.fetchShowMoreParameters.apply(this, [total - this.getLength()]) });
        },

        /**
         * Exibe todos os itens, tentando buscar mais itens no servidor
         */
        showAll:function (noFetch) {
            var _this = this;
            // Buscamos mais dados no servidor
            if (!noFetch) {
                this.dataFetcher.fetch()
            }
        },

        /**
         * Renderização
         */

        /**
         * Container de itens renderizados
         */
        container:null,

        /**
         * Renderiza um único item da lista, adicionando-o ao container
         */
        renderItem:function (item, i) {
            var _this = this;
            var element = $(this.getItemRenderer(this.items[i], i));
            if (this.selectedIndex == i) {
                element.addClass(this.config.css_item_selected)
            }
            item.__renderer = element;
            this.container.append(element);
            (function (_this, element, item, index) {
                element.click(
                    function () {
                        _this.dispatchEvent(_this.ev.ITEM_CLICKED, {item:item, renderer:element});
                        _this.selectIndex(index);
                    }).mouseover(
                    function () {
                        element.addClass(_this.config.css_item_hover)
                    }).mouseout(function () {
                        element.removeClass(_this.config.css_item_hover)
                    })
            })(_this, element, this.items[i], i);

            this.dispatchEvent(this.ev.ITEM_RENDERED, {item:item, renderer:element});
        },

        /**
         * Remove o render do item dado
         */
        removeItemRenderer:function (item, i) {
            if (item.__renderer) {
                item.__renderer.remove();
            }
        },

        getItemRenderer:function (item, i) {
            this.e("Not implemented.");
        },

        getRenderer: function(item){
            return item.__renderer;
        }

    };

    $e.registerPlugin("AjaxListBox", plugin, 'Collection');

})(window, window.Exile, window.jQuery);