const MAX_CLASSES = 8;
const STORAGE_KEY = "noterom_classes";

const classDateInput = document.getElementById("classDate");
const addClassButton = document.getElementById("addClassButton");
const classList = document.getElementById("classList");
const classModal = document.getElementById("classModal");
const closeModalButton = document.getElementById("closeModalButton");
const classForm = document.getElementById("classForm");
const classNameInput = document.getElementById("className");
const startTimeInput = document.getElementById("startTime");
const endTimeInput = document.getElementById("endTime");
const durationTimeInput = document.getElementById("durationTime");
const classModeStatus = document.getElementById("classModeStatus");
const classModeText = document.getElementById("classModeText");
const activeClassDetail = document.getElementById("activeClassDetail");
const notesEditor = document.getElementById("notesEditor");
const saveNotesButton = document.getElementById("saveNotesButton");
const liveClock = document.getElementById("liveClock");

let classes = loadClasses();
let selectedClassId = null;

function loadClasses() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }
  try {
    return JSON.parse(stored);
  } catch (error) {
    return [];
  }
}

function saveClasses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
}

function formatTimeRange(entry) {
  return `${entry.start} → ${entry.end}`;
}

function getTodayDateString() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function computeEndFromDuration(startTime, durationTime) {
  if (!durationTime) {
    return null;
  }
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [durHours, durMinutes] = durationTime.split(":").map(Number);
  if (Number.isNaN(startHours) || Number.isNaN(durHours)) {
    return null;
  }
  const totalMinutes = startHours * 60 + startMinutes + durHours * 60 + durMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
}

function renderClasses() {
  classList.innerHTML = "";
  if (classes.length === 0) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "No classes scheduled yet.";
    classList.appendChild(empty);
    return;
  }

  classes.forEach((entry) => {
    const card = document.createElement("div");
    card.className = "class-card";
    if (entry.id === selectedClassId) {
      card.classList.add("active");
    }

    const title = document.createElement("h4");
    title.textContent = entry.name;

    const meta = document.createElement("div");
    meta.className = "class-meta";
    meta.textContent = `${entry.date} · ${formatTimeRange(entry)}`;

    const actions = document.createElement("div");
    actions.className = "class-actions";

    const selectButton = document.createElement("button");
    selectButton.textContent = "Focus";
    selectButton.addEventListener("click", () => {
      selectedClassId = entry.id;
      updateActiveClass();
      renderClasses();
    });

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      classes = classes.filter((item) => item.id !== entry.id);
      if (selectedClassId === entry.id) {
        selectedClassId = null;
      }
      saveClasses();
      updateActiveClass();
      renderClasses();
    });

    actions.appendChild(selectButton);
    actions.appendChild(removeButton);

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(actions);
    classList.appendChild(card);
  });
}

function updateActiveClass() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const currentTime = now.toTimeString().slice(0, 5);

  const active = classes.find((entry) => {
    return (
      entry.date === today &&
      currentTime >= entry.start &&
      currentTime <= entry.end
    );
  });

  const focused = classes.find((entry) => entry.id === selectedClassId) || active;
  const modeActive = Boolean(active);

  classModeStatus.classList.toggle("active", modeActive);
  classModeText.textContent = modeActive
    ? `Active: ${active.name} (${formatTimeRange(active)})`
    : "No class active";

  if (focused) {
    activeClassDetail.innerHTML = `
      <h3>${focused.name}</h3>
      <p>${focused.date} · ${formatTimeRange(focused)}</p>
    `;
    notesEditor.innerHTML = focused.notes || "";
  } else {
    activeClassDetail.innerHTML = `
      <h3>Active Class</h3>
      <p>Select a class or wait for the scheduled time.</p>
    `;
    notesEditor.innerHTML = "";
  }
}

function openModal() {
  if (classes.length >= MAX_CLASSES) {
    alert("Only 8 classes are allowed.");
    return;
  }
  classModal.classList.add("active");
  classModal.setAttribute("aria-hidden", "false");
  classNameInput.focus();
}

function closeModal() {
  classModal.classList.remove("active");
  classModal.setAttribute("aria-hidden", "true");
  classForm.reset();
}

function saveNotes() {
  if (!selectedClassId) {
    alert("Select a class to save notes.");
    return;
  }
  classes = classes.map((entry) => {
    if (entry.id === selectedClassId) {
      return { ...entry, notes: notesEditor.innerHTML };
    }
    return entry;
  });
  saveClasses();
}

function tickClock() {
  const now = new Date();
  liveClock.textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

classDateInput.value = getTodayDateString();
renderClasses();
updateActiveClass();
setInterval(updateActiveClass, 30000);
setInterval(tickClock, 1000);

addClassButton.addEventListener("click", openModal);
closeModalButton.addEventListener("click", closeModal);
classModal.addEventListener("click", (event) => {
  if (event.target === classModal) {
    closeModal();
  }
});

classForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const date = classDateInput.value || getTodayDateString();
  const name = classNameInput.value.trim();
  const start = startTimeInput.value;
  let end = endTimeInput.value;
  const duration = durationTimeInput.value;

  if (!name || !start) {
    return;
  }

  if (duration) {
    const computedEnd = computeEndFromDuration(start, duration);
    if (computedEnd) {
      end = computedEnd;
    }
  }

  if (!end) {
    alert("Please provide an end time or a duration.");
    return;
  }

  const entry = {
    id: crypto.randomUUID(),
    name,
    date,
    start,
    end,
    notes: "",
  };

  classes.push(entry);
  selectedClassId = entry.id;
  saveClasses();
  closeModal();
  renderClasses();
  updateActiveClass();
});

saveNotesButton.addEventListener("click", saveNotes);
