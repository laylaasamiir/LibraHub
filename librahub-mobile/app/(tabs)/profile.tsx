import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "@/components/firebase";

const CLOUDINARY_UPLOAD_PRESET = "Librahub";
const CLOUDINARY_CLOUD_NAME = "dmqwypcqm";

type UserData = {
  name?: string;
  email?: string;
  department?: string;
  level?: string;
  studentCode?: string;
  avatarUrl?: string;
};

type BorrowedBook = {
  id: string;
  bookTitle?: string;
  borrowedAt?: any;
  status?: string;
};

export default function ProfileScreen() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [books, setBooks] = useState<BorrowedBook[]>([]);
  const [totalBorrowedCount, setTotalBorrowedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [borrowDuration, setBorrowDuration] = useState(7);
  const [dailyFine, setDailyFine] = useState(30);

  const [editVisible, setEditVisible] = useState(false);
  const [resetVisible, setResetVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [editData, setEditData] = useState({
    name: "",
    department: "",
    level: "",
    studentCode: "",
  });

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const unsubscribeSettings = onSnapshot(
      doc(db, "settings", "libraryConfig"),
      (snap) => {
        if (snap.exists()) {
          setBorrowDuration(snap.data().borrowDuration || 7);
          setDailyFine(snap.data().dailyFine || 30);
        }
      },
    );

    return () => unsubscribeSettings();
  }, []);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setUserData(null);
        setBooks([]);
        setTotalBorrowedCount(0);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      try {
        const userSnap = await getDoc(doc(db, "users", currentUser.uid));

        if (userSnap.exists()) {
          const data = userSnap.data() as UserData;
          setUserData(data);

          setEditData({
            name: data.name || "",
            department: data.department || "",
            level: data.level || "",
            studentCode: data.studentCode || "",
          });

          if (data.studentCode) {
            const totalQuery = query(
              collection(db, "borrowedBooks"),
              where("studentCode", "==", data.studentCode),
            );

            const totalSnap = await getDocs(totalQuery);
            setTotalBorrowedCount(totalSnap.size);
          }
        }

        const activeLoansQuery = query(
          collection(db, "borrowedBooks"),
          where("studentId", "==", currentUser.uid),
          where("status", "==", "borrowed"),
          orderBy("borrowedAt", "desc"),
        );

        const unsubBooks = onSnapshot(activeLoansQuery, (snapshot) => {
          const data = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as BorrowedBook[];

          setBooks(data);
          setLoading(false);
        });

        return () => unsubBooks();
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  const uploadToCloudinary = async (uri: string) => {
    const formData = new FormData();

    formData.append("file", {
      uri,
      type: "image/jpeg",
      name: "profile.jpg",
    } as any);

    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await res.json();

    if (!data.secure_url) {
      throw new Error("Cloudinary upload failed");
    }

    return data.secure_url;
  };

  const savePhoto = async (uri: string) => {
    if (!user) return;

    try {
      setUploading(true);

      const imageUrl = await uploadToCloudinary(uri);

      await updateDoc(doc(db, "users", user.uid), {
        avatarUrl: imageUrl,
      });

      setUserData((prev) => ({
        ...prev,
        avatarUrl: imageUrl,
      }));

      Alert.alert("Success", "Profile photo updated.");
    } catch (error: any) {
      Alert.alert("Upload Failed", error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleChangePhoto = async () => {
    if (!user) return;

    Alert.alert("Change Photo", "Choose image source", [
      {
        text: "Camera",
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();

          if (!permission.granted) {
            Alert.alert(
              "Permission Required",
              "Camera permission is required.",
            );
            return;
          }

          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });

          if (!result.canceled) {
            await savePhoto(result.assets[0].uri);
          }
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

          if (!permission.granted) {
            Alert.alert(
              "Permission Required",
              "Gallery permission is required.",
            );
            return;
          }

          const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });

          if (!result.canceled) {
            await savePhoto(result.assets[0].uri);
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const calculateFine = (borrowedAt: any) => {
    if (!borrowedAt?.toDate) return { dueDate: "N/A", fine: 0 };

    const borrowDate = borrowedAt.toDate();
    const dueDate = new Date(borrowDate);

    dueDate.setDate(borrowDate.getDate() + Number(borrowDuration));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    if (today > dueDate) {
      const diffTime = Math.abs(today.getTime() - dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        dueDate: dueDate.toLocaleDateString(),
        fine: diffDays * Number(dailyFine),
      };
    }

    return {
      dueDate: dueDate.toLocaleDateString(),
      fine: 0,
    };
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return "Waiting...";
    return timestamp.toDate().toLocaleDateString();
  };

  const handleSaveEdit = async () => {
    if (!user) return;

    if (!editData.name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.uid), editData);

      setUserData((prev) => ({
        ...prev,
        ...editData,
      }));

      setEditVisible(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) return;

    try {
      await sendPasswordResetEmail(auth, user.email);
      Alert.alert("Success", `Password reset email sent to ${user.email}`);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.email || !auth.currentUser) return;

    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters.");
      return;
    }

    try {
      setPasswordLoading(true);

      const credential = EmailAuthProvider.credential(user.email, oldPassword);

      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setResetVisible(false);

      Alert.alert("Success", "Password updated successfully.");
    } catch (error: any) {
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        Alert.alert("Error", "Old password is incorrect.");
      } else if (error.code === "auth/too-many-requests") {
        Alert.alert("Error", "Too many attempts. Please try again later.");
      } else {
        Alert.alert("Error", error.message);
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await signOut(auth);
          router.replace("/");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2f68aa" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.guestContainer}>
        <View style={styles.guestCard}>
          <Text style={styles.guestIcon}>📚</Text>
          <Text style={styles.guestTitle}>Welcome to LibraHub</Text>
          <Text style={styles.guestText}>
            It appears you are not logged in. Please log in to access your
            borrowed books and our full range of services.
          </Text>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginBtnText}>Login Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <View style={styles.headerBand} />

        <TouchableOpacity
          style={styles.avatar}
          onPress={handleChangePhoto}
          disabled={uploading}
        >
          {userData?.avatarUrl ? (
            <Image
              source={{ uri: userData.avatarUrl }}
              style={styles.avatarImg}
            />
          ) : (
            <Text style={styles.avatarText}>
              {(userData?.name || user.email || "S")[0].toUpperCase()}
            </Text>
          )}

          <View style={styles.cameraBadge}>
            <Text style={styles.cameraText}>{uploading ? "..." : "📷"}</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.name}>{userData?.name || "Student"}</Text>
        <Text style={styles.role}>STUDENT</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>🎓</Text>
            <Text style={styles.statValue}>{userData?.studentCode || "—"}</Text>
            <Text style={styles.statLabel}>STUDENT CODE</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statBox}>
            <Text style={styles.statIcon}>📚</Text>
            <Text style={styles.statValue}>{totalBorrowedCount}</Text>
            <Text style={styles.statLabel}>TOTAL BORROWED</Text>
          </View>
        </View>

        <View style={styles.table}>
          <InfoRow label="EMAIL" value={userData?.email || user.email} />
          <InfoRow label="DEPARTMENT" value={userData?.department || "N/A"} />
          <InfoRow label="LEVEL" value={userData?.level || "N/A"} />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setResetVisible(true)}
          >
            <Text style={styles.primaryBtnText}>🔒 Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => setEditVisible(true)}
          >
            <Text style={styles.outlineBtnText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Current Loans</Text>

        {books.length > 0 ? (
          books.map((item, index) => {
            const { dueDate, fine } = calculateFine(item.borrowedAt);

            return (
              <View key={item.id} style={styles.loanCard}>
                <Text style={styles.loanIndex}>#{index + 1}</Text>

                <Text style={styles.bookTitle}>
                  {item.bookTitle || "Untitled Book"}
                </Text>

                <View style={styles.loanRow}>
                  <Text style={styles.loanLabel}>Borrow Date</Text>
                  <Text style={styles.loanValue}>
                    {formatDate(item.borrowedAt)}
                  </Text>
                </View>

                <View style={styles.loanRow}>
                  <Text style={styles.loanLabel}>Due Date</Text>
                  <Text style={styles.loanValue}>{dueDate}</Text>
                </View>

                <View style={styles.loanRow}>
                  <Text style={styles.loanLabel}>Fine</Text>
                  <Text
                    style={[styles.loanValue, fine > 0 && styles.fineDanger]}
                  >
                    {fine} EGP
                  </Text>
                </View>

                <Text style={styles.statusBadge}>Borrowed</Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.noLoans}>No active borrowed books.</Text>
        )}
      </View>

      <Modal visible={editVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={editData.name}
              onChangeText={(text) => setEditData({ ...editData, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Department"
              value={editData.department}
              onChangeText={(text) =>
                setEditData({ ...editData, department: text })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Student Code"
              value={editData.studentCode}
              onChangeText={(text) =>
                setEditData({ ...editData, studentCode: text })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Level"
              value={editData.level}
              onChangeText={(text) => setEditData({ ...editData, level: text })}
            />

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleSaveEdit}
            >
              <Text style={styles.primaryBtnText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setEditVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={resetVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Old Password"
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={handleSendResetEmail}
            >
              <Text style={styles.forgotBtnText}>
                Forgot password? Send reset email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, passwordLoading && styles.disabledBtn]}
              onPress={handleChangePassword}
              disabled={passwordLoading}
            >
              <Text style={styles.primaryBtnText}>
                {passwordLoading ? "Saving..." : "Save Password"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setResetVisible(false);
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f4f7fa",
    padding: 16,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#547792",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(172,186,196,0.35)",
    elevation: 5,
  },

  headerBand: {
    height: 70,
    backgroundColor: "#2f68aa",
    borderRadius: 14,
    marginBottom: -35,
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#EAE0CF",
    borderWidth: 4,
    borderColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },

  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: 48,
  },

  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#213448",
  },

  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#2f68aa",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },

  cameraText: {
    color: "#ffffff",
    fontSize: 14,
  },

  name: {
    fontSize: 24,
    fontWeight: "800",
    color: "#213448",
    textAlign: "center",
    marginTop: 10,
  },

  role: {
    alignSelf: "center",
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 6,
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 18,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingVertical: 14,
  },

  statBox: {
    flex: 1,
    alignItems: "center",
  },

  statIcon: {
    fontSize: 22,
  },

  statValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#213448",
    marginTop: 4,
  },

  statLabel: {
    fontSize: 11,
    color: "#547792",
    marginTop: 4,
    fontWeight: "700",
  },

  divider: {
    width: 1,
    backgroundColor: "rgba(172,186,196,0.5)",
  },

  table: {
    borderWidth: 1,
    borderColor: "rgba(172,186,196,0.35)",
    borderRadius: 12,
    overflow: "hidden",
  },

  infoRow: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(172,186,196,0.28)",
  },

  infoLabel: {
    color: "#547792",
    fontWeight: "800",
    fontSize: 12,
    marginBottom: 4,
  },

  infoValue: {
    color: "#213448",
    fontSize: 16,
    fontWeight: "500",
  },

  actions: {
    marginTop: 16,
    gap: 10,
  },

  primaryBtn: {
    backgroundColor: "#B14B3B",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  primaryBtnText: {
    color: "#EAE0CF",
    fontWeight: "800",
  },

  outlineBtn: {
    borderWidth: 1,
    borderColor: "#B14B3B",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  outlineBtnText: {
    color: "#B14B3B",
    fontWeight: "800",
  },

  logoutBtn: {
    backgroundColor: "#e74c3c",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  logoutText: {
    color: "#ffffff",
    fontWeight: "800",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#213448",
    marginBottom: 14,
  },

  loanCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2f68aa",
  },

  loanIndex: {
    color: "#547792",
    fontWeight: "bold",
  },

  bookTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#213448",
    marginVertical: 8,
  },

  loanRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  loanLabel: {
    color: "#547792",
    fontWeight: "700",
  },

  loanValue: {
    color: "#213448",
    fontWeight: "600",
  },

  fineDanger: {
    color: "red",
    fontWeight: "bold",
  },

  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#fff3e0",
    color: "#ef6c00",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 8,
  },

  noLoans: {
    textAlign: "center",
    paddingVertical: 30,
    color: "#777",
  },

  guestContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f4f7fa",
  },

  guestCard: {
    backgroundColor: "#ffffff",
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    elevation: 5,
  },

  guestIcon: {
    fontSize: 50,
    marginBottom: 16,
  },

  guestTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#213448",
    marginBottom: 10,
  },

  guestText: {
    textAlign: "center",
    color: "#666",
    lineHeight: 22,
  },

  loginBtn: {
    backgroundColor: "#2196f3",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },

  loginBtnText: {
    color: "#ffffff",
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalBox: {
    backgroundColor: "#ffffff",
    width: "100%",
    maxWidth: 360,
    borderRadius: 16,
    padding: 24,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#213448",
    marginBottom: 14,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },

  forgotBtn: {
    marginBottom: 12,
    alignItems: "center",
  },

  forgotBtnText: {
    color: "#2f68aa",
    fontWeight: "700",
  },

  disabledBtn: {
    opacity: 0.7,
  },

  cancelText: {
    color: "#777",
    fontWeight: "700",
    textAlign: "center",
    marginTop: 14,
  },
});
