import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { auth } from "../components/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

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

    const inLogin = segments[0] === "login";
    const inTabs = segments[0] === "(tabs)";

    if (!user && !inLogin) {
      router.replace("/login");
    } else if (user && !inTabs) {
      router.replace("/(tabs)");
    }
  }, [user, segments, loading]);

  if (loading) return null; 

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}