using Caliburn.Micro;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows;
using TrafficControl.ViewModels;

namespace TrafficControl
{
    public class PipManager : IHandle<ProduceCompletionsEvent>, IHandle<InputEvent>
    {
        public string PipCommandPrefix = "pip ";
        public string PipCloseCommand = "pip";

        public Regex YoutubeRegex = new Regex(@"(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})");

        public PipViewModel Pip { get; set; }
         
        public PipManager()
        {
            Bootstrapper.EventAggregator.Subscribe(this);
        }

        public void Handle(ProduceCompletionsEvent message)
        {
            if (CompletionUtils.Matches(message.Prefix, PipCommandPrefix))
            {
                Bootstrapper.EventAggregator.PublishOnUIThread(new CompletionResultViewModel(PipCommandPrefix, "pip {url}", "Open url in \"Picture In Picture\" window"));
            }

            if (CompletionUtils.MatchesExactly(message.Prefix, PipCloseCommand))
            {
                Bootstrapper.EventAggregator.PublishOnUIThread(new CompletionResultViewModel(PipCloseCommand, "pip", "Close any open \"Picture in Picture\" windows"));
            }
        }

        public void Handle(InputEvent message)
        {
            if (message.Input.StartsWith(PipCommandPrefix))
            {
                var url = message.Input.Substring(PipCommandPrefix.Length);
                var aspectRatio = 16.0 / 9.0;
                var initScript = "";

                var youtubeMatch = YoutubeRegex.Match(message.Input);
                if (youtubeMatch.Success)
                {
                    var id = youtubeMatch.Groups[1].Value;
                    url = $"https://www.youtube.com/embed/{id}?autoplay=1";
                }

                if (Pip != null)
                {
                    Pip.Close();
                }
                Pip = new PipViewModel(url, aspectRatio, initScript);
                Bootstrapper.WindowManager.ShowWindow(Pip);
            }

            if (message.Input == PipCloseCommand)
            {
                if (Pip != null)
                {
                    Pip.Close();
                    Pip = null;
                }
            }
        }
    }
}
