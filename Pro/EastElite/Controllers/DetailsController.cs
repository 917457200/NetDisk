﻿using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;
using Web.Core;
using System.Threading;

namespace EastElite.Controllers
{
    public class DetailsController : Controller
    {
        BLL.YunFile.MyFile GetFile = new BLL.YunFile.MyFile();
        BLL.Cookie Cookie = new BLL.Cookie();
        BLL.YunFile.ImgList ImgBll = new BLL.YunFile.ImgList();

        //
        // GET: /Details/
        /// <summary>
        /// 图片展示
        /// </summary>
        /// <param name="FileId"></param>
        /// <returns></returns>
        [LoginNeedsFilter( IsCheck = false )]

        public ActionResult Img( int FileId, string ParentFileId )
        {
            Model.YUN_FileInfo FileInfo = GetFile.GetModel( FileId );
            if( FileInfo.ParentFileId == "" || FileInfo.ParentFileId == "0" )
            {
                ViewBag.ParentFileName = "无";
            }
            else
            {
                ViewBag.ParentFileName = GetFile.GetFileByUp( "FileId", int.Parse( FileInfo.ParentFileId ) ).FileName;
            }
            ViewBag.ParentFileId = ParentFileId;
            BLL.Cookie.TeUser U = Cookie.GetUserCookie();
            if( U == null )
            {
                ViewBag.CreateId = "";

            }
            else
            {
                ViewBag.CreateId = Cookie.GetUserCookie().userCode;

            }

            using( Bitmap Bitmap = new Bitmap( Server.MapPath( FileInfo.FileUrl ) ) )
            {
                ViewBag.ImgWidth = Bitmap.Width;
                ViewBag.ImgHeight = Bitmap.Height;
                return View( FileInfo );
            }

        }
        /// <summary>
        /// 上下图片
        /// </summary>
        /// <param name="FileId"></param>
        /// <param name="Arrow"></param>
        /// <param name="ParentFileId"></param>
        /// <returns></returns>
        public ActionResult ImgNext( int FileId, string Arrow, string ParentFileId )
        {
            string Swhere = " FileExtName In('.bmp','.jpeg','.jpg','.gif','.png','.tif','.psd','.dwg','.wmf','.tif') and FileState=1";
            if( ParentFileId != "" )
            {
                Swhere += " and  ParentFileId in(" + ParentFileId + ")  ";
            }
            else if( ParentFileId == "0" )
            {
                Swhere += " and  ParentFileId =''";
            }
            else if( ParentFileId == "School0" )
            {
                Swhere += " and  ParentFileId ='School'";
            }

            if( Arrow == "left" )
            {
                Swhere += " and FileId < " + FileId + " order by FileId DESC";
            }
            else
            {
                Swhere += "and FileId > " + FileId + " order by FileId ASC";

            }
            var FileInfo = GetFile.GetImgNextOrUp( Swhere );
            if( FileInfo == null )
            {
                return Json( new { FileInfo }, JsonRequestBehavior.AllowGet );
            }
            else
            {
                using( Bitmap Bitmap = new Bitmap( Server.MapPath( FileInfo.FileUrl ) ) )
                {
                    return Json( new { FileInfo, Bitmap.Width, Bitmap.Height }, JsonRequestBehavior.AllowGet );
                }
            }
        }
        /// <summary>
        /// pdf展示
        /// </summary>
        /// <returns></returns>
        public ActionResult Pdf( int FileId )
        {
            Model.YUN_FileInfo FileInfo = GetFile.GetModel( FileId );

            ViewBag.url = FileInfo.FileUrl;
            return View();
        }
        /// <summary>
        /// Office展示
        /// </summary>
        /// <returns></returns>
        public ActionResult Office( int FileId )
        {
            Model.YUN_FileInfo FileInfo = GetFile.GetModel( FileId );
            //文件名
            string FileName = System.IO.Path.GetFileNameWithoutExtension( Server.MapPath( FileInfo.FileUrl ) );
            //文件名路径
            string ToFileUrl = System.IO.Path.GetDirectoryName( Server.MapPath( FileInfo.FileUrl ) ) + "\\" + FileName;
            //以前的文件拓展名
            string EXT = System.IO.Path.GetExtension( Server.MapPath( FileInfo.FileUrl ) );

            //转成功后的url
            string url = System.IO.Path.GetDirectoryName( FileInfo.FileUrl ) + "\\" + FileName + ".pdf";

            if( !BLL.FileHelper.ExitFile( ToFileUrl + ".pdf" ) )
            {
                switch( EXT )
                {
                    case ".docx":
                    case ".doc":
                    case ".dot":
                    case ".docm":
                        BLL.ToOffice.ConvertWordPdf( Server.MapPath( FileInfo.FileUrl ), ToFileUrl );
                        break;
                    case ".xls":
                    case ".xlsx":
                        BLL.ToOffice.ConvertExlPdf( Server.MapPath( FileInfo.FileUrl ), ToFileUrl );
                        break;
                    case ".ppt":
                    case ".pptx":
                    case ".pptm":
                        BLL.ToOffice.ConvertPPTPDF( Server.MapPath( FileInfo.FileUrl ), ToFileUrl );
                        break;
                    default:
                        break;
                }
            }
            ViewBag.url = url.Replace( "\\", "/" );
            return View();
        }
        /// <summary>
        /// Video展示
        /// </summary>
        /// <returns></returns>
        [LoginNeedsFilter( IsCheck = false )]
        public ActionResult Video( int FileId )
        {
            BLL.VideoConverter Vi = new BLL.VideoConverter();
            Model.YUN_FileInfo FileInfo = GetFile.GetModel( FileId );
            //文件名
            string FileName = System.IO.Path.GetFileNameWithoutExtension( Server.MapPath( FileInfo.FileUrl ) );
            //文件名路径
            string ToFileUrl = System.IO.Path.GetDirectoryName( Server.MapPath( FileInfo.FileUrl ) ) + "\\" + FileName;
            //以前的文件拓展名
            string EXT = System.IO.Path.GetExtension( Server.MapPath( FileInfo.FileUrl ) );

            //转成功后的url
            string url = System.IO.Path.GetDirectoryName( FileInfo.FileUrl ) + "\\" + FileName + ".flv";

            BLL.Cookie.TeUser U = Cookie.GetUserCookie();
            if( U == null )
            {
                ViewBag.CreateId = "";

            }
            else
            {
                ViewBag.CreateId = Cookie.GetUserCookie().userCode;

            }


            if( !BLL.FileHelper.ExitFile( ToFileUrl + ".flv" ) )
            {
                switch( EXT )
                {
                    case ".flv":
                    case ".mp4":
                    case ".mkv":
                    case ".rmvb":
                    case ".avi":
                    case ".swf":
                    case ".wmv":
                    case ".3gp":
                    case ".mpeg":
                    case ".mpg":
                    case ".rm":
                    case ".asf":
                    case ".mov":
                    case ".smi":
                        Thread t = new Thread( new ThreadStart( () =>
                            {
                                Vi.ChangeFile( Server.MapPath( FileInfo.FileUrl ), ToFileUrl, ToFileUrl );
                            } ) );
                        t.Start();
                        break;
                    default:
                        break;

                }
            }

            ViewBag.url = ( System.IO.Path.GetDirectoryName( FileInfo.FileUrl ) + "\\" + FileName + ".jpg" ).Replace( "\\", "/" );
            switch( EXT )
            {
                case ".flv":
                case ".mp4":
                case ".mkv":
                case ".rmvb":
                case ".avi":
                case ".swf":
                case ".wmv":
                case ".3gp":
                case ".mpeg":
                case ".mpg":
                case ".rm":
                case ".asf":
                case ".mov":
                case ".smi":
                    FileInfo.FileUrl = url.Replace( "\\", "/" );
                    break;
                default:
                    break;
            }
            return View( FileInfo );
        }
        /// <summary>
        /// Mp3展示
        /// </summary>
        /// <returns></returns>
        [LoginNeedsFilter( IsCheck = false )]
        public ActionResult Audio( int FileId )
        {
            Model.YUN_FileInfo FileInfo = GetFile.GetModel( FileId );
            BLL.Cookie.TeUser U = Cookie.GetUserCookie();
            if( U == null )
            {
                ViewBag.CreateId = "";

            }
            else
            {
                ViewBag.CreateId = Cookie.GetUserCookie().userCode;

            }
            return View( FileInfo );
        }
        /// <summary>
        /// 目录页面
        /// </summary>
        /// <returns></returns>
        public ActionResult FileMove( string MoveType )
        {
            //MoveType 1复制 2移动
            ViewBag.MoveType = MoveType;
            return View();
        }
        /// <summary>
        /// 目录展示
        /// </summary>
        /// <returns></returns>
        public string folderData( string ParentFileId, string Share, string GroupOrAgencyId )
        {
            BLL.Cookie.TeUser U = Cookie.GetUserCookie();

            DataTable FileInfo = GetFile.GetFileList( ParentFileId, U.userCode, Share, GroupOrAgencyId );
            string FileInfoStr = JsonConvert.SerializeObject( FileInfo );
            return FileInfoStr;
        }
        public ActionResult FileExitForMove()
        {
            return View();
        }
        //相册时间轴
        public ActionResult ImgList()
        {

            ViewBag.Time = ImgBll.ImgDateList( Cookie.GetUserCookie().userCode );

            return View();
        }
        public ActionResult GetImgTitleInfo( string time )
        {
            var ImgTitleInfoList = ImgBll.ImgTitleInfoList( Cookie.GetUserCookie().userCode, time ).ToList();
            return Json( new { ImgTitleInfoList }, JsonRequestBehavior.AllowGet );
        }
        public ActionResult GetImgListInfo( string time, int idenx )
        {
            int Count = ImgBll.ImgInfoListCount( Cookie.GetUserCookie().userCode, time );
            var ImgInfoList = ImgBll.ImgInfoList( idenx, 100, Cookie.GetUserCookie().userCode, time ).ToList();
            return Json( new { ImgInfoList, Count }, JsonRequestBehavior.AllowGet );
        }
    }
}