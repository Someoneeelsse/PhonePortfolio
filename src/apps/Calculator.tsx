import { useEffect, useState } from "react";
import { FaCalculator } from "react-icons/fa";
import { FaBackspace } from "react-icons/fa";
import AppsLayout from "./AppsLayout";

const Calculator = ({
  onClose,
  clickPosition: _clickPosition,
}: {
  onClose: () => void;
  clickPosition: { x: number; y: number };
}) => {
  const [showLoading, setShowLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [equation, setEquation] = useState("");
  const [_, setEquationHistory] = useState<string[]>([]);

  useEffect(() => {
    // Show loading screen for 1.5 seconds
    const timer = setTimeout(() => {
      setShowLoading(false);
      setShowContent(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const inputNumber = (num: string) => {
    // Add button to history
    setEquationHistory((prev) => [...prev, num]);

    if (waitingForOperand && operation) {
      // Start a new number after an operation (not after equals)
      setDisplay(num);
      setWaitingForOperand(false);
      // Add the number to the equation
      setEquation(equation + num);
    } else {
      // Append to current number (normal typing or after equals)
      setDisplay(display === "0" ? num : display + num);
      setWaitingForOperand(false);
      // If this is the first number, start the equation
      if (equation === "") {
        setEquation(num);
      } else {
        // Replace the last part of the equation with the new number
        setEquation(
          equation.replace(/[0-9.]+$/, "") +
            (display === "0" ? num : display + num)
        );
      }
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      setEquation(equation + "0.");
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
      setEquation(equation.replace(/[0-9.]+$/, "") + display + ".");
    }
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setEquation("");
    setEquationHistory([]);
  };

  const performOperation = (nextOperation: string) => {
    // Add operation to history
    setEquationHistory((prev) => [...prev, nextOperation]);

    const inputValue = parseFloat(display);

    // If there's already an operation pending, calculate it first (chaining operations)
    if (previousValue !== null && operation && !waitingForOperand) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(newValue);
      setEquation(String(newValue) + nextOperation);
    } else if (previousValue === null) {
      // First operation - just store the value
      setPreviousValue(inputValue);
      setEquation(display + nextOperation);
    } else {
      // Just update the equation with the new operation
      setEquation(equation + nextOperation);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (
    firstValue: number,
    secondValue: number,
    operation: string
  ): number => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "×":
        return firstValue * secondValue;
      case "÷":
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    // Add equals to history
    setEquationHistory((prev) => [...prev, "="]);

    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      // Store result for potential chaining, but clear operation so typing appends
      setPreviousValue(newValue);
      setOperation(null); // Clear operation so numbers append after equals
      setWaitingForOperand(true);
      setEquation(String(newValue));
      // Clear history after equals
      setEquationHistory([]);
    }
  };

  const handlePercentage = () => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  };

  const handleRemove = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
      // Update equation by removing the last character from the current number
      setEquation(equation.replace(/[0-9.]+$/, display.slice(0, -1)));
    } else {
      setDisplay("0");
      // If display becomes 0, update equation accordingly
      setEquation(equation.replace(/[0-9.]+$/, "0"));
    }
  };

  if (showLoading) {
    return (
      <div className="w-151 h-321.5 rounded-[71px] relative flex items-center justify-center overflow-hidden bg-gray-700">
        <div
          className="flex flex-col items-center space-y-4 animate-fadeInFromCenter"
          style={{
            transformOrigin: "50% 100%",
            animation:
              "appOpen 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          }}
        >
          <FaCalculator className="text-white text-6xl" />
          <div className="text-white text-2xl font-semibold">Calculator</div>
        </div>
      </div>
    );
  }

  if (showContent) {
    return (
      <AppsLayout onClose={onClose} title="Calculator">
        <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 to-black pt-30">
          {/* Calculator Display */}
          <div className="flex-1 flex flex-col justify-end px-4 pb-6">
            {/* Display */}
            <div className="text-right mb-6 min-h-[120px] flex flex-col justify-end">
              {/* Equation Display */}
              {equation && equation !== display && (
                <div className="text-gray-400 text-xl font-light mb-2 overflow-hidden text-ellipsis">
                  {equation}
                </div>
              )}
              {/* Main Display */}
              <div className="text-white text-6xl font-light overflow-hidden text-ellipsis leading-tight">
                {display.length > 9 ? (
                  <span className="text-5xl">{display}</span>
                ) : (
                  display
                )}
              </div>
            </div>

            {/* Calculator Buttons */}
            <div className="grid grid-cols-4 gap-3 pb-2">
              {/* Row 1 */}
              <button
                onClick={clear}
                className="bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white text-2xl font-medium w-full h-16 rounded-2xl transition-all duration-150 flex items-center justify-center shadow-lg active:scale-95"
              >
                {display === "0" && !previousValue ? "AC" : "C"}
              </button>
              <button
                onClick={handleRemove}
                className="bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white text-xl font-medium w-full h-16 rounded-2xl transition-all duration-150 flex items-center justify-center shadow-lg active:scale-95"
              >
                <FaBackspace />
              </button>
              <button
                onClick={handlePercentage}
                className="bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white text-2xl font-medium w-full h-16 rounded-2xl transition-all duration-150 flex items-center justify-center shadow-lg active:scale-95"
              >
                %
              </button>
              <button
                onClick={() => performOperation("÷")}
                className={`${
                  operation === "÷"
                    ? "bg-white text-orange-500"
                    : "bg-orange-500 hover:bg-orange-400 active:bg-orange-300 text-white"
                } text-2xl font-medium w-full h-16 rounded-2xl transition-all duration-150 flex items-center justify-center shadow-lg active:scale-95`}
              >
                ÷
              </button>

              {/* Row 2 */}
              <button
                onClick={() => inputNumber("7")}
                className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white text-2xl font-medium w-full h-16 rounded-2xl transition-all duration-150 flex items-center justify-center shadow-lg active:scale-95"
              >
                7
              </button>
              <button
                onClick={() => inputNumber("8")}
                className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white text-2xl font-medium w-full h-16 rounded-2xl transition-all duration-150 flex items-center justify-center shadow-lg active:scale-95"
              >
                8
              </button>
              <button
                onClick={() => inputNumber("9")}
                className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white text-2xl font-medium w-full h-16 rounded-2xl transition-all duration-150 flex items-center justify-center shadow-lg active:scale-95"
              >
                9
              </button>
              <button
                onClick={() => performOperation("×")}
                className={`${
                  operation === "×"
                    ? "bg-white text-orange-500"
                    : "bg-orange-500 hover:bg-orange-400 active:bg-orange-300 text-white"
                } text-2xl font-medium w-full h-16 rounded-2xl transition-all duration-150 flex items-center justify-center shadow-lg active:scale-95`}
              >
                ×
              </button>

              {/* Row 3 */}
              <button
                onClick={() => inputNumber("4")}
                className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white text-2xl font-medium w-full h-16 rounded-2xl transition-all duration-150 flex items-center justify-center shadow-lg active:scale-95"
              >
                4
              </button>
              <button
                onClick={() => inputNumber("5")}
                className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white text-2xl font-medium w-full h-16 rounded-2xl transition-all duration-150 flex items-center justify-center shadow-lg active:scale-95"
              >
                5
              </button>
              <button
                onClick={() => inputNumber("6")}
                className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white text-2xl font-medium w-full h-16 rounded-2xl transition-all duration-150 flex items-center justify-center shadow-lg active:scale-95"
              >
                6
              </button>
              <button
                onClick={() => performOperation("-")}
                className={`${
                  operation === "-"
                    ? "bg-white text-orange-500"
                    : "bg-orange-500 hover:bg-orange-400 active:bg-orange-300 text-white"
                } text-2xl font-medium w-full h-16 rounded-2xl transition-all duration-150 flex items-center justify-center shadow-lg active:scale-95`}
              >
                −
              </button>

              {/* Row 4 */}
              <button
                onClick={() => inputNumber("1")}
                className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white text-2xl font-medium w-full h-16 rounded-2xl transition-all duration-150 flex items-center justify-center shadow-lg active:scale-95"
              >
                1
              </button>
              <button
                onClick={() => inputNumber("2")}
                className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white text-2xl font-medium w-full h-16 rounded-2xl transition-all duration-150 flex items-center justify-center shadow-lg active:scale-95"
              >
                2
              </button>
              <button
                onClick={() => inputNumber("3")}
                className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white text-2xl font-medium w-full h-16 rounded-2xl transition-all duration-150 flex items-center justify-center shadow-lg active:scale-95"
              >
                3
              </button>
              <button
                onClick={() => performOperation("+")}
                className={`${
                  operation === "+"
                    ? "bg-white text-orange-500"
                    : "bg-orange-500 hover:bg-orange-400 active:bg-orange-300 text-white"
                } text-2xl font-medium w-full h-16 rounded-2xl transition-all duration-150 flex items-center justify-center shadow-lg active:scale-95`}
              >
                +
              </button>

              {/* Row 5 */}
              <button
                onClick={() => inputNumber("0")}
                className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white text-2xl font-medium w-full h-16 rounded-2xl transition-all duration-150 flex items-center justify-start pl-6 col-span-2 shadow-lg active:scale-95"
              >
                0
              </button>
              <button
                onClick={inputDecimal}
                className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white text-2xl font-medium w-full h-16 rounded-2xl transition-all duration-150 flex items-center justify-center shadow-lg active:scale-95"
              >
                .
              </button>
              <button
                onClick={handleEquals}
                className="bg-orange-500 hover:bg-orange-400 active:bg-orange-300 text-white text-2xl font-medium w-full h-16 rounded-2xl transition-all duration-150 flex items-center justify-center shadow-lg active:scale-95"
              >
                =
              </button>
            </div>
          </div>
        </div>
      </AppsLayout>
    );
  }

  return null;
};

export default Calculator;
