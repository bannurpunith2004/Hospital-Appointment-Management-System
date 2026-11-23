import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Appointment from '../models/Appointment.js';

// @desc    Get all doctors with filtering, sorting & pagination
// @route   GET /api/doctors
// @access  Public
export const getDoctors = async (req, res, next) => {
  try {
    const {
      search,
      department,
      isAvailable,
      sortBy = 'rating',
      order = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    let doctorFilter = {};

    if (isAvailable !== undefined) {
      doctorFilter.isAvailable = isAvailable === 'true';
    }

    if (department) {
      doctorFilter.department = department;
    }

    // Prepare pipeline or query
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Build population and query
    let doctors = await Doctor.find(doctorFilter)
      .populate('user', 'name email phone avatar address status')
      .populate('department', 'name slug icon');

    // Filter by search (name or specialization)
    if (search) {
      const q = search.toLowerCase();
      doctors = doctors.filter((doc) => {
        const userName = doc.user?.name?.toLowerCase() || '';
        const spec = doc.specialization?.toLowerCase() || '';
        const deptName = doc.department?.name?.toLowerCase() || '';
        return userName.includes(q) || spec.includes(q) || deptName.includes(q);
      });
    }

    // Sorting
    doctors.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'fee') {
        valA = a.consultationFee;
        valB = b.consultationFee;
      } else if (sortBy === 'experience') {
        valA = a.experienceYears;
        valB = b.experienceYears;
      } else if (sortBy === 'name') {
        valA = a.user?.name || '';
        valB = b.user?.name || '';
        return order === 'desc' ? valB.localeCompare(valA) : valA.localeCompare(valB);
      } else {
        // default rating
        valA = a.rating;
        valB = b.rating;
      }
      return order === 'asc' ? valA - valB : valB - valA;
    });

    const total = doctors.length;
    const paginatedDoctors = doctors.slice(skip, skip + limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: paginatedDoctors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'name email phone avatar address gender status')
      .populate('department', 'name slug icon description');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Get count of completed appointments as patient count
    const totalPatientsTreated = await Appointment.distinct('patient', {
      doctor: doctor._id,
      status: 'completed',
    });

    res.json({
      success: true,
      data: {
        ...doctor.toObject(),
        totalPatientsCount: totalPatientsTreated.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor available slots for a specific date
// @route   GET /api/doctors/:id/slots?date=YYYY-MM-DD
// @access  Public
export const getDoctorSlotsForDate = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide date parameter (YYYY-MM-DD)',
      });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Determine the day of week for the date
    const dateObj = new Date(date + 'T00:00:00');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[dateObj.getDay()];

    const isAvailableOnDay = doctor.availableDays.includes(dayOfWeek);

    // Find active appointments for this doctor on this date (not cancelled or rejected)
    const bookedAppointments = await Appointment.find({
      doctor: doctor._id,
      appointmentDate: date,
      status: { $in: ['pending', 'approved', 'completed'] },
    }).select('appointmentTime status');

    const bookedTimes = new Set(bookedAppointments.map((app) => app.appointmentTime));

    const slots = doctor.timeSlots.map((time) => ({
      time,
      isAvailable: isAvailableOnDay && !bookedTimes.has(time),
      isBooked: bookedTimes.has(time),
    }));

    res.json({
      success: true,
      date,
      dayOfWeek,
      isWorkingDay: isAvailableOnDay,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create doctor (Admin only)
// @route   POST /api/doctors
// @access  Private (Admin only)
export const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password = 'Doctor@1234',
      phone,
      address,
      gender,
      avatar,
      departmentId,
      specialization,
      qualifications,
      experienceYears,
      consultationFee,
      bio,
      roomNumber,
      availableDays,
      timeSlots,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    const dept = await Department.findById(departmentId);
    if (!dept) {
      return res.status(400).json({
        success: false,
        message: 'Selected department does not exist',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'doctor',
      phone: phone || '',
      address: address || '',
      gender: gender || 'unspecified',
      avatar: avatar || `https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80`,
    });

    const doctor = await Doctor.create({
      user: user._id,
      department: dept._id,
      specialization,
      qualifications: qualifications || ['MBBS', 'MD'],
      experienceYears: Number(experienceYears) || 5,
      consultationFee: Number(consultationFee) || 50,
      bio: bio || '',
      roomNumber: roomNumber || 'Suite 101',
      availableDays: availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: timeSlots || [
        '09:00 AM',
        '09:30 AM',
        '10:00 AM',
        '10:30 AM',
        '11:00 AM',
        '02:00 PM',
        '02:30 PM',
        '03:00 PM',
        '03:30 PM',
        '04:00 PM',
      ],
      isAvailable: true,
    });

    const populatedDoctor = await Doctor.findById(doctor._id)
      .populate('user', 'name email phone avatar address status')
      .populate('department', 'name slug icon');

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: populatedDoctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Private (Admin or Doctor self)
export const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Authorization check
    if (req.user.role !== 'admin' && doctor.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this doctor profile',
      });
    }

    const {
      name,
      phone,
      address,
      gender,
      avatar,
      departmentId,
      specialization,
      qualifications,
      experienceYears,
      consultationFee,
      bio,
      roomNumber,
      availableDays,
      timeSlots,
      isAvailable,
      status,
    } = req.body;

    // Update User fields
    const user = await User.findById(doctor.user);
    if (user) {
      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (address !== undefined) user.address = address;
      if (gender) user.gender = gender;
      if (avatar !== undefined) user.avatar = avatar;
      if (status && req.user.role === 'admin') user.status = status;
      await user.save();
    }

    // Update Doctor fields
    if (departmentId) {
      const deptExists = await Department.findById(departmentId);
      if (deptExists) doctor.department = departmentId;
    }
    if (specialization) doctor.specialization = specialization;
    if (qualifications) doctor.qualifications = qualifications;
    if (experienceYears !== undefined) doctor.experienceYears = Number(experienceYears);
    if (consultationFee !== undefined) doctor.consultationFee = Number(consultationFee);
    if (bio !== undefined) doctor.bio = bio;
    if (roomNumber !== undefined) doctor.roomNumber = roomNumber;
    if (availableDays) doctor.availableDays = availableDays;
    if (timeSlots) doctor.timeSlots = timeSlots;
    if (isAvailable !== undefined) doctor.isAvailable = Boolean(isAvailable);

    await doctor.save();

    const updated = await Doctor.findById(doctor._id)
      .populate('user', 'name email phone avatar address status')
      .populate('department', 'name slug icon');

    res.json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete doctor (Admin only)
// @route   DELETE /api/doctors/:id
// @access  Private (Admin only)
export const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Check for pending/approved appointments
    const activeAppointments = await Appointment.countDocuments({
      doctor: doctor._id,
      status: { $in: ['pending', 'approved'] },
    });

    if (activeAppointments > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete doctor: Doctor has ${activeAppointments} active appointment(s). Please reschedule or cancel them first.`,
      });
    }

    // Delete user and doctor
    await User.findByIdAndDelete(doctor.user);
    await doctor.deleteOne();

    res.json({
      success: true,
      message: 'Doctor deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
