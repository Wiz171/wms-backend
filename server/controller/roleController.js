// Role management controller for superadmin
const RolePermission = require('../model/rolePermission');
const User = require('../model/model');

// Create a new role
async function createRole(req, res) {
  try {
    const { role, permissions } = req.body;
    if (!role || !permissions) {
      return res.status(400).json({ message: 'Role and permissions are required' });
    }
    const existing = await RolePermission.findOne({ role });
    if (existing) {
      return res.status(409).json({ message: 'Role already exists' });
    }
    const newRole = new RolePermission({ role, permissions });
    await newRole.save();
    res.status(201).json({ message: 'Role created', role: newRole });
  } catch (err) {
    res.status(500).json({ message: 'Error creating role', error: err.message });
  }
}

// Delete a role
async function deleteRole(req, res) {
  try {
    const { role } = req.params;
    const deleted = await RolePermission.findOneAndDelete({ role });
    if (!deleted) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json({ message: 'Role deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting role', error: err.message });
  }
}

// Assign a role to a user
async function assignRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) return res.status(400).json({ message: 'Role is required' });
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Role assigned', user });
  } catch (err) {
    res.status(500).json({ message: 'Error assigning role', error: err.message });
  }
}

// Assign access/permissions to a role
async function assignPermissions(req, res) {
  try {
    const { role } = req.params;
    const { permissions } = req.body;
    if (!permissions) return res.status(400).json({ message: 'Permissions are required' });
    const updated = await RolePermission.findOneAndUpdate(
      { role },
      { permissions },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Role not found' });
    res.json({ message: 'Permissions updated', role: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating permissions', error: err.message });
  }
}

// List all roles
async function listRoles(req, res) {
  try {
    const roles = await RolePermission.find();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching roles', error: err.message });
  }
}

module.exports = {
  createRole,
  deleteRole,
  assignRole,
  assignPermissions,
  listRoles
};
