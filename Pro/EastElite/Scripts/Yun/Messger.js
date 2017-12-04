///分页检索
///参数pageIndex：页码
function Query(pageIndex) {
    var values = ["MassgeName", "MassgeNote", "MassgeCreateTime", "状态", "操作"];//列对应的字段值
    var postUrl = '/Messger/GetManageList';
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
    var str = "<td align=\"center\">";
    if (model.MassgeType == "1001") {
        str += "无";
    } else {
        if (model.MassgeState == false) {
            str += "<span class='btn btn-primary' style=\"color:#fff;\" onclick=\"Laryer('同意','Examine','" + model.GroupId + "','" + model.MassgeSendUserId + "','" + model.Id + "','True')\">同意</span>";
            str += "<span class='btn btn-primary' style=\"color:#fff;\" onclick=\"Laryer('不同意','Examine','" + model.GroupId + "','" + model.MassgeSendUserId + "','" + model.Id + "','False')\">不同意</span>";
        } else {
            if (model.MassgeExamineState) {
                str += "已同意";
            } else {
                str += "已拒绝";
            }
        }
    }
    str += "</td>";
    return str;
}
function SetState(model) {
    var str = "<td align=\"center\">";
    if (model.MassgeState == false) {
        str += "未执行";
    } else {
        str += "已执行";
    }
    str += "</td>";
    return str;
}
function Examine(GroupId, MassgeSendUserId, Id, State) {
    DFBGFlie.Flie.FlieOperation.AjaxHtml("/UserGroup/GroupExamine", { GroupId: GroupId, UserId: MassgeSendUserId, Id: Id, State: State }, function (data) {
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
