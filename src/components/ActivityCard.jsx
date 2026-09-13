"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ActivityCard;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const Icons_1 = require("./Icons");
const format_1 = require("../utils/format");
function ActivityCard({ activity: act, selected, onToggle, }) {
    return (<react_native_1.Pressable onPress={onToggle} style={[
            styles.card,
            {
                backgroundColor: selected ? theme_1.colors.terra : theme_1.colors.ivory,
                borderColor: selected ? theme_1.colors.terra : "transparent",
            },
        ]}>
      <react_native_1.View style={styles.row}>
        <react_native_1.View style={{ flex: 1 }}>
          <react_native_1.View style={styles.nameRow}>
            <react_native_1.Text style={[styles.name, { color: selected ? theme_1.colors.ivory : theme_1.colors.charcoal }]}>{act.name}</react_native_1.Text>
            {act.localFav && !selected && <Icons_1.IconGem color={theme_1.colors.sky}/>}
            {act.peakDouble && <Icons_1.IconWarn />}
          </react_native_1.View>
          <react_native_1.Text style={[styles.duration, { color: selected ? theme_1.colors.ivory : theme_1.colors.charcoal, opacity: selected ? 0.8 : 0.55 }]}>
            {act.duration}
          </react_native_1.Text>
          {!!act.description && <react_native_1.Text style={[styles.description, { color: selected ? theme_1.colors.ivory : theme_1.colors.charcoal }]} numberOfLines={2}>{act.description}</react_native_1.Text>}
          {!!act.bookingRequired && <react_native_1.Text style={[styles.booking, { color: selected ? theme_1.colors.ivory : theme_1.colors.terra }]}>Booking required</react_native_1.Text>}
        </react_native_1.View>
        <react_native_1.Text style={[styles.price, { color: selected ? theme_1.colors.ivory : theme_1.colors.charcoal }]}>
          {(0, format_1.fmt)(act.pricePerPerson)}
          {act.pricePerPerson > 0 && <react_native_1.Text style={styles.pp}>/pp</react_native_1.Text>}
        </react_native_1.Text>
      </react_native_1.View>
    </react_native_1.Pressable>);
}
const styles = react_native_1.StyleSheet.create({
    card: {
        borderRadius: 14,
        borderWidth: 2,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 8,
        shadowColor: theme_1.colors.charcoal,
        shadowOpacity: 0.08,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
    },
    row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
    nameRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 3 },
    name: { fontSize: 14, fontFamily: theme_1.fonts.bodySemiBold },
    duration: { fontSize: 11 },
    description: { fontSize: 11, marginTop: 4, opacity: 0.7 },
    booking: { fontSize: 10, fontFamily: theme_1.fonts.bodySemiBold, marginTop: 4 },
    price: { fontSize: 16, fontFamily: theme_1.fonts.display },
    pp: { fontSize: 10, fontFamily: theme_1.fonts.body, opacity: 0.6 },
});
