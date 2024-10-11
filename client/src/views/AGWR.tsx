import AppLayout from "components/AppLayout";
import ButtonContainerHorizontal from "components/button/ButtonContainerHorizontal";
import Button from "components/button/Button";
import Map from "components/map/Map";
import { useEffect, useState } from "react";


import {
  Dataset,
  DatasetOption,
  ModelOption,
  MODEL_OPTIONS,
  DATASET_OPTIONS,
  MODEL_DATA_ALL,
} from "data/data";



export type ViewType = "residuals" | "coefficients" | "bandwidths";

const Content = () => {
  const [selectedDataset, setSelectedDataset] = useState<DatasetOption>(
    DATASET_OPTIONS[0]
  );
  const [selectedModel, setSelectedModel] = useState<ModelOption>(
    MODEL_OPTIONS[0]
  );
  const [modelData, setModelData] = useState<Dataset>(MODEL_DATA_ALL[0]);
  const [viewType, setViewType] = useState<ViewType>("residuals");
  const [coefficientFeature, setCoefficientFeature] =
    useState<string>("intercept");
  const [bandwidthFeature, setBandwidthFeature] = useState<string>("intercept");

  useEffect(() => {
    const modelData = MODEL_DATA_ALL.find(
      (e) => e.name === selectedModel.value + "_" + selectedDataset.value
    ) as Dataset;
    setModelData(modelData);
    setCoefficientFeature("intercept");
    setBandwidthFeature("intercept");
  }, [selectedDataset, selectedModel]);

  return (
    <div className="flex flex-col justify-between w-full h-full bg-gray-100 rounded-sm relative">
      <div className="z-0 w-full h-full">
        <Map
          dataset={modelData}
          viewType={viewType}
          feature={
            viewType === "bandwidths" ? bandwidthFeature : coefficientFeature
          }
        />
      </div>
      <div className="py-[15px] absolute z-10 w-full top-0 pointer-events-none">
        <ButtonContainerHorizontal
          buttons={[
            <Button
              label="Dataset"
              selectedOption={selectedDataset.label}
              onOptionSelected={(value: string) => {
                const selected: ModelOption = DATASET_OPTIONS.find(
                  (e) => e.label === value
                ) as ModelOption;
                setSelectedDataset(selected);
              }}
              options={DATASET_OPTIONS.map((e) => e.label)}
            />,
            <Button
              label="Models"
              selectedOption={selectedModel.label}
              onOptionSelected={(value: string) => {
                const selected: ModelOption = MODEL_OPTIONS.find(
                  (e) => e.label === value
                ) as ModelOption;
                setSelectedModel(selected);
              }}
              options={MODEL_OPTIONS.map((e) => e.label)}
            />,
          ]}
        />
      </div>
      <div className="py-[15px] absolute w-full bottom-0">
        <ButtonContainerHorizontal
          buttons={[
            <Button
              label="Residuals"
              isSelected={viewType === "residuals"}
              onClick={() => setViewType("residuals")}
            />,
            <Button
              label="Coefficients"
              isSelected={viewType === "coefficients"}
              onClick={() => setViewType("coefficients")}
              selectedOption={coefficientFeature}
              options={modelData.bandwidths.map((e) => e.label)}
              onOptionSelected={(value: string) => {
                setCoefficientFeature(value);
              }}
            />,
            <Button
              label="Bandwidths"
              isSelected={viewType === "bandwidths"}
              onClick={() => setViewType("bandwidths")}
              selectedOption={bandwidthFeature}
              options={modelData.bandwidths.map((e) => e.label)}
              onOptionSelected={(value: string) => {
                setBandwidthFeature(value);
              }}
            />,
          ]}
        />
      </div>
    </div>
  );
};

const AGWR = () => {
  return (
    <>
      <style>{`
        .leaflet-popup-content-wrapper,
        .leaflet-popup-tip {
          background: none !important;
          border: none !important;
          box-shadow: none !important;
          color: inherit;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          padding: 0 !important;
        }
        .leaflet-popup-close-button {
          display: none !important;
        }
      `}</style>
      <AppLayout content={<Content />} />
    </>
  );
};



export default AGWR;
