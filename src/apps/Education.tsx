import { useEffect, useState } from "react";
import AppsLayout from "./AppsLayout";

interface EducationItem {
  id: number;
  institution: string;
  degree: string;
  field: string;
  period: string;
  description?: string;
  courses?: string[];
  achievements?: string[];
  url: string;
}

const Education = ({
  onClose,
  clickPosition,
}: {
  onClose: () => void;
  clickPosition: { x: number; y: number };
}) => {
  const [showLoading, setShowLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
      setShowContent(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Education data
  const educationData: EducationItem[] = [
    {
      id: 1,
      institution: "Western Norway University of Applied Sciences",
      degree: "Bachelor's Degree",
      field: "Automation and Robotics",
      period: "2020 - 2023",
      description: "Bachelor in Automation and Robotics",
      url: "https://www.hvl.no/en/",
    },
    {
      id: 2,
      institution: "Hyperskill",
      degree: "Certificate",
      field: "Java Backend Developer",
      period: "2024",
      description: "Java Backend Developer Certificate",
      url: "https://hyperskill.org/",
    },
    {
      id: 3,
      institution: "Threejs-Journey",
      degree: "Certificate",
      field: "Three.js Developer",
      period: "2025",
      description: "Three.js Developer Certificate",
      url: "https://threejs-journey.com/",
    },
    {
      id: 4,
      institution: "Tridium University",
      degree: "Certificate",
      field: "Niagara N4 Developer",
      period: "2025",
      description: "Niagara N4 Developer Certificate",
      url: "https://www.tridium.com/",
    },
  ];

  if (showLoading) {
    return (
      <div className="w-151 h-321.5 rounded-[71px] relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600">
        <div
          className="flex flex-col items-center space-y-4"
          style={{
            transformOrigin: `${clickPosition.x}px ${clickPosition.y}px`,
            animation:
              "iosAppOpen 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
          }}
        >
          <div className="text-white text-6xl">🎓</div>
          <div className="text-white text-2xl font-semibold">Education</div>
        </div>
      </div>
    );
  }

  if (showContent) {
    // Main view: Education list
    return (
      <AppsLayout onClose={onClose} title="Education">
        <div className="h-full flex flex-col bg-gradient-to-b from-purple-500 via-indigo-600 to-blue-700 pt-30">
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-3">
              {educationData.map((education) => (
                <button
                  key={education.id}
                  onClick={() => {
                    window.open(education.url, "_blank", "noopener,noreferrer");
                  }}
                  className="w-full bg-white/20 backdrop-blur-md rounded-2xl p-5 border border-white/30 shadow-lg hover:bg-white/25 transition-all duration-200 hover:scale-[1.02] active:scale-95 text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl flex-shrink-0">🎓</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-bold text-lg mb-1">
                        {education.institution}
                      </div>
                      <div className="text-white/90 text-base font-semibold mb-1">
                        {education.degree}
                      </div>
                      <div className="text-white/80 text-sm mb-2">
                        {education.field}
                      </div>
                      <div className="text-white/70 text-xs">
                        {education.period}
                      </div>
                    </div>
                    <div className="text-white/60 text-xl flex-shrink-0">→</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </AppsLayout>
    );
  }

  return null;
};

export default Education;
