/**
 * User: Guilherme
 * Date: 18/09/11
 * Time: 22:03
 *
 * Plugin para carregar imagens antes de serem efetivamente usadas pelo navegador.
 */
(function($e,$){
    /**
     * @param array urls URLs das imagens a serem carregadas.
     */
    var plugin = function(urls){

        // array com as imagens sendo carregadas
        var imagesHash = {},
            images = [],
            loadedImages = [],
            _onloadCallback,
            _this = this;

        /**
         * Retorna as imagens carregadas.
         */
        this.getImages = function(){
            return images;
        };

        /**
         * Retorna o total de imagens carregadas.
         */
        this.getLoadedCount = function(){
            return loadedImages.length;
        };

        /**
         * Carrega um URL dado.
         * @param string url URL da imagem a ser carregada.
         * @param function onload Função a ser chamada quando o elemento for carregado.
         */
        this.load = function(url,onload){
            var img = document.createElement("img");
            var index = images.length;
            var event = {
                index: index,
                imageLoader: this,
                img: img,
                url: url
            };
            img.onload = function(){
                loadedImages.push(img);
                if(onload)
                    onload(event);
                _this.dispatchEvent(_this.ev.ONE_LOADED,event)
            };
            img.src = url;
            images.push(img)
        }

    };

    /**
     * Eventos
     */
    plugin.prototype.events = {
        // O looper parou
        ONE_LOADED: 1,
        // Todas as imagens foram carregadas.
        ALL_LOADED: 2
    };

    $e.registerPlugin("ImageLoader",plugin)
})(window.Exile, window.jQuery);