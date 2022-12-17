let tm = TM1638.create(
    DigitalPin.P1,
    DigitalPin.P0,
    DigitalPin.P2,
    7,
    8
)
tm.clear()
for (let Index = 0; Index <= 5; Index++) {
    tm.setLed(Index + 1, true)
    basic.pause(500)
}
basic.forever(function () {
    if (tm.buttonPressed(1)) {
        tm.showNumber(1)
    } else if (tm.buttonPressed(2)) {
        tm.showNumber(2)
    } else {
        tm.show7Segment(7, 0)
    }
})
