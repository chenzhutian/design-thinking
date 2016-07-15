"use strict";
class Decay {
    constructor(initValue) {
        this._totalPassTime = 0;
        this._halfLifePeriodFactor = 60;
        this._initValue = initValue || 100;
        this._HPFreduceThreshold = this._initValue * 0.1;
    }
    get HalfLifePeriod() {
        return this._halfLifePeriodFactor * 1000;
    }
    decayOnce(passTime) {
        this._totalPassTime += passTime;
        const y = this._totalPassTime / this.HalfLifePeriod;
        const currentValue = Math.pow(0.5, y) * this._initValue;
        if (currentValue < this._HPFreduceThreshold) {
            this._totalPassTime = 0;
        }
        return currentValue;
    }
    childReadMessage(reducePassTime) {
        if (reducePassTime) {
            this._totalPassTime -= reducePassTime;
        }
        else {
            this._totalPassTime = 0;
        }
    }
    childSendMessage(reducePassTime) {
        this.childReadMessage(reducePassTime);
        ++this._halfLifePeriodFactor;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Decay;
//# sourceMappingURL=decay.js.map