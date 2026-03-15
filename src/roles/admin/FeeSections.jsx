import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check, ChevronDown, UserCircle2 } from "lucide-react";
import "../../styles/admin.css";

const CATEGORY_OPTIONS = ["Academic", "Accommodation", "Extra-curricular", "Transport", "Medical"];
const APPLICABLE_OPTIONS = ["All Departments", "Engineering Departments", "Science Departments", "Arts Departments"];

const initialFeeSections = [
  {
    id: 1,
    name: "Tuition Fee",
    category: "Academic",
    applicableTo: "All Departments",
    responsibleStaff: "Ramesh Kumar",
    username: "fee_tuition",
    password: "fee@tui123",
  },
  {
    id: 2,
    name: "Hostel Fee",
    category: "Accommodation",
    applicableTo: "All Departments",
    responsibleStaff: "Sunita Sharma",
    username: "fee_hostel",
    password: "fee@hos123",
  },
  {
    id: 3,
    name: "Lab Fee",
    category: "Academic",
    applicableTo: "Engineering Departments",
    responsibleStaff: "Prakash Verma",
    username: "fee_lab",
    password: "fee@lab123",
  },
  {
    id: 4,
    name: "Exam Fee",
    category: "Academic",
    applicableTo: "All Departments",
    responsibleStaff: "Meena Pillai",
    username: "fee_exam",
    password: "fee@exa123",
  },
  {
    id: 5,
    name: "Library Fee",
    category: "Academic",
    applicableTo: "All Departments",
    responsibleStaff: "Arun Menon",
    username: "fee_library",
    password: "fee@lib123",
  },
  {
    id: 6,
    name: "Sports Fee",
    category: "Extra-curricular",
    applicableTo: "All Departments",
    responsibleStaff: "Divya Nair",
    username: "fee_sports",
    password: "fee@spo123",
  },
];

// colour per category
const categoryColor = (cat) => {
  switch (cat) {
    case "Academic":        return { bg: "#dcfce7", color: "#15803d" };
    case "Accommodation":   return { bg: "#dbeafe", color: "#1d4ed8" };
    case "Extra-curricular":return { bg: "#fef9c3", color: "#854d0e" };
    case "Transport":       return { bg: "#fce7f3", color: "#9d174d" };
    case "Medical":         return { bg: "#f3e8ff", color: "#6b21a8" };
    default:                return { bg: "#f1f5f9", color: "#475569" };
  }
};

