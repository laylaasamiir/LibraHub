import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { auth } from "../components/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return unsub;
  }, []);

  if (loading) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
