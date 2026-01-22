import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "../styles/newApplication.css";

export default function NewApplication() {
  const [step, setStep] = useState(1);

  const [programs, setPrograms] = useState([]);
  const [applicationId, setApplicationId] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    programId: "",
    gpa: "",
  });

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
        // fallback
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
      // create draft in DB
      const res = await api.post("/api/applications", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        programId: form.programId,
        gpa: form.gpa,
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

      // 1) Pay
      await api.post(`/api/applications/${applicationId}/pay`, { amount: 50 });

      // 2) Submit (backend will reject if not paid)
      await api.post(`/api/applications/${applicationId}/submit`);

      alert("Submitted ✅ and saved in database!");
      setStep(1);
      setApplicationId(null);
      setDocs([]);
      setPayment({ cardNumber: "", expiry: "", cvc: "" });
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
          <button className="sidebar__item sidebar__item--active">
            <span className="sidebar__dot" /> Dashboard
          </button>
          <button className="sidebar__item">
            <span className="sidebar__dot" /> My Applications
          </button>
        </nav>

        <div className="sidebar__footer">
          <button
            className="sidebar__signout"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
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

function StepPersonalInfo({ form, setForm, programs, onNext }) {
  return (
    <div>
      <div className="card__header">
        <div className="card__title">Personal & Academic Information</div>
        <div className="card__subtitle">Please enter your details accurately.</div>
      </div>

      <div className="grid2">
        <div className="field">
          <label>First Name</label>
          <input
            value={form.firstName}
            onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
            placeholder="First name"
          />
        </div>

        <div className="field">
          <label>Last Name</label>
          <input
            value={form.lastName}
            onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
            placeholder="Last name"
          />
        </div>
      </div>

      <div className="field">
        <label>Email Address</label>
        <input
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          placeholder="email@example.com"
          type="email"
        />
      </div>

      <div className="field">
        <label>Intended Program</label>
        <select
          value={form.programId}
          onChange={(e) => setForm((p) => ({ ...p, programId: e.target.value }))}
        >
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>High School GPA</label>
        <input
          value={form.gpa}
          onChange={(e) => setForm((p) => ({ ...p, gpa: e.target.value }))}
          placeholder="4.0"
        />
      </div>

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

function StepReviewPay({ form, programName, docs, payment, setPayment, onBack, onSubmit }) {
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
            <div className="muted">Documents:</div>
            <div>{docs.length} Files Attached</div>
          </div>
        </div>
      </div>

      <div className="sectionTitle" style={{ marginTop: 14 }}>Payment Details</div>

      <div className="feeBox">
        <div className="feeLeft">
          <div className="feeIcon">💳</div>
          <div>
            <div className="feeTitle">Application Fee</div>
            <div className="feeSub">Non-refundable processing fee</div>
          </div>
        </div>
        <div className="feeAmount">$50.00</div>
      </div>

      <div className="field">
        <label>Card Number</label>
        <input
          value={payment.cardNumber}
          onChange={(e) => setPayment((p) => ({ ...p, cardNumber: e.target.value }))}
          placeholder="0000 0000 0000 0000"
        />
      </div>

      <div className="grid2">
        <div className="field">
          <label>Expiry</label>
          <input
            value={payment.expiry}
            onChange={(e) => setPayment((p) => ({ ...p, expiry: e.target.value }))}
            placeholder="MM/YY"
          />
        </div>

        <div className="field">
          <label>CVC</label>
          <input
            value={payment.cvc}
            onChange={(e) => setPayment((p) => ({ ...p, cvc: e.target.value }))}
            placeholder="123"
          />
        </div>
      </div>

      <div className="infoBox">
        ℹ️ By submitting, you confirm that all information provided is accurate.
        False information may result in immediate rejection.
      </div>

      <div className="actions">
        <button className="btnOutline" onClick={onBack}>
          Back
        </button>
        <button className="btnGold" onClick={onSubmit}>
          Submit & Pay
        </button>
      </div>
    </div>
  );
}
