import { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import CustomMarker from "components/map/CustomMarker";
import { Dataset, Point } from "data/data";
import {
  getBandwidthColoring,
  getResidualColoring,
  getCoefficientColoring,
} from "utilities";
import { ViewType } from "views/AGWR";

const Map = ({
  dataset,
  viewType,
  feature,
}: {
  dataset: Dataset;
  viewType: ViewType;
  feature: string;
}) => {
  const [activePoint, setActivePoint] = useState<Point | null>(null);
  const bandwithValue = dataset.bandwidths.find((e) => e.label === feature) as {
    label: string;
    value: number;
  };
  const bandwidth = bandwithValue.value;

  let data: Point[] = dataset.data;
  switch (viewType) {
    case "residuals":
      data = getResidualColoring(dataset.data);
      break;
    case "coefficients":
      const featureIndex = dataset.bandwidths.findIndex(
        (item) => item.label === feature
      );
      data = getCoefficientColoring(
        dataset.data,
        dataset.coefficientMins,
        dataset.coefficientMeds,
        dataset.coefficientMaxes,
        featureIndex,
        feature
      );
      break;
    case "bandwidths":
      if (activePoint)
        data = getBandwidthColoring(activePoint, dataset.data, bandwidth);
      break;
  }

  return (
    <MapContainer
      key={`${dataset.name}-${viewType}`}
      center={dataset.center}
      zoom={dataset.zoom}
      scrollWheelZoom={false}
      style={{ width: "100%", height: "100%" }}
      attributionControl={false}
    >
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {/* <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" /> */}
      {data.map((item, i) => {
        return (
          <CustomMarker
            key={i}
            data={item}
            onClick={() => setActivePoint(item)}
          />
        );
      })}
    </MapContainer>
  );
};

export default Map;
