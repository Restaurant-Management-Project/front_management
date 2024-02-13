import React, { useEffect, useState } from "react";
import axios from "./axiosConfig";
import CardIcon from "./assets/card.png";
import CashIcon from "./assets/cash.png";
import WaiterIcon from "./assets/waiter.png";
import HistoryIcon from "./assets/history.png";

interface Action {
  requestId: number;
  tableId: number;
  description: string;
  requestTimeStamp: number;
  requestStatus: boolean;
}

const ManagerPage: React.FC = () => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [activeActions, setActiveActions] = useState<Action[]>([]);
  const [allActions, setAllActions] = useState<Action[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/recent-requests");
        const filteredActions = response.data.filter((action: Action) => action.requestStatus);
        setActiveActions(filteredActions);
        setAllActions(response.data);
      } catch (error) {
        console.error("Error fetching recent requests:", error);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 3000);

    return () => {
      clearInterval(interval);
    };
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
      console.log('the button is clicked');
      await axios.put(`/close-request/${requestId}`);
      const response = await axios.get("/recent-requests");
      const filteredActions = response.data.filter((action: Action) => action.requestStatus);
      setActiveActions(filteredActions);
      setAllActions(response.data);
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
          <h2>Cereri active</h2>
          <div className="tables-container">
            {["cash", "card", "chelner"].map((category, categoryIndex) => (
              <div
                className={`action-${
                  category === "chelner" ? "waiter" : "payment"
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
                  {category === "chelner" && (
                    <img src={WaiterIcon} alt="" className="icon" />
                  )}
                  {category.toUpperCase()}
                </h3>
                <table className="actions-table">
                  <thead>
                    <tr>
                      <th>Masa №</th>
                      <th>Timp</th>
                      {category === "chelner" && <th>Descriere</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {activeActions.map((action, index) => {
                      if (
                        category === "chelner" &&
                        action.description !== "card" &&
                        action.description !== "cash"
                      ) {
                        return (
                          <React.Fragment key={index}>
                            <tr
                              onClick={() => handleRowClick(index)}
                              className={getRowBackgroundColor(
                                action.requestTimeStamp.toString()
                              )}
                            >
                              <td>{action.tableId}</td>
                              <td>
                                {formatTimeDifference(
                                  action.requestTimeStamp.toString()
                                )}
                              </td>
                              {category === "chelner" && (
                                <td>{action.description}</td>
                              )}
                            </tr>
                            {selectedRow === index && (
                              <tr className="buttons">
                                <td>
                                  <button
                                    className="cancel-button"
                                    onClick={() =>
                                      handleDeleteAction(action.requestId)
                                    }
                                  >
                                    Anulează
                                  </button>
                                </td>
                                <td>
                                  <button
                                    className="ok-button"
                                    onClick={() =>
                                      handleDeleteAction(action.requestId)
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
                        category !== "chelner" &&
                        action.description === category
                      ) {
                        return (
                          <React.Fragment key={index}>
                            <tr
                              onClick={() => handleRowClick(index)}
                              className={getRowBackgroundColor(
                                action.requestTimeStamp.toString()
                              )}
                            >
                              <td>{action.tableId}</td>
                              <td>
                                {formatTimeDifference(
                                  action.requestTimeStamp.toString()
                                )}
                              </td>
                            </tr>
                            {selectedRow === index && (
                              <tr className="buttons">
                                <td>
                                  <button
                                    className="cancel-button"
                                    onClick={() =>
                                      handleDeleteAction(action.requestId)
                                    }
                                  >
                                    Anulează
                                  </button>
                                </td>
                                <td>
                                  <button
                                    className="ok-button"
                                    onClick={() =>
                                      handleDeleteAction(action.requestId)
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
          <h2 className="category">Istoric
            <img src={HistoryIcon} alt="" className="icon" />
          </h2>
          <table className="all-actions-history-table">
            <thead>
              <tr>
                <th>Masa №</th>
                <th>Cerință</th>
                <th>Marcaj temporal</th>
              </tr>
            </thead>
            <tbody>
              {allActions.map((action, index) => (
                <tr key={index}>
                  <td>{action.tableId}</td>
                  <td>{action.description}</td>
                  <td>{formatTimestamp(action.requestTimeStamp)}</td>
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
