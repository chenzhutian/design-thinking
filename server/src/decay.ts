class Decay {
    // all time unit is ms
    private _initValue: number;              // N
    private _totalPassTime: number = 0;          // t
    private _halfLifePeriodFactor: number = 60; //HPF
    private _HPFreduceThreshold: number;

    get HalfLifePeriod() {
        return this._halfLifePeriodFactor * 1000;
    }

    constructor(initValue?: number) {
        this._initValue = initValue || 100;
        this._HPFreduceThreshold = this._initValue * 0.1;
    }

    // passTime in ms
    public decayOnce(passTime: number): number {
        this._totalPassTime += passTime;
        const y = this._totalPassTime / this.HalfLifePeriod;
        const currentValue = Math.pow(0.5, y) * this._initValue;
        if (currentValue < this._HPFreduceThreshold) {
            --this._halfLifePeriodFactor;
            if (this._halfLifePeriodFactor < 1) {
                this._halfLifePeriodFactor = 1;
            }
        }
        return currentValue;
    }

    public childReadMessage(reducePassTime?: number) {
        if (reducePassTime) {
            this._totalPassTime -= reducePassTime;
        } else {
            this._totalPassTime = 0;
        }
    }

    public childSendMessage(reducePassTime?: number) {
        this.childReadMessage(reducePassTime);
        ++this._halfLifePeriodFactor;
    }
}

export default Decay;