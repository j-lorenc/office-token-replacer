import { app, BrowserWindow, Menu, MenuItem } from 'electron';
import * as path from 'path';
import * as url from 'url';
let win: BrowserWindow | null = null;

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (!win) {
    createWindow();
  }
});

const createWindow = () => {
  win = new BrowserWindow({
    title: 'Office Token Replacer',
    width: 300,
    height: 560,
    resizable: false,
    icon: path.join(__dirname, '../../', 'resources/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload', 'preload.js'),
      contextIsolation: true,
    },
  });

  const fileMenuItem = new MenuItem({ role: 'fileMenu' });
  const viewMenuItem = new MenuItem({
    label: 'View',
    submenu: [
      {
        role: 'reload',
      },
    ],
  });

  const appMenu = new Menu();
  appMenu.append(fileMenuItem);
  appMenu.append(viewMenuItem);
  Menu.setApplicationMenu(appMenu);

  const localUrl = url.pathToFileURL(path.join(__dirname, '../renderer/', 'index.html'));

  if (process.env.NODE_ENV !== 'production') {
    win.loadURL(`http://localhost:2003`);
  } else {
    win.loadURL(localUrl.toString());
  }

  win.once('ready-to-show', () => {
    if (win) {
      win.show();
    }
  });

  win.on('closed', () => {
    win = null;
  });
};
