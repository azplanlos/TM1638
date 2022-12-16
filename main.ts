/**
* makecode LED & Keys
*/

/**
 * Four Digit Display
 */
//% weight=100 color=#50A820 icon="8"
namespace TM1638 {
    let TM1638_CMD1 = 0x40;
    let TM1638_CMD2 = 0xC0;
    let TM1638_CMD3 = 0x80;
    let _SEGMENTS = [0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F, 0x77, 0x7C, 0x39, 0x5E, 0x79, 0x71];

    /**
     * TM1638 LED display
     */
    export class TM1638LEDs {
        buf: Buffer;
        clk: DigitalPin;
        dio: DigitalPin;
        strobe: DigitalPin;
        _ON: number;
        brightness: number;
        count: number;  // number of LEDs

        /**
         * initial TM1638
         */
        init(): void {
            pins.digitalWritePin(this.clk, 0);
            pins.digitalWritePin(this.dio, 0);
            pins.digitalWritePin(this.strobe, 0);
            this._ON = 8;
            this.buf = pins.createBuffer(this.count);
            this._write_data_cmd(0xC0);
            this.clear();
        }

        /**
         * Start 
         */
        _start() {
            pins.digitalWritePin(this.dio, 0);
            pins.digitalWritePin(this.clk, 0);
            pins.digitalWritePin(this.strobe, 0);
        }

        /**
         * Stop
         */
        _stop() {
            pins.digitalWritePin(this.dio, 0);
            pins.digitalWritePin(this.clk, 1);
            pins.digitalWritePin(this.dio, 1);
            pins.digitalWritePin(this.strobe, 1);
        }

        /**
         * send command1
         */
        _write_data_cmd(cmd: number) {
            this._start();
            this._write_byte(cmd);
            this._stop();
        }

        /**
         * send command3
         */
        _write_dsp_ctrl() {
            this._start();
            this._write_byte(TM1638_CMD3 | this._ON | this.brightness);
            this._stop();
        }

        /**
         * send a byte to 2-wire interface
         */
        _write_byte(b: number) {
            for (let i = 0; i < 8; i++) {
                pins.digitalWritePin(this.dio, (b >> i) & 1);
                pins.digitalWritePin(this.clk, 1);
                pins.digitalWritePin(this.clk, 0);
            }
            pins.digitalWritePin(this.clk, 1);
            pins.digitalWritePin(this.clk, 0);
        }

        /**
         * set TM1638 intensity, range is [0-8], 0 is off.
         * @param val the brightness of the TM1638, eg: 7
         */
        //% blockId="TM1638_set_intensity" block="%tm|set intensity %val"
        //% weight=50 blockGap=8
        //% parts="TM1638"
        intensity(val: number = 7) {
            if (val < 1) {
                this.off();
                return;
            }
            if (val > 8) val = 8;
            this._ON = 8;
            this.brightness = val - 1;
            this._write_data_cmd();
            this._write_dsp_ctrl();
        }

        /**
         * set data to TM1638, with given bit
         */
        _dat(bit: number, dat: number) {
            this._start();
            this._write_byte(dat)
            this._stop();
        }

        /**
         * show a number in given position. 
         * @param num number will show, eg: 5
         * @param bit the position of the LED, eg: 0
         */
        //% blockId="TM1638_showbit" block="%tm|show digit %num |at %bit"
        //% weight=90 blockGap=8
        //% parts="TM1638"
        showbit(num: number = 5, bit: number = 0) {
            this.buf[bit % this.count] = _SEGMENTS[num % 16]
            this._dat(bit, _SEGMENTS[num % 16])
        }

        /**
          * show a number. 
          * @param num is a number, eg: 0
          */
        //% blockId="TM1638_shownum" block="%tm|show number %num"
        //% weight=91 blockGap=8
        //% parts="TM1638"
        showNumber(num: number) {
            if (num < 0) {
                this._dat(0, 0x40) // '-'
                num = -num
            }
            else
                this.showbit(Math.idiv(num, 1000) % 10)
            this.showbit(num % 10, 3)
            this.showbit(Math.idiv(num, 10) % 10, 2)
            this.showbit(Math.idiv(num, 100) % 10, 1)
        }

        /**
          * show a hex number. 
          * @param num is a hex number, eg: 0
          */
        //% blockId="TM1638_showhex" block="%tm|show hex number %num"
        //% weight=90 blockGap=8
        //% parts="TM1638"
        showHex(num: number) {
            if (num < 0) {
                this._dat(0, 0x40) // '-'
                num = -num
            }
            else
                this.showbit((num >> 12) % 16)
            this.showbit(num % 16, 3)
            this.showbit((num >> 4) % 16, 2)
            this.showbit((num >> 8) % 16, 1)
        }

        /**
         * show or hide dot point. 
         * @param bit is the position, eg: 1
         * @param show is show/hide dp, eg: true
         */
        //% blockId="TM1638_showDP" block="%tm|DotPoint at %bit|show %show"
        //% weight=70 blockGap=8
        //% parts="TM1638"
        showDP(bit: number = 1, show: boolean = true) {
            bit = bit % this.count
            if (show) this._dat(bit, this.buf[bit] | 0x80)
            else this._dat(bit, this.buf[bit] & 0x7F)
        }

        /**
         * clear LED. 
         */
        //% blockId="TM1638_clear" block="clear %tm"
        //% weight=80 blockGap=8
        //% parts="TM1638"
        clear() {
            for (let i = 0; i < this.count; i++) {
                this._dat(i, 0)
                this.buf[i] = 0
            }
        }

        /**
         * turn on LED. 
         */
        //% blockId="TM1638_on" block="turn on %tm"
        //% weight=86 blockGap=8
        //% parts="TM1638"
        on() {
            this._ON = 8;
            this._write_data_cmd();
            this._write_dsp_ctrl();
        }

        /**
         * turn off LED. 
         */
        //% blockId="TM1638_off" block="turn off %tm"
        //% weight=85 blockGap=8
        //% parts="TM1638"
        off() {
            this._ON = 0;
            this._write_data_cmd();
            this._write_dsp_ctrl();
        }
    }

    /**
     * create a TM1638 object.
     * @param clk the CLK pin for TM1638, eg: DigitalPin.P1
     * @param dio the DIO pin for TM1638, eg: DigitalPin.P2
     * @param strobe the Strobe pin for TM1638, eg. DigitalPin.P0
     * @param intensity the brightness of the LED, eg: 7
     * @param count the count of the LED, eg: 8
     */
    //% weight=200 blockGap=8
    //% blockId="TM1638_create" block="CLK %clk|DIO %dio|Strobe %strobe|intensity %intensity|LED count %count"
    export function create(clk: DigitalPin, dio: DigitalPin, strobe: DigitalPin, intensity: number, count: number): TM1638LEDs {
        let tm = new TM1638LEDs();
        tm.clk = clk;
        tm.dio = dio;
        tm.strobe = strobe;
        if ((count < 1) || (count > 9)) count = 8;
        tm.count = count;
        tm.brightness = intensity;
        tm.init();
        return tm;
    }
}
