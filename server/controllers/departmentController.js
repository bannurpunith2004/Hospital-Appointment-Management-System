import Department from '../models/Department.js';
import Doctor from '../models/Doctor.js';

// @desc    Get all departments (with doctor count)
// @route   GET /api/departments
// @access  Public
export const getDepartments = async (req, res, next) => {
  try {
    const { search, activeOnly } = req.query;
    let query = {};

    if (activeOnly === 'true') {
      query.isActive = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const departments = await Department.find(query).sort({ name: 1 });

    // Aggregate doctor counts for each department
    const departmentsWithStats = await Promise.all(
      departments.map(async (dept) => {
        const doctorCount = await Doctor.countDocuments({ department: dept._id });
        return {
          ...dept.toObject(),
          doctorCount,
        };
      })
    );

    res.json({
      success: true,
      count: departmentsWithStats.length,
      data: departmentsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Public
export const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const doctorCount = await Doctor.countDocuments({ department: department._id });

    res.json({
      success: true,
      data: {
        ...department.toObject(),
        doctorCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private (Admin only)
export const createDepartment = async (req, res, next) => {
  try {
    const { name, description, icon, image, headDoctorName, isActive } = req.body;

    const existingDept = await Department.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    });
    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: 'A department with this name already exists',
      });
    }

    const department = await Department.create({
      name,
      description,
      icon: icon || 'Activity',
      image: image || '',
      headDoctorName: headDoctorName || '',
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin only)
export const updateDepartment = async (req, res, next) => {
  try {
    let department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const { name, description, icon, image, headDoctorName, isActive } = req.body;

    if (name && name !== department.name) {
      const existing = await Department.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: department._id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Another department with this name already exists',
        });
      }
      department.name = name;
    }

    if (description !== undefined) department.description = description;
    if (icon) department.icon = icon;
    if (image !== undefined) department.image = image;
    if (headDoctorName !== undefined) department.headDoctorName = headDoctorName;
    if (isActive !== undefined) department.isActive = isActive;

    await department.save();

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin only)
export const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Check if any doctors belong to this department
    const assignedDoctors = await Doctor.countDocuments({ department: department._id });
    if (assignedDoctors > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department: ${assignedDoctors} doctor(s) are assigned to it. Reassign or delete them first.`,
      });
    }

    await department.deleteOne();

    res.json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
