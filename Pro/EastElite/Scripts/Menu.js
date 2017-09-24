
$(function () {
    GetOaMeun();
    $(".nav-header").click(function () {
        if ($(this).hasClass("ojJ55A")) {
            var span = $(this).children("a").children("span").children(".icon");
            $(span).addClass("iconsweets").removeClass("iconswet");
            var siblingsspan = $(this).siblings().children("a").children("span").children(".icon");
            $(siblingsspan).addClass("iconswet").removeClass("iconsweets")
            $(this).addClass("ojJ55A").siblings().removeClass("ojJ55A");
        } else {
            var span = $(this).children("a").children("span").children(".icon");
            $(span).addClass("iconsweets").removeClass("iconswet");
            var siblingsspan = $(this).siblings().children("a").children("span").children(".icon");
            $(siblingsspan).addClass("iconswet").removeClass("iconsweets")
            $(this).addClass("ojJ55A").siblings().removeClass("ojJ55A");
        }
    });
})
function GetOaMeun() {
    var url = "/Ajax/GetOaMeun";
    var par = "";
    EDUCAjax(par, function () {
    },
    function (re) {
        if (undefined != re && re.length > 0) {
            var Str = "";
            for (var i = 0; i < re.length; i++) {
                if (re[i].MenuCode.length == 2) {
                    if (i == 0) {
                        Str += " <li class=\"nav-header ojJ55A\">";
                    } else {
                        Str += " <li class=\"nav-header \">";
                    }

                    Str += "<a href=\"" + re[i].MenuUrl + "\"  target=\"left\" class=\"dygbw9Bp \">";
                    Str += "<span class=\"text\">";
                    switch (re[i].MenuCode) {
                        case "10":
                            Str += "<span class=\"icon folder iconsweets\"></span>";
                            break;
                        case "20":
                            Str += "<span class=\"icon link iconswet \"></span>";
                            break;
                        case "40":
                            Str += "<span class=\"icon trashcan iconswet\"></span>";
                            break;
                        default:

                    }
                    Str += "<span>" + re[i].MenuName + "</span>";
                    Str += " </span></a>";

                } else if (re[i].MenuCode.length == 4) {
                    Str += " <li class=\"nav-header\">";
                    Str += "<a href=\"" + re[i].MenuUrl + "\" target=\"left\" class=\"dygbw9Bp\">";
                    Str += "<span class=\"text\">";
                    Str += "<span>" + re[i].MenuName + "</span>";
                    Str += " </span></a></li>";
                }
            }
            $(".nav").append(Str);
        }
        else {
            $('.err').show();

        }
    }, url, "json", false, "数据加载中，请耐心等待...", false);
}
function GetManage() {
    var url = "/Messger/GetManage";
    var par = "";
    EDUCAjax(par, function () {
    },
    function (re) {
        if (re.Count > 0) {
            $("#MessgerCount").text("(" + re.Count + ")");
        }
    }, url, "json", false, "数据加载中，请耐心等待...", false);
}