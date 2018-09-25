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
        public const double NON_INTERACTING_TRANSPARENCY = 0.8;

        public double WindowLeft { get; set; }
        public double WindowTop { get; set; }

        public string Address { get; set; }

        public Point MouseCenter { get; set; }

        public bool ControlDown { get; set; }

        public double TargetRadius => ControlDown ? 0.0 : PEEK_RADIUS;
        public double Radius { get; set; }
        public double RadiusX => Radius / ((Window)GetView()).Width;
        public double RadiusY => Radius / ((Window)GetView()).Height;

        public double TargetCenterOpacity => ControlDown ? 1.0 : 0.0;
        public double CenterOpacity { get; set; }
        public Color TransparentColor => Color.FromArgb((byte)(CenterOpacity * 255.0), 0, 0, 0);

        public double TargetOuterOpacity => ControlDown ? 1.0 : NON_INTERACTING_TRANSPARENCY;
        public double OuterOpacity { get; set; }
        public Color SolidColor => Color.FromArgb((byte)(OuterOpacity * 255.0), 0, 0, 0);

        public PipViewModel(string address)
        {
            Bootstrapper.EventAggregator.Subscribe(this);
            CompositionTarget.Rendering += Rendering;
            Address = address;
            OuterOpacity = 0.0;
        }

        public void Close()
        {
            Bootstrapper.EventAggregator.Unsubscribe(this);
            Window view = (Window)GetView();
            view.Close();
        }

        private void Rendering(object sender, EventArgs e)
        {
            CenterOpacity += (TargetCenterOpacity - CenterOpacity) * 0.2;
            OuterOpacity += (TargetOuterOpacity - OuterOpacity) * 0.05;
            Radius += (TargetRadius - Radius) * 0.05;
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
