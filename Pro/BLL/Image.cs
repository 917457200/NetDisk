using System;
using System.Data;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

namespace BLL
{
    public class ImageShrink
    {

        #region 生成静态缩略图

        public static MemoryStream ShrinkToStream( Image imgSource, int boundWidth, int boundHeight )
        {
            //收缩为静态图片
            ImageFormat iFormat = ImageFormat.Jpeg;
            //透明格式
            if( imgSource.RawFormat.Guid == ImageFormat.Png.Guid
                || imgSource.RawFormat.Guid == ImageFormat.Icon.Guid
                || imgSource.RawFormat.Guid == ImageFormat.Gif.Guid )
            {
                iFormat = ImageFormat.Png;
            }

            Image imgResult = imgSource;
            Bitmap bm = null;
            if( imgSource.Width > boundWidth || imgSource.Height > boundHeight )
            {
                Size sz = CalThumSize( imgSource, boundWidth, boundHeight );
                int width = sz.Width;
                int height = sz.Height;
                Rectangle recResult = new Rectangle( 0, 0, width, height );
                Rectangle recSource = new Rectangle( 0, 0, imgSource.Width, imgSource.Height );
                bm = GetShrinkBmp( imgSource, sz );
                using( Graphics graphic = GetGraphic( bm ) )
                {
                    graphic.DrawImage( imgSource, recResult, recSource, GraphicsUnit.Pixel );//生成缩小图像
                }
                imgResult = bm;
            }

            MemoryStream msResult = new MemoryStream();
            imgResult.Save( msResult, iFormat );

            if( bm != null )
            {
                bm.Dispose();
            }

            msResult.Position = 0;
            return msResult;
        }

        #endregion


        #region 生成gif缩略图
        /// <summary> 
        /// 收缩GIF
        /// </summary> 
        public static MemoryStream ShrinkGifToStream( Image imgSource, int boundWidth, int boundHeight )
        {
            if( imgSource.RawFormat.Guid != ImageFormat.Gif.Guid )
            {
                return null;
            }

            MemoryStream msResult = new MemoryStream();
            if( imgSource.Width <= boundWidth && imgSource.Height <= boundHeight )
            {
                imgSource.Save( msResult, ImageFormat.Gif );
                return msResult;
            }

            Size sz = CalThumSize( imgSource, boundWidth, boundHeight );
            int width = sz.Width;
            int height = sz.Height;
            Rectangle recResult = new Rectangle( 0, 0, width, height );

            Bitmap bmSource = imgSource as Bitmap;
            //新图第一帧  
            Bitmap bmFirstDrawing = GetShrinkBmp( imgSource, sz );
            Graphics graphicFirstDrawing = GetGraphic( bmFirstDrawing );

            //新图其他帧  
            Bitmap bmOtherDrawing = GetShrinkBmp( imgSource, sz );
            Graphics graphicOtherDrawing = GetGraphic( bmOtherDrawing );

            Color cTrans = Color.FromArgb( 0, 0, 0, 0 );
            //遍历维数，其实就一维
            foreach( Guid guid in imgSource.FrameDimensionsList )
            {
                ////因为是GIF文件这里设置为Time  
                ////如果是TIFF这里要设置为PAGE  
                //FrameDimension dimension = FrameDimension.Time;
                FrameDimension dimension = new FrameDimension( guid );
                //获取总帧数  
                int nFrames = imgSource.GetFrameCount( dimension );
                //保存标示参数  
                Encoder encoder = Encoder.SaveFlag;
                //  
                EncoderParameters ep = null;

                Bitmap bmFirstFrame = null;

                OctreeQuantizer qt = new OctreeQuantizer( 255, 8 );

                //if (nFrames==1)
                //{
                //    //将原图第一帧画给新图第一帧                      
                //    graphicFirstDrawing.DrawImage(imgSource, recResult);
                //    //量化图片，避免自带的量化过于失真
                //    bmFirstFrame = qt.Quantize(bmFirstDrawing);
                //    bmFirstFrame.Save(msResult, ImageFormat.Gif);
                //    continue;
                //}


                //每一帧  
                for( int iFrame = 0; iFrame < nFrames; iFrame++ )
                {
                    //////////////////////////////////////
                    //切换到由维度和索引指定的帧 
                    //////////////////////////////////////
                    imgSource.SelectActiveFrame( dimension, iFrame );

                    if( iFrame == 0 )  //第一帧  
                    {
                        //将原图第一帧画给新图第一帧                      
                        graphicFirstDrawing.DrawImage( imgSource, recResult );
                        //量化图片，避免自带的量化过于失真
                        bmFirstFrame = qt.Quantize( bmFirstDrawing );

                        //把振频和透明背景调色板等设置复制给新图第一帧                          
                        bindProperty( imgSource, bmFirstFrame );
                        //第一帧需要设置为MultiFrame  
                        ep = new EncoderParameters( 1 );
                        ep.Param[0] = new EncoderParameter( encoder, (long) EncoderValue.MultiFrame );
                        //保存第一帧  
                        ImageCodecInfo ici = GetEncoder( ImageFormat.Gif ); //图片编码、解码器  
                        bmFirstFrame.Save( msResult, ici, ep );
                    }
                    else //其他帧  
                    {
                        //把原图的其他帧画给新图的其他帧                        
                        graphicOtherDrawing.DrawImage( imgSource, recResult );
                        //量化图片，避免自带的量化过于失真
                        Bitmap bmOtherFrame = qt.Quantize( bmOtherDrawing );
                        //把振频和透明背景调色板等设置复制给新图第一帧  
                        bindProperty( imgSource, bmOtherFrame );
                        //如果是GIF这里设置为FrameDimensionTime  
                        //如果为TIFF则设置为FrameDimensionPage  
                        ep = new EncoderParameters( 1 );
                        ep.Param[0] = new EncoderParameter( encoder, (long) EncoderValue.FrameDimensionTime );
                        //向新图添加一帧  
                        bmFirstFrame.SaveAdd( bmOtherFrame, ep );
                        bmOtherFrame.Dispose();
                    }
                }
                ep = new EncoderParameters( 1 );
                //关闭多帧文件流  
                ep.Param[0] = new EncoderParameter( encoder, (long) EncoderValue.Flush );
                bmFirstFrame.SaveAdd( ep );
                bmFirstFrame.Dispose();
            }

            //释放文件 
            bmFirstDrawing.Dispose();
            bmOtherDrawing.Dispose();
            graphicFirstDrawing.Dispose();
            graphicOtherDrawing.Dispose();
            msResult.Position = 0;
            return msResult;
        }


