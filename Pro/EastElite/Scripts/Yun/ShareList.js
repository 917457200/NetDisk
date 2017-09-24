

function onclickDiscussAdd(Id) {
    window.location.href = "/Discuss/Add?Id=" + Id + "";
}

function onclickDetail(Id) {
    window.location.href = "/Discuss/Detail?Id=" + Id + "";
}

function onclickDownload(Url, Name) {
    //window.location.href = "/file/TxtDownload?path=" + Url + "&FileName=" + Name + "";
    if (Url.length > 0 || Url != "") {
        window.location.href = "/file/TxtDownload?path=" + Url + "&FileName=" + Name + "";
    }
    else {
        alert("文件夹无法直接下载。");
    }
}

//全选方法
function AllCheck() {
    var AllCheckId = document.getElementById("checkAll");//全选按钮id
    var che = document.getElementsByName("cheName");//复选框name值
    if (AllCheckId.checked == true) {
        for (var i = 0; i < che.length; i++) {
            che[i].checked = "checked";
        }
    }
    else {
        for (var i = 0; i < che.length; i++) {
            che[i].checked = false;
        }
    }
}

//验证当前页的复选框是否已经全选
function YzCheAll() {
    //判断当前是否全选，动态给全选框状态
    var list = $("input[type=checkbox][name=cheName]");
    var ListCount = 0;
    for (var i = 0; i < list.length; i++) {
        if (list[i].checked) {
            ListCount++;
        }
    }
    if (list.length != 0) {
        if ((ListCount == list.length)) {
            $("#checkAll").attr("checked", "true");
        } else {
            $("#checkAll").removeAttr("checked");
        }
    }
    else {
        $("#checkAll").removeAttr("checked");
    }

}

//选多个文件下载
function DownFileMore() {
    var FileId = "";
    //获取要下载的文件id
    var list = $("input[type=checkbox][name=cheName]");
    for (var i = 0; i < list.length; i++) {
        if (list[i].checked) {
            FileId += list[i].value + ",";
        }
    }
    if (FileId == "" || FileId == undefined) {
        alert("请选择要分享的文件!");
        return false;
    }
    else {
        window.location.href = "/MyYunFile/DownFileMore?FileIds=" + FileId;
    }
}