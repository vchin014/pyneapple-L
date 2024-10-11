import NavigationItem from "./NavigationItem";
import PYNEAPPLE from "assets/pyneapple.png";
import PYNEAPPLE_ICON from "assets/pyneapple-icon.png";

const Navigation = () => {
  return (
    <div className="shadow-lg flex items-center">
      {/* logo */}
      <div className="flex flex-none px-[20px] space-x-[10px]">
        <img
          className="flex-none py-[10px] h-[55px]"
          src={PYNEAPPLE_ICON}
          alt="pyneapple"
        />
        <img
          className="flex-none py-[15px] h-[55px]"
          src={PYNEAPPLE}
          alt="pyneapple"
        />
      </div>
      {/* navigation */}
      <div className="flex flex-1 justify-end">
        <NavigationItem label="Home" />
        <NavigationItem label="Pyneapple-R" />
        <NavigationItem label="Pyneapple-G" />
        <NavigationItem
          label="Pyneapple-L"
          items={[
            { label: "AGWR", url: "/l/agwr" },
            { label: "Hotspot", url: "/l/hotspot" },
          ]}
        />
      </div>
    </div>
  );
};

export default Navigation;
