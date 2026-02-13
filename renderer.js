const captureInput = document.getElementById("captureInput");

window.addEventListener("DOMContentLoaded", () => {
	captureInput.focus();
});

captureInput.addEventListener("keydown", (event) => {
	if (event.ctrlKey && event.key === "Enter") {
		console.log("Idea captured");
	}
});
