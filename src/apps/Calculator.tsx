import { useEffect, useState } from "react";
import { FaCalculator } from "react-icons/fa";
import AppsLayout from "./AppsLayout";

const Calculator = ({
  onClose,
  clickPosition,
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
  const [equationHistory, setEquationHistory] = useState<string[]>([]);

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

    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
      // Add the number to the equation
      setEquation(equation + num);

      // If we have a previous operation, calculate the result immediately
      if (previousValue !== null && operation) {
        const inputValue = parseFloat(num);
        const newValue = calculate(previousValue, inputValue, operation);
        setDisplay(String(newValue));
        setPreviousValue(newValue);
        setOperation(null);
        setWaitingForOperand(true);
        // Don't update equation here - keep the full equation visible
      }
    } else {
      setDisplay(display === "0" ? num : display + num);
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

    if (previousValue === null) {
      setPreviousValue(inputValue);
      setEquation(display + nextOperation);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
      setEquation(String(newValue) + nextOperation);
    } else {
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
      setPreviousValue(null);
      setOperation(null);
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
          className="flex flex-col items-center space-y-4"
          style={{
            transformOrigin: `${clickPosition.x}px ${clickPosition.y}px`,
            animation:
              "iosAppOpen 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
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
        <div className="h-full flex flex-col bg-black pt-30">
          {/* Calculator Display */}
          <div className="flex-1 flex flex-col justify-end p-4">
            {/* Display */}
            <div className="text-right mb-4">
              {/* Equation Display */}
              {equationHistory.length > 0 && (
                <div className="text-gray-400 text-2xl font-light mb-2 overflow-hidden">
                  {equationHistory.join(" ")}
                </div>
              )}
              {/* Main Display */}
              <div className="text-white text-8xl font-light overflow-hidden">
                {display}
              </div>
            </div>

            {/* Calculator Buttons */}
            <div className="grid grid-cols-4 gap-3 h-[70%]">
              {/* Row 1 */}
              <button
                onClick={handleRemove}
                className="bg-gray-500 hover:bg-gray-400 text-white text-6xl font-medium w-full aspect-square rounded-full transition-colors flex items-center justify-center"
              >
                Remove
              </button>
              <button
                onClick={clear}
                className="bg-gray-500 hover:bg-gray-400 text-white text-6xl font-medium w-full aspect-square rounded-full transition-colors flex items-center justify-center"
              >
                AC
              </button>
              <button
                onClick={handlePercentage}
                className="bg-gray-500 hover:bg-gray-400 text-white text-6xl font-medium w-full aspect-square rounded-full transition-colors flex items-center justify-center"
              >
                %
              </button>
              <button
                onClick={() => performOperation("÷")}
                className="bg-orange-500 hover:bg-orange-400 text-white text-6xl font-medium w-full aspect-square rounded-full transition-colors flex items-center justify-center"
              >
                ÷
              </button>

              {/* Row 2 */}
              <button
                onClick={() => inputNumber("7")}
                className="bg-gray-700 hover:bg-gray-600 text-white text-6xl font-medium w-full aspect-square rounded-full transition-colors flex items-center justify-center"
              >
                7
              </button>
              <button
                onClick={() => inputNumber("8")}
                className="bg-gray-700 hover:bg-gray-600 text-white text-6xl font-medium w-full aspect-square rounded-full transition-colors flex items-center justify-center"
              >
                8
              </button>
              <button
                onClick={() => inputNumber("9")}
                className="bg-gray-700 hover:bg-gray-600 text-white text-6xl font-medium w-full aspect-square rounded-full transition-colors flex items-center justify-center"
              >
                9
              </button>
              <button
                onClick={() => performOperation("×")}
                className="bg-orange-500 hover:bg-orange-400 text-white text-6xl font-medium w-full aspect-square rounded-full transition-colors flex items-center justify-center"
              >
                ×
              </button>

              {/* Row 3 */}
              <button
                onClick={() => inputNumber("4")}
                className="bg-gray-700 hover:bg-gray-600 text-white text-6xl font-medium w-full aspect-square rounded-full transition-colors flex items-center justify-center"
              >
                4
              </button>
              <button
                onClick={() => inputNumber("5")}
                className="bg-gray-700 hover:bg-gray-600 text-white text-6xl font-medium w-full aspect-square rounded-full transition-colors flex items-center justify-center"
              >
                5
              </button>
              <button
                onClick={() => inputNumber("6")}
                className="bg-gray-700 hover:bg-gray-600 text-white text-6xl font-medium w-full aspect-square rounded-full transition-colors flex items-center justify-center"
              >
                6
              </button>
              <button
                onClick={() => performOperation("-")}
                className="bg-orange-500 hover:bg-orange-400 text-white text-6xl font-medium w-full aspect-square rounded-full transition-colors flex items-center justify-center"
              >
                -
              </button>

              {/* Row 4 */}
              <button
                onClick={() => inputNumber("1")}
                className="bg-gray-700 hover:bg-gray-600 text-white text-6xl font-medium w-full aspect-square rounded-full transition-colors flex items-center justify-center"
              >
                1
              </button>
              <button
                onClick={() => inputNumber("2")}
                className="bg-gray-700 hover:bg-gray-600 text-white text-6xl font-medium w-full aspect-square rounded-full transition-colors flex items-center justify-center"
              >
                2
              </button>
              <button
                onClick={() => inputNumber("3")}
                className="bg-gray-700 hover:bg-gray-600 text-white text-6xl font-medium w-full aspect-square rounded-full transition-colors flex items-center justify-center"
              >
                3
              </button>
              <button
                onClick={() => performOperation("+")}
                className="bg-orange-500 hover:bg-orange-400 text-white text-6xl font-medium w-full aspect-square rounded-full transition-colors flex items-center justify-center"
              >
                +
              </button>

              {/* Row 5 */}
              <button
                onClick={() => inputNumber("0")}
                className="bg-gray-700 hover:bg-gray-600 text-white text-6xl font-medium w-full h-10/11 rounded-full transition-colors flex items-center justify-center col-span-2"
              >
                0
              </button>
              <button
                onClick={inputDecimal}
                className="bg-gray-700 hover:bg-gray-600 text-white text-6xl font-medium w-full aspect-square rounded-full transition-colors flex items-center justify-center"
              >
                .
              </button>
              <button
                onClick={handleEquals}
                className="bg-orange-500 hover:bg-orange-400 text-white text-6xl font-medium w-full aspect-square rounded-full transition-colors flex items-center justify-center"
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
