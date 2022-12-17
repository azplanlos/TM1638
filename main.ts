/**
* makecode LED & Keys
*/

/**
 * Four Digit Display
 */
//% weight=100 color=#50A820 icon="8"
namespace TM1638 {

    const fontMap = [
        0x00, /* (space) */
        0x86, /* ! */
        0x22, /* " */
        0x7E, /* # */
        0x6D, /* $ */
        0xD2, /* % */
        0x46, /* & */
        0x20, /* ' */
        0x29, /* ( */
        0x0B, /* ) */
        0x21, /* * */
        0x70, /* + */
        0x10, /* , */
        0x40, /* - */
        0x80, /* . */
        0x52, /* / */
        0x3F, /* 0 */
        0x06, /* 1 */
        0x5B, /* 2 */
        0x4F, /* 3 */
        0x66, /* 4 */
        0x6D, /* 5 */
        0x7D, /* 6 */
        0x07, /* 7 */
        0x7F, /* 8 */
        0x6F, /* 9 */
        0x09, /* : */
        0x0D, /* ; */
        0x61, /* < */
        0x48, /* = */
        0x43, /* > */
        0xD3, /* ? */
        0x5F, /* @ */
        0x77, /* A */
        0x7C, /* B */
        0x39, /* C */
        0x5E, /* D */
        0x79, /* E */
        0x71, /* F */
        0x3D, /* G */
        0x76, /* H */
        0x30, /* I */
        0x1E, /* J */
        0x75, /* K */
        0x38, /* L */
        0x15, /* M */
        0x37, /* N */
        0x3F, /* O */
        0x73, /* P */
        0x6B, /* Q */
        0x33, /* R */
        0x6D, /* S */
        0x78, /* T */
        0x3E, /* U */
        0x3E, /* V */
        0x2A, /* W */
        0x76, /* X */
        0x6E, /* Y */
        0x5B, /* Z */
        0x39, /* [ */
        0x64, /* \ */
        0x0F, /* ] */
        0x23, /* ^ */
        0x08, /* _ */
        0x02, /* ` */
        0x5F, /* a */
        0x7C, /* b */
        0x58, /* c */
        0x5E, /* d */
        0x7B, /* e */
        0x71, /* f */
        0x6F, /* g */
        0x74, /* h */
        0x10, /* i */
        0x0C, /* j */
        0x75, /* k */
        0x30, /* l */
        0x14, /* m */
        0x54, /* n */
        0x5C, /* o */
        0x73, /* p */
        0x67, /* q */
        0x50, /* r */
        0x6D, /* s */
        0x78, /* t */
        0x1C, /* u */
        0x1C, /* v */
        0x14, /* w */
        0x76, /* x */
        0x6E, /* y */
        0x5B, /* z */
    ]

    /**
     * TM1638 LED display
     */
    export class TM1638LEDs {
        clk: DigitalPin;
        dio: DigitalPin;
        strobe: DigitalPin;
        brightness: number;
        count: number;  // number of LEDs

        /**
         * initial TM1638
         */
        setup(): void {
            pins.digitalWritePin(this.dio, 0);
            pins.digitalWritePin(this.clk, 1);
            pins.digitalWritePin(this.strobe, 1);
            this.sendCommand(143);
            this.setBrightness(this.brightness);
            this.clear();
        }

        startCommand(): void {
            pins.digitalWritePin(this.strobe, 0);
        }

        sendCommand(num: number): void {
            this.startCommand();
            this.writeByte(num);
            this.endCommand();
        }

        writeByte(num: number): void {
            for (let j = 0; j <= 7; j++) {
                pins.digitalWritePin(this.dio, (num >> j) & 1);
                pins.digitalWritePin(this.clk, 1);
                pins.digitalWritePin(this.clk, 0);
            }
        }

        endCommand(): void {
            pins.digitalWritePin(this.strobe, 1);
        }

