import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Department from '../models/Department.js';

// @desc    Get all appointments (Role filtered + search & filters)
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res, next) => {
  try {
    const {
      status,
      date,
      startDate,
      endDate,
      doctorId,
      departmentId,
      patientId,
      search,
      sortBy = 'appointmentDate',
      order = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    let filter = {};

    // Role-based restrictions
    if (req.user.role === 'patient') {
      filter.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      if (!doctorProfile) {
        return res.json({ success: true, total: 0, data: [] });
      }
      filter.doctor = doctorProfile._id;
    } else if (req.user.role === 'admin') {
      if (doctorId) filter.doctor = doctorId;
      if (patientId) filter.patient = patientId;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (departmentId) {
      filter.department = departmentId;
    }

    if (date) {
      filter.appointmentDate = date;
    } else if (startDate || endDate) {
      filter.appointmentDate = {};
      if (startDate) filter.appointmentDate.$gte = startDate;
      if (endDate) filter.appointmentDate.$lte = endDate;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    // Fetch and populate
    let appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone avatar gender bloodGroup')
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'name email phone avatar' },
          { path: 'department', select: 'name slug icon' },
        ],
      })
      .populate('department', 'name slug icon')
      .sort({ [sortBy]: order === 'asc' ? 1 : -1, appointmentTime: 1 });

    // In-memory search for populated patient/doctor names if search query provided
    if (search) {
      const q = search.toLowerCase();
      appointments = appointments.filter((app) => {
        const patientName = app.patient?.name?.toLowerCase() || '';
        const doctorName = app.doctor?.user?.name?.toLowerCase() || '';
        const reason = app.reason?.toLowerCase() || '';
        const deptName = app.department?.name?.toLowerCase() || '';
        return (
          patientName.includes(q) ||
          doctorName.includes(q) ||
          reason.includes(q) ||
          deptName.includes(q)
        );
      });
    }

    const total = appointments.length;
    const paginated = appointments.slice(skip, skip + limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: paginated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone avatar gender')
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'name email phone avatar' },
          { path: 'department', select: 'name slug icon' },
        ],
      })
      .populate('department', 'name slug icon');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Role verification
    if (
      req.user.role === 'patient' &&
      appointment.patient?._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      if (
        !doctorProfile ||
        appointment.doctor?._id.toString() !== doctorProfile._id.toString()
      ) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private
export const bookAppointment = async (req, res, next) => {
  try {
    const {
      doctorId,
      departmentId,
      appointmentDate,
      appointmentTime,
      reason,
      notes,
      patientId, // only allowed for admin booking on behalf of patient
    } = req.body;

    // Determine target patient
    let targetPatientId = req.user._id;
    if (req.user.role === 'admin' && patientId) {
      targetPatientId = patientId;
    }

    // Basic field validation
    if (!doctorId || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctor, date, time slot, and reason for visit',
      });
    }

    // Date validation: prevent bookings for past dates
    const today = new Date().toISOString().split('T')[0];
    if (appointmentDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot schedule appointments in the past. Please choose a future date.',
      });
    }

    // Verify doctor exists and is active
    const doctor = await Doctor.findById(doctorId).populate('department');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    if (!doctor.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This doctor is currently not accepting new appointments.',
      });
    }

    // Validate Day of the Week against Doctor availability
    const dateObj = new Date(appointmentDate + 'T00:00:00');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[dateObj.getDay()];

    if (doctor.availableDays && !doctor.availableDays.includes(dayOfWeek)) {
      return res.status(400).json({
        success: false,
        message: `Dr. is not available on ${dayOfWeek}s. Available days: ${doctor.availableDays.join(', ')}`,
      });
    }

    // Check doctor time slots
    if (doctor.timeSlots && !doctor.timeSlots.includes(appointmentTime)) {
      return res.status(400).json({
        success: false,
        message: `Selected time ${appointmentTime} is not in the doctor's available schedule`,
      });
    }

    // DUPLICATE BOOKING PREVENTION:
    // Check if slot is already booked for this doctor on this date and time
    const existingDoctorBooking = await Appointment.findOne({
      doctor: doctor._id,
      appointmentDate,
      appointmentTime,
      status: { $in: ['pending', 'approved'] },
    });

    if (existingDoctorBooking) {
      return res.status(400).json({
        success: false,
        message: `This slot (${appointmentTime}) on ${appointmentDate} has already been reserved. Please select another time or date.`,
      });
    }

    // Also prevent patient from booking overlapping appointments with other doctors at same time
    const existingPatientBooking = await Appointment.findOne({
      patient: targetPatientId,
      appointmentDate,
      appointmentTime,
      status: { $in: ['pending', 'approved'] },
    });

    if (existingPatientBooking) {
      return res.status(400).json({
        success: false,
        message: `You already have an active appointment scheduled at ${appointmentTime} on ${appointmentDate}.`,
      });
    }

    // Set department
    const targetDeptId = departmentId || doctor.department?._id;

    const appointment = await Appointment.create({
      patient: targetPatientId,
      doctor: doctor._id,
      department: targetDeptId,
      appointmentDate,
      appointmentTime,
      reason,
      notes: notes || '',
      fee: doctor.consultationFee || 50,
      status: 'pending',
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone avatar')
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'name avatar email' },
          { path: 'department', select: 'name' },
        ],
      })
      .populate('department', 'name');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully and is pending confirmation!',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status or details
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const { status, notes, doctorNotes, prescription, paymentStatus } = req.body;

    // Check permissions
    if (req.user.role === 'patient') {
      // Patients can only cancel their own appointment
      if (appointment.patient.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      if (status && status !== 'cancelled') {
        return res.status(403).json({
          success: false,
          message: 'Patients can only cancel appointments. Contact staff for other changes.',
        });
      }
      if (['completed', 'rejected'].includes(appointment.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel an appointment that is already ${appointment.status}`,
        });
      }
    }

    if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      if (
        !doctorProfile ||
        appointment.doctor.toString() !== doctorProfile._id.toString()
      ) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    // Apply updates
    if (status) {
      appointment.status = status;
    }
    if (notes !== undefined) appointment.notes = notes;
    if (doctorNotes !== undefined) appointment.doctorNotes = doctorNotes;
    if (prescription !== undefined) appointment.prescription = prescription;
    if (paymentStatus) appointment.paymentStatus = paymentStatus;

    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone avatar')
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'name avatar email' },
          { path: 'department', select: 'name' },
        ],
      })
      .populate('department', 'name');

    res.json({
      success: true,
      message: `Appointment ${status ? `marked as ${status}` : 'updated successfully'}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private (Patient or Admin)
export const rescheduleAppointment = async (req, res, next) => {
  try {
    const { appointmentDate, appointmentTime, reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Authorization
    if (
      req.user.role === 'patient' &&
      appointment.patient.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed appointments cannot be rescheduled',
      });
    }

    // Date check
    const today = new Date().toISOString().split('T')[0];
    if (appointmentDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule to a past date',
      });
    }

    // Check duplicate slot for doctor
    const duplicate = await Appointment.findOne({
      _id: { $ne: appointment._id },
      doctor: appointment.doctor,
      appointmentDate,
      appointmentTime,
      status: { $in: ['pending', 'approved'] },
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'This slot is already booked. Please choose another date or time.',
      });
    }

    appointment.appointmentDate = appointmentDate;
    appointment.appointmentTime = appointmentTime;
    if (reason) appointment.reason = reason;
    appointment.status = 'pending'; // Reset to pending after reschedule for doctor review

    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone avatar')
      .populate({
        path: 'doctor',
        populate: [{ path: 'user', select: 'name avatar email' }],
      })
      .populate('department', 'name');

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully. Pending doctor confirmation.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private (Admin only or Patient if pending)
export const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (req.user.role === 'patient') {
      if (appointment.patient.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      if (appointment.status !== 'pending' && appointment.status !== 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Can only delete pending or cancelled appointments',
        });
      }
    }

    await appointment.deleteOne();

    res.json({
      success: true,
      message: 'Appointment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
