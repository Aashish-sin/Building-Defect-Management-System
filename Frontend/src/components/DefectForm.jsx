import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import { defectsAPI, buildingsAPI } from "../services/api";

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

  const optimizeImage = (file, maxSize = 1280, quality = 0.8) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          const scale = Math.min(maxSize / width, maxSize / height, 1);
          width = Math.round(width * scale);
          height = Math.round(height * scale);

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

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
        ? await optimizeImage(imageFile)
        : null;
      const defectData = {
        title: formData.title,
        description: formData.description,
        building_id: parseInt(formData.building_id),
        priority: formData.priority,
        initial_report: formData.initial_report,
        initial_report_image: initialReportImage,
        image_url: initialReportImage,
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
      optimizeImage(file)
        .then((optimized) => setImagePreview(optimized))
        .catch(() => setImagePreview(""));
    }
  };

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate("/defects")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transform transition-transform hover:scale-105 active:scale-95 active:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Defects
      </button>

      <div className="wf-panel p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Log New Defect
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Defect Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              aria-invalid={!!formErrors.title}
              className={`w-full px-3 py-2 border-2 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-600 ${
                formErrors.title ? "border-red-600" : "border-gray-300"
              }`}
              placeholder="Brief description of the defect"
            />
            {formErrors.title && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {formErrors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={5}
              aria-invalid={!!formErrors.description}
              className={`w-full px-3 py-2 border-2 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-600 ${
                formErrors.description ? "border-red-600" : "border-gray-300"
              }`}
              placeholder="Detailed description of the defect..."
            />
            {formErrors.description && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {formErrors.description}
              </p>
            )}
          </div>

          {/* Building */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Building <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.building_id}
              onChange={(e) =>
                setFormData({ ...formData, building_id: e.target.value })
              }
              aria-invalid={!!formErrors.building_id}
              className={`w-full px-3 py-2 border-2 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-600 ${
                formErrors.building_id ? "border-red-600" : "border-gray-300"
              }`}
            >
              <option value="">Select a building</option>
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
            {formErrors.building_id && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {formErrors.building_id}
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              aria-invalid={!!formErrors.priority}
              className={`w-full px-3 py-2 border-2 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-600 ${
                formErrors.priority ? "border-red-600" : "border-gray-300"
              }`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {formErrors.priority && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {formErrors.priority}
              </p>
            )}
          </div>

          {/* Initial Report */}
          {role === "csr" && (
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
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-600"
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
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-600"
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
                    className="mt-4 w-full max-w-sm rounded-md border-2 border-gray-300"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-white text-gray-900 border-2 border-gray-800 rounded-md hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Defect"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/defects")}
              className="px-6 py-2.5 border-2 border-gray-400 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
