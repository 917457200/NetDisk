///分页检索
///参数pageIndex：页码
function Query(pageIndex) {
    var values = ["GroupName", "CreateUserName", "CreateTime", "GroupNote", "操作"];//列对应的字段值
    var postUrl = '/UserGroup/GetGroupList';
    var GroupName = $("#GroupName").val().trim();//处室/教研组
    var UserName = $("#UserName").val().trim();//角色列表
    var strWhere = "";
    if (GroupName != null && GroupName != "")
        strWhere = GroupName;
    if (UserName != null && UserName != "")
        strWhere += "★" + UserName;
    GetData(postUrl, values, pageIndex, strWhere);
}

//设置表格的操作列内的button
//参数model:本行数据
function SetOperate(model) {
    var str = "<td align=\"center\">"
    var UserCode = $("#userCode").val();
    if (model.CreateUserId == UserCode) {
        str += "<a  href=\"/UserGroup/UserGroupAdd?id=" + model.GroupId + "\" ><span class='btn btn-primary' style=\"color:#fff;\">修改</span><\a>";
        str += "<span class='btn btn-primary' style=\"color:#fff;\" onclick=\"Laryer('删除','DelGroup','" + model.GroupId + "')\">删除</span>";

    } else {
        if (model.Examine == null) {
            str += "<span class='btn btn-primary' style=\"color:#fff;\" onclick=\"Laryer('申请加入','Apply','" + model.GroupId + "','" + UserCode + "')\">申请加入</span>";
        } else if (model.Examine == false) {
            str += "<span >您已申请</span>";
        } else if (model.Examine == true) {
            str += "<span >您已在组中</span>";
        }
    }
    str += "</td>";
    return str;
}
function DelGroup(Id) {
    DFBGFlie.Flie.FlieOperation.AjaxHtml("/UserGroup/UserGroupDel", { Id: Id }, function (data) {
        if (data == "Suc") {
            parent.$("#popup_container").fadeOut(500);
            parent.$("#popup_overlay").fadeOut(500);
            parent.$("#popup_container").css("display", "none");
            parent.$("#popup_overlay").css("display", "none");
            parent.$("#popup_container").html("");
            window.location.reload();
        }
    }, false);
}
function RoleShow(UserId) {
    DFBGFlie.Flie.FlieOperation.AjaxHtml("/Role/RoleShow", { UserId: UserId }, function (data) {
        if (data != "") {
            parent.$("#popup_container").html(data);
            $.dingwei('popup_container', 'popup_overlay', 'parent');
        }
    }, true);
}
function Add() {
    var GroupName = $("#GroupName").val();
    if (GroupName == "") {
        alert("用户组名称不能为空");
        return false;
    }
    return true;
}
function delGroupUser(obj) {
    UserCodes2 = $("#UserHid").val();
    var UserCode = $(obj).parent().attr("id").replace("UserSe", "") + "|" + $(obj).parent().text().trim();
   
    if (UserCodes2.indexOf(UserCode) > -1) {
        if (UserCodes2.indexOf(UserCode) == 0 && UserCodes2.indexOf(",") > 0) {
            $('#UserHid').val(UserCodes2.replace(UserCode + ",", ""));
        }
        if (UserCodes2.indexOf(",") == 0 && UserCodes2.indexOf(UserCode) != 0) {
            $('#UserHid').val(UserCodes2.replace("," + UserCode + ",", ""));
        }
        if (UserCodes2.indexOf(",") > 0 && UserCodes2.indexOf(UserCode) > 0) {
            $('#UserHid').val(UserCodes2.replace("," + UserCode, ""));
        }
        if (UserCodes2.indexOf(",") < 0 && UserCodes2.indexOf(UserCode) == 0) {
            $('#UserHid').val(UserCodes2.replace(UserCode, ""));
        }
    }
    $(obj).parent().remove();
}
function AddUserLaryer() {
    var Html = "";
    Html += "<div style=\"overflow: hidden; height: 400px; width: 700px; border: 1px solid #b4cdec;border-radius:5px;\">";
    Html += "<span class=\"icon-fullscreen1\" onclick=\"$.closezhezhao('popup_container','popup_overlay')\"></span>";
    Html += "<div class=\"widgettitle\">";
    Html += "人员选择";
    Html += "</div>";
    Html += "<div style=\"background-color:#fff\">";
    Html += "<div style=\"height: 22px; line-height: 22px; padding:5px 0px 5px 20px; border-bottom: 1px solid #b4cdec\">";
    Html += "<span class=\"db-inline\">处室/教研组</span>";
    Html += " <select class=\"db-inline\" id=\"AgencyList\" style=\"border: 1px solid #b4cdec;margin-left:10px; height:22px; line-height:20px;\">";
    Html += "<option value=\"\">--请选择--</option>";
    Html += "</select>";
    Html += "<span class=\"db-inline\" style=\" margin-left: 10px;\">教师姓名</span>";
    Html += "<input class=\"db-inline\" type=\"text\" style=\" margin-left:10px; border: 1px solid #b4cdec\" placeholder=\"输入教师姓名\" id=\"UserName\">";
    Html += "<div class=\"btn db-inline\" onclick=\"GetUser()\" style=\" width:50px; height:13px;line-height:13px;\">查询</div>";
    Html += "</div>";
    Html += "<div id=\"UserList\" style=\"height:315px; overflow-y:auto;padding:5px\">";
    Html += "</div>";
    Html += "</div>";
    Html += "</div>";
    $("#popup_container").append(Html);
    GetUser();
    DFBGFlie.Flie.FlieOperation.AjaxList("/Role/GetAgencyCodeNameList", {}, function (data) {
        var datalist = data.AgencyList;
        var AgencyList = $("#AgencyList")
        for (var i = 0; i < datalist.length; i++) {
            AgencyList.append("  <option value=\"" + datalist[i].AgencyCode + "\">" + datalist[i].RootName + "-" + datalist[i].AgencyName + "</option>");
        }
    }, true);
    $.dingwei('popup_container', 'popup_overlay');

}
function GetUser() {
    var AgencyName = $("#AgencyList").val();
    var UserName = $("#UserName").val();
    var UserList = $("#UserList");
    var UserCodes = $("#UserHid").val();
    UserList.children().remove();
    DFBGFlie.Flie.FlieOperation.AjaxList("/UserGroup/GetUserlist", { AgencyName: AgencyName, UserName: UserName }, function (data) {
        var model = data.model;
        UserList.append("<div Id=\"All\" class=\"btn userGroup\" onclick=\"AddAllUser()\">全选<span onclick=\"AddAllUser()\"><img src=\"/Content/Img/UserAdd.png\" /></span></div>");
        for (var i = 0; i < model.length; i++) {
            if (UserCodes.indexOf(model[i].StaffCode) > -1) {
                UserList.append("<div Id=\"User" + model[i].StaffCode + "\" class=\"btn userGroup\" onclick=\"AddUser('" + model[i].StaffCode + "','" + model[i].StaffName + "')\">" + model[i].StaffName + "<span onclick=\"AddUser('" + model[i].StaffCode + "','" + model[i].StaffName + "')\"><img src=\"/Content/Img/Usercha.png\" /></span></div>");
            } else {
                UserList.append("<div Id=\"User" + model[i].StaffCode + "\" class=\"btn userGroup\" onclick=\"AddUser('" + model[i].StaffCode + "','" + model[i].StaffName + "')\">" + model[i].StaffName + "<span  onclick=\"AddUser('" + model[i].StaffCode + "','" + model[i].StaffName + "')\"><img src=\"/Content/Img/UserAdd.png\" /></span></div>");
            }
        }
    }, true);
}
function AddUser(UserCode, UserName) {
    var UserCodes = $("#UserHid").val();
    var Value = UserCode + "|" + UserName;
    if (UserCodes.indexOf(Value) > -1) {
        if (UserCodes.indexOf(Value) == 0 && UserCodes.indexOf(",") > 0) {
            $('#UserHid').val(UserCodes.replace(Value + ",", ""));
        }
        if (UserCodes.indexOf(",") == 0 && UserCodes.Value(Value) != 0) {
            $('#UserHid').val(UserCodes.replace("," + UserCode + ",", ""));
        }
        if (UserCodes.indexOf(",") > 0 && UserCodes.indexOf(Value) > 0) {
            $('#UserHid').val(UserCodes.replace("," + Value, ""));
        }
        if (UserCodes.indexOf(",") < 0 && UserCodes.indexOf(Value) == 0) {
            $('#UserHid').val(UserCodes.replace(Value, ""));
        }
        $("#UserSe" + UserCode).remove();
        $("#User" + UserCode).children().children("img").attr("src", "/Content/Img/UserAdd.png");
    } else {

        $("#UserHid").val(UserCodes + Value + ",");

        $(".UserSelect").append("<div class=\"btn userGroup2\" id=\"UserSe" + UserCode + "\">" + UserName + "<span onclick=\"delGroupUser(this)\"><img src=\"/Content/Img/Usercha.png\" /></span></div>");
        $("#User" + UserCode).children().children("img").attr("src", "/Content/Img/Usercha.png");
    }
}
function AddAllUser() {
    var UserCodes = $("#UserHid").val();
    var Group = $(".userGroup");
    var Allchenk = $("#All");
    if (Allchenk.hasClass("Ture")) {
        for (var i = 1; i < Group.length; i++) {
            var UserCode = $(Group[i]).attr("id").replace("User", "");
            var UserName = $(Group[i]).text();
            var Value = UserCode + "|" + UserName;
            UserCodes2 = $("#UserHid").val();
            if (UserCodes2.indexOf(UserCode) > -1) {
                if (UserCodes2.indexOf(Value) == 0 && UserCodes2.indexOf(",") > 0) {
                    $('#UserHid').val(UserCodes2.replace(Value + ",", ""));
                }
                if (UserCodes2.indexOf(",") == 0 && UserCodes2.indexOf(Value) != 0) {
                    $('#UserHid').val(UserCodes2.replace("," + Value + ",", ""));
                }
                if (UserCodes2.indexOf(",") > 0 && UserCodes2.indexOf(Value) > 0) {
                    $('#UserHid').val(UserCodes2.replace("," + Value, ""));
                }
                if (UserCodes2.indexOf(",") < 0 && UserCodes2.indexOf(Value) == 0) {
                    $('#UserHid').val(UserCodes2.replace(Value, ""));
                }
            }
            $("#UserSe" + UserCode).remove();
            $("#User" + UserCode).children().children("img").attr("src", "/Content/Img/UserAdd.png");
        }
        $("#All").children().children("img").attr("src", "/Content/Img/UserAdd.png");
        Allchenk.removeClass("Ture");
    } else {
        for (var i = 1; i < Group.length; i++) {
            var UserCode = $(Group[i]).attr("id").replace("User", "");
            var UserName = $(Group[i]).text();
            var Value = UserCode + "|" + UserName;
            if (!($('#UserHid').val().indexOf(UserCode) > -1)) {
                if ($('#UserHid').val() == "" || $('#UserHid').val() == null) {
                    $('#UserHid').val(Value + ",");
                } else {
                    $('#UserHid').val($('#UserHid').val() + Value + ",");
                }
                $(".UserSelect").append("<div class=\"btn userGroup2\" id=\"UserSe" + UserCode + "\">" + $(Group[i]).text() + "<span onclick=\"delGroupUser(this)\"><img src=\"/Content/Img/Usercha.png\" /></span></div>");
                $("#User" + UserCode).children().children("img").attr("src", "/Content/Img/Usercha.png");
            }
        }
        $("#All").children().children("img").attr("src", "/Content/Img/Usercha.png");
        Allchenk.addClass("Ture");
    }
}
function Apply(GroupId, UserId) {
    var userName = $("#userName").val();
    DFBGFlie.Flie.FlieOperation.AjaxHtml("/UserGroup/UserGroupExamine", { GroupId: GroupId, UserId: UserId, UserName: userName }, function (data) {
        if (data == "Suc") {
            parent.$("#popup_container").fadeOut(500);
            parent.$("#popup_overlay").fadeOut(500);
            parent.$("#popup_container").css("display", "none");
            parent.$("#popup_overlay").css("display", "none");
            parent.$("#popup_container").html("");
            window.location.reload();
        }
    }, false);
}