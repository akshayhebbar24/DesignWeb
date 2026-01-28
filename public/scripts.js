const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const errorMsg = document.getElementById("errorMsg");

let tasks = [];

function saveToLocalStorage() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadFromLocalStorage() {
  const storedTasks = localStorage.getItem("tasks");
  tasks = storedTasks ? JSON.parse(storedTasks) : [];
}

function showError(message) {
  errorMsg.textContent = message;
}

function clearError() {
  errorMsg.textContent = "";
}

function addTask() {
  const text = taskInput.value.trim();
  clearError();

  if (!text) {
    showError("Task cannot be empty");
    return;
  }

  const task = {
    id: Date.now(),
    text
  };

  tasks.push(task);
  saveToLocalStorage();
  renderTasks();
  taskInput.value = "";
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

function saveEdit(id) {
  const input = document.getElementById(`input-${id}`);
  const newText = input.value.trim();
  clearError();

  if (!newText) {
    showError("Task cannot be empty");
    return;
  }

  const task = tasks.find(t => t.id === id);
  task.text = newText;

  saveToLocalStorage();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveToLocalStorage();
  renderTasks();
}

addBtn.addEventListener("click", addTask);

window.onload = () => {
  loadFromLocalStorage();
  renderTasks();
};
