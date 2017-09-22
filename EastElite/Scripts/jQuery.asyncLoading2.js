(function ($) {
    //alert($.fn.scrollLoading);
    $.fn.scrollLoading = function (options) {
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
            var node = $(this).children("img")[0].nodeName.toLowerCase();
            var url = $(this).children("img").attr(params["attr"]);
            var Img = $(this).children("img");

            if (!url) {
                return;
            }
            var data = {
                obj: $(this),
                tag: node,
                url: url,
                img:Img
            };
            params.cache.push(data);
        });

        var loading = function () {
            var st = $(".module-timeline").scrollTop(), sth = st + $(".module-timeline").height();
            $.each(params.cache, function (i, data) {
                var o = data.obj, tag = data.tag, url = data.url, img = data.img;
                if (o) {
                    post = o.position().top; posb = post + o.height();
                    if ((post > st && post < sth) || (posb > st && posb < sth)) {
                        if (tag === "img") {
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
        $(".module-timeline").scroll(function () {
            loading();
        });
    }
})(jQuery);