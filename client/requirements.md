# Command Control Dashboard — Requirements

## Packages Used

| Package                   | Purpose                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| **recharts**              | Used for rendering analytics charts such as bar charts, pie charts, and hourly VC distribution graphs. |
| **framer-motion**         | Provides UI animations including the live VC spotlight animation and scrolling ticker at the bottom.   |
| **date-fns**              | Used for date and time formatting, including the real-time clock displayed on the dashboard.           |
| **lucide-react**          | Provides consistent iconography for dashboard widgets and status indicators.                           |
| **@tanstack/react-query** | Handles API data fetching, caching, and automatic refresh for real-time dashboard updates.             |

---

## Data Refresh Strategy

The dashboard automatically refreshes data every **30 seconds** using **TanStack Query**.

This ensures that the command center display remains updated for the wall screen without requiring manual refresh.

---

## API Endpoints

The dashboard expects data from the following endpoints:

```
GET /api/vcs
GET /api/stats
```

### `/api/vcs`

Returns a list of all VC sessions for the day.

### `/api/stats`

Returns aggregated dashboard statistics such as:

* Total VCs Today
* Live Sessions
* Upcoming Sessions
* Completed Sessions
* Average Duration
* Total Participants

---

## Deployment Notes

The dashboard is designed to run as a **frontend-only application**.

Architecture:

```
Dashboard (React + Vite)
        ↓
External API
```

No database or backend server is required for deployment.

---

## Usage Context

This dashboard is designed for:

* **NIC Command Centers**
* **Government VC Monitoring Rooms**
* **Large Wall Displays / LED Panels**

Features include:

* Real-time VC session monitoring
* Automatic scrolling schedule table
* Live session spotlight
* Analytics charts for daily VC distribution
* Bottom information ticker
