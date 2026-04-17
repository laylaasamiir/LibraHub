import React, { useEffect, useState, useRef, useCallback } from "react";
import "./StuCard.css";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Webcam from "react-webcam";


const CLOUDINARY_UPLOAD_PRESET = "Librahub"; 

const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/dmqwypcqm/image/upload`,
    { method: "POST", body: formData }
  );
  const data = await res.json();
  if (!data.secure_url) throw new Error("Cloudinary upload failed");
  return data.secure_url;
};

const uploadBase64ToCloudinary = async (base64String) => {
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/dmqwypcqm/image/upload`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file: base64String,
        upload_preset: CLOUDINARY_UPLOAD_PRESET,
      }),
    }
  );
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

  
  const [showModal, setShowModal] = useState(false);
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
        }
      } catch {
        setUserData(null);
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
      let url;
      if (capturedImage) {
        url = await uploadBase64ToCloudinary(capturedImage);
      } else {
        const blob = await fetch(preview).then((r) => r.blob());
        url = await uploadToCloudinary(blob);
      }
      await updateDoc(doc(db, "users", currentUser.uid), { avatarUrl: url });
      setAvatarUrl(url);
      setShowModal(false);
      setMode("choose");
      setPreview(null);
      setCapturedImage(null);
    } catch (err) {
      setUploadError("Upload failed, please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleOpenModal = () => {
    setMode("choose");
    setPreview(null);
    setCapturedImage(null);
    setUploadError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setMode("choose");
    setPreview(null);
    setCapturedImage(null);
  };

  
  const Skel = ({ w }) => (
    <span className="pc-skeleton" style={{ width: w || "80px" }} />
  );

  if (!loading && !userData) {
    return (
      <div className="pc-card">
        <p className="pc-no-data">No profile data found.</p>
      </div>
    );
  }

  return (
    <>
      
      <div className="pc-card">
        <div className="pc-header-band" />

      
        <div className="pc-avatar-wrapper">
          <div className="pc-avatar-ring">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="pc-avatar-img" />
            ) : (
              <div className="pc-avatar-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
            )}
          </div>
          <button className="pc-avatar-upload-btn" onClick={handleOpenModal} title="Change photo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </button>
        </div>

        <h2 className="pc-name">
          {loading ? <Skel w={130} /> : userData?.name || "Student"}
        </h2>
        <span className="pc-role-badge">STUDENT</span>

       
        <div className="pc-stats-row">
          <div className="pc-stat-box">
            <span className="pc-stat-icon">🎓</span>
            <span className="pc-stat-value">
              {loading ? <Skel w={70} /> : userData?.studentCode || "—"}
            </span>
            <span className="pc-stat-label">STUDENT CODE</span>
          </div>
          <div className="pc-stat-divider" />
          <div className="pc-stat-box">
            <span className="pc-stat-icon">📚</span>
            <span className="pc-stat-value">
              {loading ? <Skel w={24} /> : userData?.borrowedBooks ?? 0}
            </span>
            <span className="pc-stat-label">BOOKS BORROWED</span>
          </div>
        </div>

        
        <div className="pc-table">
          {[
            { label: "EMAIL", value: userData?.email },
            { label: "DEPARTMENT", value: userData?.department },
            { label: "LEVEL", value: userData?.level },
          ].map(({ label, value }) => (
            <div className="pc-row" key={label}>
              <div className="pc-label">{label}</div>
              <div className="pc-value">
                {loading ? <Skel /> : value || "N/A"}
              </div>
            </div>
          ))}
        </div>

        <div className="pc-actions">
          <button className="pc-btn">Fine Details</button>
          <button className="pc-btn-outline">Edit Profile</button>
        </div>
      </div>

      
      {showModal && (
        <div className="pc-modal-overlay" onClick={handleCloseModal}>
          <div className="pc-modal" onClick={(e) => e.stopPropagation()}>
            <button className="pc-modal-close" onClick={handleCloseModal}>✕</button>
            <h3 className="pc-modal-title">Change profile picture</h3>

            {/* Step 1 – Choose mode */}
            {mode === "choose" && (
              <div className="pc-modal-choices">
                <button className="pc-choice-btn" onClick={() => setMode("upload")}>
                  <span>🖼️</span> Upload image
                </button>
                <button className="pc-choice-btn" onClick={() => setMode("camera")}>
                  <span>📷</span> Camera capture
                </button>
              </div>
            )}

           
            {mode === "upload" && (
              <div className="pc-modal-body">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <button className="pc-choice-btn" onClick={() => fileInputRef.current.click()}>
                 Choose an image from your device
                </button>
                <button className="pc-back-btn" onClick={() => setMode("choose")}>Back ←</button>
              </div>
            )}

            
            {mode === "camera" && (
              <div className="pc-modal-body">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="pc-webcam"
                  mirrored
                />
                <button className="pc-choice-btn" onClick={handleCapture}>📸 التقط</button>
                <button className="pc-back-btn" onClick={() => setMode("choose")}>← رجوع</button>
              </div>
            )}

            
            {mode === "preview" && preview && (
              <div className="pc-modal-body">
                <img src={preview} alt="preview" className="pc-preview-img" />
                {uploadError && <p className="pc-error">{uploadError}</p>}
                <div className="pc-modal-actions">
                  <button
                    className="pc-btn"
                    onClick={handleSaveAvatar}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading in progress..." : " Save image ✅"}
                  </button>
                  <button className="pc-btn-outline" onClick={() => {
                    setPreview(null);
                    setCapturedImage(null);
                    setMode("choose");
                  }}>
                    cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};