document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "pastel-todo-tasks";

  const form = document.getElementById("task-form");
  const taskInput = document.getElementById("task-input");
  const taskList = document.getElementById("task-list");
  const todosContainer = document.getElementById("todos-container");

  let tasks = loadTasks();

  function loadTasks() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return [];
      }

      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter(
          (task) =>
            task && typeof task.text === "string" && task.text.trim().length > 0
        )
        .map((task) => ({
          id: typeof task.id === "string" ? task.id : createId(),

          text: task.text.slice(0, 200),

          completed: task.completed === true,
        }));
    } catch (error) {
      console.warn("Could not load saved tasks:", error);
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));

      return true;
    } catch (error) {
      console.error("Could not save tasks:", error);

      alert(
        "Your tasks could not be saved. " +
          "Please check your browser storage settings."
      );

      return false;
    }
  }

  function createId() {
    if (globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID();
    }

    return Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  function renderTasks() {
    taskList.replaceChildren();

    const hasTasks = tasks.length > 0;

    todosContainer.classList.toggle("has-tasks", hasTasks);

    tasks.forEach((task) => {
      const item = document.createElement("li");

      item.classList.toggle("completed", task.completed);

      const checkbox = document.createElement("input");

      checkbox.type = "checkbox";
      checkbox.className = "checkbox";
      checkbox.checked = task.completed;

      checkbox.setAttribute("aria-label", `Mark "${task.text}" as complete`);

      checkbox.addEventListener("change", () => {
        updateTask(task.id, {
          completed: checkbox.checked,
        });
      });

      const text = document.createElement("span");

      text.className = "task-text";
      text.textContent = task.text;

      const buttons = document.createElement("div");

      buttons.className = "task-buttons";

      const editButton = document.createElement("button");

      editButton.type = "button";
      editButton.className = "edit-btn";
      editButton.disabled = task.completed;

      editButton.setAttribute("aria-label", `Edit "${task.text}"`);

      editButton.title = "Edit task";

      editButton.innerHTML =
        '<i class="fa-solid fa-pen" aria-hidden="true"></i>';

      editButton.addEventListener("click", () => {
        const updatedText = prompt("Edit your task:", task.text);

        if (updatedText === null) {
          return;
        }

        const trimmedText = updatedText.trim();

        if (!trimmedText) {
          alert("A task cannot be empty.");
          return;
        }

        updateTask(task.id, {
          text: trimmedText.slice(0, 200),
        });
      });

      const deleteButton = document.createElement("button");

      deleteButton.type = "button";
      deleteButton.className = "delete-btn";

      deleteButton.setAttribute("aria-label", `Delete "${task.text}"`);

      deleteButton.title = "Delete task";

      deleteButton.innerHTML =
        '<i class="fa-solid fa-trash" aria-hidden="true"></i>';

      deleteButton.addEventListener("click", () => {
        tasks = tasks.filter((savedTask) => savedTask.id !== task.id);

        saveTasks();
        renderTasks();
      });

      buttons.append(editButton, deleteButton);

      item.append(checkbox, text, buttons);

      taskList.appendChild(item);
    });
  }

  function addTask(text) {
    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    tasks.push({
      id: createId(),
      text: trimmedText.slice(0, 200),
      completed: false,
    });

    saveTasks();
    renderTasks();
  }

  function updateTask(id, changes) {
    tasks = tasks.map((task) => {
      if (task.id === id) {
        return {
          ...task,
          ...changes,
        };
      }

      return task;
    });

    saveTasks();
    renderTasks();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) {
      taskInput.focus();
      return;
    }

    addTask(text);

    taskInput.value = "";
    taskInput.focus();
  });

  renderTasks();
});
