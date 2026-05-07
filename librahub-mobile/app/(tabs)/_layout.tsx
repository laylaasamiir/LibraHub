import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Text, View, StyleSheet } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { auth, db } from "@/components/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initial, setInitial] = useState<string>("");
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAvatarUrl(null);
        setInitial("");
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        const data = snap.data();
        setAvatarUrl(data.avatarUrl || null);
        const nameOrEmail = data.name || user.email || "U";
        setInitial(nameOrEmail.charAt(0).toUpperCase());
      } else {
        setAvatarUrl(null);
        setInitial((user.email || "U").charAt(0).toUpperCase());
      }
    });

    return unsub;
  }, []);

  useEffect(() => {
    let unsubBorrow: any;
    let unsubDue: any;

    let borrowCount = 0;
    let dueCount = 0;

    const update = () => setUnreadAlerts(borrowCount + dueCount);

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setUnreadAlerts(0);
        return;
      }

      const borrowQ = query(
        collection(db, "borrowRequests"),
        where("studentId", "==", user.uid),
        where("seenByUser", "==", false),
      );

      unsubBorrow = onSnapshot(borrowQ, (snap) => {
        borrowCount = snap.docs.filter((d) => {
          const s = d.data().status;
          return s === "approved" || s === "rejected";
        }).length;
        update();
      });

      const dueQ = query(
        collection(db, "notifications"),
        where("studentId", "==", user.uid),
        where("seenByUser", "==", false),
      );

      unsubDue = onSnapshot(dueQ, (snap) => {
        dueCount = snap.size;
        update();
      });
    });

    return () => {
      unsubAuth();
      if (unsubBorrow) unsubBorrow();
      if (unsubDue) unsubDue();
    };
  }, []);

  const tint = Colors[colorScheme ?? "light"].tint;

  const ProfileIcon = () => {
    if (avatarUrl) {
      return <Image source={{ uri: avatarUrl }} style={styles.avatarIcon} />;
    }

    if (initial) {
      return (
        <View style={[styles.initialIcon, { borderColor: tint }]}>
          <Text style={[styles.initialText, { color: tint }]}>{initial}</Text>
        </View>
      );
    }

    return <IconSymbol size={28} name="person.fill" color={tint} />;
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="heart.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="reviews"
        options={{
          title: "Reviews",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="star.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color }) => (
            <View>
              <IconSymbol size={28} name="bell.fill" color={color} />
              {unreadAlerts > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadAlerts > 99 ? "99+" : unreadAlerts}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <ProfileIcon key={avatarUrl || initial || "default"} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  avatarIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  initialIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  initialText: {
    fontSize: 14,
    fontWeight: "800",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "#ef4444",
    borderRadius: 999,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});
