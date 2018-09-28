using Caliburn.Micro;
using NHotkey.Wpf;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
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
            HotkeyManager.Current.AddOrReplace("DisplayInputBox", Key.Space, ModifierKeys.Control, (_, __) => DisplayInputBox());
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
            Input = "";
            HideInputBox();
        }

        public async void CancelInput()
        {
            Input = "";
            await HideInputBox();
            TrafficControl.RestartIfNeeded();
        }

        public void Closing(CancelEventArgs args)
        {
            args.Cancel = true;
            HideInputBox();
        }

        public async Task HideInputBox()
        {
            Opacity = 0.0;
            await Task.Delay(100);
            WindowState = WindowState.Normal;
            CompletionResults.Clear();
        }

        public void DisplayInputBox()
        {
            TrafficControl.CheckForUpdates(false);
            InputBoxView view = (InputBoxView)GetView();
            var screenPoint = Bootstrapper.InputManager.GetMouseScreenPosition(view);
            view.Left = screenPoint.X;
            view.Top = screenPoint.Y;
            WindowState = WindowState.Maximized;
            Opacity = OPEN_OPACITY;
            view.Show();
            view.Activate();
            view.Input.Focus();
            CompletionResults.Clear();
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

        public void Loaded()
        {
            WindowsUtils.HideFromTaskSwitcher((Window)GetView());
        }

        public void Handle(CompletionResultViewModel message)
        {
            if (CompletionResults.Count < 15)
            {
                CompletionResults.Add(message);
            }
        }
    }
}
