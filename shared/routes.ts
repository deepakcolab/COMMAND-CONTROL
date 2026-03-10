import { z } from "zod";
// import { vcs } from "./schema";
import { useQuery } from "@tanstack/react-query";
import { DashboardStats, Vc } from "./schema";

// import type { Vc, DashboardStats } from "@shared/routes";

/* ===========================================
   🔵 EXTERNAL API CONFIG
=========================================== */

// const BASE_URL = "https://reserve.nic.in/ReserveAPI/API";

// async function fetchApi<T>(endpoint: string): Promise<T> {
//   const res = await fetch(`${BASE_URL}${endpoint}`, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });

//   if (!res.ok) {
//     throw new Error(`API Error: ${res.status}`);
//   }

//   return res.json();
// }

/* ===========================================
   🔵 VC LIST
=========================================== */

// export function useVcs() {
//   return useQuery<Vc[]>({
//     queryKey: ["external-vcs"],
//     queryFn: () => fetchApi<Vc[]>("/vcs"), // adjust endpoint if needed
//     refetchInterval: 30000,
//   });
// }

/* ===========================================
   🔵 STATS
=========================================== */

// export function useStats() {
//   return useQuery<DashboardStats>({
//     queryKey: ["external-stats"],
//     queryFn: () => fetchApi<DashboardStats>("/stats"), // adjust endpoint
//     refetchInterval: 30000,
//   });
// }


export const errorSchemas = {
  internal: z.object({ message: z.string() }),
};

export const api = {
  vcs: {
    list: {
      method: "GET" as const,
      path: "/api/vcs" as const,
      responses: {
        200: z.array(z.any()),
      },
    },
  },
  stats: {
    get: {
      method: "GET" as const,
      path: "/api/stats" as const,
      responses: {
        200: z.object({
          totalVcsToday: z.number(),
          totalOngoingVcs: z.number(),
          totalUpcomingVcs: z.number(),
          completedVcs: z.number(),
          averageDurationMins: z.number(),
          totalParticipantsToday: z.number(),
        }),
      },
    },
  },
};

export function buildUrl(
  path: string,
  params?: Record<string, string | number>
): string {
  let url = path;

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }

  return url;
}

/* =====================================================
   🔥 STATIC DEMO DATA — ADD HERE
===================================================== */

