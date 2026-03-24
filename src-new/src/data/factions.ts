export interface Faction {
  id: number;
  name: string;
  icon: string;
  heroImg: string;
  shortName: string;
}

const BASE = import.meta.env.BASE_URL;
const IMG = `${BASE}assets/factions/`;
const HERO = `${BASE}assets/heroes/`;

function f(
  id: number,
  name: string,
  iconFile: string,
  shortName: string,
  heroExt = ".png",
): Faction {
  return {
    id,
    name,
    icon: IMG + iconFile,
    heroImg: HERO + "h_" + shortName + heroExt,
    shortName,
  };
}

export const FACTIONS: Faction[] = [
  f(0, "Arborec", "arborec.png", "Arborec"),
  f(1, "Barony of Letnev", "letnev.png", "Letnev"),
  f(2, "Clan of Saar", "saar.png", "Saar"),
  f(3, "Embers of Muaat", "muat.png", "Muaat"),
  f(4, "Emirates of Hacan", "hacan.png", "Hacan"),
  f(5, "Federation of Sol", "sol.png", "Sol"),
  f(6, "Ghosts of Creuss", "creuss.png", "Creuss"),
  f(7, "L1z1x Mindnet", "l1z1x.png", "L1z1x"),
  f(8, "Mentak Coalition", "mentak.png", "Mentak"),
  f(9, "Naalu Collective", "naalu.png", "Naalu"),
  f(10, "Nekro Virus", "nekro.png", "Nekro"),
  f(11, "Sardak Norr", "sardak.png", "Sardak"),
  f(12, "Universities of Jol-Nar", "jol.png", "Jol"),
  f(13, "Winnu", "winnu.png", "Winnu"),
  f(14, "Xxcha Kingdoms", "xxcha.png", "Xxcha"),
  f(15, "Yin Brotherhood", "yin.png", "Yin"),
  f(16, "Yssaril Tribes", "yssrail.png", "Yssaril"),
  f(17, "Argent Flight", "argent.png", "Argent"),
  f(18, "Empyrean", "empyrean.png", "Empyrean"),
  f(19, "Mahact Gene-Sorcerers", "mahact.png", "Mahact"),
  f(20, "Naaz-Rokha Alliance", "naaz.png", "Naaz"),
  f(21, "The Nomad", "nomad.png", "Nomad"),
  f(22, "Titans of Ul", "titans.png", "Titans"),
  f(23, "Vuil'Raith Cabal", "vuil.png", "Vuil"),
  f(24, "The Council Keleres", "keleres.png", "Keleres"),
  f(25, "Last Bastion", "bastion.png", "Bastion", ".webp"),
  f(26, "The Ral Nel Consortium", "ralnel.png", "Ral Nel", ".webp"),
  f(27, "Crimson Rebellion", "crimson.png", "Crimson", ".webp"),
  f(28, "Deepwrought Scholarate", "deepwrought.png", "Deepwrought", ".webp"),
  f(29, "The Firmament", "firmament.png", "Firmament", ".webp"),
  f(30, "The Shipwrights of Axis", "axis.png", "Axis"),
  f(31, "The Bentor Conglomerate", "bentor.png", "Bentor"),
  f(32, "The Celdauri Trade Confederation", "celdauri.png", "Celdauri"),
  f(33, "The Cheiran Hordes", "cheiran.png", "Cheiran"),
  f(34, "The Savages of Cymiae", "cymiae.png", "Cymiae"),
  f(35, "The Dih-Mohn Flotilla", "dih-mohn.png", "Dih-Mohn"),
  f(36, "The Edyn Mandate", "edyn.png", "Edyn"),
  f(37, "The Florzen Profiteers", "florzen.png", "Florzen"),
  f(38, "The Free Systems Compact", "fsc.png", "Free Systems"),
  f(39, "The Ghemina Raiders", "ghemina.png", "Ghemina"),
  f(40, "The Ghoti Wayfarers", "ghoti.png", "Ghoti"),
  f(41, "The GLEdge Union", "gledge.png", "GLEdge"),
  f(42, "The Augurs of Ilyxum", "ilyxum.png", "Ilyxum"),
  f(43, "The Berserkers of Kjalengard", "berserkers.png", "Kjalengard"),
  f(44, "The Kollecc Society", "collecc.png", "Kollecc"),
  f(45, "The Monks of Kolume", "kolume.png", "Kolume"),
  f(46, "The Kortali Tribunal", "kortali.png", "Kortali"),
  f(47, "The Kyro Sodality", "kyro.png", "Kyro"),
  f(48, "The Lanefir Remnants", "lanefir.png", "Lanefir"),
  f(49, "The Li-Zho Dynasty", "li-zho.png", "Li-Zho"),
  f(50, "The L'tokk Khrask", "ltokk.png", "L tokk"),
  f(51, "The Mirveda Protectorate", "mirveda.png", "Mirveda"),
  f(52, "The Glimmer of Mortheus", "glimmer.png", "Mortheus"),
  f(53, "The Myko-Mentori", "myko.png", "Myko"),
  f(54, "The Nivyn Star Kings", "nivyn.png", "Nivyn"),
  f(55, "The Nokar Sellships", "nokar.png", "Nokar"),
  f(56, "The Olradin League", "olradin.png", "Olradin"),
  f(57, "The Zealots of Rhodun", "rhodun.png", "Rhodun"),
  f(58, "Roh'Dhna Mechatronics", "rohdna.png", "Roh Dhna"),
  f(59, "The Tnelis Syndicate", "tnelis.png", "Tnelis"),
  f(60, "The Vaden Banking Clans", "vaden.png", "Vaden"),
  f(61, "The Vaylerian Scourge", "vaylerian.png", "Vaylerian"),
  f(62, "The Veldyr Sovereignty", "veldyr.png", "Veldyr"),
  f(63, "The Zelian Purifier", "zelian.png", "Zelian"),
  f(64, "The Drahn Consortium", "drahn.png", "Drahn"),
  f(65, "The Obsidian", "firmament.png", "Obsidian", ".webp"),
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

export function getFactionName(factionId: number): string {
  const faction = FACTIONS[factionId];
  return faction ? faction.name : "Unknown";
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
