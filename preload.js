const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ideaAPI", {
	saveIdea: (idea) => ipcRenderer.invoke("save-idea", idea),
});
