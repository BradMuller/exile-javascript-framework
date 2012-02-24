/**
 * User: Guilherme
 * Date: 16/09/11
 * Time: 22:33
 * Plugin de um slideshow de imagens temporizado, com
 * um título e um menu.
 */
(function($e,$,undefined){

    $e.requirePlugin("CollectionWalker");
    $e.requirePlugin("ImageLoader");

    /**
     * Cria uma instância do slideshow de imagens.
     *
     * @param object conf Configurações do slideshow.
     *     images: Vetor de imagens (objetos com url e title)
     *     width,
     *     height,
     *     delay,
     *     appendTo: ID do objeto onde será inserido o slideshow.
     *     transition_delay
     */
    var plugin = function(conf){

        var collection = conf.images,
            id = conf.appendTo,
            walker = new $e.plugins.CollectionWalker(
                {
                    collection:conf.images,
                    delay:conf.delay
                }
            ),
            imageLoader = new $ep.ImageLoader,
            jq_uls,
            jq_slideshow = $('#'+id),
            lastIndex;

        /**
         * Composição DOM
         */
        jq_slideshow.append(
            "<div style='z-index:15' class=title>carregando</div>" +
            "<div class=images style='overflow:hidden;width:"+conf.width+"px;height:"+conf.height+"px;'></div>" +
            "<ul class=menu></ul>"
        );

        /**
         * Popula o menu
         */
        for(var i=0;i<collection.length;i++){
            jq_slideshow.find(".menu").append("<ul class='disabled' index="+i+">"+$e.str_pad(i+1,2,"0",'STR_PAD_LEFT')+"</ul>");
            jq_slideshow.find(".images").append("<img style='position:absolute' src='" + collection[i].url + "' width='" + conf.width + "' height='" + conf.height + "'>");
            imageLoader.load(
                collection[i].url,
                function(e){
                    jq_uls.eq(e.index).removeClass('disabled')
                }
            )
        }
        jq_slideshow.find(".images img").hide();
        /**
         * Ativa as funcionalidades do menu
         */
        jq_uls = jq_slideshow.find(".menu ul");
        jq_uls.hoverclass().click(function(){
                if($(this).hasClass("disabled")){
                    return;
                }
                walker.setIndex($(this).attr('index'))
            }
        );

        /**
         * O índice da imagem variou, ou seja, o canvas
         * deve variar também.
         */
        var _walkerIndexChange_Callback = function(w){
            if (jq_uls.eq(w.getIndex()).hasClass("disabled")){
                w.next();
                return;
            }
            var item = w.getItem();
            jq_slideshow.find(".images img").eq(w.getIndex()).fadeTo(conf.transition_delay,1);
            if (lastIndex!==undefined ){
                jq_slideshow.find(".images img").eq(lastIndex).fadeTo(conf.transition_delay,0)
            }
            jq_slideshow.find(".title").text(item.title);
            jq_uls.removeClass("active").eq(w.getIndex()).addClass("active");
            lastIndex = w.getIndex();
        };

        walker.addEventListener(walker.ev.START,_walkerIndexChange_Callback);
        walker.addEventListener(walker.ev.INDEX_CHANGED,_walkerIndexChange_Callback);

        // Inicia o loop
        if (imageLoader.getLoadedCount()>0){
            walker.run();
        } else {
            imageLoader.addEventListener(imageLoader.ev.ONE_LOADED, function(e){if(imageLoader.getLoadedCount()==1)walker.run()})
        }
    };

    $e.registerPlugin("ImageSlideshow",plugin)
})(window.Exile, window.jQuery);