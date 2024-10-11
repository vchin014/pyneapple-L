import { ReactNode } from "react";

// onClick defines what should happen when you click the button
// onOptionSelected defines what should happen when an option is selected and is passed the current value
const Button = ({
  label,
  onClick = () => {},
  isSelected = false,
  options = null,
  selectedOption = "",
  onOptionSelected = () => {},
}: {
  label: ReactNode;
  onClick?: Function;
  isSelected?: boolean;
  options?: null | string[];
  selectedOption?: string;
  onOptionSelected?: Function;
}) => {
  return (
    <button
      className={
        "ring-black ring-[2px] ring-opacity-20 shadow-sm px-[10px] py-[3px] rounded-sm hover:bg-gray-100 font-medium text-[15px] flex space-x-[5px]" +
        " " +
        (isSelected ? "bg-gray-100" : "bg-white")
      }
      onClick={() => {
        onClick();
      }}
    >
      <div>{label}</div>
      {options && (
        <select
          value={selectedOption}
          className="truncate max-w-[200px] px-[5px] text-gray-500 rounded-sm font-normal"
          onChange={(event) => onOptionSelected(event.target.value)}
        >
          {options.map((e, key) => (
            <option key={key}>{e}</option>
          ))}
        </select>
      )}
    </button>
  );
};

export default Button;
