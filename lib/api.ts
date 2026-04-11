export async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
}

export async function poster(url: string, { arg }: { arg: unknown }) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error("An error occurred while posting data.");
  return res.json();
}
