import mgwr_neural_network_kc from "data/mgwr_neural_network_kc";
import mgwr_neural_network_ny from "data/mgwr_neural_network_ny";
import mgwr_random_forest_kc from "data/mgwr_random_forest_kc";
import mgwr_random_forest_ny from "data/mgwr_random_forest_ny";
import mgwr_xgb_kc from "data/mgwr_xgb_kc";
import mgwr_xgb_ny from "data/mgwr_xgb_ny";
import smgwr_neural_network_kc from "data/smgwr_neural_network_kc";
import smgwr_neural_network_ny from "data/smgwr_neural_network_ny";
import smgwr_random_forest_kc from "data/smgwr_random_forest_kc";
import smgwr_random_forest_ny from "data/smgwr_random_forest_ny";
import smgwr_xgb_kc from "data/smgwr_xgb_kc";
import smgwr_xgb_ny from "data/smgwr_xgb_ny";

export type Point = {
  latitude: number;
  longitude: number;
  actual: number;
  predicted: number;
  coefficients: { [key: string]: number };
};

export type Dataset = {
  name: string;
  center: [number, number];
  zoom: number;
  bandwidths: { label: string; value: number }[];
  data: Point[];
  coefficientMins: number[];
  coefficientMeds: number[];
  coefficientMaxes: number[];
};

export type DatasetOption = {
  label: string;
  value: string;
};

export type ModelOption = {
  label: string;
  value: string;
};

export const DATASET_OPTIONS: DatasetOption[] = [
  { label: "King_County_Houses", value: "kc" },
  { label: "New_York_Airbnb", value: "ny" },
];

export const MODEL_OPTIONS: ModelOption[] = [
  { label: "MGWR / Neural Network", value: "mgwr_neural_network" },
  { label: "MGWR / Random Forest", value: "mgwr_random_forest" },
  { label: "MGWR / XGBoost", value: "mgwr_xgb" },
  { label: "SMGWR / Neural Network", value: "smgwr_neural_network" },
  { label: "SMGWR / Random Forest", value: "smgwr_random_forest" },
  { label: "SMGWR / XGBoost", value: "smgwr_xgb" },
];

export const MODEL_DATA_ALL: Dataset[] = [
  mgwr_neural_network_kc,
  mgwr_neural_network_ny,
  mgwr_random_forest_kc,
  mgwr_random_forest_ny,
  mgwr_xgb_kc,
  mgwr_xgb_ny,
  smgwr_neural_network_kc,
  smgwr_neural_network_ny,
  smgwr_random_forest_kc,
  smgwr_random_forest_ny,
  smgwr_xgb_kc,
  smgwr_xgb_ny,
];
