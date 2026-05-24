import { Context, Effect, Layer } from "effect";
import { count } from "drizzle-orm";
import type { DBType } from "./DB";
import { DatabaseError, makeEffectDrizzle } from "./DB";
import { glossaryTerms } from "./schema";

interface GlossarySeedEntry {
  id: string;
  char: string;
  pinyin: string;
  category: GlossarySeedCategory;
  fr: string[];
  frPrimary: string;
  refs?: Record<string, string>;
  note: string;
}

type GlossarySeedCategory =
  | "concept"
  | "meridian"
  | "point"
  | "pathology"
  | "technique"
  | "herb"
  | "proper";

const glossarySeedData: ReadonlyArray<GlossarySeedEntry> = [
  // --- Principes fondamentaux / cosmologie ---

  {
    id: 'dao',
    char: '道',
    pinyin: 'dào',
    category: 'concept',
    fr: ['Voie', 'principe ordonnateur', 'voie du Ciel'],
    frPrimary: 'Voie',
    refs: { Larre: 'voie', Unschuld: 'Way', Husson: 'voie / Dao' },
    note:
      'Principe processuel qui ordonne l’alternance yin/yang et les transformations. Ne pas hypostasier en entité métaphysique abstraite ; c’est la règle du vivant et du soin autant que la « voie » cosmologique.',
  },
  {
    id: 'yinyang',
    char: '陰陽',
    pinyin: 'yīn yáng',
    category: 'concept',
    fr: ['yin et yang'],
    frPrimary: 'yin et yang',
    refs: { Larre: 'yin / yang', Husson: 'yin et yang' },
    note:
      'Deux phases d’un même processus, jamais deux substances. Couple structurant de tout le système. Éviter toute assimilation à bien/mal ou à des forces métaphysiques séparées.',
  },
  {
    id: 'wuxing',
    char: '五行',
    pinyin: 'wǔ xíng',
    category: 'concept',
    fr: ['cinq mouvements', 'cinq phases'],
    frPrimary: 'cinq mouvements',
    refs: { Larre: 'cinq mouvements', Husson: 'cinq éléments' },
    note:
      'Mouvements ou phases de transformation (Bois, Feu, Terre, Métal, Eau). « Éléments » est trompeur car 行 désigne un processus et non une substance.',
  },
  {
    id: 'tiannian',
    char: '天年',
    pinyin: 'tiān nián',
    category: 'concept',
    fr: ['années du Ciel', 'longévité naturelle'],
    frPrimary: 'années du Ciel',
    note:
      'Durée de vie naturellement allouée par le Ciel, souvent estimée à cent ans dans le Su Wen. Le but de la médecine est de permettre l’accomplissement de cette longévité naturelle.',
  },
  {
    id: 'shushu',
    char: '術數',
    pinyin: 'shù shù',
    category: 'concept',
    fr: ['arts et nombres', 'techniques numériques'],
    frPrimary: 'arts et nombres',
    note:
      'Arts calendaires, numériques et divinatoires qui relient la pratique médicale aux cycles célestes (Wu Yun Liu Qi, etc.). Ne pas réduire à « mathématiques ».'
  },

  // --- Substances vitales ---

  {
    id: 'qi',
    char: '氣',
    pinyin: 'qì',
    category: 'concept',
    fr: ['souffle', 'qi'],
    frPrimary: 'souffle',
    refs: { Larre: 'souffles', Husson: 'énergie', 'Andrès': 'qi / souffle' },
    note:
      'Processus de mouvement et de transformation, non « énergie » au sens physique moderne. « Souffle » dans les textes cosmologiques ; conserver « qi » en clinique.',
  },
  {
    id: 'jing',
    char: '精',
    pinyin: 'jīng',
    category: 'concept',
    fr: ['essences', 'quintessence'],
    frPrimary: 'essences',
    refs: { Larre: 'les essences', Husson: 'essence vitale' },
    note:
      'Quintessence la plus précieuse de l’être, d’origine prénatale et postnatale, stockée par les reins. Ne pas réduire à « sperme », qui est seulement un aspect possible.',
  },
  {
    id: 'shen',
    char: '神',
    pinyin: 'shén',
    category: 'concept',
    fr: ['esprits', 'animation spirituelle'],
    frPrimary: 'esprits',
    refs: { Larre: 'les esprits', Husson: 'esprit' },
    note:
      'Pluralité d’animations (shen du Cœur, hun, po, yi, zhi…). Représentent la dimension la plus haute de la vitalité. À distinguer de 鬼 guǐ (esprits des morts).',
  },
  {
    id: 'xue',
    char: '血',
    pinyin: 'xuè',
    category: 'concept',
    fr: ['sang'],
    frPrimary: 'sang',
    note:
      'Substance yin issue du qi nourricier, gouvernée par le Cœur, stockée par le Foie, maintenue par la Rate. Ne pas confondre avec le sang anatomique occidental.',
  },
  {
    id: 'jinye',
    char: '津液',
    pinyin: 'jīn yè',
    category: 'concept',
    fr: ['liquides organiques'],
    frPrimary: 'liquides organiques',
    note:
      '津 : liquides clairs et mobiles ; 液 : liquides plus denses et nourrissants. Ensemble, ils assurent humidification et nutrition des tissus en lien étroit avec le sang.',
  },
  {
    id: 'yuanqi',
    char: '元氣',
    pinyin: 'yuán qì',
    category: 'concept',
    fr: ['souffle originel', 'souffle prénatal'],
    frPrimary: 'souffle originel',
    refs: { Rochat: 'souffle originel', Auteroche: 'qi originel' },
    note:
      'Souffle fondamental issu du jing des reins, enraciné au Ming Men. Met en mouvement toutes les fonctions. À distinguer du qi ancestral 宗氣 au thorax.',
  },
  {
    id: 'zongqi',
    char: '宗氣',
    pinyin: 'zōng qì',
    category: 'concept',
    fr: ['souffle ancestral', 'souffle thoracique'],
    frPrimary: 'souffle ancestral',
    refs: { Larre: 'souffle ancestral', Auteroche: 'qi ancestral' },
    note:
      'Résulte de la rencontre du qi de l’air et du qi des céréales, s’accumule au centre de la poitrine. Soutient respiration, voix et propulsion du sang.',
  },
  {
    id: 'guqi',
    char: '穀氣',
    pinyin: 'gǔ qì',
    category: 'concept',
    fr: ['souffle des céréales', 'qi alimentaire'],
    frPrimary: 'souffle des céréales',
    note:
      'Premier stade de transformation des aliments dans Estomac/Rate. Matière première des différents qi fonctionnels (ying, wei, zong…).',
  },
  {
    id: 'yingqi',
    char: '營氣',
    pinyin: 'yíng qì',
    category: 'concept',
    fr: ['souffle nourricier', 'souffle de reconstruction'],
    frPrimary: 'souffle nourricier',
    refs: { Rochat: 'reconstruction', Husson: 'énergie nutritive' },
    note:
      'Qi clair issu des aliments, circule dans les vaisseaux, se convertit en sang. Le caractère 營 implique l’idée d’organisation et d’entretien actif, pas seulement de « nutrition ».',
  },
  {
    id: 'weiqi',
    char: '衛氣',
    pinyin: 'wèi qì',
    category: 'concept',
    fr: ['souffle défensif'],
    frPrimary: 'souffle défensif',
    refs: { Rochat: 'wei qi', Husson: 'énergie défensive' },
    note:
      'Qi rapide et superficiel, circule hors des vaisseaux dans les plans de clivage (腠理). Contrôle pores et transpiration, première défense contre les facteurs externes.',
  },

  // --- Corps / structure fonctionnelle ---

  {
    id: 'xing',
    char: '形',
    pinyin: 'xíng',
    category: 'concept',
    fr: ['forme corporelle', 'forme'],
    frPrimary: 'forme corporelle',
    note:
      'Manifestation visible du corps, support de l’animation spirituelle (神). À penser en binôme avec shen plutôt que comme simple « anatomie ».',
  },
  {
    id: 'zangfu',
    char: '臟腑',
    pinyin: 'zàng fǔ',
    category: 'concept',
    fr: ['organes et entrailles'],
    frPrimary: 'organes et entrailles',
    refs: { Larre: 'organes-entrailles', OQLF: 'zang-fu' },
    note:
      '臟 (zang) : lieux de stockage yin ; 腑 (fu) : organes de passage yang. Désignent des ensembles fonctionnels, non les organes anatomiques occidentaux.',
  },
  {
    id: 'zangxiang',
    char: '藏象',
    pinyin: 'zàng xiàng',
    category: 'concept',
    fr: ['manifestations des organes', 'images des viscères'],
    frPrimary: 'manifestations des organes',
    note:
      'Principe selon lequel les organes internes se manifestent à l’extérieur (teint, yeux, ongles, pouls, psyché). Outil fondamental pour l’inférence diagnostique.',
  },
  {
    id: 'sanjiao',
    char: '三焦',
    pinyin: 'sān jiāo',
    category: 'concept',
    fr: ['Triple Réchauffeur', 'Trois Foyers'],
    frPrimary: 'Triple Réchauffeur',
    refs: { Larre: 'Triple Réchauffeur', Husson: 'Trois Foyers' },
    note:
      'Structure fonctionnelle sans forme anatomique unique. Réchauffe, distribue le yuan qi et gouverne la circulation des liquides dans trois foyers (supérieur, médian, inférieur).',
  },
  {
    id: 'mingmen',
    char: '命門',
    pinyin: 'mìng mén',
    category: 'concept',
    fr: ['Porte de la Vie', 'Porte du destin'],
    frPrimary: 'Porte de la Vie',
    refs: { Sionneau: 'Ming Men', Larre: 'Porte de la Vie' },
    note:
      'Racine du feu des Reins et du yuan qi, située entre les reins. Lieu de conservation du jing et des shen. À distinguer du point DM-4, bien que liés.',
  },
  {
    id: 'couli',
    char: '腠理',
    pinyin: 'còu lǐ',
    category: 'concept',
    fr: ['plans de clivage', 'interstices des chairs'],
    frPrimary: 'plans de clivage',
    note:
      'Réseau d’interstices cutanés et musculaires où circule le wei qi. Première interface avec les facteurs climatiques (vent, froid, etc.).',
  },
  {
    id: 'hun',
    char: '魂',
    pinyin: 'hún',
    category: 'concept',
    fr: ['âmes spirituelles', 'Hun'],
    frPrimary: 'âmes spirituelles',
    refs: { Rochat: 'Hun', Larre: 'âmes Hun' },
    note:
      'Aspect yang des esprits, lié au Foie. Gouverne rêve, projet, capacité de se projeter. Ne pas réduire à « âme rationnelle » occidentale.',
  },
  {
    id: 'po',
    char: '魄',
    pinyin: 'pò',
    category: 'concept',
    fr: ['âmes corporelles', 'Po'],
    frPrimary: 'âmes corporelles',
    refs: { Rochat: 'Po', Larre: 'âmes Po' },
    note:
      'Aspect yin, corporel, lié au Poumon. Gouverne réflexes, sensations, inscription du souffle dans la chair. Complément et contrepartie des Hun.',
  },

  // --- Méridiens / circulation ---

  {
    id: 'jingluo',
    char: '經絡',
    pinyin: 'jīng luò',
    category: 'meridian',
    fr: ['méridiens et collatéraux'],
    frPrimary: 'méridiens et collatéraux',
    refs: { Larre: 'méridiens et lo', Husson: 'méridiens' },
    note:
      '經 : axes principaux ; 絡 : réseau de ramifications. Support de la circulation du qi et du sang entre organes, surface et profondeur. Éviter « canaux » qui suggère une anatomie tubulaire.',
  },
  {
    id: 'mai',
    char: '脈',
    pinyin: 'mài',
    category: 'concept',
    fr: ['vaisseaux', 'pouls', 'pulsations'],
    frPrimary: 'vaisseaux',
    note:
      'Polysémique : réseau vasculaire (dans jingmai), pulsation perceptible (mai zhen), circulation globale. Ne pas réduire à « pouls » au sens strict.',
  },
  {
    id: 'qijingbamai',
    char: '奇經八脈',
    pinyin: 'qí jīng bā mài',
    category: 'meridian',
    fr: ['huit vaisseaux extraordinaires'],
    frPrimary: 'huit vaisseaux extraordinaires',
    note:
      'Vaisseaux « extraordinaires » car sans couplage biao-li et servant de réservoirs pour qi et sang des 12 méridiens principaux.',
  },
  {
    id: 'xuewei',
    char: '穴位',
    pinyin: 'xuéwèi',
    category: 'point',
    fr: ['point (d’acupuncture)', 'cavité'],
    frPrimary: 'point (d’acupuncture)',
    note:
      'Locus de communication où le souffle affleure et peut être modulé. 穴 évoque la cavité plutôt qu’un point géométrique abstrait.',
  },

  // --- Physiologie des organes (zang) ---

  {
    id: 'xin',
    char: '心',
    pinyin: 'xīn',
    category: 'concept',
    fr: ['Cœur'],
    frPrimary: 'Cœur',
    note:
      'Souverain des organes. Gouverne le sang et les vaisseaux, abrite les shen. Inclut des fonctions psychiques (conscience, pensée) et non seulement le muscle cardiaque.',
  },
  {
    id: 'gan',
    char: '肝',
    pinyin: 'gān',
    category: 'concept',
    fr: ['Foie'],
    frPrimary: 'Foie',
    note:
      'Stocke le sang, assure la libre-circulation du qi, abrite les Hun. En lien avec tendons, yeux, ongles. À distinguer du foie anatomique et de ses seules fonctions biochimiques.',
  },
  {
    id: 'pi',
    char: '脾',
    pinyin: 'pí',
    category: 'concept',
    fr: ['Rate'],
    frPrimary: 'Rate',
    note:
      'Transforme et transporte les essences des aliments, maintient le sang dans les vaisseaux et élève le qi pur. Lien étroit avec muscles et rumination mentale (pensée, yi).',
  },
  {
    id: 'fei',
    char: '肺',
    pinyin: 'fèi',
    category: 'concept',
    fr: ['Poumon'],
    frPrimary: 'Poumon',
    note:
      '« Toit » des organes. Gouverne le qi et la respiration, diffuse et fait descendre le wei qi, abrite les Po. En rapport avec peau, poils et nez.',
  },
  {
    id: 'shen-organe',
    char: '腎',
    pinyin: 'shèn',
    category: 'concept',
    fr: ['Reins'],
    frPrimary: 'Reins',
    note:
      'Stockent les essences (jing), racine du yin et du yang de tout le corps, gouvernent croissance, reproduction, os, moelle, oreilles. Abritent la volonté (zhi).',
  },

  // --- Pathologie / étiologie ---

  {
    id: 'zhengqi',
    char: '正氣',
    pinyin: 'zhèng qì',
    category: 'concept',
    fr: ['souffle juste', 'souffle correct'],
    frPrimary: 'souffle juste',
    note:
      'Ensemble des qi physiologiques qui maintiennent l’intégrité du corps. Sa vigueur détermine la capacité à résister aux souffles pervers.',
  },
  {
    id: 'xieqi',
    char: '邪氣',
    pinyin: 'xié qì',
    category: 'pathology',
    fr: ['souffle pervers', 'facteur pathogène'],
    frPrimary: 'souffle pervers',
    note:
      'Toute influence qui dévie la circulation correcte : climats en excès, émotions intenses, alimentation, etc. Opposé à 正氣, sans dimension morale.',
  },
  {
    id: 'liuyin',
    char: '六淫',
    pinyin: 'liù yín',
    category: 'pathology',
    fr: ['six excès climatiques'],
    frPrimary: 'six excès climatiques',
    note:
      'Vent, froid, chaleur estivale, humidité, sécheresse, feu/chaleur. Climat normal devenu pathogène par excès, décalage saisonnier ou faiblesse du souffle juste.',
  },
  {
    id: 'feng',
    char: '風',
    pinyin: 'fēng',
    category: 'pathology',
    fr: ['vent'],
    frPrimary: 'vent',
    note:
      'Chef des maux externes. Mobile, changeant, souvent associé à froid ou chaleur. Pénètre par la nuque et les points « vent ». À distinguer du vent interne lié au Foie.',
  },
  {
    id: 'han',
    char: '寒',
    pinyin: 'hán',
    category: 'pathology',
    fr: ['froid'],
    frPrimary: 'froid',
    note:
      'Facteur yin qui contracte et ralentit la circulation. Central dans le Shang Han Lun. Peut être externe (attaque par le froid) ou interne (vide de yang).',
  },
  {
    id: 'shanghan',
    char: '傷寒',
    pinyin: 'shāng hán',
    category: 'pathology',
    fr: ['attaque par le froid', 'atteinte par le froid'],
    frPrimary: 'attaque par le froid',
    note:
      'Au sens strict : agression par le froid. Au sens large (titre du traité) : ensemble des maladies dues à des facteurs externes évoluant selon les six couches.',
  },
  {
    id: 'qiqing',
    char: '七情',
    pinyin: 'qī qíng',
    category: 'pathology',
    fr: ['sept émotions'],
    frPrimary: 'sept émotions',
    note:
      'Joie, colère, inquiétude, pensée, tristesse, peur, effroi. Causes internes de maladie lorsqu’elles sont excessives, prolongées ou réprimées.',
  },
  {
    id: 'xu',
    char: '虛',
    pinyin: 'xū',
    category: 'pathology',
    fr: ['vide', 'déficience'],
    frPrimary: 'vide',
    note:
      'Manque de qi, de sang, de yin ou de yang. S’oppose à 實 (plénitude). Un des axes majeurs du diagnostic (Ba Gang).',
  },
  {
    id: 'shi',
    char: '實',
    pinyin: 'shí',
    category: 'pathology',
    fr: ['plénitude', 'excès'],
    frPrimary: 'plénitude',
    note:
      'Excès de substance ou de facteur pathogène. Appelle en principe des méthodes de dispersion (xie), en contraste avec le vide qui appelle des méthodes de tonification.',
  },
  {
    id: 'biaoli',
    char: '表/裏',
    pinyin: 'biǎo / lǐ',
    category: 'pathology',
    fr: ['surface / intérieur'],
    frPrimary: 'surface / intérieur',
    note:
      'Couple diagnostique décrivant la localisation d’un processus pathologique : couches superficielles (peau, collatéraux) vs profondeur (zang-fu).',
  },

  // --- Diagnostic ---

  {
    id: 'bagang',
    char: '八綱',
    pinyin: 'bā gāng',
    category: 'technique',
    fr: ['huit principes (diagnostiques)'],
    frPrimary: 'huit principes (diagnostiques)',
    note:
      'Quatre couples : yin/yang, surface/intérieur, froid/chaleur, vide/plénitude. Première grille de lecture du syndrome avant d’entrer dans les détails viscéraux.',
  },
  {
    id: 'bianzhenglunzhi',
    char: '辨證論治',
    pinyin: 'biàn zhèng lùn zhì',
    category: 'technique',
    fr: ['diagnostic différentiel des syndromes et traitement'],
    frPrimary: 'diagnostic différentiel des syndromes et traitement',
    note:
      'Méthode centrale : d’abord différencier le syndrome (zheng), puis élaborer la stratégie thérapeutique. La maladie (bing) seule est insuffisante pour guider le traitement.',
  },
  {
    id: 'sizhen',
    char: '四診',
    pinyin: 'sì zhēn',
    category: 'technique',
    fr: ['quatre examens'],
    frPrimary: 'quatre examens',
    note:
      'Observation, auscultation/olfaction, interrogatoire, palpation. Cadre classique de la collecte de signes et symptômes, notamment langue et pouls.',
  },
  {
    id: 'maizhen',
    char: '脈診',
    pinyin: 'mài zhěn',
    category: 'technique',
    fr: ['examen des pulsations', 'prise de pouls'],
    frPrimary: 'examen des pulsations',
    note:
      'Palpation des pouls radiaux (trois positions, trois niveaux) pour lire l’état du qi, du sang et des organes. Intègre la notion de « qi de l’Estomac » dans le pouls.',
  },

  // --- Techniques thérapeutiques ---

  {
    id: 'zhenjiu',
    char: '針灸',
    pinyin: 'zhēn jiǔ',
    category: 'technique',
    fr: ['acupuncture-moxibustion'],
    frPrimary: 'acupuncture-moxibustion',
    note:
      '針 : aiguille ; 灸 : moxibustion à base d’armoise. Les textes classiques les associent presque toujours ; éviter de réduire à l’aiguille seule.',
  },
  {
    id: 'daoyin',
    char: '導引',
    pinyin: 'dǎo yǐn',
    category: 'technique',
    fr: ['guidage et étirement', 'exercices de guidage'],
    frPrimary: 'guidage et étirement',
    note:
      'Ensemble d’exercices corporels visant à guider et étirer le qi par le mouvement. Ancêtre des pratiques de type qigong/taiji à visée thérapeutique.',
  },
  {
    id: 'tuna',
    char: '吐納',
    pinyin: 'tǔ nà',
    category: 'technique',
    fr: ['expirer et absorber', 'exercices respiratoires'],
    frPrimary: 'exercices respiratoires',
    note:
      'Travail respiratoire de rejet/absorption (ancien qi / nouveau qi). Souvent associé au daoyin dans les pratiques de nourrir la vie.',
  },
  {
    id: 'yangsheng',
    char: '養生',
    pinyin: 'yǎng shēng',
    category: 'technique',
    fr: ['nourrir la vie', 'entretien de la vie'],
    frPrimary: 'nourrir la vie',
    note:
      'Art de vivre qui vise à accomplir sa longévité naturelle : rythme de vie, alimentation, sexualité, exercice, régulation émotionnelle dans le sens du Dao.',
  },

  // --- Chronobiologie / cosmologie médicale ---

  {
    id: 'wuyunliuqi',
    char: '五運六氣',
    pinyin: 'wǔ yùn liù qì',
    category: 'concept',
    fr: ['cinq mouvements et six souffles'],
    frPrimary: 'cinq mouvements et six souffles',
    note:
      'Système de corrélation entre configurations célestes annuelles et semestrielles et tendances pathologiques. Sert à prévoir et prévenir certaines maladies.',
  },
  {
    id: 'sancai',
    char: '三才',
    pinyin: 'sān cái',
    category: 'concept',
    fr: ['trois puissances', 'Ciel-Homme-Terre'],
    frPrimary: 'Ciel-Homme-Terre',
    note:
      'Triade Ciel / Homme / Terre. L’être humain est médiateur et miroir des mouvements du Ciel et de la Terre, ce qui fonde la médecine comme cosmologie appliquée.',
  },

  // --- Shang Han Lun / couches ---

  {
    id: 'liujing',
    char: '六經',
    pinyin: 'liù jīng',
    category: 'concept',
    fr: ['six méridiens (couches)', 'six couches'],
    frPrimary: 'six méridiens (couches)',
    note:
      'Dans le Shang Han Lun, six « couches » d’évolution des maladies externes : Taiyang, Yangming, Shaoyang, Taiyin, Shaoyin, Jueyin. Ce ne sont pas les 12 méridiens anatomiques pris isolément.',
  },

  // --- Concepts auxiliaires ---

  {
    id: 'benbiao',
    char: '本 / 標',
    pinyin: 'běn / biāo',
    category: 'concept',
    fr: ['racine / manifestation'],
    frPrimary: 'racine / manifestation',
    note:
      '本 : cause profonde ; 標 : symptôme apparent. Règle de traitement : en aigu traiter plutôt le biao, en chronique traiter la racine, parfois les deux selon l’urgence.',
  },
  {
    id: 'qiji',
    char: '氣機',
    pinyin: 'qì jī',
    category: 'concept',
    fr: ['mécanique du souffle', 'mouvements du qi'],
    frPrimary: 'mécanique du souffle',
    note:
      'Désigne la dynamique des mouvements du qi (monter, descendre, entrer, sortir). Toute pathologie peut se lire comme une perturbation de cette mécanique.',
  },
  {
    id: 'qihua',
    char: '氣化',
    pinyin: 'qì huà',
    category: 'concept',
    fr: ['transformation par le souffle'],
    frPrimary: 'transformation par le souffle',
    note:
      'Processus par lequel le qi se transforme en sang, liquides, essences et inversement. Notion centrale pour comprendre métabolisme et fonctions des organes.',
  },
  {
    id: 'shenming',
    char: '神明',
    pinyin: 'shén míng',
    category: 'concept',
    fr: ['clarté des esprits'],
    frPrimary: 'clarté des esprits',
    note:
      'Éclat et lucidité de la présence. Résulte de l’abondance et de la bonne circulation des jing et des shen. Indicateur majeur de la qualité de vie.',
  },
  {
    id: 'jingshen',
    char: '精神',
    pinyin: 'jīng shén',
    category: 'concept',
    fr: ['essences et esprits'],
    frPrimary: 'essences et esprits',
    note:
      'Binôme qui désigne la vitalité globale. Ne pas confondre avec le sens moderne chinois (psychisme, mental) qui est un glissement ultérieur.',
  },
  {
    id: 'zhi',
    char: '志',
    pinyin: 'zhì',
    category: 'concept',
    fr: ['volonté', 'intention persistante'],
    frPrimary: 'volonté',
    note:
      'Aspect spirituel spécifique des reins : constance, capacité à tenir un projet dans la durée. Différent de la pensée (yi) et de la simple émotion.',
  },
  {
    id: 'yi',
    char: '意',
    pinyin: 'yì',
    category: 'concept',
    fr: ['intention', 'pensée réflexive'],
    frPrimary: 'intention',
    note:
      'Aspect spirituel de la Rate. Intention focalisée, capacité de réfléchir et de conceptualiser. À distinguer de 思 (rumination qui blesse la Rate).',
  },
  {
    id: 'weiqi-stomach',
    char: '胃氣',
    pinyin: 'wèi qì',
    category: 'concept',
    fr: ['souffle de l’Estomac'],
    frPrimary: 'souffle de l’Estomac',
    note:
      'Qualité de l’Estomac reflétée dans le pouls sous forme d’une douceur harmonieuse. Sa présence est un critère pronostique vital dans les textes classiques.',
  },
  {
    id: 'xianghuo',
    char: '相火',
    pinyin: 'xiàng huǒ',
    category: 'concept',
    fr: ['Feu-Ministre'],
    frPrimary: 'Feu-Ministre',
    note:
      'Feu yang enraciné au Ming Men, distinct du Feu-Souverain du Cœur. Réchauffe les fonctions et permet les transformations ; son excès ou sa faiblesse ont de nombreuses implications cliniques.',
  },
  {
    id: 'xiantianhoutian',
    char: '先天 / 後天',
    pinyin: 'xiān tiān / hòu tiān',
    category: 'concept',
    fr: ['Ciel antérieur / Ciel postérieur', 'prénatal / postnatal'],
    frPrimary: 'Ciel antérieur / Ciel postérieur',
    note:
      'Deux sources complémentaires de la vie : 先天 (héritage prénatal, jing des reins) et 後天 (ce qui est nourri par l’alimentation et la respiration via Rate/Estomac et Poumon).',
  },

  // --- Noms propres / textes ---

  {
    id: 'huangdi',
    char: '黃帝',
    pinyin: 'Huáng Dì',
    category: 'proper',
    fr: ['Empereur Jaune'],
    frPrimary: 'Empereur Jaune',
    note:
      'Souverain mythique et interlocuteur principal du Su Wen et du Ling Shu. Figure didactique plus qu’historique.',
  },
  {
    id: 'qibo',
    char: '岐伯',
    pinyin: 'Qí Bó',
    category: 'proper',
    fr: ['Qi Bo'],
    frPrimary: 'Qi Bo',
    note:
      'Sage-médecin qui répond aux questions de Huang Di dans le Nei Jing. Porte la voix de la tradition médicale.',
  },
  {
    id: 'zhangzhongjing',
    char: '張仲景',
    pinyin: 'Zhāng Zhòng Jǐng',
    category: 'proper',
    fr: ['Zhang Zhongjing'],
    frPrimary: 'Zhang Zhongjing',
    note:
      'Auteur du Shang Han Lun, souvent appelé « saint de la médecine ». Référence pour le diagnostic différentiel et les formules classiques.',
  },
  {
    id: 'suwen',
    char: '素問',
    pinyin: 'Sù Wèn',
    category: 'proper',
    fr: ['Su Wen', 'Questions simples'],
    frPrimary: 'Su Wen',
    note:
      'Première partie du Huangdi Neijing. Traite des principes théoriques, cosmologie, physiologie, pathologie et bases du diagnostic et du traitement.',
  },
  {
    id: 'lingshu',
    char: '靈樞',
    pinyin: 'Líng Shū',
    category: 'proper',
    fr: ['Ling Shu', 'Axe spirituel'],
    frPrimary: 'Ling Shu',
    note:
      'Deuxième partie du Huangdi Neijing. Centrée sur les méridiens, les points et les techniques d’aiguille. Texte de base pour l’acupuncture classique.',
  },
  {
    id: 'nanjing',
    char: '難經',
    pinyin: 'Nán Jīng',
    category: 'proper',
    fr: ['Nan Jing', 'Classique des difficultés'],
    frPrimary: 'Nan Jing',
    note:
      'Classique des 81 difficultés. Reprend et clarifie des points obscurs du Nei Jing : yuan qi, Ming Men, San Jiao, qi extraordinaires, etc.',
  },
  {
    id: 'shanghanlun',
    char: '傷寒論',
    pinyin: 'Shāng Hán Lùn',
    category: 'proper',
    fr: ['Shang Han Lun', 'Traité des lésions du froid'],
    frPrimary: 'Shang Han Lun',
    note:
      'Traité clinique majeur attribué à Zhang Zhongjing. Modèle d’analyse des maladies externes par couches (liu jing) et de prescriptions classiques.',
  },
];