        #endregion

        #region gif调色板、播放时间设置

        /// <summary>
        /// 
        /// </summary>
        /// <param name="nColors"></param>
        /// <returns></returns>
        static ColorPalette GetColorPalette()
        {
            // Assume monochrome image.
            ColorPalette palette;    // The Palette we are stealing
            Bitmap bitmap = new Bitmap( 1, 1, PixelFormat.Format8bppIndexed );

            palette = bitmap.Palette;   // Grab the palette

            bitmap.Dispose();           // cleanup the source Bitmap

            return palette;             // Send the palette back
        }

        /// <summary>
        /// 生成灰度gif图像，主要包含设置调色板功能
        /// </summary>
        /// <param name="bmSource"></param>
        /// <returns></returns>
        private static Bitmap GetGrayGifFrame( Bitmap bmSource )
        {
            Rectangle rec = new Rectangle( 0, 0, bmSource.Width, bmSource.Height );
            // Always use PixelFormat8bppIndexed because that is the color
            // table-based interface to the GIF codec.
            Bitmap bmResult = new Bitmap( rec.Width,
                                    rec.Height,
                                    PixelFormat.Format8bppIndexed );

            // Create a color palette big enough to hold the colors you want.
            const uint nColors = 256;
            ColorPalette pal = GetColorPalette();

            // Initialize a new color table with entries that are determined
            // by some optimal palette-finding algorithm; for demonstration 
            // purposes, use a grayscale.
            for( uint i = 0; i < nColors; i++ )
            {
                uint Alpha = 0xFF;                      // Colors are opaque.
                uint Intensity = i * 0xFF / ( nColors - 1 );    // Even distribution. 

                // The GIF encoder makes the first entry in the palette
                // that has a ZERO alpha the transparent color in the GIF.
                // Pick the first one arbitrarily, for demonstration purposes.

                if( i == 0 ) // Make this color index...
                    Alpha = 0;          // Transparent

                // Create a gray scale for demonstration purposes.
                // Otherwise, use your favorite color reduction algorithm
                // and an optimum palette for that algorithm generated here.
                // For example, a color histogram, or a median cut palette.
                pal.Entries[i] = Color.FromArgb( (int) Alpha,
                                                (int) Intensity,
                                                (int) Intensity,
                                                (int) Intensity );
            }

            // Set the palette into the new Bitmap object.
            bmResult.Palette = pal;

            // Lock a rectangular portion of the bitmap for writing.
            BitmapData bitmapData = bmResult.LockBits(
                rec,
                ImageLockMode.WriteOnly,
                PixelFormat.Format8bppIndexed );

            // Write to the temporary buffer that is provided by LockBits.
            // Copy the pixels from the source image in this loop.
            // Because you want an index, convert RGB to the appropriate
            // palette index here.
            IntPtr pixels = bitmapData.Scan0;

            unsafe
            {
                // Get the pointer to the image bits.
                // This is the unsafe operation.
                byte* pBits;
                if( bitmapData.Stride > 0 )
                {
                    pBits = (byte*) pixels.ToPointer();
                }
                else
                {
                    // If the Stride is negative, Scan0 points to the last 
                    // scanline in the buffer. To normalize the loop, obtain
                    // a pointer to the front of the buffer that is located 
                    // (Height-1) scanlines previous.
                    pBits = (byte*) pixels.ToPointer() + bitmapData.Stride * ( rec.Height - 1 );
                }
                uint stride = (uint) Math.Abs( bitmapData.Stride );

                for( uint row = 0; row < rec.Height; ++row )
                {
                    for( uint col = 0; col < rec.Width; ++col )
                    {
                        // Map palette indexes for a gray scale.
                        // If you use some other technique to color convert,
                        // put your favorite color reduction algorithm here.
                        Color pixel;    // The source pixel.

                        // The destination pixel.
                        // The pointer to the color index byte of the
                        // destination; this real pointer causes this
                        // code to be considered unsafe.
                        byte* p8bppPixel = pBits + row * stride + col;

                        pixel = bmSource.GetPixel( (int) col, (int) row );

                        // Use luminance/chrominance conversion to get grayscale.
                        // Basically, turn the image into black and white TV.
                        // Do not calculate Cr or Cb because you 
                        // discard the color anyway.
                        // Y = Red * 0.299 + Green * 0.587 + Blue * 0.114

                        // This expression is best as integer math for performance,
                        // however, because GetPixel listed earlier is the slowest 
                        // part of this loop, the expression is left as 
                        // floating point for clarity.

                        double luminance = ( pixel.R * 0.299 ) +
                            ( pixel.G * 0.587 ) +
                            ( pixel.B * 0.114 );

                        // Gray scale is an intensity map from black to white.
                        // Compute the index to the grayscale entry that
                        // approximates the luminance, and then round the index.
                        // Also, constrain the index choices by the number of
                        // colors to do, and then set that pixel's index to the 
                        // byte value.
                        *p8bppPixel = (byte) ( luminance * ( nColors - 1 ) / 255 + 0.5 );

                    } /* end loop for col */
                } /* end loop for row */
            } /* end unsafe */

            // To commit the changes, unlock the portion of the bitmap.  
            bmResult.UnlockBits( bitmapData );

            return bmResult;
        }


