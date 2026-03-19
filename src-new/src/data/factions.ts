import type { Locale } from "src/store/types";

export interface Faction {
  id: number;
  names: Record<Locale, string>;
  icon: string;
  heroImg: string;
  shortName: string;
}

const BASE = import.meta.env.BASE_URL;
const IMG = `${BASE}assets/factions/`;
const HERO = `${BASE}assets/heroes/`;

function f(
  id: number,
  en: string,
  fr: string,
  de: string,
  ru: string,
  es: string,
  zh: string,
  pl: string,
  iconFile: string,
  shortName: string,
  heroExt = ".png",
): Faction {
  return {
    id,
    names: { en, fr, de, ru, es, zh, pl },
    icon: IMG + iconFile,
    heroImg: HERO + "h_" + shortName + heroExt,
    shortName,
  };
}

export const FACTIONS: Faction[] = [
  f(0, "Arborec", "Arborec", "Arborec", "Арбореки", "Los Arborec", "昂博瑞克", "Arborekowie", "arborec.png", "Arborec"),
  f(1, "Barony of Letnev", "Baronnie de Letnev", "Baronat von Letnev", "Баронат Летнев", "La Baronía de Letnev", "蓝特涅夫领地", "Baronia Letnev", "letnev.png", "Letnev"),
  f(2, "Clan of Saar", "Clan de Saar", "Clan der Zaar", "Клан Сааров", "El Clan de Saar", "萨尔氏族", "Klan Saar", "saar.png", "Saar"),
  f(3, "Embers of Muaat", "Braises de Muaat", "Glut von Muaat", "Тлеющие с Муаата", "Las Ascuas de Muaat", "穆亚特灰烬", "Żagwie Muaat", "muat.png", "Muaat"),
  f(4, "Emirates of Hacan", "Emirats de Hacan", "Emirate von Hacan", "Хаканские Эмираты", "Los Emiratos de Hacan", "哈肯酋长国", "Emiraty Hakanów", "hacan.png", "Hacan"),
  f(5, "Federation of Sol", "Fédération de Sol", "Sol Föderation", "Федерация Сол", "La Federación de Sol", "太阳系联邦", "Federacja Sol", "sol.png", "Sol"),
  f(6, "Ghosts of Creuss", "Fantômes de Creuss", "Geister von Creuss", "Призраки Креусса", "Los Fantasmas de Creuss", "克洛斯幽灵", "Widma z Creussa", "creuss.png", "Creuss"),
  f(7, "L1z1x Mindnet", "Réseau d'Esprit L1z1x", "L1Z1X Gedankennetz", "Психосеть Л1З1КС", "La Red Mental L1z1x", "拉萨斯智慧体", "Współjaźń L1z1x", "l1z1x.png", "L1z1x"),
  f(8, "Mentak Coalition", "Coalition Mentak", "Mentak Koalition", "Коалиция Ментака", "La Coalición Mentak", "曼塔克联盟", "Koalicja Mentaka", "mentak.png", "Mentak"),
  f(9, "Naalu Collective", "Collectif Naalu", "Naalo-Kollektiv", "Клубок Наалу", "El Colectivo Naalu", "纳鲁集团", "Kolektyw Naalu", "naalu.png", "Naalu"),
  f(10, "Nekro Virus", "Virus Nekro", "Nekro-Virus", "Некровирус", "El Virus Nekro", "奈克洛病毒", "Nekrowirus", "nekro.png", "Nekro"),
  f(11, "Sardak Norr", "Sardakk N'orr", "Sardakk N'orr", "Сардак Н'орр", "Los Sardak Norr", "萨达克诺里", "Sardakk N'orr", "sardak.png", "Sardak"),
  f(12, "Universities of Jol-Nar", "Universités de Jol-Nar", "Universitiät von Jol-Nar", "Жол-Нарские университеты", "Las Universidades de Jol-Nar", "乔纳学盟", "Uniwersytety Jol-Nar", "jol.png", "Jol"),
  f(13, "Winnu", "Winnu", "Winnu", "Винну", "Los Winnu", "维努人", "Winnu", "winnu.png", "Winnu"),
  f(14, "Xxcha Kingdoms", "Royaume Xxcha", "Xxcha Königreich", "Королевство Ззча", "El Reino de Xxcha", "艾克私恰王国", "Królestwo Xxcha", "xxcha.png", "Xxcha"),
  f(15, "Yin Brotherhood", "Fraternité de Yin", "Yin Brunderschaft", "Братство Инь", "La Hermandad del Yin", "伊恩兄弟会", "Bractwo Yin", "yin.png", "Yin"),
  f(16, "Yssaril Tribes", "Tribus Yssaril", "Yssaril-Stämme", "Племена Иссарилов", "Las Tribus de Yssaril", "伊萨利尔部落", "Plemiona Yssaril", "yssrail.png", "Yssaril"),
  f(17, "Argent Flight", "Nuée Argentée", "Argent Flight", "Argent Flight", "La Bandada Argéntea", "银色飞翼", "Srebrny klucz", "argent.png", "Argent"),
  f(18, "Empyrean", "Empyréens", "Empyrean", "Empyrean", "Los Empíreos", "最高天", "Niebianie", "empyrean.png", "Empyrean"),
  f(19, "Mahact Gene-Sorcerers", "Sorciers Mahact", "Mahact Gene-Sorcerers", "Mahact Gene-Sorcerers", "Los Genechiceros de Mahact", "玛哈克特-基因术士", "Geno-Czarownicy Mahactów", "mahact.png", "Mahact"),
  f(20, "Naaz-Rokha Alliance", "Alliance Naaz-Rokha", "Naaz-Rokha Alliance", "Naaz-Rokha Alliance", "La Alianza Naaz-Rokha", "纳兹-洛克哈联盟", "Sojusz Naaz-Rokha", "naaz.png", "Naaz"),
  f(21, "The Nomad", "Le Nomade", "The Nomad", "The Nomad", "Los Nomadas", "游牧民/流浪者", "Nomada", "nomad.png", "Nomad"),
  f(22, "Titans of Ul", "Titans d'Ul", "Titans of Ul", "Titans of Ul", "Los Titanes de Ul", "提坦复苏/泰坦", "Tytani UL", "titans.png", "Titans"),
  f(23, "Vuil'Raith Cabal", "Cabale de Vuil'Raith", "Vuil'Raith Cabal", "Vuil'Raith Cabal", "La Cábala de Vuil'Raith", "乌尔莱斯之祸/鳄鱼", "Koteria Vuil'Raith", "vuil.png", "Vuil"),
  f(24, "The Council Keleres", "Le Conseil Keleres", "The Council Keleres", "The Council Keleres", "The Council Keleres", "克勒雷斯理事会", "The Council Keleres", "keleres.png", "Keleres"),
  f(25, "Last Bastion", "Last Bastion", "Last Bastion", "Last Bastion", "Last Bastion", "Last Bastion", "Last Bastion", "bastion.png", "Bastion", ".webp"),
  f(26, "The Ral Nel Consortium", "The Ral Nel Consortium", "The Ral Nel Consortium", "The Ral Nel Consortium", "The Ral Nel Consortium", "The Ral Nel Consortium", "The Ral Nel Consortium", "ralnel.png", "Ral Nel", ".webp"),
  f(27, "Crimson Rebellion", "Crimson Rebellion", "Crimson Rebellion", "Crimson Rebellion", "Crimson Rebellion", "Crimson Rebellion", "Crimson Rebellion", "crimson.png", "Crimson", ".webp"),
  f(28, "Deepwrought Scholarate", "Deepwrought Scholarate", "Deepwrought Scholarate", "Deepwrought Scholarate", "Deepwrought Scholarate", "Deepwrought Scholarate", "Deepwrought Scholarate", "deepwrought.png", "Deepwrought", ".webp"),
  f(29, "The Firmament", "The Firmament", "The Firmament", "The Firmament", "The Firmament", "The Firmament", "The Firmament", "firmament.png", "Firmament", ".webp"),
  f(30, "The Shipwrights of Axis", "The Shipwrights of Axis", "The Shipwrights of Axis", "The Shipwrights of Axis", "The Shipwrights of Axis", "The Shipwrights of Axis", "The Shipwrights of Axis", "axis.png", "Axis"),
  f(31, "The Bentor Conglomerate", "The Bentor Conglomerate", "The Bentor Conglomerate", "The Bentor Conglomerate", "The Bentor Conglomerate", "The Bentor Conglomerate", "The Bentor Conglomerate", "bentor.png", "Bentor"),
  f(32, "The Celdauri Trade Confederation", "The Celdauri Trade Confederation", "The Celdauri Trade Confederation", "The Celdauri Trade Confederation", "The Celdauri Trade Confederation", "The Celdauri Trade Confederation", "The Celdauri Trade Confederation", "celdauri.png", "Celdauri"),
  f(33, "The Cheiran Hordes", "The Cheiran Hordes", "The Cheiran Hordes", "The Cheiran Hordes", "The Cheiran Hordes", "The Cheiran Hordes", "The Cheiran Hordes", "cheiran.png", "Cheiran"),
  f(34, "The Savages of Cymiae", "The Savages of Cymiae", "The Savages of Cymiae", "The Savages of Cymiae", "The Savages of Cymiae", "The Savages of Cymiae", "The Savages of Cymiae", "cymiae.png", "Cymiae"),
  f(35, "The Dih-Mohn Flotilla", "The Dih-Mohn Flotilla", "The Dih-Mohn Flotilla", "The Dih-Mohn Flotilla", "The Dih-Mohn Flotilla", "The Dih-Mohn Flotilla", "The Dih-Mohn Flotilla", "dih-mohn.png", "Dih-Mohn"),
  f(36, "The Edyn Mandate", "The Edyn Mandate", "The Edyn Mandate", "The Edyn Mandate", "The Edyn Mandate", "The Edyn Mandate", "The Edyn Mandate", "edyn.png", "Edyn"),
  f(37, "The Florzen Profiteers", "The Florzen Profiteers", "The Florzen Profiteers", "The Florzen Profiteers", "The Florzen Profiteers", "The Florzen Profiteers", "The Florzen Profiteers", "florzen.png", "Florzen"),
  f(38, "The Free Systems Compact", "The Free Systems Compact", "The Free Systems Compact", "The Free Systems Compact", "The Free Systems Compact", "The Free Systems Compact", "The Free Systems Compact", "fsc.png", "Free Systems"),
  f(39, "The Ghemina Raiders", "The Ghemina Raiders", "The Ghemina Raiders", "The Ghemina Raiders", "The Ghemina Raiders", "The Ghemina Raiders", "The Ghemina Raiders", "ghemina.png", "Ghemina"),
  f(40, "The Ghoti Wayfarers", "The Ghoti Wayfarers", "The Ghoti Wayfarers", "The Ghoti Wayfarers", "The Ghoti Wayfarers", "The Ghoti Wayfarers", "The Ghoti Wayfarers", "ghoti.png", "Ghoti"),
  f(41, "The GLEdge Union", "The GLEdge Union", "The GLEdge Union", "The GLEdge Union", "The GLEdge Union", "The GLEdge Union", "The GLEdge Union", "gledge.png", "GLEdge"),
  f(42, "The Augurs of Ilyxum", "The Augurs of Ilyxum", "The Augurs of Ilyxum", "The Augurs of Ilyxum", "The Augurs of Ilyxum", "The Augurs of Ilyxum", "The Augurs of Ilyxum", "ilyxum.png", "Ilyxum"),
  f(43, "The Berserkers of Kjalengard", "The Berserkers of Kjalengard", "The Berserkers of Kjalengard", "The Berserkers of Kjalengard", "The Berserkers of Kjalengard", "The Berserkers of Kjalengard", "The Berserkers of Kjalengard", "berserkers.png", "Kjalengard"),
  f(44, "The Kollecc Society", "The Kollecc Society", "The Kollecc Society", "The Kollecc Society", "The Kollecc Society", "The Kollecc Society", "The Kollecc Society", "collecc.png", "Kollecc"),
  f(45, "The Monks of Kolume", "The Monks of Kolume", "The Monks of Kolume", "The Monks of Kolume", "The Monks of Kolume", "The Monks of Kolume", "The Monks of Kolume", "kolume.png", "Kolume"),
  f(46, "The Kortali Tribunal", "The Kortali Tribunal", "The Kortali Tribunal", "The Kortali Tribunal", "The Kortali Tribunal", "The Kortali Tribunal", "The Kortali Tribunal", "kortali.png", "Kortali"),
  f(47, "The Kyro Sodality", "The Kyro Sodality", "The Kyro Sodality", "The Kyro Sodality", "The Kyro Sodality", "The Kyro Sodality", "The Kyro Sodality", "kyro.png", "Kyro"),
  f(48, "The Lanefir Remnants", "The Lanefir Remnants", "The Lanefir Remnants", "The Lanefir Remnants", "The Lanefir Remnants", "The Lanefir Remnants", "The Lanefir Remnants", "lanefir.png", "Lanefir"),
  f(49, "The Li-Zho Dynasty", "The Li-Zho Dynasty", "The Li-Zho Dynasty", "The Li-Zho Dynasty", "The Li-Zho Dynasty", "The Li-Zho Dynasty", "The Li-Zho Dynasty", "li-zho.png", "Li-Zho"),
  f(50, "The L'tokk Khrask", "The L'tokk Khrask", "The L'tokk Khrask", "The L'tokk Khrask", "The L'tokk Khrask", "The L'tokk Khrask", "The L'tokk Khrask", "ltokk.png", "L tokk"),
  f(51, "The Mirveda Protectorate", "The Mirveda Protectorate", "The Mirveda Protectorate", "The Mirveda Protectorate", "The Mirveda Protectorate", "The Mirveda Protectorate", "The Mirveda Protectorate", "mirveda.png", "Mirveda"),
  f(52, "The Glimmer of Mortheus", "The Glimmer of Mortheus", "The Glimmer of Mortheus", "The Glimmer of Mortheus", "The Glimmer of Mortheus", "The Glimmer of Mortheus", "The Glimmer of Mortheus", "glimmer.png", "Mortheus"),
  f(53, "The Myko-Mentori", "The Myko-Mentori", "The Myko-Mentori", "The Myko-Mentori", "The Myko-Mentori", "The Myko-Mentori", "The Myko-Mentori", "myko.png", "Myko"),
  f(54, "The Nivyn Star Kings", "The Nivyn Star Kings", "The Nivyn Star Kings", "The Nivyn Star Kings", "The Nivyn Star Kings", "The Nivyn Star Kings", "The Nivyn Star Kings", "nivyn.png", "Nivyn"),
  f(55, "The Nokar Sellships", "The Nokar Sellships", "The Nokar Sellships", "The Nokar Sellships", "The Nokar Sellships", "The Nokar Sellships", "The Nokar Sellships", "nokar.png", "Nokar"),
  f(56, "The Olradin League", "The Olradin League", "The Olradin League", "The Olradin League", "The Olradin League", "The Olradin League", "The Olradin League", "olradin.png", "Olradin"),
  f(57, "The Zealots of Rhodun", "The Zealots of Rhodun", "The Zealots of Rhodun", "The Zealots of Rhodun", "The Zealots of Rhodun", "The Zealots of Rhodun", "The Zealots of Rhodun", "rhodun.png", "Rhodun"),
  f(58, "Roh'Dhna Mechatronics", "Roh'Dhna Mechatronics", "Roh'Dhna Mechatronics", "Roh'Dhna Mechatronics", "Roh'Dhna Mechatronics", "Roh'Dhna Mechatronics", "Roh'Dhna Mechatronics", "rohdna.png", "Roh Dhna"),
  f(59, "The Tnelis Syndicate", "The Tnelis Syndicate", "The Tnelis Syndicate", "The Tnelis Syndicate", "The Tnelis Syndicate", "The Tnelis Syndicate", "The Tnelis Syndicate", "tnelis.png", "Tnelis"),
  f(60, "The Vaden Banking Clans", "The Vaden Banking Clans", "The Vaden Banking Clans", "The Vaden Banking Clans", "The Vaden Banking Clans", "The Vaden Banking Clans", "The Vaden Banking Clans", "vaden.png", "Vaden"),
  f(61, "The Vaylerian Scourge", "The Vaylerian Scourge", "The Vaylerian Scourge", "The Vaylerian Scourge", "The Vaylerian Scourge", "The Vaylerian Scourge", "The Vaylerian Scourge", "vaylerian.png", "Vaylerian"),
  f(62, "The Veldyr Sovereignty", "The Veldyr Sovereignty", "The Veldyr Sovereignty", "The Veldyr Sovereignty", "The Veldyr Sovereignty", "The Veldyr Sovereignty", "The Veldyr Sovereignty", "veldyr.png", "Veldyr"),
  f(63, "The Zelian Purifier", "The Zelian Purifier", "The Zelian Purifier", "The Zelian Purifier", "The Zelian Purifier", "The Zelian Purifier", "The Zelian Purifier", "zelian.png", "Zelian"),
  f(64, "The Drahn Consortium", "The Drahn Consortium", "The Drahn Consortium", "The Drahn Consortium", "The Drahn Consortium", "The Drahn Consortium", "The Drahn Consortium", "drahn.png", "Drahn"),
  f(65, "The Obsidian", "The Obsidian", "The Obsidian", "The Obsidian", "The Obsidian", "The Obsidian", "The Obsidian", "firmament.png", "Obsidian", ".webp"),
];

