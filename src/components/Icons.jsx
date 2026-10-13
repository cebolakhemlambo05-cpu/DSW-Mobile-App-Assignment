import React from "react";
import { Text } from "react-native";

function Glyph({ children, size = 18, color = "#3e3226" }) {
  return <Text style={{ fontSize: size, color, lineHeight: size + 2 }}>{children}</Text>;
}

export const IconBack = (props) => <Glyph {...props}>‹</Glyph>;
export const IconCalendar = (props) => <Glyph {...props}>□</Glyph>;
export const IconSearch = (props) => <Glyph {...props}>⌕</Glyph>;
export const IconGem = (props) => <Glyph {...props}>◆</Glyph>;
export const IconUsers = (props) => <Glyph {...props}>◉</Glyph>;
export const IconTrash = (props) => <Glyph {...props}>×</Glyph>;
export const IconOffline = (props) => <Glyph {...props}>↓</Glyph>;
export const IconCheck = (props) => <Glyph {...props}>✓</Glyph>;
export const IconCamera = (props) => <Glyph {...props}>◎</Glyph>;
export const IconLeaf = (props) => <Glyph {...props}>♧</Glyph>;
export const IconBag = (props) => <Glyph {...props}>▣</Glyph>;
export const IconWallet = (props) => <Glyph {...props}>▤</Glyph>;
