import express from "express";

const router = express.Router();

const NIC_API =
  "https://reserve.nic.in/ReserveAPI/API/TodayVCDashboard/Display?ReportType=1";

router.get("/api/vcs", async (req, res) => {
  try {

    const response = await fetch(NIC_API);
    const data = await response.json();

    console.log("NIC API DATA:", data);

    res.json(data);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "API failed" });

  }
});

export default router;