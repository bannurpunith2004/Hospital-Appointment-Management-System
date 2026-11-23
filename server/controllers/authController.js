import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';

// Helper to generate token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'carepoint_jwt_super_secret_key_12345!',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// @desc    Register a new patient
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, gender, dateOfBirth, address, bloodGroup } = req.body;

    // Security check: Public registration is strictly for patients
    // Admin or Doctor creation must happen via authorized endpoints or seed
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'patient', // Force patient role for security
      phone: phone || '',
      gender: gender || 'unspecified',
      dateOfBirth: dateOfBirth || undefined,
      address: address || '',
    });

    // Create associated Patient profile
    const patientProfile = await Patient.create({
      user: user._id,
      bloodGroup: bloodGroup || 'Unknown',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        gender: user.gender,
        patientProfileId: patientProfile._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Contact hospital administration.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    let doctorInfo = null;
    let patientInfo = null;

    if (user.role === 'doctor') {
      doctorInfo = await Doctor.findOne({ user: user._id }).populate('department');
    } else if (user.role === 'patient') {
      patientInfo = await Patient.findOne({ user: user._id });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        doctor: doctorInfo,
        patient: patientInfo,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let doctorProfile = null;
    let patientProfile = null;

    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ user: user._id }).populate('department');
    } else if (user.role === 'patient') {
      patientProfile = await Patient.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        status: user.status,
        doctor: doctorProfile,
        patient: patientProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      name,
      phone,
      address,
      gender,
      dateOfBirth,
      avatar,
      // Patient fields
      bloodGroup,
      emergencyContact,
      medicalHistory,
      allergies,
      insuranceProvider,
      insurancePolicyNumber,
      // Doctor fields
      specialization,
      qualifications,
      experienceYears,
      consultationFee,
      bio,
      availableDays,
      timeSlots,
      isAvailable,
      roomNumber,
    } = req.body;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (gender) user.gender = gender;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    let updatedDoctor = null;
    let updatedPatient = null;

    if (user.role === 'patient') {
      updatedPatient = await Patient.findOneAndUpdate(
        { user: user._id },
        {
          ...(bloodGroup && { bloodGroup }),
          ...(emergencyContact && { emergencyContact }),
          ...(medicalHistory && { medicalHistory }),
          ...(allergies && { allergies }),
          ...(insuranceProvider !== undefined && { insuranceProvider }),
          ...(insurancePolicyNumber !== undefined && { insurancePolicyNumber }),
        },
        { new: true, upsert: true }
      );
    } else if (user.role === 'doctor') {
      updatedDoctor = await Doctor.findOneAndUpdate(
        { user: user._id },
        {
          ...(specialization && { specialization }),
          ...(qualifications && { qualifications }),
          ...(experienceYears !== undefined && { experienceYears }),
          ...(consultationFee !== undefined && { consultationFee }),
          ...(bio !== undefined && { bio }),
          ...(availableDays && { availableDays }),
          ...(timeSlots && { timeSlots }),
          ...(isAvailable !== undefined && { isAvailable }),
          ...(roomNumber !== undefined && { roomNumber }),
        },
        { new: true }
      ).populate('department');
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        doctor: updatedDoctor,
        patient: updatedPatient,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password mock (generates token / instructions)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user registered with that email address',
      });
    }

    res.json({
      success: true,
      message: `Password reset link has been dispatched to ${email}. Check your inbox.`,
    });
  } catch (error) {
    next(error);
  }
};
