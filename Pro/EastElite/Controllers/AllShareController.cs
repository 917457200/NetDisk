using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace EastElite.Controllers
{
    public class AllShareController : Controller
    {
        BLL.ShareList.ShareList ShareK = new BLL.ShareList.ShareList();
        // GET: /AllShare/
        public ActionResult ShareList( string FileId, string ShareType )
        {
            ViewBag.FileId = FileId;
            ViewBag.ShareType = ShareType;
            return View();
        }
        public string ShareCreate( string FileIdS, int ShareValidity, string Method )
        {
            string ShareLink = "";
            string ShareLinkKey = "";

            ShareK.LinKCreate( 6 ,out ShareLinkKey);

            FileIdS = FileIdS.Substring( 0, FileIdS.Length - 1 );
            do
            {
                ShareK.LinKCreate( 8, out ShareLink );
            }
            while( ShareK.Exit( ShareLink ) );

            ShareK.Add( FileIdS, ShareValidity, Method, ShareLink, ShareLinkKey );
          
            if( Method == "private" )
            {
                return ShareLink + "|" + ShareLinkKey;
            }
            else
            {
                return ShareLink + "|";
            }

        }
    }
}