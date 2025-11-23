import { useEffect, useState } from "react";
import AppsLayout from "./AppsLayout";

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
  clickPosition,
}: {
  onClose: () => void;
  clickPosition: { x: number; y: number };
}) => {
  const [showLoading, setShowLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");

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

  const handleAddEvent = () => {
    if (selectedDate && newEventTitle.trim()) {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: newEventTitle,
        date: new Date(selectedDate),
        time: newEventTime || undefined,
        color: "#3b82f6", // Default blue color
      };
      setEvents((prev) => [...prev, newEvent]);
      setNewEventTitle("");
      setNewEventTime("");
      setShowEventModal(false);
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
          className="flex flex-col items-center space-y-4"
          style={{
            transformOrigin: `${clickPosition.x}px ${clickPosition.y}px`,
            animation:
              "iosAppOpen 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
          }}
        >
          <div className="text-white text-6xl">📅</div>
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
      <AppsLayout onClose={onClose} title="Calendar" statusBarTextColor="text-black" batteryColorScheme="light">
        <div className="h-full flex flex-col bg-white pt-30">
          {/* Header with Month Navigation */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <span className="text-xl">←</span>
              </button>
              <div className="text-lg font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </div>
              <button
                onClick={() => navigateMonth("next")}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <span className="text-xl">→</span>
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {/* Day Names Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
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
                    className={`aspect-square flex flex-col items-center justify-center p-1 rounded-lg transition-colors relative ${
                      !isCurrentMonth
                        ? "text-gray-300"
                        : isSelectedDate
                        ? "bg-blue-500 text-white"
                        : isTodayDate
                        ? "bg-blue-100 text-blue-600 font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-sm">{date.getDate()}</span>
                    {hasEventForDate && isCurrentMonth && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Events */}
            {selectedDate && selectedDateEvents.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="text-sm font-semibold text-gray-700 mb-3">
                  Events for{" "}
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="space-y-2">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="bg-blue-50 border-l-4 border-blue-500 rounded p-3 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900">
                          {event.title}
                        </div>
                        {event.time && (
                          <div className="text-xs text-gray-600 mt-1">
                            {event.time}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-500 hover:text-red-700 text-xs px-2 py-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Event Button */}
            {selectedDate && (
              <div className="mt-6">
                <button
                  onClick={() => setShowEventModal(true)}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm"
                >
                  + Add Event
                </button>
              </div>
            )}
          </div>

          {/* Event Modal */}
          {showEventModal && selectedDate && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-80 max-w-[90%]">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Add Event
                </h3>
                <div className="text-sm text-gray-600 mb-4">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <input
                  type="text"
                  placeholder="Event title"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 text-sm outline-none focus:border-blue-500"
                  autoFocus
                />
                <input
                  type="time"
                  placeholder="Time (optional)"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 text-sm outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowEventModal(false);
                      setNewEventTitle("");
                      setNewEventTime("");
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEvent}
                    disabled={!newEventTitle.trim()}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppsLayout>
    );
  }

  return null;
};

export default Calendar;
