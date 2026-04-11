"use client";

import Journal from "@/components/Journal";
import useSWR from "swr";

const USER_KEY = "couple-user";

export default function JournalPage() {
  const { data: user } = useSWR(USER_KEY);
  
  if (!user) return null;

  return <Journal user={user} />;
}
