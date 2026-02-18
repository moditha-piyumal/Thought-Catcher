const searchInput = document.getElementById("searchInput");
const ideaContainer = document.getElementById("ideaContainer");

let allIdeas = [];

function formatDate(isoDate) {
	if (!isoDate) {
		return "";
	}

	const date = new Date(isoDate);
	if (Number.isNaN(date.getTime())) {
		return "";
	}

	return date.toLocaleString();
}

function groupIdeasByTag(ideas) {
	const groups = new Map();

	ideas.forEach((idea) => {
		const normalizedTag = typeof idea.tag === "string" && idea.tag.trim() ? idea.tag.trim() : "Untagged";
		if (!groups.has(normalizedTag)) {
			groups.set(normalizedTag, []);
		}
		groups.get(normalizedTag).push(idea);
	});

	const tagNames = Array.from(groups.keys()).sort((a, b) => {
		if (a === "Untagged") {
			return 1;
		}
		if (b === "Untagged") {
			return -1;
		}
		return a.localeCompare(b);
	});

	return tagNames.map((tagName) => ({
		tagName,
		ideas: groups.get(tagName) || [],
	}));
}

async function deleteIdea(ideaId, cardElement) {
	await window.ideaAPI.deleteIdea(ideaId);
	allIdeas = allIdeas.filter((idea) => idea.id !== ideaId);
	cardElement.remove();

	if (!ideaContainer.querySelector(".idea-card")) {
		renderIdeas(searchInput.value);
	}
}

function createIdeaCard(idea) {
	const card = document.createElement("div");
	card.className = "idea-card";

	const cardTop = document.createElement("div");
	cardTop.className = "card-top";

	const tagLabel = document.createElement("span");
	tagLabel.className = "tag-label";
	tagLabel.textContent = idea.tag && idea.tag.trim() ? idea.tag : "Untagged";

	const deleteButton = document.createElement("button");
	deleteButton.type = "button";
	deleteButton.className = "delete-button";
	deleteButton.textContent = "Delete";
	deleteButton.addEventListener("click", () => {
		deleteIdea(idea.id, card).catch((error) => {
			console.error("Failed to delete idea:", error);
		});
	});

	cardTop.appendChild(tagLabel);
	cardTop.appendChild(deleteButton);

	const ideaText = document.createElement("p");
	ideaText.className = "idea-text";
	ideaText.textContent = idea.text || "";

	const createdAt = document.createElement("div");
	createdAt.className = "created-at";
	createdAt.textContent = formatDate(idea.createdAt);

	card.appendChild(cardTop);
	card.appendChild(ideaText);
	card.appendChild(createdAt);

	return card;
}

function renderIdeas(searchTerm = "") {
	const normalizedSearch = searchTerm.trim().toLowerCase();
	const filteredIdeas = allIdeas.filter((idea) => {
		if (!normalizedSearch) {
			return true;
		}

		const text = typeof idea.text === "string" ? idea.text.toLowerCase() : "";
		return text.includes(normalizedSearch);
	});

	ideaContainer.innerHTML = "";

	if (!filteredIdeas.length) {
		const emptyState = document.createElement("div");
		emptyState.className = "empty-state";
		emptyState.textContent = "No ideas found.";
		ideaContainer.appendChild(emptyState);
		return;
	}

	const groupedIdeas = groupIdeasByTag(filteredIdeas);
	groupedIdeas.forEach((group) => {
		const groupSection = document.createElement("section");
		groupSection.className = "tag-group";

		const heading = document.createElement("h2");
		heading.className = "tag-heading";
		heading.textContent = group.tagName;
		groupSection.appendChild(heading);

		group.ideas.forEach((idea) => {
			groupSection.appendChild(createIdeaCard(idea));
		});

		ideaContainer.appendChild(groupSection);
	});
}

window.addEventListener("DOMContentLoaded", async () => {
	allIdeas = await window.ideaAPI.getIdeas();
	renderIdeas();
});

searchInput.addEventListener("input", () => {
	renderIdeas(searchInput.value);
});
