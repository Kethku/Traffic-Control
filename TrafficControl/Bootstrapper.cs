﻿using Caliburn.Micro;
using System;
using System.Diagnostics;
using System.IO;
using System.Windows;
using System.Windows.Input;
using TrafficControl.Input;
using TrafficControl.ViewModels;

namespace TrafficControl
{
    public class Bootstrapper : BootstrapperBase {
        public static IEventAggregator EventAggregator = new EventAggregator();
        public static IWindowManager WindowManager = new WindowManager();
        public static InputManager InputManager = new InputManager();

        public static SniperManager SniperManager = new SniperManager();

        public Bootstrapper()
        {
            var cache = Path.Combine(Environment.GetFolderPath (Environment.SpecialFolder.ApplicationData), System.IO.Path.Combine("TrafficControl","cache"));
            if (!Directory.Exists(cache))
            {
                Directory.CreateDirectory(cache);
            }

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

        protected override void OnExit(object sender, EventArgs e)
        {
            WindowsUtils.HideNotificationIcon();

            var processes = Process.GetProcesses();
            var currentProcess = Process.GetCurrentProcess();
            foreach (var process in processes)
            {
                if (process != currentProcess) {
                    try
                    {
                        if (Path.GetDirectoryName(process.MainModule.FileName) == Path.GetDirectoryName(currentProcess.MainModule.FileName))
                        {
                                process.Kill();
                        }
                    }
                    catch (Exception) { }
                }
            }

            base.OnExit(sender, e);
        }

        protected override void OnStartup(object sender, StartupEventArgs e)
        {
            DisplayRootViewFor<InputBoxViewModel>();
        }

        public void ShowHelp()
        {
            DisplayRootViewFor<HelpViewModel>();
        }
    }
}
