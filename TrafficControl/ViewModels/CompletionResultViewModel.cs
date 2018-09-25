using Caliburn.Micro;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Media;

namespace TrafficControl.ViewModels
{
    public class CompletionResultViewModel: PropertyChangedBase
    {
        public Color BorderColor => Selected ? Colors.White : Colors.Transparent;
        public SolidColorBrush BorderBrush => new SolidColorBrush(BorderColor);

        public string Completion { get; }
        public string CompletionDisplay { get; }
        public string CompletionDescription { get; }
        public bool Selected { get; set; }

        public CompletionResultViewModel(string completion, string completionDisplay, string completionDescription)
        {
            Completion = completion;
            CompletionDisplay = completionDisplay;
            CompletionDescription = completionDescription;
            Selected = false;
        }
    }
}
