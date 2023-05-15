const { app, BrowserWindow, ipcMain, desktopCapturer, screen } = require('electron');
const path = require('path');
const { moveMouse, mouseToggle, scrollMouse, keyToggle, typeString, setMouseDelay, setKeyboardDelay } = require('@hurdlegroup/robotjs');


setMouseDelay(0);
setKeyboardDelay(0);

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true,
			webSecurity: true,
      nativeWindowOpen: true
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle(
	'DESKTOP_CAPTURER_GET_SOURCES',
	(event, opts) => desktopCapturer.getSources(opts)
);

ipcMain.handle(
	'SCREEN_GET_ALL_DISPLAYS',
	(event) => screen.getAllDisplays()
);

ipcMain.handle(
	'MOUSE_MOVE',
	(event, x, y) => 
    moveMouse(x, y)
);

ipcMain.handle(
	'MOUSE_TOGGLE',
	(event, down, which) => mouseToggle(down, which)
);

ipcMain.handle(
	'SCROLL_MOUSE',
	(event, wheelX, wheelY) => scrollMouse(wheelX, wheelY)
);

ipcMain.handle(
	'KEY_TOGGLE',
	(event, key, down) => {
    try {
      keyToggle(key, down)
    } catch (error) {
    }
  }
);

ipcMain.handle(
	'TYPE_STRING',
	(event, key) => {
    try {
      typeString(key)
    } catch (error) {
    }
  }
);