        public static Bitmap MakeTransparentGif( Bitmap bitmap, Color color )
        {
            byte R = color.R;
            byte G = color.G;
            byte B = color.B;

            MemoryStream fin = new MemoryStream();
            bitmap.Save( fin, System.Drawing.Imaging.ImageFormat.Gif );

            MemoryStream fout = new MemoryStream( (int) fin.Length );
            int count = 0;
            byte[] buf = new byte[256];
            byte transparentIdx = 0;
            fin.Seek( 0, SeekOrigin.Begin );
            //header
            count = fin.Read( buf, 0, 13 );
            if( ( buf[0] != 71 ) || ( buf[1] != 73 ) || ( buf[2] != 70 ) ) return null; //GIF

            fout.Write( buf, 0, 13 );

            int i = 0;
            if( ( buf[10] & 0x80 ) > 0 )
            {
                i = 1 << ( ( buf[10] & 7 ) + 1 ) == 256 ? 256 : 0;
            }

            for( ; i != 0; i-- )
            {
                fin.Read( buf, 0, 3 );
                if( ( buf[0] == R ) && ( buf[1] == G ) && ( buf[2] == B ) )
                {
                    transparentIdx = (byte) ( 256 - i );
                }
                fout.Write( buf, 0, 3 );
            }

            bool gcePresent = false;
            while( true )
            {
                fin.Read( buf, 0, 1 );
                fout.Write( buf, 0, 1 );
                if( buf[0] != 0x21 ) break;
                fin.Read( buf, 0, 1 );
                fout.Write( buf, 0, 1 );
                gcePresent = ( buf[0] == 0xf9 );
                while( true )
                {
                    fin.Read( buf, 0, 1 );
                    fout.Write( buf, 0, 1 );
                    if( buf[0] == 0 ) break;
                    count = buf[0];
                    if( fin.Read( buf, 0, count ) != count ) return null;
                    if( gcePresent )
                    {
                        if( count == 4 )
                        {
                            buf[0] |= 0x01;
                            buf[3] = transparentIdx;
                        }
                    }
                    fout.Write( buf, 0, count );
                }
            }
            while( count > 0 )
            {
                count = fin.Read( buf, 0, 1 );
                fout.Write( buf, 0, 1 );
            }
            fin.Close();
            fout.Flush();

            return new Bitmap( fout );
        }


        /// <summary> 
        /// 将源图片文件里每一帧的属性设置到新的图片对象里 
        /// </summary> 
        /// <param name="from">源图片帧</param> 
        /// <param name="to">新的图片帧</param> 
        private static void bindProperty( Image from, Image to )
        {
            //这个东西就是每一帧所拥有的属性，可以用GetPropertyItem方法取得这里用为完全复制原有属性所以直接赋值了 

            //顺便说一下这个属性里包含每帧间隔的秒数和透明背景调色板等设置，这里具体那个值对应那个属性大家自己在msdn搜索GetPropertyItem方法说明就有了 
            for( int i = 0; i < from.PropertyItems.Length; i++ )
            {
                var item = from.PropertyItems[i];

                if( item.Id == 20740 && to.Palette.Entries.Length > 0 )
                {
                    item.Value[0] = 0;//默认指定灰度调色板内的第一个颜色为透明色
                    for( int iColor = 0; iColor < to.Palette.Entries.Length; iColor++ )
                    {
                        var c = to.Palette.Entries[iColor];
                        if( c.A == 0 )
                        {
                            item.Value[0] = (byte) iColor;
                            break;
                        }
                    }
                }
                to.SetPropertyItem( item );

            }
        }

        #endregion

        #region 辅助方法

        public static Image Convert( Image imgSource, ImageFormat eImageFormat )
        {
            MemoryStream ms = new MemoryStream();
            imgSource.Save( ms, eImageFormat );
            return Image.FromStream( ms );
        }

        static Graphics GetGraphic( Image img )
        {
            Graphics graphic = Graphics.FromImage( img );
                graphic.SmoothingMode = SmoothingMode.HighQuality;
                graphic.InterpolationMode = InterpolationMode.High;
                graphic.CompositingQuality = CompositingQuality.HighQuality;
                return graphic;
        }

