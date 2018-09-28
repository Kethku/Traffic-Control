using Caliburn.Micro;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace TrafficControl.ViewModels
{
    public class HelpViewModel : ViewAware
    {
        public string Version { get; }

        public HelpViewModel()
        {
            Assembly assembly = Assembly.GetExecutingAssembly();
            FileVersionInfo fvi = FileVersionInfo.GetVersionInfo(assembly.Location);
            Version = fvi.FileVersion;
        }

        public async void Loaded()
        {
            var view = (Window)GetView();
            await Task.Delay(500);
            view.Activate();
        }

        public void Exit()
        {
            var view = (Window)GetView();
            view.Close();
        }
    }
}
