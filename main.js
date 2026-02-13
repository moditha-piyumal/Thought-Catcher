const path = require("path");
const fs = require("fs");
const { app, BrowserWindow, ipcMain } = require("electron");

const ideasFilePath = path.join(app.getPath("userData"), "ideas.json");

async function ensureIdeasFile() {
	try {
		await fs.promises.access(ideasFilePath);
	} catch {
		await fs.promises.writeFile(ideasFilePath, "[]", "utf8");
	}
}

function createWindow() {
	const win = new BrowserWindow({
		width: 600,
		height: 420,
		resizable: true,
		autoHideMenuBar: true,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	win.loadFile("index.html");
}

ipcMain.handle("save-idea", async (event, ideaText) => {
	await ensureIdeasFile();

	const fileContents = await fs.promises.readFile(ideasFilePath, "utf8");
	const ideas = JSON.parse(fileContents);
	const idea = {
		id: Date.now().toString(),
		text: ideaText,
		createdAt: new Date().toISOString(),
		tag: null,
	};

	ideas.push(idea);
	await fs.promises.writeFile(ideasFilePath, JSON.stringify(ideas, null, 2), "utf8");
	return idea;
});

app.whenReady().then(createWindow);
