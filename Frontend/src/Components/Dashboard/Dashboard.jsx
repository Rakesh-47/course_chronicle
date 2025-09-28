import React, { useEffect, useState, useContext } from "react";
import AuthContext from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Import CSS for scrollbar styling

const Dashboard = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetch("/api/dashboard", {
      headers: { Authorization: "Bearer " + auth.token },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched dashboard recommendations:", data);
        setRecommendations(data);
      })
      .catch((error) =>
        console.error("Error fetching dashboard recommendations:", error)
      );
  }, [auth.token]);

  useEffect(() => {
    const fetchNotificationsAndCredits = async () => {
      try {
        const notifRes = await fetch("/api/notifications", {
          headers: { Authorization: "Bearer " + auth.token },
        });
        const notifData = await notifRes.json();
        setNotifications(notifData);

        const profileRes = await fetch("/api/profile", {
          headers: { Authorization: "Bearer " + auth.token },
        });
        const updatedUser = await profileRes.json();
        auth.updateCredit(updatedUser.Credit);
      } catch (error) {
        console.error("Error in polling notifications and credits:", error);
      }
    };

    fetchNotificationsAndCredits();
    // Poll every 1000ms for updated notifications and credits
    const intervalId = setInterval(fetchNotificationsAndCredits, 1000);
    return () => clearInterval(intervalId);
  }, [auth.token, auth.updateCredit]);

  return (
    <div className="mt-17 p-6 bg-gray-900 text-white">
      <div className="border border-gray-700 p-4 rounded-lg mb-6">
        <h2 className="text-2xl font-bold mb-4">Notifications</h2>
        {notifications.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          <ul className="space-y-2 max-h-60 overflow-y-auto hide-scrollbar">
            {notifications.map((n, idx) => (
              <li
                key={idx}
                className="relative bg-gray-800 p-3 pr-4 rounded cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() =>
                  n.paperId ? navigate(`/paper/${n.paperId}`) : navigate("/upload")
                }
              >
                <div className="flex items-center justify-between">
                  <span>{n.Message}</span>
                  <div className={`h-3 w-3 rounded-full opacity-60 ${n.paperId ? "bg-green-500" : "bg-red-500"}`}></div>
                </div>
                <span className="block text-xs text-gray-400 mt-1">
                  {new Date(n.CreatedAt || n.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border border-gray-700 p-4 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Recommendations</h2>
        {recommendations.length === 0 ? (
          <p>No new recommendations.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto hide-scrollbar">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendations.map((paper) => (
                <li
                  key={paper._id}
                  className="p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => navigate(`/paper/${paper._id}`)}
                >
                  <div>
                    <span className="font-bold text-lg">
                      [{paper.course ? `${paper.course.code}] ${paper.course.name}` : "N/A"}
                    </span>
                    <span className="ml-2 text-lg">
                      ({paper.examType})
                    </span>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-400">
                        Session: {paper.session} {paper.sessionYear}
                      </span>
                      <span className="text-sm text-gray-400">
                        {new Date(paper.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;