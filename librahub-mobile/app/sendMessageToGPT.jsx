import axios from "axios";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../components/firebase";

const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;

let cachedBooks = [];

const fetchBooks = async () => {
  try {
    const snapshot = await getDocs(collection(db, "books"));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title?.toLowerCase() || "",
      description: doc.data().description || "لا يوجد وصف متاح لهذا الكتاب.",
    }));
  } catch (error) {
    console.error("Firebase Fetch Error:", error);
    return [];
  }
};

const isOutOfScope = (responseText) => {
  const outOfScopeSignal = "OUT_OF_SCOPE";
  return responseText.includes(outOfScopeSignal);
};

export const sendMessageToGPT = async (message) => {
  try {
    if (cachedBooks.length === 0) {
      cachedBooks = await fetchBooks();
    }

    const lowerMessage = message.toLowerCase();
    const foundBook = cachedBooks.find((book) =>
      lowerMessage.includes(book.title),
    );

    if (foundBook) {
      return `📚 *${foundBook.title.toUpperCase()}*\n\n${foundBook.description}`;
    }

    const bookList = cachedBooks.map((b) => `- ${b.title}`).join("\n");

    const systemPrompt = `
أنت مساعد ذكي مخصص حصرياً لمنصة LibraHub.

🌐 اللغة: تحدث دائماً بنفس لغة المستخدم. إذا كتب بالعربية فرد بالعربية، وإذا كتب بالإنجليزية فرد بالإنجليزية. إذا خلط بين اللغتين فاستخدم اللغة الأكثر في رسالته.

📌 ما هي LibraHub؟
LibraHub هي منصة ويب تتيح للمستخدمين:
- تصفح الكتب المتاحة في المنصة.
- تقديم طلب (Request) للحصول على كتاب معين.
- بعد قبول الطلب من الإدارة، يمكن للمستخدم استعارة الكتاب.
- إعادة الكتاب بعد الانتهاء منه.

مهامك المسموح بها فقط:
1. مساعدة المستخدم في البحث عن كتاب من الكتب المتاحة.
2. شرح كيفية تقديم طلب استعارة كتاب.
3. الإجابة عن أسئلة تتعلق بآلية عمل المنصة (التصفح، الطلب، القبول، الاستعارة، الإعادة).
4. عرض تفاصيل أو وصف الكتب المتاحة.

الكتب المتاحة حالياً في المنصة:
${bookList || "لا توجد كتب متاحة حالياً."}

⚠️ قواعد صارمة:
- إذا سألك المستخدم عن أي موضوع خارج نطاق LibraHub (مثل السياسة، الطبخ، الرياضة، البرمجة العامة، الأخبار، إلخ)، يجب أن ترد فقط بالكلمة: OUT_OF_SCOPE
- لا تجب أبداً عن أسئلة لا علاقة لها بالمنصة أو الكتب.
- لا تتظاهر بأنك مساعد عام.
`.trim();

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.0-flash-001",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:19006",
          "X-Title": "Librahub",
        },
      },
    );

    const aiReply = response.data.choices[0].message.content;

    if (isOutOfScope(aiReply)) {
      return "🤖 أنا مساعد LibraHub فقط! يمكنني مساعدتك في البحث عن الكتب، عرض تفاصيلها، أو الإجابة عن أسئلة تتعلق بالتطبيق. كيف يمكنني مساعدتك؟ 📚";
    }

    return aiReply;
  } catch (error) {
    console.error(
      "OpenRouter Error Details:",
      error.response?.data || error.message,
    );
    return "عذراً، واجهت مشكلة في الاتصال بالمساعد الذكي.";
  }
};

export default sendMessageToGPT;
