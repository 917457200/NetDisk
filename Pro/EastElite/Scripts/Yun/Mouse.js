(function (w) {
    var dqMouse = function (obj) {
        // 函数体
        return new dqMouse.fn.init(obj);
    }
    dqMouse.fn = dqMouse.prototype = {
        // 扩展原型对象
        obj: null,
        dqMouse: "1.0.0",
        init: function (obj) {
            this.obj = obj;
            return this;
        },
        contains: function (a, b) {
            return a.contains ? a != b && a.contains(b) : !!(a.compareDocumentPosition(b) & 16);
        },
        getRelated: function (e) {
            var Browser =$.Browser();
            if (Browser == "IE") {
               e = window.event;
            }
            var related;
            var type = e.type.toLowerCase();//这里获取事件名字
            if (type == 'mouseover') {
                related = e.relatedTarget || e.fromElement
            } else if (type = 'mouseout') {
                related = e.relatedTarget || e.toElement
            }
            return related;
        },
        over: function (fn) {
            var obj = this.obj;
            var _self = this;
            obj.onmouseover = function (e) {
                var Browser = $.Browser();
                if (Browser == "IE") {
                    e = window.event;
                }
                var related = _self.getRelated(e);
                if (this != related && !_self.contains(this, related)) {
                    fn();
                }
            }
            return _self;
        },
        out: function (fn) {
            var obj = this.obj;
            var _self = this;
            obj.onmouseout = function (e) {
                var Browser = $.Browser();
                if (Browser == "IE") {
                    e = window.event;
                }
                var related = _self.getRelated(e);
                if (obj != related && !_self.contains(obj, related)) {
                    fn();
                }
            }
            return _self;
        }
    }
    dqMouse.fn.init.prototype = dqMouse.fn;
    window.dqMouse = window.$$ = dqMouse;
})(window);

(jQuery)(function () {
    DFBG.FlieOAImg.FlieImg.Onload();
    //左右按钮淡入淡出
    var dlgbd = document.getElementById('dlg-bd');
    var showPic = document.getElementById('module-showPic');
 
    $$(showPic).over(function () {
        $(".img-nav").children().fadeIn(500);
    }).out(function () {
        $(".img-nav").children().fadeOut(500);
    });
    $$(dlgbd).over(function () {
        $(".module-thumbnailPic").fadeIn(1000);
    }).out(function () {
        $(".module-thumbnailPic").fadeOut(1000);
    });
    ///关闭按钮事件
    $(".dlg-hd").click(function () {
        DFBGFlie.Flie.FlieOperation.ImgShow();
    });
   
    //向右展开事件
    $(".retract").click(function () {
        $(this).toggleClass("retract-icon-hide");
        var MoveWidth = 0;
        if (!$(this).hasClass("retract-icon-hide")) {
            MoveWidth = 253;
        }
        $(".module-picPreviewAside").animate({ "width": MoveWidth + "px" }, 1000, function () {
            DFBG.FlieOAImg.FlieImg.Onload();
        });
    });
    $(".img-nav-left").click(function () {
        var fileid = $.toString($("#viewpic-image").attr("fileid"));
        var parentFileId = $.toString($("#viewpic-image").attr("Pfileid"));
        DFBG.FlieOAImg.FlieImg.PreArrow(fileid, 'left', parentFileId);
    });
    $(".img-nav-right").click(function () {
        var fileid =$.toString($("#viewpic-image").attr("fileid"));
        var parentFileId = $.toString($("#viewpic-image").attr("Pfileid"));
        DFBG.FlieOAImg.FlieImg.PreArrow(fileid, 'right', parentFileId);
    });
    //图片加载
    var Browser = $.Browser();
    if (Browser == "IE") {
        $(".loading-gif").show();
    } else {
        $(".loading-container").show();
    }

    $("#viewpic-image").load(function () {
        DFBG.FlieOAImg.FlieImg.Onload();
        $(this).show();
        $(".loading-container").hide();
        $(".loading-gif").hide();

    });

    //屏幕自适应事件
    window.onresize = function () {
        DFBG.FlieOAImg.FlieImg.Onload();
    }
});