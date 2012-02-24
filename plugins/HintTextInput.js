/**
 * Plugin para dar dicas sobre o que um text input faz através de texto no próprio input.
 */
(function($e, $, undefined) {

    var plugin = function(input, hint) {

        input.dirty = false;

        $(input).focus(function() {
            if (!this.dirty) {
                this.value = '';
                this.dirty = true;
            }
            $(this).removeClass('hint');
        });

        $(input).blur(function() {
            if (!this.value) {
                this.dirty = false;
                $(this).addClass('hint');
                this.value = hint;
            } else {
                this.dirty = true;
                this.dirty = true;
                $(this).removeClass('hint');
            }
        });

        $(input).blur();
       // $ep.HintTextInput.instances.push(this);
    }

    $e.registerPlugin("HintTextInput", plugin)

})(window.Exile, window.jQuery);