using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;

namespace TrafficControl {
    public class SniperManager : IHandle<ProduceCompletionsEvent>, IHandle<InputEvent> {
        public string SniperCommand = "snipe";

        public SniperManager() 
        {
            Bootstrapper.EventAggregator.Subscribe(this);
        }

        public void Handle(ProduceCompletionsEvent message) {
            if (CompletionUtils.Matches(message.Prefix, SniperCommand)) 
            {
                Bootstrapper.EventAggregator.PublishOnUIThread(new CompletionResultViewModel(SniperCommand, "snipe", "Arm sniper to punish deviant windows."));
            }
        }

        public void Handle(InputEvent message) {
            if (message.Input == SniperCommand)
            {
                Process.Start("window_sniper.exe");
            }
        }
    }
}
