import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [priority, setPriority] = useState("Low");
  const [searchTerm, setSearchTerm] = useState("");
  const [lastDeletedTask, setLastDeletedTask] = useState(null);

  // Load tasks from local storage
  useEffect(() => {
    try {
      const savedTasks = JSON.parse(localStorage.getItem("tasks"));
      if (Array.isArray(savedTasks)) {
        setTasks(savedTasks);
      }
    } catch (error) {
      console.error("Error loading tasks from localStorage:", error);
      localStorage.removeItem("tasks"); // Clear corrupted data
    }
  }, []);

  // Save tasks to local storage
  useEffect(() => {
    try {
      if (tasks.length > 0) {
        localStorage.setItem("tasks", JSON.stringify(tasks));
      }
    } catch (error) {
      console.error("Error saving tasks to localStorage:", error);
    }
  }, [tasks]);

  const addTask = () => {
    if (taskInput.trim() === "") return;
    const newTask = {
      id: Date.now(),
      text: taskInput,
      completed: false,
      dueDate: null,
      priority,
    };
    setTasks([...tasks, newTask]);
    setTaskInput("");
    setPriority("Low");
  };

  const toggleTaskCompletion = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  };

  const deleteTask = (taskId) => {
    const taskToDelete = tasks.find((task) => task.id === taskId);
    setLastDeletedTask(taskToDelete);
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
  };

  const undoDelete = () => {
    if (lastDeletedTask) {
      setTasks([...tasks, lastDeletedTask]);
      setLastDeletedTask(null);
    }
  };

  const filteredTasks = tasks
    .filter((task) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "completed" && task.completed) ||
        (filter === "pending" && !task.completed);

      const matchesSearch = task.text.toLowerCase().includes(searchTerm);
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  return (
    <div className="App">
      <header className="App-header">
        <h1>To-Do List</h1>
        <div className="task-input">
          <input
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Add a new task"
          />
          <input
            type="date"
            onChange={(e) => {
              const date = e.target.value;
              setTasks((prev) =>
                prev.map((task) => (task.id === taskInput.id ? { ...task, dueDate: date } : task))
              );
            }}
          />
          <select onChange={(e) => setPriority(e.target.value)} value={priority}>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <button onClick={addTask}>Add Task</button>
        </div>
        <div className="filters">
          <button onClick={() => setFilter("all")} className={filter === "all" ? "active" : ""}>
            All
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={filter === "completed" ? "active" : ""}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={filter === "pending" ? "active" : ""}
          >
            Pending
          </button>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          />
        </div>
        <ul className="task-list">
          {filteredTasks.map((task) => (
            <li key={task.id} className={task.completed ? "completed" : ""}>
              <span onClick={() => toggleTaskCompletion(task.id)}>
                {task.text}{" "}
                {task.dueDate && (
                  <span className="due-date">(Due: {task.dueDate})</span>
                )}
                <span className={`priority ${task.priority.toLowerCase()}`}>
                  {task.priority}
                </span>
              </span>
              <button onClick={() => deleteTask(task.id)}>Delete</button>
            </li>
          ))}
        </ul>
        {lastDeletedTask && (
          <div className="undo-section">
            <button onClick={undoDelete}>Undo Delete</button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