export const HACAN_ID = 4;
export const NAALU_ID = 9;
export const NEKRO_ID = 10;
export const WINNU_ID = 13;
export const POK_START = 17;
export const CODEX_ID = 24;
export const TE_START = 25;
export const RAL_NEL_ID = 26;
export const FIRMAMENT_ID = 29;
export const DS_START = 30;
export const DRAHN_ID = 64;
export const OBSIDIAN_ID = 65;

export function getFactionName(factionId: number, locale: Locale): string {
  const faction = FACTIONS[factionId];
  return faction ? faction.names[locale] : "Unknown";
}

export function getFactionIcon(factionId: number): string {
  const faction = FACTIONS[factionId];
  return faction ? faction.icon : "";
}

export function getFactionShortName(factionId: number): string {
  const faction = FACTIONS[factionId];
  return faction ? faction.shortName : "";
}

export function getFactionCategory(
  factionId: number,
): "base" | "pok" | "codex" | "te" | "ds" {
  if (factionId === CODEX_ID || factionId === DRAHN_ID) return "codex";
  if (factionId >= TE_START && factionId < DS_START) return "te";
  if (factionId >= DS_START) return "ds";
  if (factionId >= POK_START) return "pok";
  return "base";
}

export function isSelectableFaction(factionId: number): boolean {
  return factionId !== OBSIDIAN_ID;
}

export function isTEOrObsidian(factionId: number): boolean {
  return (
    (factionId >= TE_START && factionId < DS_START) ||
    factionId === OBSIDIAN_ID
  );
}
