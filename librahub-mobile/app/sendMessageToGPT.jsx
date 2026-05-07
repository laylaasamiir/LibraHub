import axios from 'axios';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../components/firebase";

 
const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;

let cachedBooks = [];

const fetchBooks = async () => {
  try {
    const snapshot = await getDocs(collection(db, "books"));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title?.toLowerCase() || "",
      description: doc.data().description || "لا يوجد وصف متاح لهذا الكتاب.",
    }));
  } catch (error) {
    console.error("Firebase Fetch Error:", error);
    return [];
  }
};

export const sendMessageToGPT = async (message) => {
  try {
    if (cachedBooks.length === 0) {
      cachedBooks = await fetchBooks();
    }

    const lowerMessage = message.toLowerCase();
    const foundBook = cachedBooks.find(book => lowerMessage.includes(book.title));

    if (foundBook) {
      return `📚 *${foundBook.title.toUpperCase()}*\n\n${foundBook.description}`;
    }

     
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.0-flash-001",  
        messages: [
          { role: "system", content: "أنت مساعد ذكي لتطبيق مكتبة LibraHub." },
          { role: "user", content: message }
        ],
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:19006", 
          "X-Title": "Librahub",
        },
      }
    );

    return response.data.choices[0].message.content;

  } catch (error) { 
    console.error("OpenRouter Error Details:", error.response?.data || error.message);
    return "عذراً، واجهت مشكلة في الاتصال بالمساعد الذكي.";
  }
};

 
export default sendMessageToGPT;