        static Bitmap GetShrinkBmp( Image imgSource, Size sz )
        {
            Bitmap bm = new Bitmap( sz.Width, sz.Height, imgSource.PixelFormat );
            bm.SetResolution( imgSource.HorizontalResolution, imgSource.VerticalResolution );

            return bm;
        }



        /// <summary>
        /// 根据尺寸限制，计算缩略图的不失真尺寸
        /// </summary>
        /// <param name="image"></param>
        /// <param name="boundWidth"></param>
        /// <param name="boundHeight"></param>
        /// <returns></returns>
        static Size CalThumSize( Image image, int boundWidth, int boundHeight )
        {
            if( image.Width <= boundWidth && image.Height <= boundHeight )
            {
                return image.Size;
            }

            int resultWidth = boundWidth;
            int resultHeight = resultWidth * image.Height / image.Width;
            if( resultHeight > boundHeight )
            {
                resultHeight = boundHeight;
                resultWidth = resultHeight * image.Width / image.Height;
                if( resultWidth > boundWidth )
                {
                    resultWidth = boundWidth;
                }
            }

            Size rect = new Size( resultWidth, resultHeight );
            return rect;
        }

        private static ImageCodecInfo GetEncoder( ImageFormat format )
        {

            ImageCodecInfo[] codecs = ImageCodecInfo.GetImageEncoders();

            foreach( ImageCodecInfo codec in codecs )
            {
                if( codec.FormatID == format.Guid )
                {
                    return codec;
                }
            }
            return null;
        }
        #endregion

    }


    #region 量化处理


    /// <summary>
    /// Summary description for Class1.
    /// </summary>
    public unsafe abstract class Quantizer
    {
        /// <summary>
        /// Construct the quantizer
        /// </summary>
        /// <param name="singlePass">If true, the quantization only needs to loop through the source pixels once</param>
        /// <remarks>
        /// If you construct this class with a true value for singlePass, then the code will, when quantizing your image,
        /// only call the 'QuantizeImage' function. If two passes are required, the code will call 'InitialQuantizeImage'
        /// and then 'QuantizeImage'.
        /// </remarks>
        public Quantizer( bool singlePass )
        {
            _singlePass = singlePass;
        }

        /// <summary>
        /// Quantize an image and return the resulting output bitmap
        /// </summary>
        /// <param name="source">The image to quantize</param>
        /// <returns>A quantized version of the image</returns>
        public Bitmap Quantize( Image source )
        {
            // Get the size of the source image
            int height = source.Height;
            int width = source.Width;

            // And construct a rectangle from these dimensions
            Rectangle bounds = new Rectangle( 0, 0, width, height );

            // First off take a 32bpp copy of the image
            Bitmap copy = new Bitmap( width, height, PixelFormat.Format32bppArgb );

            // And construct an 8bpp version
            Bitmap output = new Bitmap( width, height, PixelFormat.Format8bppIndexed );

            // Now lock the bitmap into memory
            using( Graphics g = Graphics.FromImage( copy ) )
            {
                g.PageUnit = GraphicsUnit.Pixel;

                // Draw the source image onto the copy bitmap,
                // which will effect a widening as appropriate.
                g.DrawImageUnscaled( source, bounds );
            }

            // Define a pointer to the bitmap data
            BitmapData sourceData = null;

            try
            {
                // Get the source image bits and lock into memory
                sourceData = copy.LockBits( bounds, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb );

                // Call the FirstPass function if not a single pass algorithm.
                // For something like an octree quantizer, this will run through
                // all image pixels, build a data structure, and create a palette.
                if( !_singlePass )
                    FirstPass( sourceData, width, height );

                // Then set the color palette on the output bitmap. I'm passing in the current palette 
                // as there's no way to construct a new, empty palette.
                output.Palette = this.GetPalette( output.Palette );

                // Then call the second pass which actually does the conversion
                SecondPass( sourceData, output, width, height, bounds );
            }
            finally
            {
                // Ensure that the bits are unlocked
                copy.UnlockBits( sourceData );
            }

            // Last but not least, return the output bitmap
            return output;
        }

        /// <summary>
        /// Execute the first pass through the pixels in the image
        /// </summary>
        /// <param name="sourceData">The source data</param>
        /// <param name="width">The width in pixels of the image</param>
        /// <param name="height">The height in pixels of the image</param>
        protected virtual void FirstPass( BitmapData sourceData, int width, int height )
        {
            // Define the source data pointers. The source row is a byte to
            // keep addition of the stride value easier (as this is in bytes)
            byte* pSourceRow = (byte*) sourceData.Scan0.ToPointer();
            Int32* pSourcePixel;

            // Loop through each row
            for( int row = 0; row < height; row++ )
            {
                // Set the source pixel to the first pixel in this row
                pSourcePixel = (Int32*) pSourceRow;

                // And loop through each column
                for( int col = 0; col < width; col++, pSourcePixel++ )
                    // Now I have the pixel, call the FirstPassQuantize function...
                    InitialQuantizePixel( (Color32*) pSourcePixel );

                // Add the stride to the source row
                pSourceRow += sourceData.Stride;
            }
        }

