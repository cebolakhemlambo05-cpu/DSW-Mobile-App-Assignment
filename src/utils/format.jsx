"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fmt = fmt;
function fmt(n) {
    return n === 0 ? "Free" : `R${n.toLocaleString("en-ZA")}`;
}
