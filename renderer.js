const captureInput = document.getElementById("captureInput");
const captureButton = document.getElementById("captureButton");

function captureIdea() {
	const ideaText = captureInput.value;
	console.log(`Idea captured: ${ideaText}`);
	captureInput.value = "";
	captureInput.focus();
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
