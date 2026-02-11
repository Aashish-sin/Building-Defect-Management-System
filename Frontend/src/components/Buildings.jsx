import { useState, useEffect } from "react";
import { Building2, MapPin, Plus, Edit2, Trash2 } from "lucide-react";
import { buildingsAPI } from "../services/api";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Modal, ConfirmDialog } from "./ui/Modal";
import { CardSkeleton } from "./ui/LoadingSkeleton";
import { useToast } from "./ui/Toast";

export function Buildings({ currentUser }) {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [buildingToDelete, setBuildingToDelete] = useState(null);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [formData, setFormData] = useState({ name: "", address: "" });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { showSuccess, showError: showToastError } = useToast();

  const canManage = currentUser.role === "admin";

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    try {
      setLoading(true);
      const response = await buildingsAPI.getAll();
      setBuildings(response.data);
    } catch (err) {
      setError("Failed to load buildings.");
      showToastError("Failed to load buildings");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (building = null) => {
    if (building) {
      setEditingBuilding(building);
      setFormData({ name: building.name, address: building.address });
    } else {
      setEditingBuilding(null);
      setFormData({ name: "", address: "" });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBuilding(null);
    setFormData({ name: "", address: "" });
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      const validationErrors = {};
      if (!formData.name.trim())
        validationErrors.name = "Building name is required";
      if (!formData.address.trim())
        validationErrors.address = "Address is required";
      if (Object.keys(validationErrors).length > 0) {
        setFormErrors(validationErrors);
        setSubmitting(false);
        return;
      }

      if (editingBuilding) {
        await buildingsAPI.update(editingBuilding.id, formData);
        showSuccess("Building updated successfully");
      } else {
        await buildingsAPI.create(formData);
        showSuccess("Building created successfully");
      }
      await loadBuildings();
      handleCloseModal();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to save building.";
      setFormErrors({ general: errorMessage });
      showToastError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (building) => {
    setBuildingToDelete(building);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!buildingToDelete) return;

    try {
      await buildingsAPI.delete(buildingToDelete.id);
      showSuccess("Building deleted successfully");
      await loadBuildings();
    } catch (err) {
      showToastError("Failed to delete building");
    } finally {
      setShowDeleteConfirm(false);
      setBuildingToDelete(null);
    }
  };

  if (!["admin", "building_executive", "csr"].includes(currentUser.role)) {
    return (
      <div className="max-w-7xl mx-auto text-center py-12">
        <p className="text-gray-600">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12 text-red-600" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Buildings</h1>
        {canManage && (
          <Button
            onClick={() => handleOpenModal()}
            size="sm"
            className="bg-sky-400 text-white border-2 border-sky-500 hover:bg-sky-500"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            Add Building
          </Button>
        )}
      </div>

      {buildings.length === 0 ? (
        <div className="text-center py-12 wf-panel">
          <Building2
            className="w-12 h-12 text-gray-400 mx-auto mb-4"
            aria-hidden="true"
          />
          <p className="text-gray-600 mb-4">No buildings yet</p>
          {canManage && (
            <Button
              onClick={() => handleOpenModal()}
              size="sm"
              className="bg-sky-400 text-white border-2 border-sky-500 hover:bg-sky-500"
            >
              Add Your First Building
            </Button>
          )}
        </div>
      ) : (
        <section className="wf-panel p-0 bg-white rounded-lg overflow-hidden mx-auto max-w-4xl shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full wf-table">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Building
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-3/4">
                    Address
                  </th>
                  {canManage && (
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {buildings.map((building, index) => (
                  <tr
                    key={building.id}
                    className={
                      index === buildings.length - 1
                        ? ""
                        : "border-b border-gray-200"
                    }
                  >
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-center flex-shrink-0">
                          <Building2
                            className="w-5 h-5 text-gray-800"
                            aria-hidden="true"
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {building.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center w-3/4">
                      <div className="flex items-start justify-center gap-1.5 text-sm text-gray-600">
                        <MapPin
                          className="w-4 h-4 mt-0.5 flex-shrink-0"
                          aria-hidden="true"
                        />
                        <span>{building.address}</span>
                      </div>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => handleOpenModal(building)}
                            className="w-10 h-10 flex items-center justify-center text-gray-700 border border-gray-300 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                            aria-label={`Edit ${building.name}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(building)}
                            className="w-10 h-10 flex items-center justify-center text-red-700 border border-gray-300 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                            aria-label={`Delete ${building.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Add/Edit Building Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingBuilding ? "Edit Building" : "Add New Building"}
        showClose={false}
        footer={
          <div className="w-full grid gap-3">
            <Button
              type="submit"
              loading={submitting}
              onClick={handleSubmit}
              size="sm"
              className="bg-sky-400 text-white border-2 border-sky-500 hover:bg-sky-500 mx-auto"
            >
              {editingBuilding ? "Update Building" : "Add Building"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleCloseModal}
              type="button"
              size="sm"
              className="bg-red-100 text-gray-900 border-2 border-red-200 hover:bg-red-200 mx-auto"
            >
              Cancel
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} id="building-form">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label
                htmlFor="building-name"
                className="text-sm font-medium text-gray-700 text-center"
              >
                Building Name{" "}
                <span className="text-red-600 ml-1" aria-label="required">
                  :
                </span>
              </label>
              <div className="flex-1">
                <Input
                  id="building-name"
                  type="text"
                  required
                  placeholder="e.g., Main Office Building"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  error={formErrors.name}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label
                htmlFor="building-address"
                className="text-sm font-medium text-gray-700 text-center"
              >
                Address{" "}
                <span className="text-red-600" aria-label="required">
                  :
                </span>
              </label>
              <div className="flex-1">
                <Textarea
                  id="building-address"
                  required
                  rows={3}
                  placeholder="e.g., 123 Main Street, City, State 12345"
                  className="text-center"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  error={formErrors.address}
                />
              </div>
            </div>

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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setBuildingToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Building"
        message={`Are you sure you want to delete "${buildingToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
