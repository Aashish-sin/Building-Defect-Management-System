import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import { defectsAPI, buildingsAPI } from "../services/api";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Select } from "./ui/Select";
import { Alert } from "./ui/Alert";

export function DefectForm({ currentUser }) {
  const navigate = useNavigate();
  const role = (currentUser?.role || "").trim().toLowerCase().replace(" ", "_");
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    building_id: "",
    priority: "medium",
    initial_report: "",
    external_contractor: false,
    contractor_name: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const maxImageSizeMb = 10;

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    try {
      const response = await buildingsAPI.getAll();
      setBuildings(response.data);
    } catch (err) {
      setError("Failed to load buildings");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFormErrors({});

    const validationErrors = {};
    if (!formData.title.trim()) validationErrors.title = "Title is required";
    if (!formData.description.trim())
      validationErrors.description = "Description is required";
    if (!formData.building_id)
      validationErrors.building_id = "Building is required";
    if (!formData.priority) validationErrors.priority = "Priority is required";

    if (imageFile && imageFile.size > maxImageSizeMb * 1024 * 1024) {
      validationErrors.image = `Image must be under ${maxImageSizeMb}MB`;
    }

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const initialReportImage = imageFile
        ? await resizeImage(imageFile)
        : null;
      const defectData = {
        title: formData.title,
        description: formData.description,
        building_id: parseInt(formData.building_id),
        priority: formData.priority,
        initial_report: formData.initial_report,
        initial_report_image: initialReportImage,
        external_contractor: formData.external_contractor,
        contractor_name: formData.contractor_name || null,
      };

      await defectsAPI.create(defectData);
      navigate("/defects");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create defect");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        setFormErrors((prev) => ({
          ...prev,
          image: "Please select a valid image file",
        }));
        return;
      }
      if (file.size > maxImageSizeMb * 1024 * 1024) {
        setFormErrors((prev) => ({
          ...prev,
          image: `Image must be under ${maxImageSizeMb}MB`,
        }));
        return;
      }
      setFormErrors((prev) => ({ ...prev, image: "" }));
      setImageFile(file);
      resizeImage(file)
        .then((optimized) => setImagePreview(optimized))
        .catch(() => setImagePreview(""));
    }
  };

  return (
    <div className="w-full mx-auto" style={{ maxWidth: "72rem" }}>
      <Button
        size="sm"
        onClick={() => navigate("/defects")}
        className="mb-6 bg-sky-400 text-white border-2 border-sky-500 hover:bg-sky-500"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Defects
      </Button>

      <div className="wf-panel p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Log New Defect
        </h1>

        {error && (
          <Alert
            type="error"
            message={error}
            dismissible
            onClose={() => setError(null)}
            className="mb-4"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 text-center">
              Defect Title{" "}
              <span className="text-red-600" aria-label="required">
                :
              </span>
            </label>
            <div className="flex-1">
              <Input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Brief description of the defect"
                error={formErrors.title}
                className="bg-white"
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 text-center">
              Detailed Description{" "}
              <span className="text-red-600" aria-label="required">
                :
              </span>
            </label>
            <div className="flex-1">
              <Textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={5}
                placeholder="Detailed description of the defect..."
                className="bg-white"
                error={formErrors.description}
              />
            </div>
          </div>

          {/* Building */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 text-center">
              Building{" "}
              <span className="text-red-600" aria-label="required">
                :
              </span>
            </label>
            <div className="flex-1">
              <Select
                required
                value={formData.building_id}
                onChange={(e) =>
                  setFormData({ ...formData, building_id: e.target.value })
                }
                error={formErrors.building_id}
                className="bg-white"
              >
                <option value="">Select a building</option>
                {buildings.map((building) => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 text-center">
              Priority{" "}
              <span className="text-red-600" aria-label="required">
                :
              </span>
            </label>
            <div className="flex-1">
              <Select
                required
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                error={formErrors.priority}
                className="bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </div>
          </div>

          {/* Initial Report */}
          {["csr", "admin", "building_executive"].includes(role) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Report
              </label>
              <textarea
                value={formData.initial_report}
                onChange={(e) =>
                  setFormData({ ...formData, initial_report: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-gray-400 focus:border-gray-600"
                placeholder="Your initial report of the defect..."
              />
            </div>
          )}

          {/* External Contractor */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.external_contractor}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    external_contractor: e.target.checked,
                    contractor_name: e.target.checked
                      ? formData.contractor_name
                      : "",
                  })
                }
                className="w-4 h-4 text-gray-800 border-gray-400 rounded focus:ring-gray-400"
              />
              <span className="text-sm font-medium text-gray-700">
                External Contractor Required
              </span>
            </label>
            {formData.external_contractor && (
              <span className="inline-flex mt-2 text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full border border-gray-300">
                Enabled
              </span>
            )}
          </div>

          {/* Contractor Name */}
          {formData.external_contractor && (
            <div className="transition-all duration-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contractor Name
              </label>
              <input
                type="text"
                value={formData.contractor_name}
                onChange={(e) =>
                  setFormData({ ...formData, contractor_name: e.target.value })
                }
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-gray-400 focus:border-gray-600"
                placeholder="Enter contractor name"
              />
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Upload
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6">
              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-2 file:border-gray-400 file:text-sm file:font-medium file:bg-white file:text-gray-700 hover:file:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  aria-invalid={!!formErrors.image}
                />
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 10MB
                </p>
                {formErrors.image && (
                  <p className="text-sm text-red-600 mt-2" role="alert">
                    {formErrors.image}
                  </p>
                )}
                {imageFile && (
                  <p className="text-sm text-gray-700 mt-3">
                    Selected: {imageFile.name}
                  </p>
                )}
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Initial report preview"
                    className="mt-4 object-cover rounded-md border-2 border-gray-300"
                    style={{
                      width: "600px",
                      height: "420px",
                      margin: "0 auto",
                      display: "block",
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              size="md"
              type="submit"
              loading={loading}
              disabled={loading}
              className="bg-sky-400 text-white border-2 border-sky-500 hover:bg-sky-500"
            >
              {loading ? "Submitting..." : "Submit Defect"}
            </Button>
            <Button
              size="md"
              type="button"
              onClick={() => navigate("/defects")}
              className="bg-sky-400 text-white border-2 border-sky-500 hover:bg-sky-500"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
