const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ideaAPI", {
	saveIdea: (ideaText, selectedTag) => ipcRenderer.invoke("save-idea", ideaText, selectedTag),
	saveDraft: (text) => ipcRenderer.invoke("save-draft", text),
	loadDraft: () => ipcRenderer.invoke("load-draft"),
	getTags: () => ipcRenderer.invoke("get-tags"),
	createTag: (tagName) => ipcRenderer.invoke("create-tag", tagName),
});
