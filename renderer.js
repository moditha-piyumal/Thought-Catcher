const captureInput = document.getElementById("captureInput");
const captureButton = document.getElementById("captureButton");
const viewIdeasButton = document.getElementById("viewIdeasButton");
const tagSelect = document.getElementById("tagSelect");
const newTagInput = document.getElementById("newTagInput");
const addTagButton = document.getElementById("addTagButton");

const DRAFT_SAVE_DELAY_MS = 600;
let draftSaveTimer = null;

function scheduleDraftSave() {
	if (draftSaveTimer) {
		clearTimeout(draftSaveTimer);
	}

	draftSaveTimer = setTimeout(() => {
		window.ideaAPI.saveDraft(captureInput.value).catch((error) => {
			console.error("Failed to save draft:", error);
		});
	}, DRAFT_SAVE_DELAY_MS);
}

async function populateTags(selectedTag = "") {
	const tags = await window.ideaAPI.getTags();
	tagSelect.innerHTML = "";

	const defaultOption = document.createElement("option");
	defaultOption.value = "";
	defaultOption.textContent = "No tag";
	tagSelect.appendChild(defaultOption);

	tags.forEach((tag) => {
		const option = document.createElement("option");
		option.value = tag;
		option.textContent = tag;
		tagSelect.appendChild(option);
	});

	tagSelect.value = tags.includes(selectedTag) ? selectedTag : "";
}

async function handleCreateTag() {
	const rawTagName = newTagInput.value;
	const tagName = rawTagName.trim();
	if (!tagName) {
		return;
	}

	await window.ideaAPI.createTag(tagName);
	await populateTags(tagName);
	newTagInput.value = "";
	newTagInput.focus();
}

async function captureIdea() {
	try {
		await window.ideaAPI.saveIdea({
			text: captureInput.value,
			tag: tagSelect.value,
		});
		captureInput.value = "";
		tagSelect.value = "";
		await window.ideaAPI.saveDraft("");
		captureInput.focus();

		const originalBackground = captureInput.style.backgroundColor;
		captureInput.style.backgroundColor = "#f3fff3";
		setTimeout(() => {
			captureInput.style.backgroundColor = originalBackground;
		}, 120);
	} catch (error) {
		console.error("Failed to save idea:", error);
	}
}

window.addEventListener("DOMContentLoaded", async () => {
	const draftText = await window.ideaAPI.loadDraft();
	if (draftText) {
		captureInput.value = draftText;
	}

	await populateTags();

	window.ideaAPI.onTagsUpdated(async () => {
		await populateTags();
	});

	captureInput.focus();
	const cursorPosition = captureInput.value.length;
	captureInput.setSelectionRange(cursorPosition, cursorPosition);
});

captureInput.addEventListener("input", () => {
	scheduleDraftSave();
});

captureInput.addEventListener("keydown", (event) => {
	if (event.ctrlKey && event.key === "Enter") {
		event.preventDefault();
		captureIdea();
	}
});

captureButton.addEventListener("click", () => {
	captureIdea();
});

viewIdeasButton.addEventListener("click", () => {
	window.ideaAPI.openManagerWindow().catch((error) => {
		console.error("Failed to open manager window:", error);
	});
});

addTagButton.addEventListener("click", () => {
	handleCreateTag();
});

newTagInput.addEventListener("keydown", (event) => {
	if (event.key === "Enter") {
		event.preventDefault();
		handleCreateTag();
	}
});