        /// <summary>
        /// Execute a second pass through the bitmap
        /// </summary>
        /// <param name="sourceData">The source bitmap, locked into memory</param>
        /// <param name="output">The output bitmap</param>
        /// <param name="width">The width in pixels of the image</param>
        /// <param name="height">The height in pixels of the image</param>
        /// <param name="bounds">The bounding rectangle</param>
        protected virtual void SecondPass( BitmapData sourceData, Bitmap output, int width, int height, Rectangle bounds )
        {
            BitmapData outputData = null;

            try
            {
                // Lock the output bitmap into memory
                outputData = output.LockBits( bounds, ImageLockMode.WriteOnly, PixelFormat.Format8bppIndexed );

                // Define the source data pointers. The source row is a byte to
                // keep addition of the stride value easier (as this is in bytes)
                byte* pSourceRow = (byte*) sourceData.Scan0.ToPointer();
                Int32* pSourcePixel = (Int32*) pSourceRow;
                Int32* pPreviousPixel = pSourcePixel;

                // Now define the destination data pointers
                byte* pDestinationRow = (byte*) outputData.Scan0.ToPointer();
                byte* pDestinationPixel = pDestinationRow;

                // And convert the first pixel, so that I have values going into the loop
                byte pixelValue = QuantizePixel( (Color32*) pSourcePixel );

                // Assign the value of the first pixel
                *pDestinationPixel = pixelValue;

                // Loop through each row
                for( int row = 0; row < height; row++ )
                {
                    // Set the source pixel to the first pixel in this row
                    pSourcePixel = (Int32*) pSourceRow;

                    // And set the destination pixel pointer to the first pixel in the row
                    pDestinationPixel = pDestinationRow;

                    // Loop through each pixel on this scan line
                    for( int col = 0; col < width; col++, pSourcePixel++, pDestinationPixel++ )
                    {
                        // Check if this is the same as the last pixel. If so use that value
                        // rather than calculating it again. This is an inexpensive optimisation.
                        if( *pPreviousPixel != *pSourcePixel )
                        {
                            // Quantize the pixel
                            pixelValue = QuantizePixel( (Color32*) pSourcePixel );

                            // And setup the previous pointer
                            pPreviousPixel = pSourcePixel;
                        }

                        // And set the pixel in the output
                        *pDestinationPixel = pixelValue;
                    }

                    // Add the stride to the source row
                    pSourceRow += sourceData.Stride;

                    // And to the destination row
                    pDestinationRow += outputData.Stride;
                }
            }
            finally
            {
                // Ensure that I unlock the output bits
                output.UnlockBits( outputData );
            }
        }

        /// <summary>
        /// Override this to process the pixel in the first pass of the algorithm
        /// </summary>
        /// <param name="pixel">The pixel to quantize</param>
        /// <remarks>
        /// This function need only be overridden if your quantize algorithm needs two passes,
        /// such as an Octree quantizer.
        /// </remarks>
        protected virtual void InitialQuantizePixel( Color32* pixel )
        {
        }

        /// <summary>
        /// Override this to process the pixel in the second pass of the algorithm
        /// </summary>
        /// <param name="pixel">The pixel to quantize</param>
        /// <returns>The quantized value</returns>
        protected abstract byte QuantizePixel( Color32* pixel );

        /// <summary>
        /// Retrieve the palette for the quantized image
        /// </summary>
        /// <param name="original">Any old palette, this is overrwritten</param>
        /// <returns>The new color palette</returns>
        protected abstract ColorPalette GetPalette( ColorPalette original );

        /// <summary>
        /// Flag used to indicate whether a single pass or two passes are needed for quantization.
        /// </summary>
        private bool _singlePass;

        /// <summary>
        /// Struct that defines a 32 bpp colour
        /// </summary>
        /// <remarks>
        /// This struct is used to read data from a 32 bits per pixel image
        /// in memory, and is ordered in this manner as this is the way that
        /// the data is layed out in memory
        /// </remarks>
        [StructLayout( LayoutKind.Explicit )]
        public struct Color32
        {
            /// <summary>
            /// Holds the blue component of the colour
            /// </summary>
            [FieldOffset( 0 )]
            public byte Blue;
            /// <summary>
            /// Holds the green component of the colour
            /// </summary>
            [FieldOffset( 1 )]
            public byte Green;
            /// <summary>
            /// Holds the red component of the colour
            /// </summary>
            [FieldOffset( 2 )]
            public byte Red;
            /// <summary>
            /// Holds the alpha component of the colour
            /// </summary>
            [FieldOffset( 3 )]
            public byte Alpha;

            /// <summary>
            /// Permits the color32 to be treated as an int32
            /// </summary>
            [FieldOffset( 0 )]
            public int ARGB;

            /// <summary>
            /// Return the color for this Color32 object
            /// </summary>
            public Color Color
            {
                get { return Color.FromArgb( Alpha, Red, Green, Blue ); }
            }
        }
    }
    /// <summary>
    /// Summary description for PaletteQuantizer.
    /// </summary>
    public unsafe class PaletteQuantizer : Quantizer
    {
        /// <summary>
        /// Construct the palette quantizer
        /// </summary>
        /// <param name="palette">The color palette to quantize to</param>
        /// <remarks>
        /// Palette quantization only requires a single quantization step
        /// </remarks>
        public PaletteQuantizer( ArrayList palette )
            : base( true )
        {
            _colorMap = new Hashtable();

            _colors = new Color[palette.Count];
            palette.CopyTo( _colors );
        }

        /// <summary>
        /// Override this to process the pixel in the second pass of the algorithm
        /// </summary>
        /// <param name="pixel">The pixel to quantize</param>
        /// <returns>The quantized value</returns>
        protected override byte QuantizePixel( Color32* pixel )
        {
            byte colorIndex = 0;
            int colorHash = pixel->ARGB;

            // Check if the color is in the lookup table
            if( _colorMap.ContainsKey( colorHash ) )
                colorIndex = (byte) _colorMap[colorHash];
            else
            {
                // Not found - loop through the palette and find the nearest match.
                // Firstly check the alpha value - if 0, lookup the transparent color
                if( 0 == pixel->Alpha )
                {
                    // Transparent. Lookup the first color with an alpha value of 0
                    for( int index = 0; index < _colors.Length; index++ )
                    {
                        if( 0 == _colors[index].A )
                        {
                            colorIndex = (byte) index;
                            break;
                        }
                    }
                }
                else
                {
                    // Not transparent...
                    int leastDistance = int.MaxValue;
                    int red = pixel->Red;
                    int green = pixel->Green;
                    int blue = pixel->Blue;

                    // Loop through the entire palette, looking for the closest color match
                    for( int index = 0; index < _colors.Length; index++ )
                    {
                        Color paletteColor = _colors[index];

                        int redDistance = paletteColor.R - red;
                        int greenDistance = paletteColor.G - green;
                        int blueDistance = paletteColor.B - blue;

                        int distance = ( redDistance * redDistance ) +
                                           ( greenDistance * greenDistance ) +
                                           ( blueDistance * blueDistance );

                        if( distance < leastDistance )
                        {
                            colorIndex = (byte) index;
                            leastDistance = distance;

                            // And if it's an exact match, exit the loop
                            if( 0 == distance )
                                break;
                        }
                    }
                }

                // Now I have the color, pop it into the hashtable for next time
                _colorMap.Add( colorHash, colorIndex );
            }

            return colorIndex;
        }

        /// <summary>
        /// Retrieve the palette for the quantized image
        /// </summary>
        /// <param name="palette">Any old palette, this is overrwritten</param>
        /// <returns>The new color palette</returns>
        protected override ColorPalette GetPalette( ColorPalette palette )
        {
            for( int index = 0; index < _colors.Length; index++ )
                palette.Entries[index] = _colors[index];

            return palette;
        }

        /// <summary>
        /// Lookup table for colors
        /// </summary>
        private Hashtable _colorMap;

        /// <summary>
        /// List of all colors in the palette
        /// </summary>
        private Color[] _colors;
    }

    /// <summary>
    /// Quantize using an Octree
    /// </summary>
    public unsafe class OctreeQuantizer : Quantizer
    {
        /// <summary>
        /// Construct the octree quantizer
        /// </summary>
        /// <remarks>
        /// The Octree quantizer is a two pass algorithm. The initial pass sets up the octree,
        /// the second pass quantizes a color based on the nodes in the tree
        /// </remarks>
        /// <param name="maxColors">The maximum number of colors to return</param>
        /// <param name="maxColorBits">The number of significant bits</param>
        public OctreeQuantizer( int maxColors, int maxColorBits )
            : base( false )
        {
            if( maxColors > 255 )
                throw new ArgumentOutOfRangeException( "maxColors", maxColors, "The number of colors should be less than 256" );

            if( ( maxColorBits < 1 ) | ( maxColorBits > 8 ) )
                throw new ArgumentOutOfRangeException( "maxColorBits", maxColorBits, "This should be between 1 and 8" );

            // Construct the octree
            _octree = new Octree( maxColorBits );

            _maxColors = maxColors;
        }

        /// <summary>
        /// Process the pixel in the first pass of the algorithm
        /// </summary>
        /// <param name="pixel">The pixel to quantize</param>
        /// <remarks>
        /// This function need only be overridden if your quantize algorithm needs two passes,
        /// such as an Octree quantizer.
        /// </remarks>
        protected override void InitialQuantizePixel( Color32* pixel )
        {
            // Add the color to the octree
            _octree.AddColor( pixel );
        }

        /// <summary>
        /// Override this to process the pixel in the second pass of the algorithm
        /// </summary>
        /// <param name="pixel">The pixel to quantize</param>
        /// <returns>The quantized value</returns>
        protected override byte QuantizePixel( Color32* pixel )
        {
            byte paletteIndex = (byte) _maxColors;	// The color at [_maxColors] is set to transparent

            // Get the palette index if this non-transparent
            if( pixel->Alpha > 0 )
                paletteIndex = (byte) _octree.GetPaletteIndex( pixel );

            return paletteIndex;
        }

        /// <summary>
        /// Retrieve the palette for the quantized image
        /// </summary>
        /// <param name="original">Any old palette, this is overrwritten</param>
        /// <returns>The new color palette</returns>
        protected override ColorPalette GetPalette( ColorPalette original )
        {
            // First off convert the octree to _maxColors colors
            ArrayList palette = _octree.Palletize( _maxColors - 1 );

            // Then convert the palette based on those colors
            for( int index = 0; index < palette.Count; index++ )
                original.Entries[index] = (Color) palette[index];

            // Add the transparent color
            original.Entries[_maxColors] = Color.FromArgb( 0, 0, 0, 0 );

            return original;
        }

