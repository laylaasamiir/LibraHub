import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";

import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  onSnapshot
} from "firebase/firestore";

import { auth, db } from "../../components/firebase";

export default function FavoritesScreen() {
  const [favBooks, setFavBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (!user) {
      setFavBooks([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "favorites"),
      where("userId", "==", user.uid)
    );

    const unsub = onSnapshot(q, async (favSnap) => {
      const favList = favSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const booksSnap = await getDocs(collection(db, "books"));

      const booksMap = {};
      booksSnap.docs.forEach((doc) => {
        booksMap[doc.id] = doc.data();
      });

      const finalData = favList.map((fav) => ({
        ...booksMap[fav.bookId],
        id: fav.bookId,
        favDocId: fav.id,
      }));

      setFavBooks(finalData);
      setLoading(false);
    });

    return () => unsub();
  });

  return () => unsubscribe();
}, []);

  const removeFromFavorites = async (favDocId) => {
    try {
      await deleteDoc(doc(db, "favorites", favDocId));
      setFavBooks((prev) =>
        prev.filter((book) => book.favDocId !== favDocId)
      );
      Alert.alert("Removed from Favorites");
    } catch (error) {
      console.log(error);
      Alert.alert("Error removing");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading Favorites...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Favorites ❤️</Text>

      {favBooks.length === 0 ? (
        <Text style={styles.empty}>No favorite books yet</Text>
      ) : (
        <FlatList
          data={favBooks}
          keyExtractor={(item) => item.favDocId}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Pressable
                style={styles.remove}
                onPress={() => removeFromFavorites(item.favDocId)}
              >
                <Text style={{ fontSize: 18 }}>💔</Text>
              </Pressable>

              <Image
                source={{
                  uri:
                    item.coverUrl ||
                    "https://dummyimage.com/150x150/ccc/000",
                }}
                style={styles.image}
              />

              <Text style={styles.bookTitle}>
                {item.title || "No title"}
              </Text>

              <Text style={styles.author}>
                By: {item.author || "Unknown"}
              </Text>

              <Text
                style={[
                  styles.status,
                  item.isBorrowed
                    ? styles.borrowed
                    : styles.available,
                ]}
              >
                {item.isBorrowed ? "Borrowed" : "Available"}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 50,
    backgroundColor: "#eef2f7",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },

  empty: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 12,
    marginBottom: 15,
    elevation: 3,
  },

  remove: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 2,
  },

  image: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },

  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },

  author: {
    color: "#666",
    marginBottom: 5,
  },

  status: {
    marginTop: 5,
    padding: 6,
    borderRadius: 8,
    textAlign: "center",
    color: "#fff",
  },

  available: {
    backgroundColor: "green",
  },

  borrowed: {
    backgroundColor: "red",
  },
});