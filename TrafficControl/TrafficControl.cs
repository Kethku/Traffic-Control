using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Forms;
using Caliburn.Micro;
using Squirrel;
using TrafficControl.ViewModels;

using Application = System.Windows.Application;
using MessageBox = System.Windows.MessageBox;

namespace TrafficControl
{
    public class TrafficControl : Application, IHandle<ProduceCompletionsEvent>, IHandle<InputEvent>
    {
        public const string AppName = "TrafficControl";
        public const string GithubUrl = "https://github.com/Kethku/Traffic-Control";

        public const string QuitCommand = "quit";
        public const string HelpCommand = "help";

        public static Bootstrapper Bootstrapper { get; set; }

        public static bool NeedsRestarted { get; set; }

        private static Mutex singleAppMutex;
        private static bool firstRun = false;

        [STAThread]
        public static void Main()
        {
            try
            {
                bool newApp;
                singleAppMutex = new Mutex(true, AppName, out newApp);
                if (!newApp) return;

                SetupSquirrel();

                WindowsUtils.SetupNotificationIcon();

                CheckForUpdates(true).Wait();

                var app = new TrafficControl();
                app.Startup += OnStartup;
                Bootstrapper = new Bootstrapper();
                app.Run();
            }
            catch (Exception e)
            {
                MessageBox.Show(e.ToString());
            }
        }

        private static void OnStartup(object sender, StartupEventArgs e)
        {
            Bootstrapper.EventAggregator.Subscribe(sender);
            if (firstRun)
            {
                Bootstrapper.ShowHelp();
            }
        }

        public static async void SetupSquirrel()
        {
            if (!Debugger.IsAttached) {
                using (var updateManager = await UpdateManager.GitHubUpdateManager(GithubUrl))
                {
                    SquirrelAwareApp.HandleEvents(
                      onInitialInstall: v =>
                      {
                          updateManager.CreateShortcutForThisExe();
                      },
                      onAppUpdate: v => 
                      {
                          updateManager.CreateShortcutForThisExe();
                      },
                      onAppUninstall: v => 
                      {
                          updateManager.RemoveShortcutForThisExe();
                      },
                      onFirstRun: () => firstRun = true);
                }
            }
        }

        public static async Task CheckForUpdates(bool restartIfNeeded)
        {
            if (!Debugger.IsAttached) {
                ReleaseEntry release = null;
                using (var updateManager = await UpdateManager.GitHubUpdateManager(GithubUrl))
                {
                    var updateInfo = await updateManager.CheckForUpdate();
                    if (updateInfo.ReleasesToApply.Any())
                    {
                        WindowsUtils.ShowNotification("Traffic Control Updating", "Traffic Control is updating and will be restart shortly");
                        release = await updateManager.UpdateApp();
                    }
                }
                if (release != null)
                {
                    if (restartIfNeeded)
                    {
                        UpdateManager.RestartApp();
                    }
                    else
                    {
                        NeedsRestarted = true;
                    }
                }
                else
                {
                    NeedsRestarted = false;
                }
            }
        }

        public static async void RestartIfNeeded()
        {
            if (NeedsRestarted)
            {
                using (var updateManager = await UpdateManager.GitHubUpdateManager(GithubUrl))
                {
                    UpdateManager.RestartApp();
                }
            }
        }

        public void Handle(ProduceCompletionsEvent message)
        {
            if (CompletionUtils.MatchesExactly(message.Prefix, QuitCommand))
            {
                Bootstrapper.EventAggregator.PublishOnUIThread(new CompletionResultViewModel(QuitCommand, QuitCommand, "Quits the Traffic Control app"));
            }

            if (CompletionUtils.MatchesExactly(message.Prefix, HelpCommand))
            {
                Bootstrapper.EventAggregator.PublishOnUIThread(new CompletionResultViewModel(HelpCommand, HelpCommand, "Pops the help dialog"));
            }
        }

        public void Handle(InputEvent message)
        {
            if (message.Input == QuitCommand)
            {
                Shutdown();
            }

            if (message.Input == HelpCommand)
            {
                Bootstrapper.ShowHelp();
            }
        }
    }
}