const GLOSSARY_SEED_BATCH_SIZE = 30;

const chunk = <T>(arr: ReadonlyArray<T>, size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, (i + 1) * size) as T[],
  );

export class Seed extends Context.Service<Seed, {
  seedGlossaryTerms: (drizzleClient: DBType) => Effect.Effect<void, DatabaseError>;
}>()("myapp/db/Seed") {
  static readonly layer = Layer.effect(
    Seed,
    Effect.gen(function* () {
      const seedGlossaryTerms = (drizzleClient: DBType) =>
				Effect.gen(function* () {
					const effectDb = makeEffectDrizzle(drizzleClient);

					const [{ value: glossaryCount }] = yield* effectDb.run((db) =>
						db.select({ value: count() }).from(glossaryTerms),
					);

					if (glossaryCount > 0) {
						return;
					}

          yield* Effect.forEach(
            chunk(glossarySeedData, GLOSSARY_SEED_BATCH_SIZE),
            (batch) =>
              effectDb.run((db) =>
                db
                  .insert(glossaryTerms)
                  .values(batch.map((term) => ({ ...term, isPreseeded: true })))
                  .onConflictDoNothing({ target: glossaryTerms.id }),
              ),
            { concurrency: 1 },
          );
        });

      return Seed.of({
        seedGlossaryTerms,
      });
    }),
  );
}
