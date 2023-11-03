import Test from "../spellCard/Test.js";
import FreezeStar from "../spellCard/FreezeStar.js";
import SparklingWater from "../spellCard/SparklingWater.js";
import Mishaguji from "../spellCard/Mishaguji.js";
import Day210 from "../spellCard/Day210.js";
import DreamSealWabi from "../spellCard/DreamSealWabi.js";
import ForKilling from "../spellCard/ForKilling.js";
import MetsuzaiTemple from "../spellCard/MetsuzaiTemple.js";
import ShrineVisits from "../spellCard/ShrineVisits.js";
import IllusionSeeker from "../spellCard/IllusionSeeker.js";
import Macrocosm from "../spellCard/Macrocosm.js";
import OrleansDolls from "../spellCard/OrleansDolls.js";
import IntermittentSpring from "../spellCard/IntermittentSpring.js";

export const spellList = [
    {
        name: "弹幕测试",
        render() { return new Test(); }
    },
    {
        name: "「战栗的寒冷之星」",
        render() { return new FreezeStar(); }
    },
    {
        name: "「用于杀人的纯粹弹幕」",
        render() { return new ForKilling(); }
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
    },
    {
        name: "回灵「梦想封印　侘」",
        render() { return new DreamSealWabi(); }
    },
    {
        name: "藤原「灭罪寺院伤」",
        render() { return new MetsuzaiTemple(); }
    },
    {
        name: "恨符「丑时参拜第七日」",
        render() { return new ShrineVisits(); }
    },
    {
        name: "狂视「狂视调律(Illusion Seeker)」",
        render() { return new IllusionSeeker(); }
    },
    {
        name: "「神灵大宇宙」",
        render() { return new Macrocosm(); }
    },
    {
        name: "苍符「博爱的奥尔良人偶」",
        render() { return new OrleansDolls(); }
    },
    {
        name: "核热「炽热间歇泉」",
        render() { return new IntermittentSpring(); }
    }
]