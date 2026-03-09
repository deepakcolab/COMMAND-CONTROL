import {
  HourlyDistributionChart,
  KpiCard,
  NewsTicker,
  RealTimeClock
} from "@/components/dashboard-widgets";
import { useStats, useVcs } from "@/hooks/use-dashboard";
import { Vc } from "@shared/schema";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  MonitorPlay,
  Users,
  Video
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export default function Dashboard() {
  const { data: vcs, isLoading: isLoadingVcs, isError: isErrorVcs } = useVcs();
  const { data: stats, isLoading: isLoadingStats } = useStats();
  const tableScrollRef = useRef<HTMLDivElement | null>(null);

  // ================= REALTIME STATUS ENGINE =================
  const getRealtimeStatus = (vc: Vc) => {
    const now = new Date();
    const start = new Date(vc.startTime);
    const end = new Date(vc.endTime);

    if (now >= start && now <= end) return "live";
    if (now < start) return "upcoming";
    return "completed";
  };

  const liveVcs: Vc[] = useMemo(
    () => (vcs?.filter(vc => getRealtimeStatus(vc) === "live") ?? []) as Vc[],
    [vcs]
  );

  const upcomingVcs: Vc[] = useMemo(() => {
    const list =
      vcs?.filter(vc => getRealtimeStatus(vc) === "upcoming") ?? [];

    return list.sort(
      (a, b) =>
        new Date(a.startTime).getTime() -
        new Date(b.startTime).getTime()
    );
  }, [vcs]);

  const todayVcs = useMemo(() => {
    if (!vcs) return [];

    const statusPriority: Record<string, number> = {
      live: 0,
      upcoming: 1,
      completed: 2,
    };

    return [...vcs].sort((a, b) => {
      const statusA = getRealtimeStatus(a);
      const statusB = getRealtimeStatus(b);

      const priorityDiff =
        statusPriority[statusA] - statusPriority[statusB];

      if (priorityDiff !== 0) return priorityDiff;

      return (
        new Date(a.startTime).getTime() -
        new Date(b.startTime).getTime()
      );
    });
  }, [vcs]);

  const [liveIndex, setLiveIndex] = useState(0);

  useEffect(() => {
    if (!liveVcs || liveVcs.length <= 1) return;

    const interval = setInterval(() => {
      setLiveIndex(prev => (prev + 1) % liveVcs.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [liveVcs]);

  const [upcomingIndex, setUpcomingIndex] = useState(0);

  useEffect(() => {
    if (!upcomingVcs || upcomingVcs.length <= 1) return;

    const interval = setInterval(() => {
      setUpcomingIndex(prev => (prev + 1) % upcomingVcs.length);
    }, 9000);

    return () => clearInterval(interval);
  }, [upcomingVcs]);

  useEffect(() => {
    const container = tableScrollRef.current;
    if (!container) return;

    // Scroll only if content overflows
    if (container.scrollHeight <= container.clientHeight) return;

    let direction: "down" | "up" = "down";
    const scrollSpeed = 1.00; // NIC recommended smooth speed
    let animationFrame: number;

    const autoScroll = () => {
      if (!container) return;

      if (direction === "down") {
        container.scrollTop += scrollSpeed;

        if (
          container.scrollTop + container.clientHeight >=
          container.scrollHeight
        ) {
          direction = "up";
        }
      } else {
        container.scrollTop -= scrollSpeed;

        if (container.scrollTop <= 0) {
          direction = "down";
        }
      }

      animationFrame = requestAnimationFrame(autoScroll);
    };

    animationFrame = requestAnimationFrame(autoScroll);

    return () => cancelAnimationFrame(animationFrame);
  }, [todayVcs]);

  // ✅ ONLY THIS ONE
  const primaryLiveVc: Vc | undefined = liveVcs[liveIndex];
  const rotatingUpcomingVc = upcomingVcs[upcomingIndex];
  if (isLoadingVcs || isLoadingStats) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-primary">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <h2 className="text-xl font-mono tracking-widest">INITIALIZING DASHBOARD...</h2>
      </div>
    );
  }

  if (isErrorVcs) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-destructive">
        <AlertTriangle className="w-16 h-16 mb-4 opacity-80" />
        <h2 className="text-2xl font-bold tracking-widest">DATA CONNECTION LOST</h2>
        <p className="text-muted-foreground mt-2">Retrying connection...</p>
      </div>
    );
  }

  // Fallback stats if API returns empty
  const safeStats = stats || {
    totalVcsToday: vcs?.length || 0,
    totalOngoing: liveVcs.length,
    totalUpcoming: upcomingVcs.length,
    completedVcs: vcs?.filter(v => v.status === "completed").length || 0,
    averageDurationMins: 45,
    totalParticipantsToday: vcs?.reduce((acc, v) => acc + v.participantsCount, 0) || 0
  };

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden selection:bg-primary/30 text-foreground">

      {/* --- TOP HEADER --- */}
      <header className="h-20 shrink-0 border-b border-border bg-card/50 backdrop-blur-md grid grid-cols-3 items-center px-6 z-20">

        {/* LEFT: Brand */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
            <MonitorPlay className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-widest text-white leading-none">
              NIC<span className="text-primary">VIDCON</span>
            </h1>
            <p className="text-xs text-muted-foreground font-mono tracking-widest">
              COMMAND & CONTROL CENTER
            </p>
          </div>
        </div>

        {/* CENTER: Context */}
        <div className="flex justify-center">
          <div className="px-8 py-2 rounded-sm">
            <span className="text-2xl md:text-base text-primary font-bold tracking-widest uppercase text-[#e6f1f8]">
              Today’s VC Sessions Assigned to NIC HQ
            </span>
          </div>
        </div>
        {/* RIGHT: Clock */}
        <div className="flex justify-end">
          <RealTimeClock />
        </div>

      </header>

      {/* --- MAIN CONTENT GRID --- */}
      <main className="flex-1 overflow-hidden p-4 md:p-6 flex flex-col gap-6">

        {/* ROW 1: KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 shrink-0">
          <KpiCard title="Total Scheduled" value={safeStats.totalVcsToday} icon={<Video className="w-5 h-5" />} colorClass="text-blue-500" />
          <KpiCard title="Live Now" value={liveVcs.length} icon={<Activity className="w-5 h-5" />} colorClass="text-primary" />
          <KpiCard title="Upcoming" value={upcomingVcs.length} icon={<Clock className="w-5 h-5" />} colorClass="text-accent" />
          <KpiCard title="Completed" value={safeStats.completedVcs} icon={<CheckCircle className="w-5 h-5" />} colorClass="text-muted-foreground" />
          <KpiCard title="Participants" value={safeStats.totalParticipantsToday} icon={<Users className="w-5 h-5" />} colorClass="text-purple-500" />
          <KpiCard title="Avg Duration (Min)" value={safeStats.averageDurationMins} icon={<Calendar className="w-5 h-5" />} colorClass="text-cyan-500" />
        </div>

        {/* MIDDLE SECTION: Live Spotlight + Upcoming */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0 h-[280px]">

          {/* Spotlight (Span 2) */}
          <div
            className={`col-span-1 lg:col-span-2 rounded-xl border bg-card relative overflow-hidden transition-all duration-500 ${primaryLiveVc ? "panel-glow-green border-primary/50" : "border-border"
              }`}
          >
            <div className="absolute top-0 left-0 px-4 py-1.5 bg-background border-b border-r border-inherit rounded-br-lg z-20 flex items-center gap-2">
              {primaryLiveVc ? (
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-bold tracking-widest text-primary uppercase">
                    Active Session Spotlight
                  </span>
                </>
              ) : (
                <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                  Standby Mode
                </span>
              )}
            </div>

            {/* CONTENT AREA */}
            <div className="relative w-full h-full">
              <AnimatePresence mode="wait">
                {primaryLiveVc ? (
                  <motion.div
                    key={`live-${primaryLiveVc.vcid}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="absolute inset-0 p-6 pt-12 flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-white tracking-tight">
                          {primaryLiveVc.title}
                        </h2>

                        <div className="flex items-center gap-3 text-muted-foreground font-mono text-sm">
                          <span className="px-2 py-1 rounded bg-background border border-border">
                            VCID: {primaryLiveVc.vcid}
                          </span>

                          <span className="px-2 py-1 rounded bg-prmary/10 text-primary border border-primary/20">
                            {format(new Date(primaryLiveVc.startTime), "HH:mm")} -{" "}
                            {format(new Date(primaryLiveVc.endTime), "HH:mm")}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Chaired By</p>
                        <p className="text-xl font-semibold text-white">
                          {primaryLiveVc.chairedBy}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-6">
                      <div className="bg-background rounded-lg p-3 border border-border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Host Studio
                        </p>
                        <p className="font-mono text-sm text-white truncate">
                          {primaryLiveVc.hostStudio}
                        </p>
                      </div>

                      <div className="bg-background rounded-lg p-3 border border-border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Destination Studios
                        </p>
                        <p className="font-mono text-sm text-white">
                          {primaryLiveVc.destStudios?.length || 0} Studios
                        </p>
                      </div>

                      <div className="bg-background rounded-lg p-3 border border-border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          VC Assigned
                        </p>
                        <p className="font-mono text-sm text-white truncate">
                          {primaryLiveVc.vcAssigned}
                        </p>
                      </div>

                      <div className="bg-background rounded-lg p-3 border border-border flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                            Location
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm text-white tracking-widest">
                              {primaryLiveVc.location}
                            </p>
                          </div>
                        </div>

                        <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="standby"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground"
                  >
                    <Video className="w-16 h-16 mb-4 opacity-20" />
                    <p className="font-mono tracking-widest uppercase">
                      No Active Sessions Currently
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Next Upcoming (Span 1) */}
          <div className="col-span-1 rounded-xl border border-border bg-card relative overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-border bg-background/50 flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest text-accent uppercase">Next Upcoming</span>
              <Clock className="w-4 h-4 text-accent" />
            </div>

            <div className="relative p-5 flex-1 flex flex-col justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                {rotatingUpcomingVc ? (
                  <motion.div
                    key={`upcoming-${rotatingUpcomingVc.vcid}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="absolute inset-0 p-5 flex flex-col justify-center"
                  >
                    <div className="text-3xl font-mono-num font-bold text-accent mb-2">
                      VCID:  {rotatingUpcomingVc.vcid} ({format(new Date(rotatingUpcomingVc.startTime), "HH:mm")} - {format(new Date(rotatingUpcomingVc.endTime), "HH:mm")})
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-4 line-clamp-2">
                      {rotatingUpcomingVc.title}
                    </h3>

                    <div className="space-y-2 text-sm text-muted-foreground font-mono">


                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span>Chaired By:</span>
                        <span className="text-white text-right max-w-[150px] truncate">
                          {rotatingUpcomingVc.chairedBy}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span>Host Studio:</span>
                        <span className="text-white text-right max-w-[150px] truncate">
                          {rotatingUpcomingVc.hostStudio}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span>VC Assigned:</span>
                        <span className="text-white text-right max-w-[360px] truncate">
                          {rotatingUpcomingVc.vcAssigned} ({rotatingUpcomingVc.location} : {rotatingUpcomingVc.ipPhone})
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-upcoming"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center text-muted-foreground"
                  >
                    <p className="font-mono text-sm uppercase">No upcoming sessions</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Table + Charts Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">

          {/* Schedule Table (Span 2) */}
          <div className="col-span-1 lg:col-span-2 rounded-xl border bg-card relative flex flex-col min-h-0">

            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-background/50 flex items-center gap-2 shrink-0">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                Today's VC Schedule
              </span>
            </div>

            {/* Scroll Area */}
            <div
              ref={tableScrollRef}
              className="flex-1 overflow-y-auto min-h-0 scroll-smooth"
            >
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-background/30 sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="px-4 py-3 font-medium tracking-wider">VCID</th>
                    <th className="px-4 py-3 font-medium tracking-wider">Time</th>
                    <th className="px-4 py-3 font-medium tracking-wider">Session Title</th>
                    <th className="px-4 py-3 font-medium tracking-wider">Host Studio</th>
                    <th className="px-4 py-3 font-medium tracking-wider">VC Assigned</th>
                    <th className="px-4 py-3 font-medium tracking-wider">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border font-mono">
                  {todayVcs.length > 0 ? (
                    todayVcs.map((vc) => (
                      <tr
                        key={vc.vcid}   // use id instead of vcid
                        className={`hover:bg-background/50 transition-colors ${vc.status === "live" ? "bg-primary/5" : ""
                          }`}
                      >
                        <td className="px-4 py-3 truncate max-w-[150px]">
                          {vc.vcid}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          {format(new Date(vc.startTime), "HH:mm")} -{" "}
                          {format(new Date(vc.endTime), "HH:mm")}
                        </td>

                        <td
                          className="px-4 py-3 text-white font-sans font-medium truncate max-w-[350px]"
                          title={vc.title}
                        >
                          {vc.title}
                        </td>

                        <td className="px-4 py-3 truncate max-w-[150px]">
                          {vc.hostStudio}
                        </td>

                        <td className="px-4 py-3 truncate max-w-[150px]">
                          {vc.vcAssigned}
                        </td>

                        <td className="px-4 py-3">
                          {vc.status === "live" && (
                            <span className="text-primary flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                              LIVE
                            </span>
                          )}
                          {vc.status === "upcoming" && (
                            <span className="text-accent">UPCOMING</span>
                          )}
                          {vc.status === "completed" && (
                            <span className="text-muted-foreground">COMPLETED</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-muted-foreground font-sans"
                      >
                        No scheduled VCs for today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

            </div>
          </div>

          {/* Analytics (Span 1) */}
          <div className="col-span-1 grid gap-6 min-h-0">
            {/* Chart */}
            <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-4">Scheduled VC Hours</span>
            <div className="flex-1 min-h-[120px]">
              <HourlyDistributionChart vcs={vcs || []} />
            </div>
          </div>
        </div>

      </main>

      {/* --- BOTTOM TICKER --- */}
      <NewsTicker />

    </div>
  );
}
