using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Forms;
using System.Windows.Interop;

using Application = System.Windows.Application;

namespace TrafficControl
{
    public static class WindowsUtils
    {
        private static NotifyIcon notifyIcon;

        public static void HideFromTaskSwitcher(Window window)
        {
            WindowInteropHelper wndHelper = new WindowInteropHelper(window);

            int exStyle = (int)GetWindowLong(wndHelper.Handle, (int)GetWindowLongFields.GWL_EXSTYLE);

            exStyle |= (int)ExtendedWindowStyles.WS_EX_TOOLWINDOW;
            SetWindowLong(wndHelper.Handle, (int)GetWindowLongFields.GWL_EXSTYLE, (IntPtr)exStyle);
        }

        public static void SetupNotificationIcon()
        {
            notifyIcon = new NotifyIcon();
            notifyIcon.Icon = SystemIcons.Application;
            notifyIcon.Visible = true;

            var contextMenu = new ContextMenu();
            var quitMenuItem = new MenuItem();
            var helpMenuItem = new MenuItem();

            contextMenu.MenuItems.Add(quitMenuItem);
            quitMenuItem.Index = 0;
            quitMenuItem.Text = "Quit";
            quitMenuItem.Click += (_, __) => Application.Current.Shutdown();

            contextMenu.MenuItems.Add(helpMenuItem);
            helpMenuItem.Index = 1;
            helpMenuItem.Text = "Show Help";
            helpMenuItem.Click += (_, __) => TrafficControl.Bootstrapper.ShowHelp();

            notifyIcon.ContextMenu = contextMenu;
            notifyIcon.DoubleClick += (_, __) => TrafficControl.Bootstrapper.ShowHelp();
        }

        public static void ShowNotification(string title, string body)
        {
            notifyIcon.BalloonTipTitle = title;
            notifyIcon.BalloonTipText = body;
            notifyIcon.ShowBalloonTip(10000);
        }

        public static void HideNotificationIcon()
        {
            notifyIcon.Visible = false;
        }

        [Flags]
        private enum ExtendedWindowStyles
        {
            // ...
            WS_EX_TOOLWINDOW = 0x00000080,
            // ...
        }

        private enum GetWindowLongFields
        {
            // ...
            GWL_EXSTYLE = (-20),
            // ...
        }

        [DllImport("user32.dll")]
        private static extern IntPtr GetWindowLong(IntPtr hWnd, int nIndex);

        private static IntPtr SetWindowLong(IntPtr hWnd, int nIndex, IntPtr dwNewLong)
        {
            int error = 0;
            IntPtr result = IntPtr.Zero;
            // Win32 SetWindowLong doesn't clear error on success
            SetLastError(0);

            if (IntPtr.Size == 4)
            {
                // use SetWindowLong
                Int32 tempResult = IntSetWindowLong(hWnd, nIndex, IntPtrToInt32(dwNewLong));
                error = Marshal.GetLastWin32Error();
                result = new IntPtr(tempResult);
            }
            else
            {
                // use SetWindowLongPtr
                result = IntSetWindowLongPtr(hWnd, nIndex, dwNewLong);
                error = Marshal.GetLastWin32Error();
            }

            if ((result == IntPtr.Zero) && (error != 0))
            {
                throw new System.ComponentModel.Win32Exception(error);
            }

            return result;
        }

        [DllImport("user32.dll", EntryPoint = "SetWindowLongPtr", SetLastError = true)]
        private static extern IntPtr IntSetWindowLongPtr(IntPtr hWnd, int nIndex, IntPtr dwNewLong);

        [DllImport("user32.dll", EntryPoint = "SetWindowLong", SetLastError = true)]
        private static extern Int32 IntSetWindowLong(IntPtr hWnd, int nIndex, Int32 dwNewLong);

        private static int IntPtrToInt32(IntPtr intPtr)
        {
            return unchecked((int)intPtr.ToInt64());
        }

        [DllImport("kernel32.dll", EntryPoint = "SetLastError")]
        public static extern void SetLastError(int dwErrorCode);
    }
}
