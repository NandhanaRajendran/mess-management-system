import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  ChevronDown,
  UserCircle2,
} from "lucide-react";
import "../../styles/admin.css";

const BASE = "http://localhost:8000/api/admin";

const categoryColor = (cat) => {
  switch (cat) {
    case "Academic":
      return { bg: "#dcfce7", color: "#15803d" };
    case "Accommodation":
      return { bg: "#dbeafe", color: "#1d4ed8" };
    case "Extra-curricular":
      return { bg: "#fef9c3", color: "#854d0e" };
    case "Transport":
      return { bg: "#fce7f3", color: "#9d174d" };
    case "Hostel":
      return { bg: "#ede9fe", color: "#6d28d9" };
    default:
      return { bg: "#f1f5f9", color: "#475569" };
  }
};

const CATEGORY_OPTIONS = [
  "Academic",
  "Accommodation",
  "Extra-curricular",
  "Transport",
  "Hostel",
];

export default function FeeSections() {
  const [sections, setSections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [openPicker, setOpenPicker] = useState(null); // "category" | "dept"
  const [newCredentials, setNewCredentials] = useState({}); // { [sectionId]: {username, password} }
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    responsibleStaff: "", // ✅
    applicableDepartments: [],
  });

  // ── Fetch fee sections ──
  useEffect(() => {
    fetch(`${BASE}/fee-sections`)
      .then((r) => r.json())
      .then((data) => setSections(data))
      .catch(console.error);
  }, []);

  // ── Fetch departments ──
  useEffect(() => {
    fetch(`${BASE}/departments`)
      .then((r) => r.json())
      .then((data) => setDepartments(data))
      .catch(console.error);
  }, []);

  const openCreate = () => {
    setEditingSection(null);
    setFormData({ name: "", category: "", applicableDepartments: [] });
    setOpenPicker(null);
    setShowModal(true);
  };

  const openEdit = (section) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      category: section.category || "",
      responsibleStaff: section.responsibleStaff || "", // ✅
      applicableDepartments: (section.applicableDepartments || []).map(
        (d) => d._id || d,
      ),
    });
    setOpenPicker(null);
    setShowModal(true);
  };

  const toggleDept = (deptId) => {
    setFormData((prev) => ({
      ...prev,
      applicableDepartments: prev.applicableDepartments.includes(deptId)
        ? prev.applicableDepartments.filter((id) => id !== deptId)
        : [...prev.applicableDepartments, deptId],
    }));
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert("Fee section name is required");
      return;
    }
    if (formData.applicableDepartments.length === 0) {
      alert("Please select at least one applicable department");
      return;
    }

    try {
      if (editingSection) {
        // ── Update ──
        const res = await fetch(`${BASE}/update-fee-section`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            feeSectionId: editingSection._id,
            name: formData.name,
            category: formData.category,
            responsibleStaff: formData.responsibleStaff, // ✅ moved here
            applicableDepartments: formData.applicableDepartments,
          }),
        });
        const data = await res.json();
        if (!res.ok) return alert(data.message || "Update failed");
        setSections((prev) =>
          prev.map((s) => (s._id === editingSection._id ? data.feeSection : s)),
        );
        alert("Updated successfully ✅");
      } else {
        // ── Create ──
        const res = await fetch(`${BASE}/create-fee-section`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            category: formData.category,
            responsibleStaff: formData.responsibleStaff, // ✅ moved here
            applicableDepartments: formData.applicableDepartments,
            permissions: { canAddFee: true, canViewDues: true },
          }),
        });
        const data = await res.json();
        if (!res.ok) return alert(data.message || "Creation failed");

        const refreshed = await fetch(`${BASE}/fee-sections`).then((r) =>
          r.json(),
        );
        setSections(refreshed);

        if (data.credentials) {
          alert(
            `Fee Section Created!\nUsername: ${data.credentials.username}\nPassword: ${data.credentials.password}`,
          );
          const newSection = refreshed.find((s) => s.name === formData.name);
          if (newSection) {
            setNewCredentials((prev) => ({
              ...prev,
              [newSection._id]: data.credentials,
            }));
          }
        }
      }

      setShowModal(false); 
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };
  const handleDelete = async (sectionId) => {
    if (!window.confirm("Delete this fee section? This cannot be undone."))
      return;
    try {
      const res = await fetch(`${BASE}/delete-fee-section`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feeSectionId: sectionId }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Delete failed");
      setSections((prev) => prev.filter((s) => s._id !== sectionId));
    } catch {
      alert("Delete failed");
    }
  };

  const getDeptName = (id) => departments.find((d) => d._id === id)?.name || id;

  return (
    <div className="fee-page">
      {/* HEADER */}
      <div className="students-header">
        <div>
          <h1>Fee Section Management</h1>
          <p>Create fee sections and assign applicable departments</p>
        </div>
        <button className="add-student-btn" onClick={openCreate}>
          <Plus size={16} /> Create Fee Section
        </button>
      </div>

      {/* GRID */}
      <div className="fee-grid">
        {sections.length === 0 && (
          <p style={{ color: "#94a3b8", gridColumn: "1/-1" }}>
            No fee sections yet. Create one to get started.
          </p>
        )}
        {sections.map((s) => {
          const { bg, color } = categoryColor(s.category);
          const creds = newCredentials[s._id];
          return (
            <div className="fee-card" key={s._id}>
              {/* Card top */}
              <div className="fee-card-top">
                <div className="fee-card-title">
                  <div className="fee-icon" style={{ background: bg }}>
                    <UserCircle2 size={20} color={color} />
                  </div>
                  <div>
                    <h3>{s.name}</h3>
                    {s.category && (
                      <span
                        className="fee-category"
                        style={{ background: bg, color }}
                      >
                        {s.category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="dept-actions">
                  <Pencil
                    size={15}
                    className="action edit"
                    onClick={() => openEdit(s)}
                  />
                  <Trash2
                    size={15}
                    className="action delete"
                    onClick={() => handleDelete(s._id)}
                  />
                </div>
              </div>

              {/* Applicable Departments */}
              <div className="fee-section-row" style={{ marginTop: 12 }}>
                <span className="fee-label">APPLICABLE DEPARTMENTS</span>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginTop: 6,
                  }}
                >
                  {(s.applicableDepartments || []).length === 0 ? (
                    <span style={{ fontSize: ".78rem", color: "#94a3b8" }}>
                      None
                    </span>
                  ) : (
                    (s.applicableDepartments || []).map((d) => (
                      <span
                        key={d._id || d}
                        style={{
                          background: "#f1f5f9",
                          color: "#334155",
                          borderRadius: 12,
                          padding: "2px 10px",
                          fontSize: ".72rem",
                          fontWeight: 600,
                        }}
                      >
                        {d.name || getDeptName(d)}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Credentials */}
              <div className="fee-credentials" style={{ marginTop: 12 }}>
                <span className="fee-label">LOGIN CREDENTIALS</span>
                <div className="login-box">
                  <div>
                    <span>Username</span>
                    <p>{creds?.username || s.username || "-"}</p>
                  </div>
                  <div>
                    <span>Password</span>
                    <p>{creds?.password || s.password || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── CREATE / EDIT MODAL ── */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3>
                {editingSection ? "Edit Fee Section" : "Create Fee Section"}
              </h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <label>Fee Section Name *</label>
              <input
                placeholder="e.g. Tuition Fee"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <label style={{ marginTop: 12 }}>Responsible Staff</label>
              <input
                placeholder="e.g. Clerk, JS, SS, Librarian"
                value={formData.responsibleStaff}
                onChange={(e) =>
                  setFormData({ ...formData, responsibleStaff: e.target.value })
                }
              />

              <label style={{ marginTop: 12 }}>Category</label>
              <button
                className="modal-dept-trigger"
                type="button"
                onClick={() =>
                  setOpenPicker(openPicker === "category" ? null : "category")
                }
              >
                <span
                  style={{ color: formData.category ? "#374151" : "#9ca3af" }}
                >
                  {formData.category || "Select Category (optional)"}
                </span>
                <ChevronDown size={14} />
              </button>

              <label style={{ marginTop: 12 }}>Applicable Departments *</label>
              <button
                className="modal-dept-trigger"
                type="button"
                onClick={() =>
                  setOpenPicker(openPicker === "dept" ? null : "dept")
                }
              >
                <span
                  style={{
                    color: formData.applicableDepartments.length
                      ? "#374151"
                      : "#9ca3af",
                  }}
                >
                  {formData.applicableDepartments.length > 0
                    ? `${formData.applicableDepartments.length} department(s) selected`
                    : "Select departments"}
                </span>
                <ChevronDown size={14} />
              </button>

              {/* Selected dept chips */}
              {formData.applicableDepartments.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginTop: 8,
                  }}
                >
                  {formData.applicableDepartments.map((id) => (
                    <span
                      key={id}
                      style={{
                        background: "#e0f2fe",
                        color: "#0369a1",
                        borderRadius: 12,
                        padding: "2px 10px",
                        fontSize: ".72rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {getDeptName(id)}
                      <X
                        size={10}
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleDept(id)}
                      />
                    </span>
                  ))}
                </div>
              )}

              {editingSection && (
                <small
                  style={{ color: "#64748b", display: "block", marginTop: 10 }}
                >
                  Login credentials cannot be changed after creation.
                </small>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="submit-btn" onClick={handleSave}>
                {editingSection ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CATEGORY PICKER ── */}
      {openPicker === "category" && (
        <div
          className="modal-overlay"
          style={{ zIndex: 3000 }}
          onClick={() => setOpenPicker(null)}
        >
          <div className="filter-popup" onClick={(e) => e.stopPropagation()}>
            <div className="filter-popup-header">
              <h3>Select Category</h3>
              <button className="close-btn" onClick={() => setOpenPicker(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="filter-popup-list">
              {CATEGORY_OPTIONS.map((cat) => {
                const { bg, color } = categoryColor(cat);
                return (
                  <button
                    key={cat}
                    className={`filter-popup-option${formData.category === cat ? " selected" : ""}`}
                    onClick={() => {
                      setFormData((p) => ({ ...p, category: cat }));
                      setOpenPicker(null);
                    }}
                  >
                    <span
                      style={{
                        background: bg,
                        color,
                        borderRadius: 12,
                        padding: "2px 10px",
                        fontSize: ".72rem",
                        fontWeight: 600,
                      }}
                    >
                      {cat}
                    </span>
                    {formData.category === cat && <Check size={14} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── DEPT PICKER (multi-select) ── */}
      {openPicker === "dept" && (
        <div
          className="modal-overlay"
          style={{ zIndex: 3000 }}
          onClick={() => setOpenPicker(null)}
        >
          <div className="filter-popup" onClick={(e) => e.stopPropagation()}>
            <div className="filter-popup-header">
              <h3>Select Departments</h3>
              <button className="close-btn" onClick={() => setOpenPicker(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="filter-popup-list">
              {departments.map((d) => {
                const isSelected = formData.applicableDepartments.includes(
                  d._id,
                );
                return (
                  <button
                    key={d._id}
                    className={`filter-popup-option${isSelected ? " selected" : ""}`}
                    onClick={() => toggleDept(d._id)}
                  >
                    <span>{d.name}</span>
                    {isSelected && <Check size={14} />}
                  </button>
                );
              })}
              {departments.length === 0 && (
                <p style={{ color: "#94a3b8", padding: "12px 16px" }}>
                  No departments found
                </p>
              )}
            </div>
            <div
              style={{ padding: "12px 16px", borderTop: "1px solid #e2e8f0" }}
            >
              <button
                className="submit-btn"
                style={{ width: "100%" }}
                onClick={() => setOpenPicker(null)}
              >
                Done ({formData.applicableDepartments.length} selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
