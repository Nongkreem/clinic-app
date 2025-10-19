import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function PeakHoursChart({ api }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(api).then((res) => setData(res.data));
  }, [api]);

  const chartData = {
    labels: data.map((d) => `${d.hour}:00`),
    datasets: [
      {
        label: "จำนวนการจอง",
        data: data.map((d) => d.total),
        borderColor: "#1D7F5B",
        backgroundColor: "#C8A951",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "ช่วงเวลาที่มีการจองสูงสุด",
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
