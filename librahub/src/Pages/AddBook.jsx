import React,{useState} from "react";
import "./addBook.css";
import{collection,addDoc} from "firebase/firestore";
import { db } from '../firebase';

const AddBook = () => {
    const[bookName,setBookName] = useState({
        title:"",
        author:"",
        version:"",
        description:"",
    });
    const handleChange = (e) => {
        setBookName({...bookName,[e.target.name]:e.target.value});
    };
    const hadleAddBook = async(e) => {
        e.preventDefault();
        const radomNumber=Math.floor(1000000+Math.random()*9000000);
        try{
            const docRef = await addDoc(collection(db, "books"), {
                ...bookName,
                bookId: radomNumber,
                createdAt: new Date()
            });
            console.log("Document written with ID: ", radomNumber);
            alert(`Book added successfully! ID: ${radomNumber}`);

            setBookName({ title: "", author: "", version: "", description: "" });
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to add book.");
        }
    };
    return(
        <div className="add-book-container">
            <div className="form-card">
                <h2>Add a New Book</h2>
                <form onSubmit={hadleAddBook}>
                    <div className="input-group">
                        <label>Book Title</label>
                    <input
                        type="text"
                        name="title"
                        value={bookName.title}
                        onChange={handleChange} required placeholder="Enter book name"
                    />
                    </div>
                    <div className="input-group">
                        <label>Author</label>
                    <input type="text" name="author" value={bookName.author} onChange={handleChange} required placeholder="Author name"/>
                    </div>
                    <div className="input-group">
                        <label>Version</label>
                    <input type="text" name="version" value={bookName.version} onChange={handleChange} required placeholder="Version"/>
                    </div>
                    <div className="input-group">
                        <label>Description</label>
                    <textarea name="description" value={bookName.description} onChange={handleChange} required placeholder="Description"/>
                    </div>
                    <button type="submit" className="save-btn">Save to Library</button>
                </form>
            </div>
        </div>
    );
};

export default AddBook;