        /// <summary>
        /// Stores the tree
        /// </summary>
        private Octree _octree;

        /// <summary>
        /// Maximum allowed color depth
        /// </summary>
        private int _maxColors;

        /// <summary>
        /// Class which does the actual quantization
        /// </summary>
        private class Octree
        {
            /// <summary>
            /// Construct the octree
            /// </summary>
            /// <param name="maxColorBits">The maximum number of significant bits in the image</param>
            public Octree( int maxColorBits )
            {
                _maxColorBits = maxColorBits;
                _leafCount = 0;
                _reducibleNodes = new OctreeNode[9];
                _root = new OctreeNode( 0, _maxColorBits, this );
                _previousColor = 0;
                _previousNode = null;
            }

            /// <summary>
            /// Add a given color value to the octree
            /// </summary>
            /// <param name="pixel"></param>
            public void AddColor( Color32* pixel )
            {
                // Check if this request is for the same color as the last
                if( _previousColor == pixel->ARGB )
                {
                    // If so, check if I have a previous node setup. This will only ocurr if the first color in the image
                    // happens to be black, with an alpha component of zero.
                    if( null == _previousNode )
                    {
                        _previousColor = pixel->ARGB;
                        _root.AddColor( pixel, _maxColorBits, 0, this );
                    }
                    else
                        // Just update the previous node
                        _previousNode.Increment( pixel );
                }
                else
                {
                    _previousColor = pixel->ARGB;
                    _root.AddColor( pixel, _maxColorBits, 0, this );
                }
            }

            /// <summary>
            /// Reduce the depth of the tree
            /// </summary>
            public void Reduce()
            {
                int index;

                // Find the deepest level containing at least one reducible node
                for( index = _maxColorBits - 1; ( index > 0 ) && ( null == _reducibleNodes[index] ); index-- ) ;

                // Reduce the node most recently added to the list at level 'index'
                OctreeNode node = _reducibleNodes[index];
                _reducibleNodes[index] = node.NextReducible;

                // Decrement the leaf count after reducing the node
                _leafCount -= node.Reduce();

                // And just in case I've reduced the last color to be added, and the next color to
                // be added is the same, invalidate the previousNode...
                _previousNode = null;
            }

            /// <summary>
            /// Get/Set the number of leaves in the tree
            /// </summary>
            public int Leaves
            {
                get { return _leafCount; }
                set { _leafCount = value; }
            }

            /// <summary>
            /// Return the array of reducible nodes
            /// </summary>
            protected OctreeNode[] ReducibleNodes
            {
                get { return _reducibleNodes; }
            }

            /// <summary>
            /// Keep track of the previous node that was quantized
            /// </summary>
            /// <param name="node">The node last quantized</param>
            protected void TrackPrevious( OctreeNode node )
            {
                _previousNode = node;
            }

            /// <summary>
            /// Convert the nodes in the octree to a palette with a maximum of colorCount colors
            /// </summary>
            /// <param name="colorCount">The maximum number of colors</param>
            /// <returns>An arraylist with the palettized colors</returns>
            public ArrayList Palletize( int colorCount )
            {
                while( Leaves > colorCount )
                    Reduce();

                // Now palettize the nodes
                ArrayList palette = new ArrayList( Leaves );
                int paletteIndex = 0;
                _root.ConstructPalette( palette, ref paletteIndex );

                // And return the palette
                return palette;
            }

            /// <summary>
            /// Get the palette index for the passed color
            /// </summary>
            /// <param name="pixel"></param>
            /// <returns></returns>
            public int GetPaletteIndex( Color32* pixel )
            {
                return _root.GetPaletteIndex( pixel, 0 );
            }

            /// <summary>
            /// Mask used when getting the appropriate pixels for a given node
            /// </summary>
            private static int[] mask = new int[8] { 0x80, 0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x01 };

            /// <summary>
            /// The root of the octree
            /// </summary>
            private OctreeNode _root;

            /// <summary>
            /// Number of leaves in the tree
            /// </summary>
            private int _leafCount;

            /// <summary>
            /// Array of reducible nodes
            /// </summary>
            private OctreeNode[] _reducibleNodes;

            /// <summary>
            /// Maximum number of significant bits in the image
            /// </summary>
            private int _maxColorBits;

            /// <summary>
            /// Store the last node quantized
            /// </summary>
            private OctreeNode _previousNode;

            /// <summary>
            /// Cache the previous color quantized
            /// </summary>
            private int _previousColor;

            /// <summary>
            /// Class which encapsulates each node in the tree
            /// </summary>
            protected class OctreeNode
            {
                /// <summary>
                /// Construct the node
                /// </summary>
                /// <param name="level">The level in the tree = 0 - 7</param>
                /// <param name="colorBits">The number of significant color bits in the image</param>
                /// <param name="octree">The tree to which this node belongs</param>
                public OctreeNode( int level, int colorBits, Octree octree )
                {
                    // Construct the new node
                    _leaf = ( level == colorBits );

                    _red = _green = _blue = 0;
                    _pixelCount = 0;

                    // If a leaf, increment the leaf count
                    if( _leaf )
                    {
                        octree.Leaves++;
                        _nextReducible = null;
                        _children = null;
                    }
                    else
                    {
                        // Otherwise add this to the reducible nodes
                        _nextReducible = octree.ReducibleNodes[level];
                        octree.ReducibleNodes[level] = this;
                        _children = new OctreeNode[8];
                    }
                }

