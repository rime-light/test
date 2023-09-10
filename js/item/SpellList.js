import FreezeStar from "../spellCard/FreezeStar.js";
import SparklingWater from "../spellCard/SparklingWater.js";
import Mishaguji from "../spellCard/Mishaguji.js";
import Day210 from "../spellCard/Day210.js";

export const spellList = [
    {
        name: "「战栗的寒冷之星」",
        render() { return new FreezeStar(); }
    },
    {
        name: "漂溺「粼粼水底之心伤」",
        render() { return new SparklingWater(); }
    },
    {
        name: "祟符「洩矢大人」",
        render() { return new Mishaguji(); }
    },
    {
        name: "风神「二百十日」",
        render() { return new Day210(); }
    }
]