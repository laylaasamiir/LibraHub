import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons'; 
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  getDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "@/components/firebase";

type Book = {
  id: string;
  title?: string;
  author?: string;
  description?: string;
  category?: string;
  coverUrl?: string;
  image?: string;
  isBorrowed?: boolean;
  code?: string;
};

export default function HomeScreen() {
  const router = useRouter();

  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [favBooks, setFavBooks] = useState<string[]>([]);
  const [requestedBooks, setRequestedBooks] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categorySearch, setCategorySearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [bookRatings, setBookRatings] = useState<Record<string, number>>({});
  const [bookAverageRatings, setBookAverageRatings] = useState<any>({});
  const [sortMode, setSortMode] = useState<"none" | "borrowed" | "rated">("none");
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadUserData = async () => {
      if (!auth.currentUser) return;
      const userId = auth.currentUser.uid;
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists() && mounted) {
        setUserRole(userDoc.data().role || null);
      }
      const favQuery = query(collection(db, "favorites"), where("userId", "==", userId));
      const favSnapshot = await getDocs(favQuery);
      if (mounted) {
        setFavBooks(favSnapshot.docs.map((d) => String(d.data().bookId)));
      }
      const reqQuery = query(
        collection(db, "borrowRequests"),
        where("studentId", "==", userId),
        where("status", "==", "pending"),
      );
      const reqSnapshot = await getDocs(reqQuery);
      if (mounted) {
        setRequestedBooks(reqSnapshot.docs.map((d) => String(d.data().bookId)));
      }
    };

    const loadStats = async () => {
      const borrowedSnapshot = await getDocs(collection(db, "borrowedBooks"));
      const borrowCounts: Record<string, number> = {};
      borrowedSnapshot.docs.forEach((d) => {
        const bookId = String(d.data().bookId);
        borrowCounts[bookId] = (borrowCounts[bookId] || 0) + 1;
      });
      if (mounted) setBookRatings(borrowCounts);

      const reviewsSnapshot = await getDocs(collection(db, "bookReviews"));
      const ratingsData: any = {};
      reviewsSnapshot.docs.forEach((d) => {
        const review = d.data();
        if (!review.bookId || !review.rating) return;
        if (!ratingsData[review.bookId]) {
          ratingsData[review.bookId] = { total: 0, count: 0 };
        }
        ratingsData[review.bookId].total += review.rating;
        ratingsData[review.bookId].count += 1;
      });
      const averages: any = {};
      Object.keys(ratingsData).forEach((bookId) => {
        averages[bookId] = {
          average: ratingsData[bookId].total / ratingsData[bookId].count,
          count: ratingsData[bookId].count,
        };
      });
      if (mounted) setBookAverageRatings(averages);
    };

    loadUserData();
    loadStats();

    const unsubscribeBooks = onSnapshot(collection(db, "books"), (snapshot) => {
      const booksData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Book[];
      if (mounted) {
        setAllBooks(booksData);
        setLoading(false);
      }
    }, (error) => {
      console.log(error);
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribeBooks();
    };
  }, []);

  const categories = useMemo(() => {
    return ["All", ...new Set(allBooks.map((b) => b.category).filter(Boolean))] as string[];
  }, [allBooks]);

  const visibleBooks = useMemo(() => {
    let result = [...allBooks];
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((book) =>
        book.title?.toLowerCase().includes(lowerSearch) ||
        book.author?.toLowerCase().includes(lowerSearch)
      );
    }
    if (selectedCategory !== "All") {
      result = result.filter((book) => book.category === selectedCategory);
    }
    if (sortMode === "borrowed") {
      result.sort((a, b) => (bookRatings[b.id] || 0) - (bookRatings[a.id] || 0));
    }
    if (sortMode === "rated") {
      result.sort((a, b) => (bookAverageRatings[b.id]?.average || 0) - (bookAverageRatings[a.id]?.average || 0));
    }
    return result;
  }, [allBooks, searchTerm, selectedCategory, sortMode, bookRatings, bookAverageRatings]);

  const requireStudent = () => {
    if (!auth.currentUser || userRole !== "student") {
      Alert.alert("Student Access Only", "To request books or add to favorites, you must be logged in with a Student account.", [
        { text: "Cancel", style: "cancel" },
        { text: "Login Now", onPress: () => router.push("/login") },
      ]);
      return false;
    }
    return true;
  };

  const handleToggleFavorite = async (book: Book) => {
    if (!requireStudent()) return;
    const userId = auth.currentUser!.uid;
    if (favBooks.includes(book.id)) {
      setFavBooks((prev) => prev.filter((id) => id !== book.id));
      try {
        const q = query(collection(db, "favorites"), where("userId", "==", userId), where("bookId", "==", book.id));
        const querySnapshot = await getDocs(q);
        for (const document of querySnapshot.docs) {
          await deleteDoc(doc(db, "favorites", document.id));
        }
      } catch (e) {
        setFavBooks((prev) => [...prev, book.id]);
      }
      return;
    }
    setFavBooks((prev) => [...prev, book.id]);
    try {
      await addDoc(collection(db, "favorites"), {
        bookId: book.id,
        title: book.title || "",
        author: book.author || "",
        image: book.coverUrl || book.image || "",
        userId,
        addedAt: new Date(),
      });
    } catch (e) {
      setFavBooks((prev) => prev.filter((id) => id !== book.id));
    }
  };

  const handleRequest = async (book: Book) => {
    if (!requireStudent()) return;
    try {
      const user = auth.currentUser!;
      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (!userSnap.exists()) return;
      const studentData = userSnap.data();
      await addDoc(collection(db, "borrowRequests"), {
        studentId: user.uid,
        studentName: studentData.name || "",
        studentEmail: studentData.email || user.email || "",
        bookId: book.id,
        bookCode: book.code || "",
        bookTitle: book.title || "",
        status: "pending",
        requestedAt: serverTimestamp(),
      });
      setRequestedBooks((prev) => [...prev, book.id]);
      Alert.alert("Success", "Request sent successfully ✅");
    } catch (error) {
      Alert.alert("Error", "Error sending request");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e5c88" />
        <Text style={styles.loadingText}>Loading books... 📚</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Available Books 📚</Text>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search ..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <Pressable onPress={() => setShowFilter(true)}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </Pressable>
      </View>

      <View style={styles.sortRow}>
        <Pressable
          style={[styles.sortBtn, sortMode === "borrowed" && styles.sortBtnActive]}
          onPress={() => setSortMode((prev) => (prev === "borrowed" ? "none" : "borrowed"))}
        >
          <Text style={[styles.sortBtnText, sortMode === "borrowed" && styles.sortBtnTextActive]}>📖 Most Borrowed</Text>
        </Pressable>
        <Pressable
          style={[styles.sortBtn, sortMode === "rated" && styles.sortBtnActive]}
          onPress={() => setSortMode((prev) => (prev === "rated" ? "none" : "rated"))}
        >
          <Text style={[styles.sortBtnText, sortMode === "rated" && styles.sortBtnTextActive]}>⭐ Highest Rated</Text>
        </Pressable>
      </View>

      <FlatList
        data={visibleBooks}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.bookCard} onPress={() => router.push({ pathname: "/book-details", params: { bookId: item.id } })}>
            <Pressable style={styles.favoriteIcon} onPress={() => handleToggleFavorite(item)}>
              <Text style={styles.heart}>{favBooks.includes(String(item.id)) ? "❤️" : "🤍"}</Text>
            </Pressable>
            
            <Image source={{ uri: item.coverUrl || item.image || "https://dummyimage.com/150x150/ccc/000" }} style={styles.bookImage} />
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.author}>By: {item.author || "Unknown"}</Text>
              <Pressable
                style={[styles.requestBtn, item.isBorrowed ? styles.borrowedBtn : requestedBooks.includes(item.id) ? styles.requestedBtn : null]}
                disabled={item.isBorrowed || requestedBooks.includes(item.id)}
                onPress={() => handleRequest(item)}
              >
                <Text style={styles.requestBtnText}>{item.isBorrowed ? "Borrowed" : requestedBooks.includes(item.id) ? "Requested" : "Request Book"}</Text>
              </Pressable>
            </View>
          </Pressable>
        )}
      />

      
