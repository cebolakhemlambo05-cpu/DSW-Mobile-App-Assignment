import React, { createContext, useContext, useState } from "react";

const DayPlanContext = createContext(null);

export function DayPlanProvider({ children }) {
  const [selectedStay, setSelectedStay] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [attractionId, setAttractionId] = useState(null);
  const [attractionName, setAttractionName] = useState(null);

  const chooseAttraction = (id, name) => {
    setAttractionId(id);
    setAttractionName(name);
  };

  const chooseStay = (stay) => setSelectedStay(stay);

  const toggleActivity = (activity) => {
    setSelectedActivities((prev) => {
      const exists = prev.find((a) => a.id === activity.id);
      if (exists) return prev.filter((a) => a.id !== activity.id);
      return [...prev, activity];
    });
  };

  const clearPlan = () => {
    setSelectedStay(null);
    setSelectedActivities([]);
    setAttractionId(null);
    setAttractionName(null);
  };

  const total =
    (selectedStay ? selectedStay.price : 0) +
    selectedActivities.reduce((sum, a) => sum + a.price, 0);

  return (
    <DayPlanContext.Provider
      value={{
        attractionId,
        attractionName,
        selectedStay,
        selectedActivities,
        total,
        chooseAttraction,
        chooseStay,
        toggleActivity,
        clearPlan,
      }}
    >
      {children}
    </DayPlanContext.Provider>
  );
}

export function useDayPlan() {
  const ctx = useContext(DayPlanContext);
  if (!ctx) throw new Error("useDayPlan must be used inside DayPlanProvider");
  return ctx;
}
