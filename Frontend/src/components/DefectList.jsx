import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, AlertTriangle } from "lucide-react";
import { defectsAPI, buildingsAPI, usersAPI } from "../services/api";
import { Button } from "./ui/Button";
import { Select } from "./ui/Select";
import { SearchInput } from "./ui/SearchInput";
import { StatusBadge } from "./ui/Badge";
import { Pagination } from "./ui/Pagination";
import { TableSkeleton } from "./ui/LoadingSkeleton";
import { usePagination } from "../hooks/usePagination";
import { formatDate } from "../utils/dateFormatter";

export function DefectList({ currentUser }) {
  const role = (currentUser?.role || "").trim().toLowerCase().replace(" ", "_");
  const [defects, setDefects] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "updated_at",
    direction: "desc",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [defectsRes, buildingsRes] = await Promise.all([
        defectsAPI.getAll(),
        buildingsAPI.getAll(),
      ]);

      setDefects(defectsRes.data);
      setBuildings(buildingsRes.data);

      if (role === "admin" || role === "building_executive") {
        const techRes = await usersAPI.getTechnicians();
        setTechnicians(techRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load defects");
    } finally {
      setLoading(false);
    }
  };

  const filteredDefects = useMemo(() => {
    return defects.filter((defect) => {
      // Building filter
      if (
        buildingFilter !== "all" &&
        defect.building_id !== parseInt(buildingFilter)
      )
        return false;

      // Status filter
      if (statusFilter !== "all" && defect.status !== statusFilter)
        return false;

      // Assigned filter
      if (
        assignedFilter !== "all" &&
        defect.assigned_technician_id !== parseInt(assignedFilter)
      )
        return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const titleMatch = defect.title?.toLowerCase().includes(query);
        const building = buildings.find((b) => b.id === defect.building_id);
        const buildingMatch = building?.name?.toLowerCase().includes(query);
        const idMatch = defect.id.toString().includes(query);

        return titleMatch || buildingMatch || idMatch;
      }

      return true;
    });
  }, [
    defects,
    buildingFilter,
    statusFilter,
    assignedFilter,
    searchQuery,
    buildings,
  ]);

  const sortedDefects = useMemo(() => {
    const sorted = [...filteredDefects];
    const { key, direction } = sortConfig;

    sorted.sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      if (key === "updated_at" || key === "created_at") {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue || "").toLowerCase();
      }

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredDefects, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
    pagination.resetPage();
  };

  const pagination = usePagination(sortedDefects, 10);

  if (loading) {
    return (
      <div className="max-w-7xl">
        <div className="mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <TableSkeleton />
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
    <div className="w-full">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Defect List</h1>
        <Link to="/defects/new">
          <Button>
            <Plus className="w-4 h-4" aria-hidden="true" />
            Log Defect
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 wf-panel-soft p-4 sm:p-5 space-y-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery("")}
          placeholder="Search by ID, title, or building..."
          className="w-full"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Building"
            value={buildingFilter}
            onChange={(e) => {
              setBuildingFilter(e.target.value);
              pagination.resetPage();
            }}
          >
            <option value="all">All Buildings</option>
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </Select>

          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              pagination.resetPage();
            }}
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Done">Done</option>
            <option value="Completed">Completed</option>
          </Select>

          <Select
            label="Assigned To"
            value={assignedFilter}
            onChange={(e) => {
              setAssignedFilter(e.target.value);
              pagination.resetPage();
            }}
          >
            <option value="all">All Assignees</option>
            <option value="">Unassigned</option>
            {technicians.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Responsive Table/Cards */}
      <div className="wf-panel overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full table-fixed">
            <colgroup>
              <col style={{ width: "8%" }} />
              <col style={{ width: "32%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "10%" }} />
            </colgroup>
            <thead className="wf-table-head">
              <tr>
                <th
                  scope="col"
                  aria-sort={
                    sortConfig.key === "id"
                      ? sortConfig.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <button
                    type="button"
                    onClick={() => handleSort("id")}
                    className="flex items-center gap-1 focus:outline-none focus:underline"
                  >
                    ID
                  </button>
                </th>
                <th
                  scope="col"
                  aria-sort={
                    sortConfig.key === "title"
                      ? sortConfig.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <button
                    type="button"
                    onClick={() => handleSort("title")}
                    className="flex items-center gap-1 focus:outline-none focus:underline"
                  >
                    Title
                  </button>
                </th>
                <th
                  scope="col"
                  aria-sort={
                    sortConfig.key === "building_id"
                      ? sortConfig.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <button
                    type="button"
                    onClick={() => handleSort("building_id")}
                    className="flex items-center gap-1 focus:outline-none focus:underline"
                  >
                    Building
                  </button>
                </th>
                <th
                  scope="col"
                  aria-sort={
                    sortConfig.key === "status"
                      ? sortConfig.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <button
                    type="button"
                    onClick={() => handleSort("status")}
                    className="flex items-center gap-1 focus:outline-none focus:underline"
                  >
                    Status
                  </button>
                </th>
                <th
                  scope="col"
                  aria-sort={
                    sortConfig.key === "assigned_technician_id"
                      ? sortConfig.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <button
                    type="button"
                    onClick={() => handleSort("assigned_technician_id")}
                    className="flex items-center gap-1 focus:outline-none focus:underline"
                  >
                    Assigned
                  </button>
                </th>
                <th
                  scope="col"
                  aria-sort={
                    sortConfig.key === "updated_at"
                      ? sortConfig.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <button
                    type="button"
                    onClick={() => handleSort("updated_at")}
                    className="flex items-center gap-1 focus:outline-none focus:underline"
                  >
                    Updated
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pagination.paginatedItems.length > 0 ? (
                pagination.paginatedItems.map((defect) => {
                  const building = buildings.find(
                    (b) => b.id === defect.building_id,
                  );
                  const assignee = defect.assigned_technician_id
                    ? technicians.find(
                        (u) => u.id === defect.assigned_technician_id,
                      )
                    : null;

                  return (
                    <tr
                      key={defect.id}
                      className="wf-table-row focus-within:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Link
                          to={`/defects/${defect.id}`}
                          className="text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
                        >
                          #{defect.id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <Link
                          to={`/defects/${defect.id}`}
                          className="hover:text-blue-600 focus:outline-none focus:underline line-clamp-2"
                        >
                          {defect.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {building?.name || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={defect.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {assignee?.name || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(defect.updated_at)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <AlertTriangle className="w-8 h-8" aria-hidden="true" />
                      <p>No defects found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.goToPage}
            itemsPerPage={10}
            totalItems={filteredDefects.length}
          />
        )}
      </div>
    </div>
  );
}
