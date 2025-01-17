"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Clock,
  CheckCircle2,
  Users,
  Building,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";

const ExecSchema = z.object({
  _id: z.string(),
  "First Name": z.string(),
  "Last Name": z.string(),
  Chapter: z.string().optional(),
  Room: z.string(),
  "AZA/BBG": z.string(),
  Email: z.string(),
  "Grad Year": z.number(),
  checkInFriday: z.boolean(),
  checkInSaturday: z.boolean(),
});

type Exec = z.infer<typeof ExecSchema>;

const CheckInScreen: React.FC = () => {
  const [execs, setExecs] = useState<Record<string, Exec>>({});
  const [selectedDay, setSelectedDay] = useState<string>("Friday");
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");
  // const [currentTime, setCurrentTime] = useState("");
  const [showStats, setShowStats] = useState<boolean>(true);
  const days = ["Friday", "Saturday"];
  const groups = ["All", "AZA", "BBG"];

  useEffect(() => {
    fetchExecs();
    const fetchInterval = setInterval(fetchExecs, 7000);

    // const updateTime = () => {
    //   setCurrentTime(new Date().toLocaleTimeString());
    // };

    // updateTime(); // Set initial time
    // const timeInterval = setInterval(updateTime, 1000);

    return () => {
      clearInterval(fetchInterval);
      // clearInterval(timeInterval);
    };
  }, []);

  const fetchExecs = async () => {
    try {
      const response = await fetch("/api/execs");
      if (!response.ok) throw new Error("Failed to fetch");
      const execsData = await response.json();

      const execs: Record<string, Exec> = {};
      execsData.forEach((exec: any) => {
        execs[exec._id] = ExecSchema.parse(exec);
      });

      setExecs(execs);
    } catch (error) {
      console.error("Error fetching execs:", error);
    }
  };

  const toggleCheckIn = async (execId: string) => {
    const fieldName = `checkIn${selectedDay}`;
    const currentStatus = execs[execId][fieldName as keyof Exec];
    const newStatus = !currentStatus;

    try {
      const response = await fetch("/api/execs", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          execId,
          fieldName,
          newStatus,
        }),
      });

      if (!response.ok) throw new Error("Failed to update");

      setExecs((prevExecs) => ({
        ...prevExecs,
        [execId]: { ...prevExecs[execId], [fieldName]: newStatus },
      }));
    } catch (error) {
      console.error("Error updating check-in status:", error);
    }
  };

  const groupExecsByRoom = (execs: Record<string, Exec>) => {
    const grouped: Record<string, Record<string, Exec>> = {};
    Object.entries(execs).forEach(([id, exec]) => {
      const room = exec.Room;
      if (!grouped[room]) {
        grouped[room] = {};
      }
      grouped[room][id] = exec;
    });
    return grouped;
  };

  const filterRooms = (rooms: Record<string, Record<string, Exec>>) => {
    return Object.entries(rooms).reduce((acc, [room, roomExecs]) => {
      // Apply group filter
      if (
        selectedGroup !== "All" &&
        !Object.values(roomExecs).some(
          (exec) => exec["AZA/BBG"] === selectedGroup
        )
      ) {
        return acc;
      }

      // Apply search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchingExecs = Object.entries(roomExecs).filter(([_, exec]) => {
          return (
            (
              exec["First Name"].toLowerCase() +
              " " +
              exec["Last Name"].toLowerCase()
            ).includes(searchLower) ||
            exec.Chapter?.toLowerCase().includes(searchLower) ||
            exec.Room.toLowerCase().includes(searchLower)
          );
        });

        if (matchingExecs.length > 0) {
          acc[room] = Object.fromEntries(matchingExecs);
        }
        return acc;
      }

      acc[room] = roomExecs;
      return acc;
    }, {} as Record<string, Record<string, Exec>>);
  };

  const calculateProgress = () => {
    const filteredExecs = Object.values(execs).filter(
      (exec) => selectedGroup === "All" || exec["AZA/BBG"] === selectedGroup
    );
    const total = filteredExecs.length;
    const checkedIn = filteredExecs.filter(
      (exec) => exec[`checkIn${selectedDay}` as keyof Exec] === true
    ).length;
    return total > 0 ? (checkedIn / total) * 100 : 0;
  };

  const isRoomFullyCheckedIn = (roomExecs: Record<string, Exec>) => {
    return Object.values(roomExecs).every(
      (exec) => exec[`checkIn${selectedDay}` as keyof Exec] === true
    );
  };

  const countCheckIns = (roomExecs: Record<string, Exec>) => {
    const total = Object.keys(roomExecs).length;
    const checkedIn = Object.values(roomExecs).filter(
      (exec) => exec[`checkIn${selectedDay}` as keyof Exec] === true
    ).length;
    return `${checkedIn}/${total}`;
  };

  const toggleRoomExpansion = (room: string) => {
    setExpandedRooms((prevExpanded) => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(room)) {
        newExpanded.delete(room);
      } else {
        newExpanded.add(room);
      }
      return newExpanded;
    });
  };

  const groupedExecs = filterRooms(groupExecsByRoom(execs));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        {/* Header Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Image
                  src="/bbyo-logo.png"
                  alt="BBYO Logo"
                  width={48}
                  height={48}
                  className="rounded-lg"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    NRE Regional Convention 2025
                  </h1>
                  <p className="text-gray-500">Room Check Dashboard</p>
                </div>
              </div>
              {/* <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">
                  {currentTime || "Loading..."}
                </span>
              </div> */}
            </div>
          </CardContent>
        </Card>

        <Button
          variant="ghost"
          onClick={() => setShowStats(!showStats)}
          className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm">
            {showStats ? "Hide Stats" : "Show Stats"}
          </span>
          {showStats ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {/* Stats Overview - Now Collapsible */}
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Check-ins</p>
                    <h3 className="text-2xl font-bold">
                      {calculateProgress().toFixed(1)}%
                    </h3>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <Progress value={calculateProgress()} className="mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Participants</p>
                    <h3 className="text-2xl font-bold">
                      {Object.keys(execs).length}
                    </h3>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Rooms</p>
                    <h3 className="text-2xl font-bold">
                      {Object.keys(groupedExecs).length}
                    </h3>
                  </div>
                  <Building className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, chapter, or room..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Room List */}
        <div className="space-y-4">
          {Object.entries(groupedExecs).length === 0 ? (
            <Alert>
              <AlertDescription>
                No rooms found matching your search criteria
              </AlertDescription>
            </Alert>
          ) : (
            Object.entries(groupedExecs).map(([room, roomExecs]) => {
              const isFullyCheckedIn = isRoomFullyCheckedIn(roomExecs);
              const isExpanded = expandedRooms.has(room);
              const firstExec = Object.values(roomExecs)[0];

              return (
                <Card
                  key={room}
                  className={`transition-shadow hover:shadow-md ${
                    firstExec["AZA/BBG"] === "AZA" ? "bg-blue-50" : "bg-red-50"
                  }`}
                >
                  <CardHeader
                    className="cursor-pointer hover:bg-opacity-80 transition-colors"
                    onClick={() => toggleRoomExpansion(room)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-semibold">
                          Room {room}
                        </span>
                        <Badge
                          variant={isFullyCheckedIn ? "default" : "secondary"}
                          className={isFullyCheckedIn ? "bg-green-500" : ""}
                        >
                          {countCheckIns(roomExecs)}
                        </Badge>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="space-y-3">
                      {Object.entries(roomExecs).map(([id, exec]) => (
                        <div
                          key={id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {exec["First Name"]} {exec["Last Name"]}
                            </span>
                            <span className="text-sm text-gray-500">
                              {exec.Chapter}
                            </span>
                          </div>
                          <Button
                            onClick={() => toggleCheckIn(id)}
                            variant={
                              exec[`checkIn${selectedDay}` as keyof Exec]
                                ? "secondary"
                                : "default"
                            }
                            className={`min-w-[120px] ${
                              exec[`checkIn${selectedDay}` as keyof Exec]
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-red-500 hover:bg-red-600"
                            } text-white`}
                          >
                            {exec[`checkIn${selectedDay}` as keyof Exec]
                              ? "Checked In"
                              : "Check In"}
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckInScreen;
