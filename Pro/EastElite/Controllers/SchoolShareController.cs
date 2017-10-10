using BLL;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity.Infrastructure;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using Web.Core;

namespace EastElite.Controllers
{
    public class SchoolShareController : Controller
    {
        BLL.Cookie GetCookie = new BLL.Cookie();
        BLL.YunFile.MyFile GetFile = new BLL.YunFile.MyFile();
        BLL.ShareList.ShareList ShareK = new BLL.ShareList.ShareList();

        /// <summary>
        /// 学校分享
        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        public ActionResult School()
        {
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                string UserId = GetCookie.GetUserCookie().userCode;
                var UserRole = from b in Db.UserRoleInfo
                               where b.UserId == UserId
                               select b;
                Model.UserRoleInfo User = UserRole.FirstOrDefault();

                if( User != null && User.RoleId == "1" )
                {
                    ViewBag.Admin = true;
                }
                else
                {
                    ViewBag.Admin = false;
                }
                return View();
            }
        }
        /// <summary>
        /// 获取学校分享
        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        public ActionResult FileLoad( string FileId, string SearchName )
        {
            BLL.Cookie.TeUser U = GetCookie.GetUserCookie();

            var model = GetFile.ShareFileLoad( FileId, SearchName );

            return Json( new { model }, JsonRequestBehavior.AllowGet );
        }

