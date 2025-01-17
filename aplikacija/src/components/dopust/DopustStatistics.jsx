import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography } from "@mui/material";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const DopustStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [monthlyStatistics, setMonthlyStatistics] = useState(null);

  useEffect(() => {
    axios
      .get("https://dopusti-statistika-latest.onrender.com/statistics")
      .then((response) => setStatistics(response.data))
      .catch((err) => console.error("Error fetching statistics:", err));

    axios
      .get("https://dopusti-statistika-latest.onrender.com/statistics/monthly")
      .then((response) => setMonthlyStatistics(response.data))
      .catch((err) => console.error("Error fetching monthly statistics:", err));
  }, []);

  if (!statistics || !monthlyStatistics) {
    return <div>Loading...</div>;
  }

  const monthlyLabels = Object.keys(monthlyStatistics); 
  const totalData = monthlyLabels.map((month) => monthlyStatistics[month].total);

  const lineChartData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: "Total Leaves per Month",
        data: totalData,
        fill: false,
        borderColor: "#2196F3",
        tension: 0.1,
      },
    ],
  };

  return (
    <Box padding={3}>
      <Typography variant="h4" gutterBottom>
        Statistika dopustov
      </Typography>

      <Box marginBottom={4}>
        <Typography variant="h6">Status dopustov</Typography>
        <Bar
          data={{
            labels: ["Odobreni", "Zavrnjeni", "Skupno"],
            datasets: [
              {
                label: "status",
                data: [statistics.approvedLeaves, statistics.rejectedLeaves, statistics.totalLeaves],
                backgroundColor: ["#37beb0", "#0c6170", "#09a9c8"],
              },
            ],
          }}
          options={{ responsive: true }}
        />
      </Box>

      <Box marginBottom={4}>
        <Typography variant="h6">Število dopustov po mesecih</Typography>
        <Line data={lineChartData} options={{ responsive: true }} />
      </Box>
    </Box>
  );
};

export default DopustStatistics;