// export const staticVcs = (() => {
export const staticVcs: Vc[] = (() => {
  const now = new Date();

  return [
    {
      vcid: 3216547,
      title: "Hon'ble PM Digital India Review VC",
      chairedBy: "Prime Minister",
      hostStudio: "New Delhi PMO",
      vcAssigned: "Sarvesh Upadhyay",
      destStudios: ["Lucknow Secretariat", "Bhopal Mantralaya", "Jaipur Secretariat"],
      startTime: new Date(now.getTime() - 20 * 60000),
      endTime: new Date(now.getTime() + 40 * 60000),
      participantsCount: 120,
      status: "live",
      coordinatorName: "NIC PMO Team",
      ipPhone: "001-1001",
      location: "Shastri Park"
    },
    {
      vcid: 3216500,
      title: "NIC National Network Performance Review",
      chairedBy: "DG NIC",
      hostStudio: "NIC HQ Delhi",
      vcAssigned: "Amit Sharma",
      destStudios: ["Pune RO", "Ahmedabad RO", "Kolkata RO"],
      startTime: new Date(now.getTime() - 45 * 60000),
      endTime: new Date(now.getTime() + 15 * 60000),
      participantsCount: 25,
      status: "live",
      coordinatorName: "Sarvesh Upadhyay",
      ipPhone: "001-7890",
      location: "CGO Complex"
    },
    {
      vcid: 3216501,
      title: "Cabinet Committee on Infrastructure VC",
      chairedBy: "Cabinet Secretary",
      hostStudio: "Cabinet Secretariat Delhi",
      vcAssigned: "Rahul Kumar",
      destStudios: ["Mumbai RO", "Chennai RO"],
      startTime: new Date(now.getTime() - 10 * 60000),
      endTime: new Date(now.getTime() + 50 * 60000),
      participantsCount: 70,
      status: "live",
      coordinatorName: "Ravi Verma",
      ipPhone: "001-4556",
      location: "Shastri Park"
    },
    {
      vcid: 3216502,
      title: "Chief Ministers Infrastructure Review",
      chairedBy: "Cabinet Secretary",
      hostStudio: "NIC HQ Delhi",
      vcAssigned: "Amit Sharma",
      destStudios: ["Mumbai RO", "Chennai RO", "Hyderabad RO"],
      startTime: new Date(now.getTime() + 30 * 60000),
      endTime: new Date(now.getTime() + 90 * 60000),
      participantsCount: 85,
      status: "upcoming",
      coordinatorName: "Amit Kumar",
      ipPhone: "001-2001",
      location: "CGO Complex"
    },
    {
      vcid: 3216503,
      title: "Chief Secretaries Monthly Governance VC",
      chairedBy: "Home Secretary",
      hostStudio: "MHA Delhi",
      vcAssigned: "Pawan Kumar",
      destStudios: ["Shillong", "Gangtok", "Itanagar"],
      startTime: new Date(now.getTime() + 10 * 60000),
      endTime: new Date(now.getTime() + 70 * 60000),
      participantsCount: 40,
      status: "upcoming",
      coordinatorName: "Ravi Verma",
      ipPhone: "001-4555",
      location: "CGO Complex"
    },
    {
      vcid: 3216504,
      title: "National Cyber Security Preparedness Review",
      chairedBy: "NSA",
      hostStudio: "South Block Delhi",
      vcAssigned: "Sarvesh Upadhyay",
      destStudios: ["Bangalore RO", "Hyderabad RO"],
      startTime: new Date(now.getTime() + 60 * 60000),
      endTime: new Date(now.getTime() + 120 * 60000),
      participantsCount: 55,
      status: "upcoming",
      coordinatorName: "Cyber NIC Team",
      ipPhone: "001-8801",
      location: "Shastri Park"
    },
    {
      vcid: 3216505,
      title: "Aspirational Districts Progress Monitoring VC",
      chairedBy: "NITI Aayog CEO",
      hostStudio: "NITI Aayog Delhi",
      vcAssigned: "Rahul Kumar",
      destStudios: ["Varanasi", "Ranchi", "Imphal"],
      startTime: new Date(now.getTime() + 90 * 60000),
      endTime: new Date(now.getTime() + 150 * 60000),
      participantsCount: 65,
      status: "upcoming",
      coordinatorName: "NITI Tech Team",
      ipPhone: "001-9911",
      location: "CGO Complex"
    },
    {
      vcid: 3216506,
      title: "State Health Ministers Coordination Meeting",
      chairedBy: "Union Health Minister",
      hostStudio: "MoHFW Delhi",
      vcAssigned: "Pawan Kumar",
      destStudios: ["Patna RO", "Raipur RO"],
      startTime: new Date(now.getTime() - 120 * 60000),
      endTime: new Date(now.getTime() - 60 * 60000),
      participantsCount: 60,
      status: "completed",
      coordinatorName: "Health NIC Team",
      ipPhone: "001-3002",
      location: "Shastri Park"
    },
    {
      vcid: 3216507,
      title: "Digital Payments Infrastructure Review",
      chairedBy: "Finance Secretary",
      hostStudio: "Ministry of Finance Delhi",
      vcAssigned: "Amit Sharma",
      destStudios: ["Mumbai RBI", "Chennai RBI"],
      startTime: new Date(now.getTime() - 180 * 60000),
      endTime: new Date(now.getTime() - 120 * 60000),
      participantsCount: 48,
      status: "completed",
      coordinatorName: "FinTech NIC Team",
      ipPhone: "001-7711",
      location: "CGO Complex"
    }
  ];
})();

export const staticStats = (() => {
  const totalOngoingVcs = staticVcs.filter(v => v.status === "live").length;
  const totalUpcomingVcs = staticVcs.filter(v => v.status === "upcoming").length;
  const completedVcs = staticVcs.filter(v => v.status === "completed").length;

  return {
    totalVcsToday: staticVcs.length,
    totalOngoingVcs,
    totalUpcomingVcs,
    completedVcs,
    averageDurationMins: 60,
    totalParticipantsToday: staticVcs.reduce(
      (acc, v) => acc + v.participantsCount,
      0
    )
  };
})();