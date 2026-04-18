import React, { useEffect, useState, useRef, useCallback } from "react";
import "./StuCard.css";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged, sendPasswordResetEmail, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import Webcam from "react-webcam";

const CLOUDINARY_UPLOAD_PRESET = "Librahub";

const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/dmqwypcqm/image/upload`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!data.secure_url) throw new Error("Cloudinary upload failed");
  return data.secure_url;
};

const uploadBase64ToCloudinary = async (base64String) => {
  const res = await fetch(`https://api.cloudinary.com/v1_1/dmqwypcqm/image/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      file: base64String,
      upload_preset: CLOUDINARY_UPLOAD_PRESET,
    }),
  });
  const data = await res.json();
  if (!data.secure_url) throw new Error("Cloudinary upload failed");
  return data.secure_url;
};

export const StuCard = () => {
  const [userData, setUserData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [borrowedCount, setBorrowedCount] = useState(0);
  
  // Modals States
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Profile Edit States
  const [editData, setEditData] = useState({ name: "", department: "", level: "", studentCode: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // Password Reset States
  const [resetData, setResetData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetColor, setResetColor] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailColor, setEmailColor] = useState("");

  // Avatar States
  const [mode, setMode] = useState("choose");
  const [preview, setPreview] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        setUserData(null);
        return;
      }
      setCurrentUser(user);
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setUserData(data);
          if (data.avatarUrl) setAvatarUrl(data.avatarUrl);

          if (data.studentCode) {
            const borrowRef = collection(db, "borrowedBooks");
            const q = query(borrowRef, where("studentCode", "==", data.studentCode));
            const snapshot = await getDocs(q);
            setBorrowedCount(snapshot.size);
          }
        }
      } catch (err) {
        console.error("Fetch User Error:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setPreview(imageSrc);
      setMode("preview");
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      setCapturedImage(null);
      setMode("preview");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (!preview || !currentUser) return;
    setUploading(true);
    setUploadError(null);
    try {
      let url = capturedImage ? await uploadBase64ToCloudinary(capturedImage) : await uploadToCloudinary(await fetch(preview).then(r => r.blob()));
      await updateDoc(doc(db, "users", currentUser.uid), { avatarUrl: url });
      setAvatarUrl(url);
      handleCloseModal();
    } catch {
      setUploadError("Upload failed, please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleOpenModal = () => { setMode("choose"); setPreview(null); setShowModal(true); };
  const handleCloseModal = () => { setShowModal(false); setMode("choose"); setPreview(null); };

  const handleOpenEdit = () => {
    setEditData({
      name: userData?.name || "",
      department: userData?.department || "",
      level: userData?.level || "",
      studentCode: userData?.studentCode || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editData.name.trim()) return setEditError("Name cannot be empty.");
    setEditLoading(true);
    try {
      await updateDoc(doc(db, "users", currentUser.uid), editData);
      setUserData(prev => ({ ...prev, ...editData }));
      setEditSuccess("✅ Profile updated successfully!");
      setTimeout(() => setShowEditModal(false), 1500);
    } catch {
      setEditError("❌ Failed to update. Try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    setEmailSending(true);
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      setEmailMessage(`✅ Email sent to ${currentUser.email}`);
      setEmailColor("green");
    } catch {
      setEmailMessage("❌ Failed to send email.");
      setEmailColor("red");
    } finally {
      setEmailSending(false);
    }
  };

  const handleResetPassword = async () => {
    const { oldPassword, newPassword, confirmPassword } = resetData;
    if (!oldPassword || !newPassword) return setResetMessage("Please fill all fields."), setResetColor("red");
    if (newPassword !== confirmPassword) return setResetMessage("Passwords do not match."), setResetColor("red");

    setResetLoading(true);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, oldPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setResetMessage("✅ Password updated!");
      setResetColor("green");
      setTimeout(() => setShowResetModal(false), 2000);
    } catch (err) {
      setResetMessage("❌ Old password incorrect.");
      setResetColor("red");
    } finally {
      setResetLoading(false);
    }
  };

  const Skel = ({ w }) => <span className="pc-skeleton" style={{ width: w || "80px" }} />;

  if (!loading && !userData) return <div className="pc-card"><p className="pc-no-data">No profile data found.</p></div>;

  return (
    <>
      <div className="pc-card">
        <div className="pc-header-band" />
        <div className="pc-avatar-wrapper">
          <div className="pc-avatar-ring">
            {avatarUrl ? <img src={avatarUrl} alt="avatar" className="pc-avatar-img" /> : <div className="pc-avatar-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg></div>}
          </div>
          <button className="pc-avatar-upload-btn" onClick={handleOpenModal} title="Change photo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
          </button>
        </div>

        <h2 className="pc-name">{loading ? <Skel w={130} /> : userData?.name || "Student"}</h2>
        <span className="pc-role-badge">STUDENT</span>

        <div className="pc-stats-row">
          <div className="pc-stat-box"><span className="pc-stat-icon">🎓</span><span className="pc-stat-value">{loading ? <Skel w={70} /> : userData?.studentCode || "—"}</span><span className="pc-stat-label">STUDENT CODE</span></div>
          <div className="pc-stat-divider" /><div className="pc-stat-box"><span className="pc-stat-icon">📚</span><span className="pc-stat-value">{loading ? <Skel w={24} /> : borrowedCount}</span><span className="pc-stat-label">BOOKS BORROWED</span></div>
        </div>

        <div className="pc-table">
          {[{ label: "EMAIL", value: userData?.email }, { label: "DEPARTMENT", value: userData?.department }, { label: "LEVEL", value: userData?.level }].map(({ label, value }) => (
            <div className="pc-row" key={label}><div className="pc-label">{label}</div><div className="pc-value">{loading ? <Skel /> : value || "N/A"}</div></div>
          ))}
        </div>

        <div className="pc-actions">
          <button className="pc-btn" onClick={() => setShowResetModal(true)}>🔒 Change Password</button>
          <button className="pc-btn-outline" onClick={handleOpenEdit}>Edit Profile</button>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="pc-modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="pc-modal" onClick={(e) => e.stopPropagation()}>
            <button className="pc-modal-close" onClick={() => setShowResetModal(false)}>✕</button>
            <h3 className="pc-modal-title">🔒 Reset Password</h3>
            <div className="pc-edit-form">
              <div className="pc-edit-field">
                <label>Old Password</label>
                <div className="pc-password-input">
                  <input type={showOld ? "text" : "password"} value={resetData.oldPassword} onChange={(e) => setResetData({ ...resetData, oldPassword: e.target.value })} />
                  <span onClick={() => setShowOld(!showOld)}>{showOld ? "🙈" : "👁️"}</span>
                </div>
              </div>
              <div className="pc-edit-field">
                <label>New Password</label>
                <div className="pc-password-input">
                  <input type={showNew ? "text" : "password"} value={resetData.newPassword} onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })} />
                  <span onClick={() => setShowNew(!showNew)}>{showNew ? "🙈" : "👁️"}</span>
                </div>
              </div>
              <div className="pc-edit-field">
                <label>Confirm Password</label>
                <div className="pc-password-input">
                  <input type={showConfirm ? "text" : "password"} value={resetData.confirmPassword} onChange={(e) => setResetData({ ...resetData, confirmPassword: e.target.value })} />
                  <span onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? "🙈" : "👁️"}</span>
                </div>
              </div>
              <button className="pc-forgot-btn" onClick={handleSendResetEmail} disabled={emailSending}>{emailSending ? "Sending..." : "🔗 Forgot password? Send reset email"}</button>
              {emailMessage && <p style={{ color: emailColor, fontSize: "12px", textAlign: "center" }}>{emailMessage}</p>}
              {resetMessage && <p style={{ color: resetColor, fontSize: "12px", textAlign: "center" }}>{resetMessage}</p>}
              <div className="pc-modal-actions">
                <button className="pc-btn" onClick={handleResetPassword} disabled={resetLoading}>{resetLoading ? "Saving..." : "Save Password"}</button>
                <button className="pc-btn-outline" onClick={() => setShowResetModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showEditModal && (
        <div className="pc-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="pc-modal" onClick={(e) => e.stopPropagation()}>
            <button className="pc-modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            <h3 className="pc-modal-title">Edit Profile</h3>
            <div className="pc-edit-form">
              <div className="pc-edit-field"><label>Name</label><input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} /></div>
              <div className="pc-edit-field"><label>Department</label><input type="text" value={editData.department} onChange={(e) => setEditData({ ...editData, department: e.target.value })} /></div>
              <div className="pc-edit-field"><label>Student Code</label><input type="text" value={editData.studentCode} onChange={(e) => setEditData({ ...editData, studentCode: e.target.value })} /></div>
              <div className="pc-edit-field">
                <label>Level</label>
                <select value={editData.level} onChange={(e) => setEditData({ ...editData, level: e.target.value })}>
                  <option value="">Select Level</option>
                  <option value="Level 1">Level 1</option><option value="Level 2">Level 2</option><option value="Level 3">Level 3</option><option value="Level 4">Level 4</option>
                </select>
              </div>
              {editError && <p className="pc-error">{editError}</p>}
              {editSuccess && <p className="pc-success">{editSuccess}</p>}
              <div className="pc-modal-actions">
                <button className="pc-btn" onClick={handleSaveEdit} disabled={editLoading}>{editLoading ? "Saving..." : "Save Changes"}</button>
                <button className="pc-btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Modal */}
      {showModal && (
        <div className="pc-modal-overlay" onClick={handleCloseModal}>
          <div className="pc-modal" onClick={(e) => e.stopPropagation()}>
            <button className="pc-modal-close" onClick={handleCloseModal}>✕</button>
            <h3 className="pc-modal-title">Change profile picture</h3>
            {mode === "choose" && (
              <div className="pc-modal-choices">
                <button className="pc-choice-btn" onClick={() => setMode("upload")}><span>🖼️</span> Upload image</button>
                <button className="pc-choice-btn" onClick={() => setMode("camera")}><span>📷</span> Camera capture</button>
              </div>
            )}
            {mode === "upload" && (
              <div className="pc-modal-body">
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
                <button className="pc-choice-btn" onClick={() => fileInputRef.current.click()}>Choose an image</button>
                <button className="pc-back-btn" onClick={() => setMode("choose")}>Back ←</button>
              </div>
            )}
            {mode === "camera" && (
              <div className="pc-modal-body">
                <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="pc-webcam" mirrored />
                <button className="pc-choice-btn" onClick={handleCapture}>📸 Capture</button>
                <button className="pc-back-btn" onClick={() => setMode("choose")}>← Back</button>
              </div>
            )}
            {mode === "preview" && preview && (
              <div className="pc-modal-body">
                <img src={preview} alt="preview" className="pc-preview-img" />
                {uploadError && <p className="pc-error">{uploadError}</p>}
                <div className="pc-modal-actions">
                  <button className="pc-btn" onClick={handleSaveAvatar} disabled={uploading}>{uploading ? "Uploading..." : "Save image ✅"}</button>
                  <button className="pc-btn-outline" onClick={() => setMode("choose")}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};