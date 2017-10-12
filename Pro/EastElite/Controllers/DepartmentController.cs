using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace EastElite.Controllers
{
    public class DepartmentController : Controller
    {
        BLL.Cookie GetCookie = new BLL.Cookie();
        BLL.YunFile.MyFile GetFile = new BLL.YunFile.MyFile();
        // GET: /Department/
        public ActionResult Index()
        {
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
            BLL.Cookie.TeUser U = GetCookie.GetUserCookie();
                var UserRole = from b in Db.UserRoleInfo
                               where b.UserId == U.userCode
                               select b;
                Model.UserRoleInfo User = UserRole.FirstOrDefault();

                if( User != null && (User.RoleId == "2" || User.RoleId == "1") )
                {
                    ViewBag.unitCode = U.unitCode;

                    ViewBag.Admin = true;
                }
                else
                {
                    ViewBag.Admin = false;
                }
            }
            return View();

        }
        /// <summary>
        /// 获取部门分享
        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        public ActionResult FileLoad( string FileId, string SearchName, string GroupId )
        {
            BLL.Cookie.TeUser U = GetCookie.GetUserCookie();

            var model = GetFile.ShareDepartmentLoad( FileId, SearchName, U.unitCode );

            return Json( new { model }, JsonRequestBehavior.AllowGet );
        }
    }
}