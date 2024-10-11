import { ReactNode } from "react";

// renders a list of buttons in a consistent horizontal layout
const ButtonContainerHorizontal = ({ buttons }: { buttons: ReactNode[] }) => {
  return (
    <div className="w-full flex justify-center space-x-[15px]">
      {buttons.map((button, key) => (
        <div className="pointer-events-auto" key={key}>
          {button}
        </div>
      ))}
    </div>
  );
};

export default ButtonContainerHorizontal;
