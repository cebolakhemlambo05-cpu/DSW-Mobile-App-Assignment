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

  const imageUri = failed ? fallbackUri : uri || fallbackUri;
  const imageSource = typeof imageUri === "number" ? imageUri : { uri: imageUri };
  const fallbackSource =
    typeof fallbackUri === "number" ? fallbackUri : { uri: fallbackUri };
  const { resizeMode = "cover", ...restImageProps } = imageProps;

  return (
    <View style={style}>
      <Image
        source={fallbackSource}
        resizeMode={resizeMode}
        style={StyleSheet.absoluteFill}
        accessible={false}
      />
      {imageUri !== fallbackUri && (
        <Image
          {...restImageProps}
          source={imageSource}
          resizeMode={resizeMode}
          style={StyleSheet.absoluteFill}
          onError={() => setFailed(true)}
        />
      )}
    </View>
  );
}
