const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ name, email, password, role, department });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role, department: user.department }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, department } = req.body;
    const user = await User.findOne({ email }).populate('department');
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // For supervisors, verify they are logging into the correct department
    if (user.role === 'SUPERVISOR' && department && user.department && user.department._id.toString() !== department) {
        return res.status(400).json({ message: 'Incorrect department for this supervisor' });
    }

    const token = jwt.sign(
        { id: user._id, role: user.role, department: user.department?._id },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('department').select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
