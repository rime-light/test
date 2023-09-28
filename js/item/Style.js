export const Color16 = {
    black: 0,
    darkred: 1,
    red: 2,
    darkmagenta : 3,
    magenta: 4,
    darkblue: 5,
    blue: 6,
    darkcyan: 7,
    cyan: 8,
    darkgreen: 9,
    green: 10,
    greenyellow: 11,
    darkyellow: 12,
    yellow: 13,
    orange: 14,
    white: 15,
    random() { return randomInt(0, 15); }
};
export const Color8 = {
    black: 0,
    red: 1,
    magenta: 2,
    blue: 3,
    cyan: 4,
    green: 5,
    yellow: 6,
    white: 7,
    random() { return randomInt(0, 7); }
};
export const Color4 = {
    red: 0,
    blue: 1,
    green: 2,
    yellow: 3,
    random() { return randomInt(0, 3); }
};
export const Size = {
    rice: 2.0,
    needle: 2.0,
    firearm: 2.0,
    scale: 2.0,
    paper: 2.4,
    small: 3.0,
    // star: 3.0,
    water: 3.5,
    butterfly: 3.5,
    knife: 4.5,
    // ellipse: 4.5,
    middle: 6.0,
    glow: 11.0,
    large: 12.5
};