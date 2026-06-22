// Дерево решений: по марке + году → список кандидатов + уточняющие вопросы
// Каждый узел: { code, label, note, questions? }
// questions: [{ id, text, options: [{ value, label, next }] }]

// ───────────── helpers ─────────────
const ask = (id, text, options) => ({ id, text, options })
const opt  = (value, label, code, note) => ({ value, label, code, note })

// ───────────── VAG (VW/Skoda/Seat/Audi) ─────────────
const vagPowerQ = ask('power', 'Тип усилителя руля?', [
  opt('gur', 'ГУР — гидравлика (ремень, шланги)', null, null),
  opt('eur', 'ЭУР — электро (только провода)',     null, null),
])

const vagDriveQ = ask('drive', 'Привод?', [
  opt('fwd', 'Передний / задний', null, null),
  opt('4wd', 'Полный (4x4)',      null, null),
])

const vag = {
  // G3: Golf 3, Passat B3-B4, Vento
  g3:  { year: [1988, 1998], code: 'G3',  label: 'G3 — Гидравлика Golf 3/Passat B3-B4' },
  // G4: Golf 4, Bora, Octavia A4, TT
  g4:  { year: [1997, 2006], code: 'G4',  label: 'G4 — Гидравлика Golf 4/Octavia A4 Tour' },
  // B5: Passat B5, Audi A4 до 2005
  b5:  { year: [1996, 2005], code: 'В5',  label: 'В5 — Passat B5/Audi A4 до 2005' },
  // СК: ЭУР 1-го пок.
  sk:  { year: [2004, 2009], code: 'СК',  label: 'СК — ЭУР 2-я ген. (Golf 5/Passat B6/Octavia A5 до 2009)' },
  // 3Т: ЭУР 2-го пок.
  tt3: { year: [2009, 2017], code: '3Т',  label: '3Т — ЭУР 3-я ген. (Golf 5-6/Passat B6/Octavia A5 2009+)' },
  // БК: ЭУР ZF белая крышка
  bk:  { year: [2008, 2017], code: 'БК',  label: 'БК — ZF белая крышка (Passat B6-B7/Tiguan 1/CC)' },
  // КР: MQB платформа
  kr:  { year: [2013, 2023], code: 'КР',  label: 'КР — MQB (Octavia A7/A8/Golf 7/Golf 8/Tiguan 2)' },
  // В8: новый Passat
  b8:  { year: [2014, 2024], code: 'В8',  label: 'В8 — Passat B8/Superb 3 (ZF 5Q0)' },
  // Sh: Sharan 1 / Galaxy 1 / Alhambra 1
  sh:  { year: [1995, 2010], code: 'Sh+', label: 'Sh+ — VW Sharan 1 / Ford Galaxy 1 / Seat Alhambra 1' },
}

// ───────────── BMW ─────────────
const bmw = {
  e46p: { year: [1998, 2006], code: 'Е46+', label: 'Е46+ — серый/синий/чёрный шильдик ZF (3.5 оборота)' },
  e46m: { year: [1998, 2006], code: 'Е46-', label: 'Е46- — жёлтый шильдик TRW (3 оборота)' },
  e464: { year: [1998, 2006], code: 'Е46 4x4', label: 'Е46 4x4 — полный привод (редкая)' },
  e90:  { year: [2005, 2013], code: 'E90',  label: 'E90 — гидравлика (BMW 3/1 E-серия, X1 E84)' },
  e90e: { year: [2005, 2013], code: 'E90',  label: 'E90 ЭУР — BMW 3/X1 E84 электро' },
  e60:  { year: [2003, 2010], code: 'E60',  label: 'E60 — BMW 5 E60/E61' },
  f2030:{ year: [2012, 2020], code: 'F20/F30', label: 'F20/F30 — BMW 1/3 F-серия задний привод' },
  f2021:{ year: [2011, 2019], code: 'F20/F21', label: 'F20/F21 — BMW 1 серия (маленький хэтч)' },
  f10:  { year: [2010, 2017], code: 'F10',  label: 'F10 — BMW 5 F10 задний привод' },
}

