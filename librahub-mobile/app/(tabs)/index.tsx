import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Image,
  Alert,
} from "react-native";

import { collection, getDocs, addDoc } from "firebase/firestore";
import { auth, db } from "../../components/firebase";
import { MaterialIcons } from "@expo/vector-icons";

export default function HomeScreen() {
  const [books, setBooks] = useState([]);
  const [favBooks, setFavBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [requestedBooks, setRequestedBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
  try {
    const snap = await getDocs(collection(db, "books"));

    const data = snap.docs.map((doc) => {
      const bookData = doc.data() || {};

      return {
        id: doc.id,
        title: typeof bookData.title === "string" ? bookData.title : "",
        author: typeof bookData.author === "string" ? bookData.author : "",
        coverUrl: typeof bookData.coverUrl === "string" ? bookData.coverUrl : "",
        category: typeof bookData.category === "string" ? bookData.category : "",
      };
    });

    console.log("DATA:", data); 

    setBooks(Array.isArray(data) ? data : []); 
  } catch (error) {
    console.log("ERROR FULL:", error);
    Alert.alert("Error", error.message);
  }
};

    fetchBooks();
  }, []);

  const toggleFav = async (book) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return Alert.alert("Login required");

    try {
      if (favBooks.includes(book.id)) {
        setFavBooks((prev) => prev.filter((id) => id !== book.id));
      } else {
        setFavBooks((prev) => [...prev, book.id]);

        await addDoc(collection(db, "favorites"), {
          bookId: book.id,
          userId,
        });
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Error updating favorites");
    }
  };

  const requestBook = async (book) => {
    const user = auth.currentUser;
    if (!user) return Alert.alert("Please login");

    try {
      await addDoc(collection(db, "borrowRequests"), {
        studentId: user.uid,
        bookId: book.id,
        status: "pending",
      });

      setRequestedBooks((prev) => [...prev, book.id]);
      Alert.alert("Request sent");
    } catch (e) {
      console.log(e);
      Alert.alert("Error sending request");
    }
  };

  const filteredBooks = books.filter((b) =>
    (b.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Books 📚</Text>

      <TextInput
        placeholder="Search..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        style={styles.search}
      />

      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable
              style={styles.heart}
              onPress={() => toggleFav(item)}
            >
              <MaterialIcons
                name={
                  favBooks.includes(item.id)
                    ? "favorite"
                    : "favorite-border"
                }
                size={24}
                color="red"
              />
            </Pressable>

            <Image
              source={{
                uri:
                  item.coverUrl ||
                  "https://dummyimage.com/150x150/cccccc/000000&text=No+Image",
              }}
              style={styles.image}
            />

            <Text style={styles.bookTitle}>
              {item.title || "No title"}
            </Text>

            <Text style={styles.author}>
              By: {item.author || "Unknown"}
            </Text>

            <Pressable
              style={[
                styles.btn,
                requestedBooks.includes(item.id) && styles.disabledBtn,
              ]}
              onPress={() => requestBook(item)}
              disabled={requestedBooks.includes(item.id)}
            >
              <Text style={styles.btnText}>
                {requestedBooks.includes(item.id)
                  ? "Requested"
                  : "Request Book"}
              </Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2f7",
    paddingHorizontal: 15,
    paddingTop: 15,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 15,
  },

  search: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 18,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  heart: {
    position: "absolute",
    right: 12,
    top: 12,
    zIndex: 2,
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 6,
    elevation: 3,
  },

  image: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    marginBottom: 10,
  },

  bookTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
  },

  author: {
    color: "#666",
    marginBottom: 10,
    fontSize: 13,
  },

  btn: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  disabledBtn: {
    backgroundColor: "#9ca3af",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});