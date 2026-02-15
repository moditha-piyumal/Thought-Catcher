const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ideaAPI", {
	saveIdea: (idea) => ipcRenderer.invoke("save-idea", idea),
	saveDraft: (text) => ipcRenderer.invoke("save-draft", text),
	loadDraft: () => ipcRenderer.invoke("load-draft"),
});
