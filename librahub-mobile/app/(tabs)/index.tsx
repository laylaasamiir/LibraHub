import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
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
import { onAuthStateChanged } from "firebase/auth";

export default function HomeScreen() {
  const [books, setBooks] = useState([]);
  const [favBooks, setFavBooks] = useState([]); // ARRAY ثابت
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);

  // 🔐 Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return unsub;
  }, []);


  useEffect(() => {
    const fetchBooks = async () => {
      const snap = await getDocs(collection(db, "books"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBooks(data);
    };

    fetchBooks();
  }, []);


  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "favorites"),
      where("userId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const ids = snap.docs.map((d) => d.data().bookId);
      setFavBooks(ids); // array
    });

    return unsub;
  }, [user]);


  const toggleFav = async (book) => {
    if (!user) return;

    const isFav = favBooks.includes(book.id);

    const q = query(
      collection(db, "favorites"),
      where("userId", "==", user.uid),
      where("bookId", "==", book.id)
    );

    const snap = await getDocs(q);

    if (isFav) {
      if (!snap.empty) {
        await deleteDoc(doc(db, "favorites", snap.docs[0].id));
      }

      setFavBooks((prev) => prev.filter((id) => id !== book.id));
    } else {
      await addDoc(collection(db, "favorites"), {
        userId: user.uid,
        bookId: book.id,
      });

      setFavBooks((prev) => [...prev, book.id]);
    }
  };


  const filtered = books.filter((b) =>
    (b.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const isFav = favBooks.includes(item.id);

    return (
      <View style={styles.card}>
        <Pressable
          style={styles.heart}
          onPress={() => toggleFav(item)}
        >
          <MaterialIcons
            name={isFav ? "favorite" : "favorite-border"}
            size={24}
            color="red"
          />
        </Pressable>

        <Image
          source={{
            uri: item.coverUrl || "https://dummyimage.com/150x150/ccc/000",
          }}
          style={styles.image}
        />

        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text style={styles.author}>{item.author}</Text>
      </View>
    );
  };

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
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2f7",
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  search: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    marginBottom: 15,
    padding: 10,
    borderRadius: 12,
  },
  heart: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 10,
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: 10,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  author: {
    color: "#666",
  },
});