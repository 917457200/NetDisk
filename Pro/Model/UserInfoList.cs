using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model
{
    public class UserInfoList
    {
        #region Model
        private string _staffcode;
        private string _staffname;
        private string _agencyname;
        private string _agencycode;
        /// <summary>
        /// 
        /// </summary>
        public string StaffCode
        {
            set { _staffcode = value; }
            get { return _staffcode; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string StaffName
        {
            set { _staffname = value; }
            get { return _staffname; }
        }

        public string AgencyName
        {
            set { _agencyname = value; }
            get { return _agencyname; }
        }
        /// <summary>
        /// 
        /// </summary>
        public string AgencyCode
        {
            set { _agencycode = value; }
            get { return _agencycode; }
        }

        #endregion Model

    }
}
