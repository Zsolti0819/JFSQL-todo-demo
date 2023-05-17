const todoInput = document.querySelector(".todo-input");
const todoButton = document.querySelector(".todo-button");
const todoList = document.querySelector(".todo-list");
const filterOption = document.querySelector(".filter-todo");

document.addEventListener("DOMContentLoaded", getServerTodos);
todoButton.addEventListener("click", createTodo);
todoList.addEventListener("click", deleteCheck);
filterOption.addEventListener("change", filterTodo);

function createTodo() {
    const todoText = todoInput.value;
    if (todoText.trim() === "") {
        return;
    }

    const todo = {
        description: todoText,
        completed: false
    };

    fetch("/task", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(todo)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("Failed to create todo");
        }
    })
    .then(createdTodo => {
        addTodoToList(createdTodo);
        todoInput.value = "";
    })
    .catch(error => {
        console.error(error);
    });
}

function deleteCheck(event) {
    const item = event.target;
    const todo = item.parentElement;
    const todoId = todo.dataset.id;
    const todoDescription = todo.querySelector(".todo-item").innerText;

    if (item.classList.contains("trash-btn")) {
        fetch(`/delete/${todoId}`, {
            method: "DELETE"
        })
        .then(response => {
            if (response.ok) {
                removeTodoFromList(todo);
            } else {
                throw new Error("Failed to delete todo");
            }
        })
        .catch(error => {
            console.error(error);
        });
    }

    if (item.classList.contains("complete-btn")) {
        const todoItem = todo.querySelector(".todo-item");
        const completed = !todoItem.classList.contains("completed");

        todoItem.classList.toggle("completed");

        const updatedTodo = {
            description: todoDescription,
            completed: completed,
        };

        fetch(`/task/${todoId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedTodo),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to update todo");
            }
        })
        .catch((error) => {
            console.error(error);
        });
    }
}

function filterTodo() {
    const todos = todoList.querySelectorAll(".todo");
    const filterValue = filterOption.value;

    todos.forEach((todo) => {
        const completed = todo.classList.contains("completed");

        if (
            filterValue === "all" ||
            (filterValue === "completed" && completed && todo.style.display !== "none") ||
            (filterValue === "incomplete" && !completed)
        ) {
            todo.style.display = "flex";
        } else {
            todo.style.display = "none";
        }
    });
}

function addTodoToList(todo) {
    const todoDiv = document.createElement("div");
    todoDiv.classList.add("todo");
    todoDiv.dataset.id = todo.id;

    const newTodo = document.createElement("li");
    newTodo.innerText = todo.description;
    newTodo.classList.add("todo-item");
    if (todo.completed) {
        newTodo.classList.add("completed");
    }
    todoDiv.appendChild(newTodo);

    const completedButton = document.createElement("button");
    completedButton.innerHTML = '<i class="fas fa-check-circle"></i>';
    completedButton.classList.add("complete-btn");
    todoDiv.appendChild(completedButton);

    const trashButton = document.createElement("button");
    trashButton.innerHTML = '<i class="fas fa-trash"></i>';
    trashButton.classList.add("trash-btn");
    todoDiv.appendChild(trashButton);

    todoList.appendChild(todoDiv);
}

function removeTodoFromList(todo) {
    todo.remove();
}

function getServerTodos() {
    fetch("/tasks")
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("Failed to fetch todos");
        }
    })
    .then(todos => {
        todos.forEach(todo => {
            addTodoToList(todo);
        });
    })
    .catch(error => {
        console.error(error);
    });
}