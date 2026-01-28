const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const errorMsg = document.getElementById("errorMsg");

let tasks = [];

function showError(message) {
  errorMsg.textContent = message;
}

function clearError() {
  errorMsg.textContent = "";
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
  const text = taskInput.value.trim();
  clearError();

  if (!text) {
    showError("Task cannot be empty");
    return;
  }

  try {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error);
      return;
    }

    tasks.push(data);
    renderTasks();
    taskInput.value = "";
  } catch {
    showError("Unable to add task");
  }
}

function renderTasks() {
  taskList.innerHTML = "";
  clearError();

  tasks.forEach(task => {
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
  const input = document.getElementById(`input-${id}`);
  const newText = input.value.trim();
  clearError();

  if (!newText) {
    showError("Task cannot be empty");
    return;
  }

  try {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText })
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error);
      return;
    }

    const task = tasks.find(t => t.id === id);
    task.text = data.text;
    renderTasks();
  } catch {
    showError("Unable to update task");
  }
}

async function deleteTask(id) {
  try {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    tasks = tasks.filter(t => t.id !== id);
    renderTasks();
  } catch {
    showError("Unable to delete task");
  }
}

addBtn.addEventListener("click", addTask);
window.onload = loadTasks;
