const { app, BrowserWindow } = require("electron");

function createWindow() {
	const win = new BrowserWindow({
		width: 600,
		height: 420,
		resizable: true,
		autoHideMenuBar: true,
	});

	win.loadFile("index.html");
}

app.whenReady().then(createWindow);
