using BLL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;

namespace EastElite.Controllers
{
    public class UserGroupController : Controller
    {
        BLL.UserGroup.UserGroup Group = new BLL.UserGroup.UserGroup();
        BLL.Cookie GetCookie = new BLL.Cookie();
        //
        // GET: /UserGroup/
        public ActionResult UserGroupList()
        {
            ViewBag.userCode = GetCookie.GetUserCookie().userCode;
            ViewBag.userName = GetCookie.GetUserCookie().userName;
            return View();
        }
        //添加界面
        public ActionResult UserGroupAdd( int? Id )
        {
            Model.GroupInfo model = new Model.GroupInfo();
            ViewBag.GroupUser = null;
            ViewBag.GroupUserStr = "";

            model = null;
            if( Id != null )
            {
                ViewBag.GroupUser = Group.GetUserGroupInfoList( (int) Id );
                foreach( var item in ViewBag.GroupUser )
                {
                    ViewBag.GroupUserStr = ViewBag.GroupUserStr + item.UserId + "|" + item.UserName + ",";
                }

                model = Group.GetGroupInfoModel( (int) Id );
            }
            return View( model );
        }
        //添加/修改方法
        [HttpPost]
        public ActionResult UserGroupAdd( Model.GroupInfo model )
        {
            BLL.Cookie.TeUser U = GetCookie.GetUserCookie();
            model.CreateUserId = U.userCode;
            model.CreateUserName = U.userName;
            string UserHid = Request.Form["UserHid"];
            if( model.GroupId == 0 )
            {
                model.CreateTime = DateTime.Now;
                int GroupId = Group.AddGroupInfo( model );
                if( UserHid != "" )
                {
                    UserHid = UserHid.Substring( 0, UserHid.Length - 1 );
                    string[] UserCodes = UserHid.Split( ',' );
                    Group.AddGroupUseInfo( UserCodes, GroupId );
                }
            }
            else
            {
                model.CreateTime = model.CreateTime;
                Group.EditGroupInfo( model );
                if( UserHid != "" )
                {
                    UserHid = UserHid.Substring( 0, UserHid.Length - 1 );
                    string[] UserCodes = UserHid.Split( ',' );
                    Group.EditGroupUserInfo( UserCodes, model.GroupId );
                }
            }

            return RedirectToAction( "UserGroupList", "UserGroup" );
        }
        //删除方法
        public string UserGroupDel( int Id )
        {
            if( Group.DelGroupInfo( Id ) )
            {
                return "Suc";
            }
            else
            {
                return "Err";
            }


        }
        /// <summary>
        /// 获取用户组
        /// </summary>
        /// <returns></returns>
        public ActionResult GetGroupList( int pageIndex, string strWhere )
        {
            string GroupName = "", UserName = "";
            if( strWhere != "" )
            {
                string[] str = strWhere.Split( '★' );
                if( strWhere.IndexOf( '★' ) > -1 )
                {
                    GroupName = str[0].ToString();
                    UserName = str[1].ToString();
                }
                else
                {
                    GroupName = str[0].ToString();
                }
            }
            int pageSize = 10;//每页条数
            int Count = 0;//总条数
            string UserCode = GetCookie.GetUserCookie().userCode;
            List<Model.GroupInfo> model = Group.GetGroupInfoList( pageIndex, pageSize, GroupName, UserName, UserCode, ref Count );
            int pageCount = ( Count + pageSize - 1 ) / pageSize;//页码
            return Json( new { model, pageCount, pageIndex }, JsonRequestBehavior.AllowGet );
        }
        /// <summary>
        /// 获取人员
        /// </summary>
        /// <returns></returns>
        public ActionResult GetUserlist( string AgencyName, string UserName )
        {
            DataSetToList List = new DataSetToList();

            EastEliteSMSWS.EastEliteSMSWSSoapClient Service = new EastEliteSMSWS.EastEliteSMSWSSoapClient();
            ( Service.Endpoint.Binding as BasicHttpBinding ).MaxReceivedMessageSize = int.MaxValue;
            ( Service.Endpoint.Binding as BasicHttpBinding ).MaxBufferSize = int.MaxValue;
            string dataSet = Service.GetStaffCodeNameList3( AgencyName, UserName );
            JavaScriptSerializer JSS = new JavaScriptSerializer();

            List<Model.UserInfoList> RoleInfolist = List.JsonToDataSet<Model.UserInfoList>( JSS.DeserializeObject( dataSet ) );
            List<Model.UserInfoList> model = RoleInfolist.ToList();

            return Json( new { model }, JsonRequestBehavior.AllowGet );
        }
        //申请加入
        public string UserGroupExamine( int GroupId, string UserId, string UserName )
        {
            if( Group.UserGroupExamine( GroupId, UserId, UserName ) )
            {
                return "Suc";
            }
            else
            {
                return "Err";
            }
        }
        //审核
        public string GroupExamine( int GroupId, string UserId, int Id, bool State )
        {
            string Rsert = "";
            if( State )
            {
                if( Group.GroupExamineIn( GroupId, UserId, Id ) )
                {
                    Rsert = "Suc";
                }
                else
                {
                    Rsert = "Err";
                }
            }
            else
            {
                if( Group.GroupExamineNotIn( GroupId, UserId, Id ) )
                {
                    Rsert = "Suc";
                }
                else
                {
                    Rsert = "Err";
                }
            }
            return Rsert;
        }
        /// <summary>
        /// 获取用户组
        /// </summary>
        /// <returns></returns>
        public ActionResult GetAllGroupList()
        {
            string UserCode = GetCookie.GetUserCookie().userCode;
            List<Model.GroupInfo> model = Group.GetAllGroupList( UserCode );
            return Json( new { model }, JsonRequestBehavior.AllowGet );
        }
        public ActionResult Share()
        {
            string UserCode = GetCookie.GetUserCookie().userCode;
            ViewBag.List = Group.GetAllGroupList( UserCode );
            return View();
        }
        public ActionResult UserShare( int GroupId )
        {
            var model = Group.GetGroupInfoModel( GroupId );
            return View( model );
        }
        BLL.YunFile.MyFile GetFile = new BLL.YunFile.MyFile();

        public ActionResult UserShareLoad( string FileId, string SearchName, string GroupId )
        {
          
            var model = GetFile.UserShareLoad(GroupId, FileId, SearchName);

            return Json( new { model }, JsonRequestBehavior.AllowGet );
        }
         
    }
}