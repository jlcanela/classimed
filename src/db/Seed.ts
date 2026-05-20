import { Context, Effect, Layer } from "effect";
import { count } from "drizzle-orm";
import type { DBType } from "./DB";
import { DatabaseError, makeEffectDrizzle } from "./DB";
import { glossaryTerms } from "./schema";

interface GlossarySeedEntry {
  id: string;
  char: string;
  pinyin: string;
  category: string;
  fr: string[];
  frPrimary: string;
  refs?: Record<string, string>;
  note: string;
}

const glossarySeedData: ReadonlyArray<GlossarySeedEntry> = [
	{
		id: 'qi',
		char: '氣',
		pinyin: 'qì',
		category: 'concept',
		fr: ['souffle', 'qi'],
		frPrimary: 'souffle',
		refs: { Larre: 'souffles', Husson: 'énergie', 'Andrès': 'qi / souffle' },
		note: 'Concept central. « Souffle » dans les textes philosophiques (Larre), « qi » dans le contexte clinique. Éviter « énergie » qui suggère un cadre physique moderne.',
	},
	{
		id: 'yinyang',
		char: '陰陽',
		pinyin: 'yīn yáng',
		category: 'concept',
		fr: ['yin et yang'],
		frPrimary: 'yin et yang',
		refs: { Larre: 'yin / yang', Husson: 'yin et yang' },
		note: 'Conserver les termes chinois romanisés. Ne pas traduire par « ombre et lumière » qui réduit le couple à une métaphore.',
	},
	{
		id: 'wuxing',
		char: '五行',
		pinyin: 'wǔ xíng',
		category: 'concept',
		fr: ['cinq mouvements', 'cinq phases'],
		frPrimary: 'cinq mouvements',
		refs: { Larre: 'cinq mouvements', Husson: 'cinq éléments' },
		note: '« Cinq mouvements » (Larre, Rochat) plutôt que « éléments » — 行 implique un dynamisme processuel et non une substance.',
	},
	{
		id: 'shenming',
		char: '神',
		pinyin: 'shén',
		category: 'concept',
		fr: ['esprit', 'esprits'],
		frPrimary: 'esprits',
		refs: { Larre: 'les esprits', Husson: 'esprit' },
		note: 'Souvent au pluriel chez Larre. Désigne l\'animation vitale supérieure, à distinguer de 鬼 guǐ.',
	},
	{
		id: 'tiannian',
		char: '天年',
		pinyin: 'tiān nián',
		category: 'concept',
		fr: ['années du ciel', 'longévité naturelle'],
		frPrimary: 'années du ciel',
		note: 'La durée de vie naturellement allouée par le Ciel — souvent estimée à cent ans dans les textes.',
	},
	{
		id: 'shushu',
		char: '術數',
		pinyin: 'shù shù',
		category: 'concept',
		fr: ['arts et nombres', 'techniques numériques'],
		frPrimary: 'arts et nombres',
		note: 'Méthodes divinatoires, calendaires et de calcul liées au ciel. Pas simplement « mathématiques ».',
	},
	{
		id: 'xing',
		char: '形',
		pinyin: 'xíng',
		category: 'concept',
		fr: ['forme corporelle', 'forme'],
		frPrimary: 'forme corporelle',
		note: 'Le corps en tant que manifestation visible, à mettre en rapport avec 神 (les esprits) qui l\'animent.',
	},
	{
		id: 'jingluo',
		char: '經絡',
		pinyin: 'jīng luò',
		category: 'meridian',
		fr: ['méridiens et collatéraux'],
		frPrimary: 'méridiens et collatéraux',
		refs: { Larre: 'méridiens et lo', Husson: 'méridiens' },
		note: '經 méridiens principaux ; 絡 ramifications transversales (lo). À ne jamais traduire par « canaux ».',
	},
	{
		id: 'xue',
		char: '血',
		pinyin: 'xuè',
		category: 'concept',
		fr: ['sang'],
		frPrimary: 'sang',
		note: 'Substance yin couplée au qi. Ne pas confondre avec le sang anatomique occidental.',
	},
	{
		id: 'jinye',
		char: '津液',
		pinyin: 'jīn yè',
		category: 'concept',
		fr: ['liquides organiques'],
		frPrimary: 'liquides organiques',
		note: '津 (clairs et fluides) + 液 (plus denses et nourrissants).',
	},
	{
		id: 'jing',
		char: '精',
		pinyin: 'jīng',
		category: 'concept',
		fr: ['essences'],
		frPrimary: 'essences',
		refs: { Larre: 'les essences', Husson: 'essence' },
		note: 'Substance la plus subtile et la plus précieuse. Stockée par les reins.',
	},
	{
		id: 'huangdi',
		char: '黃帝',
		pinyin: 'Huáng Dì',
		category: 'proper',
		fr: ['Empereur Jaune'],
		frPrimary: 'Empereur Jaune',
		note: 'Souverain mythique, interlocuteur du Su Wen.',
	},
	{
		id: 'qibo',
		char: '岐伯',
		pinyin: 'Qí Bó',
		category: 'proper',
		fr: ['Qi Bo'],
		frPrimary: 'Qi Bo',
		note: 'Maître et interlocuteur de Huang Di dans le Nei Jing.',
	},
	{
		id: 'hegu',
		char: '合谷',
		pinyin: 'hé gǔ',
		category: 'point',
		fr: ['He Gu (4 GI)'],
		frPrimary: 'He Gu (4 GI)',
		note: 'Point yuan-source du méridien du Gros Intestin. Localisation : entre 1er et 2e métacarpiens.',
	},
	{
		id: 'zusanli',
		char: '足三里',
		pinyin: 'zú sān lǐ',
		category: 'point',
		fr: ['Zu San Li (36 E)'],
		frPrimary: 'Zu San Li (36 E)',
		note: 'Point he-mer du méridien de l\'Estomac. Tonifie le qi et le sang.',
	},
	{
		id: 'shanghan',
		char: '傷寒',
		pinyin: 'shāng hán',
		category: 'pathology',
		fr: ['attaque par le froid'],
		frPrimary: 'attaque par le froid',
		note: 'Au sens large : toute affection due à un facteur pathogène externe. Au sens étroit : attaque par le froid.',
	},
	{
		id: 'feng',
		char: '風',
		pinyin: 'fēng',
		category: 'pathology',
		fr: ['vent'],
		frPrimary: 'vent',
		note: 'Premier des six excès climatiques (六淫). Souvent vecteur d\'autres pathogènes.',
	},
	{
		id: 'zhenjiu',
		char: '針灸',
		pinyin: 'zhēn jiǔ',
		category: 'technique',
		fr: ['acupuncture-moxibustion'],
		frPrimary: 'acupuncture-moxibustion',
		note: '針 aiguilles + 灸 moxa. Toujours nommer les deux techniques.',
	},
];

export class Seed extends Context.Service<Seed, {
  seedGlossaryTerms: (drizzleClient: DBType) => Effect.Effect<void, DatabaseError>;
}>()("myapp/db/Seed") {
  static readonly layer = Layer.effect(
    Seed,
    Effect.gen(function* () {
      const seedGlossaryTerms = (drizzleClient: DBType) =>
				Effect.gen(function* () {
					const effectDb = makeEffectDrizzle(drizzleClient);

					const [{ value: glossaryCount }] = yield* effectDb.select((db) =>
						db.select({ value: count() }).from(glossaryTerms),
					);

					if (glossaryCount > 0) {
						return;
					}

					yield* effectDb.insert((db) =>
						db
							.insert(glossaryTerms)
							.values(
								glossarySeedData.map((term) => ({
									...term,
									isPreseeded: true,
								})),
							)
							.onConflictDoNothing({ target: glossaryTerms.id }),
					);
        });

      return Seed.of({
        seedGlossaryTerms,
      });
    }),
  );
}
