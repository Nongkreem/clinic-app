import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Bar
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TopServicesChart({ api }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(api);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching chart data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api]);

  if (loading) return <div className="text-center py-8">กำลังโหลดข้อมูล...</div>;

  const chartData = {
    labels: data.map((item) => item.service_name),
    datasets: [
      {
        label: "จำนวนการจอง",
        data: data.map((item) => item.count),
        backgroundColor: "#1D7F5B", // เขียว
        borderColor: "#C8A951", // ทอง
        borderWidth: 2,
        hoverBackgroundColor: "#49C089", // เขียวอ่อนเวลา hover
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#1D7F5B", font: { size: 14 } },
      },
      title: {
        display: true,
        text: "บริการที่มีการจองสูงสุด",
        color: "#1D7F5B",
        font: { size: 18, weight: "bold" },
      },
    },
    scales: {
      x: {
        ticks: { color: "#555", font: { size: 13 } },
        grid: { display: false },
      },
      y: {
        ticks: { color: "#555", font: { size: 13 } },
        grid: { color: "#E5E7EB" },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
      <Bar data={chartData} options={options} />
    </div>
  );
}
