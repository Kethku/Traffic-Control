using Caliburn.Micro;
using NHotkey.Wpf;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using System.Windows.Interop;
using TrafficControl.Views;

namespace TrafficControl.ViewModels
{
    public class InputBoxViewModel : ViewAware, IHandle<CompletionResultViewModel>
    {
        const double OPEN_OPACITY = 0.8;

        public double Opacity { get; set; }
        public string Input { get; set; }

        public int InputCaretIndex { get; set; }

        public WindowState WindowState { get; set; }

        public BindableCollection<CompletionResultViewModel> CompletionResults { get; }

        public InputBoxViewModel()
        {
            HotkeyManager.Current.AddOrReplace("DisplayInputBox", Key.Space, ModifierKeys.Control, DisplayInputBox);
            CompletionResults = new BindableCollection<CompletionResultViewModel>();
            Bootstrapper.EventAggregator.Subscribe(this);
        }

        public void CycleCompletionDown(KeyEventArgs args)
        {
            var selectedCompletion = CompletionResults.FirstOrDefault(completion => completion.Selected);
            if (selectedCompletion != null)
            {
                selectedCompletion.Selected = false;
                var selectedIndex = CompletionResults.IndexOf(selectedCompletion);
                selectedIndex++;
                if (selectedIndex >= CompletionResults.Count)
                {
                    selectedIndex = 0;
                }
                selectedCompletion = CompletionResults[selectedIndex];
                selectedCompletion.Selected = true;
            }
            else if (CompletionResults.Any())
            {
                selectedCompletion = CompletionResults.First();
                selectedCompletion.Selected = true;
            }

            if (selectedCompletion != null)
            {
                Input = selectedCompletion.Completion;
            }
            args.Handled = true;

            var view = (InputBoxView)GetView();
            view.Input.CaretIndex = int.MaxValue;
        }

        public void CycleCompletionUp(KeyEventArgs args)
        {
            var selectedCompletion = CompletionResults.FirstOrDefault(completion => completion.Selected);
            if (selectedCompletion != null)
            {
                selectedCompletion.Selected = false;
                var selectedIndex = CompletionResults.IndexOf(selectedCompletion);
                selectedIndex--;
                if (selectedIndex < 0)
                {
                    selectedIndex = CompletionResults.Count - 1;
                }
                selectedCompletion = CompletionResults[selectedIndex];
                selectedCompletion.Selected = true;
            }
            else if (CompletionResults.Any())
            {
                selectedCompletion = CompletionResults.Last();
                selectedCompletion.Selected = true;
            }

            if (selectedCompletion != null)
            {
                Input = selectedCompletion.Completion;
            }
            args.Handled = true;

            var view = (InputBoxView)GetView();
            view.Input.CaretIndex = int.MaxValue;
        }

        public void SendInput()
        {
            Bootstrapper.EventAggregator.PublishOnUIThread(new InputEvent(Input.Trim()));
            HideInputBox();
        }

        public void Closing(CancelEventArgs args)
        {
            args.Cancel = true;
            HideInputBox();
        }

        public async void HideInputBox()
        {
            Opacity = 0.0;
            await Task.Delay(100);
            WindowState = WindowState.Normal;
            Input = "";
            CompletionResults.Clear();
        }

        public void DisplayInputBox(object sender, NHotkey.HotkeyEventArgs args)
        {
            InputBoxView view = (InputBoxView)GetView();
            var screenPoint = Bootstrapper.InputManager.GetMouseScreenPosition(view);
            view.Left = screenPoint.X;
            view.Top = screenPoint.Y;
            WindowState = WindowState.Maximized;
            Opacity = OPEN_OPACITY;
            view.Show();
            view.Activate();
            view.Input.Focus();
            Bootstrapper.EventAggregator.PublishOnUIThread(new ProduceCompletionsEvent(""));
        }

        public void TextChanged()
        {
            var selectedCompletion = CompletionResults.FirstOrDefault(completion => completion.Selected);
            if (selectedCompletion == null || selectedCompletion.Completion != Input)
            {
                CompletionResults.Clear();
                Bootstrapper.EventAggregator.PublishOnUIThread(new ProduceCompletionsEvent(Input));
            }
        }

        public void Handle(CompletionResultViewModel message)
        {
            CompletionResults.Add(message);
        }
    }

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
