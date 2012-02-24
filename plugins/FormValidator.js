(function (window, $e, $, undefined) {

    $e.requirePlugin('SessionMessages');

    /**
     * Valida um form dado por name.
     *
     * @param string name Nome do formulário (NÃO É O ID)
     * @param string|null serverResponse Resposta do servidor
     */
    var plugin = function (name, serverResponse) {

        // Referência para todas as funções anônimas
        var validator = this;

        // Inicializamos o controle sobre o formulário
        this.form = $('form[name=' + name + ']')
        this.form.submit(function () {
            if (!validator.validate()) {
                //    validator.renderErrors();
                return false;
            }
        })

        // Inicializa os atributos dos elementos
        // Eles são inicialmente decodificados do atributo 'validation-attr'
        // Atributos definido inline são mais importantes que aqueles dados pelo servidor
        this.form.find(':input').each(function () {
            var input = $(this);
            var name = input.attr('name');
            if (name && input.attr('validation-attr')) {
                validator.setElementAttributes(name, input.attr('validation-attr'))
            }
            // Começamos a observar mudanças nos elementos para validá-los
            input.blur(function () {
                validator.validateElement(name);
                validator.renderElementError(name, $(this));
            })
        })

        if (serverResponse) {
            $(function () {
                validator.parseServerResponse(serverResponse)
            })
        }

    }

    /**
     * Funções do nosso validador
     */
    plugin.prototype = {

        /**
         * Formulário alvo da validação
         * @var jQuery
         */
        form:null,

        /**
         * Retorna o elemento do formulário
         * @param string name
         * @param int index Índice do elemento
         * @return jQuery
         */
        getElement:function (name, index) {
            if (index) {
                var element = this.form.find(':input[name="' + name + '[' + index + ']"]')
                if (element.size()) {
                    return element.eq(0);
                }
                return this.form.find(':input[name="' + name + '[]"').eq(index);
            }
            return this.form.find(':input[name="' + name + '"]');

        },

        /**
         * Validação
         */

        /**
         * Valida o formulário
         * @return bool Indica se não há erros
         */
        validate:function () {
            this.clearErrors()
            for (var element_name in this.attrs) {
                this.validateElement(element_name);
            }

            /**
             * Validações personizaladas
             */
            for (var i = 0; i < this.customValidations.length; i++) {
                this.customValidations[i].apply(this)
            }

            return !this.hasErrors();
        },

        /**
         * Valida um único elemento, através de seu nome.
         */
        validateElement:function (name) {
            var element = this.getElement(name)
            if (element.size() && this.attrs[name]) {
                this.clearErrors(name);
                if (this.attrs[name]['notnull'] && !element.val()) {
                    this.addError(name, 'Preencha o campo!');
                } else {
                    var result = this.validations[this.attrs[name]['type']](element.val(), this.attrs[name], element)
                    if (result) {
                        this.addError(name, result)
                    }
                }
                this.renderElementError(name, element)
            }
        },

        /**
         * Objeto que contém os algoritmos para as validações de dados.
         * Cada item deste objeto é um tipo de validação e deve aceitar os
         * argumentos:
         * @param string data Dados a serem validados
         * @param string[] attr Atributos para controlar o tipo de validação
         * @param jQuery element O elemento sendo verificado
         */
        validations:{

            /**
             * String
             */
            str:function (data, attr, element) {
                if (attr.maxlen && data.length > attr.maxlen) {
                    return 'O máximo são ' + attr.maxlen + ' caractéres.';
                }
            },

            /**
             * Enum
             */
            enum_:function (data, attr, element) {
                var values = attr.values.split(',');
                if (values.contains(data)) {
                    return 'Valor inválido!'
                }
            },

            /**
             * Data
             */
            date:function (data, attr, element) {
            }

        },

        /**
         * Adiciona ou substitui um método de validação.
         * @param string name Nome do método
         * @param function f Função responsável pela crítica
         */
        setValidationMethod:function (name, f) {
            this.validations[name] = f;
        },


        /**
         * Sequências customizadas de validação.
         * @var function[]
         */
        customValidations:[],

        /**
         * Adiciona uma rotina de validação a ser executada após a rotina normal.
         */
        addCustomValidation:function (f) {
            if (!(f instanceof Function)) {
                this.e('Rotina personizalida de validação inválida. [Function] esperada.')
            }
            this.customValidations.push(f);
        },

        /**
         * Adiciona uma rotina de validação a ser executada após a rotina normal.
         */
        removeCustomValidation:function (f) {
            this.customValidations.remove(f)
        },

        /**
         * Adiciona uma rotina de validação a ser executada após a rotina normal.
         */
        clearCustomValidation:function (f) {
            this.customValidations = [];
        },

        /**
         * Comunicação com o servidor
         */

        /**
         * Interpreta o conjunto de dados enviado pelo servidor, adicionando regras de validação
         * e configurando atributos para elementos do formulário.
         *
         * @param string response Resposta do servidor, codificada em BASE64
         */
        parseServerResponse:function (response) {
            // Esperamos um objeto JSON do servidor
            response = $.parseJSON(Base64.decode(response));
            if (!response) {
                return;
            }

            // Adicionamos as regras dos elementos
            for (var attr in response.attributes) {
                if (!this.getElementAttributes(attr)) {
                    this.setElementAttributes(attr, response.attributes[attr]);
                }
            }

            // Copiamos os valores recebidos
            var values = response['values'];
            var sessionErrors = []
            for (var name in values) {
                if (values[name] instanceof Object) {
                    for (var key in values[name]) {
                        this.setElementValue(name, values[name][key], key)
                    }
                } else {
                    this.setElementValue(name, values[name])
                }
            }

            // Erros alertados pelo servidor
            var errors = response['errors']
            for (var name in errors) {
                // Se o nome do erro é um número, jogamos ele no erro genérico de sessão
                //if (!isNaN(name)) {
                //    $ep.SessionMessages('#session-messages', {error:[errors[name]]})
                //} else {
                this.addError(name, errors[name]);
                //}
            }
            this.renderErrors()
        },

        /**
         * Atributos
         */

        /**
         * Atributos dos elementos do formulário
         * @var string{nome: atributo}
         */
        attrs:{},

        /**
         * Define atributos de um elemento do formulário
         *
         * @param string element Nome do elemento
         * @param string attributes Atributos de validação do elemento
         */
        setElementAttributes:function (element, attributes) {
            this.attrs[element] = this.parseAttributesString(attributes);
        },

        /**
         * Retorna os atributos de um elemento do formulário
         *
         * @param string element Nome do elemento
         * @return string
         */
        getElementAttributes:function (element) {
            return this.attrs[element];
        },

        /**
         * Interpreta a versão literal dos atributos dada e retorna um objeto
         * indexado pelo nome do atributo e com seu respectivo valor
         *
         * @param string str Atributo na forma literal
         */
        parseAttributesString:function (str) {
            var type = str.split(' ', 1)[0];
            var definition = str.substring(type.length + 1);
            var attrs = {}
            if (definition) {
                var re = /([a-z0-9]+)(?:=((?:[^ ]|\\ )*))?/gi;
                var match = null;
                while (match = re.exec(definition)) {
                    attrs[match[1]] = match[2] == undefined ? true : match[2];
                }
            }
            // Keyword reservada
            if (type == 'enum') {
                type = 'enum_'
            }
            attrs['type'] = type;
            return attrs;
        },

        /**
         * Valores
         */

        /**
         * Define um valor para o elemento dado.
         *
         * @param jQuery element
         * @param string value
         * @param int index
         */
        setElementValue:function (element, value, index) {
            element = this.getElement(element, index);
            if (element.size()) {
                if (element.attr('type') == 'radio') {
                    element.removeAttr('checked').filter('[value=' + value + ']').attr('checked', 'checked').change()
                }
                else if (element.attr('type') == 'checkbox') {
                    element.attr('checked', 'checked');
                }
                else {
                    element.val(value);
                    element.change();
                }
            }
        },

        /**
         * Erros
         */

        /**
         * Associações de erro e elemento
         */
        errors:{},

        /**
         * Adiciona um erro associando-o a um elemento do formulário.
         * @param string element Nome do elemento
         * @param string error Descrição do erro
         */
        addError:function (element, error) {
            this.errors[element] = error;
        },

        /**
         * Limpa os erros, de um ou de todos elementos
         * @param null|string element Nome do elemento ou nulo, para todos
         */
        clearErrors:function (element) {
            if (element) {
                delete this.errors[element];
            } else {
                this.errors = {};
            }
        },

        /**
         * Indica se há erros no objeto
         */
        hasErrors:function () {
            for (var i in this.errors) {
                return true
            }
            return false
        },

        /**
         * Exibe o estado de erro atual
         */
        renderErrors:function () {
            var validator = this;
            for (var name in this.errors) {
                // Buscamos primeiramente o placeholder
                var element = this.getErrorPlaceholder(name);
                if (element) {
                    this.renderElementError(name, element);
                } else {
                    element = this.getElement(name);
                    if (element) {
                        this.renderElementError(element);
                    }
                }
            }
        },

        /**
         * Retorna o elemento placeholder de erro com o nome dado.
         */
        getErrorPlaceholder:function (name) {
            var o = $('[error-placeholder="' + name + '"]');
            return o.size() ? o : null;
        },

        /**
         * Exibe o estado de erro atual de um elemento
         */
        renderElementError:function (name, element) {
            if (!element){
                element = name;
                name  = element.attr('name');
            }
            if (element.attr('type') == 'hidden' || element.css('display') == 'none') {
                return;
            }
            if (this.errors[name]) {
                this.showElementError(name, element, this.errors[name])
            } else {
                this.removeElementError(name, element, this.errors[name])
            }
        },


        /**
         * Referência aos descritores de erros renderizados.
         * @var jQuery[]
         */
        error_descriptors:{},

        /**
         * Exibe o estado de erro de um elemento dado
         * @param jQuery element
         * @param string error Erro do elemento
         */
        showElementError:function (name, element, error) {

            // Criamos o descritor de erros
            var error_dom = null;

            // Input
            if (element.attr('tagName') == 'INPUT') {

                if (this.error_descriptors[name]) {
                    error_dom = this.error_descriptors[name];
                    error_dom.text(error);
                    error_dom.show()
                } else {
                    error_dom = $("<span class='validation-error-desc validation-error-desc_" + name + "'>" + error + "</span>");
                    this.error_descriptors[name] = error_dom;
                }

                // Posicionamento avançado do descritor
                element.addClass('validation-error').after(error_dom);
                var position = element.attr('validation-error-pos')
                if (position == 'right') {
                    error_dom.css('top', element.offset().top).css('left', element.offset().left + element.width() + 3)
                } else {
                    error_dom.css('top', element.offset().top + element.height() + 3).css('left', element.offset().left)
                }
            }
            // Placeholders
            else {
                element.text(error);
                element.show();
            }
        },

        /**
         * Remove o estado de erro de um elemento dado
         * @param jQuery element
         * @param string error Erro do elemento
         */
        removeElementError:function (name, element, error) {
            if (element.attr('tagName') == 'INPUT') {
                element.removeClass('validation-error');
                if (this.error_descriptors[name]) {
                    this.error_descriptors[name].hide();
                }
            } else {
                element.hide();
            }
        }
    }

    /**
     * Expressão para decoficar atributos
     */
        //plugin.parse_param_regepx =

    $e.registerPlugin("FormValidator", plugin)

})(window, window.Exile, window.jQuery);