// ───────────── Mercedes ─────────────
const merc = {
  w168: { year: [1997, 2004], code: 'W168', label: 'W168 — Mercedes A-класс W168' },
  w169: { year: [2004, 2012], code: 'W169', label: 'W169/W245 — Mercedes A W169 / B W245 ЭУР' },
  w203: { year: [2000, 2007], code: 'W203',   label: 'W203 — Mercedes C-класс W203 без датчика' },
  w203d:{ year: [2000, 2007], code: 'W203-D', label: 'W203-D — Mercedes C-класс W203 с датчиком угла поворота' },
  w204:  { year: [2007, 2014], code: 'W204',   label: 'W204 — Mercedes C-класс W204 без датчика' },
  w204d: { year: [2007, 2014], code: 'W204+D', label: 'W204+D — Mercedes C-класс W204 с датчиком угла поворота' },
  w205: { year: [2014, 2022], code: 'W205', label: 'W205 — Mercedes C-класс W205' },
  w210: { year: [1995, 2002], code: 'W210',   label: 'W210 — Mercedes E-класс W210 без датчика' },
  w210d:{ year: [1995, 2002], code: 'W210+D', label: 'W210+D — Mercedes E-класс W210 с датчиком' },
  w211: { year: [2002, 2009], code: 'W211+D', label: 'W211 — Mercedes E-класс W211 / CLS W219' },
  w212:    { year: [2009, 2016], code: 'W212',     label: 'W212 — Mercedes E-класс W212 задний привод' },
  w212_4wd:{ year: [2009, 2016], code: 'W212 4x4', label: 'W212 4x4 — Mercedes E-класс W212 полный привод (под заказ 7-14 дней)' },
  w163: { year: [1997, 2005], code: 'W163', label: 'W163 — Mercedes ML W163' },
  w164: { year: [2005, 2012], code: 'W164', label: 'W164 — Mercedes ML W164 / R W251' },
  w246: { year: [2011, 2018], code: 'W246', label: 'W246 — Mercedes B-класс W246' },
}

// ───────────── Volvo ─────────────
const volvo = {
  xc70: { year: [2007, 2016], code: 'XC70',  label: 'XC70 — Volvo XC70/S60/S80/V70 2007-2016' },
  v70:  { year: [2007, 2016], code: 'V70',   label: 'V70 — Volvo V70/S60/XC90 (с подушкой мотора)' },
  s40:  { year: [1995, 2004], code: 'Volvo S40', label: 'Volvo S40 — S40/V40 до 2004 (= FFCM)' },
  v40:  { year: [2012, 2019], code: 'Volvo V40\S40', label: 'Volvo V40 II 2012-2019' },
}

// ───────────── Ford ─────────────
const ford = {
  ff:   { year: [2001, 2008], code: 'FF',   label: 'FF — Ford Fiesta/Fusion/Mazda 2' },
  ff1:  { year: [1998, 2012], code: 'FF1',  label: 'FF1 — Focus 1 / Transit Connect / Tourneo Connect' },
  ffcm: { year: [2004, 2015], code: 'FFCM', label: 'FFCM — Focus 2/Focus 3 гидро/C-Max до 2011/Volvo V50' },
  ff3:  { year: [2012, 2018], code: 'FF3',  label: 'FF3 — Focus 3 ЭУР / Kuga 2 / C-Max 2012+' },
  fm3:  { year: [2000, 2007], code: 'FM3',  label: 'FM3 — Mondeo 3' },
  fm4:  { year: [2007, 2014], code: 'FM4',  label: 'FM4 — Mondeo 4 / S-Max / Galaxy' },
}

