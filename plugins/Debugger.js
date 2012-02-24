/**
 * Lista Genérica - GenericList
 *
 */
(function(window, $e, $, undefined) {

    /**
     * Exibe uma lista de itens em um container.
     */
    var plugin = function(debugContents, settings) {

        //
        // Dependencies
        // --------------

        //
        // Constants
        // ----------

        //
        // Properties
        // -----------
        var _debugWindow;
        this.debugContents = Base64.decode(debugContents);
        this.settings = settings ? settings : {};
        _expandable_divs = this.settings['expandable_divs'];
        _expandable_ctrl_divs = [];
        var _this = this;
        //
        // Methods
        // -----------

        // inicia o mecanismo de divisões, para separar os conteúdos em partes expansíveis
        //
        var _debugWindowSetup = function() {
            var div, expand_ctrl_div = null;
            for (index in _expandable_divs) {
                div = _debugWindow.document.getElementById(_expandable_divs[index]);
                if (!div) continue;
                // cria e insere um elemento para expandir/esconder as divs
                expand_ctrl_div = _debugWindow.document.createElement('div');
                expand_ctrl_div.className = 'debug_div_expansion_ctrl';
                expand_ctrl_div.innerHTML = '<a href=\'#\'>Esconder</a>';

                expand_ctrl_div.expandable_div = div;
                expand_ctrl_div.expanded = true;
                expand_ctrl_div.cookieName = 'cookie_' + _expandable_divs[index];
                // atualiza o estado da div
                expand_ctrl_div.childNodes[0].onclick = function() {
                    // está visível
                    if (this.parentNode.expanded == true) {
                        this.parentNode.expandable_div.style.display = 'none';
                        this.parentNode.expanded = false;
                        this.innerHTML = 'Expandir';
                        createCookie(this.parentNode.cookieName, 1, 6);
                    } else {
                        this.parentNode.expandable_div.style.display = '';
                        this.parentNode.expanded = true;
                        this.innerHTML = 'Esconder';
                        eraseCookie(this.parentNode.cookieName);
                    }
                    return false;
                }
                // verifica como estão as configurações de preferência
                if (readCookie(expand_ctrl_div.cookieName))
                    expand_ctrl_div.childNodes[0].onclick();


                _expandable_ctrl_divs.push(expand_ctrl_div);
                div.parentNode.insertBefore(expand_ctrl_div, div);
            }
        }

        var _openDebugWindow = function() {
            _debugWindow = window.open("", "debug_window", "width=1200,height=800,scrollbars=1,resizable=1,modal=yes");

            // sempre fecha o debugger junto ao aplicativo
            $(window).unload(
                function(e) {
                    _debugWindow.close();
                }
            );

            // atribui o conteúdo
            /* if(!_debugWindow.){ */
            _debugWindow.document.open();
            _debugWindow.document.write(_this.debugContents);
            _debugWindow.document.close();
            _debugWindowSetup();
            // } /* else _debugWindow.document.body.innerHTML = _this.debugContents; */


            // controle das hotkeys do debugger
            _debugWindow.onkeydown =
                function(e) {
                    // F5 - recarrega a página sem POST, apenas GET
                    if (e.keyCode == 116) {
                        this.opener.location.reload();
                        this.opener.focus();
                        // ESC - fecha o debugger
                    } else if (e.keyCode == 27) {
                        this.close();
                        // F4 - dá focus ao programa
                    } else if (e.keyCode == 115) {
                        this.opener.focus();
                    }
                };
        }

        //
        // Construction
        // ------------

        // focus ao debugger, apertando F4 na janela principal
        $(window).keydown(
            function(e) {
                // F4 - dá focus ao debugger
                if (e.keyCode == 115) {
                    if (!_debugWindow || _debugWindow.closed) {
                        _openDebugWindow();
                    } else {
                        _debugWindow.focus();
                    }
                }
            }
        );

        if (_this.settings['focus']) {
            _openDebugWindow();
        }
    }


    $e.registerPlugin("Debugger", plugin)

})(window, window.Exile, window.jQuery);
