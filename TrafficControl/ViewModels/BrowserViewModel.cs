using Caliburn.Micro;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using TrafficControl.Views;

namespace TrafficControl.ViewModels
{
    public class BrowserViewModel : ViewAware
    {
        private string address;
        public string Address
        {
            get
            {
                return address;
            }
            set
            {
                address = value;
                AddressInput = address;
            }
        }
        public string AddressInput { get; set; }

        public void NavigateTo()
        {
            var view = (BrowserView)GetView();
            view.Cef.Load(AddressInput);
        }
    }
}