                /// <summary>
                /// Add a color into the tree
                /// </summary>
                /// <param name="pixel">The color</param>
                /// <param name="colorBits">The number of significant color bits</param>
                /// <param name="level">The level in the tree</param>
                /// <param name="octree">The tree to which this node belongs</param>
                public void AddColor( Color32* pixel, int colorBits, int level, Octree octree )
                {
                    // Update the color information if this is a leaf
                    if( _leaf )
                    {
                        Increment( pixel );
                        // Setup the previous node
                        octree.TrackPrevious( this );
                    }
                    else
                    {
                        // Go to the next level down in the tree
                        int shift = 7 - level;
                        int index = ( ( pixel->Red & mask[level] ) >> ( shift - 2 ) ) |
                                    ( ( pixel->Green & mask[level] ) >> ( shift - 1 ) ) |
                                    ( ( pixel->Blue & mask[level] ) >> ( shift ) );

                        OctreeNode child = _children[index];

                        if( null == child )
                        {
                            // Create a new child node & store in the array
                            child = new OctreeNode( level + 1, colorBits, octree );
                            _children[index] = child;
                        }

                        // Add the color to the child node
                        child.AddColor( pixel, colorBits, level + 1, octree );
                    }

                }

                /// <summary>
                /// Get/Set the next reducible node
                /// </summary>
                public OctreeNode NextReducible
                {
                    get { return _nextReducible; }
                    set { _nextReducible = value; }
                }

                /// <summary>
                /// Return the child nodes
                /// </summary>
                public OctreeNode[] Children
                {
                    get { return _children; }
                }

                /// <summary>
                /// Reduce this node by removing all of its children
                /// </summary>
                /// <returns>The number of leaves removed</returns>
                public int Reduce()
                {
                    _red = _green = _blue = 0;
                    int children = 0;

                    // Loop through all children and add their information to this node
                    for( int index = 0; index < 8; index++ )
                    {
                        if( null != _children[index] )
                        {
                            _red += _children[index]._red;
                            _green += _children[index]._green;
                            _blue += _children[index]._blue;
                            _pixelCount += _children[index]._pixelCount;
                            ++children;
                            _children[index] = null;
                        }
                    }

                    // Now change this to a leaf node
                    _leaf = true;

                    // Return the number of nodes to decrement the leaf count by
                    return ( children - 1 );
                }

                /// <summary>
                /// Traverse the tree, building up the color palette
                /// </summary>
                /// <param name="palette">The palette</param>
                /// <param name="paletteIndex">The current palette index</param>
                public void ConstructPalette( ArrayList palette, ref int paletteIndex )
                {
                    if( _leaf )
                    {
                        // Consume the next palette index
                        _paletteIndex = paletteIndex++;

                        // And set the color of the palette entry
                        palette.Add( Color.FromArgb( _red / _pixelCount, _green / _pixelCount, _blue / _pixelCount ) );
                    }
                    else
                    {
                        // Loop through children looking for leaves
                        for( int index = 0; index < 8; index++ )
                        {
                            if( null != _children[index] )
                                _children[index].ConstructPalette( palette, ref paletteIndex );
                        }
                    }
                }

                /// <summary>
                /// Return the palette index for the passed color
                /// </summary>
                public int GetPaletteIndex( Color32* pixel, int level )
                {
                    int paletteIndex = _paletteIndex;

                    if( !_leaf )
                    {
                        int shift = 7 - level;
                        int index = ( ( pixel->Red & mask[level] ) >> ( shift - 2 ) ) |
                                    ( ( pixel->Green & mask[level] ) >> ( shift - 1 ) ) |
                                    ( ( pixel->Blue & mask[level] ) >> ( shift ) );

                        if( null != _children[index] )
                            paletteIndex = _children[index].GetPaletteIndex( pixel, level + 1 );
                        else
                            throw new Exception( "Didn't expect this!" );
                    }

                    return paletteIndex;
                }

                /// <summary>
                /// Increment the pixel count and add to the color information
                /// </summary>
                public void Increment( Color32* pixel )
                {
                    _pixelCount++;
                    _red += pixel->Red;
                    _green += pixel->Green;
                    _blue += pixel->Blue;
                }

                /// <summary>
                /// Flag indicating that this is a leaf node
                /// </summary>
                private bool _leaf;

                /// <summary>
                /// Number of pixels in this node
                /// </summary>
                private int _pixelCount;

                /// <summary>
                /// Red component
                /// </summary>
                private int _red;

                /// <summary>
                /// Green Component
                /// </summary>
                private int _green;

                /// <summary>
                /// Blue component
                /// </summary>
                private int _blue;

                /// <summary>
                /// Pointers to any child nodes
                /// </summary>
                private OctreeNode[] _children;

                /// <summary>
                /// Pointer to next reducible node
                /// </summary>
                private OctreeNode _nextReducible;

                /// <summary>
                /// The index of this node in the palette
                /// </summary>
                private int _paletteIndex;

            }
        }


    }
    #endregion

}
