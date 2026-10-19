export const VIEW_W = 960;
export const VIEW_H = 540;
export const TILE = 32;
export const GROUND_Y = 13; // Ground line at 13 * 32 = 416px, height = 124px

export const GRAVITY = 1800;
export const MOVE_SPEED = 220;
export const JUMP_VELOCITY = -520;
export const BIRD_JUMP_VELOCITY = -780;
export const MAX_FALL = 900;

export const SMALL_W = 20;
export const SMALL_H = 30;
export const BIG_W = 24;
export const BIG_H = 48;

export const BIRD_W = 56;
export const BIRD_H = 72;

export const LEVEL_LENGTH = 9000;
export const TIME_LIMIT = 180; // 3 minutes
export const PIT_REWARD = 10;

export const WORLD_THEMES = [
  {
    sky: ['#5c94fc', '#7ab8ff'],
    hill: '#3cb043',
    hillShadow: '#2d8a34',
    dirt: '#c84c0c',
    grass: '#00a800',
    grassLight: '#80d010',
    speck: '#a03800',
    name: 'Câmpia Senină',
  },
  {
    sky: ['#ef9d62', '#ffd39a'],
    hill: '#cb7045',
    hillShadow: '#98503b',
    dirt: '#9b4c36',
    grass: '#d28a47',
    grassLight: '#f3bb64',
    speck: '#633b35',
    name: 'Deșertul de Aur',
  },
  {
    sky: ['#514b87', '#a99be0'],
    hill: '#7062a5',
    hillShadow: '#51477e',
    dirt: '#684d68',
    grass: '#7185b0',
    grassLight: '#a8c2d6',
    speck: '#44364f',
    name: 'Amurgul Violet',
  },
  {
    sky: ['#329cbb', '#a0e2db'],
    hill: '#319d85',
    hillShadow: '#247462',
    dirt: '#81573d',
    grass: '#49a77e',
    grassLight: '#91d68b',
    speck: '#513c37',
    name: 'Valea Cristalului',
  },
  {
    sky: ['#ee7756', '#f7bd75'],
    hill: '#b54d43',
    hillShadow: '#823844',
    dirt: '#8b382f',
    grass: '#bf583d',
    grassLight: '#ed9760',
    speck: '#572b30',
    name: 'Munții Purpurii',
  },
  {
    sky: ['#283d78', '#7189bb'],
    hill: '#45577e',
    hillShadow: '#303d61',
    dirt: '#51495d',
    grass: '#687d91',
    grassLight: '#a5c0c5',
    speck: '#353644',
    name: 'Noaptea Înstelată',
  },
  {
    sky: ['#59bda0', '#c0e59a'],
    hill: '#5a9a63',
    hillShadow: '#3d744e',
    dirt: '#916c47',
    grass: '#75b653',
    grassLight: '#b4d96a',
    speck: '#5a4936',
    name: 'Pădurea Fermecată',
  },
  {
    sky: ['#241d48', '#735277'],
    hill: '#554063',
    hillShadow: '#392b4b',
    dirt: '#563748',
    grass: '#79505e',
    grassLight: '#bb7780',
    speck: '#342838',
    name: 'Castelul Întunecat',
  },
];
