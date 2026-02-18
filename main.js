const path = require("path");
const fs = require("fs");
const { app, BrowserWindow, ipcMain } = require("electron");

const ideasFilePath = path.join(app.getPath("userData"), "ideas.json");
const draftFilePath = path.join(app.getPath("userData"), "draft.json");
const tagsFilePath = path.join(app.getPath("userData"), "tags.json");

let managerWindow = null;

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

function createWindow() {
	const win = new BrowserWindow({
		width: 600,
		height: 600,
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

function createManagerWindow() {
	if (managerWindow && !managerWindow.isDestroyed()) {
		managerWindow.show();
		managerWindow.focus();
		return;
	}

	managerWindow = new BrowserWindow({
		width: 900,
		height: 700,
		resizable: true,
		autoHideMenuBar: true,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	managerWindow.loadFile("manager.html");

	managerWindow.on("closed", () => {
		managerWindow = null;
	});
}

ipcMain.handle("save-idea", async (event, payload) => {
	await ensureIdeasFile();

	const providedText = typeof payload?.text === "string" ? payload.text : "";
	const providedTag = typeof payload?.tag === "string" ? payload.tag : "";

	const fileContents = await fs.promises.readFile(ideasFilePath, "utf8");
	const ideas = JSON.parse(fileContents);
	const idea = {
		id: Date.now().toString(),
		text: providedText,
		createdAt: new Date().toISOString(),
		tag: providedTag || null,
	};

	ideas.push(idea);
	await fs.promises.writeFile(
		ideasFilePath,
		JSON.stringify(ideas, null, 2),
		"utf8",
	);
	return idea;
});

ipcMain.handle("get-ideas", async () => {
	try {
		const fileContents = await fs.promises.readFile(ideasFilePath, "utf8");
		const ideas = JSON.parse(fileContents);
		return Array.isArray(ideas) ? ideas : [];
	} catch {
		return [];
	}
});

ipcMain.handle("delete-idea", async (event, ideaId) => {
	try {
		const fileContents = await fs.promises.readFile(ideasFilePath, "utf8");
		const ideas = JSON.parse(fileContents);
		const filteredIdeas = Array.isArray(ideas)
			? ideas.filter((idea) => idea && idea.id !== ideaId)
			: [];
		await fs.promises.writeFile(
			ideasFilePath,
			JSON.stringify(filteredIdeas, null, 2),
			"utf8",
		);
		return filteredIdeas;
	} catch {
		return [];
	}
});

ipcMain.handle("update-idea-tag", async (event, { ideaId, newTag }) => {
	await ensureIdeasFile();

	const fileContents = await fs.promises.readFile(ideasFilePath, "utf8");
	const ideas = JSON.parse(fileContents);
	const updatedIdeas = Array.isArray(ideas)
		? ideas.map((idea) => {
				if (idea && idea.id === ideaId) {
					return {
						...idea,
						tag: newTag || null,
					};
				}
				return idea;
		  })
		: [];

	await fs.promises.writeFile(
		ideasFilePath,
		JSON.stringify(updatedIdeas, null, 2),
		"utf8",
	);

	return updatedIdeas;
});

ipcMain.handle("open-manager-window", () => {
	createManagerWindow();
});

ipcMain.handle("get-tags", async () => {
	await ensureTagsFile();
	const fileContents = await fs.promises.readFile(tagsFilePath, "utf8");
	return JSON.parse(fileContents);
});

ipcMain.handle("create-tag", async (event, tagName) => {
	await ensureTagsFile();

	const normalizedTag = typeof tagName === "string" ? tagName.trim() : "";
	const fileContents = await fs.promises.readFile(tagsFilePath, "utf8");
	const tags = JSON.parse(fileContents);

	if (!normalizedTag || tags.includes(normalizedTag)) {
		return tags;
	}

	tags.push(normalizedTag);
	await fs.promises.writeFile(
		tagsFilePath,
		JSON.stringify(tags, null, 2),
		"utf8",
	);
	return tags;
});

ipcMain.handle("delete-tag", async (event, tagName) => {
	if (tagName === "Untagged") {
		return;
	}

	await ensureTagsFile();
	await ensureIdeasFile();

	const normalizedTag = typeof tagName === "string" ? tagName.trim() : "";
	if (!normalizedTag) {
		return;
	}

	const tagsFileContents = await fs.promises.readFile(tagsFilePath, "utf8");
	const tags = JSON.parse(tagsFileContents);
	const updatedTags = Array.isArray(tags)
		? tags.filter((tag) => tag !== normalizedTag)
		: [];
	await fs.promises.writeFile(
		tagsFilePath,
		JSON.stringify(updatedTags, null, 2),
		"utf8",
	);

	const ideasFileContents = await fs.promises.readFile(ideasFilePath, "utf8");
	const ideas = JSON.parse(ideasFileContents);
	const updatedIdeas = Array.isArray(ideas)
		? ideas.map((idea) => {
				if (idea && idea.tag === normalizedTag) {
					return {
						...idea,
						tag: null,
					};
				}
				return idea;
		  })
		: [];
	await fs.promises.writeFile(
		ideasFilePath,
		JSON.stringify(updatedIdeas, null, 2),
		"utf8",
	);

	BrowserWindow.getAllWindows().forEach((window) => {
		window.webContents.send("tags-updated");
	});
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

	await fs.promises.writeFile(
		draftFilePath,
		JSON.stringify(draftPayload, null, 2),
		"utf8",
	);
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
