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

        public async void Loaded()
        {
            var view = (BrowserView)GetView();
            await Task.Delay(500);
            view.AddressInput.Focus();
        }

        public void NavigateTo()
        {
            var view = (BrowserView)GetView();
            view.Browser.Load(AddressInput);
        }

        public void Closing()
        {
            var view = (BrowserView)GetView();
            view.Browser.Dispose();
        }

        public void Exit()
        {
            var view = (BrowserView)GetView();
            view.Close();
        }
    }
}
