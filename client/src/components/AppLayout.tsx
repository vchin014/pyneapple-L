import { ReactNode } from "react";
import Navigation from "./navigation/Navigation";

const AppLayout = ({ content }: { content?: ReactNode }) => {
  return (
    <div className="flex flex-col h-screen">
      <div className="z-10">
        <Navigation />
      </div>
      <div className="h-full w-full z-0">{content}</div>
    </div>
  );
};

export default AppLayout;
