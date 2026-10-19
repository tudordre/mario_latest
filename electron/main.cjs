const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 640,
    resizable: true,
    minWidth: 640,
    minHeight: 400,
    backgroundColor: '#1a1a2e',
    title: 'Mario Custom (PixiJS 2D)',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const distIndex = path.join(__dirname, '..', 'dist', 'index.html');
  const rootIndex = path.join(__dirname, '..', 'index.html');

  if (fs.existsSync(distIndex)) {
    win.loadFile(distIndex);
  } else {
    win.loadFile(rootIndex);
  }
  win.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
