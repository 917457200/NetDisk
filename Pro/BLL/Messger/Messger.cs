using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Messger
{
    public class Messger
    {
        public int WeiDuMessgerCount( string UserCode )
        {
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                var GroupInfo = from b in Db.MassgeInfo
                                where b.MassgeToUserId == UserCode && b.MassgeState == false
                                select b;
                return GroupInfo.Count();
            }
        }
        /// <summary>
        /// 获取数据
        /// </summary>
        /// <param name="Id"></param>
        /// <returns></returns>
        public List<Model.MassgeInfo> GetManageList( int pageIndex, int pageSize, string GroupName, string UserName, string UserCode, ref int Count )
        {
            DataSetToList List = new DataSetToList();
            using( Model.NETDISKDBEntities Db = new Model.NETDISKDBEntities() )
            {
                int startRow = ( pageIndex - 1 ) * pageSize;

                BLL.YunFile.MyFile File = new YunFile.MyFile();
                string wherestr = " and MassgeToUserId ='" + UserCode + "'";
                if( !string.IsNullOrEmpty( GroupName ) )
                {
                    wherestr = " and MassgeNote like '%" + GroupName + "%'";
                }

                if( !string.IsNullOrEmpty( UserName ) )
                {
                    wherestr += " AND MassgeNote like '%" + UserName + "%'";
                }
                StringBuilder strSql1 = new StringBuilder();
                strSql1.Append( "SELECT *  FROM MassgeInfo where 1=1 " + wherestr );
                DbRawSqlQuery<Model.MassgeInfo> result = Db.Database.SqlQuery<Model.MassgeInfo>( strSql1.ToString() );
                Count = result.Count();
                StringBuilder strSql = new StringBuilder();
                strSql.Append( "SELECT  TOP " + pageSize + " * FROM (SELECT ROW_NUMBER() OVER (ORDER BY  MassgeState,MassgeCreateTime desc) AS RowNumber,* FROM MassgeInfo where 1=1 " + wherestr + ") as B " );
                strSql.Append( "where RowNumber > " + startRow + wherestr + " ORDER BY  MassgeState,MassgeCreateTime DESC " );
                DbRawSqlQuery<Model.MassgeInfo> result1 = Db.Database.SqlQuery<Model.MassgeInfo>( strSql.ToString() );
                return result1.ToList();
            }
        }
    }
}