// ───────────── Французы ─────────────
const french = {
  fr3p: { year: [2001, 2011], code: 'FR3+', label: 'FR3+ — Peugeot 307/308/Partner, Citroen C4 без ESP (>3 оборота)' },
  fr3m: { year: [2001, 2015], code: 'FR3-', label: 'FR3- — Peugeot 307/308/Partner, Citroen C4 с ESP (<3 оборота)' },
  xsp:  { year: [1999, 2010], code: 'XSP',  label: 'XSP — Xsara Picasso/Partner M59/Berlingo M59' },
  c2c3: { year: [2002, 2010], code: 'C2/C3', label: 'C2/C3 — Citroen C2/C3 гидравлика' },
  c3e:  { year: [2009, 2020], code: 'C3',   label: 'C3 ЭУР — Citroen C3 электро' },
  c5:   { year: [2001, 2008], code: 'С5',   label: 'С5 — Citroen C5 1 пок.' },
  c5x7: { year: [2008, 2016], code: 'С5 X7', label: 'С5 X7 — Citroen C5 X7 2008-2016' },
  p207: { year: [2002, 2014], code: '207',  label: '207 — Peugeot 207/C3 Picasso ЭУР' },
  p407:  { year: [2004, 2011], code: '407',   label: '407 — Peugeot 407 без датчика' },
  p407d: { year: [2004, 2011], code: '407-D', label: '407-D — Peugeot 407 с датчиком угла поворота' },
  p607: { year: [1994, 2010], code: '607',  label: '607 — Peugeot 607' },
  p406: { year: [1995, 2004], code: '406',  label: '406 — Peugeot 406' },
  p508: { year: [2010, 2023], code: '508',  label: '508 — Peugeot 508' },
  sc:   { year: [1996, 2003], code: 'SC',   label: 'SC — Renault Scenic 1/Megane 1' },
  sc2:  { year: [2002, 2009], code: 'SC2/Meg2', label: 'SC2 — Renault Scenic 2/Megane 2' },
  rl1:  { year: [1994, 2001], code: 'RL1',  label: 'RL1 — Renault Laguna 1' },
  rl2:  { year: [2001, 2007], code: 'RL2',  label: 'RL2 — Renault Laguna 2' },
  rl3:  { year: [2008, 2015], code: 'RL3',  label: 'RL3 — Renault Laguna 3/Latitude' },
  lg1:  { year: [2004, 2014], code: 'LG1',  label: 'LG1 — Renault Logan 1/Sandero 1' },
  lg2:  { year: [2014, 2023], code: 'LG2',  label: 'LG2 — Renault Logan 2/Sandero 2' },
}

// ───────────── Opel ─────────────
const opel = {
  oa:  { year: [1998, 2009], code: 'OA/OZ', label: 'OA/OZ — Opel Astra G/H / Zafira A/B' },
  ovc: { year: [2002, 2008], code: 'OVC',   label: 'OVC — Opel Vectra C (насос на рейке или под крылом!)' },
  ovb: { year: [1995, 2002], code: 'OVB',   label: 'OVB — Opel Vectra B' },
  oaj: { year: [2009, 2017], code: 'OAJ',   label: 'OAJ — Opel Astra J / Insignia (ЭУР, нужна адаптация)' },
}

