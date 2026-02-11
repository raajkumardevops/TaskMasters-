import { Link } from "react-router-dom";

const Profile = () => {
  const user = {
    name: "Raaj Kumar",
    email: "raaj@example.com",
    joined: "Jan 2026",
    stats: {
      total: 128,
      completed: 96,
      rate: "75%",
    },
    tasks: [
      { id: 1, title: "Build TaskMaster dashboard", category: "Work" },
      { id: 2, title: "Revise Node.js concepts", category: "Study" },
      { id: 3, title: "Morning workout", category: "Personal" },
    ],
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Profile</h2>
        <button className="btn btn-outline-secondary">Logout</button>
      </div>

      {/* Profile Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex align-items-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white"
            style={{ width: 80, height: 80, fontSize: "1.8rem", fontWeight: "bold" }}
          >
            RK
          </div>
          <div>
            <h4 className="mb-1">{user.name}</h4>
            <p className="text-muted mb-1">{user.email}</p>
            <small className="text-muted">Joined {user.joined}</small>
          </div>
        </div>
      </div>

      {/* Productivity Summary */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <h3 className="fw-bold">{user.stats.total}</h3>
              <p className="text-muted mb-0">Total Tasks</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <h3 className="fw-bold text-success">{user.stats.completed}</h3>
              <p className="text-muted mb-0">Completed</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <h3 className="fw-bold text-primary">{user.stats.rate}</h3>
              <p className="text-muted mb-0">Completion Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Task History */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">My Tasks</h5>
            <Link to="/tasks" className="btn btn-sm btn-outline-primary">View All</Link>
          </div>
          <ul className="list-group">
            {user.tasks.map((task) => (
              <li key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{task.title}</span>
                <span
                  className={`badge ${{
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
        </div>
      </div>

      {/* Actions */}
      <div className="d-flex gap-2">
        <button className="btn btn-primary">Edit Profile</button>
        <button className="btn btn-outline-danger">Delete Account</button>
      </div>
    </div>
  );
};

export default Profile;