import { useState, useEffect } from "react";
import HeatMap from "@uiw/react-heat-map";

// Dummy Data Generator
const generateActivityData = (startDate, endDate) => {
  const data = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    const count = Math.floor(Math.random() * 50);

    data.push({
      date: currentDate.toISOString().split("T")[0],
      count: count,
    });

    // 🔥 IMPORTANT: increment date
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
};

// Color Generator
const getPanelColors = (maxCount) => {
  const colors = {};

  for (let i = 0; i <= maxCount; i++) {
    const greenValue = Math.floor((i / maxCount) * 255);
    colors[i] = `rgb(0, ${greenValue}, 0)`;
  }

  return colors;
};

const HeatMapProfile = () => {
  const [activityData, setActivityData] = useState([]);
  const [panelColors, setPanelColors] = useState({});

  useEffect(() => {
    const startDate = "2024-01-01";
    const endDate = "2024-03-01";

    const data = generateActivityData(startDate, endDate);
    setActivityData(data);

    const maxCount = Math.max(...data.map((d) => d.count));
    setPanelColors(getPanelColors(maxCount));
  }, []);

  return (
    <div>
      <h4>Recent Contributions</h4>

      <HeatMap
        value={activityData}                // 🔥 main data
        startDate={new Date("2024-01-01")}  // 🔥 required
        panelColors={panelColors}           // 🔥 color intensity
        rectSize={15}                       // box size
        space={3}                           // gap
        legendCellSize={0}                  // optional
      />
    </div>
  );
};

export default HeatMapProfile;