// ════════════════════════════════
// Главная функция подбора
// info = результат decodeVin()
// answers = { power, drive, sensor, steeringType, esp } (могут быть undefined)
// ════════════════════════════════
export function getRackCandidates(info, answers = {}) {
  if (!info || !info.brand) return { candidates: [], questions: [], unknown: true }

  const year  = info.year  || 2010
  const brand = info.brand
  const ans   = answers

  const inYear = (range) => year >= range[0] && year <= range[1]

  let candidates = []
  let questions  = []

  // ── VW / Skoda / Seat ──────────────────────────────────────────────
  if (['VW', 'Skoda', 'Seat'].includes(brand)) {
    // Год 2013+ → скорее всего КР (MQB)
    if (year >= 2016) {
      candidates = [vag.kr, vag.b8]
      if (!ans.vagModel) {
        questions = [ask('vagModel', 'Уточните модель:', [
          opt('octavia_golf7', 'Octavia A7/A8, Golf 7/8, Jetta 6, Superb 3', 'КР', null),
          opt('passat_b8',     'Passat B8',                                  'В8', null),
          opt('tiguan2',       'Tiguan 2 (2016+)',                   'КР', 'Тот же КР что и Octavia A7'),
          opt('other',         'Другая',                             null, null),
        ])]
      } else if (ans.vagModel === 'passat_b8') {
        candidates = [vag.b8]
      } else {
        candidates = [vag.kr]
      }
    } else if (year >= 2013) {
      candidates = [vag.kr, vag.bk, vag.tt3]
      if (!ans.vagModel13) {
        questions = [ask('vagModel13', 'Модель автомобиля:', [
          opt('octavia_golf7', 'Octavia A7, Golf 7/8, Jetta 6', 'КР', null),
          opt('passat_b67',    'Passat B6/B7, Tiguan 1, CC, Sharan 2', 'БК', null),
          opt('other3t',       'Touran / Golf 5-6 / Другой VW',      '3Т', null),
        ])]
      } else {
        const m = { octavia_golf7: vag.kr, passat_b67: vag.bk, other3t: vag.tt3 }
        candidates = [m[ans.vagModel13] || vag.kr]
      }
    } else if (year >= 2009) {
      candidates = [vag.tt3, vag.bk]
      if (!ans.vagModel09) {
        questions = [ask('vagModel09', 'Модель:', [
          opt('passat_tiguan', 'Passat B6-B7, Tiguan 1 с 2011, CC, Sharan 2 (2010+)', 'БК', null),
          opt('golf56_octavia','Golf 5-6, Jetta, Octavia A5, Yeti, Touran',          '3Т', null),
        ])]
      } else {
        candidates = [ans.vagModel09 === 'passat_tiguan' ? vag.bk : vag.tt3]
      }
    } else if (year >= 2004) {
      // Переходная зона СК
      if (!ans.power) {
        questions = [ask('power', 'Тип усилителя:', [
          opt('gur', 'ГУР (гидравлика, ремень + шланги)', null, null),
          opt('eur', 'ЭУР (только электро, нет шлангов)', null, null),
        ])]
      } else if (ans.power === 'gur') {
        if (!ans.vagGurModel) {
          questions = [ask('vagGurModel', 'Уточните модель (ГУР):', [
            opt('golf4',   'Golf 4 / Bora / Octavia A4 Tour', 'G4',  null),
            opt('sharan1', 'Sharan 1 / Seat Alhambra 1 (до 2010)', 'Sh+', null),
          ])]
        } else {
          candidates = ans.vagGurModel === 'sharan1'
            ? [vag.sh]
            : (year >= 2003 ? [vag.g4] : [vag.g3])
        }
      } else {
        candidates = [vag.sk]
      }
    } else if (year >= 1997) {
      candidates = [vag.g4, vag.b5]
      if (!ans.vagOld) {
        questions = [ask('vagOld', 'Модель:', [
          opt('golf4',   'Golf 4, Bora, Octavia A4 Tour', 'G4',  null),
          opt('passat5', 'Passat B5, Audi A4 до 2005',    'В5',  null),
          opt('sharan1', 'Sharan 1 / Seat Alhambra 1',    'Sh+', null),
        ])]
      } else {
        const vagOldMap = { golf4: vag.g4, passat5: vag.b5, sharan1: vag.sh }
        candidates = [vagOldMap[ans.vagOld] || vag.g4]
      }
    } else {
      candidates = [vag.g3]
    }
  }

  // ── Audi ──────────────────────────────────────────────────────────
  else if (brand === 'Audi') {
    if (!ans.audiModel) {
      questions = [ask('audiModel', 'Модель Audi:', [
        opt('a4b5',  'A4 B5 до 2001 / A6 C5 до 2005',  null, null),
        opt('a4b6b7','A4 B6/B7 2000-2008 (ТОЛЬКО KOYO!)',null, null),
        opt('a4b8',  'A4 B8 / A5 / Q5 с 2007',         null, null),
        opt('a6c6',  'A6 C6 2004-2011',                 null, null),
        opt('q7',    'Q7 / Touareg',                    null, null),
        opt('a3',    'A3 / TT / Q3 I (ЭУР)',              null, null),
      ])]
    } else {
      if (ans.audiModel === 'a4b6b7') {
        if (!ans.b67sensor) {
          questions = [ask('b67sensor', 'Датчик угла поворота на A4 B6/B7:', [
            opt('yes', 'Есть датчик', 'B6/B7-D', null),
            opt('no',  'Без датчика', 'B6/B7',   null),
          ])]
        } else {
          const code  = ans.b67sensor === 'yes' ? 'B6/B7-D' : 'B6/B7'
          const label = `${code} — Audi A4 B6/B7 (ТОЛЬКО KOYO, ZF нет!)`
          candidates = [{ code, label }]
        }
      } else {
        const aMap = {
          a4b5:   { code: 'В5',   label: 'В5 — Passat B5/Audi A4 B5' },
          a4b8:   { code: 'A4B8', label: 'A4B8 — Audi A4 B8 / A5 / Q5' },
          a6c6:   { code: 'А6С6', label: 'А6С6 — Audi A6 C6' },
          q7:     { code: 'Q7',   label: 'Q7 — Audi Q7 / VW Touareg / VW Amarok' },
          a3:     year < 2009
            ? { code: 'СК', label: 'СК — Audi A3 (ЭУР 2-я ген)' }
            : { code: '3Т', label: '3Т — Audi A3 (ЭУР 3-я ген)' },
        }
        candidates = [aMap[ans.audiModel]].filter(Boolean)
      }
    }
  }

  // ── BMW ───────────────────────────────────────────────────────────
  else if (brand === 'BMW' || brand === 'BMW M') {
    if (!ans.bmwModel) {
      questions = [ask('bmwModel', 'Серия/кузов BMW:', [
        opt('e46',   'E46 / E36 (задний привод, 1997-2006)',   null, null),
        opt('e90',   'E90/91/92/93 / E81/87/88 / X1 E84 / X3 E83', null, null),
        opt('e60',   'E60/E61 — 5-я серия',                    null, null),
        opt('f_ser', 'F-серия: 3 F30, 1 F20/F21, 5 F10',      null, null),
      ])]
    } else if (ans.bmwModel === 'e46') {
      if (!ans.e46Drive) {
        questions = [ask('e46Drive', 'Привод E46:', [
          opt('rwd', 'Задний привод', null, null),
          opt('4wd', 'Полный привод', null, null),
        ])]
      } else if (ans.e46Drive === '4wd') {
        candidates = [bmw.e464]
      } else if (!ans.e46Label) {
        questions = [ask('e46Label', 'Цвет шильдика на рейке (если знаете):', [
          opt('grey',   'Серый/синий/чёрный (ZF)',   'Е46+', '3.5 оборота руля'),
          opt('yellow', 'Жёлтый/фиолетовый (TRW)',   'Е46-', '3 оборота руля'),
          opt('dunno',  'Не знаю — покажи оба',       null,   null),
        ])]
      } else if (ans.e46Label === 'grey')   candidates = [bmw.e46p]
      else if  (ans.e46Label === 'yellow')  candidates = [bmw.e46m]
      else                                  candidates = [bmw.e46p, bmw.e46m]
    } else if (ans.bmwModel === 'e90') {
      if (!ans.e90Type) {
        questions = [ask('e90Type', 'Тип усилителя E90:', [
          opt('gur', 'Гидравлика ГУР',                    'E90',       null),
          opt('eur', 'Электро ЭУР',                       'E90 ЭУР',   '⚠ Дроп 49 000 ₽'),
          opt('4wd', 'Полный привод (X3 E83 / X1 xDrive)', 'E90+D 4x4', null),
        ])]
      } else if (ans.e90Type === 'gur') {
        candidates = [bmw.e90]
      } else if (ans.e90Type === 'eur') {
        candidates = [bmw.e90e]
      } else if (ans.e90Type === '4wd') {
        if (!ans.e904model) {
          questions = [ask('e904model', 'Модель 4WD:', [
            opt('x3e83', 'BMW X3 E83',                        null,          null),
            opt('x1e84', 'BMW X1 E84 / другой E90 xDrive',   'E90+D 4x4',   null),
          ])]
        } else if (ans.e904model === 'x1e84') {
          candidates = [{ code: 'E90+D 4x4', label: 'E90+D 4x4 — BMW X1 E84 xDrive / E90 4WD с датчиком' }]
        } else if (!ans.e83sensor) {
          questions = [ask('e83sensor', 'X3 E83 — датчик сервотроника:', [
            opt('yes', 'Есть датчик (сервотроник)',   'X3 E83+D', null),
            opt('no',  'Без датчика',                  'X3 E83-D', null),
          ])]
        } else {
          const code  = ans.e83sensor === 'yes' ? 'X3 E83+D' : 'X3 E83-D'
          const label = ans.e83sensor === 'yes'
            ? 'X3 E83+D — BMW X3 E83 полный привод с датчиком'
            : 'X3 E83-D — BMW X3 E83 полный привод без датчика'
          candidates = [{ code, label }]
        }
      }
    } else if (ans.bmwModel === 'e60') {
      candidates = [bmw.e60]
    } else if (ans.bmwModel === 'f_ser') {
      if (!ans.fModel) {
        questions = [ask('fModel', 'Кузов F-серия:', [
          opt('f20f21', '1-серия F20/F21 (маленький хэтч)', 'F20/F21', null),
          opt('f2030',  '3 F30 / 1 F20 задний привод',       'F20/F30', null),
          opt('f10',    '5-я серия F10 задний привод',        'F10',     null),
        ])]
      } else {
        const fm = { f20f21: bmw.f2021, f2030: bmw.f2030, f10: bmw.f10 }
        candidates = [fm[ans.fModel] || bmw.f2030]
      }
    }
  }

  // ── Mercedes ─────────────────────────────────────────────────────
  else if (brand === 'Mercedes') {
    if (!ans.mercModel) {
      questions = [ask('mercModel', 'Кузов Mercedes:', [
        opt('w168', 'A-класс W168 (1997-2004)',         'W168', null),
        opt('w169', 'A W169 / B W245 (2004-2012) ЭУР',  'W169', null),
        opt('w246', 'B-класс W246 (2011-2018)',          'W246', null),
        opt('w203', 'C-класс W203 (2000-2007)',          'W203', null),
        opt('w204', 'C-класс W204 (2007-2014)',          'W204', null),
        opt('w205', 'C-класс W205 (2014-2022)',          'W205', null),
        opt('w210', 'E-класс W210 (1995-2002)',          'W210', null),
        opt('w211', 'E W211 / CLS W219 (2002-2009)',     'W211+D', null),
        opt('w212', 'E-класс W212 (2009-2016)',          'W212', null),
        opt('w163', 'ML W163 (1997-2005)',               'W163', null),
        opt('w164', 'ML W164 / R W251 (2005-2012)',      'W164', null),
      ])]
    } else if (ans.mercModel === 'w203') {
      if (!ans.w203Drive) {
        questions = [ask('w203Drive', 'Привод W203:', [
          opt('rwd', 'Задний привод (обычный)', 'W203', null),
          opt('4wd', 'Полный 4Matic (Самира)',  null,   '⚠ Другая рейка, нет в каталоге'),
        ])]
      } else if (ans.w203Drive === '4wd') {
        candidates = [{ code: '⚠ нет', label: 'W203 4Matic (Самира) — рейка отличается, не подходит обычная W203' }]
      } else {
        if (!ans.w203Sensor) {
          questions = [ask('w203Sensor', 'Датчик угла поворота на W203:', [
            opt('yes', 'Есть датчик', 'W203-D', 'Рейка с датчиком, дороже'),
            opt('no',  'Без датчика', 'W203',   null),
          ])]
        } else {
          candidates = [ans.w203Sensor === 'yes' ? merc.w203d : merc.w203]
        }
      }
    } else if (ans.mercModel === 'w210') {
      if (!ans.w210Sensor) {
        questions = [ask('w210Sensor', 'Датчик угла поворота на W210:', [
          opt('yes', 'Есть датчик', 'W210+D', null),
          opt('no',  'Без датчика', 'W210',   null),
        ])]
      } else {
        candidates = [ans.w210Sensor === 'yes' ? merc.w210d : merc.w210]
      }
    } else if (ans.mercModel === 'w204') {
      if (!ans.w204Sensor) {
        questions = [ask('w204Sensor', 'Датчик угла поворота на W204:', [
          opt('yes', 'Есть датчик', 'W204+D', 'Рейка с датчиком, дороже'),
          opt('no',  'Без датчика', 'W204',   null),
        ])]
      } else {
        candidates = [ans.w204Sensor === 'yes' ? merc.w204d : merc.w204]
      }
    } else if (ans.mercModel === 'w212') {
      if (!ans.w212Drive) {
        questions = [ask('w212Drive', 'Привод W212:', [
          opt('rwd', 'Задний привод (обычный)', 'W212',     null),
          opt('4wd', 'Полный 4Matic',           'W212 4x4', '⚠ Под заказ 7-14 дней'),
        ])]
      } else {
        candidates = [ans.w212Drive === '4wd' ? merc.w212_4wd : merc.w212]
      }
    } else {
      const mMap = { w168: merc.w168, w169: merc.w169, w246: merc.w246, w205: merc.w205, w211: merc.w211, w163: merc.w163, w164: merc.w164 }
      candidates = [mMap[ans.mercModel]].filter(Boolean)
    }
  }

  // ── Volvo ─────────────────────────────────────────────────────────
  else if (brand === 'Volvo') {
    if (year < 2007) {
      if (!ans.volvoOldModel) {
        questions = [ask('volvoOldModel', 'Модель Volvo:', [
          opt('s40old',  'S40/V40 (до 2004)',           'Volvo S40', null),
          opt('s60xc90', 'S60/V70/XC90 (2000-2009)',   'V70',       null),
        ])]
      } else {
        candidates = [ans.volvoOldModel === 's40old' ? volvo.s40 : volvo.v70]
      }
    } else if (year <= 2016) {
      if (!ans.volvoType) {
        questions = [ask('volvoType', 'Модель Volvo:', [
          opt('xc70', 'S60/S80/V60/XC60/XC70 без подушки под мотор рейки', 'XC70', null),
          opt('v70',  'V70/XC90 — с подушкой/кронштейном под мотор',       'V70',  null),
        ])]
      } else {
        candidates = [ans.volvoType === 'v70' ? volvo.v70 : volvo.xc70]
      }
    } else {
      candidates = [volvo.v40]
    }
  }

  // ── Ford ─────────────────────────────────────────────────────────
  else if (brand === 'Ford') {
    if (!ans.fordModel) {
      questions = [ask('fordModel', 'Модель Ford:', [
        opt('focus1',  'Focus 1 (1998-2005) / Transit Connect до 2012', 'FF1', null),
        opt('focus2',  'Focus 2 гидро / C-Max до 2011 / Volvo V50',     'FFCM',null),
        opt('focus3e', 'Focus 3 ЭУР / Kuga 2 / C-Max 2012+ / Tourneo', 'FF3', null),
        opt('focus3g', 'Focus 3 гидро (2010-2015)',                      'FFCM',null),
        opt('fiesta',  'Fiesta / Fusion / Mazda 2',                      'FF',  null),
        opt('mondeo3', 'Mondeo 3 (2000-2007)',                           'FM3', null),
        opt('mondeo4', 'Mondeo 4 / S-Max / Galaxy',                     'FM4', null),
      ])]
    } else {
      const fm = { focus1:'FF1', focus2:'FFCM', focus3e:'FF3', focus3g:'FFCM', fiesta:'FF', mondeo3:'FM3', mondeo4:'FM4' }
      const code = fm[ans.fordModel]
      const labels = { FF1:'FF1', FFCM:'FFCM', FF3:'FF3 ЭУР', FF:'FF', FM3:'FM3', FM4:'FM4' }
      candidates = [{ code, label: `${code} — ${labels[code]}` }]
    }
  }

  // ── Peugeot ───────────────────────────────────────────────────────
  else if (brand === 'Peugeot') {
    if (!ans.peuModel) {
      questions = [ask('peuModel', 'Модель Peugeot:', [
        opt('307308',  '307/308/Partner/408 (до 2015)',      null, null),
        opt('p207',    '207 / C3 Picasso ЭУР',              '207',  null),
        opt('p406',    '406 (1995-2004)',                    '406',  null),
        opt('p407',    '407 (2004-2011)',                    '407',  null),
        opt('p607',    '607',                                '607',  null),
        opt('p508',    '508',                                '508',  null),
      ])]
    } else if (ans.peuModel === '307308') {
      if (!ans.fr3esp) {
        questions = [ask('fr3esp', 'Есть ли у машины система ESP?', [
          opt('yes', 'Да, ESP есть (кнопка или значок на панели)', 'FR3-', 'меньше 3 оборотов руля'),
          opt('no',  'ESP нет',                                    'FR3+', 'больше 3 оборотов'),
          opt('dunno','Не знаю — покажи оба варианта',             null,   null),
        ])]
      } else {
        const code = ans.fr3esp === 'yes' ? 'FR3-' : (ans.fr3esp === 'no' ? 'FR3+' : null)
        candidates = code ? [french[code === 'FR3-' ? 'fr3m' : 'fr3p']] : [french.fr3m, french.fr3p]
      }
    } else if (ans.peuModel === 'p407') {
      if (!ans.p407sensor) {
        questions = [ask('p407sensor', 'Датчик угла поворота на 407:', [
          opt('yes', 'Есть датчик', '407-D', null),
          opt('no',  'Без датчика', '407',   null),
        ])]
      } else {
        candidates = [ans.p407sensor === 'yes' ? french.p407d : french.p407]
      }
    } else {
      const pm = { p207: french.p207, p406: french.p406, p607: french.p607, p508: french.p508 }
      candidates = [pm[ans.peuModel]].filter(Boolean)
    }
  }

  // ── Citroën ──────────────────────────────────────────────────────
  else if (brand === 'Citroën') {
    if (!ans.citModel) {
      questions = [ask('citModel', 'Модель Citroën:', [
        opt('c4',  'C4 / Berlingo / Partner (до 2015)',  null, null),
        opt('xsp', 'Xsara Picasso / Berlingo M59',       'XSP', null),
        opt('c2c3g','C2/C3 гидравлика',                  'C2/C3', null),
        opt('c3e', 'C3 ЭУР (2009+)',                     'C3',  null),
        opt('c3pic','C3 Picasso ЭУР',                    '207', null),
        opt('c5',  'C5 до 2008',                         'С5',  null),
        opt('c5x7','C5 2008-2016 (X7)',                  'С5 X7', null),
      ])]
    } else if (ans.citModel === 'c4') {
      if (!ans.fr3esp) {
        questions = [ask('fr3esp', 'Есть ли у машины система ESP?', [
          opt('yes','Да, ESP есть', 'FR3-', null),
          opt('no', 'Нет ESP',      'FR3+', null),
        ])]
      } else {
        candidates = [ans.fr3esp === 'yes' ? french.fr3m : french.fr3p]
      }
    } else {
      const cm = { xsp:'XSP', c2c3g:'C2/C3', c3e:'C3', c3pic:'207', c5:'С5', c5x7:'С5 X7' }
      const code = cm[ans.citModel]
      candidates = [{ code, label: `${code}` }]
    }
  }

  // ── Renault ──────────────────────────────────────────────────────
  else if (brand === 'Renault') {
    if (!ans.renModel) {
      questions = [ask('renModel', 'Модель Renault:', [
        opt('sc',  'Scenic 1 / Megane 1 (1996-2003)',   'SC',  null),
        opt('sc2', 'Scenic 2 / Megane 2 (2002-2009)',   'SC2/Meg2', null),
        opt('rl1', 'Laguna 1',                          'RL1', null),
        opt('rl2', 'Laguna 2 (2001-2007)',              'RL2', null),
        opt('rl3', 'Laguna 3 / Latitude (2008-2015)',   'RL3', null),
        opt('lg1', 'Logan 1 / Sandero 1 до 2014',       'LG1', null),
        opt('lg2', 'Logan 2 / Sandero 2 с 2014',        'LG2', null),
        opt('trafic','Trafic / Opel Vivaro',            'Trafic', null),
        opt('master','Master 3 с 2010',                 'Master 3', null),
      ])]
    } else {
      const rm = { sc: french.sc, sc2: french.sc2, rl1: french.rl1, rl2: french.rl2, rl3: french.rl3, lg1: french.lg1, lg2: french.lg2 }
      const r = rm[ans.renModel]
      candidates = r ? [r] : [{ code: ans.renModel === 'trafic' ? 'Trafic' : 'Master 3', label: '' }]
    }
  }

  // ── Opel ─────────────────────────────────────────────────────────
  else if (brand === 'Opel') {
    if (!ans.opelModel) {
      questions = [ask('opelModel', 'Модель Opel:', [
        opt('astrag', 'Astra G/H / Zafira A/B до 2010', null, null),
        opt('vectrac','Vectra C (2002-2008)',            'OVC', null),
        opt('vectrab','Vectra B (1995-2002)',            'OVB', null),
        opt('astraj', 'Astra J / Insignia (ЭУР, нужна адаптация)', 'OAJ', null),
      ])]
    } else if (ans.opelModel === 'astrag') {
      if (!ans.opelPump) {
        questions = [ask('opelPump', 'Тип насоса ГУР (смотреть под капот):', [
          opt('zf',  'Белый бачок → ZF → под планку (пл.)',   'OA/OZ пл.', null),
          opt('trw', 'Зелёный бачок → TRW → под штуцера',     'OA/OZ шт.', null),
        ])]
      } else {
        candidates = [{ code: ans.opelPump === 'zf' ? 'OA/OZ пл.' : 'OA/OZ шт.', label: `Opel Astra/Zafira` }]
      }
    } else {
      const om = { vectrac: opel.ovc, vectrab: opel.ovb, astraj: opel.oaj }
      candidates = [om[ans.opelModel]].filter(Boolean)
    }
  }

  // ── Mazda ─────────────────────────────────────────────────────────
  else if (brand === 'Mazda') {
    if (!ans.mazdaModel) {
      questions = [ask('mazdaModel', 'Модель Mazda:', [
        opt('m3bk', 'Mazda 3 BK (2002-2009)',     'M35', null),
        opt('m6gg', 'Mazda 6 GG (2002-2007) ГУР', 'M6 гидро', null),
        opt('cx7',  'Mazda CX-7',                 'CX7', null),
      ])]
    } else {
      const mm = { m3bk:'M35', m6gg:'M6 гидро', cx7:'CX7' }
      candidates = [{ code: mm[ans.mazdaModel] || 'M35', label: '' }]
    }
  }

  // ── Mitsubishi ──────────────────────────────────────────────────────
  else if (brand === 'Mitsubishi') {
    candidates = [{ code: 'Colt', label: 'Colt — Mitsubishi Colt (2004-2012)' }]
  }

  return { candidates, questions }
}
