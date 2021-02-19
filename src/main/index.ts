import { app, BrowserWindow } from 'electron';
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
    title: 'electron-quick-start-typescript-react',
    webPreferences: {
      preload: path.join(__dirname, '../preload', 'preload.js'),
      contextIsolation: true,
    },
  });

  const localUrl = url.pathToFileURL(path.join(__dirname, '../renderer/', 'index.html'));

  if (process.env.NODE_ENV !== 'production') {
    win.loadURL(`http://localhost:2003`);
  } else {
    win.loadURL(localUrl.toString());
  }

  win.once('ready-to-show', () => {
    if (win) {
      win.maximize();
      win.show();
    }
  });

  win.on('closed', () => {
    win = null;
  });
};
