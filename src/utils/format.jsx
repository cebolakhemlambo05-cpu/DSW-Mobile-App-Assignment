"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fmt = fmt;
function fmt(n, currency = "ZAR") {
    if (n == null || !Number.isFinite(Number(n))) return "Check price";
    if (Number(n) === 0) return "Free";
    if (currency === "ZAR") return `R${Number(n).toLocaleString("en-ZA")}`;
    const safeCurrency = /^[A-Z]{3}$/.test(currency) ? currency : "ZAR";
    return new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: safeCurrency,
        currencyDisplay: "code",
        maximumFractionDigits: 2,
    }).format(Number(n));
}
