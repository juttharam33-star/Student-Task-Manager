import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  
  // New state to track which task is currently being edited
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title cannot be empty!");
      return;
    }
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });

      if (response.ok) {
        setTitle('');
        fetchTasks();
      }
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const handleToggleComplete = async (id, currentStatus) => {
    try {
      await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus })
      });
      fetchTasks();
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'DELETE'
      });
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // Start editing a task
  const startEditing = (task) => {
    setEditingId(task._id);
    setEditText(task.title);
  };

  // Save the edited task
  const handleSaveEdit = async (id) => {
    if (!editText.trim()) return;

    try {
      await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editText })
      });
      setEditingId(null);
      setEditText('');
      fetchTasks();
    } catch (err) {
      console.error("Error updating task title:", err);
    }
  };

  return (
    <div className="container">
      <h2>📚 Student Task Manager</h2>

      <form onSubmit={handleAddTask} className="task-form">
        <input
          type="text"
          placeholder="Enter a new task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>
      {error && <p className="error-msg">{error}</p>}

      <div className="task-list">
        {tasks.length === 0 ? (
          <p className="no-tasks">No tasks available. Add one above!</p>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className={`task-card ${task.completed ? 'completed' : ''}`}>
              <div className="task-info">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleComplete(task._id, task.completed)}
                />
                
                {/* Conditional rendering: Input field if editing, span if normal */}
                {editingId === task._id ? (
                  <input
                    type="text"
                    className="edit-input"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                ) : (
                  <span className={task.completed ? 'strike-text' : ''}>{task.title}</span>
                )}
              </div>

              <div className="task-actions">
                {editingId === task._id ? (
                  <button className="save-btn" onClick={() => handleSaveEdit(task._id)}>Save</button>
                ) : (
                  <button className="edit-btn" onClick={() => startEditing(task)}>Edit</button>
                )}
                <button className="delete-btn" onClick={() => handleDeleteTask(task._id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;