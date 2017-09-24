using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class DataSetToList
    {

        /// <summary>  
        /// DataSetToList  
        /// </summary>  
        /// <typeparam name="T">转换类型</typeparam>  
        /// <param name="ds">一个DataSet实例，也就是数据源</param>  
        /// <param name="tableIndext">DataSet容器里table的下标，只有用于取得哪个table，也就是需要转换表的索引</param>  
        /// <returns></returns>  
        public List<T> ToList<T>( DataSet ds, int tableIndext )
        {
            //确认参数有效  
            if( ds == null || ds.Tables.Count <= 0 || tableIndext < 0 )
            {
                return null;
            }
            DataTable dt = ds.Tables[tableIndext]; //取得DataSet里的一个下标为tableIndext的表，然后赋给dt  

            IList<T> list = new List<T>();  //实例化一个list  
            // 在这里写 获取T类型的所有公有属性。 注意这里仅仅是获取T类型的公有属性，不是公有方法，也不是公有字段，当然也不是私有属性                                                 
            PropertyInfo[] tMembersAll = typeof( T ).GetProperties();

            for( int i = 0; i < dt.Rows.Count; i++ )
            {
                //创建泛型对象。为什么这里要创建一个泛型对象呢？是因为目前我不确定泛型的类型。  
                T t = Activator.CreateInstance<T>();


                //获取t对象类型的所有公有属性。但是我不建议吧这条语句写在for循环里，因为没循环一次就要获取一次，占用资源，所以建议写在外面  
                //PropertyInfo[] tMembersAll = t.GetType().GetProperties();  
                for( int j = 0; j < dt.Columns.Count; j++ )
                {
                    //遍历tMembersAll  
                    foreach( PropertyInfo tMember in tMembersAll )
                    {
                        //取dt表中j列的名字，并把名字转换成大写的字母。整条代码的意思是：如果列名和属性名称相同时赋值  
                        if( dt.Columns[j].ColumnName.ToUpper().Equals( tMember.Name.ToUpper() ) )
                        {
                            //dt.Rows[i][j]表示取dt表里的第i行的第j列；DBNull是指数据库中当一个字段没有被设置值的时候的值，相当于数据库中的“空值”。   
                            if( dt.Rows[i][j] != DBNull.Value )
                            {
                                //SetValue是指：将指定属性设置为指定值。 tMember是T泛型对象t的一个公有成员，整条代码的意思就是：将dt.Rows[i][j]赋值给t对象的tMember成员,参数详情请参照http://msdn.microsoft.com/zh-cn/library/3z2t396t(v=vs.100).aspx/html  
                                tMember.SetValue( t, dt.Rows[i][j], null );
                            }
                            else
                            {
                                tMember.SetValue( t, null, null );
                            }
                            break;//注意这里的break是写在if语句里面的，意思就是说如果列名和属性名称相同并且已经赋值了，那么我就跳出foreach循环，进行j+1的下次循环  
                        }
                    }
                }

                list.Add( t );
            }
            return list.ToList();

        }
        /// <summary>
        /// EF SQL 语句返回 dataTable
        /// </summary>
        /// <param name="db"></param>
        /// <param name="sql"></param>
        /// <param name="parameters"></param>
        /// <returns></returns>
        public DataSet SqlQueryForDataTatable( Database db, string sql )
        {
            SqlConnection conn = new System.Data.SqlClient.SqlConnection();
            conn = (SqlConnection) db.Connection;
            SqlCommand cmd = new SqlCommand();
            cmd.Connection = conn;
            cmd.CommandText = sql;
            SqlDataAdapter adapter = new SqlDataAdapter( cmd );
            DataSet table = new DataSet();
            adapter.Fill( table );
            conn.Close();//连接需要关闭
            conn.Dispose();
            return table;
        }
        public List<T> JsonToDataSet<T>( object obj )
        {
            try
            {
                DataSet ds = new DataSet();

                Dictionary<string, object> datajson = (Dictionary<string, object>) obj;


                foreach( var item in datajson )
                {
                    DataTable dt = new DataTable( item.Key );
                    object[] rows = (object[]) item.Value;
                    foreach( var row in rows )
                    {
                        Dictionary<string, object> val = (Dictionary<string, object>) row;
                        DataRow dr = dt.NewRow();
                        foreach( KeyValuePair<string, object> sss in val )
                        {
                            if( !dt.Columns.Contains( sss.Key ) )
                            {
                                dt.Columns.Add( sss.Key.ToString() );
                                dr[sss.Key] = sss.Value;
                            }
                            else
                                dr[sss.Key] = sss.Value;
                        }
                        dt.Rows.Add( dr );
                    }
                    ds.Tables.Add( dt );
                }
                return ToList<T>( ds, 0 );
            }
            catch
            {
                return null;
            }
        }
    }
}
