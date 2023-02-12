import localization_en from "./exported/localization_en.json";

const langs = {
	en: localization_en,
};

export function getLocalization(lang: keyof typeof langs = "en") {
	return langs[lang];
}
