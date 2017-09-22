using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Web.Core;

namespace EastElite.Controllers
{
    public class MyFileController : Controller
    {
        BLL.Cookie GetCookie = new BLL.Cookie();
        BLL.YunFile.MyFile GetFile = new BLL.YunFile.MyFile();

        // GET: /MyFile/
        public ActionResult MyFile()
        {
            return View();
        }
        /// <summary>
        /// 获取我的网盘数据
        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        public ActionResult MyFileLoad( string FileId, string SearchName )
        {
            BLL.Cookie.TeUser U = GetCookie.GetUserCookie();

            if( FileId == "0" )
            {
                FileId = "";
            }
            decimal UserSize = GetFile.GetDiskSize( U.userCode );
            var model = GetFile.MyFileLoad( FileId, SearchName, U.userCode );
            if( model.Count > 0 )
            {
                Decimal SumSize = GetFile.GetlistByCode( U.userCode );

                return Json( new { model, SumSize, UserSize }, JsonRequestBehavior.AllowGet );
            }
            else
            {
                return Json( new { model, UserSize }, JsonRequestBehavior.AllowGet );
            }

        }

        /// <summary>
        /// 创建文件夹
        /// </summary>
        /// <param name="ParentFileId"></param>
        /// <param name="FileName"></param>
        /// <returns></returns>
        [LoginNeedsFilter( IsCheck = false )]
        public string AddFile( string ParentFileId, string FileName, string Share )
        {
            string result = "";
            BLL.Cookie.TeUser U = GetCookie.GetUserCookie();
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                ParentFileId = ( ParentFileId == "0" ? "" : ParentFileId );
                string CreateId = "";
                if( !string.IsNullOrEmpty( Share ) )
                {
                    CreateId = "Admin";
                }
                else
                {
                    CreateId = U.userCode;
                }
                string Exit = GetFile.FileExit( ParentFileId, CreateId, FileName, Share );
                
                Model.YUN_FileInfo model = new Model.YUN_FileInfo();
                if( !string.IsNullOrEmpty( Exit ) )
                {
                    model.FileName = Exit;
                }
                else
                {
                    model.FileName = FileName;
                }
                model.FileExtName = "";
                model.FileSizeKb = 0;
                model.FileCreateTime = DateTime.Now;
                model.IsFolder = true;
                model.FileUrl = "";
                model.CreateId = U.userCode;
                model.CreateName = U.userName;
                model.CreateUnitCode = U.unitCode;
                model.ParentFileId = ParentFileId;
                model.FileState = true;
                model.ShareTypeId = Share;
                model.CreateId = CreateId;
                if( !string.IsNullOrEmpty( Share ) )
                {
                    model.IsShare = true;
                    model.ShareTime = DateTime.Now;
                }
                Db.YUN_FileInfo.Add( model );
                int count = Db.SaveChanges();
                if( count > 0 )
                {
                    result = "Suc" + model.FileId.ToString();
                }
                else
                {
                    result = "err";
                }
                return result;
            }
        }
        /// <summary>
        /// 获取我分享的数据
        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        public ActionResult MyShare( string SearchName, int p = 1 )
        {
            BLL.Cookie.TeUser U = GetCookie.GetUserCookie();
            int pageSize = 20;
            string wherestr = " FileState=1 AND IsShare='1' ";
            if( !string.IsNullOrEmpty( SearchName ) )
            {
                wherestr += " and FileName like '%" + SearchName + "%'";
            }
            if( U.userCode != null && U.userCode != "" )
            {
                wherestr += " AND [CreateId] = '" + U.userCode + "'";
            }
            var model = GetFile.MyShareOrDelFileLoad( p, pageSize, wherestr, "IsFolder,FileId" ).ToList();
            ViewBag.max = GetFile.GetCount( wherestr );
            ViewBag.CreateId = U.userCode;
            return View( model );
        }
        /// <summary>
        /// 获取我删除的数据
        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        public ActionResult MyDel( string SearchName, int p = 1 )
        {
            BLL.Cookie.TeUser U = GetCookie.GetUserCookie();
            int pageSize = 20;
            string wherestr = " FileState=0 ";
            if( !string.IsNullOrEmpty( SearchName ) )
            {
                wherestr += " and FileName like '%" + SearchName + "%'";
            }
            if( U.userCode != null && U.userCode != "" )
            {
                wherestr += " AND [CreateId] = '" + U.userCode + "'";
            }
            var model = GetFile.MyShareOrDelFileLoad( p, pageSize, wherestr, "FileDeleteTime" ).ToList();

            ViewBag.max = GetFile.GetCount( wherestr );
            return View( model );
        }
        /// <summary>
        /// 图片，视频，音频，其他，展示
        /// </summary>
        /// <returns></returns>
        public ActionResult MyFileShow()
        {
            return View();
        }
        /// <summary>
        /// 图片，视频，音频，其他，展示
        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        public ActionResult MyFileShowLoad( string Type, string SearchName, int pageSize, int p = 1 )
        {

            string wherestr = " FileState=1 and IsFolder=0  ";
            if( Type == "1" )
            {
                wherestr += " and  FileExtName In('.bmp','.jpeg','.jpg','.gif','.png','.tif','.psd','.dwg')";
            }
            if( Type == "2" )
            {
                wherestr += " and  FileExtName In('.doc','.docx','.xls','.xlsx','.ppt','.xmind','.pptx','.pdf')";
            }
            if( Type == "3" )
            {
                wherestr += " and  FileExtName In('.mp3','.wma','.wav')";
            }
            if( Type == "4" )
            {
                wherestr += " and  FileExtName In('.flv','.mkv','.rmvb','.avi','.swf','.mp4','.wmv','.mpg','.mpeg','.rm')";
            }
            if( Type == "5" )
            {
                wherestr += " and  FileExtName In('.7z','.iso','.zip','.rar')";
            }
            if( !string.IsNullOrEmpty( SearchName ) )
            {
                wherestr += " and FileName like '%" + SearchName + "%'";
            }
            BLL.Cookie.TeUser U = GetCookie.GetUserCookie();
            if( U.userCode != null && U.userCode != "" )
            {
                wherestr += " AND [CreateId] = '" + U.userCode + "'";
            }
            var model = GetFile.MyShareOrDelFileLoad( p, pageSize, wherestr, "FileId" ).ToList();

            int SumCount = GetFile.GetCount( wherestr );

            return Json( new { model, SumCount }, JsonRequestBehavior.AllowGet );
        }
    }
}