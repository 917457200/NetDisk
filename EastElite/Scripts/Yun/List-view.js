$(function () {
    var SearchName = $.getQueryStringByName("SearchName");
    SearchName = decodeURI(SearchName);
    $("#SearchId").val(SearchName);
    parent.window.onresize = function () {
        $(".list-view-container2").css("height", $(window).height() - 155);
    }
    $(".list-view-container2").css("height", $(window).height() - 165);
    $("input[type=checkbox][name=cheName]").click(function () {
        var Allchecked = $("input[type=checkbox][name=cheName]:checked");
        if (Allchecked.length > 0) {
            $("#Qushare").show();
        } else {
            $("#Qushare").hide();
        }
    })
    $(".check-icon").click(function () {
        var Allchecked = $("input[type=checkbox][name=cheName]:checked");
        if (Allchecked.length > 0) {
            $("#Qushare").show();
        } else {
            $("#Qushare").hide();
        }
    })
    $(".module-list-view .list-view-item").hover(function () {
        $(this).children(".file-name").children(".operate").toggle();
    });
    if ($(".list-view-item").length > 3) {
        $(".list-view-item:last .operate .menu").css({ "left": "-40px", "top": "-50px" });
    }
})
function SearchFile(type) {
    var Search = $("#SearchId").val();
    var P = $.getQueryStringByName("p");
    if (P == "") {
        P = 1;
    }
    switch (type) {
        case "MyShare":
            window.location.href = "/MyFile/MyShare?SearchName=" + Search + "&p=" + P;
            break;
        case "MyDel":
            window.location.href = "/MyFile/MyDel?SearchName=" + Search + "&p=" + P;
            break;
        default:
    }
}
