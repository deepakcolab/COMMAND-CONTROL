import { useEffect, useState } from "react";
import { DashboardStats, Vc } from "@shared/schema";

export function useVcs(): {
  data: Vc[];
  isLoading: boolean;
  isError: boolean;
} {
  const [data, setData] = useState<Vc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchVcs = async () => {
    try {
      setIsLoading(true);

      const res = await fetch("/api/vcs");
      const apiData = await res.json();

      const formatted: Vc[] = apiData.map((item: any) => ({
        vcid: item.vcid,
        title: item.purpose,
        chairedBy: item.chairedBy,
        hostStudio: item.stateName,
        vcAssigned: item.vcAssignedTo,
        destStudios: [item.studioCount],

        startTime: new Date(`${item.vcDate} ${item.vcStartTime}`),
        endTime: new Date(`${item.vcDate} ${item.vcEndTime}`),

        participantsCount: 0,

        status: (item.currentVCStatus || "").toLowerCase() as
          | "live"
          | "upcoming"
          | "completed",

        coordinatorName: "",
        ipPhone: item.ipPhone,
        location: item.cmsLocation,
      }));

      setData(formatted);
      setIsLoading(false);
    } catch (error) {
      console.error("API Error:", error);
      setIsError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVcs();

    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      fetchVcs();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    data,
    isLoading,
    isError,
  };
}

export function useStats(vcs: Vc[]): {
  data: DashboardStats;
  isLoading: boolean;
} {
  const stats: DashboardStats = {
    totalVcsToday: vcs.length,

    totalOngoingVcs: vcs.filter((v) => v.status === "Live").length,

    totalUpcomingVcs: vcs.filter((v) => v.status === "upcoming").length,

    completedVcs: vcs.filter((v) => v.status === "completed").length,

    averageDurationMins:
      vcs.length > 0
        ? Math.round(
          vcs.reduce((sum, vc) => {
            const start = new Date(vc.startTime).getTime();
            const end = new Date(vc.endTime).getTime();

            const durationMinutes = (end - start) / 60000;

            return sum + durationMinutes;
          }, 0) / vcs.length
        )
        : 0,

    totalParticipantsToday: vcs.reduce(
      (sum, vc) => sum + (vc.participantsCount || 0),
      0
    ),
  };

  return {
    data: stats,
    isLoading: false,
  };
}