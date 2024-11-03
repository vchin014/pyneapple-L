# setup for pyneapple-L agwr and hotspot 

1. build image

```shell
# in pyneapple-L/
docker build -t pyneapple-l .
```

2. start container

```shell
# in pyneapple-L/
docker run -v ./client:/home/client --publish 3000:3000 -it pyneapple-l sh
```

3. run client

```shell
# in home/
cd client; npm start
```

# run getplot.py for hotspot analytical view

```shell
# open another terminal/shell
# in pyneapple-L/server
pip install -r requirements.txt
python getplot.py
```

# use the navigation bar to redirect to Pyneapple-L and select HOTSPOT view for hotspot component
# use the navigation bar to redirect to Pyneapple-L and select AGWR view for hotspot component

# run agwr

1. install Anaconda if not already installed
2. create new environment with `Python 3.11.8`
3. download AGWR source code

```shell
git clone git@github.com:mshahneh/AGWR.git
```

3. create and run `package-install.py` in `/AGWR` to install packages

```python
import subprocess

# Open and read the package-list.txt file
with open("package-list.txt", "r") as file:
	lines = file.readlines()

# Filter lines for pip packages, and prepare package names for pip installation
pip_packages = []

for line in lines:
	# Ignore comment lines and empty lines
	if line.startswith("#") or line.strip() == "":
		continue

    # Extract package name and version for pip packages
    if "=pypi_0" in line:
        package_info = line.strip().split("=")[0] # Get package_name==version
        pip_packages.append(package_info)

# Install packages using pip
for package in pip_packages:
	subprocess.run(["pip", "install", package])
```

4. in `/AGWR/SMGWR/SMGWRModel.py` add statement to write coefficients

```python
# in SMGWRModel.predict right before the return
...
import pickle
import time

filename = f"trained_models/coefficients_{time.time()}.pkl"
with open(filename, "wb") as file:
    pickle.dump(coefficients, file)
    print(f'Coefficients saved to "{filename}"')
...
```

5. move `agwr.py` and `agwr.ipynb` to `/AGWR` and run

```shell
python agwr.py
```

6. run post-processing in `agwr.ipynb` and move all `.ts` files into `client/src/data`

# resources

- [NY_Airbnb](https://www.kaggle.com/datasets/dgomonov/new-york-city-airbnb-open-data)
- [King_County](https://www.kaggle.com/datasets/harlfoxem/housesalesprediction)
- Pyneapple [source code](https://github.com/MagdyLab/Pyneapple)
- AGWR [source code](https://github.com/mshahneh/AGWR)


