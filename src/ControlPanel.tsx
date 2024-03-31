import React, { useState } from "react";
import "./MapPanel.css";

const ControlPanel: React.FC = (): JSX.Element => {
  // State to track if buttons are checked
  const [isTrajectoryChecked, setIsTrajectoryChecked] = useState(false);
  const [isWaypointChecked, setIsWaypointChecked] = useState(false);

  // Toggle function for Trajectory button
  const toggleTrajectory = () => {
    setIsTrajectoryChecked(!isTrajectoryChecked);
  };

  // Toggle function for Waypoint button
  const toggleWaypoint = () => {
    setIsWaypointChecked(!isWaypointChecked);
  };

  return (
    <div
      className="controlPanel"
      style={{
        position: "absolute",
        right: "10px",
        bottom: "10px",
        width: "191px",
        backgroundColor: "#F6D092",
        borderRadius: "5px",
        border: "1px solid #000",
        padding: "10px",
      }}
    >
      <div className="workOption2">
        <button onClick={toggleTrajectory} className={isTrajectoryChecked ? "checked" : ""}>
          Trajectory
        </button>

        <button onClick={toggleWaypoint} className={isWaypointChecked ? "checked" : ""}>
          Waypoint
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
