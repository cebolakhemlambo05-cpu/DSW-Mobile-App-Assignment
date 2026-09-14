"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IconSearch = IconSearch;
exports.IconMapPin = IconMapPin;
exports.IconStar = IconStar;
exports.IconWarn = IconWarn;
exports.IconGem = IconGem;
exports.IconBack = IconBack;
exports.IconCalendar = IconCalendar;
exports.IconTrash = IconTrash;
exports.IconUsers = IconUsers;
exports.IconOffline = IconOffline;
exports.IconCheck = IconCheck;
exports.IconPhone = IconPhone;
exports.IconClock = IconClock;
exports.IconShield = IconShield;
exports.IconClose = IconClose;
exports.IconHome = IconHome;
const react_1 = __importDefault(require("react"));
const react_native_svg_1 = __importStar(require("react-native-svg"));
function IconSearch({ color = "currentColor", size = 18 }) {
    return (<react_native_svg_1.default width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <react_native_svg_1.Circle cx="11" cy="11" r="8"/>
      <react_native_svg_1.Path d="m21 21-4.35-4.35"/>
    </react_native_svg_1.default>);
}
function IconMapPin({ color = "currentColor", size = 14 }) {
    return (<react_native_svg_1.default width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <react_native_svg_1.Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <react_native_svg_1.Circle cx="12" cy="10" r="3"/>
    </react_native_svg_1.default>);
}
function IconStar({ size = 13, filled = true }) {
    return (<react_native_svg_1.default width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#C97B4A" : "none"} stroke="#C97B4A" strokeWidth={1.5}>
      <react_native_svg_1.Polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </react_native_svg_1.default>);
}
function IconWarn({ size = 13 }) {
    return (<react_native_svg_1.default width={size} height={size} viewBox="0 0 24 24" fill="#D4A24C" stroke="#D4A24C" strokeWidth={0}>
      <react_native_svg_1.Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/>
      <react_native_svg_1.Line x1="12" y1="9" x2="12" y2="13" stroke="#FAF6EF" strokeWidth={2} strokeLinecap="round"/>
      <react_native_svg_1.Circle cx="12" cy="17" r="1" fill="#FAF6EF"/>
    </react_native_svg_1.default>);
}
function IconGem({ size = 12, color = "#7A9E9F" }) {
    return (<react_native_svg_1.default width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <react_native_svg_1.Path d="M6 3h12l4 6-10 13L2 9Z"/>
      <react_native_svg_1.Path d="M11 3 8 9l4 13 4-13-3-6"/>
      <react_native_svg_1.Path d="M2 9h20"/>
    </react_native_svg_1.default>);
}
function IconBack({ color = "currentColor", size = 20 }) {
    return (<react_native_svg_1.default width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <react_native_svg_1.Path d="m15 18-6-6 6-6"/>
    </react_native_svg_1.default>);
}
function IconCalendar({ color = "currentColor", size = 16 }) {
    return (<react_native_svg_1.default width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <react_native_svg_1.Rect x="3" y="4" width="18" height="18" rx="2"/>
      <react_native_svg_1.Path d="M16 2v4M8 2v4M3 10h18"/>
    </react_native_svg_1.default>);
}
function IconTrash({ color = "currentColor", size = 15 }) {
    return (<react_native_svg_1.default width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <react_native_svg_1.Polyline points="3 6 5 6 21 6"/>
      <react_native_svg_1.Path d="M19 6l-1 14H6L5 6"/>
      <react_native_svg_1.Path d="M10 11v6M14 11v6"/>
      <react_native_svg_1.Path d="M9 6V4h6v2"/>
    </react_native_svg_1.default>);
}
function IconUsers({ color = "currentColor", size = 16 }) {
    return (<react_native_svg_1.default width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <react_native_svg_1.Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <react_native_svg_1.Circle cx="9" cy="7" r="4"/>
      <react_native_svg_1.Path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <react_native_svg_1.Path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </react_native_svg_1.default>);
}
function IconOffline({ color = "currentColor", size = 14 }) {
    return (<react_native_svg_1.default width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <react_native_svg_1.Path d="M1 6c0 0 4-2 11-2s11 2 11 2"/>
      <react_native_svg_1.Path d="M5 12.55a11 11 0 0 1 14.08 0"/>
      <react_native_svg_1.Path d="M1.42 9a16 16 0 0 1 21.16 0"/>
      <react_native_svg_1.Path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <react_native_svg_1.Circle cx="12" cy="20" r="1" fill={color}/>
    </react_native_svg_1.default>);
}
function IconCheck({ color = "currentColor", size = 14 }) {
    return (<react_native_svg_1.default width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <react_native_svg_1.Polyline points="20 6 9 17 4 12"/>
    </react_native_svg_1.default>);
}
function IconPhone({ color = "currentColor", size = 14 }) {
    return (<react_native_svg_1.default width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <react_native_svg_1.Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 7.55a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 15.17z"/>
    </react_native_svg_1.default>);
}
function IconClock({ color = "currentColor", size = 14 }) {
    return (<react_native_svg_1.default width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <react_native_svg_1.Circle cx="12" cy="12" r="10"/>
      <react_native_svg_1.Polyline points="12 6 12 12 16 14"/>
    </react_native_svg_1.default>);
}
function IconShield({ color = "currentColor", size = 14 }) {
    return (<react_native_svg_1.default width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <react_native_svg_1.Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </react_native_svg_1.default>);
}
function IconClose({ color = "currentColor", size = 18 }) {
    return (<react_native_svg_1.default width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <react_native_svg_1.Line x1="18" y1="6" x2="6" y2="18"/>
      <react_native_svg_1.Line x1="6" y1="6" x2="18" y2="18"/>
    </react_native_svg_1.default>);
}
function IconHome({ color = "#FAF6EF", size = 12 }) {
    return (<react_native_svg_1.default width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <react_native_svg_1.Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <react_native_svg_1.Polyline points="9 22 9 12 15 12 15 22"/>
    </react_native_svg_1.default>);
}
