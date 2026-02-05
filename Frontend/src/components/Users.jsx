import { useState, useEffect } from "react";
import { UserCircle, Mail, Plus, Edit2, Trash2 } from "lucide-react";
import { usersAPI } from "../services/api";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { PasswordInput } from "./ui/PasswordInput";
import { Select } from "./ui/Select";
import { Modal, ConfirmDialog } from "./ui/Modal";
import { Badge } from "./ui/Badge";
import { TableSkeleton } from "./ui/LoadingSkeleton";
import { useToast } from "./ui/Toast";

export function Users({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "csr",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { showSuccess, showError: showToastError } = useToast();

  useEffect(() => {
    if (currentUser.role === "admin") {
      loadUsers();
    }
  }, [currentUser.role]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (err) {
      setError("Failed to load users.");
      showToastError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "csr",
        password: "",
      });
    } else {
      setEditingUser(null);
      setFormData({ name: "", email: "", role: "csr", password: "" });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "csr", password: "" });
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setFormErrors({ email: "Please enter a valid email address" });
        setSubmitting(false);
        return;
      }

      if (editingUser) {
        const payload = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        if (formData.password?.trim()) {
          payload.password = formData.password;
        }
        await usersAPI.update(editingUser.id, payload);
        showSuccess("User updated successfully");
      } else {
        if (!formData.password?.trim()) {
          setFormErrors({ password: "Password is required for new users" });
          setSubmitting(false);
          return;
        }
        await usersAPI.create({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password,
        });
        showSuccess("User created successfully");
      }

      await loadUsers();
      handleCloseModal();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to save user. Please try again.";
      setFormErrors({ general: errorMessage });
      showToastError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (user) => {
    if (user.id === currentUser.id) {
      showToastError("You cannot delete your own account");
      return;
    }
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await usersAPI.delete(userToDelete.id);
      showSuccess("User deleted successfully");
      await loadUsers();
    } catch (err) {
      showToastError("Failed to delete user");
    } finally {
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const getRoleBadgeVariant = (role) => {
    const variants = {
      admin: "admin",
      csr: "csr",
      building_executive: "building_executive",
      technician: "technician",
    };
    return variants[role] || "default";
  };

  const formatRole = (role) => {
    return role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (currentUser.role !== "admin") {
    return (
      <div className="max-w-7xl text-center py-12">
        <p className="text-gray-600">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl">
        <div className="mb-6">
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <TableSkeleton rows={5} columns={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl">
        <div className="text-center py-12 text-red-600" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add User
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block wf-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="wf-table-head">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="wf-table-row focus-within:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <UserCircle
                        className="w-8 h-8 text-gray-400"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" aria-hidden="true" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {formatRole(user.role)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-gray-700 border border-gray-300 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                        aria-label={`Edit ${user.name}`}
                      >
                        <Edit2 className="w-4 h-4" aria-hidden="true" />
                        <span>Edit</span>
                      </button>
                      {user.id !== currentUser.id ? (
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-red-700 border border-gray-300 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                          aria-label={`Delete ${user.name}`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                          <span>Delete</span>
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">You</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {users.map((user) => (
          <article
            key={user.id}
            className="wf-panel-soft p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <UserCircle
                  className="w-10 h-10 text-gray-400"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {user.name}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Mail className="w-3 h-3" aria-hidden="true" />
                    {user.email}
                  </p>
                </div>
              </div>
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {formatRole(user.role)}
              </Badge>
            </div>
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleOpenModal(user)}
                className="flex-1"
              >
                <Edit2 className="w-4 h-4" aria-hidden="true" />
                Edit
              </Button>
              {user.id !== currentUser.id ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteClick(user)}
                  className="flex-1 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  Delete
                </Button>
              ) : (
                <div className="flex-1 text-xs text-gray-500 flex items-center justify-center">
                  You
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingUser ? "Edit User" : "Add New User"}
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting} onClick={handleSubmit}>
              {editingUser ? "Update User" : "Add User"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} id="user-form">
          <div className="space-y-4">
            <Input
              label="Name"
              id="user-name"
              type="text"
              required
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              error={formErrors.name}
            />

            <Input
              label="Email"
              id="user-email"
              type="email"
              required
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              error={formErrors.email}
            />

            <Select
              label="Role"
              id="user-role"
              required
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <option value="csr">CSR</option>
              <option value="building_executive">Building Executive</option>
              <option value="technician">Technician</option>
              <option value="admin">Admin</option>
            </Select>

            <PasswordInput
              label={editingUser ? "New Password" : "Password"}
              id="user-password"
              required={!editingUser}
              placeholder={
                editingUser
                  ? "Leave blank to keep current password"
                  : "Enter password"
              }
              helperText={
                editingUser ? "Leave blank to keep current password" : undefined
              }
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              error={formErrors.password}
            />

            {formErrors.general && (
              <div
                className="text-sm text-red-600 bg-red-50 p-3 rounded"
                role="alert"
              >
                {formErrors.general}
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to delete "${userToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
