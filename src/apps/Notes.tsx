import { useEffect, useState, useRef } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { MdNotes } from "react-icons/md";
import AppsLayout from "./AppsLayout";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const Notes = ({
  onClose,
  clickPosition: _clickPosition,
}: {
  onClose: () => void;
  clickPosition: { x: number; y: number };
}) => {
  const [showLoading, setShowLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load notes from localStorage on mount
  useEffect(() => {
    if (showContent) {
      const savedNotes = localStorage.getItem("notes");
      if (savedNotes) {
        try {
          const parsedNotes = JSON.parse(savedNotes);
          // Convert date strings back to Date objects and ensure content exists
          const notesWithDates = parsedNotes.map((note: any) => ({
            ...note,
            content: note.content || "",
            title: note.title || "New Note",
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
          }));
          setNotes(notesWithDates);
        } catch (error) {
          console.error("Error loading notes from localStorage:", error);
          // Initialize with sample note if error
          const sampleNotes: Note[] = [
            {
              id: "1",
              title: "Welcome to Notes",
              content: "",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
          setNotes(sampleNotes);
        }
      } else {
        // Don't initialize with sample note - start with empty array
        // User can create their own notes
        setNotes([]);
      }
    }
  }, [showContent]);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    if (showContent) {
      try {
        // Save notes array (even if empty) to localStorage
        localStorage.setItem("notes", JSON.stringify(notes));
      } catch (error) {
        console.error("Error saving notes to localStorage:", error);
      }
    }
  }, [notes, showContent]);

  useEffect(() => {
    // Show loading screen for 1.5 seconds
    const timer = setTimeout(() => {
      setShowLoading(false);
      setShowContent(true);
      // Dispatch event when content is shown
      window.dispatchEvent(
        new CustomEvent("notesContentShown", { detail: { shown: true } })
      );
    }, 1500);

    return () => {
      clearTimeout(timer);
      // Dispatch event when Notes app is closed/unmounted
      window.dispatchEvent(
        new CustomEvent("notesAppClosed", { detail: { closed: true } })
      );
      // Clean up save timeout on unmount
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Sync noteContent and noteTitle when selectedNote ID changes (not when notes changes to avoid overwriting user input)
  useEffect(() => {
    if (selectedNote) {
      // Find the latest version of the note from the notes array
      const latestNote = notes.find((n) => n.id === selectedNote.id);
      const noteToUse = latestNote || selectedNote;
      setNoteTitle(noteToUse.title || "");
      setNoteContent(noteToUse.content || "");
    } else {
      setNoteTitle("");
      setNoteContent("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNote?.id]); // Only sync when selected note ID changes, not when notes array updates

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "New Note",
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setNoteTitle(newNote.title || "");
    setNoteContent(newNote.content || "");
  };

  const handleSelectNote = (note: Note) => {
    // Find the latest version from the notes array to ensure we have the most up-to-date content
    const latestNote = notes.find((n) => n.id === note.id) || note;
    setSelectedNote(latestNote);
    // The useEffect will sync the content, but we can also set it here for immediate update
    setNoteTitle(latestNote.title || "");
    setNoteContent(latestNote.content || "");
  };

  const handleSaveNote = (title?: string, content?: string) => {
    if (!selectedNote) return;

    // Use provided values or current state values
    const titleToSave = title !== undefined ? title : noteTitle;
    const contentToSave = content !== undefined ? content : noteContent;

    const updatedNote: Note = {
      ...selectedNote,
      title: titleToSave.trim() || "New Note",
      content: contentToSave,
      updatedAt: new Date(),
    };

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === selectedNote.id ? updatedNote : note
      )
    );
    setSelectedNote(updatedNote);
  };

  // Auto-save function with debouncing - saves to localStorage as you type
  const scheduleSave = (title?: string, content?: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      handleSaveNote(title, content);
    }, 300); // Save 300ms after user stops typing (reduced from 500ms for faster saves)
  };

  if (showLoading) {
    return (
      <div className="w-151 h-321.5 rounded-[71px] relative flex items-center justify-center overflow-hidden bg-yellow-400">
        <div
          className="flex flex-col items-center space-y-4 animate-fadeInFromCenter"
          style={{
            transformOrigin: "50% 100%",
            animation:
              "appOpen 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          }}
        >
          <MdNotes className="text-white text-6xl" />
          <div className="text-white text-2xl font-semibold">Notes</div>
        </div>
      </div>
    );
  }

  if (showContent) {
    // Show note editor if a note is selected
    if (selectedNote) {
      return (
        <AppsLayout
          onClose={() => setSelectedNote(null)}
          title="Notes"
          textColor="text-gray-200"
          statusBarTextColor="text-black"
          batteryColorScheme="light"
        >
          <div className="h-full flex flex-col bg-gradient-to-b from-amber-50 to-yellow-50 pt-30">
            {/* Note Editor */}
            <div className="flex-1 flex flex-col bg-gradient-to-b from-amber-50 to-yellow-50 overflow-hidden relative z-10">
              {/* Title Input */}
              <div className="px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-200 flex-shrink-0 relative z-10">
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => {
                    e.stopPropagation();
                    const newTitle = e.target.value;
                    setNoteTitle(newTitle);
                    scheduleSave(newTitle, noteContent);
                  }}
                  onBlur={(e) => {
                    e.stopPropagation();
                    handleSaveNote();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.currentTarget.focus();
                  }}
                  placeholder="Title"
                  className="w-full text-xl font-semibold outline-none bg-transparent text-gray-900 pointer-events-auto select-text"
                  autoFocus
                  style={{
                    pointerEvents: "auto",
                    zIndex: 10,
                    userSelect: "text",
                    WebkitUserSelect: "text",
                  }}
                />
              </div>

              {/* Content Textarea */}
              <div className="flex-1 px-4 py-4 flex flex-col min-h-0 relative z-10 bg-white/50 overflow-auto">
                <textarea
                  value={noteContent}
                  onChange={(e) => {
                    e.stopPropagation();
                    const newValue = e.target.value;
                    setNoteContent(newValue);
                    scheduleSave(noteTitle, newValue);
                  }}
                  onBlur={(e) => {
                    e.stopPropagation();
                    // Clear any pending save and save immediately
                    if (saveTimeoutRef.current) {
                      clearTimeout(saveTimeoutRef.current);
                    }
                    handleSaveNote();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.currentTarget.focus();
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                  }}
                  placeholder="Start writing..."
                  className="flex-1 w-full text-base outline-none resize-none bg-transparent text-gray-900 leading-relaxed pointer-events-auto select-text min-h-[200px]"
                  style={{
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    pointerEvents: "auto",
                    zIndex: 10,
                    userSelect: "text",
                    WebkitUserSelect: "text",
                    minHeight: "200px",
                  }}
                />
              </div>
            </div>
          </div>
        </AppsLayout>
      );
    }

    // Show notes list
    return (
      <AppsLayout onClose={onClose} title="Notes" statusBarTextColor="text-black" batteryColorScheme="light">
        <div className="h-full flex flex-col bg-gradient-to-b from-amber-50 to-yellow-50 pt-30">
          {/* Notes List */}
          <div className="flex-1 overflow-y-auto">
            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MdNotes className="text-6xl mb-4 opacity-30" />
                <p className="text-lg">No notes</p>
              </div>
            ) : (
              <div>
                {notes.map((note) => {
                  const preview = note.content.split("\n")[0].substring(0, 60);
                  const date = note.updatedAt.toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    year:
                      note.updatedAt.getFullYear() !== new Date().getFullYear()
                        ? "numeric"
                        : undefined,
                  });
                  const isSelected =
                    (selectedNote as Note | null)?.id === note.id;

                  return (
                    <div
                      key={note.id}
                      className="px-4 py-3 border-b border-gray-200 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => handleSelectNote(note)}
                        >
                          <h3 className="font-semibold text-gray-900 truncate text-base mb-1">
                            {note.title || "New Note"}
                          </h3>
                          {preview && (
                            <p className="text-sm text-gray-600 truncate mb-1">
                              {preview}
                              {note.content.length > 60 ? "..." : ""}
                            </p>
                          )}
                          <span className="text-xs text-gray-500">{date}</span>
                        </div>
                        <div className="flex items-center ml-2 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              // If this note is currently selected, clear selection
                              if (isSelected) {
                                setSelectedNote(null);
                                setNoteTitle("");
                                setNoteContent("");
                              }
                              // Remove the note from the list using functional update
                              setNotes((prevNotes) =>
                                prevNotes.filter((n) => n.id !== note.id)
                              );
                            }}
                            className="text-red-500 hover:text-red-600 active:text-red-700 transition-colors p-2 -mr-2"
                            type="button"
                          >
                            <FaTrash className="text-xl" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Floating Action Button */}
          <button
            onClick={handleCreateNote}
            className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:from-yellow-600 hover:to-yellow-700 hover:shadow-3xl transition-all duration-300 z-50 transform hover:scale-110 active:scale-105"
            style={{
              boxShadow:
                "0 10px 40px rgba(234, 179, 8, 0.4), 0 0 20px rgba(234, 179, 8, 0.2)",
            }}
          >
            <FaPlus className="text-2xl font-bold" />
          </button>
        </div>
      </AppsLayout>
    );
  }

  return null;
};

export default Notes;
