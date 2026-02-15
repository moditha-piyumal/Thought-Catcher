const captureInput = document.getElementById("captureInput");
const tagSelect = document.getElementById("tagSelect");
const captureButton = document.getElementById("captureButton");

const DRAFT_SAVE_DELAY_MS = 600;
const CREATE_TAG_OPTION_VALUE = "__create_new_tag__";
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

function populateTagDropdown(tags, selectedTag = null) {
	tagSelect.innerHTML = "";

	const noTagOption = document.createElement("option");
	noTagOption.value = "";
	noTagOption.textContent = "No tag";
	tagSelect.appendChild(noTagOption);

	tags.forEach((tag) => {
		const option = document.createElement("option");
		option.value = tag;
		option.textContent = tag;
		tagSelect.appendChild(option);
	});

	const createTagOption = document.createElement("option");
	createTagOption.value = CREATE_TAG_OPTION_VALUE;
	createTagOption.textContent = "+ Create New Tag";
	tagSelect.appendChild(createTagOption);

	tagSelect.value = selectedTag && tags.includes(selectedTag) ? selectedTag : "";
}

async function loadTags(selectedTag = null) {
	const tags = await window.ideaAPI.getTags();
	populateTagDropdown(tags, selectedTag);
	return tags;
}

async function handleTagSelection() {
	if (tagSelect.value !== CREATE_TAG_OPTION_VALUE) {
		return;
	}

	const newTagName = prompt("Enter new tag name:");
	if (newTagName === null) {
		tagSelect.value = "";
		return;
	}

	const trimmedTagName = newTagName.trim();
	if (!trimmedTagName) {
		tagSelect.value = "";
		return;
	}

	const updatedTags = await window.ideaAPI.createTag(trimmedTagName);
	populateTagDropdown(updatedTags, trimmedTagName);
}

async function captureIdea() {
	try {
		const selectedTag = tagSelect.value && tagSelect.value !== CREATE_TAG_OPTION_VALUE ? tagSelect.value : null;
		await window.ideaAPI.saveIdea(captureInput.value, selectedTag);
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

	await loadTags();

	captureInput.focus();
	const cursorPosition = captureInput.value.length;
	captureInput.setSelectionRange(cursorPosition, cursorPosition);
});

captureInput.addEventListener("input", () => {
	scheduleDraftSave();
});

tagSelect.addEventListener("change", () => {
	handleTagSelection().catch((error) => {
		console.error("Failed to handle tag selection:", error);
	});
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
