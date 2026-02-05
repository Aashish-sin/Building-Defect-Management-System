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
        <h1 className="text-2xl font-semibold text-gray-900">Buildings</h1>
        {canManage && (
          <Button onClick={() => handleOpenModal()}>
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
            <Button onClick={() => handleOpenModal()}>
              Add Your First Building
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {buildings.map((building) => (
            <article
              key={building.id}
              className="wf-panel-soft p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-center flex-shrink-0">
                  <Building2
                    className="w-6 h-6 text-gray-800"
                    aria-hidden="true"
                  />
                </div>
                {canManage && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(building)}
                      className="w-11 h-11 flex items-center justify-center text-gray-700 border border-gray-300 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                      aria-label={`Edit ${building.name}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(building)}
                      className="w-11 h-11 flex items-center justify-center text-red-700 border border-gray-300 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                      aria-label={`Delete ${building.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {building.name}
                </h2>
                <div className="flex items-start gap-1.5 text-sm text-gray-600 mb-3">
                  <MapPin
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span>{building.address}</span>
                </div>
                <div className="text-sm text-gray-500">ID: {building.id}</div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Add/Edit Building Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingBuilding ? "Edit Building" : "Add New Building"}
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseModal} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={submitting} onClick={handleSubmit}>
              {editingBuilding ? "Update Building" : "Add Building"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} id="building-form">
          <div className="space-y-4">
            <Input
              label="Building Name"
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

            <Textarea
              label="Address"
              id="building-address"
              required
              rows={3}
              placeholder="e.g., 123 Main Street, City, State 12345"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              error={formErrors.address}
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
