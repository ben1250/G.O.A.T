const Department = require('../models/Department');

exports.createDepartment = async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    res.status(201).json(department);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate('head', 'name email');
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id).populate('head', 'name email');
        if (!department) return res.status(404).json({ message: 'Department not found' });
        res.json(department);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
