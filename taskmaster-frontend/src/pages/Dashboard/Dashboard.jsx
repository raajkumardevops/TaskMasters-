import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTasks } from "../../services/taskService";

const Dashboard = () => {
  const [stats, setStats] = useState({
    today: 0,
    completed: 0,
    pending: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      const tasks = data.tasks || [];

      const todayDate = new Date().toISOString().split("T")[0];

      const todayTasks = tasks.filter((t) => t.date === todayDate);
      const completedTasks = tasks.filter((t) => t.completed);
      const pendingTasks = tasks.filter((t) => !t.completed);

      setStats({
        today: todayTasks.length,
        completed: completedTasks.length,
        pending: pendingTasks.length,
      });

      setRecentTasks(tasks.slice(0, 5));
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Dashboard</h2>
        <Link to="/tasks" className="btn btn-primary">+ Add Task</Link>
      </div>

      {loading ? (
        <div className="text-center py-5">Loading dashboard...</div>
      ) : (
        <>
          {/* Stats */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-body text-center">
                  <h3 className="fw-bold">{stats.today}</h3>
                  <p className="text-muted mb-0">Tasks Today</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-body text-center">
                  <h3 className="fw-bold text-success">{stats.completed}</h3>
                  <p className="text-muted mb-0">Completed</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-body text-center">
                  <h3 className="fw-bold text-warning">{stats.pending}</h3>
                  <p className="text-muted mb-0">Pending</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Recent Tasks</h5>
              {recentTasks.length === 0 ? (
                <p className="text-muted">No tasks yet</p>
              ) : (
                <ul className="list-group">
                  {recentTasks.map((task) => (
                    <li
                      key={task._id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      {task.title}
                      <span className={`badge ${{
                        Work: "bg-primary",
                        Study: "bg-success",
                        Personal: "bg-warning text-dark",
                      }[task.category]}`}
                      >
                        {task.category}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;