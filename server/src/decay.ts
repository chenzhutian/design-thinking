class Decay {
    // all time unit is ms
    private _initValue: number;              // N
    private _totalPassTime: number;          // t
    private _halfLifePeriod: number = 10000; // T
    private _halfLifePeriodFactor: number = 1; //HPF
    private _HPFreduceThreshold: number = 10;

    constructor(initValue?: number) {
        this._initValue = initValue || 1000;
    }

    // passTime in ms
    public decayOnce(passTime: number): number {
        this._totalPassTime += passTime;
        const y = this._totalPassTime / this._halfLifePeriod;
        const currentValue = Math.pow(0.5, y) * this._initValue;
        if (currentValue < this._HPFreduceThreshold) {
            --this._halfLifePeriodFactor;
        }
        return currentValue;
    }

    public revive(reducePassTime?: number) {
        if (reducePassTime) {
            this._totalPassTime -= reducePassTime;
        } else {
            this._totalPassTime = 0;
        }
        ++this._halfLifePeriodFactor;
    }
}
