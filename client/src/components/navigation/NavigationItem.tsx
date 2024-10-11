import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

const NavigationItem = ({
  label,
  url,
  items,
}: {
  label: string;
  url?: string;
  items?: { label: string; url: string }[];
}) => {
  const [showItems, setShowItems] = useState(false);

  const Label = () => {
    return (
      <div
        className={
          "px-[20px] py-[20px] hover:bg-gray-100 truncate font-medium select-none h-full rounded-sm"
        }
      >
        {label}
        {items && (
          <FontAwesomeIcon
            icon={faChevronDown}
            className="pl-[5px] text-gray-300"
          />
        )}
      </div>
    );
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowItems(true)}
      onMouseLeave={() => setShowItems(false)}
    >
      {/* label */}
      {url ? (
        <Link to={url}>
          <Label />
        </Link>
      ) : (
        <Label />
      )}

      {/* items */}
      {items && showItems && (
        <div className="flex flex-col absolute w-full top-[100%] left-[0] shadow-sm">
          {items.map((item, key) => (
            <Link
              to={item.url}
              className="bg-white hover:bg-gray-100 px-[15px] py-[5px] last-of-type:rounded-b-sm"
              key={key}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default NavigationItem;
