using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Web.Core
{
    public class ImageResult:ActionResult
    {
        public ImageFormat ContentType { get; set; }
        public Image image { get; set; }
        public string SourceName { get; set; }

        public ImageResult(string _SourceName, ImageFormat _ContentType)
        {
            this.SourceName = _SourceName;
            this.ContentType = _ContentType;
        }

        public ImageResult(Image _ImageBytes, ImageFormat _ContentType)
        {
            this.ContentType = _ContentType;
            this.image = _ImageBytes;
        }

        public override void ExecuteResult(ControllerContext context)
        {
            context.HttpContext.Response.Clear();
            context.HttpContext.Response.Cache.SetCacheability(HttpCacheability.NoCache);
            if (ContentType.Equals(ImageFormat.Bmp)) context.HttpContext.Response.ContentType = "image/bmp";
            if (ContentType.Equals(ImageFormat.Gif)) context.HttpContext.Response.ContentType = "image/gif";
            if (ContentType.Equals(ImageFormat.Icon)) context.HttpContext.Response.ContentType = "image/vnd.microsoft.icon";
            if (ContentType.Equals(ImageFormat.Jpeg)) context.HttpContext.Response.ContentType = "image/jpeg";
            if (ContentType.Equals(ImageFormat.Png)) context.HttpContext.Response.ContentType = "image/png";
            if (ContentType.Equals(ImageFormat.Tiff)) context.HttpContext.Response.ContentType = "image/tiff";
            if (ContentType.Equals(ImageFormat.Wmf)) context.HttpContext.Response.ContentType = "image/wmf";
            if (image != null)
            {
                image.Save(context.HttpContext.Response.OutputStream, ContentType);
            }
            else
            {
                context.HttpContext.Response.TransmitFile(SourceName);
            }
        }
    }
}