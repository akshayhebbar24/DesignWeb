const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

let tasks = [];

function showError(message) {
  Swal.fire({
    icon: "error",
    title: "Error",
    text: message,
    confirmButtonColor: "#d32f2f",
  });
}

function showSuccess(message) {
  Swal.fire({
    icon: "success",
    title: "Success",
    text: message,
    timer: 1500,
    showConfirmButton: false,
  });
}

async function loadTasks() {
  try {
    const res = await fetch("/api/tasks");
    tasks = await res.json();
    renderTasks();
  } catch {
    showError("Failed to load tasks");
  }
}

async function addTask() {
  let text = taskInput.value.trim();

  if (!text) {
    showError("Task cannot be empty");
    return;
  }

  text = text.replace(/\s+/g, " ");

  if (text.length < 3) {
    showError("Task must be at least 3 characters long");
    return;
  }

  if (text.length > 100) {
    showError("Task cannot exceed 100 characters");
    return;
  }

  if (!/[a-zA-Z0-9]/.test(text)) {
    showError("Task must contain letters or numbers");
    return;
  }

  const isDuplicate = tasks.some(
    (task) => task.text.toLowerCase() === text.toLowerCase(),
  );

  if (isDuplicate) {
    showError("Task already exists");
    return;
  }

  try {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "Unable to add task");
      return;
    }

    tasks.push(data);
    renderTasks();
    taskInput.value = "";
    showSuccess("Task added successfully");
  } catch {
    showError("Unable to add task");
  }
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="task-content">
        <span id="text-${task.id}">${task.text}</span>
        <input
          type="text"
          id="input-${task.id}"
          value="${task.text}"
          style="display:none; width:100%;"
        />
      </div>

      <div class="actions">
        <button onclick="startEdit(${task.id})">Edit</button>
        <button id="save-${task.id}" style="display:none" onclick="saveEdit(${task.id})">Save</button>
        <button id="cancel-${task.id}" style="display:none" onclick="cancelEdit(${task.id})">Cancel</button>
        <button onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;

    taskList.appendChild(li);
  });
}

function startEdit(id) {
  document.getElementById(`text-${id}`).style.display = "none";
  document.getElementById(`input-${id}`).style.display = "block";
  document.getElementById(`save-${id}`).style.display = "inline-block";
  document.getElementById(`cancel-${id}`).style.display = "inline-block";
}

function cancelEdit(id) {
  document.getElementById(`text-${id}`).style.display = "block";
  document.getElementById(`input-${id}`).style.display = "none";
  document.getElementById(`save-${id}`).style.display = "none";
  document.getElementById(`cancel-${id}`).style.display = "none";
}

async function saveEdit(id) {
  let newText = document.getElementById(`input-${id}`).value.trim();

  const confirm = await Swal.fire({
    title: "Save changes?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Save",
    confirmButtonColor: "#1976d2",
  });

  if (!confirm.isConfirmed) return;

  newText = newText.replace(/\s+/g, " ");

  if (!newText) {
    showError("Task cannot be empty");
    return;
  }

  if (newText.length < 3) {
    showError("Task must be at least 3 characters long");
    return;
  }

  if (newText.length > 100) {
    showError("Task cannot exceed 100 characters");
    return;
  }

  if (!/[a-zA-Z0-9]/.test(newText)) {
    showError("Task must contain letters or numbers");
    return;
  }

  const isDuplicate = tasks.some(
    (task) =>
      task.id !== id && task.text.toLowerCase() === newText.toLowerCase(),
  );

  if (isDuplicate) {
    showError("Task already exists");
    return;
  }

  try {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "Unable to update task");
      return;
    }

    const task = tasks.find((t) => t.id === id);
    task.text = data.text;
    renderTasks();
    showSuccess("Task updated successfully");
  } catch {
    showError("Unable to update task");
  }
}

async function deleteTask(id) {
  const confirm = await Swal.fire({
    title: "Delete task?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    confirmButtonColor: "#d32f2f",
  });

  if (!confirm.isConfirmed) return;

  try {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    tasks = tasks.filter((t) => t.id !== id);
    renderTasks();
    showSuccess("Task deleted successfully");
  } catch {
    showError("Unable to delete task");
  }
}

addBtn.addEventListener("click", addTask);
window.onload = loadTasks;
