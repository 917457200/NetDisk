using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace EastElite.Controllers
{
    public class ManageController : Controller
    {
        BLL.Cookie GetCookie = new BLL.Cookie();
        // GET: /Manage/
        public ActionResult Index()
        {
            BLL.Cookie.TeUser U = new BLL.Cookie.TeUser();
            U = GetCookie.GetUserCookie();
            return View( U );
        }
    }
}