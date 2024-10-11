import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import Papa from 'papaparse';
import 'leaflet/dist/leaflet.css';
import AppLayout from "components/AppLayout";

interface HotspotData {
  latitude: number;
  longitude: number;
  hotspot: boolean;
  count: number;
  alphaValue?: number;
  tValue?: number;
  nValue?: number;
  lValue?: number;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// For your modal component
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 'auto',
      backgroundColor: 'rgba(0, 0, 0, 0)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 500,
      overflow: 'hidden'
    }}>
      <div style={{
        background: 'white',
        padding: '10px',
        borderRadius: '5px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'none',
        maxWidth: '90%',
        height: 'auto'
      }}>
        {children}
        <button onClick={onClose} style={{
          position: 'absolute',
          top: 5,
          right: 40,
          padding: '5px',
          cursor: 'pointer',
          border: 'none',
          background: 'transparent',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};


const SetMapCenter: React.FC<{ center: [number, number], zoomLevel: number }> = ({ center, zoomLevel }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoomLevel); // Set both center and zoom level
  }, [center, zoomLevel, map]); // Add both center and zoom level as dependencies

  return null;
};


const Content: React.FC = () => {
  const [hotspots, setHotspots] = useState<HotspotData[]>([]);
  // const [city, setCity] = useState<'Seattle' | 'Chicago' | 'NewYork' | 'Detroit'>('Seattle');
  const [city, setCity] = useState<'Chicago' | 'NewYork' | 'Detroit'>('Chicago');
  const [algorithm, setAlgorithm] = useState<'fixed' | 'flexible'>('flexible');
  const [radiusParams, setRadiusParams] = useState({ tValue: 1500, alphaValue: 0.99 });
  const [minAlpha, setMinAlpha] = useState(0.99);
  const [view, setView] = useState<'basic' | 'analytical'>('analytical');
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotData | null>(null); 
  const [activePopupIndex, setActivePopupIndex] = useState<number | null>(null); 
  const [plotUrl, setPlotUrl] = useState<string | null>(null); 
  const [mapCenter, setMapCenter] = useState<[number, number]>([41.8420, -87.6704]); 
  const [zoomLevel, setZoomLevel] = useState<number>(11); // Set default zoom level to 12

  const fixedRadiusOptions = [
    { tValue: 500, alphaValues: [0.99] },
    { tValue: 1000, alphaValues: [0.99, 0.97, 0.95, 0.93, 0.91] },
    { tValue: 1500, alphaValues: [0.99] },
    { tValue: 2000, alphaValues: [0.99] },
    { tValue: 2500, alphaValues: [0.99] },
  ];
  
  const flexibleRadiusOptions = [0.91, 0.93, 0.95, 0.97, 0.99];

  const availableAlphaValues = fixedRadiusOptions.find(option => option.tValue === radiusParams.tValue)?.alphaValues || [];

  const handleTValueChange = (newTValue: number) => {
    setRadiusParams(prev => ({ ...prev, tValue: newTValue, alphaValue: availableAlphaValues[0] }));
  };


  // Dynamically map city and parameters to CSV file paths
  useEffect(() => {
    const getCityFile = () => {
      if (algorithm === 'fixed') {
        // Format for fixed radius files: City_t=value_alpha=value_fixed_radius.csv
        return `/${city}_t=${radiusParams.tValue}_alpha=${radiusParams.alphaValue.toFixed(2)}_fixed_radius.csv`;
      } else {
        // Format for flexible radius files: City_min_alpha=value_flexible_radius.csv
        return `/${city}_min_alpha=${minAlpha.toFixed(2)}_flexible_radius.csv`;
      }
    };
  
    const csvFile = getCityFile();
    fetch(csvFile)
      .then(response => response.text())
      .then(csvData => {
        Papa.parse(csvData, {
          header: false,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const hotspotCounts: Record<string, HotspotData> = {};
            let totalLat = 0;
            let totalLng = 0;
            let pointCount = 0;
  
            results.data.forEach((row: any) => {
              const longitude = parseFloat(row[0]);
              const latitude = parseFloat(row[1]);
  
              if (isNaN(longitude) || isNaN(latitude)) return;
  
              totalLat += latitude;
              totalLng += longitude;
              pointCount++;
  
              if (algorithm === 'fixed') {
                const isHotspot = String(row[2]).trim().toUpperCase() === 'TRUE';
                const nValue = parseFloat(row[3]);
                const lValue = parseFloat(row[4]);
  
                const key = `${latitude}-${longitude}`;
                if (hotspotCounts[key]) {
                  hotspotCounts[key].count += 1;
                } else {
                  hotspotCounts[key] = {
                    latitude,
                    longitude,
                    hotspot: isHotspot,
                    count: 1,
                    alphaValue: radiusParams.alphaValue,
                    tValue: radiusParams.tValue,
                    nValue,
                    lValue,
                  };
                }
              } else {
                const tValue = parseFloat(row[2]);
                const alphaValue = parseFloat(row[3]);
                const nValue = parseFloat(row[4]);
                const lValue = parseFloat(row[5]);
                const isHotspot = alphaValue > minAlpha;
  
                const key = `${latitude}-${longitude}`;
                if (hotspotCounts[key]) {
                  hotspotCounts[key].count += 1;
                } else {
                  hotspotCounts[key] = {
                    latitude,
                    longitude,
                    hotspot: isHotspot,
                    count: 1,
                    alphaValue,
                    tValue,
                    nValue,
                    lValue,
                  };
                }
              }
            });
  
            if (pointCount > 0) {
              setMapCenter([totalLat / pointCount, totalLng / pointCount]); // Dynamically update map center
              setZoomLevel(11); // Reset zoom level to default when data changes
            }
  
            setHotspots(Object.values(hotspotCounts));
          },
        });
      })
      .catch(error => console.error('Error fetching the CSV:', error));
  }, [algorithm, city, radiusParams, minAlpha]); // Add dependencies
  
  
  
 
  const openModal = async (hotspot: HotspotData, index: number) => {
    if (hotspot.nValue && hotspot.nValue > 0) { 
        setSelectedHotspot(hotspot);
        setModalOpen(true);
        setActivePopupIndex(null); 

        try {
            const response = await fetch(`http://localhost:5000/generate_plot?n_value=${hotspot.nValue}&l_value=${hotspot.lValue}&city=${city}`);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setPlotUrl(url); 
        } catch (error) {
            console.error("Error fetching plot:", error);
        }
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedHotspot(null);
    setPlotUrl(null); 
  };

  const renderMarkers = () => {
    const maxCount = Math.max(...hotspots.map(hotspot => hotspot.count)); // Find max count for normalization
    return hotspots.map((hotspot, index) => {
      const adjustedRadius = (Math.sqrt(hotspot.count) / Math.sqrt(maxCount)) * 15; // Adjust 15 as needed for base size
      // Recalculate marker colors based on hotspot status
      const markerColor = hotspot.hotspot ? 'red' : 'blue';
      const markerBorderColor = hotspot.hotspot ? 'darkred' : 'darkblue';
  
      return (
        <CircleMarker
          key={`${hotspot.latitude}-${hotspot.longitude}-${algorithm}-${view}-${city}-${hotspot.hotspot}`} // Unique key includes all variables that might affect marker rendering
          center={[hotspot.latitude, hotspot.longitude]}
          // radius={view === 'analytical' ? hotspot.count * 3 : hotspot.count * 3}
          radius={adjustedRadius}
          fillColor={markerColor} // Dynamically set marker color based on hotspot status
          color={markerBorderColor} // Dynamically set border color based on hotspot status
          fillOpacity={0.5}
          stroke={true}
          eventHandlers={{
            click: () => setActivePopupIndex(index),
            popupclose: () => setActivePopupIndex(null),
          }}
        >
          {activePopupIndex === index && (
            <Popup>
              <strong>{hotspot.hotspot ? 'Hotspot' : 'Not a hotspot'}</strong><br />
              Coordinates: ({hotspot.latitude.toFixed(2)}, {hotspot.longitude.toFixed(2)})<br />
              Occurrences: {hotspot.count}<br />
              
              {/* Show detailed data only in flexible radius, analytical view, and when N = 0 */}
              {view === 'analytical' && algorithm === 'flexible' && hotspot.nValue === 0 && (
                <>
                  {hotspot.alphaValue !== undefined && <div>Alpha Value: {hotspot.alphaValue?.toFixed(2)}</div>}
                  {hotspot.tValue !== undefined && <div>T Value: {hotspot.tValue?.toFixed(2)}</div>}
                  {hotspot.lValue !== undefined && <div>L Value: {hotspot.lValue?.toFixed(2)}</div>}
                  {hotspot.lValue !== undefined && <div>N Value: {hotspot.lValue?.toFixed(2)}</div>}
                </>
              )}
  
              {/* Only show the "Show Detailed Info" button if N value is greater than 0 */}
              {view === 'analytical' && hotspot.nValue !== undefined && hotspot.nValue > 0 && (
                <button
                  onClick={() => openModal(hotspot, index)}  // Clicking the button opens the modal and closes the Popup
                  style={{
                    cursor: 'pointer',
                    padding: '5px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    marginTop: '5px',
                  }}
                >
                  Show Detailed Info
                </button>
              )}
            </Popup>
          )}
        </CircleMarker>
      );
    });
  };
  
  



  return (
    <div>
  <div style={{
    marginBottom: '10px',
    padding: '15px',
    backgroundColor: '#f8f8f8',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  }}>
    <label style={{ fontWeight: '500'}}>Select City:</label>
    {/* <select onChange={(e) => setCity(e.target.value as 'Seattle' | 'Chicago' | 'NewYork' | 'Detroit')} */}
    <select onChange={(e) => setCity(e.target.value as  'Chicago' | 'NewYork' | 'Detroit')}
      value={city}
      style={{
        padding: '8px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        backgroundColor: '#fff',
        marginRight: '20px',
        width: '150px'
      }}>
      {/* <option value="Seattle">Seattle</option> */}
      <option value="Chicago">Chicago</option>
      <option value="NewYork">New York</option>
      <option value="Detroit">Detroit</option>
    </select>

    <label style={{ fontWeight: '500' }}>Select Algorithm:</label>
    <select onChange={(e) => setAlgorithm(e.target.value as 'fixed' | 'flexible')}
      value={algorithm}
      style={{
        padding: '8px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        backgroundColor: '#fff',
        marginRight: '20px',
        width: '180px'
      }}>
      <option value="fixed">Fixed Radius</option>
      <option value="flexible">Flexible Radius</option>
    </select>

    {algorithm === 'fixed' ? (
  <>
    <label style={{ fontWeight: '500'}}>Hotspot Radius:</label>
    <select onChange={(e) => handleTValueChange(parseFloat(e.target.value))}
      value={radiusParams.tValue}
      style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#fff', width: '120px' }}>
      {fixedRadiusOptions.map(option => (
        <option key={option.tValue} value={option.tValue}>{option.tValue}</option>
      ))}
    </select>

    <label style={{ fontWeight: '500'}}>Statistical Confidence:</label>
    <select onChange={(e) => setRadiusParams(prev => ({ ...prev, alphaValue: parseFloat(e.target.value) }))}
      value={radiusParams.alphaValue}
      style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#fff', width: '100px' }}>
      {availableAlphaValues.map(alpha => (
        <option key={alpha} value={alpha}>{alpha}</option>
      ))}
    </select>
  </>
) : (
  <>
    <label style={{ fontWeight: '500'}}>Minimum Statistical Confidence:</label>
    <select onChange={(e) => setMinAlpha(parseFloat(e.target.value))}
      value={minAlpha}
      style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#fff', width: '120px' }}>
      {flexibleRadiusOptions.map(alpha => (
        <option key={alpha} value={alpha}>{alpha}</option>
      ))}
    </select>
  </>
)}


    <label style={{ fontWeight: '500'}}>Select View:</label>
    <select onChange={(e) => setView(e.target.value as 'basic' | 'analytical')}
      value={view}
      style={{
        padding: '8px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        backgroundColor: '#fff',
        width: '150px'
      }}>
      <option value="basic">Basic</option>
      <option value="analytical">Analytical</option>
    </select>
  </div>

  <MapContainer center={mapCenter} zoom={zoomLevel} style={{ height: '80vh', width: '100%' }}>
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    />
    <SetMapCenter center={mapCenter} zoomLevel={zoomLevel} /> {/* Pass both center and zoomLevel */}
    {renderMarkers()}
  </MapContainer>

  {selectedHotspot && view === 'analytical' && (
    <Modal isOpen={isModalOpen} onClose={closeModal}>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        {plotUrl ? (
          <img src={plotUrl} alt="Distribution Plot" style={{ width: "65%", height: 'auto', marginRight: '10px' }} />
        ) : (
          <div>Loading...</div>
        )}
        <div style={{ width: "35%", padding: '0 10px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <strong>Hotspot Coordinates:</strong> ({selectedHotspot.latitude.toFixed(2)}, {selectedHotspot.longitude.toFixed(2)})<br />
          <strong>Statistical Confidence:</strong> {selectedHotspot.alphaValue}<br />
          <strong>Hotspot Radius:</strong> {selectedHotspot.tValue?.toFixed(2)}<br />
          <strong>N Value:</strong> {selectedHotspot.nValue}<br />
          <strong>L Value:</strong> {selectedHotspot.lValue?.toFixed(2)}
        </div>
      </div>
    </Modal>
  )}
</div>

  );
};

const Hotspot = () => {
  return <AppLayout content={<Content />} />;
};

export default Hotspot;
