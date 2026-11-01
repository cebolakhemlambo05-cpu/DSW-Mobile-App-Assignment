import React, { useEffect, useState } from "react";
import { Image } from "react-native";
import { DEFAULT_ACCOMMODATION_IMAGE } from "../utils/imageDefaults";

export default function PhotoImage({
  uri,
  fallbackUri = DEFAULT_ACCOMMODATION_IMAGE,
  style,
  ...imageProps
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri, fallbackUri]);

  const imageUri = failed ? fallbackUri : uri || fallbackUri;
  return (
    <Image
      {...imageProps}
      source={{ uri: imageUri }}
      style={style}
      onError={() => {
        if (!failed && imageUri !== fallbackUri) setFailed(true);
      }}
    />
  );
}
