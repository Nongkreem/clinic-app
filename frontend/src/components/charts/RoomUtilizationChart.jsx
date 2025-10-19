import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function RoomUtilizationChart({ api }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(api).then((res) => setData(res.data));
  }, [api]);

  const chartData = {
    labels: data.map((d) => `${d.room_name}`),
    datasets: [
      {
        label: "จำนวนครั้งที่ใช้ห้อง",
        data: data.map((d) => d.used),
        backgroundColor: "#49C089",
        borderColor: "#C8A951",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    plugins: {
      title: {
        display: true,
        text: "การใช้ห้องตรวจ",
        color: "#1D7F5B",
        font: { size: 18, weight: "bold" },
      },
      legend: { display: false },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
      <Bar data={chartData} options={options} />
    </div>
  );
}