        /**
         * set TM1638 intensity, range is [0-8], 0 is off.
         * @param brightness the brightness of the TM1638, eg: 7
         */
        //% blockId="TM1638_set_intensity" block="%tm|set intensity %brightness"
        //% weight=50 blockGap=8
        //% parts="TM1638"
        setBrightness(brightness: number = 7): void {
            let value = 136 + (0x07 & brightness);
            this.sendCommand(value);
            this.brightness = value;
        }

        /**
         * show a number.
         * @param num is a number, eg: 0
         */
        //% blockId="TM1638_shownum" block="%tm|show number %num"
        //% weight=91 blockGap=8
        //% parts="TM1638"
        showNumber (num: number): void {
            let strg = "" + num;
            let vals = strg.split('');
            let offset = 8 - vals.length;
            for (let i = offset; i <= 7; i++) {
                this.show7Segment(i, fontMap[16 + parseInt(vals[i-offset])]);
            }
        }

        /**
         * shows text output on 7 segment displa<y
         * @param text text output to display
         */
        //% blockId="TM1638_showText" block="%tm|display text %text"
        //% weight=70 blockGap=8
        //% parts="TM1638"
        showText (text: string): void {
            let vals = text.toUpperCase().split('')
            for (let i = 0; i < Math.min(vals.length, 8); i++) {
                this.show7Segment(i, fontMap[vals[i].charCodeAt(0) - 32]);
            }
        }

        /**
         * show font based output on 7 segment display
         * @param position display number
         * @param value byte value to show
         */
        //% blockId="TM1638_show7seg" block="%tm|show 7 segment at %position|show %value"
        //% weight=70 blockGap=8
        //% parts="TM1638"
        show7Segment(position: number, value: number): void {
            this.sendCommand(0x44);
            this.startCommand();
            this.writeByte(0xC0 + (position << 1));
            this.writeByte(value);
            this.endCommand();
        }

        /**
         * turn LED on or off
         * @param ledNum LED number
         * @param on on/off
         */
        //% blockId="TM1638_setLed" block="%tm|turn LED %ledNum|on/off %on"
        //% weight=70 blockGap=8
        //% parts="TM1638"
        //% ledNum.min=1 ledNum.max=8 ledNum.defl=1
        setLed (ledNum: number, on: boolean): void {
            this.sendCommand(68);
            this.startCommand();
            this.writeByte(193 + ((ledNum-1) << 1));
            this.writeByte(on ? 1 : 0);
            this.endCommand();
        }

        /**
         * clear LED.
         */
        //% blockId="TM1638_clear" block="clear %tm"
        //% weight=80 blockGap=8
        //% parts="TM1638"
        clear(): void {
            this.sendCommand(64);
            this.startCommand();
            this.writeByte(192);
            for (let index = 0; index < 16; index++) {
                this.writeByte(0);
            }
            this.endCommand();
        }

        readByte(): number {
            let num = 0;
            for (let k = 0; k <= 7; k++) {
                pins.digitalWritePin(this.clk, 1);
                num |= pins.digitalReadPin(this.dio) << k;
                pins.digitalWritePin(this.clk, 0);
            }
            return num;
        }

        /**
         * reads button states as binary number, Button 1 equals 1, Button 2 equals 2, Button 8 equals 128, etc.
         * Multiple pressed buttons can be detected.
         */
        //% blockId="TM1638_readButtons" block="%tm read button states"
        //% weight=80 blockGap=8
        //% parts="TM1638"
        readButtons(): number {
            this.startCommand();
            this.writeByte(0x42);
            basic.pause(1);
            let buttons = 0;
            let v = 0;
            for (let i = 0; i < 4; i++) {
                v = this.readByte() << i;
                buttons |= v;
            }
            this.endCommand();
            return buttons
        }

        /**
         * check if button is pressed
         * @param buttonNum button number to check. Starts with 1
         */
        //% blockId="TM1638_buttonState" block="%tm button %buttonNum|pressed"
        //% weight=80 blockGap=8
        //% parts="TM1638"
        //% buttonNum.min=1 buttonNum.max=8 buttonNum.defl=1
        buttonPressed(buttonNum: number): boolean {
            return (this.readButtons() >> (buttonNum-1) & 1) == 1
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
        tm.setup();
        return tm;
    }
}
