import localization_en from "./exported/localization_en.json"

const langs = {
  en: localization_en,
}

export type Lang = keyof typeof langs

export function getLocalization(lang: Lang = "en") {
  return langs[lang]
}

function hasTranslation<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y
): obj is X & Record<Y, string> {
  return obj.hasOwnProperty(prop)
}

export function t(key: string, lang: Lang = "en"): string {
  let localizationData = getLocalization(lang)
  if (hasTranslation(localizationData, key)) {
    return localizationData[key] || `<localization missing: ${key}>`
  }
  return `<localization missing: ${key}>`
}
