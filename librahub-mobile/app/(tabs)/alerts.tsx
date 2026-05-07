import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  doc,
  updateDoc,
  writeBatch,
  getDocs,
  addDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "@/components/firebase";

type AlertItem = {
  id: string;
  bookTitle?: string;
  status?: string;
  requestedAt?: any;
  seenByUser?: boolean;
  dueDate?: string;
  type?: string;
};

export function useAlertBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let unsubSnapshot: any;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setUnreadCount(0);
        return;
      }

      const q = query(
        collection(db, "notifications"),
        where("studentId", "==", user.uid),
        where("seenByUser", "==", false),
      );

      unsubSnapshot = onSnapshot(q, (snap) => {
        setUnreadCount(snap.size);
      });
    });

    return () => {
      unsubAuth();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, []);

  return unreadCount;
}

async function checkDueReminders(userId: string) {
  try {
    const settingsSnap = await getDoc(doc(db, "settings", "libraryConfig"));
    const borrowDuration = settingsSnap.exists()
      ? settingsSnap.data().borrowDuration || 7
      : 7;

    const loansSnap = await getDocs(
      query(
        collection(db, "borrowedBooks"),
        where("studentId", "==", userId),
        where("status", "==", "borrowed"),
      ),
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const loanDoc of loansSnap.docs) {
      const loan = loanDoc.data();
      if (!loan.borrowedAt?.toDate) continue;

      const borrowDate = loan.borrowedAt.toDate();
      const dueDate = new Date(borrowDate);
      dueDate.setDate(borrowDate.getDate() + Number(borrowDuration));
      dueDate.setHours(0, 0, 0, 0);

      const diffMs = dueDate.getTime() - today.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        const existingSnap = await getDocs(
          query(
            collection(db, "notifications"),
            where("studentId", "==", userId),
            where("loanId", "==", loanDoc.id),
            where("type", "==", "due_reminder"),
          ),
        );

        if (existingSnap.empty) {
          await addDoc(collection(db, "notifications"), {
            studentId: userId,
            bookTitle: loan.bookTitle || "Unknown Book",
            loanId: loanDoc.id,
            type: "due_reminder",
            dueDate: dueDate.toLocaleDateString(),
            seenByUser: false,
            createdAt: serverTimestamp(),
          });
        }
      }
    }
  } catch (e) {
    console.error("checkDueReminders error:", e);
  }
}

