(function (window, $, undefined) {

    // Bootstrap para jQuery e componentes
    // jQuery é um objeto essencial para nosso framework
    if (window.jQuery == undefined || window.$ != window.jQuery) {
        throw "jQuery must be loaded!";
    }

    /**
     * Framework Exile
     *
     * Administração de plugins com eventos;
     * Wrapper para carregamento de bibliotecas padrões em run-time;
     * Controle de exceções;
     * Sistema multi-idiomas;
     *
     **/
    var Exile = function () {
    }, /**
     * Funções úteis gerais, para estender o core.
     */
        Utils, /**
     * Funções que estenderão o jQuery
     */
        jQuery, /**
     * Arquitetura de plugins
     *
     * Estende algumas funcionalidades do framework Exile e do
     * componente EventsComponent.
     **/
        Plugin = function () {
    }, /**
     * Objeto que implementa a funcionalidade de eventos.
     **/
        EventsComponent = function () {
    };

    Exile.prototype = {

        /**
         * Traduções globais de texto
         **/
        translation:{ "Exile Exception":"Exile Exception" },

        /**
         * Função para traduzir textos.
         * @param string text Texto a ser traduzido. (ou ID)
         **/
        __:function (text) {
            return this.translation[text] !== undefined ? this.translation[text] : text;
        },

        /**
         * Função para levantar exceções padronizadas.
         * @param string text Texto da exceção.
         **/
        e:function (text) {
            throw "Exile Exception" + (this.exception_namespace ? "/" + this.exception_namespace : "") + "]: " + (text !== undefined ? text : 'Unexpected.');
        },

        /**
         * Coleção de CLASSES de plugins (não de instâncias).
         **/
        plugins:{},

        /**
         * Registra um plugin para que herde as funcionalidades do framework
         * e possa ser referenciado no Exile.plugins.
         * @param name Nome do plugin.
         * @param object Propriedades que serão extendidas no plugin.
         * @param parent Nome do plugin pai
         **/
        registerPlugin:function (name, object, parent) {

            if (this.plugins[name])
                this.e("Plugin '" + name + "' has already been registered.")
            if (parent && (typeof parent != "string")) {
                this.e("Invalid subclass name.")
            }
            // O plugin é uma classse
            if (object instanceof Function) {

                // Construtor padrão dos plugins (apenas se não for subclasse de nenhum outro plugin
                var plugin = function () {
                    Plugin.prototype.__constructor.apply(this);
                    // Delegação para o objeto de ve$everdade
                    object.apply(this, arguments);
                };
                object.prototype.__constructor = object;

                if (!parent) {
                    // Impõe as funcionalidades do Plugin para o objeto
                    // sendo registrado como tal e copiamos tdo o prototype do objeto para o plugin
                    $.extend(true, plugin.prototype, Plugin.prototype, object.prototype);
                }
                // Subclassing
                else {
                    $e.requirePlugin(parent);
                    for (var evName in object.prototype.ev) {
                        if ($ep[parent].prototype.ev[evName]) {
                            this.e("Plugin subclassing event collision.")
                        }
                    }
                    // Copiamos os métodos do pai para o filho
                    $.extend(true, plugin.prototype, $ep[parent].prototype, object.prototype);
                    plugin.prototype.__parent = $ep[parent].prototype.__constructor;
                }
                // Copiamos os eventos para que fiquem a nivel da classe e não de instância
                if (plugin.prototype.ev) {
                    plugin.ev = plugin.prototype.ev;
                }
                // Exceções são assinadas pelo plugin
                plugin.prototype.exception_namespace = name;
                this.plugins[name] = plugin;
            }
            // O plugin é uma instância, um objeto
            else {
                $.extend(object, Plugin.prototype);
                object.exception_namespace = name;
                this.plugins[name] = object;
                Plugin.prototype.__constructor.apply(object);
            }

        },

        /**
         * Indica se o plugin dado está definido.
         * @param name Nome do plugin.
         **/
        isPluginLoaded:function (name) {
            return !!this.plugins[name];
        },

        /**
         * Tentativas de carregar plugins, não devem ser repetidas
         */
        _loadAttempts:{},

        /**
         * Tenta carregar o plugin dado
         * @param name Nome do plugin
         */
        loadPlugin:function (name) {
            this._loadAttempts[name] = true;
            var s = window.document.createElement('script');
            s.src = this.getPluginPath(name);
            // Adicionamos como próximo elemento a ser interpretado
            var scripts = window.document.getElementsByTagName('script');
            var current = scripts[scripts.length - 1];
            var parent = current.parentNode;
            if (parent.lastChild == current) {
                parent.appendChild(s)
            } else {
                for (var i = 0; i < parent.childNodes.length; i++) {
                    if (parent.childNodes[i] == current) {
                        break;
                    }
                }
                parent.insertBefore(s, parent.childNodes[i + 1]);
            }
        },

        /**
         * Verifica se o(s) plugin(s) está(o) definido(s).
         * Se um plugin não estiver carregado, tenta carregá-lo.
         * Se não for possível, invoca uma exceção.
         * @param param_array name Nomes de plugins.
         **/
        requirePlugin:function () {
            var loaded = false;
            for (var i = 0; i < arguments.length; i++)
                if (!this.isPluginLoaded(arguments[i])) {
                    // Já tentamos carregar o plugin e nada!
//                    if (this._loadAttempts[arguments[i]]) {
                    this.e("Plugin dependency failed on '" + arguments[i] + "'.");
//                    } else {
//                        // Senão, tentamos carrega-lo
//                        this.loadPlugin(arguments[i])
//                        loaded = true;
//                    }
                }
            return !loaded;
        },

        /**
         * Retorna o caminho para o plugin no servidor
         */
        getPluginPath:function (name) {
            return '/media/js/exile/' + name + '.js';
        },

        /**
         * Adiciona listeners a vários elementos
         */
        addEventListener:function (objs, event, f) {
            if (objs instanceof Array) {
                for (var i = 0; i < objs.length; i++) {
                    if (objs[i].addEventListener instanceof Function) {
                        objs[i].addEventListener(event, f)
                    }
                }
            }
        }
    }

    EventsComponent.prototype = {

        /**
         * Controle de eventos
         **/

        /**
         * Vetor com os eventos definidos por este componente.
         **/
        //events: {},

        /**
         * Objeto colecionador de observadores de eventos.
         **/
        listeners:{},

        /**
         * Adicionar observador.
         * @param string type Identificador do tipo de evento.
         * @param function listener Função a ser invocada.
         **/
        addEventListener:function (type, listener) {
            // Vários de uma só vez
            if (type instanceof Array) {
                for (var i = 0; i < type.length; i++) {
                    this.addEventListener(type[i], listener)
                }
                return;
            }

            if (typeof type != "string")
                this.e("Invalid event type.");
            if (!(listener instanceof Function) && !(listener instanceof Array))
                this.e("Invalid event listener.");
            // remove to then add and make sure there's only one running
            // this.removeEventListener(type, listener);

            if (!(this.listeners[type] instanceof Array))
                this.listeners[type] = [listener];
            else
                this.listeners[type].push(listener);
        },

        /**
         * Remove um observador de eventos.
         * @param string type Identificador do tipo de evento.
         * @param function listener Função a ser removida.
         **/
        removeEventListener:function (type, listener) {
            if (typeof type != "string")
                this.e("Invalid event type.");
            if (!(listener instanceof Function) && !((listener instanceof Array) ))
                this.e("Invalid event listener.");
            if (this.listeners[type] instanceof Array) {
                for (var i = 0; i < this.listeners[type].length; i++)
                    if (this.listeners[type][i] == listener)
                        this.listeners[type].splice(i, 1);
            }
        },

        /**
         * Alertar observadores, através do envio de evento.
         * @param string type Identificador do tipo de evento.
         * @param object event Objeto com informações sobre o evento.
         **/
        dispatchEvent:function (type, event) {
            if (typeof type != "string")
                this.e("Invalid event type.");
            if (event == undefined)
                event = this;
            if (this.listeners[type] instanceof Array)
                for (var i = 0; i < this.listeners[type].length; i++) {
                    if (this.listeners[type][i] instanceof Array) {
                        this.listeners[type][i][1].apply(this.listeners[type][i][0], [event]);
                    } else {
                        this.listeners[type][i].apply(this, [event]);
                    }
                }
        }
    }

    Plugin.prototype = {

        /**
         * Identificador do tipo de exceção.
         * É o nome do plugin.
         **/
        exception_namespace:"Plugin",

        /**
         * Jogador de exceção
         */
        e:Exile.prototype.e,

        /**
         * Tradutor de textos
         */
        __:Exile.prototype.__,

        /**
         * Construtor padrão
         */
        __constructor:function () {
            this._loading = {};
            this._activeJSONRequests = {};
            this.listeners = {};
            this.config = {};
        },

        /**
         * Inicializa as configurações
         */
        setupConfig:function (config) {
            if (!this.default_config) {
                this.config = config;
            } else {
                $.extend(this.config, this.default_config, config);
            }
        },

        /**
         * Configurações padrão
         */
        default_config:null,

        /**
         * Configurações da instância
         */
        config:null,

        /**
         * Eventos
         */
        ev:{
            AJAX_LOADING:"AJAX_LOADING"
        },

        /**
         * Gerenciamento de loading states
         */

        /**
         * Informações sobre estado loading
         */
        _loading:null,

        /**
         * Normalizador do contexto de loading
         * @param context Contexto do estado
         */
        _getNormalizedLoadingContext:function (context) {
            if (!context) {
                return 'generic';
            }
            return context;
        },

        /**
         * Indica se o plugin está carregando alguma coisa
         * @param context Contexto do estado
         */
        isLoading:function (context) {
            if (!context) {
                for (var i in this._loading) {
                    if (this._loading[i]) {
                        return true;
                    }
                }
                return false;
            }
            context = this._getNormalizedLoadingContext(context);
            return !!this._loading[context];
        },

        /**
         * Atualiza o estado de loading, indicando se estamos carregando mais um ou não.
         * @param state Se está carregando ou não
         * @param context Contexto do estado
         */
        updateLoadingState:function (state, context) {
            context = this._getNormalizedLoadingContext(context);
            if (this._loading[context] == undefined) {
                this._loading[context] = 0
            }
            this._loading[context] += state ? +1 : -1;
            // Atualizamos a visualização
            this.dispatchEvent(this.ev.AJAX_LOADING, {context:context})
        },

        /**
         * Pedidos json ativos
         */
        _activeJSONRequests:null,

        /**
         * Retorna todos os objetos JSON ativos para o contexto
         */
        getActiveJSONRequests:function (context) {
            context = this._getNormalizedLoadingContext(context);
            return this._activeJSONRequests[context];
        },

        /**
         * Aborta todas as conexões para o contexto dado
         */
        abortActiveJSONRequests:function (context) {
            context = this._getNormalizedLoadingContext(context);
            var reqs = this._activeJSONRequests[context];
            if (reqs != undefined && reqs.length) {
                for (var i = 0; i < reqs.length; i++) {
                    reqs[i].abort()
                }
                this._activeJSONRequests[context] = []
            }
        },

        /**
         * Wrapper ajax para controlar estados
         */
        ajax:function (settings, context) {
            var _this = this;
            context = this._getNormalizedLoadingContext(context);
            // Inicializamos a coleção de requests
            if (this._activeJSONRequests[context] == undefined) {
                this._activeJSONRequests[context] = []
            }
            var request = null;
            var f = function () {
                _this.updateLoadingState(false, context);
                _this._activeJSONRequests[context].remove(request);
            };
            $.extend(settings,
                {
                    complete:f,
                    abort:f
                });
            request = $.ajax(settings);

            // Adicionamos o novo request
            this._activeJSONRequests[context].push(request);
            this.updateLoadingState(true, context)
        },

        /**
         * Chamada JSON com acúmulo de loading state
         */
        json:function (url, data, callback, context) {
            this.ajax({
                url:url,
                dataType:'json',
                data:data,
                type:'get',
                success:callback
            }, context);
        },

        /**
         * Chamada JSON com acúmulo de loading state
         */
        jsonPost:function (url, data, callback, context) {
            this.ajax({
                url:url,
                dataType:'json',
                data:data,
                type:'post',
                success:callback
            });
        }
    };

    Utils = {

        /**
         * Alguns labels padrões
         */
        labels:{
            months:['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
            weekdays:['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
        },

        /**
         * Retorna o caminho do diretório no URL dado.
         * @param string path Caminho qualquer.
         **/
        dirurl:function (path) {
            return path.replace(/\\/g, '/').replace(/\/[^\/]*$/, '');
        },

        // Returns input string padded on the left or right to specified length with pad_string
        //
        // version: 1107.2516
        // discuss at: http://phpjs.org/functions/str_pad
        // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // + namespaced by: Michael White (http://getsprink.com)
        // +      input by: Marco van Oort
        // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
        // *     example 1: str_pad('Kevin van Zonneveld', 30, '-=', 'STR_PAD_LEFT');
        // *     returns 1: '-=-=-=-=-=-Kevin van Zonneveld'
        // *     example 2: str_pad('Kevin van Zonneveld', 30, '-', 'STR_PAD_BOTH');
        // *     returns 2: '------Kevin van Zonneveld-----'
        str_pad:function (input, pad_length, pad_string, pad_type) {
            var half = '', pad_to_go;

            var str_pad_repeater = function (s, len) {
                var collect = '';

                while (collect.length < len) {
                    collect += s;
                }
                collect = collect.substr(0, len);

                return collect;
            };

            input += '';
            pad_string = pad_string !== undefined ? pad_string : ' ';

            if (pad_type != 'STR_PAD_LEFT' && pad_type != 'STR_PAD_RIGHT' && pad_type != 'STR_PAD_BOTH') {
                pad_type = 'STR_PAD_RIGHT';
            }
            if ((pad_to_go = pad_length - input.length) > 0) {
                if (pad_type == 'STR_PAD_LEFT') {
                    input = str_pad_repeater(pad_string, pad_to_go) + input;
                } else if (pad_type == 'STR_PAD_RIGHT') {
                    input = input + str_pad_repeater(pad_string, pad_to_go);
                } else if (pad_type == 'STR_PAD_BOTH') {
                    half = str_pad_repeater(pad_string, Math.ceil(pad_to_go / 2));
                    input = half + input + half;
                    input = input.substr(0, pad_length);
                }
            }

            return input;
        },

        /**
         * http://stackoverflow.com/questions/1909441/jquery-keyup-delay
         */
        delay:(function (callback, ms) {
            var timer = 0;
            return function () {
                clearTimeout(timer);
                timer = setTimeout(callback, ms);
            };
        })

    }

    jQuery = {

        /**
         * Adiciona uma classe sempre que o mouse passa
         * por um elemento e a remove sempre que sai.
         * @param string cls Nome da classe. Padrão = 'over'.
         */
        hoverclass:function (cls) {
            if (cls == undefined) {
                cls = 'over';
            }
            this.each(function () {
                var _this = $(this);
                _this.hover(function () {
                    _this.addClass(cls);
                }, function () {
                    _this.removeClass(cls)
                })
            })
            return this;
        },
        /**
         * Transição de imagens
         */
        imgtransition:function (url) {
            $(this).filter('img').attr('src', url)
        }

    }

    /**
     * Customização de objetos nativos do JS
     */

    /**
     * String
     */
    $.extend(String.prototype, {

        /**
         * Str padding
         * TODO implementar strings com length > 1
         * @param length Tamanho total que o string deve ter
         * @param string Conteúdo a ser adicionado repetidamente até encher o máximo
         */
        padLeft:function (length, string) {
            var str = this.toString();
            while (str.length < length) {
                str = string + str;
            }
            return str;
        },

        /**
         * Str padding
         * TODO implementar strings com length > 1
         * @param length Tamanho total que o string deve ter
         * @param string Conteúdo a ser adicionado repetidamente até encher o máximo
         */
        padRight:function (length, string) {
            var str = this.toString();
            while (str.length < length) {
                str = str + string;
            }
            return str;
        }

    });

    /**
     * Array
     */
    $.extend(Array.prototype, {
        /**
         * Retorna o último elemento do array
         */
        last:function () {
            return this[this.length - 1];
        },

        /**
         * Array Remove - By John Resig (MIT Licensed)
         * Remove do array o elemento nas posições dadas
         *
         * @param int from
         * @param int to
         */
        removeAt:function (from, to) {
            var rest = this.slice((to || from) + 1 || this.length);
            this.length = from < 0 ? this.length + from : from;
            return this.push.apply(this, rest);
        },

        /**
         * Remove do array todas as entradas de um elemento dado
         *
         * @param object item Objeto a ser buscado no array
         */
        remove:function (item) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] === item) {
                    this.removeAt(i)
                }
            }
        },

        /**
         * Verifica se o array contém o elemento dado
         *
         * @param object item Objeto a ser buscado no array.
         */
        contains:function (item, weakComparison) {
            if (!weakComparison) {
                for (var i = 0; i < this.length; i++) {
                    if (this[i] === item) {
                        return true;
                    }
                }
            } else {
                for (var i = 0; i < this.length; i++) {
                    if (this[i] == item) {
                        return true;
                    }
                }
            }
            return false;
        },

        /**
         * Insere o elemento no array somente se ele não já exisitr
         *
         * @param object item Objeto a ser buscado no array.
         */
        pushUnique:function (item) {
            if (!this.contains(item)) {
                this.push(item)
                return true;
            }
            return false;
        },

        /**
         * Encontra o item através de algum tipo de lógica
         */
        find:function (f) {
            if (!(f instanceof Function)) {
                throw "Invalid argument for finding in arrays.";
            }
            for (var i = 0; i < this.length; i++) {
                if (f(this[i])) {
                    return this[i];
                }
            }
            return null;
        },

        /**
         * Loopa em cada elemento do array.
         * O loop pode ser interrompido se a função passada retornar false.
         */
        each:function (f) {
            if (!(f instanceof Function)) {
                throw "Invalid argument for finding in arrays.";
            }
            for (var i = 0; i < this.length; i++) {
                if (f(this[i], i) === false) {
                    return;
                }
            }
        }
    });

    /**
     * Date
     */
    $.extend(Date.prototype, {

        /**
         * Indica se a data é o dia de hoje
         */
        isToday:function () {
            return this.isEqualDate(Date.getToday())
        },

        /**
         * Compara com outra data através apenas do dia, mes e ano
         */
        isEqualDate:function (date) {
            return date.getMidnightTimestamp() == this.getMidnightTimestamp()
        },

        /**
         * Retorna a data no formato ISO YYYY-MM-DD
         */
        getISODate:function () {
            return this.getFullYear().toString().padLeft(4, '0') + '-' + (this.getMonth() + 1).toString().padLeft(2, '0') + '-' + this.getDate().toString().padLeft(2, '0');
        },

        /**
         * Retorna a data no formato ISO YYYY-MM-DD HH:mm:SS
         */
        getISODateTime:function () {
            return this.getISODate() + " " + this.getHours().toString().padLeft('2', 0) + ":" + this.getMinutes().toString().padLeft('2', 0) + ":" + this.getSeconds().toString().padLeft('2', 0)
        },

        /**
         * Retorna o timestamp do dia dado às 00:00:00
         */
        getMidnightTimestamp:function () {
            return this.getTime() - (this.getTime() % 86400000);
        },

        /**
         * Retorna a quantidade de dias no mês
         */
        getTotalMonthDays:function () {
            return 32 - new Date(this.getFullYear(), this.getMonth(), 32).getDate();
        }

    });

    /**
     * Retorna o dia de hoje
     */
    Date.getToday = function () {
        return new Date();
    }

    /**
     * Subclassing e variáveis globais
     */

        // Fazemos do Plugin um elemento capaz de trabalhar com eventos
    $.extend(Plugin.prototype, EventsComponent.prototype);
    $.extend(Exile.prototype, Utils);
    $.extend(window.jQuery.fn, jQuery);


// Aliases para atalhos
    window.Exile = window.$e = new Exile;
    window.$e.Plugin = Plugin;
    window.$ep = window.Exile.plugins;
    window.$ep.ev = Plugin.prototype.ev;

})
    (window, window.jQuery);