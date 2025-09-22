export async function listNotifications(since?: string) {
  const qs = new URLSearchParams();
  if (since) qs.set("since", since);
  return await fetch(`/api/notifications?${qs.toString()}`, {
    credentials: "include",
  }).then((r) => r.json());
}

export async function markNotificationRead(id: string) {
  return await fetch(`/api/notifications/${id}/read`, {
    method: "POST",
    credentials: "include",
  });
}

export async function markAllNotificationsRead() {
  return await fetch(`/api/notifications/read-all`, {
    method: "POST",
    credentials: "include",
  });
}
