/**
 * User: Guilherme
 * Date: 16/09/11
 * Time: 23:03
 *
 * Plugin que faz loop em um array de objetos dados, através de um determinado
 * delay.
 * Este plugin conta também com controles para parar e iniciar o loop, além de
 * métodos para configurar o índice atual.
 */
(function ($e, $) {
    /**
     * Cria uma instância do loop de coleções.
     * E
     *
     * @param object conf Configurações.
     *     collection: Vetor de objetos (objetos com url e title)
     *     delay: Tempo de transição, em ms.
     *
     */
    var plugin = function (conf) {

        var _conf = conf, _this = this, collection = conf.collection, delay = parseInt(conf.delay), index = 0, state = this.states.RESET, activeTimer = 0, __loopCallback;

        /**
         * Validação
         */
        if (delay <= 0 || isNaN(delay)) {
            this.e("Invalid delay.");
        }
        if (!(collection instanceof Array)) {
            this.e("Invalid collection.");
        }

        /**
         * Getters
         */
        /**
         * Retorna a coleção de objetos.
         */
        this.getCollection = function () {
            return collection;
        };
        /**
         * Retorna o delay aplicado ao loop.
         */
        this.getDelay = function () {
            return delay;
        };
        /**
         * Retorna o índice atual.
         */
        this.getIndex = function () {
            return index;
        };
        /**
         * Retorna o item atual.
         */
        this.getItem = function () {
            return collection[index];
        };
        /**
         * Configura o índice atual.
         * Se o índice é o mesmo que o atual, nada é feito.
         * Se o índice varia, o timeout é cancelado e recomeçado.
         * @param int i Novo índice.
         */
        this.setIndex = function (i) {
            i = parseInt(i);
            if (isNaN(i) || i >= collection.length || i < 0 || index == i) {
                return;
            }
            index = i;
            _this.dispatchEvent(_this.ev.INDEX_CHANGED, this);
            if (state == this.states.RUNNING) {
                window.clearTimeout(activeTimer);
                activeTimer = window.setTimeout(__loopCallback, delay);
            }
        };
        /**
         * Passa o loop para o próximo elemento.
         * Se o fim for atingido, o primeiro elemento
         * é selecionado.
         */
        this.next = function () {
            this.setIndex((index + 1) % collection.length)
        };
        /**
         * Passa o loop para o elemento anterior.
         * Se o elemento atual for o primeiro, o último elemento
         * é selecinado.
         */
        this.prev = function () {
            if (index > 0) {
                this.setIndex(index - 1)
            } else {
                this.last()
            }
        };
        /**
         * Passa o loop para o último elemento.
         */
        this.last = function () {
            this.setIndex(collection.length - 1)
        };
        /**
         * Para o looper, cancelando qualquer loop iminente.
         */
        this.stop = function () {
            if (state == this.states.STOPPED || state == this.states.RESET) {
                return;
            }
            window.clearTimeout(activeTimer);
            state = this.states.STOPPED;
            this.dispatchEvent(this.ev.STOP)
        };
        /**
         * Inicia o loop, que será rodado em 'delay'.
         */
        this.run = function () {
            window.clearTimeout(activeTimer);
            if (state == this.states.RESET) {
                // O loop é iniciado
                activeTimer = window.setTimeout(__loopCallback, delay);
                this.dispatchEvent(this.ev.START);
                state = this.states.RUNNING;
            }
            else if (state == this.states.STOPPED) {
                // O loop é continuado
                activeTimer = window.setTimeout(__loopCallback, delay);
                this.dispatchEvent(this.ev.RESUME);
                state = this.states.RUNNING;
            }
        };
        /**
         * Reseta o walker, fazendo com que ele pare.
         */
        this.reset = function () {
            window.clearTimeout(activeTimer);
            state = this.states.RESET;
            index = 0;
        };

        /**
         * Função acionada a cada loop.
         * Responsável por incrementá-lo e disparar
         * eventos.
         */
        __loopCallback = function () {
            if (state != _this.states.RUNNING) {
                return;
            }
            var lastIndex = index;
            index = (index + 1) % collection.length;
            if (index != lastIndex) {
                _this.dispatchEvent(_this.ev.INDEX_CHANGED)
            }
            if (index == 0) {
                _this.dispatchEvent(_this.ev.END)
            }
            _this.dispatchEvent(_this.ev.LOOP);
            window.clearTimeout(activeTimer);
            activeTimer = window.setTimeout(__loopCallback, delay);
        }
    };

    /**
     * Eventos
     */
    plugin.prototype.events = {
        // O looper parou
        STOP:1,
        // O looper começou
        START:2,
        // O looper foi retomado
        RESUME:3,
        // O looper chegou ao fim
        END:4,
        // O looper andou uma posição
        LOOP:5,
        // O índice selecionado variou
        INDEX_CHANGED:6
    };

    /**
     * Estados
     */
    plugin.prototype.states = {
        STOPPED:1,
        RUNNING:2,
        RESET:3
    };

    $e.registerPlugin("CollectionWalker", plugin)
})(window.Exile, window.jQuery);