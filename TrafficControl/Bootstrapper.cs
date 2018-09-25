using Caliburn.Micro;
using CefSharp;
using CefSharp.Wpf;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using TrafficControl.Input;
using TrafficControl.ViewModels;

namespace TrafficControl
{
    public class Bootstrapper : BootstrapperBase
    {
        public static IEventAggregator EventAggregator = new EventAggregator();
        public static IWindowManager WindowManager = new WindowManager();
        public static InputManager InputManager = new InputManager();

        public static PipManager PipManager = new PipManager();
        public static BrowserManager BrowserManager = new BrowserManager();

        public Bootstrapper()
        {
            var cache = System.IO.Path.Combine(Environment.GetFolderPath (Environment.SpecialFolder.ApplicationData), System.IO.Path.Combine("TrafficControl","cache"));
            if (!System.IO.Directory.Exists(cache))
            {
                System.IO.Directory.CreateDirectory(cache);
            }

            var settings = new CefSettings() { CachePath = cache };
            Cef.Initialize(settings);

            Initialize();
        }

        protected override void Configure()
        {
            var defaultCreateTrigger = Parser.CreateTrigger;

            Parser.CreateTrigger = (target, triggerText) => 
            {
                if (triggerText == null)
                {
                    return defaultCreateTrigger(target, null);
                }

                var triggerDetail = triggerText
                    .Replace("[", string.Empty)
                    .Replace("]", string.Empty);

                var splits = triggerDetail.Split((char[])null, StringSplitOptions.RemoveEmptyEntries);

                switch (splits[0])
                {
                    case "Key":
                        var key = (Key)Enum.Parse(typeof(Key), splits[1], true);
                        return new KeyTrigger { Key = key };

                    case "Gesture":
                        var mkg = (MultiKeyGesture)(new MultiKeyGestureConverter()).ConvertFrom(splits[1]);
                        return new KeyTrigger { Modifiers = mkg.KeySequences[0].Modifiers, Key = mkg.KeySequences[0].Keys[0] };
                }

                return defaultCreateTrigger(target, triggerText);
            };
        }

        protected override void OnStartup(object sender, StartupEventArgs e)
        {
            DisplayRootViewFor<InputBoxViewModel>();
        }
    }
}