        [LoginNeedsFilter( IsCheck = false )]
        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        public ActionResult ShareOne()
        {
            ViewBag.ShareLink = RouteData.Values["id"].ToString();
            ViewBag.IsKey = false;
            ViewBag.IsKeyErr = false;

            StringBuilder script = new StringBuilder();

            string Key = GetCookie.GetCookieToString( ViewBag.ShareLink );
            int Count = 0;
            Model.ShareLinkInfo ShareLinkInfo = ShareK.GetOneShareLinkInfo( RouteData.Values["id"].ToString(), out Count );
            if( ShareLinkInfo == null )
            {
                script.Append( String.Format( "<script>alert('{0}');</script>", "链接不存在或已取消分享！" ) );
                return Content( script.ToString(), "Text/html" );
            }
            if( ShareLinkInfo.ShareType == "public" )
            {
                ViewBag.IsKey = true;
            }
            else
            {
                if( ShareLinkInfo.ShareLinkKey == Key )
                {
                    ViewBag.IsKey = true;
                }
                else
                {
                    if( string.IsNullOrEmpty( Key ) )
                    {
                        ViewBag.IsKeyErr = false;
                    }
                    else
                    {
                        GetCookie.DelCookeis( ViewBag.ShareLink );
                        ViewBag.IsKeyErr = true;
                    }
                }
            }
            Model.YUN_FileInfo File = GetFile.GetModel( int.Parse( ShareLinkInfo.FileId ) );
            ViewBag.Count = Count;
            ViewBag.ShareLinkInfo = ShareLinkInfo;
            DateTime ShiXiao = ShareLinkInfo.ShareTime.Value.AddDays( (double) ShareLinkInfo.ShareValidity );
            if( ShiXiao > DateTime.Now || ShareLinkInfo.ShareValidity == 0 )
            {
                return View( File );
            }
            else
            {

                script.Append( String.Format( "<script>alert('{0}');</script>", "链接已过期" ) );
                return Content( script.ToString(), "Text/html" );
            }
        }
        /// <summary>
        /// 获取我的好友分享数据
        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        [LoginNeedsFilter( IsCheck = false )]
        public ActionResult ShareOneLoad( string FileId )
        {
            string ShareLink = RouteData.Values["id"].ToString();
            string FileIdS = ShareK.GetShareLinkInfo( ShareLink );
            var model = GetFile.MyFriendLoad( FileIdS, FileId );
            if( model.Count > 0 )
            {
                return Json( new { model }, JsonRequestBehavior.AllowGet );
            }
            else
            {
                return Json( new { model }, JsonRequestBehavior.AllowGet );
            }
        }
        /// <summary>
        /// 目录页面
        /// </summary>
        /// <returns></returns>
        public ActionResult SchoolFileMove( string FileId, string ShareTypeId, string GroupOrAgencyId )
        {
            ViewBag.FileId = FileId;
            ViewBag.ShareTypeId = ShareTypeId;
            ViewBag.GroupOrAgencyId = GroupOrAgencyId;

            return View();
        }
        /// <summary>
        /// 分享文件
        /// </summary>
        /// <param name="FileIdList">要移动的文件Id集合</param>
        /// <param name="WhereId">目标文件夹</param>
        /// <returns></returns>
        public string SchoolShareFile( string FileIdList, string WhereId, string ShareTypeId, string GroupOrAgencyId, int? c = 0 )
        {
            if( FileIdList.Contains( "add" ) )
            {
                FileIdList = FileIdList.Replace( "add", "" );
            }
            BLL.Cookie.TeUser U = GetCookie.GetUserCookie();

            List<Model.YUN_FileInfo> YunFileList = GetFile.GetFileByDown( "FileId", FileIdList.Trim( ',' ) );
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                foreach( var item in YunFileList )
                {
                    if( c == 0 )
                    {
                        item.IsShare = true;
                        item.ShareTime = DateTime.Now;
                        item.ShareTypeId = ShareTypeId;
                        DbEntityEntry<Model.YUN_FileInfo> entry = Db.Entry<Model.YUN_FileInfo>( item );
                        entry.State = System.Data.Entity.EntityState.Modified;
                        Db.SaveChanges();
                        c++;
                    }


                    item.ParentFileId = WhereId;
                    item.FileState = true;
                    item.ShareTypeId = ShareTypeId;
                    item.CreateId = "User";
                    item.ShareFileID = item.FileId.ToString();
                    if( GroupOrAgencyId != "" && ShareTypeId == "1003" )
                    {
                        item.ShareGroupId = GroupOrAgencyId;
                    }
                    if( GroupOrAgencyId != "" && ShareTypeId == "1002" )
                    {
                        item.CreateUnitCode = GroupOrAgencyId;
                    }
                    item.IsShare = true;
                    item.ShareTime = DateTime.Now;

                    string FileUrl = item.FileUrl;
                    string FileMapPath = "";
                    GetFile.GetFileMapPath( WhereId, ShareTypeId, ref FileMapPath );
                    FileMapPath = ( FileMapPath == "" ? "" : FileMapPath );
                   
                    item.FileUrl = "/Upload/Yun/" + FileMapPath + "/" + Path.GetFileName( item.FileUrl );

                    item.FileName = GetFile.FileReNameForExit( item.ParentFileId, U.userCode, item.FileName, 0, ShareTypeId, GroupOrAgencyId );

                    //已有文件
                    if( FileHelper.ExitFile( Server.MapPath( item.FileUrl ) ) )
                    {
                        item.FileUrl = "/Upload/Yun/" + FileMapPath + "/" + Guid.NewGuid() + Path.GetExtension( item.FileUrl );
                    }
                    //文件复制
                    FileHelper.CopyFile( Server.MapPath( FileUrl ), Server.MapPath( item.FileUrl ), 1024 * 1024 );

                    int OldId = item.FileId;

                    Db.YUN_FileInfo.Add( item );
                    Db.SaveChanges();

                    if( item.IsFolder == true )
                    {
                        string OldFileMapPath = "";
                        GetFile.GetFileMapPath( item.FileId.ToString(), ShareTypeId, ref OldFileMapPath );
                        if( item.IsFolder == true )
                        {
                            if( !System.IO.Directory.Exists( Server.MapPath( "/Upload/Yun/" + OldFileMapPath ) ) )
                            {
                                //不存在创建文件
                                System.IO.Directory.CreateDirectory( Server.MapPath( "/Upload/Yun/" + OldFileMapPath ) );
                            }
                            List<Model.YUN_FileInfo> DownFileList = GetFile.GetFileByDown( "ParentFileId", OldId.ToString() );
                            for( int i = 0; i < DownFileList.Count; i++ )
                            {
                                SchoolShareFile( DownFileList[i].FileId.ToString(), item.FileId.ToString(), ShareTypeId, GroupOrAgencyId, c );
                            }
                        }
                    }
                }
            }
            return "suc";
        }

    }
}