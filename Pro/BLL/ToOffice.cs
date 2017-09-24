using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Office.Interop.Word;
using Microsoft.Office.Interop.Excel;
using Microsoft.Office.Interop.PowerPoint;

namespace BLL
{
    public static class ToOffice
    {
        /// <summary> 
        /// 将word文档转换成PDF格式 
        /// </summary> 
        /// <param name="sourcePath"></param> 
        /// <param name="targetPath"></param> 
        /// <returns></returns> 
        public static bool ConvertWordPdf( string sourcePath, string targetPath )
        {
            bool result;
            WdExportFormat exportFormat = WdExportFormat.wdExportFormatPDF;
            object paramMissing = Type.Missing;
            Microsoft.Office.Interop.Word.Application wordApplication = new Microsoft.Office.Interop.Word.Application();
            Document wordDocument = null;
            try
            {
                object paramSourceDocPath = sourcePath;
                string paramExportFilePath = targetPath;
                WdExportFormat paramExportFormat = exportFormat;
                WdExportOptimizeFor paramExportOptimizeFor =
                WdExportOptimizeFor.wdExportOptimizeForPrint;
                WdExportRange paramExportRange = WdExportRange.wdExportAllDocument;
                int paramStartPage = 0;
                int paramEndPage = 0;
                WdExportItem paramExportItem = WdExportItem.wdExportDocumentContent;
                WdExportCreateBookmarks paramCreateBookmarks =
                        WdExportCreateBookmarks.wdExportCreateWordBookmarks;

                wordDocument = wordApplication.Documents.Open(
                        ref paramSourceDocPath, ref paramMissing, ref paramMissing,
                        ref paramMissing, ref paramMissing, ref paramMissing,
                        ref paramMissing, ref paramMissing, ref paramMissing,
                        ref paramMissing, ref paramMissing, ref paramMissing,
                        ref paramMissing, ref paramMissing, ref paramMissing,
                        ref paramMissing );
                if( wordDocument != null )
                    wordDocument.ExportAsFixedFormat( paramExportFilePath,
                            paramExportFormat, false,
                            paramExportOptimizeFor, paramExportRange, paramStartPage,
                            paramEndPage, paramExportItem, true,
                            true, paramCreateBookmarks, true,
                            true, false,
                            ref paramMissing );
                result = true;
            }
            finally
            {
                if( wordDocument != null )
                {
                    wordDocument.Close( ref paramMissing, ref paramMissing, ref paramMissing );
                    wordDocument = null;
                }
                if( wordApplication != null )
                {
                    wordApplication.Quit( ref paramMissing, ref paramMissing, ref paramMissing );
                    wordApplication = null;
                }
                GC.Collect();
                GC.WaitForPendingFinalizers();
                GC.Collect();
                GC.WaitForPendingFinalizers();
            }
            return result;
        }
        /// <summary>
        /// 把Exl文件转换成PDF格式文件
        /// </summary>
        public static bool ConvertExlPdf( string sourcePath, string targetPath )
        {
            bool result = false;
            XlFixedFormatType targetType = XlFixedFormatType.xlTypePDF;
            object missing = Type.Missing;
            Microsoft.Office.Interop.Excel.Application application = null;
            Workbook workBook = null;
            try
            {
                application = new Microsoft.Office.Interop.Excel.Application();
                object target = targetPath;
                object type = targetType;
                workBook = application.Workbooks.Open( sourcePath, missing, missing, missing, missing, missing,
                        missing, missing, missing, missing, missing, missing, missing, missing, missing );

                workBook.ExportAsFixedFormat( targetType, target, XlFixedFormatQuality.xlQualityStandard, true, false, missing, missing, missing, missing );
                result = true;
            }
            catch
            {
                result = false;
            }
            finally
            {
                if( workBook != null )
                {
                    workBook.Close( true, missing, missing );
                    workBook = null;
                }
                if( application != null )
                {
                    application.Quit();
                    application = null;
                }
                GC.Collect();
                GC.WaitForPendingFinalizers();
                GC.Collect();
                GC.WaitForPendingFinalizers();
            }
            return result;
        }
        /// <summary>
        /// 把PowerPoint文件转换成PDF格式文件
        /// </summary>
        public static bool ConvertPPTPDF( string sourcePath, string targetPath )
        {
            bool result;
            PpSaveAsFileType targetFileType = PpSaveAsFileType.ppSaveAsPDF;
            object missing = Type.Missing;
            Microsoft.Office.Interop.PowerPoint.Application application = null;
            Presentation persentation = null;
            try
            {
                application = new Microsoft.Office.Interop.PowerPoint.Application();
                persentation = application.Presentations.Open( sourcePath, Microsoft.Office.Core.MsoTriState.msoTrue, Microsoft.Office.Core.MsoTriState.msoFalse, Microsoft.Office.Core.MsoTriState.msoFalse );
                persentation.SaveAs( targetPath, targetFileType, Microsoft.Office.Core.MsoTriState.msoTrue );

                result = true;
            }
            catch
            {
                result = false;
            }
            finally
            {
                if( persentation != null )
                {
                    persentation.Close();
                    persentation = null;
                }
                if( application != null )
                {
                    application.Quit();
                    application = null;
                }
                GC.Collect();
                GC.WaitForPendingFinalizers();
                GC.Collect();
                GC.WaitForPendingFinalizers();
            }
            return result;
        }
    }
}
