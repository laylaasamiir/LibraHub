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
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const [books, setBooks] = useState([]);
  const [favBooks, setFavBooks] = useState([]);
  const [requestedBooks, setRequestedBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);

  const router = useRouter();

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
      setFavBooks(ids);
    });

    return unsub;
  }, [user]);

  const toggleFav = async (book) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

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

  const requestBook = async (book) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      await addDoc(collection(db, "borrowRequests"), {
        userId: user.uid,
        bookId: book.id,
        status: "pending",
        createdAt: new Date(),
      });

      setRequestedBooks((prev) => [...prev, book.id]);
    } catch (e) {
      console.log(e);
    }
  };



  const fetchBooks = async () => {
  const snap = await getDocs(collection(db, "books"));
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  setBooks(data);

  const cats = ["All", ...new Set(data.map(b => b.category).filter(Boolean))];
  setCategories(cats);
};

   const filtered = books.filter((b) => {
  const matchSearch = (b.title || "")
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  const matchCategory =
    selectedCategory === "All" || b.category === selectedCategory;

  return matchSearch && matchCategory;
});

 const renderItem = ({ item }) => {
  const isFav = favBooks.includes(item.id);

  const isBorrowed = item.isBorrowed === true;

  const isRequested = requestedBooks.includes(item.id);

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

      <Pressable
        style={[
          styles.requestBtn,
          isBorrowed && styles.borrowedBtn,
        ]}
        onPress={() => {
          if (!isBorrowed) requestBook(item);
        }}
        disabled={isBorrowed}
      >
        <Text style={styles.requestText}>
          {isBorrowed ? "Borrowed" : "Request Book"}
        </Text>
      </Pressable>

    </View>
  );
};

  return (
    <View style={styles.container}>

      {showAuthModal && (
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.icon}>📚</Text>

            <Text style={styles.modalTitle}>
              Login Required
            </Text>

            <Text style={styles.modalText}>
              You must login first to continue ❤️
            </Text>

            <Pressable
              style={styles.loginBtn}
              onPress={() => {
                setShowAuthModal(false);
                router.push("/login");
              }}
            >
              <Text style={styles.loginText}>Login Now</Text>
            </Pressable>

            <Pressable onPress={() => setShowAuthModal(false)}>
              <Text style={styles.closeText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}

      <Text style={styles.title}>Available Books 📚</Text>

      <TextInput
        placeholder="Search..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        style={styles.search}
      />

      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        style={{ marginBottom: 10 }}
        renderItem={({ item }) => (
    <Pressable
      onPress={() => setSelectedCategory(item)}
      style={{
        backgroundColor: selectedCategory === item ? "#4CAF50" : "#fff",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: "#ddd",
      }}
    >
      <Text
        style={{
          color: selectedCategory === item ? "#fff" : "#000",
        }}
      >
        {item}
      </Text>
    </Pressable>
  )}
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
  marginTop: 50, 
},
  overlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
},

modalCard: {
  backgroundColor: "#fff",
  width: "80%",
  borderRadius: 20,
  padding: 20,
  alignItems: "center",
},

icon: {
  fontSize: 40,
  marginBottom: 10,
},

modalTitle: {
  fontSize: 18,
  fontWeight: "bold",
  marginBottom: 8,
},

modalText: {
  textAlign: "center",
  color: "#666",
  marginBottom: 20,
},

loginBtn: {
  backgroundColor: "#4CAF50",
  paddingVertical: 10,
  paddingHorizontal: 25,
  borderRadius: 10,
  marginBottom: 10,
},

loginText: {
  color: "#fff",
  fontWeight: "bold",
},

closeText: {
  color: "#999",
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
  requestBtn: {
  marginTop: 10,
  backgroundColor: "#4CAF50",
  padding: 10,
  borderRadius: 8,
  alignItems: "center",
},

borrowedBtn: {
  backgroundColor: "#999",
},

requestText: {
  color: "#fff",
  fontWeight: "bold",
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