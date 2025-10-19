import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function MonthlyBookingsChart({ api }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(api).then((res) => setData(res.data));
  }, [api]);

  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: "จำนวนการจองรายเดือน",
        data: data.map((d) => d.total),
        borderColor: "#1D7F5B",
        backgroundColor: "rgba(200, 169, 81, 0.3)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    plugins: {
      title: {
        display: true,
        text: "แนวโน้มการจองรายเดือน",
        color: "#1D7F5B",
        font: { size: 18, weight: "bold" },
      },
      legend: { display: false },
    },
    scales: {
      x: { ticks: { color: "#444" } },
      y: { ticks: { color: "#444" } },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
      <Line data={chartData} options={options} />
    </div>
  );
}
