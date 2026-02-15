const captureInput = document.getElementById("captureInput");
const captureButton = document.getElementById("captureButton");

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

async function captureIdea() {
	try {
		await window.ideaAPI.saveIdea(captureInput.value);
		captureInput.value = "";
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
