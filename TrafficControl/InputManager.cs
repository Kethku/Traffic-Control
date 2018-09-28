using Caliburn.Micro;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Forms;
using System.Windows.Interop;
using System.Windows.Media;
using Screen = System.Windows.Forms.Screen;

namespace TrafficControl
{
    public class InputManager
    {
        private Point MousePosition { get; set; }
        private Point MousePreviousPosition { get; set; }

        public InputManager()
        {
            Thread thread = new Thread(InputThread);
            thread.Start();
        }

        public void InputThread()
        {
            while (true)
            {
                try
                {
                    var mousePoint = Control.MousePosition;
                    MousePreviousPosition = MousePosition;
                    MousePosition = new Point(mousePoint.X, mousePoint.Y);
                    Bootstrapper.EventAggregator.PublishOnUIThread(new MouseEvent());
                    Thread.Sleep(16);
                }
                catch (TaskCanceledException)
                {
                    return;
                }
            }
        }

        public IEnumerable<Rect> GetScreenSizes(Window view)
        {
            var transform = GetTransform(view);
            foreach (var screen in Screen.AllScreens)
            {
                var topLeft = transform.Transform(new Point(screen.Bounds.Left, screen.Bounds.Top));
                var bottomRight = transform.Transform(new Point(screen.Bounds.Right, screen.Bounds.Bottom));

                yield return new Rect(topLeft, bottomRight);
            }
        }

        public Point GetMouseScreenPosition(Window view)
        {
            if (!view.IsLoaded) return new Point(0, 0);
            var transform = GetTransform(view);
            return transform.Transform(MousePosition);
        }

        public Point GetMousePosition(Window view)
        {
            if (!view.IsLoaded) return new Point(0, 0);
            var screenPosition = GetMouseScreenPosition(view);
            return new Point(screenPosition.X - view.Left, screenPosition.Y - view.Top);
        }

        public Point GetMouseDelta(Window view)
        {
            if (!view.IsLoaded) return new Point(0, 0);
            var transform = GetTransform(view);
            var previous = transform.Transform(MousePreviousPosition);
            var current = transform.Transform(MousePosition);

            return new Point(current.X - previous.X, current.Y - previous.Y);
        }

        public bool IsMiddleMouseButtonDown()
        {
            return (GetKeyState(VK_MBUTTON) & KEY_PRESSED) != 0;
        }

        public bool IsControlKeyDown()
        {
            return (GetKeyState(VK_CONTROL) & KEY_PRESSED) != 0;
        }

        private Matrix GetTransform(Window view)
        {
            var helper = new WindowInteropHelper(view);
            var hwndSource = HwndSource.FromHwnd(helper.EnsureHandle());
            return hwndSource.CompositionTarget.TransformFromDevice;
        }

        private const int KEY_PRESSED = 0x8000;
        private const int VK_CONTROL = 0x11;
        private const int VK_MBUTTON = 0x04;
        [DllImport("user32.dll")]
        static extern short GetKeyState(int key);
    }

    public class MouseEvent
    {
        public MouseEvent() { }
    }
}
