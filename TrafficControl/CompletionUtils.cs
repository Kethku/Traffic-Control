using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TrafficControl
{
    public static class CompletionUtils
    {
        public static bool Matches(string input, string command) => Enumerable.SequenceEqual(input.Take(command.Length), command.Take(input.Length));
        public static bool MatchesExactly(string input, string command) => Enumerable.SequenceEqual(input, command.Take(input.Length));
    }
}
