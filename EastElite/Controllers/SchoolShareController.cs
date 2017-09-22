using BLL;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity.Infrastructure;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace EastElite.Controllers
{
    public class SchoolShareController : Controller
    {
        BLL.Cookie GetCookie = new BLL.Cookie();
        BLL.YunFile.MyFile GetFile = new BLL.YunFile.MyFile();

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
        /// <summary>

        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        public ActionResult ShareDetails( string url )
        {
            string ID = url.Substring( 5, url.Length - 15 );
            string FileId = Server.UrlDecode( Server.UrlDecode( ID ) );
            FileId = FileId.Substring( 0, FileId.Length - 1 );
            if( FileId.Contains( "add" ) )
            {
                FileId = FileId.Replace( "add", "" );
            }
            if( FileId.Split( ',' ).Length > 2 )
            {
                List<Model.YUN_FileInfo> H = GetFile.GetFileListByFileIds( FileId );
                return View( H );
            }
            else
            {
                return RedirectToAction( "ShareOne", new { url = url } );
            }

        }
        /// <summary>

        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        public ActionResult ShareOne( string url )
        {
            string ID = url.Substring( 5, url.Length - 15 );
            string FileId = Server.UrlDecode( Server.UrlDecode( ID ) );
            FileId = FileId.Substring( 0, FileId.Length - 1 );
            if( FileId.Contains( "add" ) )
            {
                FileId = FileId.Replace( "add", "" );
            }
            Model.YUN_FileInfo File = new Model.YUN_FileInfo();
            if( FileId.IndexOf( "," ) > -1 )
            {
                File = GetFile.GetModel( int.Parse( FileId ) );
            }
            else
            {
                File = GetFile.GetModel( int.Parse( FileId ) );
            }
            ViewBag.Te = GetCookie.GetUserCookie();
            return View( File );
        }

        /// <summary>
        /// 目录页面
        /// </summary>
        /// <returns></returns>
        public ActionResult SchoolFileMove( string FileId, string ShareTypeId, string GroupId )
        {
            ViewBag.FileId = FileId;
            ViewBag.ShareTypeId = ShareTypeId;
            ViewBag.GroupId = GroupId;

            return View();
        }
        /// <summary>
        /// 分享文件
        /// </summary>
        /// <param name="FileIdList">要移动的文件Id集合</param>
        /// <param name="WhereId">目标文件夹</param>
        /// <returns></returns>
        public string SchoolShareFile( string FileIdList, string WhereId, string ShareTypeId, string GroupId )
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
                    item.IsShare = true;
                    item.ShareTime = DateTime.Now;
                    item.ShareTypeId = ShareTypeId;
                    DbEntityEntry<Model.YUN_FileInfo> entry = Db.Entry<Model.YUN_FileInfo>( item );
                    entry.State = System.Data.Entity.EntityState.Modified;
                    Db.SaveChanges();

                    item.ParentFileId = WhereId;
                    item.FileState = true;
                    item.ShareTypeId = ShareTypeId;
                    item.CreateId = "User";
                    item.ShareFileID = item.FileId.ToString();
                    if( GroupId!="" )
                    {
                        item.ShareGroupId = GroupId;
                    }
                    item.IsShare = true;
                    item.ShareTime = DateTime.Now;

                    string FileUrl = item.FileUrl;
                    string FileMapPath = "";
                    GetFile.GetFileMapPath( WhereId, ShareTypeId, ref FileMapPath );
                    FileMapPath = ( FileMapPath == "" ? "" : FileMapPath );

                    item.FileUrl = "/Upload/Yun/" + FileMapPath + "/" + Path.GetFileName( item.FileUrl );

                    item.FileName = GetFile.FileReNameForExit( item.ParentFileId, U.userCode, item.FileName, 0, ShareTypeId, GroupId );

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
                                SchoolShareFile( DownFileList[i].FileId.ToString(), item.FileId.ToString(), ShareTypeId, GroupId );
                            }
                        }
                    }
                }
            }
            return "suc";
        }
    }
}