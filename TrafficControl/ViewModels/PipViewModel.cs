using Caliburn.Micro;
using CefSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Threading;
using TrafficControl.Views;

namespace TrafficControl.ViewModels
{
    public class PipViewModel : ViewAware, IHandle<MouseEvent>
    {
        public const double PEEK_RADIUS = 250;

        public double WindowLeft { get; set; }
        public double WindowTop { get; set; }

        public double WindowWidth { get; set; }
        public double WindowHeight { get; set; }

        public string Address { get; set; }

        public Point MouseCenter { get; set; }

        public bool ControlDown { get; set; }
        public bool IsLoading { get; set; }

        public double TargetRadius => ControlDown ? 0.0 : PEEK_RADIUS;
        public double Radius { get; set; }
        public double RadiusX => Radius / ((Window)GetView()).Width;
        public double RadiusY => Radius / ((Window)GetView()).Height;

        public double TargetCenterOpacity => IsLoading ? 0.0 : (ControlDown ? 1.0 : 0.0);
        public double CenterOpacity { get; set; }
        public Color TransparentColor => Color.FromArgb((byte)(CenterOpacity * 255.0), 0, 0, 0);

        public double TargetOuterOpacity => IsLoading ? 0.0 : 1.0;
        public double OuterOpacity { get; set; }
        public Color SolidColor => Color.FromArgb((byte)(OuterOpacity * 255.0), 0, 0, 0);

        private double initialAspectRatio;
        private string initScript;

        public PipViewModel(string address, double initialAspectRatio, string initScript)
        {
            Bootstrapper.EventAggregator.Subscribe(this);
            CompositionTarget.Rendering += Rendering;

            Address = address;
            this.initialAspectRatio = initialAspectRatio;
            this.initScript = initScript;

            IsLoading = true;
            OuterOpacity = 0.0;
            ViewAttached += PipViewModel_ViewAttached;
        }

        private void PipViewModel_ViewAttached(object sender, ViewAttachedEventArgs e)
        {
            var view = (PipView)e.View;
            view.Browser.LoadingStateChanged += LoadingStateChanged;
        }

        public void Loaded()
        {
            var view = (PipView)GetView();
            WindowsUtils.HideFromTaskSwitcher(view);

            var inputManager = Bootstrapper.InputManager;

            var mousePosition = inputManager.GetMouseScreenPosition(view);
            var screens = inputManager.GetScreenSizes(view);

            foreach (var screen in screens)
            {
                if (screen.Contains(mousePosition))
                {
                    WindowWidth = screen.Width * 0.3;https://www.youtube.com/watch?v=5qM278YSN2s
                    WindowHeight = WindowWidth / initialAspectRatio;

                    WindowLeft = screen.Right - WindowWidth - 20;
                    WindowTop = screen.Bottom - WindowHeight - 60;
                    break;
                }
            }
        }

        public void Close()
        {
            Bootstrapper.EventAggregator.Unsubscribe(this);
            var view = (PipView)GetView();
            view.Close();
        }

        public void Closing()
        {
            var view = (PipView)GetView();
            view.Browser.Dispose();
        }

        private void Rendering(object sender, EventArgs e)
        {
            CenterOpacity += (TargetCenterOpacity - CenterOpacity) * 0.2;
            OuterOpacity += (TargetOuterOpacity - OuterOpacity) * 0.05;
            Radius += (TargetRadius - Radius) * 0.05;
        }

        public void LoadingStateChanged(object sender, LoadingStateChangedEventArgs args)
        {
            Application.Current.Dispatcher.Invoke(() =>
            {
                var wasLoading = IsLoading;
                IsLoading = args.IsLoading && !IsLoading;

                if (wasLoading && !IsLoading)
                {
                    var view = (PipView)GetView();
                    view.Browser.ExecuteScriptAsync(initScript);
                }
            });
        }

        bool previousSet = false;
        Point previousPosition;
        public void Handle(MouseEvent message)
        {
            var view = (PipView)GetView();
            var mousePosition = Bootstrapper.InputManager.GetMousePosition(view);
            var x = mousePosition.X / view.Width;
            var y = mousePosition.Y / view.Height;
            MouseCenter = new Point(x, y);
            ControlDown = Bootstrapper.InputManager.IsControlKeyDown();

            if (ControlDown && Bootstrapper.InputManager.IsMiddleMouseButtonDown())
            {
                var position = Bootstrapper.InputManager.GetMouseScreenPosition((Window)GetView());
                if (previousSet)
                {
                    WindowLeft += position.X - previousPosition.X;
                    WindowTop += position.Y - previousPosition.Y;
                }
                previousPosition = position;
                previousSet = true;
            }
            else
            {
                previousSet = false;
            }
        }
    }
}
