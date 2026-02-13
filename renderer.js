const captureInput = document.getElementById("captureInput");
const captureButton = document.getElementById("captureButton");

async function captureIdea() {
	try {
		await window.ideaAPI.saveIdea(captureInput.value);
		captureInput.value = "";
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

window.addEventListener("DOMContentLoaded", () => {
	captureInput.focus();
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
