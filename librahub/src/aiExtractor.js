const getCoverImage = async (title) => {
  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=1`,
    );
    const data = await response.json();
    const coverId = data.docs[0]?.cover_i;
    if (coverId) {
      return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
    }
    return null;
  } catch {
    return null;
  }
};

const uploadImage = async (base64Image) => {
  try {
    const formData = new FormData();
    formData.append("file", base64Image);
    formData.append("upload_preset", "LibraHub");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dmqwypcqm/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await response.json();
    return data.secure_url;
  } catch {
    return null;
  }
};

export const extractBookData = async (base64Image) => {
  try {
    const response = await fetch("/api/extractBook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64Image }),
    });

    const data = await response.json();
    console.log("API Response:", data);

    if (data.error) {
      return {
        title: "Unknown",
        author: "Unknown",
        category: "Unknown",
        version: "Unknown",
        description: "Could not extract.",
        coverUrl: null,
      };
    }

    const text = data.choices[0].message.content;
    const cleanJson = text.replace(/```json|```/g, "").trim();

    try {
      const bookData = JSON.parse(cleanJson);
      const coverUrl = await getCoverImage(bookData.title);
      const finalCoverUrl = coverUrl || (await uploadImage(base64Image));
      return { ...bookData, coverUrl: finalCoverUrl };
    } catch {
      return {
        title: "Unknown",
        author: "Unknown",
        category: "Unknown",
        version: "Unknown",
        description: "Could not extract.",
        coverUrl: null,
      };
    }
  } catch (error) {
    console.error("AI Error:", error);
    return {
      title: "Unknown",
      author: "Unknown",
      category: "Unknown",
      version: "Unknown",
      description: "Could not extract.",
      coverUrl: null,
    };
  }
};
