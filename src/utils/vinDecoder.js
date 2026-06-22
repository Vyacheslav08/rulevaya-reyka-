// WMI (первые 3 символа VIN) → { brand, country }
const WMI_MAP = {
  // Audi
  WAU: { brand: 'Audi',       country: 'Германия' },
  WA1: { brand: 'Audi',       country: 'Германия' },
  // BMW
  WBA: { brand: 'BMW',        country: 'Германия' },
  WBS: { brand: 'BMW M',      country: 'Германия' },
  WBX: { brand: 'BMW',        country: 'Германия' },
  X4X: { brand: 'BMW',        country: 'Россия'   },
  // Mercedes
  WDB: { brand: 'Mercedes',   country: 'Германия' },
  WDD: { brand: 'Mercedes',   country: 'Германия' },
  WDC: { brand: 'Mercedes',   country: 'Германия' },
  WDF: { brand: 'Mercedes',   country: 'Германия' },
  // VW
  WVW: { brand: 'VW',         country: 'Германия' },
  WV2: { brand: 'VW',         country: 'Германия' },
  WV1: { brand: 'VW',         country: 'Германия' },
  WVG: { brand: 'VW',         country: 'Германия' },
  WV3: { brand: 'VW',         country: 'Германия' },
  // Skoda
  TMB: { brand: 'Skoda',      country: 'Чехия'    },
  XW8: { brand: 'Skoda',      country: 'Беларусь' },
  XWB: { brand: 'Skoda',      country: 'Россия'   },
  // Seat
  VSS: { brand: 'Seat',       country: 'Испания'  },
  VS6: { brand: 'Seat',       country: 'Испания'  },
  VSK: { brand: 'Seat',       country: 'Испания'  },
  // Volvo
  YV1: { brand: 'Volvo',      country: 'Швеция'   },
  YV4: { brand: 'Volvo',      country: 'Швеция'   },
  // Renault
  VF1: { brand: 'Renault',    country: 'Франция'  },
  VF8: { brand: 'Renault',    country: 'Франция'  },
  VF6: { brand: 'Renault',    country: 'Франция'  },
  X7L: { brand: 'Renault',    country: 'Россия'   },
  // Peugeot
  VF3: { brand: 'Peugeot',    country: 'Франция'  },
  VF9: { brand: 'Peugeot',    country: 'Франция'  },
  Z8T: { brand: 'Peugeot',    country: 'Словакия' },
  // Citroen
  VF7: { brand: 'Citroën',    country: 'Франция'  },
  // Ford
  WF0: { brand: 'Ford',       country: 'Германия' },
  WFO: { brand: 'Ford',       country: 'Германия' },
  X9F: { brand: 'Ford',       country: 'Россия'   },
  // Opel
  W0L: { brand: 'Opel',       country: 'Германия' },
  XUF: { brand: 'Opel',       country: 'Россия'   },
  // Mazda
  JMZ: { brand: 'Mazda',      country: 'Япония'   },
  // Honda
  SHH: { brand: 'Honda',      country: 'Британия' },
  // Mitsubishi
  XMC: { brand: 'Mitsubishi', country: 'Россия'   },
  // Kia
  KNA: { brand: 'Kia',        country: 'Корея'    },
  U5Y: { brand: 'Kia',        country: 'Корея'    },
}

// 10-й символ VIN → год выпуска
const YEAR_MAP = {
  A: 2010, B: 2011, C: 2012, D: 2013, E: 2014, F: 2015,
  G: 2016, H: 2017, J: 2018, K: 2019, L: 2020, M: 2021,
  N: 2022, P: 2023, R: 2024, S: 2025, T: 2026,
  // 1980–2009
  '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005,
  '6': 2006, '7': 2007, '8': 2008, '9': 2009,
  // 1980–2000
  V: 1997, W: 1998, X: 1999, Y: 2000,
}

export function decodeVin(vin) {
  const v = vin.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (v.length !== 17) return { error: `VIN должен содержать ровно 17 символов (сейчас ${v.length})` }

  const wmi  = v.substring(0, 3)
  const brandInfo = WMI_MAP[wmi] || WMI_MAP[v.substring(0, 2)] || null
  const yearChar = v[9]
  const year = YEAR_MAP[yearChar] || null

  return {
    vin: v,
    wmi,
    brand:   brandInfo?.brand   || null,
    country: brandInfo?.country || null,
    year,
    yearChar,
    vds: v.substring(3, 9),
    vis: v.substring(9),
    known: !!brandInfo,
  }
}

export function validateVin(vin) {
  const v = vin.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (v.length === 0) return 'Введите VIN'
  if (v.length !== 17) return `Нужно 17 символов, сейчас ${v.length}`
  // I, O, Q — запрещены в VIN
  if (/[IOQ]/.test(v)) return 'VIN не может содержать буквы I, O или Q'
  return null
}
