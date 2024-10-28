"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  PlayCircle,
  PauseCircle,
  StopCircle,
  Download,
  Trash2,
} from "lucide-react";
import NumberFlow from "@number-flow/react";

interface TimerPeriod {
  startTime: Date;
  endTime: Date;
  duration: number;
}

interface TimerState {
  isRunning: boolean;
  currentStartTime: string | null;
  lastRecordedTime: number;
}

export default function Timer() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [periods, setPeriods] = useLocalStorage<TimerPeriod[]>(
    "timer-periods",
    []
  );
  const [currentStartTime, setCurrentStartTime] = useState<Date | null>(null);
  const [timerState, setTimerState] = useLocalStorage<TimerState>(
    "timer-state",
    {
      isRunning: false,
      currentStartTime: null,
      lastRecordedTime: 0,
    }
  );
  const periodsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (periods) {
      setPeriods(
        periods.map((period) => ({
          ...period,
          startTime: new Date(period.startTime),
          endTime: new Date(period.endTime),
        }))
      );
    }
  }, []);

  useEffect(() => {
    if (timerState.isRunning && timerState.currentStartTime) {
      const startTime = new Date(timerState.currentStartTime);
      const elapsedSinceReload = Date.now() - startTime.getTime();
      setTime(timerState.lastRecordedTime + elapsedSinceReload);
      setIsRunning(true);
      setCurrentStartTime(startTime);
    }
  }, []);

  useEffect(() => {
    setTimerState({
      isRunning,
      currentStartTime: currentStartTime?.toISOString() || null,
      lastRecordedTime: time,
    });
  }, [isRunning, currentStartTime, time]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning) {
      intervalId = setInterval(() => {
        setTime((prev) => prev + 1000);
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    periodsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [periods]);

  useEffect(() => {
    document.title = `${formatTime(time)} - Cronômetro`;

    return () => {
      document.title = "Cronômetro";
    };
  }, [time]);

  function handleStart() {
    setIsRunning(true);
    const now = new Date();
    setCurrentStartTime(now);
  }

  function handlePause() {
    setIsRunning(false);
    if (currentStartTime) {
      const newPeriod: TimerPeriod = {
        startTime: currentStartTime,
        endTime: new Date(),
        duration: time,
      };
      setPeriods((prev) => [...prev, newPeriod]);
    }
  }

  function handleStop() {
    handlePause();
    setTime(0);
    setCurrentStartTime(null);
  }

  function handleClear() {
    setPeriods([]);
    setTime(0);
    setIsRunning(false);
    setCurrentStartTime(null);
    setTimerState({
      isRunning: false,
      currentStartTime: null,
      lastRecordedTime: 0,
    });
  }

  function calculateTime(ms: number) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const hours = Math.floor(ms / 1000 / 60 / 60);
    return { hours, minutes, seconds };
  }

  function formatTime(ms: number): string {
    const { hours, minutes, seconds } = calculateTime(ms);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  function getTotalTime(): number {
    return periods.reduce((acc, period) => acc + period.duration, 0);
  }

  function handleExport() {
    const content = periods
      .map(
        (period, index) =>
          `Período ${index + 1}:\nInício: ${period.startTime.toLocaleString()}\nFim: ${period.endTime.toLocaleString()}\nDuração: ${formatTime(
            period.duration
          )}\n\n`
      )
      .join("");

    const totalContent = `${content}Tempo Total: ${formatTime(getTotalTime())}`;
    const blob = new Blob([totalContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `boletim-${new Date().toISOString()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const {
    hours: currentHours,
    minutes: currentMinutes,
    seconds: currentSeconds,
  } = calculateTime(time);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-4xl font-bold">
          <NumberFlow
            value={currentHours}
            format={{
              minimumIntegerDigits: 2,
            }}
            trend="increasing"
          />

          <span className="mx-1">:</span>

          <NumberFlow
            value={currentMinutes}
            format={{
              minimumIntegerDigits: 2,
            }}
            trend="increasing"
          />

          <span className="mx-1">:</span>

          <NumberFlow
            value={currentSeconds}
            format={{
              minimumIntegerDigits: 2,
            }}
            trend="increasing"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center space-x-2">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              variant="outline"
              size="icon"
              className="w-12 h-12"
              title="Iniciar"
            >
              <PlayCircle className="h-8 w-8" />
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              variant="outline"
              size="icon"
              className="w-12 h-12"
              title="Pausar"
            >
              <PauseCircle className="h-8 w-8" />
            </Button>
          )}
          <Button
            onClick={handleStop}
            variant="outline"
            size="icon"
            className="w-12 h-12"
            title="Parar"
          >
            <StopCircle className="h-8 w-8" />
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            size="icon"
            className="w-12 h-12"
            disabled={periods.length === 0}
            title="Exportar"
          >
            <Download className="h-8 w-8" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="w-12 h-12"
                disabled={periods.length === 0}
                title="Limpar períodos"
              >
                <Trash2 className="h-8 w-8" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar todos os períodos?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Todos os períodos registrados
                  serão permanentemente removidos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleClear}>
                  Sim, limpar tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Períodos Registrados:</h3>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {periods.map((period, index) => (
              <div
                key={index}
                className="p-2 bg-secondary rounded-lg text-sm space-y-1"
              >
                <div>Período {index + 1}</div>
                <div>Duração: {formatTime(period.duration)}</div>
              </div>
            ))}
            <div ref={periodsEndRef} />
          </div>
          {periods.length > 0 && (
            <div className="pt-2 font-semibold">
              Tempo Total: {formatTime(getTotalTime())}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
