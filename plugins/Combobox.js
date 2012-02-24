/**
 *
 *
 */
(function (window, $e, $, undefined) {

    var plugin = function (selector) {

        var e = $(selector);
        var a = e.find('a:first').css({cursor:'pointer', padding:'5px 7px'});
        var u = e.find('ul').css({overflow:'hidden', position:'absolute', display:'none', cursor:'pointer'});
        var i = e.find('input');
        var _this = this;

        /**
         * Algum item é selecionado
         */
        u.find('a').click(function (ev) {
            _this.setCurrentOption(this);
            _this.hide();
        });

        /**
         * Fechamos o dropdown quando qualquer lugar fora dele é clicado
         */
        $('html, body').click(function () {
            _this.hide();
        });
        e.parent().click(function(){
            _this.hide();
        });

        /**
         * Abrimos o dropdown
         */
        a.click(function (ev) {
            ev.stopPropagation();
            _this.show();
        });
        a.text(e.find('li').eq(0).text());
        i.val(e.find('li').eq(0).find('a').attr('value'));

        this.dropdownControl = e.find('a');
        this.valueContainer = e.find('input');
        this.optionsContainer = e.find('ul');

        this.setCurrentOptionAt(0)

    };


    plugin.prototype = {

        ev:{
            ITEM_ADDED:"ITEM_ADDED",
            INDEX_CHANGED:"INDEX_CHANGED",
            ITEM_REMOVED:"ITEM_REMOVED",
            SHOWN:"SHOWN",
            HIDDEN:"HIDDEN"
        },

        /**
         * Controle do dropdown
         */
        dropdownControl:null,

        /**
         * Container do valor
         */
        valueContainer:null,

        /**
         * Container das opções
         */
        optionsContainer:null,

        /**
         * Item atualmente selecionado
         */
        currentOption:null,

        /**
         * Adiciona um item
         */
        addItem:function (text, value) {
            var _this = this;
            var li = $('<li value="' + value + '"><a>' + text + '</li>')
                .click(function (ev) {
                _this.setCurrentOption(this);
                _this.hide();
            });
            this.optionsContainer.append(li);
            this.dispatchEvent(this.ev.ITEM_ADDED);
            if (this.getOptions().length == 1) {
                this.setCurrentOptionAt(0);
            }
        },

        /**
         * Retorna as opções do dropdown
         */
        getOptions:function () {
            return this.optionsContainer.children();
        },

        /**
         * Configura o valor atual
         */
        setCurrentOptionAt:function (i) {
            if (i >= 0 && i < this.getOptions().length) {
                this.setCurrentOption(this.getOptions().eq(i))
            }
        },

        /**
         * Retorna o valor atual
         */
        getCurrentValue:function () {
            return this.valueContainer ? this.valueContainer.val() : null;
        },

        /**
         * Configura o valor atual
         */
        setCurrentOption:function (option) {
            if (option == this.currentOption) {
                return;
            }
            this.currentOption = option;
            this.dropdownControl.text($(option).text());
            this.valueContainer.val($(option).attr('value'));
            this.dispatchEvent(this.ev.INDEX_CHANGED)
        },

        /**
         * Abre o dropdown
         */
        show:function () {
            this.dropdownControl.toggleClass('active')
            var a = this.dropdownControl;
            this.optionsContainer.css('top', a.position().top + a.height()).css('margin-left', (a.offset().left - a.parent().offset().left)).width(a.width()).slideToggle('fast');
            this.dispatchEvent(this.ev.SHOWN)
        },

        /**
         * Fecha o dropdown
         */
        hide:function () {
            this.dropdownControl.removeClass('active');
            this.optionsContainer.slideUp('fast');
            this.dispatchEvent(this.ev.HIDDEN)
        }
    }

    $e.registerPlugin("Combobox", plugin)

})(window, window.Exile, window.jQuery);