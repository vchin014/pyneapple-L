# agwr specifications

_bandwidth coloring is proportional to gaussian of spherical distance on nearest `bandwidth` points_

```python
def gaussian(zs):
	return np.exp(-0.5 * (zs)**2)
```

```python
def computeDistance(coords_i,coords):
	"""coords_i is the center"""
	dLat = np.radians(coords[:, 1] - coords_i[1])
	        dLon = np.radians(coords[:, 0] - coords_i[0])
	        lat1 = np.radians(coords[:, 1])
	        lat2 = np.radians(coords_i[1])
	        a = np.sin(
	            dLat / 2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dLon / 2)**2
	        c = 2 * np.arcsin(np.sqrt(a))
	        R = 6371.0
	        return R * c
```
