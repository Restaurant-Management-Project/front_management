import React, {useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';
import axios from "./axiosConfig";
import CardIcon from "./assets/card.png";
import CashIcon from "./assets/cash.png";
import WaiterIcon from "./assets/waiter.png";
import HistoryIcon from "./assets/history.png";
import SettingsIcon from "./assets/settings.svg";

interface Action {
  request_type: string;
  id: number;
  tabel_id: number;
  created_at: number;
  is_handled: boolean;
}

const ManagerPage: React.FC = () => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [activeActions, setActiveActions] = useState<Action[]>([]);
  const [allActions, setAllActions] = useState<Action[]>([]);
  const [_tick, setTick] = useState(0);
  const navigate = useNavigate();

  const goToSettings = () => {
    navigate('/settings');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/requests");
        const reversedData = response.data.slice().reverse();

        const filteredActions = reversedData.filter((action: Action) => !action.is_handled);

        setActiveActions(filteredActions);
        setAllActions(reversedData);
      } catch (error) {
        console.error("Error fetching recent requests:", error);
      }
    };

    fetchData();

    const socket = new WebSocket("ws://localhost:8001/ws/requests/");

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("New WebSocket message:", data);

      const newAction: Action = {
        request_type: data.request_type,
        id: data.request_id,
        tabel_id: data.table_id,
        created_at: data.customer_request.created_at,
        is_handled: data.customer_request.is_handled,
      };

      setActiveActions(prev => [newAction, ...prev].filter(action => !action.is_handled).sort((a, b) => b.created_at - a.created_at));
      setAllActions(prev => [newAction, ...prev].sort((a, b) => b.created_at - a.created_at));
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
    };

    // Clean up on unmount
    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeDifference = (timestamp: string): string => {
    const requestTime = new Date(timestamp).getTime();
    const currentTime = Date.now();
    const difference = Math.floor((currentTime - requestTime) / 1000);
    const minutes = Math.floor(difference / 60);
    const seconds = difference % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleDeleteAction = async (requestId: number) => {
    try {
      await axios.post(`/handle-request/${requestId}/`);

      setActiveActions(prevActions => {
        return prevActions.filter(action => action.id !== requestId);
      });

      setAllActions(prevActions => {
        return prevActions.map(action =>
            action.id === requestId ? {...action, is_handled: true} : action
        );
      });

      setSelectedRow(null);
    } catch (error) {
      console.error("Error closing action:", error);
    }
  };

  const handleRowClick = (index: number) => {
    setSelectedRow(index === selectedRow ? null : index);
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const getRowBackgroundColor = (timestamp: string): string => {
    const requestTime = new Date(timestamp).getTime();
    const currentTime = Date.now();
    const difference = Math.floor((currentTime - requestTime) / 1000);

    if (difference < 120) {
      return "green-background";
    } else if (difference >= 120 && difference < 240) {
      return "orange-background";
    } else {
      return "red-background";
    }
  };

  return (
      <div>
        <div className="container">
          <div className="active-requests">
            <h2>Active Requests</h2>
            <div className="tables-container">
              {["cash", "card", "waiter"].map((category, categoryIndex) => (
                  <div
                      className={`action-${
                          category === "waiter" ? "waiter" : "payment"
                      }`}
                      key={categoryIndex}
                  >
                    <h3 className="category">
                      {category === "cash" && (
                          <img src={CashIcon} alt="" className="icon" />
                      )}
                      {category === "card" && (
                          <img src={CardIcon} alt="" className="icon" />
                      )}
                      {category === "waiter" && (
                          <img src={WaiterIcon} alt="" className="icon" />
                      )}
                      {category.toUpperCase()}
                    </h3>
                    <table className="actions-table">
                      <thead>
                      <tr>
                        <th>Table №</th>
                        <th>Time</th>
                        {category === "waiter" && <th>Description</th>}
                      </tr>
                      </thead>
                      <tbody>
                      {activeActions.map((action, index) => {
                        if (
                            category === "waiter" &&
                            action.request_type !== "card" &&
                            action.request_type !== "cash"
                        ) {
                          return (
                              <React.Fragment key={index}>
                                <tr
                                    onClick={() => handleRowClick(index)}
                                    className={getRowBackgroundColor(
                                        action.created_at.toString()
                                    )}
                                >
                                  <td>{action.tabel_id}</td>
                                  <td>
                                    {formatTimeDifference(
                                        action.created_at.toString()
                                    )}
                                  </td>
                                  {category === "waiter" && (
                                      <td>{action.request_type}</td>
                                  )}
                                </tr>
                                {selectedRow === index && (
                                    <tr className="buttons">
                                      <td>
                                        <button
                                            className="cancel-button"
                                            onClick={() =>
                                                handleDeleteAction(action.id)
                                            }
                                        >
                                          Cancel
                                        </button>
                                      </td>
                                      <td>
                                        <button
                                            className="ok-button"
                                            onClick={() =>
                                                handleDeleteAction(action.id)
                                            }
                                        >
                                          Ok
                                        </button>
                                      </td>
                                    </tr>
                                )}
                              </React.Fragment>
                          );
                        } else if (
                            category !== "waiter" &&
                            action.request_type === category
                        ) {
                          return (
                              <React.Fragment key={index}>
                                <tr
                                    onClick={() => handleRowClick(index)}
                                    className={getRowBackgroundColor(
                                        action.created_at.toString()
                                    )}
                                >
                                  <td>{action.tabel_id}</td>
                                  <td>
                                    {formatTimeDifference(
                                        action.created_at.toString()
                                    )}
                                  </td>
                                </tr>
                                {selectedRow === index && (
                                    <tr className="buttons">
                                      <td>
                                        <button
                                            className="cancel-button"
                                            onClick={() =>
                                                handleDeleteAction(action.id)
                                            }
                                        >
                                          Cancel
                                        </button>
                                      </td>
                                      <td>
                                        <button
                                            className="ok-button"
                                            onClick={() =>
                                                handleDeleteAction(action.id)
                                            }
                                        >
                                          Ok
                                        </button>
                                      </td>
                                    </tr>
                                )}
                              </React.Fragment>
                          );
                        }
                        return null;
                      })}
                      </tbody>
                    </table>
                  </div>
              ))}
            </div>
          </div>
          <div className="history">
            <div className="header">
              <h2 className="category">
                History
                <img src={HistoryIcon} alt="" className="icon" />
              </h2>
              <h4 className="settings" onClick={goToSettings}>
                Settings
                <img src={SettingsIcon} alt="Settings" className="smallIcon" />
              </h4>
            </div>
            <table className="all-actions-history-table">
              <thead>
              <tr>
                <th>Table №</th>
                <th>Request</th>
                <th>Timestamp</th>
              </tr>
              </thead>
              <tbody>
              {allActions.map((action, index) => (
                  <tr key={index}>
                    <td>{action.tabel_id}</td>
                    <td>{action.request_type}</td>
                    <td>{formatTimestamp(action.created_at)}</td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};

export default ManagerPage;
