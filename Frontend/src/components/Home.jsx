import { useState } from "react";

export function Wireframe() {
  const [activeScreen, setActiveScreen] = useState("layout");

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Building Defect Management System
          </h1>
          <p className="text-gray-600">Click on different screens to view</p>
        </div>

        {/* Screen Selector */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveScreen("layout")}
            className={`px-4 py-2 rounded ${
              activeScreen === "layout"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveScreen("defect-list")}
            className={`px-4 py-2 rounded ${
              activeScreen === "defect-list"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Defect List
          </button>
          <button
            onClick={() => setActiveScreen("defect-detail")}
            className={`px-4 py-2 rounded ${
              activeScreen === "defect-detail"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Defect Detail
          </button>
          <button
            onClick={() => setActiveScreen("defect-form")}
            className={`px-4 py-2 rounded ${
              activeScreen === "defect-form"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Defect Form
          </button>
        </div>

        {/* Wireframe Content */}
        <div className="bg-white border-4 border-gray-800 rounded-lg p-8">
          {activeScreen === "layout" && <GlobalLayoutWireframe />}
          {activeScreen === "defect-list" && <DefectListWireframe />}
          {activeScreen === "defect-detail" && <DefectDetailWireframe />}
          {activeScreen === "defect-form" && <DefectFormWireframe />}
        </div>
      </div>
    </div>
  );
}

function GlobalLayoutWireframe() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Welcome!</h2>

      {/* Top Nav */}
      <div className="border-2 border-gray-600 p-4">
        <div className="text-xs font-bold text-gray-500 mb-2">
          TOP NAVIGATION
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-3">
              <div className="px-3 py-1 border border-gray-400 text-xs">
                Buildings ▼
              </div>
              <div className="px-3 py-1 border border-gray-400 text-xs">
                Defects
              </div>
              <div className="px-3 py-1 border border-gray-400 text-xs">
                Analytics*
              </div>
            </div>
          </div>
          <div className="px-3 py-1 border border-gray-400 text-xs">
            Profile
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Left Sidebar */}
        <div className="w-48 border-2 border-gray-600 p-4">
          <div className="text-xs font-bold text-gray-500 mb-3">
            LEFT SIDEBAR
          </div>
          <div className="space-y-2">
            <div className="p-2 bg-gray-200 border border-gray-400 text-xs">
              Dashboard
            </div>
            <div className="p-2 border border-gray-400 text-xs">Defects</div>
            <div className="p-2 border border-gray-400 text-xs flex justify-between">
              Buildings <span className="text-gray-500">*</span>
            </div>
            <div className="p-2 border border-gray-400 text-xs flex justify-between">
              Users <span className="text-gray-500">*</span>
            </div>
            <div className="p-2 border border-gray-400 text-xs flex justify-between">
              Analytics <span className="text-gray-500">*</span>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">* Admin Only</div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 border-2 border-gray-600 p-6 min-h-[300px]">
          <div className="text-xs font-bold text-gray-500 mb-2">
            MAIN CONTENT AREA
          </div>
          <div className="flex items-center justify-center h-40 border-2 border-dashed border-gray-400">
            <span className="text-gray-400">Page content renders here</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DefectListWireframe() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Defect List</h2>

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-bold">DEFECT LIST</div>
        <div className="px-4 py-2 border-2 border-gray-600 text-xs">
          + Log Defect
        </div>
      </div>

      {/* Filters */}
      <div className="border-2 border-gray-600 p-4">
        <div className="text-xs font-bold text-gray-500 mb-3">FILTERS</div>
        <div className="grid grid-cols-3 gap-3">
          <div className="border border-gray-400 p-2 text-xs">Building ▼</div>
          <div className="border border-gray-400 p-2 text-xs">Status ▼</div>
          <div className="border border-gray-400 p-2 text-xs">
            Assigned To ▼
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border-2 border-gray-600">
        <div className="text-xs font-bold text-gray-500 p-2 border-b-2 border-gray-600">
          TABLE
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-6 gap-2 p-3 bg-gray-200 border-b border-gray-400">
          <div className="text-xs font-bold">ID</div>
          <div className="text-xs font-bold">Title</div>
          <div className="text-xs font-bold">Building</div>
          <div className="text-xs font-bold">Status</div>
          <div className="text-xs font-bold">Assigned</div>
          <div className="text-xs font-bold">Updated</div>
        </div>

        {/* Table Rows */}
        <div className="grid grid-cols-6 gap-2 p-3 border-b border-gray-300">
          <div className="text-xs">21</div>
          <div className="text-xs">Water Leak</div>
          <div className="text-xs">Tower A</div>
          <div className="text-xs px-2 py-0.5 bg-yellow-100 border border-yellow-300 inline-block">
            Ongoing
          </div>
          <div className="text-xs">Tech 3</div>
          <div className="text-xs">2h ago</div>
        </div>

        <div className="grid grid-cols-6 gap-2 p-3 border-b border-gray-300">
          <div className="text-xs">22</div>
          <div className="text-xs">Lift Noise</div>
          <div className="text-xs">Tower B</div>
          <div className="text-xs px-2 py-0.5 bg-purple-100 border border-purple-300 inline-block">
            Reviewed
          </div>
          <div className="text-xs">—</div>
          <div className="text-xs">1d ago</div>
        </div>

        <div className="grid grid-cols-6 gap-2 p-3 border-b border-gray-300">
          <div className="text-xs">23</div>
          <div className="text-xs">Broken Window</div>
          <div className="text-xs">Tower A</div>
          <div className="text-xs px-2 py-0.5 bg-green-100 border border-green-300 inline-block">
            Done
          </div>
          <div className="text-xs">Tech 1</div>
          <div className="text-xs">2d ago</div>
        </div>
      </div>
    </div>
  );
}

