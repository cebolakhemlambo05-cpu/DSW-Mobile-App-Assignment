export function getPackingPlanKey(plan = []) {
  const stayPlan = (Array.isArray(plan) ? plan : []).filter(
    (entry) => entry.accommodation?.name
  );
  return stayPlan.map((entry) =>
    [
      entry.attractionId,
      entry.accommodation?.id || entry.accommodation?.name,
      entry.checkInDate,
      entry.stayNights,
    ].join(":")
  ).join("|") || "no-stays";
}

export function getGroupSpend(group) {
  const members = Array.isArray(group.members) && group.members.length
    ? group.members
    : ["Me"];
  const shares = Object.fromEntries(members.map((member) => [member, 0]));
  const total = (Array.isArray(group.expenses) ? group.expenses : []).reduce(
    (sum, expense) => {
      const amount = Number(expense.amount) || 0;
      const customAmounts = expense.customAmounts || {};
      const hasCustomAmounts = Object.keys(customAmounts).length > 0;
      const savedParticipants = Array.isArray(expense.splitMembers)
        ? expense.splitMembers.filter((member) => members.includes(member))
        : members;
      const participants = savedParticipants.length ? savedParticipants : members;
      participants.forEach((member) => {
        shares[member] += hasCustomAmounts
          ? Number(customAmounts[member]) || 0
          : amount / participants.length;
      });
      return sum + amount;
    },
    0
  );
  return { total, shares, memberCount: members.length };
}
