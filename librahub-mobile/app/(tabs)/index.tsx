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

import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

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
            title: bookData.title || "",
            author: bookData.author || "",
            coverUrl: bookData.coverUrl || "",
            category: bookData.category || "",
          };
        });

        setBooks(data);
      } catch (error) {
        console.log(error);
        Alert.alert("Error", error.message);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "favorites"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const favIds = snapshot.docs.map((doc) => doc.data().bookId);
      setFavBooks(favIds);
    });

    return () => unsubscribe();
  }, []);

  cconst toggleFav = async (book) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return Alert.alert("Login required");

  const isFav = favBooks.includes(book.id);

  try {
    if (isFav) {
      setFavBooks((prev) => prev.filter((id) => id !== book.id));
    } else {
      setFavBooks((prev) => [...prev, book.id]);
    }

    const q = query(
      collection(db, "favorites"),
      where("userId", "==", userId),
      where("bookId", "==", book.id)
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      await deleteDoc(doc(db, "favorites", snap.docs[0].id));
    } else {
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
  onPress={() => {
    console.log("HEART CLICKED");
    toggleFav(item);
  }}
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
    paddingTop: 50,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 15,
    textAlign: "center",
  },

  search: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    alignSelf: "center",
    width: "90%",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 18,
    padding: 12,
    elevation: 3,
  },

  heart: {
  position: "absolute",
  right: 12,
  top: 12,
  zIndex: 999,
  elevation: 20,
  backgroundColor: "#fff",
  borderRadius: 50,
  padding: 8,
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
  },
});