import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { auth } from "../components/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "expo-router";

export default function RootLayout() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return unsub;
  }, []);

  useEffect(() => {
    if (loading) return;

    if (user) {
      router.replace("/(tabs)");
    } else {
     router.replace("/");    }
  }, [user, loading]);

  if (loading) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}