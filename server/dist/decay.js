"use strict";
class Decay {
    constructor(initValue) {
        this._totalPassTime = 0;
        this._halfLifePeriod = 10000;
        this._halfLifePeriodFactor = 1;
        this._initValue = initValue || 1000;
        this._HPFreduceThreshold = this._initValue * 0.1;
    }
    decayOnce(passTime) {
        this._totalPassTime += passTime;
        const y = this._totalPassTime / this._halfLifePeriod;
        const currentValue = Math.pow(0.5, y) * this._initValue;
        if (currentValue < this._HPFreduceThreshold) {
            --this._halfLifePeriodFactor;
        }
        return currentValue;
    }
    revive(reducePassTime) {
        if (reducePassTime) {
            this._totalPassTime -= reducePassTime;
        }
        else {
            this._totalPassTime = 0;
        }
        ++this._halfLifePeriodFactor;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Decay;
//# sourceMappingURL=decay.js.map