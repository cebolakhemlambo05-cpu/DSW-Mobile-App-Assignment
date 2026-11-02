import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
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

  const imageUri = failed ? null : uri;
  const { resizeMode = "cover", ...restImageProps } = imageProps;

  return (
    <View style={style}>
      {fallbackUri != null && (
        <Image
          source={typeof fallbackUri === "number" ? fallbackUri : { uri: fallbackUri }}
          resizeMode={resizeMode}
          style={StyleSheet.absoluteFill}
          accessible={false}
        />
      )}
      {imageUri != null && (
        <Image
          {...restImageProps}
          source={typeof imageUri === "number" ? imageUri : { uri: imageUri }}
          resizeMode={resizeMode}
          style={StyleSheet.absoluteFill}
          onError={() => setFailed(true)}
        />
      )}
    </View>
  );
}
