const path = require("path");
const fs = require("fs");
const { app, BrowserWindow, ipcMain } = require("electron");

const ideasFilePath = path.join(app.getPath("userData"), "ideas.json");
const draftFilePath = path.join(app.getPath("userData"), "draft.json");
const tagsFilePath = path.join(app.getPath("userData"), "tags.json");

async function ensureIdeasFile() {
	try {
		await fs.promises.access(ideasFilePath);
	} catch {
		await fs.promises.writeFile(ideasFilePath, "[]", "utf8");
	}
}

async function ensureTagsFile() {
	try {
		await fs.promises.access(tagsFilePath);
	} catch {
		await fs.promises.writeFile(tagsFilePath, "[]", "utf8");
	}
}

async function readTags() {
	await ensureTagsFile();
	const fileContents = await fs.promises.readFile(tagsFilePath, "utf8");
	const parsedTags = JSON.parse(fileContents);
	return Array.isArray(parsedTags) ? parsedTags : [];
}

async function writeTags(tags) {
	await fs.promises.writeFile(tagsFilePath, JSON.stringify(tags, null, 2), "utf8");
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

ipcMain.handle("save-idea", async (event, ideaText, selectedTag) => {
	await ensureIdeasFile();

	const fileContents = await fs.promises.readFile(ideasFilePath, "utf8");
	const ideas = JSON.parse(fileContents);
	const idea = {
		id: Date.now().toString(),
		text: ideaText,
		createdAt: new Date().toISOString(),
		tag: selectedTag || null,
	};

	ideas.push(idea);
	await fs.promises.writeFile(ideasFilePath, JSON.stringify(ideas, null, 2), "utf8");
	return idea;
});

ipcMain.handle("get-tags", async () => {
	return readTags();
});

ipcMain.handle("create-tag", async (event, tagName) => {
	if (typeof tagName !== "string") {
		return readTags();
	}

	const trimmedTagName = tagName.trim();
	if (!trimmedTagName) {
		return readTags();
	}

	const tags = await readTags();
	if (tags.includes(trimmedTagName)) {
		return tags;
	}

	tags.push(trimmedTagName);
	await writeTags(tags);
	return tags;
});

ipcMain.handle("save-draft", async (event, text) => {
	if (!text || text.trim() === "") {
		try {
			await fs.promises.unlink(draftFilePath);
		} catch {
			// Ignore missing file or delete errors.
		}
		return;
	}

	const draftPayload = {
		text,
	};

	await fs.promises.writeFile(draftFilePath, JSON.stringify(draftPayload, null, 2), "utf8");
});

ipcMain.handle("load-draft", async () => {
	try {
		const fileContents = await fs.promises.readFile(draftFilePath, "utf8");
		const draft = JSON.parse(fileContents);
		return typeof draft.text === "string" ? draft.text : "";
	} catch {
		return "";
	}
});

app.whenReady().then(createWindow);
