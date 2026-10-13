import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  Share,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/theme";
import { IconBack } from "../components/Icons";
import {
  deleteAdminUser,
  fetchAdminAuditEvents,
  fetchAdminHealth,
  fetchAdminUsers,
  updateAdminUser,
} from "../services/placesService";

export default function AdminScreen({ adminEmail, onBack }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [confirmingEmail, setConfirmingEmail] = useState("");
  const [deletingEmail, setDeletingEmail] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [auditEvents, setAuditEvents] = useState([]);
  const [auditError, setAuditError] = useState("");
  const [systemHealth, setSystemHealth] = useState(null);
  const [healthError, setHealthError] = useState("");
  const [refreshedAt, setRefreshedAt] = useState(null);
  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [trendDays, setTrendDays] = useState(7);
  const { width } = useWindowDimensions();
  const compactSidebar = width < 700;

  const load = useCallback(async () => {
    setLoading(true);
    const [usersResult, auditResult, healthResult] = await Promise.allSettled([
      fetchAdminUsers(adminEmail),
      fetchAdminAuditEvents(adminEmail),
      fetchAdminHealth(adminEmail),
    ]);
    if (usersResult.status === "fulfilled") {
      setUsers(usersResult.value.users || []);
      setError("");
      setRefreshedAt(new Date());
    } else {
      setError(usersResult.reason.message || "Unable to load users.");
    }
    if (auditResult.status === "fulfilled") {
      setAuditEvents(auditResult.value.events || []);
      setAuditError("");
    } else {
      setAuditError(auditResult.reason.message || "Unable to load audit history.");
    }
    if (healthResult.status === "fulfilled") {
      setSystemHealth(healthResult.value);
      setHealthError("");
    } else {
      const apiReachable = Boolean(healthResult.reason.status);
      setSystemHealth({
        api: apiReachable ? "online" : "offline",
        database: healthResult.reason.status === 503 ? "offline" : "unknown",
        checkedAt: new Date().toISOString(),
      });
      setHealthError(healthResult.reason.message || "Firestore health check failed.");
    }
    setLoading(false);
  }, [adminEmail]);

  useEffect(() => {
    load();
  }, [load]);

  const activitySummary = useMemo(() => {
    const plans = users.flatMap((user) =>
      (user.dayPlan || []).map((entry) => ({ ...entry, user }))
    );
    const activityCounts = new Map();
    const recentItems = [];

    plans.forEach((entry) => {
      (entry.activities || []).forEach((activity) => {
        const name = activity.name || "Unnamed activity";
        activityCounts.set(name, (activityCounts.get(name) || 0) + 1);
        recentItems.push({
          id: `${entry.user.email}-${entry.attractionId}-${activity.id || name}`,
          kind: "Activity",
          name,
          destination: entry.attractionName || "Unknown destination",
          user: entry.user,
        });
      });
      if (entry.accommodation?.name) {
        recentItems.push({
          id: `${entry.user.email}-${entry.attractionId}-stay`,
          kind: "Stay",
          name: entry.accommodation.name,
          destination: entry.attractionName || "Unknown destination",
          user: entry.user,
        });
      }
      if (!(entry.activities || []).length && !entry.accommodation?.name) {
        recentItems.push({
          id: `${entry.user.email}-${entry.attractionId}`,
          kind: "Destination",
          name: entry.attractionName || "Saved destination",
          destination: entry.attractionName || "Unknown destination",
          user: entry.user,
        });
      }
    });

    const popularActivities = Array.from(activityCounts, ([name, count]) => ({
      name,
      count,
    }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, 5);

    return { plans, popularActivities, recentItems };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return users.filter((user) => {
      const matchesSearch = !query || [
        user.firstName,
        user.lastName,
        user.email,
      ].some((value) => String(value || "").toLowerCase().includes(query));
      const planCount = (user.dayPlan || []).length;
      const matchesFilter =
        userFilter === "all" ||
        (userFilter === "with-plans" && planCount > 0) ||
        (userFilter === "without-plans" && planCount === 0) ||
        (userFilter === "recent" &&
          user.createdAt &&
          new Date(user.createdAt).getTime() >= cutoff);
      return matchesSearch && matchesFilter;
    });
  }, [users, search, userFilter]);

  const dailyTrends = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    for (let offset = trendDays - 1; offset >= 0; offset -= 1) {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() - offset);
      const key = date.toISOString().slice(0, 10);
      days.push({
        key,
        label: date.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" }),
        registrations: users.filter((user) => user.createdAt?.slice(0, 10) === key).length,
        planChanges: auditEvents.filter((event) =>
          event.action === "plan.saved" && event.occurredAt?.slice(0, 10) === key
        ).length,
      });
    }
    return days;
  }, [users, auditEvents, trendDays]);

  const exportUsers = async () => {
    const columns = [
      ["firstName", "First name"],
      ["lastName", "Last name"],
      ["email", "Email"],
      ["nationality", "Nationality"],
      ["createdAt", "Joined"],
      ["savedDestinations", "Saved destinations"],
    ];
    const escapeCsv = (value) => {
      let text = String(value ?? "");
      if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
      return `"${text.replace(/"/g, '""')}"`;
    };
    const rows = [
      columns.map(([, label]) => escapeCsv(label)).join(","),
      ...filteredUsers.map((user) =>
        columns.map(([key]) =>
          escapeCsv(key === "savedDestinations"
            ? (user.dayPlan || []).length
            : user[key])
        ).join(",")
      ),
    ];
    const csv = rows.join("\r\n");
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "planner-users.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }
    await Share.share({ title: "Planner users export", message: csv });
  };

  const remove = async (user) => {
    setDeletingEmail(user.email);
    setError("");
    try {
      await deleteAdminUser(adminEmail, user.email);
      setUsers((currentUsers) =>
        currentUsers.filter((entry) => entry.email !== user.email)
      );
      setConfirmingEmail("");
    } catch (requestError) {
      setError(requestError.message || "Unable to delete this user.");
    } finally {
      setDeletingEmail("");
    }
  };

  const save = async () => {
    if (!editing) return;
    setError("");
    try {
      await updateAdminUser(adminEmail, editing.email, editing);
      setEditing(null);
      await load();
    } catch (requestError) {
      setError(requestError.message || "Unable to save this user.");
    }
  };

  const sidebarItem = (section, label, icon) => (
    <Pressable
      key={section}
      accessibilityRole="button"
      accessibilityState={{ selected: activeSection === section }}
      onPress={() => setActiveSection(section)}
      style={[
        styles.navItem,
        activeSection === section && styles.navItemActive,
        compactSidebar && styles.navItemCompact,
      ]}
    >
      <Text
        style={[
          styles.navIcon,
          activeSection === section && styles.navTextActive,
        ]}
      >
        {icon}
      </Text>
      {!compactSidebar && (
        <Text
          style={[
            styles.navLabel,
            activeSection === section && styles.navTextActive,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <SafeAreaView
        edges={["top", "bottom"]}
        style={[
          styles.sidebar,
          compactSidebar ? styles.sidebarCompact : styles.sidebarWide,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Exit admin dashboard"
          onPress={onBack}
          style={styles.back}
        >
          <IconBack color={colors.sand} />
        </Pressable>
        {!compactSidebar && (
          <>
            <Text style={styles.brand}>ALL-IN-ONE</Text>
            <Text style={styles.sidebarCaption}>ADMIN CONSOLE</Text>
          </>
        )}
        <View style={styles.navigation}>
          {sidebarItem("dashboard", "Dashboard", "D")}
          {sidebarItem("users", "Configure users", "U")}
          {sidebarItem("audit", "Audit log", "L")}
          {sidebarItem("system", "System status", "S")}
        </View>
        <View style={styles.sidebarFooter}>
          {!compactSidebar && (
            <>
              <Text style={styles.sidebarCaption}>SIGNED IN AS</Text>
              <Text numberOfLines={2} style={styles.adminEmail}>
                {adminEmail}
              </Text>
            </>
          )}
        </View>
      </SafeAreaView>

      <View style={styles.main}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.eyebrow}>Administration</Text>
            <Text style={styles.title}>
              {{
                dashboard: "Activity dashboard",
                users: "User directory",
                audit: "Audit log",
                system: "System status",
              }[activeSection]}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={load}
            disabled={loading}
            style={styles.refreshButton}
          >
            <Text style={styles.refreshText}>{loading ? "Loading..." : "Refresh"}</Text>
          </Pressable>
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        {activeSection === "dashboard" ? (
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.intro}>
              Overview of registered accounts and saved itinerary activity. Activity below
              reflects users’ current day plans, not live screen-session tracking.
            </Text>
            <View style={styles.statusStrip}>
              <Text style={styles.statusText}>
                API: {systemHealth?.api || "checking"} · Firestore: {systemHealth?.database || "checking"}
              </Text>
              <Text style={styles.statusMeta}>
                {refreshedAt ? `Users refreshed ${refreshedAt.toLocaleTimeString()}` : "Checking status…"}
              </Text>
            </View>

            <View style={styles.metrics}>
              <Metric label="Registered users" value={users.length} />
              <Metric label="Saved destinations" value={activitySummary.plans.length} />
              <Metric
                label="Planned activities"
                value={activitySummary.plans.reduce(
                  (total, plan) => total + (plan.activities || []).length,
                  0
                )}
              />
              <Metric
                label="Popular activity"
                value={activitySummary.popularActivities[0]?.name || "—"}
                compact
              />
            </View>

            <View style={styles.dashboardColumns}>
              <View style={[styles.panel, styles.activityPanel]}>
                <Text style={styles.panelTitle}>Saved app activity</Text>
                <Text style={styles.panelSubtitle}>
                  Current itinerary selections from registered users
                </Text>
                {activitySummary.recentItems.length === 0 ? (
                  <Text style={styles.emptyText}>
                    No saved itinerary activities yet.
                  </Text>
                ) : (
                  activitySummary.recentItems.map((item) => (
                    <View key={item.id} style={styles.activityRow}>
                      <View style={styles.activityMark}>
                        <Text style={styles.activityMarkText}>
                          {item.kind === "Activity" ? "A" : item.kind === "Stay" ? "S" : "D"}
                        </Text>
                      </View>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityName}>{item.name}</Text>
                        <Text style={styles.activityMeta}>
                          {item.kind} · {item.destination}
                        </Text>
                        <Text style={styles.activityMeta}>
                          Planned by {item.user.firstName} {item.user.lastName} ({item.user.email})
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>

              <View style={[styles.panel, styles.popularPanel]}>
                <Text style={styles.panelTitle}>Popular activities</Text>
                <Text style={styles.panelSubtitle}>Most frequently added to day plans</Text>
                {activitySummary.popularActivities.length === 0 ? (
                  <Text style={styles.emptyText}>No planned activities to rank yet.</Text>
                ) : (
                  activitySummary.popularActivities.map((activity, index) => (
                    <View key={activity.name} style={styles.popularRow}>
                      <Text style={styles.rank}>{String(index + 1).padStart(2, "0")}</Text>
                      <Text style={styles.popularName}>{activity.name}</Text>
                      <Text style={styles.popularCount}>{activity.count}</Text>
                    </View>
                  ))
                )}
              </View>
            </View>

            <View style={styles.panel}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.panelTitle}>Usage trends</Text>
                  <Text style={styles.panelSubtitle}>New accounts and saved-plan updates</Text>
                </View>
                <View style={styles.actions}>
                  {[7, 30].map((days) => (
                    <Pressable
                      key={days}
                      onPress={() => setTrendDays(days)}
                      style={[styles.filterButton, trendDays === days && styles.filterButtonActive]}
                    >
                      <Text style={[styles.filterText, trendDays === days && styles.filterTextActive]}>
                        {days} days
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <Text style={styles.trendNote}>
                Plan activity history begins when audit tracking was enabled; earlier plan edits are not available.
              </Text>
              {dailyTrends.map((day) => {
                const maxValue = Math.max(
                  1,
                  ...dailyTrends.map((item) => Math.max(item.registrations, item.planChanges))
                );
                return (
                  <View key={day.key} style={styles.trendRow}>
                    <Text style={styles.trendDate}>{day.label}</Text>
                    <View style={styles.trendBars}>
                      <View style={styles.trendBarTrack}>
                        <View style={[styles.trendBar, styles.registrationBar, { width: `${(day.registrations / maxValue) * 100}%` }]} />
                      </View>
                      <View style={styles.trendBarTrack}>
                        <View style={[styles.trendBar, styles.planBar, { width: `${(day.planChanges / maxValue) * 100}%` }]} />
                      </View>
                    </View>
                    <Text style={styles.trendValues}>{day.registrations} / {day.planChanges}</Text>
                  </View>
                );
              })}
              <Text style={styles.trendLegend}>● Sign-ups   ● Plan updates</Text>
            </View>

            <View style={styles.panel}>
              <View style={styles.sectionHeader}>
                <Text style={styles.panelTitle}>Recent account changes</Text>
                <Pressable onPress={() => setActiveSection("audit")}>
                  <Text style={styles.linkText}>View audit log</Text>
                </Pressable>
              </View>
              <Text style={styles.panelSubtitle}>Most recent account and itinerary events</Text>
              {auditError ? (
                <Text style={styles.error}>{auditError}</Text>
              ) : auditEvents.length === 0 ? (
                <Text style={styles.emptyText}>No recorded changes yet.</Text>
              ) : auditEvents.slice(0, 8).map((event) => (
                <View key={event.id} style={styles.auditRow}>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityName}>{formatAuditAction(event.action)}</Text>
                    <Text style={styles.activityMeta}>
                      {event.actorEmail}{event.targetEmail && event.targetEmail !== event.actorEmail ? ` → ${event.targetEmail}` : ""}
                    </Text>
                  </View>
                  <Text style={styles.auditTime}>{formatDateTime(event.occurredAt)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Recently registered users</Text>
              {users
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.createdAt || 0).getTime() -
                    new Date(a.createdAt || 0).getTime()
                )
                .slice(0, 5)
                .map((user) => (
                  <View key={user.email} style={styles.userRow}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>
                        {(user.firstName || user.email || "?").slice(0, 1).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityName}>
                        {user.firstName} {user.lastName}
                      </Text>
                      <Text style={styles.activityMeta}>
                        {user.email} · {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Join date unavailable"}
                      </Text>
                    </View>
                    <Text style={styles.planCount}>{(user.dayPlan || []).length} plans</Text>
                  </View>
                ))}
              {users.length === 0 && !loading && (
                <Text style={styles.emptyText}>No registered users found.</Text>
              )}
            </View>
          </ScrollView>
        ) : activeSection === "audit" ? (
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.intro}>
              The latest 100 account and plan-change events. Event records avoid passwords, profile photos, and itinerary contents.
            </Text>
            {auditError ? (
              <View style={styles.panel}><Text style={styles.error}>{auditError}</Text></View>
            ) : auditEvents.length === 0 ? (
              <View style={styles.panel}>
                <Text style={styles.emptyText}>No recorded changes yet. New events appear as users register, update profiles, or save plans.</Text>
              </View>
            ) : auditEvents.slice(0, 100).map((event) => (
              <View key={event.id} style={styles.panel}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.activityName}>{formatAuditAction(event.action)}</Text>
                  <Text style={styles.auditTime}>{formatDateTime(event.occurredAt)}</Text>
                </View>
                <Text style={styles.detail}>Actor: {event.actorEmail || "Unknown"}</Text>
                {event.targetEmail && <Text style={styles.detail}>Account: {event.targetEmail}</Text>}
                {event.metadata?.destinationCount !== undefined && (
                  <Text style={styles.detail}>Saved destinations after update: {event.metadata.destinationCount}</Text>
                )}
                {event.metadata?.profilePhotoChanged && (
                  <Text style={styles.detail}>Profile picture updated</Text>
                )}
              </View>
            ))}
          </ScrollView>
        ) : activeSection === "system" ? (
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.intro}>
              Current reachability check for the planner API and its Firestore data store.
            </Text>
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Service health</Text>
              <StatusRow label="Planner API" value={systemHealth?.api || "unknown"} />
              <StatusRow label="Firestore database" value={systemHealth?.database || "unknown"} />
              <Text style={styles.detail}>
                Last checked: {systemHealth?.checkedAt ? formatDateTime(systemHealth.checkedAt) : "Not checked"}
              </Text>
              {healthError ? <Text style={styles.error}>{healthError}</Text> : null}
              <Text style={styles.detail}>
                User list last refreshed: {refreshedAt ? formatDateTime(refreshedAt) : "Not refreshed"}
              </Text>
              <Pressable onPress={load} disabled={loading} style={styles.primary}>
                <Text style={styles.primaryText}>{loading ? "Checking..." : "Check again"}</Text>
              </Pressable>
            </View>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.intro}>
              Search and filter accounts. Export includes only names, emails, nationality, join date, and saved-destination counts.
            </Text>
            <View style={styles.directoryTools}>
              <TextInput
                value={search}
                onChangeText={setSearch}
                style={[styles.input, styles.searchInput]}
                placeholder="Search name or email"
                accessibilityLabel="Search users by name or email"
              />
              <Pressable onPress={exportUsers} style={styles.secondary}>
                <Text style={styles.secondaryText}>Export CSV ({filteredUsers.length})</Text>
              </Pressable>
            </View>
            <View style={styles.actions}>
              {[
                ["all", "All"],
                ["with-plans", "Has plans"],
                ["without-plans", "No plans"],
                ["recent", "Joined in 30 days"],
              ].map(([filter, label]) => (
                <Pressable
                  key={filter}
                  onPress={() => setUserFilter(filter)}
                  style={[styles.filterButton, userFilter === filter && styles.filterButtonActive]}
                >
                  <Text style={[styles.filterText, userFilter === filter && styles.filterTextActive]}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {filteredUsers.map((user) =>
              editing?.email === user.email ? (
                <View key={user.email} style={styles.panel}>
                  <Text style={styles.activityName}>{user.email}</Text>
                  <TextInput
                    value={editing.firstName}
                    onChangeText={(value) =>
                      setEditing({ ...editing, firstName: value })
                    }
                    style={styles.input}
                    placeholder="First name"
                  />
                  <TextInput
                    value={editing.lastName}
                    onChangeText={(value) =>
                      setEditing({ ...editing, lastName: value })
                    }
                    style={styles.input}
                    placeholder="Surname"
                  />
                  <TextInput
                    value={editing.nationality}
                    onChangeText={(value) =>
                      setEditing({ ...editing, nationality: value })
                    }
                    returnKeyType="go"
                    onSubmitEditing={save}
                    style={styles.input}
                    placeholder="Nationality"
                  />
                  <View style={styles.actions}>
                    <Pressable onPress={save} style={styles.primary}>
                      <Text style={styles.primaryText}>Save changes</Text>
                    </Pressable>
                    <Pressable onPress={() => setEditing(null)} style={styles.cancel}>
                      <Text>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View key={user.email} style={styles.panel}>
                  <View style={styles.userRow}>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityName}>
                        {user.firstName} {user.lastName}
                      </Text>
                      <Text style={styles.activityMeta}>{user.email}</Text>
                    </View>
                    <Text style={styles.planCount}>
                      {(user.dayPlan || []).length} saved plans
                    </Text>
                  </View>
                  <Text style={styles.detail}>Nationality: {user.nationality || "Not provided"}</Text>
                  <Text style={styles.detail}>
                    Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                  </Text>
                  <Text style={styles.sectionLabel}>Day plan</Text>
                  {(user.dayPlan || []).length === 0 ? (
                    <Text style={styles.detail}>No saved items.</Text>
                  ) : (
                    user.dayPlan.map((entry) => (
                      <View
                        key={entry.attractionId}
                        style={styles.planEntry}
                      >
                        <Text style={styles.activityName}>
                          {entry.attractionName || entry.attractionId}
                        </Text>
                        <Text style={styles.activityMeta}>
                          {(entry.activities || []).map((item) => item.name).filter(Boolean).join(" · ") ||
                            entry.accommodation?.name ||
                            "Destination saved"}
                        </Text>
                      </View>
                    ))
                  )}
                  <View style={styles.actions}>
                    <Pressable
                      onPress={() => setEditing({ ...user })}
                      style={styles.secondary}
                    >
                      <Text style={styles.secondaryText}>Edit user</Text>
                    </Pressable>
                    {confirmingEmail === user.email ? (
                      <View style={styles.confirmActions}>
                        <Text style={styles.confirmText}>
                          Delete user and all saved data?
                        </Text>
                        <Pressable
                          onPress={() => remove(user)}
                          disabled={deletingEmail === user.email}
                          style={styles.delete}
                        >
                          <Text style={styles.deleteText}>
                            {deletingEmail === user.email ? "Deleting..." : "Confirm delete"}
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => setConfirmingEmail("")}
                          disabled={Boolean(deletingEmail)}
                          style={styles.cancel}
                        >
                          <Text>Cancel</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => setConfirmingEmail(user.email)}
                        style={styles.delete}
                      >
                        <Text style={styles.deleteText}>Delete</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              )
            )}
            {filteredUsers.length === 0 && !loading && (
              <View style={styles.panel}>
                <Text style={styles.emptyText}>
                  {users.length ? "No users match this search and filter." : "No registered users found."}
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

function Metric({ label, value, compact = false }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text
        numberOfLines={compact ? 2 : 1}
        style={[styles.metricValue, compact && styles.metricValueCompact]}
      >
        {value}
      </Text>
    </View>
  );
}

function formatAuditAction(action = "") {
  const labels = {
    "account.registered": "Account registered",
    "account.deleted": "Account deleted",
    "profile.updated": "Profile updated",
    "plan.saved": "Day plan saved",
    "admin.user.updated": "Admin updated account",
    "admin.user.deleted": "Admin deleted account",
  };
  return labels[action] || String(action).replace(/[._]/g, " ");
}

function formatDateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString();
}

function StatusRow({ label, value }) {
  const online = value === "online";
  return (
    <View style={styles.statusRow}>
      <Text style={styles.detail}>{label}</Text>
      <Text style={[styles.statusValue, online ? styles.statusOnline : styles.statusOffline]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, flexDirection: "row", backgroundColor: colors.sand },
  sidebar: {
    backgroundColor: colors.savanna,
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  sidebarWide: { width: 230 },
  sidebarCompact: { width: 68, alignItems: "center" },
  back: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  brand: { color: colors.ivory, fontFamily: fonts.display, fontSize: 16 },
  sidebarCaption: {
    color: "rgba(232,220,196,0.55)",
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    letterSpacing: 1.2,
    marginTop: 5,
  },
  navigation: { gap: 8, marginTop: 34, width: "100%" },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 46,
    gap: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  navItemCompact: { width: 46, justifyContent: "center", paddingHorizontal: 0 },
  navItemActive: { backgroundColor: "rgba(255,255,255,0.14)" },
  navIcon: {
    color: "rgba(232,220,196,0.7)",
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    width: 18,
    textAlign: "center",
  },
  navLabel: { color: "rgba(232,220,196,0.75)", fontFamily: fonts.bodySemiBold, fontSize: 12 },
  navTextActive: { color: colors.ivory },
  sidebarFooter: { flex: 1, justifyContent: "flex-end" },
  adminEmail: { color: colors.ivory, fontSize: 10, marginTop: 6, opacity: 0.8 },
  main: { flex: 1, minWidth: 0, backgroundColor: "#F4EFE5" },
  topBar: {
    minHeight: 104,
    backgroundColor: colors.ivory,
    paddingHorizontal: 24,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(62,50,38,0.08)",
  },
  eyebrow: {
    color: colors.sky,
    fontSize: 10,
    fontFamily: fonts.bodyBold,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  title: { color: colors.charcoal, fontFamily: fonts.display, fontSize: 24, marginTop: 4 },
  refreshButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.savanna,
  },
  refreshText: { color: colors.ivory, fontFamily: fonts.bodySemiBold, fontSize: 11 },
  content: { padding: 20, gap: 16, paddingBottom: 36 },
  intro: { color: colors.charcoal, opacity: 0.65, fontSize: 12, lineHeight: 18 },
  statusStrip: { backgroundColor: colors.ivory, borderRadius: 12, padding: 13, gap: 4 },
  statusText: { color: colors.savanna, fontFamily: fonts.bodySemiBold, fontSize: 12, textTransform: "capitalize" },
  statusMeta: { color: colors.charcoal, opacity: 0.55, fontSize: 10 },
  statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(62,50,38,0.07)" },
  statusValue: { fontFamily: fonts.bodyBold, fontSize: 11, textTransform: "capitalize" },
  statusOnline: { color: colors.savanna },
  statusOffline: { color: colors.terra },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metric: {
    flexGrow: 1,
    flexBasis: "22%",
    minWidth: 110,
    minHeight: 92,
    padding: 15,
    borderRadius: 14,
    backgroundColor: colors.ivory,
    justifyContent: "space-between",
  },
  metricLabel: { color: colors.charcoal, opacity: 0.56, fontSize: 10 },
  metricValue: { color: colors.savanna, fontFamily: fonts.display, fontSize: 24 },
  metricValueCompact: { fontSize: 15, lineHeight: 19, marginTop: 8 },
  dashboardColumns: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 14 },
  panel: { backgroundColor: colors.ivory, borderRadius: 15, padding: 16, gap: 10 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  linkText: { color: colors.sky, fontFamily: fonts.bodySemiBold, fontSize: 11 },
  trendNote: { color: colors.charcoal, opacity: 0.5, fontSize: 10, lineHeight: 15 },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 25 },
  trendDate: { width: 54, color: colors.charcoal, opacity: 0.65, fontSize: 9 },
  trendBars: { flex: 1, gap: 3 },
  trendBarTrack: { height: 5, backgroundColor: colors.sand, borderRadius: 4, overflow: "hidden" },
  trendBar: { height: "100%", minWidth: 0, borderRadius: 4 },
  registrationBar: { backgroundColor: colors.sky },
  planBar: { backgroundColor: colors.terra },
  trendValues: { width: 42, textAlign: "right", color: colors.charcoal, opacity: 0.7, fontSize: 9 },
  trendLegend: { color: colors.charcoal, opacity: 0.65, fontSize: 10, marginTop: 2 },
  auditRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 9, borderTopWidth: 1, borderTopColor: "rgba(62,50,38,0.07)" },
  auditTime: { color: colors.charcoal, opacity: 0.55, fontSize: 9 },
  directoryTools: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  searchInput: { flex: 1, minWidth: 190 },
  filterButton: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 18, backgroundColor: colors.ivory },
  filterButtonActive: { backgroundColor: colors.savanna },
  filterText: { color: colors.charcoal, fontFamily: fonts.bodySemiBold, fontSize: 10 },
  filterTextActive: { color: colors.ivory },
  activityPanel: { flex: 2, flexBasis: 310, minWidth: 240 },
  popularPanel: { flex: 1, flexBasis: 210, minWidth: 190 },
  panelTitle: { color: colors.charcoal, fontFamily: fonts.bodyBold, fontSize: 14 },
  panelSubtitle: { color: colors.charcoal, opacity: 0.52, fontSize: 10, marginTop: -6 },
  emptyText: { color: colors.charcoal, opacity: 0.55, fontSize: 12, paddingVertical: 10 },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: "rgba(62,50,38,0.07)",
  },
  activityMark: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: colors.sand,
    alignItems: "center",
    justifyContent: "center",
  },
  activityMarkText: { color: colors.savanna, fontFamily: fonts.bodyBold, fontSize: 12 },
  activityInfo: { flex: 1, minWidth: 0 },
  activityName: { color: colors.charcoal, fontFamily: fonts.bodySemiBold, fontSize: 12 },
  activityMeta: { color: colors.charcoal, opacity: 0.54, fontSize: 10, marginTop: 3 },
  popularRow: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(62,50,38,0.07)",
    gap: 10,
  },
  rank: { color: colors.sky, fontFamily: fonts.bodyBold, fontSize: 10 },
  popularName: { color: colors.charcoal, fontSize: 11, flex: 1 },
  popularCount: { color: colors.savanna, fontFamily: fonts.bodyBold, fontSize: 11 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 8 },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.sand,
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: { color: colors.savanna, fontFamily: fonts.bodyBold },
  planCount: { color: colors.sky, fontFamily: fonts.bodySemiBold, fontSize: 10 },
  detail: { fontSize: 11, color: colors.charcoal, opacity: 0.68 },
  sectionLabel: {
    color: colors.savanna,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    textTransform: "uppercase",
    marginTop: 4,
  },
  planEntry: { borderLeftWidth: 2, borderLeftColor: colors.sky, paddingLeft: 10, paddingVertical: 4 },
  actions: { flexDirection: "row", gap: 8, marginTop: 6, alignItems: "center", flexWrap: "wrap" },
  confirmActions: { flex: 1, gap: 4 },
  confirmText: { color: colors.terra, fontSize: 11, fontFamily: fonts.bodySemiBold },
  primary: { backgroundColor: colors.terra, padding: 11, borderRadius: 10, alignItems: "center", minWidth: 110 },
  primaryText: { color: colors.ivory, fontFamily: fonts.bodyBold, fontSize: 11 },
  secondary: { borderWidth: 1, borderColor: colors.savanna, padding: 10, borderRadius: 10, alignItems: "center" },
  secondaryText: { color: colors.savanna, fontFamily: fonts.bodySemiBold, fontSize: 11 },
  cancel: { padding: 11, alignItems: "center" },
  delete: { padding: 10, alignItems: "center" },
  deleteText: { color: colors.terra, fontFamily: fonts.bodySemiBold, fontSize: 11 },
  input: { backgroundColor: colors.sand, borderRadius: 10, padding: 11, color: colors.charcoal },
  error: { color: colors.terra, paddingHorizontal: 20, paddingTop: 10, fontSize: 12 },
});
