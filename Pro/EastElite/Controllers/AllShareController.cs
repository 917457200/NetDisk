using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace EastElite.Controllers
{
    public class AllShareController : Controller
    {
        //
        // GET: /AllShare/
        public ActionResult ShareList( string FileId, string ShareType )
        {
            ViewBag.FileId = FileId;
            ViewBag.ShareType = ShareType;
            return View();
        }
        public string ShareCreate( string FileIdS, string ShareValidity, string Method )
        {

            return "";
        }
    }
}