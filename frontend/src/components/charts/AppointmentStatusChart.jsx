import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

export default function AppointmentStatusChart({ api }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(api).then((res) => setData(res.data));
  }, [api]);

  const chartData = {
    labels: data.map((d) => d.status),
    datasets: [
      {
        data: data.map((d) => d.total),
        backgroundColor: ["#1D7F5B", "#C8A951", "#EEDC82", "#49C089"],
      },
    ],
  };

  const options = {
    plugins: {
      title: {
        display: true,
        text: "สัดส่วนสถานะการนัดหมาย",
        color: "#1D7F5B",
        font: { size: 18, weight: "bold" },
      },
      legend: { position: "bottom" },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
      <Pie data={chartData} options={options} />
    </div>
  );
}
