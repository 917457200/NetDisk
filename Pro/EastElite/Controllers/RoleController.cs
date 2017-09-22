using EastElite.SMS.Business.Data;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;

namespace EastElite.Controllers
{
    public class RoleController : Controller
    {
        BLL.Cookie GetCookie = new BLL.Cookie();

        //
        // GET: /Role/
        public ActionResult UserRoleIndex()
        {
            BLL.Cookie.TeUser U = GetCookie.GetUserCookie();

            return View();
        }
        public string GetAgencyCodeNameList()
        {
         
            EastEliteSMSWS.EastEliteSMSWSSoapClient Service = new EastEliteSMSWS.EastEliteSMSWSSoapClient();

            string Josn = Service.GetAgencyCodeNameList();

            return Josn;
        }
        public ActionResult RoleShow( string UserId )
        {
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                var Role = from b in Db.RoleInfo
                           orderby b.RoleId
                           select b;
                var UserRole = from b in Db.UserRoleInfo
                               where b.UserId == UserId
                               select b;

                Model.UserRoleInfo User = UserRole.FirstOrDefault();
                ViewBag.Role = Role.ToList();

                if( User == null )
                {
                    User = new Model.UserRoleInfo();
                    User.RoleId = "2";
                    User.DiskSize = 500;
                    User.UserId = UserId;
                    ViewBag.Exsit = 0;
                    ViewBag.DiskType = 1;
                }
                else
                {
                    if( User.DiskSize > 1024 )
                    {
                        User.DiskSize = Math.Round( ( (decimal) User.DiskSize / (decimal) 1024 ), 2, MidpointRounding.AwayFromZero );
                        ViewBag.DiskType = 2;
                    }
                    else
                    {
                        ViewBag.DiskType = 1;
                    }
                    ViewBag.Exsit = User.Id;
                }
                return View( User );
            }
        }
        public string RoleAdd( string UserId, string Role, string DiskSize, string DiskType, string Exsit )
        {
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                Model.UserRoleInfo User = new Model.UserRoleInfo();

                User.UserId = UserId;
                User.RoleId = Role;
                User.DiskSize = ( DiskType == "1" ? decimal.Parse( DiskSize ) : decimal.Parse( DiskSize ) * 1024 );
                if( Exsit == "0" )
                {
                    Db.UserRoleInfo.Add( User );
                }
                else
                {
                    User.Id = int.Parse( Exsit );
                    DbEntityEntry<Model.UserRoleInfo> entry = Db.Entry<Model.UserRoleInfo>( User );
                    entry.State = System.Data.Entity.EntityState.Modified;
                }
                int Count = Db.SaveChanges();
                if( Count > 0 )
                {
                    return "suc";
                }
                else
                {
                    return "Err";
                }

            }
        }
    }
}