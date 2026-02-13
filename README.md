# Thought-Catcher

Thought-Catcher is a lightning-fast desktop idea capture tool designed to eliminate cognitive friction.

Launch → Type → Save → Close.

No distractions. No bloat. Just capture.

---

## 🚀 Core Philosophy

**Capture fast. Evaluate later. Never block the brain.**

If a feature slows idea capture, it does not belong in this application.

Thought-Catcher is infrastructure — not a note-taking platform.

---

## ⚙️ Tech Stack

- Electron
- Vanilla JavaScript
- Local JSON storage
- No frameworks
- No database

Priority: **Speed > Visual Polish**

---

## 📌 Core Features

### Instant Launch

App opens quickly with the cursor immediately focused inside the input field.

### Draft Auto-Save

Prevents idea loss if the app closes unexpectedly.

**Draft ≠ Saved Idea**

Draft exists only for crash protection.

---

### Commit Idea

`Ctrl + Enter` saves the idea.

Each idea stores:

```json
{
	"id": "uuid-or-timestamp",
	"text": "idea content",
	"tag": "selected-tag OR null",
	"createdAt": "ISO timestamp"
}
```

After saving:

- Textbox clears
- Draft resets
- Cursor remains ready

No popups. No friction.

---

## 🏷️ Tag System

Lightweight and fully editable.

### Must Support:

- Create tag
- Rename tag
- Delete tag (with confirmation)

When a tag is deleted:

👉 Ideas become **Untagged**  
(Never delete ideas automatically.)

---

### Tag Rules

- Only **ONE tag per idea**
- Tags appear below the entry field with low visual prominence
- Tagging must never slow idea capture
- If no tag is selected → idea is stored as **Untagged**

---

## 📚 Idea Manager Window

Separate from the capture window.

Purpose: Viewing and organizing — NOT capturing.

Ideas must be grouped by tag:

```
Software
   Idea
Education
   Idea

Untagged
   Idea
```

### Idea Actions:

**Delete Idea**

- Fast
- Minimal confirmation

**Promote Idea**

- Copy idea text to clipboard
- No integrations yet (avoid scope creep)

UI must remain simple and highly readable.

---

## 💾 Data Storage (CRITICAL)

User data must NEVER be stored inside the project directory.

Always use Electron’s userData path:

```javascript
app.getPath("userData");
```

Example Windows location:

```
C:\Users\<User>\AppData\Roaming\Thought-Catcher
```

---

### Required Files

Store inside userData:

```
ideas.json
tags.json
draft.json
```

### Why This Matters

- Safe during application updates
- Prevents accidental data loss
- Follows professional desktop standards
- Separates application code from user data

---

## ❗ Hard Constraints

Do NOT implement:

- Global hotkey
- System tray
- Cloud sync
- Rich text
- Markdown
- Multiple tags
- AI features
- Themes
- Attachments
- Notifications

If unsure → choose the simpler path.

Speed is the product.

---

## 🧠 Success Metric

The app succeeds when:

**Idea → Launch → Typing → Ctrl+Enter**

takes under **3 seconds.**

Not beauty.  
Not feature count.

**Speed.**

---

## 🏗️ Development Plan

### 1. Configure Capture Window

Create a minimal, fast-loading window.  
Do not finalize size yet.

---

### 2. Enforce Instant Cursor Focus

User must be able to type immediately without clicking.

---

### 3. Implement Draft Auto-Save

Debounce (~500–700ms).  
Restore draft automatically on reopen.

---

### 4. Build Commit Flow

`Ctrl + Enter` saves the idea → clears input → keeps cursor ready.

---

### 5. Create Editable Tag System

Lightweight creation, rename, and deletion.

Deleting a tag must NOT delete associated ideas.

---

### 6. Auto-Assign Selected Tag

If no tag is selected → store as Untagged.

Never force categorization.

---

### 7. Build Idea Manager Window

Display ideas grouped by tag for easy scanning.

Readable > Fancy UI.

---

### 8. Add Idea Actions

- Delete
- Promote (clipboard)

Avoid integrations for Version 1.

---

### 9. Smart Close Behavior

Closing the window exits the app completely.

No background processes.  
No RAM usage.

Draft must persist.

---

### 10. Optimize Launch Speed

The app must feel faster than opening Notepad.

Avoid heavy imports.  
Keep renderer lean.

Speed is a feature.

---

## 🎯 Product Identity

Thought-Catcher is not competing with note apps.

It is your **Idea Inbox** — a rapid-fire cognitive capture tool.

Minimal tools become lifelong tools.

Build small.  
Ship fast.  
Iterate later.
