"use strict";

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const count = document.querySelector("#count");
const emptyMessage = document.querySelector("#empty-message");
const clearButton = document.querySelector("#clear-completed");
const filterButtons = document.querySelectorAll(".filter");

const STORAGE_KEY = "todo-tasks";
let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    /* storage unavailable: tasks stay in memory for this session */
  }
}

function addTask(text) {
  tasks.push({ id: Date.now(), text, done: false });
  update();
}

function toggleTask(id) {
  const task = tasks.find(item => item.id === id);
  if (task) task.done = !task.done;
  update();
}

function deleteTask(id) {
  tasks = tasks.filter(item => item.id !== id);
  update();
}

function createItem(task) {
  const item = document.createElement("li");
  item.className = "todo-item" + (task.done ? " done" : "");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.done;
  checkbox.setAttribute("aria-label", `Mark "${task.text}" as done`);
  checkbox.addEventListener("change", () => toggleTask(task.id));

  const text = document.createElement("span");
  text.className = "todo-text";
  text.textContent = task.text;

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "delete-button";
  remove.textContent = "Delete";
  remove.setAttribute("aria-label", `Delete "${task.text}"`);
  remove.addEventListener("click", () => deleteTask(task.id));

  item.append(checkbox, text, remove);
  return item;
}

function render() {
  const visible = tasks.filter(task => {
    if (currentFilter === "active") return !task.done;
    if (currentFilter === "completed") return task.done;
    return true;
  });

  list.replaceChildren(...visible.map(createItem));

  const remaining = tasks.filter(task => !task.done).length;
  count.textContent = `${remaining} ${remaining === 1 ? "task" : "tasks"} left`;
  clearButton.hidden = !tasks.some(task => task.done);

  if (visible.length === 0) {
    emptyMessage.hidden = false;
    emptyMessage.textContent =
      tasks.length === 0 ? "No tasks yet. Add your first task above." : `No ${currentFilter} tasks.`;
  } else {
    emptyMessage.hidden = true;
  }
}

function update() {
  saveTasks();
  render();
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  addTask(text);
  input.value = "";
  input.focus();
});

clearButton.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.done);
  update();
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });

    render();
  });
});

render();