export default function AlertsScreen() {
  const [borrowAlerts, setBorrowAlerts] = useState<AlertItem[]>([]);
  const [duealerts, setDueAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  const borrowUnreadRef = useRef<string[]>([]);
  const dueUnreadRef = useRef<string[]>([]);

  useEffect(() => {
    let unsubBorrow: any;
    let unsubDue: any;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setBorrowAlerts([]);
        setDueAlerts([]);
        setLoading(false);
        return;
      }

      checkDueReminders(user.uid);

      const borrowQ = query(
        collection(db, "borrowRequests"),
        where("studentId", "==", user.uid),
        orderBy("requestedAt", "desc"),
      );

      unsubBorrow = onSnapshot(
        borrowQ,
        (snap) => {
          const data = snap.docs.map((d) => ({
            id: d.id,
            type: "borrow_request",
            ...d.data(),
          })) as AlertItem[];

          borrowUnreadRef.current = snap.docs
            .filter((d) => {
              const s = d.data().status;
              return (
                (s === "approved" || s === "rejected") &&
                d.data().seenByUser === false
              );
            })
            .map((d) => d.id);

          setBorrowAlerts(data);
          setLoading(false);
        },
        (err) => {
          console.error(err);
          setLoading(false);
        },
      );

      const dueQ = query(
        collection(db, "notifications"),
        where("studentId", "==", user.uid),
        where("type", "==", "due_reminder"),
        orderBy("createdAt", "desc"),
      );

      unsubDue = onSnapshot(dueQ, (snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as AlertItem[];

        dueUnreadRef.current = snap.docs
          .filter((d) => d.data().seenByUser === false)
          .map((d) => d.id);

        setDueAlerts(data);
      });
    });

    return () => {
      unsubAuth();
      if (unsubBorrow) unsubBorrow();
      if (unsubDue) unsubDue();
    };
  }, []);

  const allAlerts: AlertItem[] = [
    ...duealerts.map((a) => ({ ...a, _sortDate: a.requestedAt || null })),
    ...borrowAlerts.map((a) => ({ ...a, _sortDate: a.requestedAt || null })),
  ];

  const markAllRead = async () => {
    const batch = writeBatch(db);

    borrowUnreadRef.current.forEach((id) => {
      batch.update(doc(db, "borrowRequests", id), { seenByUser: true });
    });

    dueUnreadRef.current.forEach((id) => {
      batch.update(doc(db, "notifications", id), { seenByUser: true });
    });

    await batch.commit();
  };

  const markOneRead = async (item: AlertItem) => {
    if (item.seenByUser) return;

    if (item.type === "due_reminder") {
      await updateDoc(doc(db, "notifications", item.id), { seenByUser: true });
    } else {
      const s = item.status;
      if (s !== "approved" && s !== "rejected") return;
      await updateDoc(doc(db, "borrowRequests", item.id), { seenByUser: true });
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return "";
    return timestamp.toDate().toLocaleString();
  };

  const getBorderColor = (item: AlertItem) => {
    if (item.type === "due_reminder") return "#f59e0b";
    if (item.status === "approved") return "#22c55e";
    if (item.status === "rejected") return "#ef4444";
    return "#94a3b8";
  };

  const getStatusLabel = (item: AlertItem) => {
    if (item.type === "due_reminder") return "⏰ Due Tomorrow";
    if (item.status === "approved") return "approved";
    if (item.status === "rejected") return "rejected";
    return "pending";
  };

  const getStatusStyle = (item: AlertItem) => {
    if (item.type === "due_reminder") return styles.dueReminder;
    if (item.status === "approved") return styles.approved;
    if (item.status === "rejected") return styles.rejected;
    return styles.pending;
  };

  const getMessage = (item: AlertItem) => {
    const title = item.bookTitle || "this book";
    if (item.type === "due_reminder")
      return `⚠️ Reminder: "${title}" is due tomorrow (${item.dueDate}). Please return it on time to avoid fines.`;
    if (item.status === "approved")
      return `Your request for "${title}" has been approved ✅`;
    if (item.status === "rejected")
      return `Your request for "${title}" has been rejected ❌`;
    return `Your request for "${title}" is still pending ⏳`;
  };

  const isUnread = (item: AlertItem) => {
    if (item.type === "due_reminder") return item.seenByUser === false;
    return (
      item.seenByUser === false &&
      (item.status === "approved" || item.status === "rejected")
    );
  };

  const unreadCount =
    borrowUnreadRef.current.length + dueUnreadRef.current.length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2f68aa" />
        <Text style={styles.loadingText}>Loading alerts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Alerts 🔔</Text>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markBtn} onPress={markAllRead}>
            <Text style={styles.markBtnText}>
              Mark all read ({unreadCount})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {allAlerts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>No alerts yet</Text>
          <Text style={styles.emptyText}>
            Your borrow request updates and reminders will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={allAlerts}
          keyExtractor={(item) => item.id + (item.type || "")}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => {
            const unread = isUnread(item);

            return (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => markOneRead(item)}
              >
                <View
                  style={[
                    styles.card,
                    { borderLeftColor: getBorderColor(item) },
                    unread && styles.cardUnread,
                  ]}
                >
                  {unread && <View style={styles.unreadDot} />}

                  <View style={styles.row}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.bookTitle || "Book Request"}
                    </Text>
                    <Text style={[styles.statusBadge, getStatusStyle(item)]}>
                      {getStatusLabel(item)}
                    </Text>
                  </View>

                  <Text style={styles.message}>{getMessage(item)}</Text>

                  {item.type !== "due_reminder" && item.requestedAt && (
                    <Text style={styles.date}>
                      {formatDate(item.requestedAt)}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2f7",
    padding: 16,
    paddingTop: 50,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#2f68aa",
    fontWeight: "600",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#213448",
  },
  markBtn: {
    backgroundColor: "#2f68aa",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  markBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -60,
  },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#555",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingHorizontal: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    borderLeftWidth: 4,
    position: "relative",
  },
  cardUnread: { backgroundColor: "#f0f6ff" },
  unreadDot: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2f68aa",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#2f68aa",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    overflow: "hidden",
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  pending: { backgroundColor: "#fff3e0", color: "#ef6c00" },
  approved: { backgroundColor: "#e8f5e9", color: "#2e7d32" },
  rejected: { backgroundColor: "#ffebee", color: "#c62828" },
  dueReminder: { backgroundColor: "#fff8e1", color: "#b45309" },
  message: {
    color: "#444",
    marginTop: 10,
    lineHeight: 20,
    fontSize: 14,
  },
  date: { color: "#aaa", fontSize: 12, marginTop: 8 },
});
