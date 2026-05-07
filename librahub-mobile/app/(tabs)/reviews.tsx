import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  getDocs,
  where,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/components/firebase";
import { useRouter } from "expo-router";

type Review = {
  id: string;
  text?: string;
  comment?: string;
  name?: string;
  userName?: string;
  userId?: string;
  rating?: number;
  bookTitle?: string;
  createdAt?: any;
};

export default function ReviewsScreen() {
  const router = useRouter();

  const [reviewText, setReviewText] = useState("");
  const [submittedReviews, setSubmittedReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const ratedReviews = submittedReviews.filter((r) => r.rating);

  const averageRating =
    ratedReviews.length > 0
      ? ratedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
        ratedReviews.length
      : 0;

  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Review[];

      setSubmittedReviews(data);
    });

    return unsubscribe;
  }, []);

  const handleSubmit = async () => {
    setErrorMsg("");

    if (!auth.currentUser) {
      Alert.alert("Login Required", "You must login first to write a review.", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => router.push("/login") },
      ]);
      return;
    }

    if (!reviewText.trim()) {
      setErrorMsg("Please write a review first.");
      return;
    }

    if (rating === 0) {
      setErrorMsg("Please add a rating before submitting.");
      return;
    }

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      const reviewData = {
        text: reviewText.trim(),
        rating,
        name: userData?.name || auth.currentUser.email || "Anonymous",
        userId: auth.currentUser.uid,
        updatedAt: serverTimestamp(),
      };

      const existingReviewQuery = query(
        collection(db, "reviews"),
        where("userId", "==", auth.currentUser.uid),
      );

      const existingReviewSnap = await getDocs(existingReviewQuery);

      if (!existingReviewSnap.empty) {
        const existingReviewDoc = existingReviewSnap.docs[0];

        Alert.alert(
          "Update Review?",
          "You already submitted a review. Do you want to update it?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Update",
              onPress: async () => {
                await updateDoc(
                  doc(db, "reviews", existingReviewDoc.id),
                  reviewData,
                );

                setReviewText("");
                setRating(0);
                setErrorMsg("");
              },
            },
          ],
        );

        return;
      }

      await addDoc(collection(db, "reviews"), {
        ...reviewData,
        createdAt: serverTimestamp(),
      });

      setReviewText("");
      setRating(0);
      setErrorMsg("");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>User Reviews</Text>

      <View style={styles.summary}>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Text key={s} style={styles.star}>
              {s <= Math.round(averageRating) ? "★" : "☆"}
            </Text>
          ))}
        </View>

        <Text style={styles.summaryText}>
          {averageRating ? averageRating.toFixed(1) : "0.0"} / 5 (
          {ratedReviews.length} 👥)
        </Text>
      </View>

      <ScrollView
        style={styles.reviewsList}
        showsVerticalScrollIndicator={false}
      >
        {submittedReviews.map((review) => (
          <View style={styles.reviewCard} key={review.id}>
            <View style={styles.reviewHeader}>
              <Text style={styles.userName}>
                {review.name || review.userName || "Anonymous"}
              </Text>

              {review.bookTitle && (
                <Text style={styles.bookBadge}>Book: {review.bookTitle}</Text>
              )}
            </View>

            <View style={styles.smallStarsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Text key={s} style={styles.smallStar}>
                  {s <= (review.rating || 0) ? "★" : "☆"}
                </Text>
              ))}
            </View>

            <Text style={styles.reviewText}>
              {review.comment || review.text}
            </Text>

            {review.createdAt && (
              <Text style={styles.date}>
                {review.createdAt.seconds
                  ? new Date(
                      review.createdAt.seconds * 1000,
                    ).toLocaleDateString()
                  : "Just now"}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.form}>
        <View style={styles.inputStars}>
          {[1, 2, 3, 4, 5].map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => {
                setRating(s);
                setErrorMsg("");
              }}
            >
              <Text style={styles.inputStar}>{s <= rating ? "★" : "☆"}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

        <TextInput
          style={styles.textArea}
          value={reviewText}
          onChangeText={(text) => {
            setReviewText(text);
            setErrorMsg("");
          }}
          placeholder="Write a review..."
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 50,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },

  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },

  starsRow: {
    flexDirection: "row",
  },

  star: {
    fontSize: 22,
    color: "#FFD700",
    marginRight: 2,
  },

  summaryText: {
    fontSize: 14,
    color: "#333",
  },

  reviewsList: {
    flex: 1,
    marginBottom: 10,
  },

  reviewCard: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2f68aa",
    elevation: 2,
  },

  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },

  userName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1f2937",
  },

  bookBadge: {
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    maxWidth: 150,
  },

  smallStarsRow: {
    flexDirection: "row",
    marginTop: 6,
  },

  smallStar: {
    fontSize: 16,
    color: "#FFD700",
    marginRight: 1,
  },

  reviewText: {
    fontSize: 14,
    color: "#333",
    marginTop: 8,
    lineHeight: 20,
  },

  date: {
    marginTop: 8,
    fontSize: 12,
    color: "#777",
  },

  form: {
    paddingBottom: 20,
    backgroundColor: "#fff",
  },

  inputStars: {
    flexDirection: "row",
    marginBottom: 8,
  },

  inputStar: {
    fontSize: 30,
    color: "#FFD700",
    marginRight: 4,
  },

  error: {
    color: "#ff4d4d",
    fontSize: 14,
    marginBottom: 8,
  },

  textArea: {
    width: "100%",
    height: 90,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: 14,
    marginBottom: 10,
    textAlignVertical: "top",
  },

  button: {
    width: "100%",
    padding: 12,
    backgroundColor: "#2f68aa",
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
