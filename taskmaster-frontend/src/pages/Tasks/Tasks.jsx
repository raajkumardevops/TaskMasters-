import { useEffect, useState } from "react";
import {
  getTasks,
  toggleTaskStatus,
  deleteTask,
  createTask,
} from "../../services/taskService";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  // Create Task state
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    category: "Work",
    date: "",
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (categoryFilter !== "All") filters.category = categoryFilter;
      if (dateFilter) filters.date = dateFilter;

      const data = await getTasks(filters);
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [categoryFilter, dateFilter]);

  const handleToggle = async (taskId) => {
    await toggleTaskStatus(taskId);
    fetchTasks();
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    await deleteTask(taskId);
    fetchTasks();
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title) return;

    await createTask(newTask);
    setShowModal(false);
    setNewTask({ title: "", category: "Work", date: "" });
    fetchTasks();
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">My Tasks</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Task
        </button>
      </div>

      {/* Filters */}
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Study">Study</option>
          </select>
        </div>
        <div className="col-md-4">
          <input
            type="date"
            className="form-control"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center text-muted py-5">
              🎉 No tasks found. Create a new task to get started.
            </div>
          ) : (
            <ul className="list-group">
              {tasks.map((task) => (
                <li
                  key={task._id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggle(task._id)}
                    />
                    <span
                      style={{
                        textDecoration: task.completed ? "line-through" : "none",
                        opacity: task.completed ? 0.6 : 1,
                      }}
                    >
                      {task.title}
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <span className={`badge ${{
                      Work: "bg-primary",
                      Study: "bg-success",
                      Personal: "bg-warning text-dark",
                    }[task.category]}`}
                    >
                      {task.category}
                    </span>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(task._id)}
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Task</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleCreateTask}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      className="form-control"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={newTask.category}
                      onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    >
                      <option>Work</option>
                      <option>Personal</option>
                      <option>Study</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={newTask.date}
                      onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Create</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;