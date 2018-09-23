using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Interop;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using NHotkey.Wpf;

namespace TrafficControl
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            HotkeyManager.Current.AddOrReplace("DisplayInputBox", Key.Space, ModifierKeys.Control, DisplayInputBox);
            Input.LostFocus += (_, __) => HideInputBox();
            Input.KeyUp += (_, args) =>
            {
                if (args.Key == Key.Escape)
                {
                    HideInputBox();
                }
            };
            Deactivated += (_, __) => HideInputBox();
        }

        public void HideInputBox()
        {
            Visibility = Visibility.Hidden;
        }

        public void DisplayInputBox(object sender, NHotkey.HotkeyEventArgs args)
        {
            Visibility = Visibility.Visible;

            var helper = new WindowInteropHelper(this);
            var hwndSource = HwndSource.FromHwnd(helper.EnsureHandle());
            var transform = hwndSource.CompositionTarget.TransformFromDevice;

            var mousePoint = System.Windows.Forms.Control.MousePosition;
            var screenPoint = transform.Transform(new Point(mousePoint.X, mousePoint.Y));

            Left = screenPoint.X;
            Top = screenPoint.Y;
            WindowState = WindowState.Maximized;
            Show();
            Activate();
            Input.Focus();
        }
    }
}
