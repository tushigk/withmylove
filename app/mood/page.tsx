"use client";

import MoodTracker from "@/components/MoodTracker";
import useSWR from "swr";

const USER_KEY = "couple-user";

export default function MoodPage() {
  const { data: user } = useSWR(USER_KEY);
  
  if (!user) return null;

  return <MoodTracker user={user} key={user} />;
}
