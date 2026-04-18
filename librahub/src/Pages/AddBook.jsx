import React, { useState, useRef, useCallback } from "react";
import "./addBook.css";
import { collection, addDoc } from "firebase/firestore";
import { db } from '../firebase';
import Webcam from "react-webcam";

const CLOUDINARY_UPLOAD_PRESET = "Librahub";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dmqwypcqm/image/upload";

const AddBook = () => {
    const [bookName, setBookName] = useState({
        title: "",
        author: "",
        version: "",
        description: "",
        category: "",
    });

    const [showModal, setShowModal] = useState(false);
    const [mode, setMode] = useState("choose"); 
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);

    const webcamRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setBookName({ ...bookName, [e.target.name]: e.target.value });
    };

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

    const handleCapture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setCapturedImage(imageSrc);
            setPreview(imageSrc);
            setMode("preview");
        }
    }, []);

    const uploadImageToCloudinary = async () => {
        const formData = new FormData();
        if (capturedImage) {
            formData.append("file", capturedImage);
        } else {
            const blob = await fetch(preview).then(r => r.blob());
            formData.append("file", blob);
        }
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
        const data = await res.json();
        if (!data.secure_url) throw new Error("Upload failed");
        return data.secure_url;
    };

    const handleAddBook = async (e) => {
        e.preventDefault();
        if (!preview) {
            alert("Please upload or capture a book cover image first.");
            return;
        }

        setUploading(true);
        const randomNumber = Math.floor(1000000 + Math.random() * 9000000);

        try {
            const coverUrl = await uploadImageToCloudinary();

            await addDoc(collection(db, "books"), {
                ...bookName,
                bookId: randomNumber,
                coverUrl: coverUrl,
                createdAt: new Date()
            });

            alert(`Book added successfully! ID: ${randomNumber}`);
            setBookName({ title: "", author: "", version: "", description: "", category: "" });
            setPreview(null);
            setCapturedImage(null);
            setMode("choose");
        } catch (error) {
            console.error(error);
            alert("Error adding book.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="add-book-container">
            <div className="form-card">
                <h2>Add a New Book</h2>
                
                <div className="image-upload-section">
                    {preview ? (
                        <div className="preview-container">
                            <img src={preview} alt="Book cover" className="book-preview-img" />
                            <button type="button" onClick={() => setShowModal(true)}>Change Image</button>
                        </div>
                    ) : (
                        <button type="button" className="upload-placeholder" onClick={() => setShowModal(true)}>
                            📸 Add Book Cover
                        </button>
                    )}
                </div>

                <form onSubmit={handleAddBook}>
                    <div className="input-group">
                        <label>Book Title</label>
                        <input type="text" name="title" value={bookName.title} onChange={handleChange} required placeholder="Enter book name" />
                    </div>
                    <div className="input-group">
                        <label>Category</label>
                        <input type="text" name="category" value={bookName.category} onChange={handleChange} required placeholder="e.g. Science, Fiction" />
                    </div>
                    <div className="input-group">
                        <label>Author</label>
                        <input type="text" name="author" value={bookName.author} onChange={handleChange} required placeholder="Author name" />
                    </div>
                    <div className="input-group">
                        <label>Version</label>
                        <input type="text" name="version" value={bookName.version} onChange={handleChange} required placeholder="Version" />
                    </div>
                    <div className="input-group">
                        <label>Description</label>
                        <textarea name="description" value={bookName.description} onChange={handleChange} required placeholder="Description" />
                    </div>
                    <button type="submit" className="save-btn" disabled={uploading}>
                        {uploading ? "Saving Book..." : "Save to Library"}
                    </button>
                </form>
            </div>

            {showModal && (
                <div className="pc-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="pc-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="pc-modal-close" onClick={() => setShowModal(false)}>✕</button>
                        <h3 className="pc-modal-title">Book Cover Image</h3>
                        
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

                        {mode === "preview" && (
                            <div className="pc-modal-body">
                                <img src={preview} alt="preview" className="pc-preview-img" />
                                <div className="pc-modal-actions">
                                    <button className="pc-btn" onClick={() => setShowModal(false)}>Use this image ✅</button>
                                    <button className="pc-btn-outline" onClick={() => setMode("choose")}>Try again</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddBook;