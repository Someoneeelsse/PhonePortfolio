import { useEffect, useState } from "react";
import AppsLayout from "./AppsLayout";
import { IoCalendarClearOutline } from "react-icons/io5";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  description?: string;
  color: string;
}

const Calendar = ({
  onClose,
  clickPosition: _clickPosition,
}: {
  onClose: () => void;
  clickPosition: { x: number; y: number };
}) => {
  const [showLoading, setShowLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
      setShowContent(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Load events from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem("calendarEvents");
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
          ...event,
          date: new Date(event.date),
        }));
        setEvents(parsedEvents);
      } catch (error) {
        console.error("Error loading events:", error);
      }
    }
  }, []);

  // Save events to localStorage
  useEffect(() => {
    if (events.length > 0 || localStorage.getItem("calendarEvents")) {
      localStorage.setItem("calendarEvents", JSON.stringify(events));
    }
  }, [events]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const hasEvent = (date: Date) => {
    return events.some(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    );
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    );
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dateEvents = getEventsForDate(date);
    if (dateEvents.length > 0) {
      // Could show event details here
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventId));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      days.push(date);
    }

    return days;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (showLoading) {
    return (
      <div className="w-151 h-321.5 rounded-[71px] relative flex items-center justify-center overflow-hidden bg-red-600">
        <div
          className="flex flex-col items-center space-y-4 animate-fadeInFromCenter"
          style={{
            transformOrigin: "50% 100%",
            animation:
              "appOpen 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          }}
        >
          <div className="text-white text-6xl">
            <IoCalendarClearOutline />
          </div>
          <div className="text-white text-2xl font-semibold">Calendar</div>
        </div>
      </div>
    );
  }

  if (showContent) {
    const calendarDays = renderCalendar();
    const selectedDateEvents = selectedDate
      ? getEventsForDate(selectedDate)
      : [];

    return (
      <AppsLayout
        onClose={onClose}
        title="Calendar"
        statusBarTextColor="text-black"
        batteryColorScheme="light"
      >
        <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-white pt-30">
          {/* Header with Month Navigation */}
          <div className="px-6 py-4 bg-white border-b border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigateMonth("prev");
                }}
                className="p-2 text-gray-700 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-all"
                type="button"
              >
                <span className="text-2xl font-light">←</span>
              </button>
              <div className="text-xl font-bold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigateMonth("next");
                }}
                className="p-2 text-gray-700 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-all"
                type="button"
              >
                <span className="text-2xl font-light">→</span>
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {/* Day Names Header */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-bold text-gray-600 py-2 uppercase tracking-wide"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return (
                    <div key={`empty-${index}`} className="aspect-square" />
                  );
                }

                const isCurrentMonth =
                  date.getMonth() === currentDate.getMonth();
                const isTodayDate = isToday(date);
                const isSelectedDate = isSelected(date);
                const hasEventForDate = hasEvent(date);

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => handleDateClick(date)}
                    type="button"
                    className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all relative ${
                      !isCurrentMonth
                        ? "text-gray-300"
                        : isSelectedDate
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-105"
                        : isTodayDate
                        ? "bg-blue-100 text-blue-600 font-bold ring-2 ring-blue-300"
                        : "text-gray-700 hover:bg-gray-100 active:scale-95"
                    }`}
                  >
                    <span
                      className={`text-base font-medium ${
                        isSelectedDate ? "text-white" : ""
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {hasEventForDate && isCurrentMonth && (
                      <div
                        className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                          isSelectedDate ? "bg-white" : "bg-blue-500"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Events */}
            {selectedDate && selectedDateEvents.length > 0 && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <div className="text-base font-bold text-gray-900 mb-4">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-xl p-4 flex items-center justify-between shadow-sm"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900 mb-1">
                          {event.title}
                        </div>
                        {event.time && (
                          <div className="text-xs text-gray-600 font-medium">
                            🕐 {event.time}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(event.id);
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-2 transition-colors text-lg font-bold"
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Date Info (when no events) */}
            {selectedDate && selectedDateEvents.length === 0 && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <div className="text-base font-bold text-gray-900 mb-2">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="text-sm text-gray-500">No events scheduled</div>
              </div>
            )}
          </div>
        </div>
      </AppsLayout>
    );
  }

  return null;
};

export default Calendar;
