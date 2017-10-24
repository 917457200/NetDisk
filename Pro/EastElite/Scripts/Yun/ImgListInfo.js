(function ($) {
    $.fn.Select = function (option) {
        var opt = {}
        opt = $.extend(opt, option);
        var _this = $(this);

        _this.on('mousedown', function (e) {

            _this.find('a').removeClass('item-active');
            var startTop = e.pageY;
            var startLeft = e.pageX;
            var endTop, endLeft;
            var selectBox = $('<div id="select-box"></div>');
            $('body').append(selectBox);
            selectBox.css({ 'position': 'absolute', 'top': startTop + 'px', 'left': startLeft + 'px', 'background': '#8bbff9', 'transition': 'all 0s', 'width': 0, 'height': 0, 'z-index': 10, 'opacity': '0.5', 'filter': 'alpha(opacity = 50)', 'border': ' 1px solid #1362b4' });

            $(document).on('mousemove', function (e) {
                e.preventDefault();
                endTop = e.pageY;
                endLeft = e.pageX;
                if (e.pageY - startTop > 0 && e.pageX - startLeft > 0) {
                    var height = e.pageY - startTop;
                    var width = e.pageX - startLeft;
                    selectBox.css({
                        'width': width + 'px',
                        'height': height + 'px'
                    })
                } else if (e.pageY - startTop < 0 && e.pageX - startLeft < 0) {
                    var height = -(e.pageY - startTop);
                    var width = -(e.pageX - startLeft);
                    selectBox.css({
                        'width': width + 'px',
                        'height': height + 'px',
                        'top': e.pageY + 'px',
                        'left': e.pageX + 'px'
                    })
                } else if (e.pageY - startTop > 0 && e.pageX - startLeft < 0) {
                    var height = (e.pageY - startTop);
                    var width = -(e.pageX - startLeft);
                    selectBox.css({
                        'width': width + 'px',
                        'height': height + 'px',
                        'top': startTop + 'px',
                        'left': e.pageX + 'px'
                    })
                } else if (e.pageY - startTop < 0 && e.pageX - startLeft > 0) {
                    var height = -(e.pageY - startTop);
                    var width = (e.pageX - startLeft);
                    selectBox.css({
                        'width': width + 'px',
                        'height': height + 'px',
                        'top': e.pageY + 'px',
                        'left': startLeft + 'px'
                    })
                }
                _this.children(".empty-time").find('a').each(function () {
                    if ((startLeft < $(this).offset().left + $(this).width() && $(this).offset().left < endLeft && $(this).offset().top < endTop && $(this).offset().top + $(this).height() > startTop && (e.pageY - startTop > 0 && e.pageX - startLeft > 0)) ||
                        (endLeft < $(this).offset().left + $(this).width() && $(this).offset().left < startLeft && $(this).offset().top < startTop && $(this).offset().top + $(this).height() > endTop && (e.pageY - startTop < 0 && e.pageX - startLeft < 0)) ||
                        (endLeft < $(this).offset().left + $(this).width() && $(this).offset().left < startLeft && $(this).offset().top < endTop && $(this).offset().top + $(this).height() > startTop && (e.pageY - startTop > 0 && e.pageX - startLeft < 0)) ||
                        (startLeft < $(this).offset().left + $(this).width() && $(this).offset().left < endLeft && $(this).offset().top < startTop && $(this).offset().top + $(this).height() > endTop && (e.pageY - startTop < 0 && e.pageX - startLeft > 0))) {
                        if ($(this).parent().css("display") != "none") {
                            $(this).addClass('item-active');
                        }
                        return;
                    } else {
                        $(this).removeClass('item-active');
                    }
                });
            })
            $(document).on('mouseup', function () {
                $('#select-box').remove();
                $(document).unbind('mousemove');
                DFBGFlie.Flie.FlieOperation.isSelect();
            })
        });

    }
})(jQuery)
function showTime(YearS, Moth) {
    var obj = $(".timeline-item");
    var Html = "";
    var time = YearS + "" + (parseInt(Moth) > 9 ? Moth : "0" + Moth) + "01";
    if (YearS == "" && Moth == "") {
        obj.html("<div class=\"aGMvFtb\"><div class=\"hqvyGW05 wegnv3JM\"><p class=\"ggEQwFb\"> 您还没上传过图片哦</p></div></div>");
        return;
    }
    DFBGFlie.Flie.FlieOperation.AjaxList("../Details/GetImgTitleInfo", { time: time }, function (data) {
        if (data.ImgTitleInfoList != null) {
            for (var i = 0; i < data.ImgTitleInfoList.length; i++) {
                var datatime = data.ImgTitleInfoList[i].CreateUnitCode.replace("年", "").replace("月", "").replace("日", "");
                Html += "<div class=\"timeline-title global-clearfix\">";
                Html += "<span class=\"timeline-day\">" + data.ImgTitleInfoList[i].CreateUnitCode + "</span>";
                Html += "<span class=\"global-icon-down\"></span>";
                Html += "<span class=\"timeline-days-num\" id=\"days-num" + datatime + "\"></span>张";
                Html += "<div class=\"timeline-checkall\">";
                Html += " <a class=\"global-icon global-icon-checkbox\"></a>";
                Html += "<span class=\"icon checksmall-icon\">";
                Html += "</span>";
                Html += " <label>全选</label>";
                Html += " </div>";
                Html += "</div>";
                Html += "<div id=\"data" + datatime + "\" class=\"timeline-content global-clearfix list-content\">";
               
                Html += "</div>";
                Html += "<div class=\"daysMore daysMore" + datatime + "\" ></div>";
                obj.html(Html);
                GetImgListInfo(datatime,1);
            }
            $(".operate-select-box").click(function (e) {
                $(this).parent().css("display", "none");
                $(".item-active").removeClass("item-active");
            })
            
            $(".timeline-checkall").on("mousedown", function (e) {
                e.preventDefault();
                e.stopPropagation();//阻止事件冒泡即可
                $(this).parent().next().find(".content-item").toggleClass("item-active");
                $(this).parent().toggleClass("on");
                DFBGFlie.Flie.FlieOperation.isSelect();
            })
            $(".timeline-title").on("mousedown", function (e) {
                e.preventDefault();
                if ($(this).children(".global-icon-down").hasClass("global-icon-up")) {
                    $(this).children(".global-icon-down").removeClass("global-icon-up");
                    $(this).next().css("display", "block");
                    $(this).next().next().css("display", "block");
                } else {
                    $(this).children(".global-icon-down").addClass("global-icon-up");
                    $(this).next().css("display", "none");
                    $(this).next().next().css("display", "none");
                }
            })
           
        }
    })
}
function GetImgListInfo(time, idenx) {
    $.ajax({
        type: "POST",
        url: "../Details/GetImgListInfo",
        data: { time: time, idenx: idenx },
        dataType: "json",
        async: true,
        beforeSend: function (XMLHttpRequest) {
        },
        success: function (data) {
            if (data.ImgInfoList != null) {
                var Html = "";
                for (var z = 0; z < data.ImgInfoList.length; z++) {
                    Html += "<a id=\"add" + data.ImgInfoList[z].FileId + "\" onmousedown=\"DFBGFlie.Flie.FlieOperation.FileShowControl('.jpg','" + data.ImgInfoList[z].FileId + "')\"  class=\"timeline-content-item content-item \" href=\"#\" >";
                    Html += " <img class=\"img\" data-url=\"/File/ImgSuoLue?FileId=" + data.ImgInfoList[z].FileId + "\" style=\"visibility: visible; left: -65.5px;top: -1.5px;height:143px;width:256px;\">";
                    Html += " <div class=\"thumb-large\">";
                    Html += " <em class=\"checkbox-item\">";
                    Html += " <span class=\"icon circle-icon\">&#xe93b; </span>";
                    Html += " <span class=\"icon checkgridsmall\">&#xe935; </span>";
                    Html += " </em>";
                    Html += "</div>";
                    Html += "</a>";
                }
                var Nowlength = parseFloat($("#days-num" + time).html() == "" ? 0 : $("#days-num" + time).html()) + parseFloat(data.ImgInfoList.length);
                if (Nowlength < data.Count) {
                    $(".daysMore" + time).html("");
                    $(".daysMore" + time).append("<span class=\"\" onclick=\"GetImgListInfo('" + time + "'," + (idenx + 1) + ")\">点击查看更多</span>");
                } else {
                    $(".daysMore" + time).html("");
                }
                $("#days-num" + time).html(Nowlength);
                $("#data" + time).append(Html);
                $(".checkbox-item").off();
                $(".checkbox-item").mousedown(function (e) {
                    e.preventDefault();
                    e.stopPropagation();//阻止事件冒泡即可
                    $(this).parent().parent().toggleClass("item-active");
                    DFBGFlie.Flie.FlieOperation.isSelect();
                })
                $('.empty-time').Select();
                $("img").load(function () {
                    //图片默认隐藏
                    $(this).hide();
                    //使用fadeIn特效
                    $(this).stop().show();
                });
                // 异步加载图片，实现逐屏加载图片
                $(".content-item").scrollLoading();
            }
        },
        complete: function (XMLHttpRequest, textStatus) {

        },
        error: function (e, x) {
        }
    });
}
