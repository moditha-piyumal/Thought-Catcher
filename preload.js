const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ideaAPI", {
	saveIdea: (idea) => ipcRenderer.invoke("save-idea", idea),
	saveDraft: (text) => ipcRenderer.invoke("save-draft", text),
	loadDraft: () => ipcRenderer.invoke("load-draft"),
	getTags: () => ipcRenderer.invoke("get-tags"),
	createTag: (tagName) => ipcRenderer.invoke("create-tag", tagName),
});
