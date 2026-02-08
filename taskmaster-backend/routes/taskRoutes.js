import express from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskComplete
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected (need login)
router.use(protect);

// /api/tasks
router.route('/')
  .get(getTasks)
  .post(createTask);

// /api/tasks/:id
router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

// /api/tasks/:id/toggle
router.patch('/:id/toggle', toggleTaskComplete);

export default router;