<View style={styles.page}> 
      
      <Pressable 
  style={styles.chatbotFloatingButton}
  onPress={() => router.push("/chatbot")}  
>
  <Image
    
    source={require('../../assets/images/chatbot_icon.png')} 
    style={styles.chatbotImage}
    resizeMode="contain"

  />
</Pressable>
    </View>

      <Modal visible={showFilter} transparent animationType="slide">
        
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f4f7f6",
    padding: 16,
    paddingTop: 50,
  },
   
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#2e5c88", fontWeight: "700" },
  title: { textAlign: "center", marginBottom: 20, color: "#333", fontWeight: "bold", fontSize: 24 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", marginBottom: 14, paddingHorizontal: 16, borderRadius: 30, borderWidth: 1, borderColor: "#eee", elevation: 3 },
  searchIcon: { marginRight: 10, fontSize: 18 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: "#333" },
  filterIcon: { fontSize: 19 },
  sortRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 15 },
  sortBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: "#ffd700" },
  sortBtnActive: { backgroundColor: "#ffd700" },
  sortBtnText: { color: "#b59b00", fontWeight: "700", fontSize: 12 },
  sortBtnTextActive: { color: "#000" },
  list: { paddingBottom: 100 },
  bookCard: { backgroundColor: "#fff", borderRadius: 12, elevation: 3, marginBottom: 18, overflow: "hidden", minHeight: 420 },
  bookImage: { width: "100%", height: 170, backgroundColor: "#eee" },
  favoriteIcon: { position: "absolute", top: 10, right: 10, backgroundColor: "#fff", width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", zIndex: 10, elevation: 3 },
  heart: { fontSize: 19 },
  bookInfo: { padding: 15, alignItems: "center", flex: 1 },
  bookTitle: { fontSize: 17, color: "#333", marginBottom: 8, fontWeight: "bold", textAlign: "center" },
  author: { color: "#777", fontSize: 13, marginBottom: 8 },
  requestBtn: { backgroundColor: "#2f68aa", padding: 10, width: "80%", marginTop: "auto", borderRadius: 20, alignItems: "center" },
  requestBtnText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  requestedBtn: { backgroundColor: "#eae0cf" },
  borrowedBtn: { backgroundColor: "#8c95a3" },

  
  chatbotFloatingButton: {
     
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#fff',  
    borderRadius: 30, 
    padding: 10,
    elevation: 5, 
    shadowColor: '#000',  
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
     
  },
  chatbotImage: {
     
    width: 40,
    height: 40,
    overflow:"visible",
    alignItems:"center"
  },
});