function DefectDetailWireframe() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Defect Detail Page</h2>

      {/* Header */}
      <div className="border-2 border-gray-600 p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-1">
            <div className="text-sm font-bold mb-1">Defect Title</div>
            <div className="text-xs text-gray-600">Building | Created Date</div>
          </div>
          <div className="px-3 py-1 bg-yellow-100 border border-yellow-400 text-xs">
            Status Badge
          </div>
        </div>

        {/* Image */}
        <div className="border-2 border-dashed border-gray-400 h-32 flex items-center justify-center mb-3">
          <span className="text-xs text-gray-400">[Image Preview]</span>
        </div>

        {/* Description */}
        <div>
          <div className="text-xs font-bold text-gray-500 mb-1">
            DESCRIPTION
          </div>
          <div className="border border-gray-400 p-2 text-xs bg-gray-50">
            Description text goes here...
          </div>
        </div>
      </div>

      {/* Structured Comments */}
      <div className="border-2 border-gray-600 p-4">
        <div className="text-xs font-bold text-gray-500 mb-3">
          STRUCTURED COMMENTS
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-3 border-b-2 border-gray-300">
          <div className="px-3 py-2 text-xs border-b-2 border-blue-600 -mb-[2px]">
            Initial Report
          </div>
          <div className="px-3 py-2 text-xs text-gray-500">Progress Report</div>
          <div className="px-3 py-2 text-xs text-gray-500">
            Completion Report
          </div>
        </div>

        {/* Tab Content */}
        <div className="border border-gray-400 p-3 min-h-[100px] bg-gray-50">
          <div className="text-xs text-gray-400">
            [Text content for selected tab]
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-2 border-gray-600 p-4">
        <div className="text-xs font-bold text-gray-500 mb-3">
          ACTIONS (Role-based)
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="px-3 py-1 border-2 border-purple-600 text-xs">
            Review
          </div>
          <div className="px-3 py-1 border-2 border-blue-600 text-xs">
            Assign Technician
          </div>
          <div className="px-3 py-1 border-2 border-yellow-600 text-xs">
            Mark Ongoing
          </div>
          <div className="px-3 py-1 border-2 border-green-600 text-xs">
            Mark Done
          </div>
          <div className="px-3 py-1 border-2 border-gray-600 text-xs">
            Complete
          </div>
          <div className="px-3 py-1 border-2 border-red-600 text-xs">
            Delete*
          </div>
        </div>
      </div>
    </div>
  );
}

function DefectFormWireframe() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Defect Creation Form</h2>
      <div className="text-xs text-gray-600 mb-4">
        (CSR / Building Executive)
      </div>

      <div className="border-2 border-gray-600 p-6 space-y-4">
        {/* Title */}
        <div>
          <div className="text-xs font-bold mb-2">Defect *</div>
          <div className="border border-gray-400 p-2 bg-gray-50 text-xs text-gray-400">
            [Input field]
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="text-xs font-bold mb-2">Initial Report *</div>
          <div className="border border-gray-400 p-2 h-20 bg-gray-50 text-xs text-gray-400">
            [Textarea]
          </div>
        </div>

        {/* Building */}
        <div>
          <div className="text-xs font-bold mb-2">Building *</div>
          <div className="border border-gray-400 p-2 bg-gray-50 text-xs text-gray-400">
            Select building ▼
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <div className="text-xs font-bold mb-2">Image Upload</div>
          <div className="border-2 border-dashed border-gray-400 p-6 text-center">
            <div className="text-xs text-gray-400 mb-1">📤</div>
            <div className="text-xs text-gray-400">
              Click to upload or drag and drop
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-2 pt-4">
          <div className="px-4 py-2 bg-blue-600 text-white text-xs font-bold">
            Submit
          </div>
          <div className="px-4 py-2 border border-gray-400 text-xs">Cancel</div>
        </div>
      </div>
    </div>
  );
}
