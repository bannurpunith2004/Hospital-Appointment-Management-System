import Patient from '../models/Patient.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

// @desc    Get all patients with search & pagination
// @route   GET /api/patients
// @access  Private (Admin, Doctor)
export const getPatients = async (req, res, next) => {
  try {
    const { search, bloodGroup, page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    let patientQuery = {};
    if (bloodGroup) {
      patientQuery.bloodGroup = bloodGroup;
    }

    let patients = await Patient.find(patientQuery).populate(
      'user',
      'name email phone avatar address gender dateOfBirth status createdAt'
    );

    // If search provided, filter by user name, email, or phone
    if (search) {
      const q = search.toLowerCase();
      patients = patients.filter((p) => {
        const name = p.user?.name?.toLowerCase() || '';
        const email = p.user?.email?.toLowerCase() || '';
        const phone = p.user?.phone?.toLowerCase() || '';
        return name.includes(q) || email.includes(q) || phone.includes(q);
      });
    }

    const total = patients.length;
    const paginated = patients.slice(skip, skip + limitNum);

    // Fetch appointment count for each patient
    const results = await Promise.all(
      paginated.map(async (p) => {
        if (!p.user) return p.toObject();
        const totalAppointments = await Appointment.countDocuments({ patient: p.user._id });
        const lastAppointment = await Appointment.findOne({ patient: p.user._id })
          .sort({ appointmentDate: -1 })
          .select('appointmentDate status reason');

        return {
          ...p.toObject(),
          totalAppointments,
          lastAppointment,
        };
      })
    );

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private (Admin, Doctor, Patient self)
export const getPatientById = async (req, res, next) => {
  try {
    let patient = await Patient.findById(req.params.id).populate(
      'user',
      'name email phone avatar address gender dateOfBirth status createdAt'
    );

    // Also handle if id is user id
    if (!patient) {
      patient = await Patient.findOne({ user: req.params.id }).populate(
        'user',
        'name email phone avatar address gender dateOfBirth status createdAt'
      );
    }

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    // Role check: Patient can only view their own record unless admin or doctor
    if (
      req.user.role === 'patient' &&
      patient.user?._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this patient profile',
      });
    }

    // Fetch patient appointments
    const appointments = await Appointment.find({ patient: patient.user?._id })
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'name avatar email phone' },
          { path: 'department', select: 'name slug icon' },
        ],
      })
      .sort({ appointmentDate: -1, appointmentTime: -1 });

    res.json({
      success: true,
      data: {
        ...patient.toObject(),
        appointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient details
// @route   PUT /api/patients/:id
// @access  Private (Admin, Doctor, Patient self)
export const updatePatient = async (req, res, next) => {
  try {
    let patient = await Patient.findById(req.params.id);
    if (!patient) {
      patient = await Patient.findOne({ user: req.params.id });
    }

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Check permissions
    if (
      req.user.role === 'patient' &&
      patient.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this patient profile',
      });
    }

    const {
      name,
      phone,
      address,
      gender,
      dateOfBirth,
      status,
      bloodGroup,
      emergencyContact,
      medicalHistory,
      allergies,
      insuranceProvider,
      insurancePolicyNumber,
    } = req.body;

    // Update user info
    const user = await User.findById(patient.user);
    if (user) {
      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (address !== undefined) user.address = address;
      if (gender) user.gender = gender;
      if (dateOfBirth) user.dateOfBirth = dateOfBirth;
      if (status && req.user.role === 'admin') user.status = status;
      await user.save();
    }

    // Update patient info
    if (bloodGroup) patient.bloodGroup = bloodGroup;
    if (emergencyContact) patient.emergencyContact = emergencyContact;
    if (medicalHistory) patient.medicalHistory = medicalHistory;
    if (allergies) patient.allergies = allergies;
    if (insuranceProvider !== undefined) patient.insuranceProvider = insuranceProvider;
    if (insurancePolicyNumber !== undefined) patient.insurancePolicyNumber = insurancePolicyNumber;

    await patient.save();

    const updated = await Patient.findById(patient._id).populate(
      'user',
      'name email phone avatar address gender dateOfBirth status'
    );

    res.json({
      success: true,
      message: 'Patient profile updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete patient (Admin only)
// @route   DELETE /api/patients/:id
// @access  Private (Admin only)
export const deletePatient = async (req, res, next) => {
  try {
    let patient = await Patient.findById(req.params.id);
    if (!patient) {
      patient = await Patient.findOne({ user: req.params.id });
    }

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Check for active appointments
    const active = await Appointment.countDocuments({
      patient: patient.user,
      status: { $in: ['pending', 'approved'] },
    });

    if (active > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete patient: Patient has ${active} active appointment(s). Cancel or complete them first.`,
      });
    }

    await User.findByIdAndDelete(patient.user);
    await patient.deleteOne();

    res.json({
      success: true,
      message: 'Patient record removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