export default function FeeSections() {
  const [sections, setSections] = useState(initialFeeSections);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // popup pickers inside modal
  const [openPicker, setOpenPicker] = useState(null); // "category" | "applicable" | null

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    applicableTo: "",
    responsibleStaff: "",
  });

  const openCreate = () => {
    setEditingId(null);
    setFormData({ name: "", category: "", applicableTo: "", responsibleStaff: "" });
    setOpenPicker(null);
    setShowModal(true);
  };

  const openEdit = (section) => {
    setEditingId(section.id);
    setFormData({
      name: section.name,
      category: section.category,
      applicableTo: section.applicableTo,
      responsibleStaff: section.responsibleStaff,
    });
    setOpenPicker(null);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    if (!formData.name || !formData.category || !formData.applicableTo || !formData.responsibleStaff) {
      alert("All fields are required");
      return;
    }

    if (editingId) {
      setSections(sections.map((s) =>
        s.id === editingId ? { ...s, ...formData } : s
      ));
    } else {
      const slug = formData.name.toLowerCase().replace(/\s+/g, "_");
      setSections([
        ...sections,
        {
          id: Date.now(),
          ...formData,
          username: `fee_${slug}`,
          password: `fee@${slug.slice(0, 3)}123`,
        },
      ]);
    }

    setShowModal(false);
  };

  return (
    <div className="fee-page">

      {/* HEADER */}
      <div className="students-header">
        <div>
          <h1>Fee Section Management</h1>
          <p>Manage fee categories and assign responsible staff</p>
        </div>
        <button className="add-student-btn" onClick={openCreate}>
          <Plus size={16} /> Create Fee Section
        </button>
      </div>

      {/* GRID */}
      <div className="fee-grid">
        {sections.map((s) => {
          const { bg, color } = categoryColor(s.category);
          return (
            <div className="fee-card" key={s.id}>

              {/* Card top */}
              <div className="fee-card-top">
                <div className="fee-card-title">
                  <div className="fee-icon" style={{ background: bg }}>
                    <UserCircle2 size={20} color={color} />
                  </div>
                  <div>
                    <h3>{s.name}</h3>
                    <span className="fee-category">{s.category}</span>
                  </div>
                </div>
                <div className="dept-actions">
                  <Pencil size={15} className="action edit" onClick={() => openEdit(s)} />
                  <Trash2 size={15} className="action delete" onClick={() => handleDelete(s.id)} />
                </div>
              </div>

              {/* Applicable to */}
              <div className="fee-section-row">
                <span className="fee-label">APPLICABLE TO</span>
                <span className="fee-applicable-badge">{s.applicableTo}</span>
              </div>

              {/* Responsible staff */}
              <div className="fee-section-row" style={{ marginTop: "10px" }}>
                <span className="fee-label">RESPONSIBLE STAFF</span>
                <p className="fee-staff-name">{s.responsibleStaff}</p>
              </div>

              {/* Credentials */}
              <div className="fee-credentials">
                <span className="fee-label">STAFF LOGIN CREDENTIALS</span>
                <div className="fee-creds-box">
                  <span>Username: {s.username}</span>
                  <span>Password: {s.password}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingId ? "Edit Fee Section" : "Create Fee Section"}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">

              <label>Fee Section Name</label>
              <input
                name="name"
                placeholder="e.g. Transport Fee"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <label>Category</label>
              <button
                className="modal-dept-trigger"
                type="button"
                onClick={() => setOpenPicker(openPicker === "category" ? null : "category")}
              >
                <span style={{ color: formData.category ? "#374151" : "#9ca3af" }}>
                  {formData.category || "Select Category"}
                </span>
                <ChevronDown size={14} />
              </button>

              <label>Applicable To</label>
              <button
                className="modal-dept-trigger"
                type="button"
                onClick={() => setOpenPicker(openPicker === "applicable" ? null : "applicable")}
              >
                <span style={{ color: formData.applicableTo ? "#374151" : "#9ca3af" }}>
                  {formData.applicableTo || "Select Scope"}
                </span>
                <ChevronDown size={14} />
              </button>

              <label>Responsible Staff Name</label>
              <input
                name="responsibleStaff"
                placeholder="Enter staff name"
                value={formData.responsibleStaff}
                onChange={(e) => setFormData({ ...formData, responsibleStaff: e.target.value })}
              />

              {editingId && (
                <small style={{ color: "#64748b" }}>
                  Login credentials are auto-generated and cannot be edited here.
                </small>
              )}

            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="submit-btn" onClick={handleSave}>
                {editingId ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CATEGORY PICKER ── */}
      {openPicker === "category" && (
        <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={() => setOpenPicker(null)}>
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
                    onClick={() => { setFormData((p) => ({ ...p, category: cat })); setOpenPicker(null); }}
                  >
                    <span className="fee-cat-pill" style={{ background: bg, color }}>
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

      {/* ── APPLICABLE TO PICKER ── */}
      {openPicker === "applicable" && (
        <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={() => setOpenPicker(null)}>
          <div className="filter-popup" onClick={(e) => e.stopPropagation()}>
            <div className="filter-popup-header">
              <h3>Select Scope</h3>
              <button className="close-btn" onClick={() => setOpenPicker(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="filter-popup-list">
              {APPLICABLE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  className={`filter-popup-option${formData.applicableTo === opt ? " selected" : ""}`}
                  onClick={() => { setFormData((p) => ({ ...p, applicableTo: opt })); setOpenPicker(null); }}
                >
                  <span>{opt}</span>
                  {formData.applicableTo === opt && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}