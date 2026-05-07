import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "@/components/firebase";

type Book = {
  id: string;
  title?: string;
  author?: string;
  version?: string;
  description?: string;
  category?: string;
  coverUrl?: string;
  image?: string;
  isBorrowed?: boolean;
  code?: string;
};

type Review = {
  id: string;
  userName?: string;
  name?: string;
  comment?: string;
  text?: string;
  rating?: number;
};

export default function BookDetailsScreen() {
  const router = useRouter();
  const { bookId } = useLocalSearchParams();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  const [isFav, setIsFav] = useState(false);
  const [favDocId, setFavDocId] = useState<string | null>(null);
  const [isRequested, setIsRequested] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [borrowCount, setBorrowCount] = useState(0);

  const ratedReviews = reviews.filter((r) => r.rating);

  const averageRating =
    ratedReviews.length > 0
      ? ratedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
        ratedReviews.length
      : 0;

  useEffect(() => {
    const fetchData = async () => {
      if (!bookId || typeof bookId !== "string") return;

      try {
        const bookSnap = await getDoc(doc(db, "books", bookId));

        if (!bookSnap.exists()) {
          setLoading(false);
          return;
        }

        const bookData = {
          id: bookSnap.id,
          ...bookSnap.data(),
        } as Book;

        setBook(bookData);

        const borrowedSnap = await getDocs(collection(db, "borrowedBooks"));

        let count = 0;

        borrowedSnap.docs.forEach((d) => {
          if (String(d.data().bookId) === String(bookData.id)) {
            count++;
          }
        });

        setBorrowCount(count);

        if (auth.currentUser) {
          const userId = auth.currentUser.uid;

          const userDoc = await getDoc(doc(db, "users", userId));

          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || null);
          }

          const favQ = query(
            collection(db, "favorites"),
            where("userId", "==", userId),
            where("bookId", "==", bookData.id),
          );

          const favSnap = await getDocs(favQ);

          if (!favSnap.empty) {
            setIsFav(true);
            setFavDocId(favSnap.docs[0].id);
          }

          const reqQ = query(
            collection(db, "borrowRequests"),
            where("studentId", "==", userId),
            where("bookId", "==", bookData.id),
            where("status", "==", "pending"),
          );

          const reqSnap = await getDocs(reqQ);

          if (!reqSnap.empty) {
            setIsRequested(true);
          }
        }

        const revQ = query(
          collection(db, "bookReviews"),
          where("bookId", "==", bookData.id),
        );

        const revSnap = await getDocs(revQ);

        setReviews(
          revSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as Review[],
        );
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookId]);

  const requireStudent = () => {
    if (!auth.currentUser || userRole !== "student") {
      Alert.alert(
        "Student Access Only",
        "You must login with a student account first.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => router.push("/login") },
        ],
      );

      return false;
    }

    return true;
  };

  const handleFavorite = async () => {
    if (!book) return;
    if (!requireStudent()) return;

    const userId = auth.currentUser!.uid;

    try {
      if (isFav && favDocId) {
        await deleteDoc(doc(db, "favorites", favDocId));

        setIsFav(false);
        setFavDocId(null);
      } else {
        const docRef = await addDoc(collection(db, "favorites"), {
          bookId: book.id,
          title: book.title || "",
          author: book.author || "",
          image: book.coverUrl || book.image || "",
          userId,
          addedAt: new Date(),
        });

        setIsFav(true);
        setFavDocId(docRef.id);
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  const handleRequest = async () => {
    if (!book) return;
    if (!requireStudent()) return;

    if (isRequested || book.isBorrowed) return;

    try {
      const userSnap = await getDoc(doc(db, "users", auth.currentUser!.uid));

      const studentData = userSnap.data();

      await addDoc(collection(db, "borrowRequests"), {
        studentId: auth.currentUser!.uid,
        studentName: studentData?.name || "",
        studentEmail: studentData?.email || auth.currentUser!.email || "",
        bookId: book.id,
        bookCode: book.code || "",
        bookTitle: book.title || "",
        status: "pending",
        requestedAt: serverTimestamp(),
      });

      setIsRequested(true);

      Alert.alert("Success", "Request sent successfully ✅");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to send request.");
    }
  };

  const handleSubmitReview = async () => {
    if (!book) return;

    setErrorMsg("");

    if (!requireStudent()) return;

    if (!comment.trim()) {
      setErrorMsg("Please write a review first.");
      return;
    }

    if (rating === 0) {
      setErrorMsg("Please add a rating before submitting.");
      return;
    }

    try {
      setSubmitting(true);

      const userSnap = await getDoc(doc(db, "users", auth.currentUser!.uid));

      const userName = userSnap.data()?.name || "Anonymous";

      const reviewData = {
        bookId: book.id,
        bookTitle: book.title || "",
        userId: auth.currentUser!.uid,
        userName,
        comment: comment.trim(),
        rating,
        updatedAt: serverTimestamp(),
      };

      const existingReviewQuery = query(
        collection(db, "bookReviews"),
        where("bookId", "==", book.id),
        where("userId", "==", auth.currentUser!.uid),
      );

      const existingReviewSnap = await getDocs(existingReviewQuery);

      if (!existingReviewSnap.empty) {
        const existingReviewDoc = existingReviewSnap.docs[0];

        await updateDoc(
          doc(db, "bookReviews", existingReviewDoc.id),
          reviewData,
        );

        setReviews((prev) =>
          prev.map((r) =>
            r.id === existingReviewDoc.id ? { ...r, ...reviewData } : r,
          ),
        );
      } else {
        const docRef = await addDoc(collection(db, "bookReviews"), {
          ...reviewData,
          createdAt: serverTimestamp(),
        });

        setReviews((prev) => [
          ...prev,
          {
            id: docRef.id,
            ...reviewData,
          },
        ]);
      }

      setComment("");
      setRating(0);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e5c88" />
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.center}>
        <Text>Book not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <View style={styles.header}>
          {borrowCount > 0 && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingBadgeText}>📖 {borrowCount}</Text>
            </View>
          )}

          <Image
            source={{
              uri:
                book.coverUrl ||
                book.image ||
                "https://dummyimage.com/150x200/ccc/000",
            }}
            style={styles.image}
          />

          <TouchableOpacity style={styles.favBtn} onPress={handleFavorite}>
            <Text style={styles.heart}>{isFav ? "❤️" : "🤍"}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{book.title}</Text>

        <Text style={styles.info}>
          <Text style={styles.infoLabel}>Author: </Text>
          {book.author || "Unknown"}
        </Text>

        <Text style={styles.info}>
          <Text style={styles.infoLabel}>Description: </Text>
          {book.description || "No description"}
        </Text>

        <Text
          style={[
            styles.status,
            book.isBorrowed ? styles.borrowed : styles.available,
          ]}
        >
          {book.isBorrowed ? "Borrowed" : "Available"}
        </Text>

        <TouchableOpacity
          style={[
            styles.requestBtn,
            (book.isBorrowed || isRequested) && styles.disabledBtn,
          ]}
          disabled={book.isBorrowed || isRequested}
          onPress={handleRequest}
        >
          <Text style={styles.requestText}>
            {book.isBorrowed
              ? "Borrowed"
              : isRequested
                ? "Requested"
                : "Request Book"}
          </Text>
        </TouchableOpacity>

        <View style={styles.reviewsSection}>
          <Text style={styles.reviewsTitle}>Book Reviews</Text>

          <View style={styles.ratingSummary}>
            <Text style={styles.ratingNumber}>
              ⭐ {averageRating.toFixed(1)} / 5
            </Text>

            <Text style={styles.ratingCount}>
              ({ratedReviews.length} reviews)
            </Text>
          </View>

          {reviews.length === 0 ? (
            <Text style={styles.noReviews}>No reviews yet.</Text>
          ) : (
            reviews.map((r) => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewName}>
                    {r.userName || "Anonymous"}
                  </Text>

                  <Text style={styles.reviewStars}>
                    {"⭐".repeat(r.rating || 0)}
                  </Text>
                </View>

                <Text style={styles.reviewComment}>{r.comment || r.text}</Text>
              </View>
            ))
          )}

          <View style={styles.reviewForm}>
            <View style={styles.inputStars}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                  <Text style={styles.inputStar}>
                    {s <= rating ? "★" : "☆"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

            <TextInput
              style={styles.textArea}
              placeholder="Write a review..."
              value={comment}
              onChangeText={setComment}
              multiline
            />

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.disabledBtn]}
              disabled={submitting}
              onPress={handleSubmitReview}
            >
              <Text style={styles.requestText}>
                {submitting ? "Submitting..." : "Submit Review"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f4f6f9",
    padding: 20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    elevation: 4,
    marginBottom: 40,
  },

  header: {
    position: "relative",
    marginBottom: 20,
  },

  ratingBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 20,
  },

  ratingBadgeText: {
    color: "#d2b2b5",
    fontSize: 13,
    fontWeight: "bold",
  },

  image: {
    width: 150,
    height: 200,
    borderRadius: 10,
  },

  favBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },

  heart: {
    fontSize: 20,
  },

  title: {
    fontSize: 22,
    color: "#2e5c88",
    marginBottom: 10,
    fontWeight: "bold",
    textAlign: "center",
  },

  info: {
    marginVertical: 4,
    color: "#555",
    fontSize: 14,
    textAlign: "center",
  },

  infoLabel: {
    fontWeight: "bold",
    color: "#333",
  },

  status: {
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 15,
  },

  borrowed: {
    color: "red",
  },

  available: {
    color: "green",
  },

  requestBtn: {
    backgroundColor: "#2e5c88",
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    width: "100%",
    alignItems: "center",
  },

  disabledBtn: {
    backgroundColor: "#aaa",
  },

  requestText: {
    color: "#fff",
    fontWeight: "bold",
  },

  reviewsSection: {
    marginTop: 28,
    width: "100%",
  },

  reviewsTitle: {
    fontSize: 18,
    color: "#2e5c88",
    marginBottom: 12,
    fontWeight: "bold",
  },

  ratingSummary: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },

  ratingNumber: {
    fontWeight: "bold",
    color: "#333",
  },

  ratingCount: {
    marginLeft: 6,
    color: "#777",
  },

  noReviews: {
    textAlign: "center",
    color: "#aaa",
    paddingVertical: 20,
  },

  reviewCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#e91e8c",
  },

  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  reviewName: {
    fontWeight: "bold",
    color: "#2e5c88",
  },

  reviewStars: {
    color: "#FFD700",
  },

  reviewComment: {
    color: "#555",
  },

  reviewForm: {
    marginTop: 20,
  },

  inputStars: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },

  inputStar: {
    fontSize: 28,
    color: "#FFD700",
    marginHorizontal: 2,
  },

  error: {
    color: "#ff4d4d",
    textAlign: "center",
    marginBottom: 8,
  },

  textArea: {
    width: "100%",
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 10,
    fontSize: 13,
    textAlignVertical: "top",
  },

  submitBtn: {
    backgroundColor: "#2e5c88",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});
