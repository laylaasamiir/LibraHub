import React, { useState, useEffect, useRef, useCallback } from "react";
import "./AdminCard.css";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
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

export const AdminCard = () => {
  const [userData, setUserData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("choose");
  const [preview, setPreview] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetData, setResetData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetColor, setResetColor] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailColor, setEmailColor] = useState("");

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
        }
      } catch (err) {
        console.error("Fetch Admin Error:", err);
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
      let url = capturedImage
        ? await uploadBase64ToCloudinary(capturedImage)
        : await uploadToCloudinary(await fetch(preview).then((r) => r.blob()));

      await updateDoc(doc(db, "users", currentUser.uid), { avatarUrl: url });
      setAvatarUrl(url);
      handleCloseModal();
    } catch {
      setUploadError("Upload failed, please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleOpenModal = () => {
    setMode("choose");
    setPreview(null);
    setCapturedImage(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setMode("choose");
    setPreview(null);
    setCapturedImage(null);
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
    if (!oldPassword || !newPassword) {
      setResetMessage("Please fill all fields.");
      setResetColor("red");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetMessage("Passwords do not match.");
      setResetColor("red");
      return;
    }
    setResetLoading(true);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, oldPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setResetMessage("✅ Password updated!");
      setResetColor("green");
      setTimeout(() => {
        setShowResetModal(false);
        setResetData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setResetMessage("");
      }, 2000);
    } catch {
      setResetMessage("❌ Old password incorrect.");
      setResetColor("red");
    } finally {
      setResetLoading(false);
    }
  };

  const Skel = ({ w }) => (
    <span
      className="pc-skeleton"
      style={{
        width: w || "80px",
        height: "15px",
        display: "inline-block",
        background: "#e2e8f0",
        borderRadius: "4px",
      }}
    />
  );

  if (!loading && !userData)
    return (
      <div className="ac-card">
        <p style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
          No admin profile data found.
        </p>
      </div>
    );

  return (
    <div className="admin-profile-container">
      <div className="ac-card">
        <div className="ac-header-band" />
        <div className="ac-avatar-wrapper">
          <div className="ac-avatar-ring">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="ac-avatar-img" />
            ) : (
              <div className="ac-avatar-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
            )}
          </div>
          <button className="ac-avatar-upload-btn" onClick={handleOpenModal} title="Change photo">
            📸
          </button>
        </div>

        <h2 className="ac-name">{loading ? <Skel w="140px" /> : userData?.name || "Admin"}</h2>
        <span className="ac-role-badge">ADMIN</span>

        <div className="ac-table">
          <div className="ac-row">
            <span className="ac-row-icon">✉️</span>
            <div className="ac-row-content">
              <div className="ac-label">EMAIL</div>
              <div className="ac-value">{loading ? <Skel /> : userData?.email || "N/A"}</div>
            </div>
          </div>
        </div>

        <div className="ac-actions">
          <button className="ac-btn" onClick={() => setShowResetModal(true)}>
            🔒 Change Password
          </button>
        </div>
      </div>


      {showResetModal && (
        <div className="ac-modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="ac-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ac-modal-close" onClick={() => setShowResetModal(false)}>✕</button>
            <h3 className="ac-modal-title">🔒 Reset Password</h3>
            <div className="ac-edit-form">
              
              <div className="ac-edit-field">
                <label>Old Password</label>
                <div className="ac-password-input">
                  <input
                    type={showOld ? "text" : "password"}
                    value={resetData.oldPassword}
                    onChange={(e) => setResetData({ ...resetData, oldPassword: e.target.value })}
                  />
                  <span onClick={() => setShowOld(!showOld)}>{showOld ? "🙈" : "👁️"}</span>
                </div>
              </div>

              <div className="ac-edit-field">
                <label>New Password</label>
                <div className="ac-password-input">
                  <input
                    type={showNew ? "text" : "password"}
                    value={resetData.newPassword}
                    onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                  />
                  <span onClick={() => setShowNew(!showNew)}>{showNew ? "🙈" : "👁️"}</span>
                </div>
              </div>

              <div className="ac-edit-field">
                <label>Confirm Password</label>
                <div className="ac-password-input">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={resetData.confirmPassword}
                    onChange={(e) => setResetData({ ...resetData, confirmPassword: e.target.value })}
                  />
                  <span onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? "🙈" : "👁️"}</span>
                </div>
              </div>

              <button className="ac-forgot-btn" onClick={handleSendResetEmail} disabled={emailSending}>
                {emailSending ? "Sending..." : "🔗 Forgot password? Send reset email"}
              </button>

              {emailMessage && <p style={{ color: emailColor, fontSize: "12px", textAlign: "center" }}>{emailMessage}</p>}
              {resetMessage && <p style={{ color: resetColor, fontSize: "12px", textAlign: "center" }}>{resetMessage}</p>}

              <div className="ac-modal-actions">
                <button className="ac-btn" onClick={handleResetPassword} disabled={resetLoading}>
                  {resetLoading ? "Saving..." : "Save Password"}
                </button>
                <button className="ac-btn-outline" onClick={() => setShowResetModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

    
      {showModal && (
        <div className="ac-modal-overlay" onClick={handleCloseModal}>
          <div className="ac-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ac-modal-close" onClick={handleCloseModal}>✕</button>
            <h3 className="ac-modal-title">Change Picture</h3>
            {mode === "choose" && (
              <div className="ac-modal-choices">
                <button className="ac-choice-btn" onClick={() => setMode("upload")}><span>🖼️</span> Upload image</button>
                <button className="ac-choice-btn" onClick={() => setMode("camera")}><span>📷</span> Camera capture</button>
              </div>
            )}
            {mode === "upload" && (
              <div className="ac-modal-body">
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
                <button className="ac-choice-btn" onClick={() => fileInputRef.current.click()}>Choose an image</button>
                <button className="ac-back-btn" onClick={() => setMode("choose")}>Back ←</button>
              </div>
            )}
            {mode === "camera" && (
              <div className="ac-modal-body">
                <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="ac-webcam" mirrored width="100%" />
                <button className="ac-choice-btn" onClick={handleCapture}>📸 Capture</button>
                <button className="ac-back-btn" onClick={() => setMode("choose")}>← Back</button>
              </div>
            )}
            {mode === "preview" && preview && (
              <div className="ac-modal-body">
                <img src={preview} alt="preview" className="ac-preview-img" style={{ width: "100%", borderRadius: "8px" }} />
                {uploadError && <p className="ac-error">{uploadError}</p>}
                <div className="ac-modal-actions">
                  <button className="ac-btn" onClick={handleSaveAvatar} disabled={uploading}>
                    {uploading ? "Uploading..." : "Save image ✅"}
                  </button>
                  <button className="ac-btn-outline" onClick={() => setMode("choose")}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};