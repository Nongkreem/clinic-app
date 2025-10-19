import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

export function useSystemDate() {
  const [systemDate, setSystemDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDate = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/demo/current-date`);
        setSystemDate(new Date(res.data.now));
      } catch (err) {
        console.error("Failed to fetch system date:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDate();
  }, []);

  return { systemDate, loading };
}
