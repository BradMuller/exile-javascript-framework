/**
 * Exibe mensagens da sessão do usuário.
 */
(function(window, $e, $, undefined) {

    /**
     * Inicializa as mensagens
     * @param container Container das mensagens
     * @param messages Mensagens
     */
    var plugin = function(container, messages) {

        var $container = $(container);
        for (var i in messages) {
            for (var j=0;j<messages[i].length;j++) {
                var message = $('<div class="' + i + '">'+messages[i][j]+'</div>');
                $container.append(message);
                // message.hide();
                //message.fadeIn(1300).fadeOut(4000)
            }
        }

    }

    $e.registerPlugin("SessionMessages", plugin)

})(window, window.Exile, window.jQuery);