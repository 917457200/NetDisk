(function($){
	//alert($.fn.scrollLoading);
	$.fn.scrollLoading = function(options) {
		var defaults = {
			attr: "data-url"
		};
		var params = $.extend(
			{},
			defaults,
			options || {}
		);
		params.cache = [];
		
		$(this).each(function () {
		    var Pic = $(this).children(".FileShow").children("div").children("span")[0];

		    if (Pic.className == "fileicon fileicon-large-pic fileicon-all") {
		        var node = $(this).children(".FileShow").children("div").children("span").children("img")[0].nodeName.toLowerCase();
		        var url = $(this).children(".FileShow").children("div").children("span").children("img").attr(params["attr"]);
		        var Img = $(this).children(".FileShow").children("div").children("span").children("img");
		        if (!url) {
		            return;
		        }
		        var data = {
		            obj: $(this),
		            tag: node,
		            url: url,
		            img: Img
		        };
		        params.cache.push(data);
		    }
        });
		
		var loading = function(){
		    var st = $(".module-grid-view").scrollTop(), sth = st + $(".module-grid-view").height();
			$.each(params.cache, function(i, data){
				var o = data.obj, tag = data.tag, url = data.url ,img =data.img; 
				if(o) {
					post = o.position().top; posb = post + o.height();
					if((post > st && post < sth) || (posb > st && posb < sth)) {
						if(tag === "img") {
						    img.attr("src", url);
						} else {
						    img.load(url);
						    o.show();

						}
						data.obj = null;
					}
				}
			});
			return false;
		};
		
		loading();
		$(".module-grid-view").scroll(function () {
		    loading();
		});
	}
})(jQuery);