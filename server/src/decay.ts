class Decay {
    // all time unit is ms
    private _initValue: number;              // N
    private _totalPassTime: number = 0;          // t
    private _halfLifePeriod: number = 10000; // T
    private _halfLifePeriodFactor: number = 1; //HPF
    private _HPFreduceThreshold: number;

    constructor(initValue?: number) {
        this._initValue = initValue || 1000;
        this._HPFreduceThreshold = this._initValue * 0.1;
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

export default Decay;