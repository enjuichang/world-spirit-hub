import type { Map as MapboxMap, MapOptions } from "mapbox-gl";
import type { Locale } from "./locale-data";

export function mapboxLanguage(locale: Locale) {
  return locale === "zh-TW" ? "zh-Hant" : "en";
}

export function mapboxUiLocale(locale: Locale): MapOptions["locale"] {
  if (locale !== "zh-TW") return undefined;

  return {
    "AttributionControl.ToggleAttribution": "切換地圖資料來源資訊",
    "FullscreenControl.Enter": "進入全螢幕",
    "FullscreenControl.Exit": "離開全螢幕",
    "GeolocateControl.FindMyLocation": "尋找我的位置",
    "GeolocateControl.LocationNotAvailable": "無法取得目前位置",
    "LogoControl.Title": "Mapbox 標誌",
    "Map.Title": "地圖",
    "NavigationControl.ResetBearing": "重設地圖方位",
    "NavigationControl.ZoomIn": "放大",
    "NavigationControl.ZoomOut": "縮小",
    "ScrollZoomBlocker.CtrlMessage": "按住 Ctrl 鍵並捲動以縮放地圖",
    "ScrollZoomBlocker.CmdMessage": "按住 Command 鍵並捲動以縮放地圖",
    "TouchPanBlocker.Message": "使用兩根手指移動地圖",
  };
}

export function localizeMapboxMap(map: MapboxMap, locale: Locale) {
  map.setLanguage(mapboxLanguage(locale));
}
