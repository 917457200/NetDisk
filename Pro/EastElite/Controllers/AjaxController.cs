using BLL;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.ServiceModel;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;

namespace EastElite.Controllers
{
    public class AjaxController : Controller
    {
        BLL.Cookie GetCookie = new BLL.Cookie();

        public ActionResult GetOaMeun(string d, string e)
        {
            GetCookie.ExistCookie();
            //数据库访问模式
            using (Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities())
            {
                string UserId = GetCookie.GetUserCookie().userCode;
                var UserRole = from b in Db.UserRoleInfo
                               where b.UserId == UserId
                               select b;
                Model.UserRoleInfo User = UserRole.FirstOrDefault();

                if( User == null || User.RoleId != "1" )
                {
                    var Menu = from b in Db.MenuInfo
                               where b.MenuCode!="50"
                               orderby b.MenuCode
                               select b;
                    return Json( Menu.ToList(), JsonRequestBehavior.AllowGet );
                }
                else
                {
                    var Menu = from b in Db.MenuInfo
                               orderby b.MenuCode
                               select b;
                    return Json( Menu.ToList(), JsonRequestBehavior.AllowGet );
                }
            }
        }
        public ActionResult GetShare( string d, string e )
        {
            GetCookie.ExistCookie();
            //数据库访问模式
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                var Share = from b in Db.ShareInfo
                           orderby b.ShareTypeId descending
                           select b ;
                return Json( Share.ToList(), JsonRequestBehavior.AllowGet );
            }
        }
        /// <summary>
        ///获取人员分页
        /// </summary>
        /// <param name="pageIndex"></param>
        /// <param name="strWhere"></param>
        /// <returns></returns>
        public ActionResult GetUserList( int pageIndex, string strWhere )
        {
            string SubAgencyCode = "", UserName = "";
            if( strWhere != "" )
            {
                string[] str = strWhere.Split( '★' );
                if( strWhere.IndexOf( '★' ) > -1 )
                {
                    SubAgencyCode = str[0].ToString();
                    UserName = str[1].ToString();
                }
                else
                {
                    SubAgencyCode = str[0].ToString();
                }
            }

            BLL.Cookie.TeUser U = GetCookie.GetUserCookie();

            int pageSize = 10;//每页条数
            int Count = 0;//总条数
            List<Model.UserInfoList> model = WebGetUserList( pageIndex, pageSize, SubAgencyCode, UserName, ref Count );
            int pageCount = ( Count + pageSize - 1 ) / pageSize;//页码
            return Json( new { model, pageCount, pageIndex }, JsonRequestBehavior.AllowGet );
        }

        public List<Model.UserInfoList> WebGetUserList( int pageIndex, int pageSize, string agencyCode, string staffName, ref int Count )
        {
            DataSetToList List = new DataSetToList();

            EastEliteSMSWS.EastEliteSMSWSSoapClient Service = new EastEliteSMSWS.EastEliteSMSWSSoapClient();
            ( Service.Endpoint.Binding as BasicHttpBinding ).MaxReceivedMessageSize = int.MaxValue;
            ( Service.Endpoint.Binding as BasicHttpBinding ).MaxBufferSize = int.MaxValue;
            string dataSet = Service.GetStaffCodeNameList3( agencyCode, staffName );

            JavaScriptSerializer JSS = new JavaScriptSerializer();

            List<Model.UserInfoList> RoleInfolist = List.JsonToDataSet<Model.UserInfoList>( JSS.DeserializeObject( dataSet ) );
            Count = RoleInfolist.Count();
            int startRow = ( pageIndex - 1 ) * pageSize;
            return RoleInfolist.Skip( startRow ).Take( pageSize ).ToList();
        }
     
    }
}