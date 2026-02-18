const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ideaAPI", {
	saveIdea: (idea) => ipcRenderer.invoke("save-idea", idea),
	getIdeas: () => ipcRenderer.invoke("get-ideas"),
	deleteIdea: (ideaId) => ipcRenderer.invoke("delete-idea", ideaId),
	openManagerWindow: () => ipcRenderer.invoke("open-manager-window"),
	saveDraft: (text) => ipcRenderer.invoke("save-draft", text),
	loadDraft: () => ipcRenderer.invoke("load-draft"),
	getTags: () => ipcRenderer.invoke("get-tags"),
	createTag: (tagName) => ipcRenderer.invoke("create-tag", tagName),
	deleteTag: (tagName) => ipcRenderer.invoke("delete-tag", tagName),
});
