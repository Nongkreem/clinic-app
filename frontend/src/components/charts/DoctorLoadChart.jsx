import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DoctorLoadChart({ api }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(api).then((res) => setData(res.data));
  }, [api]);

  const chartData = {
    labels: data.map((d) => d.doctor_name),
    datasets: [
      {
        label: "จำนวนการจอง",
        data: data.map((d) => d.total),
        backgroundColor: "#C8A951",
        borderColor: "#1D7F5B",
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    plugins: {
      title: {
        display: true,
        text: "จำนวนการจองต่อแพทย์",
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
