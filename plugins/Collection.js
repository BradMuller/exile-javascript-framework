/**
 * Coleção genérica de objetos, com suporte a eventos e seleção.
 *
 */
(function (window, $e, $, undefined) {

    /**
     * Exibe uma lista de itens em um container.
     */
    var plugin = function (config, items) {
        this.setupConfig(config);
        this.items = items instanceof Array ? items : [];
    };

    plugin.prototype = {

        config:null,

        /**
         * Configurações padrão
         */
        default_config:{
            // Seleção automática quando há apenas um elemento ou quando o elemento selecionado é removido
            autoSelect:true
        },

        /**
         * Eventos
         */
        ev:{
            ITEM_ADDED:"ITEM_ADDED",
            ITEM_REMOVED:"ITEM_REMOVED",
            INDEX_CHANGED:"INDEX_CHANGED",
            ITEMS_CLEAR:"ITEMS_CLEAR"
        },

        /**
         * Itens
         */
        items:null,

        /**
         * Item selecionado
         */
        selectedItem:null,

        /**
         * Índice selecionado
         */
        selectedIndex:null,

        /**
         * Controle de itens
         */

        /**
         * Retorna a quantidade de objetos
         */
        getLength:function () {
            return this.items.length;
        },

        /**
         * Adiciona mais itens à lista
         * @param items Array de itens a serem inseridos.
         */
        addItems:function (items) {
            if (!(items instanceof Array)) {
                this.e("Invalid argument.")
            }
            for (var i = 0; i < items.length; i++) {
                this.add(items[i]);
            }
        },

        /**
         * Adiciona um único item à lista
         * @param item Objeto a ser inserido como item
         */
        add:function (item) {
            this.items.push(item);
            this.dispatchEvent(this.ev.ITEM_ADDED, {item:item, index:this.items.length - 1});
            if (this.selectedIndex === null && this.items.length > 0 && this.config.autoSelect) {
                this.selectIndex(0);
            }
        },

        /**
         * Remove o item dado
         */
        remove:function (item) {
            for (var i = 0; i < this.items.length; i++) {
                if (item == this.items[i]) {
                    this.removeAt(i);
                    return true;
                }
            }
            return false;
        },

        /**
         * Remove o item dado
         */
        removeAt:function (index) {
            var item = this.getAt(index);
            if (item) {
                delete this.items[index];
                if (this.selectedIndex === index) {
                    if (!this.items.length || !this.config.autoSelect) {
                        this.clearSelection();
                    } else {
                        if (this.items.length <= index) {
                            this.selectIndex(index - 1);
                        } else {
                            this.selectIndex(index);
                        }
                    }
                }
                this.dispatchEvent(this.ev.ITEM_REMOVED, {item:item, index:index});
                return true;
            }
            return false;
        },

        /**
         * Seleciona um objeto dado
         */
        selectItem:function (item) {
            if (item && this.items.length > 0) {
                for (var i = 0; i < this.items.length; i++) {
                    if (this.items[i] == item) {
                        this.selectIndex(i);
                        return i;
                    }
                }
            }
            return null;
        },

        /**
         * Seleciona um índice dado
         */
        selectIndex:function (index) {
            index = parseInt(index);
            if (index > this.items.length || this.selectedIndex === index) {
                return;
            }
            var lastSelectedItem = this.selectedItem,
                lastSelectedIndex = this.selectedIndex;
            this.selectedIndex = index;
            this.selectedItem = this.items[index];
            this.dispatchEvent(this.ev.INDEX_CHANGED, {lastIndex:lastSelectedIndex, lastItem:lastSelectedItem, item:this.selectedItem, index:this.selectedIndex});
            return this.selectedItem;
        },

        /**
         * Limpa a seleção
         */
        clearSelection:function () {
            var lastSelectedItem = this.selectedItem,
                lastSelectedIndex = this.selectedIndex;
            this.selectedIndex = null;
            this.selectedItem = null;
            this.dispatchEvent(this.ev.INDEX_CHANGED, {lastIndex:lastSelectedIndex, lastItem:lastSelectedItem, item:null, index:null});
        },

        /**
         * Retorna o item selecionado
         */
        getSelectedItem:function () {
            return this.selectedItem;
        },

        /**
         * Retorna o índice selecionado
         */
        getSelectedIndex:function () {
            return this.selectedIndex;
        },

        /**
         * Retorna o total de itens
         */
        getItems:function () {
            return this.items;
        },

        /**
         * Retorna o item na posição dada
         */
        getAt:function (i) {
            if (i > this.items.length - 1) {
                return null;
            }
            return this.items[i];
        },

        /**
         * Limpa todos os itens da lista
         */
        clear:function () {
            var items = this.items;
            this.items = [];
            this.selectedItem = null;
            this.selectedIndex = null;
            this.dispatchEvent(this.ev.ITEMS_CLEAR, {items:items});
        }

    };

    $e.registerPlugin("Collection", plugin)

})(window, window.Exile, window.jQuery);