"use client";

import SurpriseMessage from "@/components/SurpriseMessage";
import useSWR from "swr";

const USER_KEY = "couple-user";

export default function LovePage() {
  const { data: user } = useSWR(USER_KEY);
  
  if (!user) return null;

  return <SurpriseMessage user={user} />;
}
