using Caliburn.Micro;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TrafficControl.ViewModels;

namespace TrafficControl
{
    public class BrowserManager : IHandle<ProduceCompletionsEvent>, IHandle<InputEvent>
    {
        public string BrowserCommand = "browser";

        public BrowserManager()
        {
            Bootstrapper.EventAggregator.Subscribe(this);
        }

        public void Handle(ProduceCompletionsEvent message)
        {
            if (CompletionUtils.MatchesExactly(message.Prefix, BrowserCommand))
            {
                Bootstrapper.EventAggregator.PublishOnUIThread(new CompletionResultViewModel(BrowserCommand, BrowserCommand, "Open a browser window to setup accounts"));
            }
        }

        public void Handle(InputEvent message)
        {
            if (message.Input == BrowserCommand)
            {
                Bootstrapper.WindowManager.ShowWindow(new BrowserViewModel());
            }
        }
    }
}
