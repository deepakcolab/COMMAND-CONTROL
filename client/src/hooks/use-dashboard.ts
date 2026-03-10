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

  useEffect(() => {
    const fetchVcs = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/vcs");
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

          status: (item.currentVCStatus || "").toLowerCase() as "live" | "upcoming" | "completed",

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

    fetchVcs();
  }, []);

  return {
    data,
    isLoading,
    isError,
  };
}

export function useStats(): {
  data: DashboardStats;
  isLoading: boolean;
} {
  const { data: vcs, isLoading } = useVcs();

  const stats: DashboardStats = {
    totalVcsToday: vcs.length,

    totalOngoingVcs: vcs.filter((v) => v.status === "Live").length,

    totalUpcomingVcs: vcs.filter((v) => v.status === "upcoming").length,

    completedVcs: vcs.filter((v) => v.status === "completed").length,

    averageDurationMins:
      vcs.length > 0
        ? Math.round(
          vcs.reduce((sum, vc) => {
            const duration =
              (new Date(vc.endTime).getTime() -
                new Date(vc.startTime).getTime()) /
              60000;
            return sum + duration;
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
    isLoading,
  };
}