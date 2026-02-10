import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Building2,
  AlertCircle,
  Upload,
  Edit2,
} from "lucide-react";
import { defectsAPI, buildingsAPI, usersAPI } from "../services/api";
import { StatusBadge } from "./ui/Badge";
import { ConfirmDialog } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Alert } from "./ui/Alert";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { formatDate } from "../utils/dateFormatter";

const EMPTY_COMMENT_VALUES = {
  initial_report: "",
  executive_decision: "",
  technician_report: "",
  verification_report: "",
  final_completion: "",
};

const COMMENT_FIELDS = [
  { id: "initial_report", label: "Initial Report" },
  { id: "executive_decision", label: "Executive Decision" },
  { id: "technician_report", label: "Technician Report" },
  { id: "verification_report", label: "Verification Report" },
  { id: "final_completion", label: "Final Completion" },
];

export function DefectDetail({ currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = (currentUser?.role || "").trim().toLowerCase().replace(" ", "_");
  const [defect, setDefect] = useState(null);
  const [building, setBuilding] = useState(null);
  const [assignee, setAssignee] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [activeTab, setActiveTab] = useState("initial_report");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentValues, setCommentValues] = useState({
    ...EMPTY_COMMENT_VALUES,
  });
  const [commentInput, setCommentInput] = useState({
    ...EMPTY_COMMENT_VALUES,
  });
  const [savingComment, setSavingComment] = useState("");
  const [assignTechId, setAssignTechId] = useState("");
  const [contractorNameInput, setContractorNameInput] = useState("");
  const [technicianPhotoFile, setTechnicianPhotoFile] = useState(null);
  const [technicianPhotoPreview, setTechnicianPhotoPreview] = useState("");
  const [deletePhotoDialog, setDeletePhotoDialog] = useState({
    open: false,
    label: "",
    payload: null,
  });
  const [deleteDefectDialogOpen, setDeleteDefectDialogOpen] = useState(false);

  useEffect(() => {
    loadDefect();
  }, [id]);

  const loadDefect = async () => {
    try {
      setLoading(true);

      // Fetch defect first as it is critical
      const defectRes = await defectsAPI.getById(id);
      const defectData = defectRes.data;
      setDefect(defectData);
      setAssignTechId(
        defectData.assigned_technician_id
          ? String(defectData.assigned_technician_id)
          : "",
      );
      setContractorNameInput(defectData.contractor_name || "");

      // Fetch comments separately to prevent page failure if comments don't exist yet
      try {
        const commentsRes = await defectsAPI.getComments(id);
        const normalizedComments = Array.isArray(commentsRes.data)
          ? commentsRes.data
          : [];
        const latestValues = { ...EMPTY_COMMENT_VALUES };
        normalizedComments.forEach((comment) => {
          COMMENT_FIELDS.forEach((field) => {
            if (comment?.[field.id]) {
              latestValues[field.id] = comment[field.id];
            }
          });
        });
        setCommentValues(latestValues);
        setCommentInput(latestValues);
      } catch (err) {
        setCommentValues({ ...EMPTY_COMMENT_VALUES });
        setCommentInput({ ...EMPTY_COMMENT_VALUES });
      }

      // Fetch building details
      if (defectData.building_id) {
        try {
          const buildingRes = await buildingsAPI.getById(
            defectData.building_id,
          );
          setBuilding(buildingRes.data);
        } catch (err) {}
      }

      // Fetch assigned technician details
      if (defectData.assigned_technician_id) {
        try {
          const techRes = await usersAPI.getById(
            defectData.assigned_technician_id,
          );
          setAssignee(techRes.data);
        } catch (err) {}
      }

      if (role === "admin" || role === "building_executive") {
        try {
          const techsRes = await usersAPI.getTechnicians();
          setTechnicians(techsRes.data);
        } catch (err) {}
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load defect");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "text-gray-600",
      medium: "text-yellow-600",
      high: "text-red-600",
    };
    return colors[priority] || "text-gray-600";
  };

  const tabs = [
    { id: "initial_report", label: "Initial Report", roles: ["csr", "admin"] },
    {
      id: "executive_decision",
      label: "Executive Decision",
      roles: ["building_executive", "admin"],
    },
    {
      id: "technician_report",
      label: "Technician Report",
      roles: ["technician", "admin"],
    },
    {
      id: "verification_report",
      label: "Verification Report",
      roles: ["building_executive", "admin"],
    },
    {
      id: "final_completion",
      label: "Final Completion",
      roles: ["building_executive", "admin"],
    },
  ];

  const canEditTab = (tabRoles) => {
    return tabRoles.includes(role);
  };

  const activeTabConfig =
    tabs.find((tab) => tab.id === activeTab) ||
    tabs.find((tab) => tab.id === "initial_report");

  const handleTabKeyDown = (e) => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (e.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    if (e.key === "ArrowLeft")
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (e.key === "Home") nextIndex = 0;
    if (e.key === "End") nextIndex = tabs.length - 1;

    if (nextIndex !== currentIndex) {
      e.preventDefault();
      setActiveTab(tabs[nextIndex].id);
    }
  };

  const handleCommentChange = (field, value) => {
    setCommentInput((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveComment = async (field) => {
    const value = commentInput[field]?.trim();
    if (!value) {
      setError("Comment cannot be empty.");
      return;
    }

    try {
      setSavingComment(field);
      const response = await defectsAPI.updateComments(id, { [field]: value });
      const updatedComment = response?.data;
      if (updatedComment?.id) {
        setCommentValues((prev) => ({ ...prev, [field]: value }));
      }
      setCommentInput((prev) => ({ ...prev, [field]: value }));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save comment");
    } finally {
      setSavingComment("");
    }
  };

  const handleStatusChange = async (action, data = {}) => {
    try {
      setLoading(true);
      let response;

      if (action === "done") {
        if (!technicianPhotoPreview) {
          setError("Completed job photo is required.");
          setLoading(false);
          return;
        }
        data.technician_report_image = technicianPhotoPreview;
      }

      switch (action) {
        case "review":
          response = await defectsAPI.review(id, data);
          break;
        case "assign":
          response = await defectsAPI.assign(id, data);
          break;
        case "ongoing":
          response = await defectsAPI.markOngoing(id, data);
          break;
        case "done":
          response = await defectsAPI.markDone(id, data);
          break;
        case "complete":
          response = await defectsAPI.markComplete(id, data);
          break;
        case "reopen":
          response = await defectsAPI.reopen(id);
          break;
        case "delete":
          await defectsAPI.delete(id);
          navigate("/defects");
          return;
      }

      setDefect(response.data);
      await loadDefect();
      if (action === "done") {
        setTechnicianPhotoFile(null);
        setTechnicianPhotoPreview("");
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} defect`);
    } finally {
      setLoading(false);
    }
  };

  const resizeImage = (file, width = 600, height = 420, quality = 0.8) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.max(width / img.width, height / img.height);
          const scaledWidth = Math.round(img.width * scale);
          const scaledHeight = Math.round(img.height * scale);
          const offsetX = Math.round((width - scaledWidth) / 2);
          const offsetY = Math.round((height - scaledHeight) / 2);

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleTechnicianPhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTechnicianPhotoFile(file);
      resizeImage(file)
        .then((optimized) => setTechnicianPhotoPreview(optimized))
        .catch(() => setTechnicianPhotoPreview(""));
    }
  };

  const handleAttributeUpdate = async (field, value) => {
    try {
      setLoading(true);
      const response = await defectsAPI.update(id, { [field]: value });
      setDefect(response.data);
      if (field === "contractor_name") {
        setContractorNameInput(response.data.contractor_name || "");
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to update ${field}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContractorName = async () => {
    const value = contractorNameInput.trim();
    await handleAttributeUpdate("contractor_name", value);
  };

  const handleAssignTechnician = async () => {
    if (!assignTechId) {
      setError("Select a technician to assign.");
      return;
    }
    await handleStatusChange("assign", {
      assigned_technician_id: parseInt(assignTechId, 10),
    });
  };

  const handleImageUpdate = async (field, file) => {
    if (!file) return;
    const optimized = await resizeImage(file);
    await handleAttributeUpdate(field, optimized);
  };

  const handleImageDelete = async (fields) => {
    try {
      setLoading(true);
      const response = await defectsAPI.update(id, fields);
      setDefect(response.data);
      await loadDefect();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete photo");
    } finally {
      setLoading(false);
    }
  };

  const openDeletePhotoDialog = (payload, label) => {
    setDeletePhotoDialog({ open: true, payload, label });
  };

  const closeDeletePhotoDialog = () => {
    setDeletePhotoDialog({ open: false, payload: null, label: "" });
  };

  const confirmDeletePhoto = async () => {
    if (!deletePhotoDialog.payload) {
      closeDeletePhotoDialog();
      return;
    }
    await handleImageDelete(deletePhotoDialog.payload);
    closeDeletePhotoDialog();
  };

  if (loading) {
    return (
      <div className="max-w-5xl flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading defect details...</p>
        </div>
      </div>
    );
  }

  if (error && !defect) {
    return (
      <div className="max-w-5xl py-12">
        <Alert
          type="error"
          message={error}
          className="mb-4"
          dismissible={false}
        />
      </div>
    );
  }

  if (!defect) {
    return (
      <div className="max-w-5xl py-12">
        <Alert
          type="warning"
          message="Defect not found"
          className="mb-4"
          dismissible={false}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <nav className="text-sm text-gray-500 mb-3" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <button
              type="button"
              onClick={() => navigate("/defects")}
              className="hover:text-gray-700 focus:outline-none focus:underline"
            >
              Defects
            </button>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-700 font-medium">Defect #{defect.id}</li>
        </ol>
      </nav>
      <Button
        size="sm"
        onClick={() => navigate("/defects")}
        className="mb-6 bg-sky-400 text-white border-2 border-sky-500 hover:bg-sky-500"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Defects
      </Button>

      {/* Header */}
      <div className="wf-panel p-6 mb-6">
        {error && (
          <Alert
            type="error"
            message={error}
            dismissible
            onClose={() => setError(null)}
            className="mb-4"
          />
        )}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-gray-900">
                {defect.title}
              </h1>
              {["admin", "building_executive"].includes(role) ? (
                <select
                  value={defect.status}
                  onChange={(e) =>
                    handleAttributeUpdate("status", e.target.value)
                  }
                  className="px-3 py-1 rounded-full text-sm font-medium border-2 border-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  {["Open", "Reviewed", "Ongoing", "Done", "Completed"].map(
                    (s) => (
                      <option
                        key={s}
                        value={s}
                        className="bg-white text-gray-900"
                      >
                        {s}
                      </option>
                    ),
                  )}
                </select>
              ) : (
                <StatusBadge status={defect.status} />
              )}
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                {building?.name}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Created {formatDate(defect.created_at)}
              </div>
              {["admin", "csr"].includes(role) ? (
                <div className="flex items-center gap-1.5">
                  <AlertCircle
                    className={`w-4 h-4 ${getPriorityColor(defect.priority)}`}
                  />
                  <select
                    value={defect.priority}
                    onChange={(e) =>
                      handleAttributeUpdate("priority", e.target.value)
                    }
                    className={`font-medium border-0 p-0 pr-6 cursor-pointer focus:ring-0 ${getPriorityColor(defect.priority)}`}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              ) : (
                <div
                  className={`flex items-center gap-1.5 font-medium ${getPriorityColor(defect.priority)}`}
                >
                  <AlertCircle className="w-4 h-4" />
                  {defect.priority.charAt(0).toUpperCase() +
                    defect.priority.slice(1)}{" "}
                  Priority
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Description
          </h3>
          <p className="text-gray-900 whitespace-pre-wrap">
            {defect.description}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t-2 border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Defect Photos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group">
              <p className="text-xs font-medium text-gray-600 mb-2 flex justify-between">
                Initial Report Photo
                {["admin", "building_executive", "csr"].includes(role) && (
                  <label className="cursor-pointer text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <Edit2 className="w-3 h-3" /> Edit
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpdate(
                          "initial_report_image",
                          e.target.files[0],
                        )
                      }
                    />
                  </label>
                )}
                {["admin", "building_executive", "csr"].includes(role) && (
                  <Button
                    size="xs"
                    type="button"
                    onClick={() =>
                      openDeletePhotoDialog(
                        {
                          initial_report_image: null,
                          image_url: null,
                        },
                        "initial report photo",
                      )
                    }
                    disabled={!defect.initial_report_image && !defect.image_url}
                    className="bg-sky-400 text-white border-2 border-sky-500 hover:bg-sky-500"
                  >
                    Delete
                  </Button>
                )}
              </p>
              {defect.initial_report_image || defect.image_url ? (
                <img
                  src={defect.initial_report_image || defect.image_url}
                  alt="Initial report"
                  className="object-cover rounded-lg border-2 border-gray-300"
                  style={{
                    width: "600px",
                    height: "420px",
                    margin: "0 auto",
                    display: "block",
                  }}
                />
              ) : (
                <div className="h-48 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-sm text-gray-400">
                  No initial report photo
                </div>
              )}
            </div>
            <div className="relative group">
              <p className="text-xs font-medium text-gray-600 mb-2 flex justify-between">
                Technician Report Photo
                {["admin", "building_executive", "technician"].includes(
                  role,
                ) && (
                  <label className="cursor-pointer text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <Upload className="w-3 h-3" /> Upload
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpdate(
                          "technician_report_image",
                          e.target.files[0],
                        )
                      }
                    />
                  </label>
                )}
                {["admin", "building_executive", "technician"].includes(
                  role,
                ) && (
                  <Button
                    size="xs"
                    type="button"
                    onClick={() =>
                      openDeletePhotoDialog(
                        { technician_report_image: null },
                        "technician report photo",
                      )
                    }
                    disabled={!defect.technician_report_image}
                    className="bg-sky-400 text-white border-2 border-sky-500 hover:bg-sky-500"
                  >
                    Delete
                  </Button>
                )}
              </p>
              {defect.technician_report_image ? (
                <img
                  src={defect.technician_report_image}
                  alt="Technician report"
                  className="object-cover rounded-lg border-2 border-gray-300"
                  style={{
                    width: "600px",
                    height: "420px",
                    margin: "0 auto",
                    display: "block",
                  }}
                />
              ) : (
                <div className="h-48 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-sm text-gray-400">
                  {defect.assigned_technician_id
                    ? "No technician report photo"
                    : "No technician assigned"}
                </div>
              )}
            </div>
          </div>
        </div>

        {["admin", "building_executive"].includes(role) ? (
          <div className="mt-4 pt-4 border-t-2 border-gray-200">
            <div className="flex items-center gap-2">
              <input
                id="external_contractor"
                type="checkbox"
                checked={!!defect.external_contractor}
                onChange={(e) =>
                  handleAttributeUpdate("external_contractor", e.target.checked)
                }
                className="w-4 h-4 text-gray-800 border-gray-400 rounded focus:ring-gray-400"
              />
              <label
                htmlFor="external_contractor"
                className="text-sm font-medium text-gray-700"
              >
                External Contractor Required
              </label>
            </div>
            {defect.external_contractor && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contractor Name
                </label>
                <input
                  type="text"
                  value={contractorNameInput}
                  onChange={(e) => setContractorNameInput(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-600"
                  placeholder="Enter contractor name"
                />
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveContractorName}
                    disabled={
                      contractorNameInput.trim() ===
                      (defect.contractor_name || "").trim()
                    }
                    className="bg-sky-400 text-white border-2 border-sky-500 hover:bg-sky-500"
                  >
                    Save Contractor Name
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          defect.external_contractor && (
            <div className="mt-4 pt-4 border-t-2 border-gray-200">
              <span className="text-sm text-gray-600">
                External Contractor:{" "}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {defect.contractor_name || "Not specified"}
              </span>
            </div>
          )
        )}

        {["admin", "building_executive"].includes(role) && (
          <div className="mt-4 pt-4 border-t-2 border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign Technician
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={assignTechId}
                onChange={(e) => setAssignTechId(e.target.value)}
                className="w-full sm:max-w-xs px-3 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-600"
              >
                <option value="">Select technician</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name}
                  </option>
                ))}
              </select>
              <Button
                size="md"
                type="button"
                onClick={handleAssignTechnician}
                disabled={
                  !assignTechId ||
                  String(defect.assigned_technician_id || "") === assignTechId
                }
                className="bg-sky-400 text-white border-2 border-sky-500 hover:bg-sky-500"
              >
                Assign Technician
              </Button>
            </div>
            {technicians.length === 0 && (
              <div className="mt-2 text-xs text-gray-500">
                No technicians available.
              </div>
            )}
          </div>
        )}

        {assignee && (
          <div className="mt-4 pt-4 border-t-2 border-gray-200">
            <span className="text-sm text-gray-600">Assigned to: </span>
            <span className="text-sm font-medium text-gray-900">
              {assignee.name}
            </span>
          </div>
        )}
      </div>

      {/* Defect Reports */}
      <div className="wf-panel p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Defect Reports
        </h2>

        {/* Tabs */}
        <div className="border-b-2 border-gray-200 mb-4">
          <div
            className="flex gap-1 overflow-x-auto"
            role="tablist"
            aria-label="Defect report tabs"
            onKeyDown={handleTabKeyDown}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                id={`tab-${tab.id}`}
                aria-controls={`panel-${tab.id}`}
                aria-selected={activeTab === tab.id}
                tabIndex={activeTab === tab.id ? 0 : -1}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-gray-800 text-gray-900"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTabConfig && (
            <div
              role="tabpanel"
              id={`panel-${activeTabConfig.id}`}
              aria-labelledby={`tab-${activeTabConfig.id}`}
              tabIndex={0}
            >
              {canEditTab(activeTabConfig.roles) ? (
                <div>
                  <textarea
                    value={commentInput[activeTabConfig.id]}
                    onChange={(e) =>
                      handleCommentChange(activeTabConfig.id, e.target.value)
                    }
                    placeholder={`Enter ${activeTabConfig.label.toLowerCase()}...`}
                    rows={6}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-gray-400 focus:border-gray-600"
                  />
                  <Button
                    size="md"
                    type="button"
                    onClick={() => handleSaveComment(activeTabConfig.id)}
                    loading={savingComment === activeTabConfig.id}
                    disabled={!commentInput[activeTabConfig.id]?.trim()}
                    className="mt-2 bg-sky-400 text-white border-2 border-sky-500 hover:bg-sky-500"
                  >
                    {savingComment === activeTabConfig.id
                      ? "Saving..."
                      : `Save ${activeTabConfig.label}`}
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 whitespace-pre-wrap text-gray-900">
                  {commentValues[activeTabConfig.id] || (
                    <span className="text-gray-400 italic">
                      No comments yet
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {role === "admin" && (
        <div className="wf-panel p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Delete Defect
              </h3>
              <p className="text-sm text-gray-600">
                This action cannot be undone.
              </p>
            </div>
            <Button
              size="sm"
              type="button"
              onClick={() => setDeleteDefectDialogOpen(true)}
              className="bg-sky-400 text-white border-2 border-sky-500 hover:bg-sky-500"
            >
              Delete Defect
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deletePhotoDialog.open}
        onClose={closeDeletePhotoDialog}
        onConfirm={confirmDeletePhoto}
        title="Delete Photo"
        message={`Are you sure you want to delete the ${deletePhotoDialog.label}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
      <ConfirmDialog
        isOpen={deleteDefectDialogOpen}
        onClose={() => setDeleteDefectDialogOpen(false)}
        onConfirm={() => handleStatusChange("delete")}
        title="Delete Defect"
        message="Are you sure you want to delete this defect? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
