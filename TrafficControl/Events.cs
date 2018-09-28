using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TrafficControl
{
    public class ProduceCompletionsEvent
    {
        public string Prefix { get; }

        public ProduceCompletionsEvent(string prefix)
        {
            Prefix = prefix;
        }
    }

    public class InputEvent
    {
        public string Input { get; }

        public InputEvent(string input)
        {
            Input = input;
        }
    }
}
