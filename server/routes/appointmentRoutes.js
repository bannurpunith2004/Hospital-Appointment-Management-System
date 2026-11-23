import express from 'express';
import {
  getAppointments,
  getAppointmentById,
  bookAppointment,
  updateAppointment,
  rescheduleAppointment,
  deleteAppointment,
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.post('/', bookAppointment);
router.put('/:id', updateAppointment);
router.put('/:id/reschedule', rescheduleAppointment);
router.delete('/:id', deleteAppointment);

export default router;
