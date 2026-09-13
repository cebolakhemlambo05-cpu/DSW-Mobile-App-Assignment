"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AccomCard;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const Icons_1 = require("./Icons");
const Badge_1 = __importDefault(require("./Badge"));
function AccomCard({ accom: ac, selected, onView, onSelect, }) {
    return (
      <react_native_1.View
        style={[
          styles.card,
          {
            backgroundColor: selected
              ? theme_1.colors.savanna
              : theme_1.colors.ivory,
            borderColor: selected ? theme_1.colors.savanna : 'transparent',
          },
        ]}
      >
        <react_native_1.Pressable onPress={onView} style={styles.mainArea}>
          <react_native_1.View style={styles.topRow}>
            <react_native_1.View style={{ flex: 1 }}>
              <react_native_1.View style={styles.nameRow}>
                <react_native_1.Text
                  style={[
                    styles.name,
                    {
                      color: selected
                        ? theme_1.colors.ivory
                        : theme_1.colors.charcoal,
                    },
                  ]}
                >
                  {ac.name}
                </react_native_1.Text>
                {ac.localFav && !selected && (
                  <Badge_1.default color="sky" icon={<Icons_1.IconGem />}>
                    Local Fav
                  </Badge_1.default>
                )}
                {ac.peakDouble && (
                  <Badge_1.default color="mustard" icon={<Icons_1.IconWarn />}>
                    Peak ×2
                  </Badge_1.default>
                )}
              </react_native_1.View>
              <react_native_1.View style={styles.metaRow}>
                <react_native_1.Text
                  style={[
                    styles.metaText,
                    {
                      color: selected
                        ? theme_1.colors.sand
                        : theme_1.colors.charcoal,
                      opacity: selected ? 0.8 : 0.6,
                    },
                  ]}
                >
                  {ac.type}
                </react_native_1.Text>
                <react_native_1.View style={styles.metaItem}>
                  <Icons_1.IconMapPin
                    size={11}
                    color={
                      selected ? theme_1.colors.sand : theme_1.colors.charcoal
                    }
                  />
                  <react_native_1.Text
                    style={[
                      styles.metaText,
                      {
                        color: selected
                          ? theme_1.colors.sand
                          : theme_1.colors.charcoal,
                        opacity: selected ? 0.8 : 0.6,
                      },
                    ]}
                  >
                    {' '}
                    {ac.distanceKm}km to gate
                  </react_native_1.Text>
                </react_native_1.View>
                <react_native_1.View style={styles.metaItem}>
                  <Icons_1.IconStar size={11} />
                  <react_native_1.Text
                    style={[
                      styles.metaText,
                      {
                        color: selected
                          ? theme_1.colors.sand
                          : theme_1.colors.charcoal,
                        opacity: selected ? 0.8 : 0.6,
                      },
                    ]}
                  >
                    {' '}
                    {ac.rating}
                  </react_native_1.Text>
                </react_native_1.View>
              </react_native_1.View>
            </react_native_1.View>
            <react_native_1.View style={{ alignItems: 'flex-end' }}>
              <react_native_1.Text
                style={[
                  styles.price,
                  {
                    color: selected
                      ? theme_1.colors.sand
                      : theme_1.colors.charcoal,
                  },
                ]}
              >
                {ac.pricePerNight == null
                  ? 'Check price'
                  : `R${ac.pricePerNight.toLocaleString('en-ZA')}`}
              </react_native_1.Text>
              <react_native_1.Text
                style={[
                  styles.perNight,
                  {
                    color: selected
                      ? theme_1.colors.sand
                      : theme_1.colors.charcoal,
                  },
                ]}
              >
                {ac.pricePerNight == null
                  ? 'Google price level only'
                  : '/night'}
              </react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>
          <react_native_1.Text
            style={[
              styles.viewLink,
              { color: selected ? theme_1.colors.sand : theme_1.colors.sky },
            ]}
          >
            View details, amenities & reviews →
          </react_native_1.Text>
        </react_native_1.Pressable>

        <react_native_1.View style={styles.selectRow}>
          <react_native_1.Pressable
            onPress={onSelect}
            style={[
              styles.selectBtn,
              selected
                ? { backgroundColor: 'rgba(255,255,255,0.15)' }
                : {
                    backgroundColor: 'rgba(58,90,64,0.09)',
                    borderWidth: 1,
                    borderColor: 'rgba(58,90,64,0.19)',
                  },
            ]}
          >
            {selected ? (
              <react_native_1.View style={styles.selectedRow}>
                <Icons_1.IconCheck color={theme_1.colors.ivory} />
                <react_native_1.Text
                  style={[styles.selectText, { color: theme_1.colors.ivory }]}
                >
                  {' '}
                  Selected
                </react_native_1.Text>
              </react_native_1.View>
            ) : (
              <react_native_1.Text
                style={[styles.selectText, { color: theme_1.colors.savanna }]}
              >
                Select for plan
              </react_native_1.Text>
            )}
          </react_native_1.Pressable>
          <react_native_1.Text
            style={[
              styles.amenitiesPreview,
              {
                color: selected ? theme_1.colors.sand : theme_1.colors.charcoal,
                opacity: selected ? 1 : 0.45,
              },
            ]}
            numberOfLines={1}
          >
            {ac.details.amenities.slice(0, 2).join(' · ')}
          </react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>
    );
}
const styles = react_native_1.StyleSheet.create({
    card: {
        borderRadius: 14,
        overflow: "hidden",
        borderWidth: 2,
        shadowColor: theme_1.colors.charcoal,
        shadowOpacity: 0.08,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
        marginBottom: 10,
    },
    mainArea: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
    topRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
    nameRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 3 },
    name: { fontSize: 14, fontFamily: theme_1.fonts.bodySemiBold },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    metaItem: { flexDirection: "row", alignItems: "center" },
    metaText: { fontSize: 11 },
    price: { fontSize: 16, fontFamily: theme_1.fonts.display },
    perNight: { fontSize: 10, opacity: 0.5 },
    viewLink: { fontSize: 10, marginTop: 8, textDecorationLine: "underline" },
    selectRow: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        paddingTop: 4,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    selectBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
    selectedRow: { flexDirection: "row", alignItems: "center" },
    selectText: { fontSize: 12, fontFamily: theme_1.fonts.bodySemiBold },
    amenitiesPreview: { fontSize: 10, flexShrink: 1, textAlign: "right" },
});
