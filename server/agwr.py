import pandas as pd
import utils as utils
import time
import pickle
import json
import itertools
import os
import numpy as np

from helpers.SampleModules.SpatialModules import smgwr_module
from helpers.SampleModules.MLModules import random_forrest
from helpers.SampleModules.SpatialModules import mgwr_module, smgwr_module
from helpers.SampleModules.MLModules import random_forrest, neural_network, xgb
from ModularFramework.ModularFramework import ModularFramework


# JSON encoder (for bandwidths)
class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NumpyEncoder, self).default(obj)


kc = {
    "name": "kc",
    "filename": "kc_house_sample.csv",
    "x": ["bedrooms", "bathrooms", "sqft_living", "sqft_lot", "floors"],
    "y": "price",
    "coords": ["latitude", "longitude"],
}
ny = {
    "name": "ny",
    "filename": "ny_airbnb_sample.csv",
    "x": [
        "minimum_nights",
        "number_of_reviews",
        "reviews_per_month",
        "host_listings_count",
        "availability_365",
    ],
    "y": "price",
    "coords": ["latitude", "longitude"],
}
data_all = [kc, ny]

modules_all_spatial = [
    {"name": "mgwr", "module": mgwr_module},
    {"name": "smgwr", "module": smgwr_module},
]
modules_all_ml = [
    {"name": "random_forest", "module": random_forrest},
    {"name": "neural_network", "module": neural_network},
    {"name": "xgb", "module": xgb},
]
modules_all = list(itertools.product(modules_all_spatial, modules_all_ml))

# 1. create directory for trained models
directory_name = "trained_models"
try:
    os.mkdir(directory_name)
except FileExistsError:
    pass

# 2. run AGWR on each spatial/ml/data combination
i = 0
for spatial, ml in modules_all:
    for data in data_all:
        print(f'[{i}] {spatial["name"]}_{ml["name"]}_{data["name"]}')
        i += 1
        # 2.1 read data
        df = pd.read_csv(data["filename"])
        x_train = df[data["x"]].values
        y_train = df[data["y"]].values.reshape(-1, 1)
        coords_train = df[data["coords"]].values

        # 2.2 train ml module
        spatial_module, ml_module = spatial["module"], ml["module"]
        ml_module_trained = ml_module(x_train, coords_train, y_train)

        # 2.3 train spatial module
        start_time = time.time()
        config = {
            "process_count": 1,
            "divide_method": "equalCount",
            "divide_sections": [1, 1],
            "pipelined": False,
        }
        agwr = ModularFramework(spatial_module, ml_module, config)
        agwr.train(x_train, coords_train, y_train)

        # 2.4 save bandwidths
        # NOTE: the first bandwidth is for the intercept
        features = data["x"].copy()
        features.insert(0, "intercept")
        bandwidths = [
            {"label": feature, "value": value}
            for feature, value in zip(features, agwr.spatial_learners[0].bandwidths)
        ]
        filename = f'{directory_name}/{spatial["name"]}_{ml["name"]}_{data["name"]}_parameters.txt'
        with open(filename, "w") as file:
            file.write(
                f"bandwidths:{json.dumps(bandwidths,cls=NumpyEncoder, indent=2)},"
            )
            print(f'Bandwidths saved to "{filename}"')

        # 2.5 save model
        filename = (
            f'{directory_name}/{spatial["name"]}_{ml["name"]}_{data["name"]}_model.pkl'
        )
        with open(filename, "wb") as file:
            pickle.dump(agwr, file)
            print(f'Model saved to "{filename}"')

        # 2.6 save predictions
        filename = f'{directory_name}/{spatial["name"]}_{ml["name"]}_{data["name"]}_predictions.csv'
        pred = agwr.predict(x_train, coords_train, y_train)
        df = pd.DataFrame(pred, columns=["predicted"])
        df.to_csv(filename, index=False)
        print(f'Predictions saved to "{filename}"')

        end_time = time.time()
        print(f"{end_time-start_time:.2f}s\n")
