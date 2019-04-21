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
using TrafficControl.ViewModels;

using Application = System.Windows.Application;
using MessageBox = System.Windows.MessageBox;

namespace TrafficControl
{
    public class TrafficControl : Application, IHandle<ProduceCompletionsEvent>, IHandle<InputEvent>
    {
        public const string AppName = "TrafficControl";

        public const string QuitCommand = "quit";
        public const string HelpCommand = "help";

        public static Bootstrapper Bootstrapper { get; set; }
        public static bool FirstRun { get; set; }

        [STAThread]
        public static void Main()
        {
            try
            {
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

            if (FirstRun)
            {
                Bootstrapper.ShowHelp();
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
