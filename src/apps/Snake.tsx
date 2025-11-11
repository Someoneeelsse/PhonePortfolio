import { useEffect, useState, useCallback, useRef } from "react";
import { MdVideogameAsset } from "react-icons/md";
import AppsLayout from "./AppsLayout";

const CELL_SIZE = 15; // Fixed 10px x 10px cells
const GRID_WIDTH = 38; // Number of cells horizontally
const GRID_HEIGHT = 65; // Number of cells vertically

interface Position {
  x: number;
  y: number;
}

const Snake = ({
  onClose,
  clickPosition,
}: {
  onClose: () => void;
  clickPosition: { x: number; y: number };
}) => {
  const [showLoading, setShowLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [controlMode, setControlMode] = useState<"keyboard" | "touch" | null>(
    null
  );
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [snake, setSnake] = useState<Position[]>([
    { x: Math.floor(GRID_WIDTH / 2), y: Math.floor(GRID_HEIGHT / 2) },
  ]);
  const [food, setFood] = useState<Position>({
    x: Math.floor(GRID_WIDTH / 2) + 5,
    y: Math.floor(GRID_HEIGHT / 2) + 5,
  });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<number | null>(null);
  const directionRef = useRef<Position>({ x: 1, y: 0 });
  const pausedRef = useRef(false);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const isSwipeActiveRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
      setShowContent(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Load high score from localStorage on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem("snakeHighScore");
    if (savedHighScore) {
      try {
        const parsedScore = parseInt(savedHighScore, 10);
        if (!isNaN(parsedScore)) {
          setHighScore(parsedScore);
        }
      } catch (error) {
        console.error("Error loading high score:", error);
      }
    }
  }, []);

  // Generate random food position
  const generateFood = useCallback((): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT),
      };
    } while (
      snake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      )
    );
    return newFood;
  }, [snake]);

  // Check collision
  const checkCollision = useCallback(
    (head: Position, body: Position[]): boolean => {
      // Wall collision
      if (
        head.x < 0 ||
        head.x >= GRID_WIDTH ||
        head.y < 0 ||
        head.y >= GRID_HEIGHT
      ) {
        return true;
      }
      // Self collision
      return body.some(
        (segment) => segment.x === head.x && segment.y === head.y
      );
    },
    []
  );

  // Update high score when game ends
  useEffect(() => {
    if (gameOver && score > highScore) {
      const newHighScore = score;
      localStorage.setItem("snakeHighScore", newHighScore.toString());
      setHighScore(newHighScore);
    }
  }, [gameOver, score, highScore]);

  // Game loop
  useEffect(() => {
    if (!showContent || gameOver || isPaused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    gameLoopRef.current = window.setInterval(() => {
      setSnake((prevSnake) => {
        const dir = directionRef.current;
        const head = prevSnake[0];
        const newHead: Position = {
          x: head.x + dir.x,
          y: head.y + dir.y,
        };

        // Check collision
        if (checkCollision(newHead, prevSnake)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check if food eaten
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((prev) => prev + 10);
          setFood(generateFood());
        } else {
          newSnake.pop(); // Remove tail if no food eaten
        }

        return newSnake;
      });
    }, 150); // Game speed

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [showContent, gameOver, isPaused, food, checkCollision, generateFood]);

  // Handle keyboard input (only for keyboard mode)
  useEffect(() => {
    if (!showContent || gameOver || controlMode !== "keyboard") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (pausedRef.current) {
        if (
          e.key === " " ||
          e.key === "w" ||
          e.key === "a" ||
          e.key === "s" ||
          e.key === "d"
        ) {
          pausedRef.current = false;
          setIsPaused(false);
        }
        return;
      }

      const dir = directionRef.current;
      let newDirection: Position | null = null;

      switch (e.key.toLowerCase()) {
        case "arrowup":
        case "w":
          if (dir.y === 0) newDirection = { x: 0, y: -1 };
          break;
        case "arrowdown":
        case "s":
          if (dir.y === 0) newDirection = { x: 0, y: 1 };
          break;
        case "arrowleft":
        case "a":
          if (dir.x === 0) newDirection = { x: -1, y: 0 };
          break;
        case "arrowright":
        case "d":
          if (dir.x === 0) newDirection = { x: 1, y: 0 };
          break;
        case " ":
          pausedRef.current = true;
          setIsPaused(true);
          break;
      }

      if (newDirection) {
        directionRef.current = newDirection;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showContent, gameOver, controlMode]);

  // Handle swipe gestures for touch/mouse mode
  const handleSwipe = useCallback(
    (newDir: Position) => {
      if (controlMode !== "touch" || gameOver || isPaused) return;

      const dir = directionRef.current;

      // Prevent reversing direction directly
      if (
        (newDir.x === -dir.x && dir.x !== 0) ||
        (newDir.y === -dir.y && dir.y !== 0)
      ) {
        return;
      }

      // Prevent changing to same axis if already moving
      if ((newDir.x !== 0 && dir.x !== 0) || (newDir.y !== 0 && dir.y !== 0)) {
        return;
      }

      directionRef.current = newDir;
    },
    [controlMode, gameOver, isPaused]
  );

  // Get coordinates from touch or mouse event
  const getCoordinates = useCallback(
    (
      e: TouchEvent | MouseEvent,
      useChangedTouches = false
    ): { x: number; y: number } => {
      // For touch events, check changedTouches first (used for touchend)
      if ("touches" in e || "changedTouches" in e) {
        const touchEvent = e as TouchEvent;
        if (
          useChangedTouches &&
          touchEvent.changedTouches &&
          touchEvent.changedTouches.length > 0
        ) {
          return {
            x: touchEvent.changedTouches[0].clientX,
            y: touchEvent.changedTouches[0].clientY,
          };
        }
        if (touchEvent.touches && touchEvent.touches.length > 0) {
          return {
            x: touchEvent.touches[0].clientX,
            y: touchEvent.touches[0].clientY,
          };
        }
      }
      if ("clientX" in e) {
        return { x: e.clientX, y: e.clientY };
      }
      return { x: 0, y: 0 };
    },
    []
  );

  // Handle touch/mouse swipe start
  const handleSwipeStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (controlMode !== "touch" || gameOver || isPaused) return;

      const coords = getCoordinates(e.nativeEvent);
      swipeStartRef.current = coords;
      isSwipeActiveRef.current = true;
    },
    [controlMode, gameOver, isPaused, getCoordinates]
  );

  // Handle touch/mouse swipe move
  const handleSwipeMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!isSwipeActiveRef.current || !swipeStartRef.current) return;
      e.preventDefault(); // Prevent scrolling while swiping
    },
    []
  );

  // Handle touch/mouse swipe end
  const handleSwipeEnd = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!isSwipeActiveRef.current || !swipeStartRef.current) {
        isSwipeActiveRef.current = false;
        return;
      }

      // Use changedTouches for touch events (needed for touchend)
      const isTouchEvent =
        "touches" in e.nativeEvent || "changedTouches" in e.nativeEvent;
      const coords = getCoordinates(e.nativeEvent, isTouchEvent);
      const start = swipeStartRef.current;

      const deltaX = coords.x - start.x;
      const deltaY = coords.y - start.y;

      // Minimum swipe distance to register (30px)
      const minSwipeDistance = 30;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (absDeltaX < minSwipeDistance && absDeltaY < minSwipeDistance) {
        isSwipeActiveRef.current = false;
        swipeStartRef.current = null;
        return;
      }

      // Determine swipe direction based on dominant axis
      let newDirection: Position | null = null;

      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0) {
          newDirection = { x: 1, y: 0 }; // Right
        } else {
          newDirection = { x: -1, y: 0 }; // Left
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          newDirection = { x: 0, y: 1 }; // Down
        } else {
          newDirection = { x: 0, y: -1 }; // Up
        }
      }

      if (newDirection) {
        handleSwipe(newDirection);
      }

      isSwipeActiveRef.current = false;
      swipeStartRef.current = null;
    },
    [getCoordinates, handleSwipe]
  );

  // Handle click on game area for pause/play (only in keyboard mode)
  const handleGameAreaClick = () => {
    if (gameOver || controlMode !== "keyboard") return;
    pausedRef.current = !pausedRef.current;
    setIsPaused(!isPaused);
  };

  // Reset game
  const handleReset = () => {
    const startX = Math.floor(GRID_WIDTH / 2);
    const startY = Math.floor(GRID_HEIGHT / 2);
    setSnake([{ x: startX, y: startY }]);
    setFood(generateFood());
    directionRef.current = { x: 1, y: 0 };
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    pausedRef.current = false;
  };

  // Start game with selected control mode
  const handleStartGame = (mode: "keyboard" | "touch") => {
    setControlMode(mode);
    const startX = Math.floor(GRID_WIDTH / 2);
    const startY = Math.floor(GRID_HEIGHT / 2);
    setSnake([{ x: startX, y: startY }]);
    setFood(generateFood());
    directionRef.current = { x: 1, y: 0 };
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  };

  if (showLoading) {
    return (
      <div className="w-151 h-321.5 rounded-[71px] relative flex items-center justify-center overflow-hidden bg-green-500">
        <div
          className="flex flex-col items-center space-y-4"
          style={{
            transformOrigin: `${clickPosition.x}px ${clickPosition.y}px`,
            animation:
              "iosAppOpen 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
          }}
        >
          <MdVideogameAsset className="text-white text-6xl" />
          <div className="text-white text-2xl font-semibold">Snake</div>
        </div>
      </div>
    );
  }

  if (showContent) {
    // Show control selection screen if not selected yet
    if (!controlMode) {
      return (
        <AppsLayout onClose={onClose} title="Snake">
          <div className="h-full flex flex-col bg-black pt-30">
            <div className="flex-1 flex flex-col items-center justify-center bg-black px-4">
              <div className="text-white text-2xl font-bold mb-8">
                Choose Control Method
              </div>

              <div className="flex flex-col gap-4 w-full max-w-xs">
                <button
                  onClick={() => handleStartGame("keyboard")}
                  className="px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
                >
                  ⌨️ Keyboard (Arrows / WASD)
                </button>

                <button
                  onClick={() => handleStartGame("touch")}
                  className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
                >
                  👆 Touch / Mouse Swipe
                </button>
              </div>
            </div>
          </div>
        </AppsLayout>
      );
    }

    return (
      <AppsLayout onClose={onClose} title="Snake">
        <div className="h-full flex flex-col bg-black pt-30">
          {/* Score and Controls */}
          <div className="px-4 py-3 bg-gray-900 flex items-center justify-between border-b border-gray-800">
            <div className="flex items-center gap-4">
              <div className="text-white text-lg font-bold">Score: {score}</div>
              <div className="text-white text-lg font-bold">
                High Score: {highScore}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setControlMode(null)}
                className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-xs font-medium"
              >
                Change Controls
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Game Area */}
          <div
            ref={gameAreaRef}
            className="flex-1 flex items-center justify-center bg-black relative overflow-hidden p-2"
            onClick={
              controlMode === "keyboard" ? handleGameAreaClick : undefined
            }
            onTouchStart={
              controlMode === "touch" ? handleSwipeStart : undefined
            }
            onTouchMove={controlMode === "touch" ? handleSwipeMove : undefined}
            onTouchEnd={controlMode === "touch" ? handleSwipeEnd : undefined}
            onMouseDown={controlMode === "touch" ? handleSwipeStart : undefined}
            onMouseMove={controlMode === "touch" ? handleSwipeMove : undefined}
            onMouseUp={controlMode === "touch" ? handleSwipeEnd : undefined}
            onMouseLeave={
              controlMode === "touch"
                ? (e) => {
                    if (isSwipeActiveRef.current) {
                      handleSwipeEnd(e);
                    }
                  }
                : undefined
            }
          >
            <div
              className="relative mx-auto"
              style={{
                width: `${GRID_WIDTH * CELL_SIZE}px`,
                height: `${GRID_HEIGHT * CELL_SIZE}px`,
                border: "2px solid #ffffff",
              }}
            >
              {/* Grid Background */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #1a1a1a 1px, transparent 1px),
                    linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)
                  `,
                  backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
                }}
              />

              {/* Food */}
              <div
                className="absolute bg-red-500 rounded-sm"
                style={{
                  left: `${food.x * CELL_SIZE}px`,
                  top: `${food.y * CELL_SIZE}px`,
                  width: `${CELL_SIZE - 2}px`,
                  height: `${CELL_SIZE - 2}px`,
                  boxShadow: "0 0 10px rgba(239, 68, 68, 0.5)",
                }}
              />

              {/* Snake */}
              {snake.map((segment, index) => (
                <div
                  key={index}
                  className="absolute bg-green-500 rounded-sm"
                  style={{
                    left: `${segment.x * CELL_SIZE}px`,
                    top: `${segment.y * CELL_SIZE}px`,
                    width: `${CELL_SIZE - 2}px`,
                    height: `${CELL_SIZE - 2}px`,
                    backgroundColor: index === 0 ? "#22c55e" : "#16a34a",
                    boxShadow:
                      index === 0 ? "0 0 10px rgba(34, 197, 94, 0.5)" : "none",
                  }}
                />
              ))}

              {/* Game Over Overlay */}
              {gameOver && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
                  <div className="text-white text-3xl font-bold mb-4">
                    Game Over!
                  </div>
                  <div className="text-white text-xl mb-6">
                    Final Score: {score}
                  </div>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
                  >
                    Play Again
                  </button>
                </div>
              )}

              {/* Pause Overlay */}
              {isPaused && !gameOver && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-40">
                  <div className="text-white text-2xl font-bold">Paused</div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="px-4 py-3 bg-gray-900 border-t border-gray-800">
            <div className="text-gray-400 text-xs text-center">
              {controlMode === "keyboard"
                ? "Use Arrow Keys / WASD to move • Space to pause"
                : "Swipe in any direction to move the snake"}
            </div>
          </div>
        </div>
      </AppsLayout>
    );
  }

  return null;
};

export default Snake;
