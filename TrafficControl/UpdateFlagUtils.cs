using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TrafficControl
{
    public static class UpdateFlagUtils
    {
        private const string flagPath = "./updated";

        public static void SetUpdateFlag()
        {
            File.Create(flagPath).Dispose();
        }

        public static bool ReadFlagAndReset()
        {
            var updated = File.Exists(flagPath);
            if (updated)
            {
                File.Delete(flagPath);
            }
            return updated;
        }
    }
}
