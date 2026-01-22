import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/newApplication.css";

export default function NewApplication() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [programs, setPrograms] = useState([]);
  const [applicationId, setApplicationId] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    programId: "",
    gpa: "",
    dateOfBirth: "",
    gender: "male",
    nationality: "Egyptian",
    nationalId: "",
    entryYear: new Date().getFullYear().toString(),
    entrySemester: "fall",
  });

  // ✅ NEW: Courses state
  const [courses, setCourses] = useState([]);

  const [docs, setDocs] = useState([]);
  const [payment, setPayment] = useState({ cardNumber: "", expiry: "", cvc: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/applications/programs");
        const list = res.data?.data || [];
        setPrograms(
          list.map((p) => ({
            id: p.id || p._id || p.program_id || p.code || p.name,
            name: p.name || p.title || "Program",
          }))
        );

        if (list.length) {
          const firstId = list[0].id || list[0]._id || list[0].program_id || list[0].code || list[0].name;
          setForm((f) => ({ ...f, programId: firstId }));
        }
      } catch {
        setPrograms([
          { id: "cs", name: "B.Sc. Computer Science" },
          { id: "eng", name: "B.Eng. Engineering" },
        ]);
        setForm((f) => ({ ...f, programId: "cs" }));
      }
    })();
  }, []);

  const selectedProgramName = useMemo(() => {
    return programs.find((p) => p.id === form.programId)?.name || "";
  }, [programs, form.programId]);

  async function handleContinueStep1() {
    setError("");

    try {
      // ✅ UPDATED: Include courses in application creation
      const res = await api.post("/api/applications", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        programId: form.programId,
        highSchoolGpa: form.gpa,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        nationality: form.nationality,
        nationalId: form.nationalId,
        entryYear: form.entryYear,
        entrySemester: form.entrySemester,
        courses: courses, // ✅ Send courses
      });

      const app = res.data?.data;
      const id = app?.id || app?._id;
      if (!id) throw new Error("No application id returned from backend");

      setApplicationId(id);
      setStep(2);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to create application";
      setError(msg);
    }
  }

  function handleFiles(files) {
    const arr = Array.from(files || []);
    if (!arr.length) return;

    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    const filtered = arr.filter((f) => allowed.includes(f.type));

    const mapped = filtered.map((f) => ({
      id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
      name: f.name,
      typeLabel: f.type === "application/pdf" ? "Transcript" : "Image",
      file: f,
    }));

    setDocs((prev) => [...prev, ...mapped]);
  }

  function removeDoc(id) {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }

  async function submitAndPay() {
    setError("");

    try {
      if (!applicationId) throw new Error("No application created yet");

      // ✅ Submit (backend will auto-pay and run eligibility check)
      await api.post(`/api/applications/${applicationId}/submit`);

      alert("Application submitted successfully! Eligibility check running... ✅");
      
      navigate("/dashboard");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Submit failed";
      setError(msg);
    }
  }

  return (
    <div className="appLayout">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__logoBox">NGU</div>
          <div className="sidebar__brandText">NGU Admissions</div>
        </div>

        <nav className="sidebar__nav">
          <Link to="/dashboard" className="sidebar__item">
            <span className="sidebar__dot" /> Dashboard
          </Link>
          
          <Link to="/apply" className="sidebar__item sidebar__item--active">
            <span className="sidebar__dot" /> My Applications
          </Link>
        </nav>

        <div className="sidebar__footer">
          <button
            className="sidebar__signout"
            onClick={() => {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("user");
              navigate("/login");
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div />
          <div className="topbar__right">
            <div className="topbar__bell">🔔</div>
            <div className="topbar__user">
              <div className="topbar__name">{form.firstName || "Applicant"}</div>
              <div className="topbar__role">Applicant</div>
            </div>
            <div className="topbar__avatar">👩🏽</div>
          </div>
        </header>

        <div className="content">
          <Link 
            to="/dashboard" 
            style={{ 
              display: 'inline-block',
              marginBottom: 16,
              color: '#0b1220',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            ← Back to Dashboard
          </Link>

          <h1 className="pageTitle">New Application</h1>
          <Stepper step={step} />

          <div className="card">
            {error && (
              <div style={{ color: "crimson", fontWeight: 800, marginBottom: 12 }}>
                {error}
              </div>
            )}

            {step === 1 && (
              <StepPersonalInfo
                form={form}
                setForm={setForm}
                programs={programs}
                courses={courses}
                setCourses={setCourses}
                onNext={handleContinueStep1}
              />
            )}

            {step === 2 && (
              <StepDocuments
                docs={docs}
                onFiles={handleFiles}
                onRemove={removeDoc}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            )}

            {step === 3 && (
              <StepReviewPay
                form={form}
                programName={selectedProgramName}
                courses={courses}
                docs={docs}
                payment={payment}
                setPayment={setPayment}
                onBack={() => setStep(2)}
                onSubmit={submitAndPay}
              />
            )}
          </div>
        </div>

        <button className="floatChat" aria-label="Help">
          💬
        </button>
      </main>
    </div>
  );
}

function Stepper({ step }) {
  return (
    <div className="stepper">
      <div className="stepper__item">
        <div className={`stepper__circle ${step >= 1 ? "isOn" : ""}`}>1</div>
        <div className="stepper__label">Personal Info</div>
      </div>
      <div className="stepper__line" />
      <div className="stepper__item">
        <div className={`stepper__circle ${step >= 2 ? "isOn" : ""}`}>2</div>
        <div className="stepper__label">Documents</div>
      </div>
      <div className="stepper__line" />
      <div className="stepper__item">
        <div className={`stepper__circle ${step >= 3 ? "isOn" : ""}`}>3</div>
        <div className="stepper__label">Review & Pay</div>
      </div>
    </div>
  );
}

function StepPersonalInfo({ form, setForm, programs, courses, setCourses, onNext }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  // ✅ NEW: Course form state
  const [newCourse, setNewCourse] = useState({
    code: "",
    name: "",
    grade: "",
  });

  const addCourse = () => {
    if (!newCourse.code || !newCourse.name || !newCourse.grade) {
      alert("Please fill in all course fields");
      return;
    }

    setCourses([...courses, { ...newCourse, id: Date.now() }]);
    setNewCourse({ code: "", name: "", grade: "" });
  };

  const removeCourse = (id) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  return (
    <div>
      <div className="card__header">
        <div className="card__title">Personal & Academic Information</div>
        <div className="card__subtitle">Please enter your details accurately.</div>
      </div>

      <div className="grid2">
        <div className="field">
          <label>First Name *</label>
          <input
            value={form.firstName}
            onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
            placeholder="First name"
            required
          />
        </div>

        <div className="field">
          <label>Last Name *</label>
          <input
            value={form.lastName}
            onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
            placeholder="Last name"
            required
          />
        </div>
      </div>

      <div className="field">
        <label>Email Address *</label>
        <input
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          placeholder="email@example.com"
          type="email"
          required
        />
      </div>

      <div className="field">
        <label>Date of Birth *</label>
        <input
          type="date"
          value={form.dateOfBirth}
          onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
          required
        />
      </div>

      <div className="grid2">
        <div className="field">
          <label>Gender *</label>
          <select
            value={form.gender}
            onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
            required
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className="field">
          <label>Nationality *</label>
          <input
            value={form.nationality}
            onChange={(e) => setForm((p) => ({ ...p, nationality: e.target.value }))}
            placeholder="Egyptian"
            required
          />
        </div>
      </div>

      <div className="field">
        <label>National ID *</label>
        <input
          value={form.nationalId}
          onChange={(e) => setForm((p) => ({ ...p, nationalId: e.target.value }))}
          placeholder="29912345678901"
          required
        />
      </div>

      <div className="field">
        <label>Intended Program *</label>
        <select
          value={form.programId}
          onChange={(e) => setForm((p) => ({ ...p, programId: e.target.value }))}
          required
        >
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid2">
        <div className="field">
          <label>Entry Year *</label>
          <select
            value={form.entryYear}
            onChange={(e) => setForm((p) => ({ ...p, entryYear: e.target.value }))}
            required
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Entry Semester *</label>
          <select
            value={form.entrySemester}
            onChange={(e) => setForm((p) => ({ ...p, entrySemester: e.target.value }))}
            required
          >
            <option value="fall">Fall</option>
            <option value="spring">Spring</option>
            <option value="summer">Summer</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label>High School GPA *</label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="4.0"
          value={form.gpa}
          onChange={(e) => setForm((p) => ({ ...p, gpa: e.target.value }))}
          placeholder="4.0"
          required
        />
      </div>

      {/* ✅ NEW: Courses Section */}
      <div className="sectionTitle" style={{ marginTop: 24 }}>
        📚 High School Courses Taken
      </div>
      
      <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <div className="grid2" style={{ marginBottom: 12 }}>
          <div className="field">
            <label>Course Code</label>
            <input
              value={newCourse.code}
              onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
              placeholder="MATH-101"
            />
          </div>

          <div className="field">
            <label>Course Name</label>
            <input
              value={newCourse.name}
              onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
              placeholder="Calculus I"
            />
          </div>
        </div>

        <div className="field">
          <label>Grade</label>
          <select
            value={newCourse.grade}
            onChange={(e) => setNewCourse({ ...newCourse, grade: e.target.value })}
          >
            <option value="">Select Grade</option>
            <option value="A+">A+ (97-100)</option>
            <option value="A">A (93-96)</option>
            <option value="A-">A- (90-92)</option>
            <option value="B+">B+ (87-89)</option>
            <option value="B">B (83-86)</option>
            <option value="B-">B- (80-82)</option>
            <option value="C+">C+ (77-79)</option>
            <option value="C">C (73-76)</option>
            <option value="C-">C- (70-72)</option>
            <option value="D">D (60-69)</option>
            <option value="F">F (Below 60)</option>
          </select>
        </div>

        <button 
          type="button"
          className="btnSecondary" 
          onClick={addCourse}
          style={{ marginTop: 8 }}
        >
          + Add Course
        </button>
      </div>

      {/* ✅ Display Added Courses */}
      {courses.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="sectionTitle">Added Courses ({courses.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {courses.map((course) => (
              <div 
                key={course.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: 12,
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                }}
              >
                <div>
                  <strong>{course.code}</strong> - {course.name}
                  <span style={{ marginLeft: 12, color: '#666' }}>Grade: {course.grade}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => removeCourse(course.id)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    fontSize: 18,
                  }}
                  title="Remove course"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="actions actions--right">
        <button className="btnPrimary" onClick={onNext}>
          Continue
        </button>
      </div>
    </div>
  );
}

function StepDocuments({ docs, onFiles, onRemove, onBack, onNext }) {
  function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    onFiles(e.dataTransfer.files);
  }

  return (
    <div>
      <div className="card__header">
        <div className="card__title">Document Upload</div>
        <div className="card__subtitle">
          Upload required documents. Allowed formats: PDF, JPG, PNG.
        </div>
      </div>

      <div
        className="dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <div className="dropzone__icon">⬆️</div>
        <div className="dropzone__text">
          <b>Drag & drop</b> files here
        </div>
        <div className="dropzone__hint">or click to browse from your computer</div>

        <label className="btnSecondary">
          Select Files
          <input
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg"
            style={{ display: "none" }}
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>
      </div>

      <div className="sectionTitle">UPLOADED DOCUMENTS</div>

      <div className="docList">
        {docs.length === 0 ? (
          <div className="empty">No documents uploaded yet.</div>
        ) : (
          docs.map((d) => (
            <div className="docRow" key={d.id}>
              <div className="docIcon">📄</div>
              <div className="docMeta">
                <div className="docName">{d.name}</div>
                <div className="docType">{d.typeLabel}</div>
              </div>
              <button className="trash" onClick={() => onRemove(d.id)} title="Remove">
                🗑️
              </button>
            </div>
          ))
        )}
      </div>

      <div className="actions">
        <button className="btnOutline" onClick={onBack}>
          Back
        </button>
        <button className="btnPrimary" onClick={onNext}>
          Continue
        </button>
      </div>
    </div>
  );
}

function StepReviewPay({ form, programName, courses, docs, payment, setPayment, onBack, onSubmit }) {
  const displaySemester = form.entrySemester.charAt(0).toUpperCase() + form.entrySemester.slice(1);

  return (
    <div>
      <div className="card__header">
        <div className="card__title">Review & Payment</div>
        <div className="card__subtitle">
          Review your application and complete the application fee payment.
        </div>
      </div>

      <div className="summaryBox">
        <div className="summaryTitle">Application Summary</div>

        <div className="summaryGrid">
          <div className="summaryRow">
            <div className="muted">Applicant:</div>
            <div>{form.firstName} {form.lastName}</div>
          </div>
          <div className="summaryRow">
            <div className="muted">Program:</div>
            <div>{programName}</div>
          </div>
          <div className="summaryRow">
            <div className="muted">National ID:</div>
            <div>{form.nationalId}</div>
          </div>
          <div className="summaryRow">
            <div className="muted">Entry:</div>
            <div>{displaySemester} {form.entryYear}</div>
          </div>
          <div className="summaryRow">
            <div className="muted">GPA:</div>
            <div>{form.gpa}</div>
          </div>
          <div className="summaryRow">
            <div className="muted">Courses:</div>
            <div>{courses.length} Courses</div>
          </div>
          <div className="summaryRow">
            <div className="muted">Documents:</div>
            <div>{docs.length} Files Attached</div>
          </div>
        </div>
      </div>

      {/* ✅ Show courses list */}
      {courses.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div className="sectionTitle">Courses Taken</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {courses.map((course) => (
              <div 
                key={course.id}
                style={{ 
                  padding: 10,
                  background: '#f8f9fa',
                  borderRadius: 6,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span><strong>{course.code}</strong> - {course.name}</span>
                <span style={{ color: '#666' }}>Grade: {course.grade}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="sectionTitle" style={{ marginTop: 14 }}>Payment Details</div>

      <div className="feeBox">
        <div className="feeLeft">
          <div className="feeIcon">💳</div>
          <div>
            <div className="feeTitle">Application Fee</div>
            <div className="feeSub">Non-refundable processing fee (Auto-processed on submit)</div>
          </div>
        </div>
        <div className="feeAmount">$50.00</div>
      </div>

      <div className="infoBox" style={{ marginTop: 20 }}>
        ℹ️ Payment will be processed automatically when you submit. By submitting, you confirm that all information provided is accurate.
        Eligibility check will run automatically after submission.
      </div>

      <div className="actions">
        <button className="btnOutline" onClick={onBack}>
          Back
        </button>
        <button className="btnGold" onClick={onSubmit}>
          Submit Application
        </button>
      </div>
    </div>
  );
}