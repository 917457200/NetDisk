//------------------------------------------------------------------------------
// <auto-generated>
//     此代码已从模板生成。
//
//     手动更改此文件可能导致应用程序出现意外的行为。
//     如果重新生成代码，将覆盖对此文件的手动更改。
// </auto-generated>
//------------------------------------------------------------------------------

namespace Model
{
    using System;
    using System.Collections.Generic;
    
    public partial class UserGroupInfo
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public Nullable<int> GroupId { get; set; }
        public Nullable<System.DateTime> ExamineTime { get; set; }
        public string UserName { get; set; }
        public Nullable<bool> Examine { get; set; }
    }
}
