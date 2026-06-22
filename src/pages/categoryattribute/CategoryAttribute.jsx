import { useState, useEffect, useRef, useCallback } from "react";

const BASE = "https://amazon-multi-vendor-3.onrender.com/api";



let _idCounter = 0;
function uid() { return ++_idCounter; }

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ message, type, visible }) {
  return (
    <div style={{
      position: "fixed", bottom: "1.5rem", left: "50%",
      transform: "translateX(-50%)",
      padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500,
      zIndex: 9999, whiteSpace: "nowrap", fontFamily: "inherit",
      pointerEvents: "none",
      transition: "opacity 0.2s",
      opacity: visible ? 1 : 0,
      background: type === "success" ? "#d1fae5" : "#fee2e2",
      color: type === "success" ? "#065f46" : "#991b1b",
      border: `1px solid ${type === "success" ? "#6ee7b7" : "#fca5a5"}`,
    }}>
      {message}
    </div>
  );
}

// ── Tag Input ──────────────────────────────────────────────────────────────
function TagInput({ options, onAdd, onRemove, fieldId }) {
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef(null);

  const commit = () => {
    const val = inputVal.replace(/,/g, "").trim();
    if (val && !options.includes(val)) { onAdd(val); }
    setInputVal("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit(); }
    if (e.key === "Backspace" && !inputVal && options.length) {
      onRemove(options[options.length - 1]);
    }
  };

  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
      minHeight: 36, padding: "5px 8px",
      border: "1px solid #d1d5db", borderRadius: 8, background: "#fff",
      cursor: "text",
    }}
      onClick={() => inputRef.current?.focus()}
    >
      {options.map(o => (
        <span key={o} style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          background: "#ede9fe", color: "#4f46e5",
          fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 999,
        }}>
          {o}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(o); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#7c3aed", fontSize: 14, lineHeight: 1, padding: 0,
              marginLeft: 1, opacity: 0.7,
            }}
          >×</button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={inputVal}
        onChange={e => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={options.length ? "Add more..." : "Type option & press Enter"}
        style={{
          border: "none", outline: "none", background: "transparent",
          fontSize: 13, color: "#1a1a2e", minWidth: 80, flex: 1,
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}

// ── Field Row ──────────────────────────────────────────────────────────────
function FieldRow({ field, onChange, onRemove }) {
  const handleTypeChange = (e) => {
    const val = e.target.value;
    onChange(field.id, "type", val);
    if (val !== "dropdown") onChange(field.id, "options", []);
  };

  const inputStyle = {
    width: "100%", height: 32, padding: "0 10px",
    border: "1px solid #d1d5db", borderRadius: 8,
    fontSize: 13, color: "#1a1a2e", background: "#fff",
    outline: "none", fontFamily: "inherit",
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1.6fr 1fr 70px 34px",
      gap: 8, alignItems: "end",
      background: "#f9fafb", border: "1px solid #e5e7eb",
      borderRadius: 8, padding: "10px 12px", marginBottom: 8,
    }}>
      {/* Field name */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={{ fontSize: 11, fontWeight: 500, color: "#374151" }}>
          Field name {field.required && <span style={{ color: "#ef4444" }}>*</span>}
        </label>
        <input
          type="text"
          value={field.name}
          placeholder="e.g. Material Composition"
          onChange={e => onChange(field.id, "name", e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Type */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={{ fontSize: 11, fontWeight: 500, color: "#374151" }}>Type</label>
        <select value={field.type} onChange={handleTypeChange} style={inputStyle}>
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="dropdown">Dropdown</option>
        </select>
      </div>

      {/* Required */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={{ fontSize: 11, fontWeight: 500, color: "#374151" }}>Required</label>
        <select
          value={field.required ? "true" : "false"}
          onChange={e => onChange(field.id, "required", e.target.value === "true")}
          style={inputStyle}
        >
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(field.id)}
        title="Remove field"
        style={{
          width: 34, height: 34,
          border: "1px solid #fca5a5", borderRadius: 8,
          background: "#fff", cursor: "pointer",
          color: "#ef4444", display: "flex", alignItems: "center",
          justifyContent: "center", flexShrink: 0,
        }}
      >
        <i className="ti ti-trash" style={{ fontSize: 15 }} />
      </button>

      {/* Options row for dropdown */}
      {field.type === "dropdown" && (
        <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 500, color: "#374151" }}>
            Options — press Enter or comma to add
          </label>
          <TagInput
            options={field.options}
            onAdd={val => onChange(field.id, "options", [...field.options, val])}
            onRemove={opt => onChange(field.id, "options", field.options.filter(o => o !== opt))}
            fieldId={field.id}
          />
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function CategoryAttributeFormBuilder() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [subtosubcategories, setSubtosubcategories] = useState([]);

  const [catId, setCatId] = useState("");
  const [subcatId, setSubcatId] = useState("");
  const [subsubId, setSubsubId] = useState("");
  const [section, setSection] = useState("");
  const [customSection, setCustomSection] = useState("");

  const [fieldCount, setFieldCount] = useState("");
  const [fields, setFields] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const focusIdRef = useRef(null);

  // ── Helpers ──
  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  const parseList = (data, ...keys) => {
    if (Array.isArray(data)) return data;
    for (const k of keys) if (Array.isArray(data[k])) return data[k];
    return [];
  };

  const getSection = useCallback(() => {
    if (section === "__custom__") return customSection.trim();
    return section;
  }, [section, customSection]);

  // ── Generate N blank fields ──
  const generateFields = () => {
    const n = parseInt(fieldCount);
    if (!n || n < 1) { showToast("Enter a valid number of fields", "error"); return; }
    if (n > 50) { showToast("Max 50 fields at a time", "error"); return; }
    const sec = getSection() || "General";
    setFields(Array.from({ length: n }, () => ({
      id: uid(), section: sec, name: "", type: "text", required: false, options: [],
    })));
  };

  // ── Load categories ──
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(BASE + "/categories");
        const data = await r.json();
        setCategories(parseList(data, "categories", "data"));
      } catch { setCategories([]); }
    })();
  }, []);

  // ── Load subcategories ──
  useEffect(() => {
    if (!catId) { setSubcategories([]); setSubcatId(""); return; }
    (async () => {
      try {
        const r = await fetch(BASE + "/subcategories?categoryId=" + catId);
        const data = await r.json();
        setSubcategories(parseList(data, "subcategories", "data"));
        setSubcatId("");
        setSubtosubcategories([]);
        setSubsubId("");
      } catch { setSubcategories([]); }
    })();
  }, [catId]);

  // ── Load sub-to-sub ──
  useEffect(() => {
    if (!subcatId) { setSubtosubcategories([]); setSubsubId(""); return; }
    (async () => {
      try {
        const r = await fetch(BASE + "/subtosubcategories?subcategoryId=" + subcatId);
        const data = await r.json();
        setSubtosubcategories(parseList(data, "subtosubcategories", "data"));
        setSubsubId("");
      } catch { setSubtosubcategories([]); }
    })();
  }, [subcatId]);

  // ── Focus newly added field ──
  useEffect(() => {
    if (focusIdRef.current) {
      const el = document.getElementById("field-name-" + focusIdRef.current);
      if (el) el.focus();
      focusIdRef.current = null;
    }
  }, [fields]);

  // ── Field ops ──
  const addField = () => {
    const sec = getSection() || "General";
    const newId = uid();
    focusIdRef.current = newId;
    setFields(prev => [...prev, { id: newId, section: sec, name: "", type: "text", required: false, options: [] }]);
  };

  const removeField = (id) => setFields(prev => prev.filter(f => f.id !== id));

  const updateField = (id, key, value) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  // ── Submit ──
  const submitForm = async () => {
    const sec = getSection();
    if (!catId) { showToast("Please select a category", "error"); return; }
    if (!sec)   { showToast("Please select or enter a section", "error"); return; }
    if (!fields.length) { showToast("Add at least one field", "error"); return; }
    if (fields.find(f => !f.name.trim())) { showToast("All fields need a name", "error"); return; }

    setSubmitting(true);
    let ok = 0, fail = 0;

    for (const f of fields) {
      const body = {
        categoryId: catId,
        section: f.section || sec,
        name: f.name.trim(),
        type: f.type,
        required: f.required,
      };
      if (subcatId)  body.subcategoryId = subcatId;
      if (subsubId)  body.subtosubcategoryId = subsubId;
      if (f.type === "dropdown" && f.options.length) body.options = f.options;

      try {
        const r = await fetch(BASE + "/categoryattribute/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        r.ok ? ok++ : fail++;
      } catch { fail++; }
    }

    setSubmitting(false);

    if (fail === 0) {
      showToast(`✓ All ${ok} attributes saved!`, "success");
      _idCounter = 0;
      setFields([]);
    } else {
      showToast(`${ok} saved, ${fail} failed`, "error");
    }
  };

  // ── Grouped fields ──
  const grouped = fields.reduce((acc, f) => {
    const s = f.section || "General";
    if (!acc[s]) acc[s] = [];
    acc[s].push(f);
    return acc;
  }, {});

  // ── Styles ──
  const S = {
    body: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", background: "#f5f6fa", color: "#1a1a2e", minHeight: "100vh", padding: "2rem 1rem" },
    container: { maxWidth: 860, margin: "0 auto" },
    card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1rem" },
    sectionTitle: { fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" },
    row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 },
    field: { display: "flex", flexDirection: "column", gap: 5 },
    label: { fontSize: 12, fontWeight: 500, color: "#374151" },
    input: { width: "100%", height: 36, padding: "0 10px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, color: "#1a1a2e", background: "#fff", outline: "none", fontFamily: "inherit" },
    sectionLabel: { fontSize: 11, fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 6 },
    addBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "9px 14px", border: "1.5px dashed #d1d5db", borderRadius: 8, background: "transparent", cursor: "pointer", color: "#6b7280", fontSize: 13, fontFamily: "inherit", marginTop: 6 },
    submitBtn: { width: "100%", padding: 11, background: submitting ? "#a5b4fc" : "#6366f1", color: "#fff", border: "none", borderRadius: 8, cursor: submitting ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: "0.25rem" },
    emptyState: { textAlign: "center", padding: "2rem 1rem", color: "#9ca3af", fontSize: 13 },
  };

  return (
    <div style={S.body}>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />

      <div style={S.container}>
        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "#1a1a2e" }}>Category Attribute Form Builder</h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Select category → section → edit or add fields → submit to API</p>
        </div>

        {/* Category Selection */}
        <div style={S.card}>
          <div style={S.sectionTitle}>Category Selection</div>

          <div style={S.row2}>
            <div style={S.field}>
              <label style={S.label}>Category <span style={{ color: "#ef4444" }}>*</span></label>
              <select value={catId} onChange={e => setCatId(e.target.value)} style={S.input}>
                <option value="">{categories.length ? "Select category" : "Loading..."}</option>
                {categories.map(c => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.name || c.categoryName || c.title || "Unnamed"}
                  </option>
                ))}
              </select>
            </div>

            <div style={S.field}>
              <label style={S.label}>Subcategory</label>
              <select value={subcatId} onChange={e => setSubcatId(e.target.value)} disabled={!catId} style={{ ...S.input, background: !catId ? "#f9fafb" : "#fff", color: !catId ? "#9ca3af" : "#1a1a2e" }}>
                <option value="">{!catId ? "Select category first" : "Select subcategory (optional)"}</option>
                {subcategories.map(s => (
                  <option key={s._id || s.id} value={s._id || s.id}>
                    {s.name || s.subcategoryName || s.title || "Unnamed"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ ...S.row2, marginBottom: 0 }}>
            <div style={S.field}>
              <label style={S.label}>Sub-to-sub category</label>
              <select value={subsubId} onChange={e => setSubsubId(e.target.value)} disabled={!subcatId} style={{ ...S.input, background: !subcatId ? "#f9fafb" : "#fff", color: !subcatId ? "#9ca3af" : "#1a1a2e" }}>
                <option value="">{!subcatId ? "Select subcategory first" : "Select sub-to-sub (optional)"}</option>
                {subtosubcategories.map(s => (
                  <option key={s._id || s.id} value={s._id || s.id}>
                    {s.name || s.title || "Unnamed"}
                  </option>
                ))}
              </select>
            </div>

            <div style={S.field}>
              <label style={S.label}>Section <span style={{ color: "#ef4444" }}>*</span></label>
              <select value={section} onChange={e => setSection(e.target.value)} style={S.input}>
                <option value="">-- All sections --</option>
                <option value="Top Highlights">Top Highlights</option>
                <option value="Additional Information">Additional Information</option>
                <option value="Style">Style</option>
                <option value="Item Details">Item Details</option>
                <option value="__custom__">+ Custom section...</option>
              </select>
            </div>
          </div>

          {section === "__custom__" && (
            <div style={{ marginTop: 10 }}>
              <div style={S.field}>
                <label style={S.label}>Custom section name <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  type="text"
                  value={customSection}
                  onChange={e => setCustomSection(e.target.value)}
                  placeholder="Enter section name"
                  style={S.input}
                />
              </div>
            </div>
          )}
        </div>

        {/* Fields */}
        <div style={S.card}>
          <div style={S.sectionTitle}>Fields</div>

          {/* Field count generator */}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 16 }}>
            <div style={{ ...S.field, flex: 1 }}>
              <label style={S.label}>How many fields do you want?</label>
              <input
                type="number"
                min={1}
                max={50}
                value={fieldCount}
                onChange={e => setFieldCount(e.target.value)}
                onKeyDown={e => e.key === "Enter" && generateFields()}
                placeholder="e.g. 5"
                style={S.input}
              />
            </div>
            <button type="button" onClick={generateFields} style={{
              height: 36, padding: "0 16px", background: "#6366f1", color: "#fff",
              border: "none", borderRadius: 8, cursor: "pointer",
              fontSize: 13, fontWeight: 600, fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
            }}>
              <i className="ti ti-wand" /> Generate
            </button>
          </div>

          {fields.length === 0 ? (
            <div style={S.emptyState}>
              <i className="ti ti-forms" style={{ fontSize: 28, display: "block", marginBottom: 8, color: "#d1d5db" }} />
              Enter a number above and click Generate.
            </div>
          ) : (
            <>
              {Object.entries(grouped).map(([sec, list]) => (
                <div key={sec} style={{ marginBottom: "1.25rem" }}>
                  <div style={S.sectionLabel}>
                    <i className="ti ti-layout-list" style={{ fontSize: 14 }} />
                    {sec}
                  </div>
                  {list.map(f => (
                    <FieldRow
                      key={f.id}
                      field={f}
                      onChange={updateField}
                      onRemove={removeField}
                    />
                  ))}
                </div>
              ))}
              <button type="button" onClick={addField} style={S.addBtn}>
                <i className="ti ti-plus" /> Add one more field
              </button>
            </>
          )}
        </div>

        {/* Submit */}
        <button type="button" onClick={submitForm} disabled={submitting} style={S.submitBtn}>
          <i className={`ti ${submitting ? "ti-loader-2" : "ti-upload"}`} />
          {submitting ? "Submitting..." : "Submit Attributes"}
        </button>
      </div>

      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </div>
  );
}