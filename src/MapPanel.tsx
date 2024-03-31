import "ol/ol.css";
import { ExtensionContext, PanelExtensionContext } from "@foxglove/studio";
import Map from "ol/Map";
import View from "ol/View";
import { GeoJSON } from "ol/format";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { bbox as bboxStrategy } from "ol/loadingstrategy";
import { transform } from "ol/proj";
import TileWMS from "ol/source/TileWMS";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import { Stroke, Style, Fill, Icon } from "ol/style";
import React, { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

import "./MapPanel.css";
import ControlPanel from "./ControlPanel";
//////////////////////////////////////////////////


// npm init foxglove-extension@latest teleop
// npm install
// in teleop folder /npm run local-install
//authkey for geoserveracess in private 

/////////////////////////////////////////////
const MapPanel: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null); // attach the map to the DOM

  useEffect(() => {
    if (!mapRef.current) {
      return;
    } // Exit if the ref is not yet initialized

    // ESRI Base Map Layer
    const baseMap = new TileLayer({
      source: new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        attributions:
          'Basiskarte © <a href="http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ArcGIS</a>.',
      }),
    });

    // TMS Overlay
    const xyzOverlay = new TileLayer({
      extent: [1156547.395452797, 6832788.620337286, 1186587.1331650633, 6864866.400336086],
      source: new XYZ({
        url: "https://ts.dlr.de/mumme-server/gwc/service/tms/1.0.0/bs-gov:dop-2020@EPSG:900913@jpeg/{z}/{x}/{-y}.jpg?authKey=6b20b2ac-19b8-4447-b146-325d65cb5ca3",
        attributions:
          'Luftbild © <a href="http://www.braunschweig.de/geodaten">Stadt Braunschweig 2020</a>.',
      }),
    });

    // WMS-C Overlay
    const wmscOverlay = new TileLayer({
      source: new TileWMS({
        url: "https://ts.dlr.de/mumme-server/ows",
        params: {
          LAYERS: "bs-gov:dop-2020",
          TILED: true,
          FORMAT: "image/jpeg",
          TRANSPARENT: false,
          AuthKey: process.env.AUTH_KEY,
        },
        serverType: "geoserver",
        attributions:
          'Luftbild © <a href="http://www.braunschweig.de/geodaten">Stadt Braunschweig 2020</a>.',
      }),
    });

    interface WfsLayerConfig {
      name: string;
      typename: string;
      url: string;
      style: {
        image?: {
          src: string;
          scale: number;
        };
        strokeColor?: string;
        strokeWidth?: number;
        fillColor?: string;
      };
    }

    const wfsLayers: WfsLayerConfig[] = [
      {
        name: "AX_Strassenverkehrsanlage", //no features in that bounding box 3857 (braunschweig) find new source
        typename: "dlm250:objart_53002_p",
        url: "https://sgx.geodatenzentrum.de/wfs_dlm250",
        style: {
          strokeColor: "yellow",
          strokeWidth: 2,
          fillColor: "rgba(0, 255, 0, 0.5)",
        },
      },
      {
        name: "AX_Bahnstrecke",
        typename: "dlm250:objart_42014_l",
        url: "https://sgx.geodatenzentrum.de/wfs_dlm250",
        style: {
          // Define style for AX_Bahnstrecke
          strokeColor: "green",
          strokeWidth: 2,
          fillColor: "rgba(0, 255, 0, 0.5)",
        },
      },
      {
        name: "AX_Bahnverkehr",
        typename: "dlm250:objart_42010_f",
        url: "https://sgx.geodatenzentrum.de/wfs_dlm250",
        style: {
          // Define style for AX_Bahnverkehr
          strokeColor: "orange",
          strokeWidth: 2,
          fillColor: "rgba(255, 165, 0, 0.5)", // adjust as needed
        },
      },
      {
        name: "AX_Fahrwegachse",
        typename: "dlm250:objart_42008_l",
        url: "https://sgx.geodatenzentrum.de/wfs_dlm250",
        style: {
          // Define style for AX_Fahrwegachse
          strokeColor: "purple",
          strokeWidth: 2,
          fillColor: "rgba(128, 0, 128, 0.5)", //  adjust as needed
        },
      },
      {
        name: "AX_Strassenachse",
        typename: "dlm250:objart_42003_l",
        url: "https://sgx.geodatenzentrum.de/wfs_dlm250",
        style: {
          // Define style for AX_Strassenachse
          strokeColor: "brown",
          strokeWidth: 2,
          fillColor: "rgba(165, 42, 42, 0.5)", //  adjust as needed
        },
      },
      {
        name: "AX_Siedlungsflaeche (dicht)",
        typename: "dlm250:objart_41010_f",
        url: "https://sgx.geodatenzentrum.de/wfs_dlm250",
        style: {
          // Define style for AX_Siedlungsflaeche
          strokeColor: "black",
          strokeWidth: 2,
          fillColor: "rgba(0, 0, 0, 0.5)", //  adjust as needed
        },
      },
      {
        name: "AX_Gebaeude",
        typename: "dlm250:objart_31001_p",
        url: "https://sgx.geodatenzentrum.de/wfs_dlm250",
        style: {
          // Define style for AX_Gebaeude
          strokeColor: "gray",
          strokeWidth: 2,
          fillColor: "rgba(128, 128, 128, 0.5)", // adjust as needed
        },
      },
    ];

    const wfsFeatureLayers = wfsLayers.map((config) => {
      return new VectorLayer({
        source: new VectorSource({
          format: new GeoJSON(),
          url: (extent) =>
            `${config.url}?service=WFS&version=1.1.0&request=GetFeature&typename=${config.typename}&outputFormat=application/json&srsname=EPSG:3857&bbox=${extent.join(",")},EPSG:3857`,
          strategy: bboxStrategy,
        }),
        style: new Style({
          image: config.style.image
            ? new Icon({
                src: config.style.image.src,
                scale: config.style.image.scale,
              })
            : undefined,
          stroke: new Stroke({
            color: config.style.strokeColor,
            width: config.style.strokeWidth,
          }),
          fill: new Fill({
            color: config.style.fillColor,
          }),
        }),
        visible: true,
      });
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        baseMap,
        wmscOverlay,
        xyzOverlay,
        ...wfsFeatureLayers, //dynamically created layers into the map's layers array
      ],
      view: new View({
        center: transform([10.5, 52.3], "EPSG:4326", "EPSG:3857"),
        zoom: 15,
      }),
    });
    return () => {
      map.setTarget(undefined);
    };
  }, []);

  return (
    <div className="mapContainer">
      <div ref={mapRef} className="map"></div>
      <div className="controlPanel">
        <ControlPanel />
      </div>
    </div>
  );
};

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({
    name: "teleop-map-panel",
    initPanel: (context: PanelExtensionContext) => {
      const root = createRoot(context.panelElement);
      root.render(<MapPanel />);

      // Return a cleanup function
      return () => {
        root.unmount();
      };
    },
  });
}
export default MapPanel;
