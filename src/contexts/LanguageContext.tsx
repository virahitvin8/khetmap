import { createContext, useContext, useState, ReactNode } from 'react';

export type SupportedLanguage = 'en' | 'te' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    te: string;
    hi: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.map': { en: 'Map', te: 'మ్యాప్', hi: 'नक्शा' },
  'nav.farms': { en: 'Farms', te: 'పొలాలు', hi: 'खेत' },
  'nav.analyze': { en: 'Analyze', te: 'విశ్లేషణ', hi: 'विश्लेषण' },
  'nav.profile': { en: 'Profile', te: 'ప్రొఫైల్', hi: 'प्रोफ़ाइल' },

  // Welcome page
  'welcome.title': { en: 'KhetMap', te: 'ఖేత్‌మ్యాప్', hi: 'खेतमैप' },
  'welcome.tagline': { en: 'See your land from space', te: 'మీ భూమిని అంతరిక్షం నుండి చూడండి', hi: 'अपनी ज़मीन को अंतरिक्ष से देखें' },
  'welcome.purpose': { en: 'KhetMap is a free, satellite-powered tool that lets farmers, researchers, and GIS professionals analyze agricultural fields from space — right from your browser.', te: 'ఖేత్‌మ్యాప్ ఒక ఉచిత ఉపగ్రహ-ఆధారిత సాధనం, ఇది రైతులు, పరిశోధకులు మరియు GIS నిపుణులు తమ వ్యవసాయ పొలాలను అంతరిక్షం నుండి విశ్లేషించడానికి వీలు కల్పిస్తుంది.', hi: 'खेतमैप एक मुफ्त उपग्रह-संचालित उपकरण है जो किसानों, शोधकर्ताओं और GIS पेशेवरों को अपने ब्राउज़र से खेतों का विश्लेषण करने देता है।' },
  'welcome.feature.crophealth': { en: 'Crop Health (NDVI) — Monitor vegetation vigor and detect stress', te: 'పంట ఆరోగ్యం (NDVI) — వృక్ష శక్తిని పర్యవేక్షించండి', hi: 'फसल स्वास्थ्य (NDVI) — वनस्पति की ताकत की निगरानी करें' },
  'welcome.feature.water': { en: 'Water Index (NDWI) — Identify waterlogged areas and moisture', te: 'నీటి సూచిక (NDWI) — నీటి నిల్వ ప్రాంతాలను గుర్తించండి', hi: 'जल सूचकांक (NDWI) — जल भराव वाले क्षेत्रों की पहचान करें' },
  'welcome.feature.soil': { en: 'Soil Health (SAVI) — Soil-adjusted vegetation analysis', te: 'నేల ఆరోగ్యం (SAVI) — నేల-సర్దుబాటు వృక్ష విశ్లేషణ', hi: 'मिट्टी स्वास्थ्य (SAVI) — मिट्टी-समायोजित वनस्पति विश्लेषण' },
  'welcome.feature.draw': { en: 'Draw & Save Fields — Mark boundaries, calculate areas', te: 'పొలాలు గీయండి & సేవ్ చేయండి — సరిహద్దులు గుర్తించండి', hi: 'खेत बनाएं और सहेजें — सीमाएं चिह्नित करें, क्षेत्रफल गणना करें' },
  'welcome.feature.pills': { en: '🛰️ Live Satellite · 🌿 Crop Health · 💧 Water Analysis · 🗺️ Draw Fields · 📊 Export Data', te: '🛰️ ప్రత్యక్ష ఉపగ్రహం · 🌿 పంట ఆరోగ్యం · 💧 నీటి విశ్లేషణ · 🗺️ పొలాలు గీయండి · 📊 డేటా ఎగుమతి', hi: '🛰️ लाइव सैटेलाइट · 🌿 फसल स्वास्थ्य · 💧 जल विश्लेषण · 🗺️ खेत बनाएं · 📊 डेटा निर्यात' },
  'welcome.getstarted': { en: 'Get Started', te: 'ప్రారంభించండి', hi: 'शुरू करें' },
  'welcome.free': { en: 'Free for everyone · Powered by open satellite data · No sign-up required', te: 'అందరికీ ఉచితం · ఓపెన్ శాటిలైట్ డేటా ద్వారా · సైన్-అప్ అవసరం లేదు', hi: 'सबके लिए मुफ्त · ओपन सैटेलाइट डेटा द्वारा संचालित · साइन-अप की आवश्यकता नहीं' },
  'welcome.offline': { en: 'Works offline with saved fields', te: 'సేవ్ చేసిన పొలాలతో ఆఫ్‌లైన్లో పనిచేస్తుంది', hi: 'सहेजे गए खेतों के साथ ऑफ़लाइन काम करता है' },

  // Map page
  'map.draw': { en: 'Draw Field', te: 'పొలం గీయండి', hi: 'खेत बनाएं' },
  'map.upload': { en: 'Upload KML', te: 'KML అప్‌లోడ్', hi: 'KML अपलोड' },
  'map.myfields': { en: 'My Fields', te: 'నా పొలాలు', hi: 'मेरे खेत' },
  'map.search': { en: 'Search location...', te: 'స్థానం శోధించండి...', hi: 'स्थान खोजें...' },
  'map.clicktoselect': { en: 'Click to select, then draw your field', te: 'ఎంచుకోవడానికి క్లిక్ చేయండి, తర్వాత పొలం గీయండి', hi: 'चुनने के लिए क्लिक करें, फिर खेत बनाएं' },
  'map.fieldsaved': { en: 'fields saved', te: 'పొలాలు సేవ్ చేయబడ్డాయి', hi: 'खेत सहेजे गए' },

  // Drawing
  'draw.start': { en: '🖱️ Click on map to start drawing', te: '🖱️ గీయడం ప్రారంభించడానికి మ్యాప్‌పై క్లిక్ చేయండి', hi: '🖱️ चित्र बनाना शुरू करने के लिए मानचित्र पर क्लिक करें' },
  'draw.vertices': { en: '📍 {count} vertices — double-click to close', te: '📍 {count} శీర్షాలు — మూసివేయడానికి డబుల్-క్లిక్ చేయండి', hi: '📍 {count} शीर्ष — बंद करने के लिए डबल-क्लिक करें' },
  'draw.finish': { en: '✓ Finish', te: '✓ పూర్తి', hi: '✓ समाप्त' },
  'draw.cancel': { en: '✕ Cancel', te: '✕ రద్దు', hi: '✕ रद्द' },

  // Save field modal
  'save.title': { en: 'Save Field', te: 'పొలాన్ని సేవ్ చేయండి', hi: 'खेत सहेजें' },
  'save.points': { en: '{count} points drawn', te: '{count} బిందువులు గీయబడ్డాయి', hi: '{count} बिंदु बनाए गए' },
  'save.area': { en: 'Area', te: 'విస్తీర్ణం', hi: 'क्षेत्रफल' },
  'save.center': { en: 'Center', te: 'కేంద్రం', hi: 'केंद्र' },
  'save.name': { en: 'Field Name', te: 'పొలం పేరు', hi: 'खेत का नाम' },
  'save.nameplaceholder': { en: 'e.g., North Paddy Field', te: 'ఉదా: ఉత్తర వరి పొలం', hi: 'जैसे, उत्तरी धान का खेत' },
  'save.croptype': { en: 'Crop Type', te: 'పంట రకం', hi: 'फसल का प्रकार' },
  'save.cancel': { en: 'Cancel', te: 'రద్దు', hi: 'रद्द' },
  'save.save': { en: 'Save Field', te: 'సేవ్ చేయండి', hi: 'सहेजें' },

  // Farms page
  'farms.title': { en: 'My Fields', te: 'నా పొలాలు', hi: 'मेरे खेत' },
  'farms.count': { en: '{count} fields', te: '{count} పొలాలు', hi: '{count} खेत' },
  'farms.empty': { en: 'No fields yet', te: 'ఇంకా పొలాలు లేవు', hi: 'अभी तक कोई खेत नहीं' },
  'farms.emptydesc': { en: 'Draw your field on the map or upload a KML/CSV file to get started', te: 'మ్యాప్‌పై పొలం గీయండి లేదా KML/CSV ఫైల్ అప్‌లోడ్ చేయండి', hi: 'मानचित्र पर अपना खेत बनाएं या KML/CSV फ़ाइल अपलोड करें' },
  'farms.add': { en: 'Add Your First Field', te: 'మొదటి పొలాన్ని జోడించండి', hi: 'अपना पहला खेत जोड़ें' },
  'farms.notset': { en: 'Not set', te: 'సెట్ చేయలేదు', hi: 'सेट नहीं है' },
  'farms.edit': { en: 'Edit', te: 'సవరించు', hi: 'संपादित करें' },
  'farms.delete': { en: 'Delete', te: 'తొలగించు', hi: 'हटाएं' },
  'farms.analyze': { en: 'Analyze', te: 'విశ్లేషించండి', hi: 'विश्लेषण करें' },
  'farms.locate': { en: 'Locate on Map', te: 'మ్యాప్‌లో గుర్తించండి', hi: 'मानचित्र पर ढूंढें' },
  'farms.export': { en: 'Export', te: 'ఎగుమతి', hi: 'निर्यात' },
  'farms.filter': { en: 'Filter by crop', te: 'పంట ద్వారా వడపోత', hi: 'फसल के अनुसार छाँटें' },
  'farms.all': { en: 'All', te: 'అన్నీ', hi: 'सभी' },
  'farms.sort': { en: 'Sort by', te: 'క్రమబద్ధీకరించు', hi: 'क्रमबद्ध करें' },
  'farms.sortnew': { en: 'Newest first', te: 'కొత్తవి ముందు', hi: 'नए पहले' },
  'farms.sortold': { en: 'Oldest first', te: 'పాతవి ముందు', hi: 'पुराने पहले' },
  'farms.sortaz': { en: 'A to Z', te: 'ఎ నుండి జెడ్', hi: 'A से Z' },
  'farms.deletedone': { en: 'Field deleted', te: 'పొలం తొలగించబడింది', hi: 'खेत हटा दिया गया' },

  // Analysis page
  'analysis.title': { en: 'Analysis', te: 'విశ్లేషణ', hi: 'विश्लेषण' },
  'analysis.subtitle': { en: 'Select a field and analysis type to get started', te: 'ప్రారంభించడానికి పొలం మరియు విశ్లేషణ రకాన్ని ఎంచుకోండి', hi: 'शुरू करने के लिए एक खेत और विश्लेषण प्रकार चुनें' },
  'analysis.quick': { en: 'Quick Actions', te: 'శీఘ్ర చర్యలు', hi: 'त्वरित कार्रवाइयाँ' },
  'analysis.all': { en: 'All Analyses', te: 'అన్ని విశ్లేషణలు', hi: 'सभी विश्लेषण' },
  'analysis.sources': { en: 'Satellite Sources', te: 'ఉపగ్రహ మూలాలు', hi: 'उपग्रह स्रोत' },
  'analysis.coming': { en: 'Advanced analysis (disease detection, yield estimation) coming soon', te: 'అధునాతన విశ్లేషణ (వ్యాధి నిర్ధారణ, దిగుబడి అంచనా) త్వరలో', hi: 'उन्नत विश्लेषण (रोग का पता लगाना, उपज अनुमान) जल्द आ रहा है' },

  // Profile page
  'profile.title': { en: 'Profile', te: 'ప్రొఫైల్', hi: 'प्रोफ़ाइल' },
  'profile.edit': { en: 'Edit Profile', te: 'ప్రొఫైల్ సవరించు', hi: 'प्रोफ़ाइल संपादित करें' },
  'profile.language': { en: 'Language', te: 'భాష', hi: 'भाषा' },
  'profile.notifications': { en: 'Notifications', te: 'నోటిఫికేషన్లు', hi: 'सूचनाएं' },
  'profile.offline': { en: 'Offline Maps', te: 'ఆఫ్‌లైన్ మ్యాప్స్', hi: 'ऑफ़लाइन मानचित्र' },
  'profile.cache': { en: 'Clear Cache', te: 'కాష్ క్లియర్ చేయి', hi: 'कैश साफ़ करें' },
  'profile.export': { en: 'Export My Data', te: 'నా డేటా ఎగుమతి', hi: 'मेरा डेटा निर्यात करें' },
  'profile.help': { en: 'Help & FAQ', te: 'సహాయం & FAQ', hi: 'सहायता & FAQ' },
  'profile.feedback': { en: 'Send Feedback', te: 'అభిప్రాయం పంపండి', hi: 'प्रतिक्रिया भेजें' },
  'profile.rate': { en: 'Rate the App', te: 'యాప్‌ను రేట్ చేయండి', hi: 'ऐप को रेट करें' },
  'profile.fields': { en: 'Fields', te: 'పొలాలు', hi: 'खेत' },
  'profile.analyses': { en: 'Analyses', te: 'విశ్లేషణలు', hi: 'विश्लेषण' },
  'profile.languages': { en: 'English · తెలుగు · हिंदी', te: 'English · తెలుగు · हिंदी', hi: 'English · తెలుగు · हिंदी' },
  'profile.choose': { en: 'Choose Language', te: 'భాషను ఎంచుకోండి', hi: 'भाषा चुनें' },

  // Farm detail
  'detail.area': { en: 'Area', te: 'విస్తీర్ణం', hi: 'क्षेत्रफल' },
  'detail.crop': { en: 'Crop Type', te: 'పంట రకం', hi: 'फसल का प्रकार' },
  'detail.created': { en: 'Created', te: 'సృష్టించిన తేదీ', hi: 'बनाया गया' },
  'detail.coordinates': { en: 'Coordinates', te: 'అక్షాంశాలు', hi: 'निर्देशांक' },
  'detail.analyses': { en: 'Analysis History', te: 'విశ్లేషణ చరిత్ర', hi: 'विश्लेषण इतिहास' },
  'detail.noanalyses': { en: 'No analyses yet. Run NDVI or NDWI from the map.', te: 'ఇంకా విశ్లేషణలు లేవు. మ్యాప్ నుండి NDVI లేదా NDWI అమలు చేయండి.', hi: 'अभी तक कोई विश्लेषण नहीं। मानचित्र से NDVI या NDWI चलाएं।' },
  'detail.notes': { en: 'Notes', te: 'గమనికలు', hi: 'नोट्स' },
  'detail.placeholder': { en: 'Add a note about this field...', te: 'ఈ పొలం గురించి గమనిక జోడించండి...', hi: 'इस खेत के बारे में नोट जोड़ें...' },
  'detail.savenote': { en: 'Save Note', te: 'గమనిక సేవ్ చేయండి', hi: 'नोट सहेजें' },
  'detail.exportgeo': { en: 'Export as GeoJSON', te: 'GeoJSONగా ఎగుమతి చేయండి', hi: 'GeoJSON के रूप में निर्यात करें' },
  'detail.exportkml': { en: 'Export as KML', te: 'KMLగా ఎగుమతి చేయండి', hi: 'KML के रूप में निर्यात करें' },
  'detail.exportcsv': { en: 'Export as CSV', te: 'CSVగా ఎగుమతి చేయండి', hi: 'CSV के रूप में निर्यात करें' },
  'detail.notesaved': { en: 'Note saved', te: 'గమనిక సేవ్ చేయబడింది', hi: 'नोट सहेजा गया' },
  'detail.exported': { en: 'Field exported', te: 'పొలం ఎగుమతి చేయబడింది', hi: 'खेत निर्यात किया गया' },

  // NDVI specific
  'ndvi.label': { en: 'NDVI', te: 'NDVI', hi: 'NDVI' },
  'ndvi.bare': { en: 'Bare', te: 'బేర్', hi: 'खाली' },
  'ndvi.sparse': { en: 'Sparse', te: 'తక్కువ', hi: 'कम' },
  'ndvi.dense': { en: 'Dense', te: 'దట్టమైన', hi: 'घना' },

  // NDWI specific
  'ndwi.label': { en: 'Water Index', te: 'నీటి సూచిక', hi: 'जल सूचकांक' },
  'ndwi.water': { en: 'Water', te: 'నీరు', hi: 'पानी' },
  'ndwi.moist': { en: 'Moist', te: 'తేమ', hi: 'नमी' },
  'ndwi.dry': { en: 'Dry', te: 'పొడి', hi: 'सूखा' },

  // Upload
  'upload.title': { en: 'Upload Field Data', te: 'పొలం డేటా అప్‌లోడ్', hi: 'खेत डेटा अपलोड' },
  'upload.kml': { en: 'KML / KMZ', te: 'KML / KMZ', hi: 'KML / KMZ' },
  'upload.csv': { en: 'CSV (lat, lon)', te: 'CSV (అక్షాంశం, రేఖాంశం)', hi: 'CSV (अक्षांश, देशांतर)' },
  'upload.geojson': { en: 'GeoJSON', te: 'GeoJSON', hi: 'GeoJSON' },
  'upload.drag': { en: 'Drag & drop your file here, or click to browse', te: 'మీ ఫైల్‌ను ఇక్కడ లాగండి & డ్రాప్ చేయండి, లేదా బ్రౌజ్ చేయడానికి క్లిక్ చేయండి', hi: 'अपनी फ़ाइल यहां खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें' },
  'upload.success': { en: 'File uploaded — {count} field(s) found', te: 'ఫైల్ అప్‌లోడ్ చేయబడింది — {count} పొలం(లు) కనుగొనబడ్డాయి', hi: 'फ़ाइल अपलोड — {count} खेत मिले' },
  'upload.error': { en: 'Failed to parse file. Supported formats: KML, KMZ, CSV, GeoJSON', te: 'ఫైల్ పార్స్ చేయడంలో విఫలమైంది. మద్దతు ఉన్న ఫార్మాట్లు: KML, KMZ, CSV, GeoJSON', hi: 'फ़ाइल पार्स करने में विफल। समर्थित प्रारूप: KML, KMZ, CSV, GeoJSON' },
  'upload.import': { en: 'Import Fields', te: 'పొలాలను దిగుమతి చేయండి', hi: 'खेत आयात करें' },

  // General / common
  'common.saving': { en: 'Saving...', te: 'సేవ్ చేస్తోంది...', hi: 'सहेजा जा रहा है...' },
  'common.loading': { en: 'Loading...', te: 'లోడ్ అవుతోంది...', hi: 'लोड हो रहा है...' },
  'common.error': { en: 'Error', te: 'లోపం', hi: 'त्रुटि' },
  'common.success': { en: 'Success', te: 'విజయం', hi: 'सफलता' },
  'common.on': { en: 'On', te: 'ఆన్', hi: 'चालू' },
  'common.off': { en: 'Off', te: 'ఆఫ్', hi: 'बंद' },

  // SAVI
  'savi.label': { en: 'SAVI (Soil)', te: 'SAVI (నేల)', hi: 'SAVI (मिट्टी)' },
  'savi.bare': { en: 'Bare Soil', te: 'బేర్ నేల', hi: 'खाली मिट्टी' },
  'savi.low': { en: 'Low', te: 'తక్కువ', hi: 'कम' },
  'savi.high': { en: 'High', te: 'ఎక్కువ', hi: 'उच्च' },
};

export interface LanguageContextType {
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('khetmap-lang');
    if (saved === 'te' || saved === 'hi') return saved;
    return 'en';
  });

  const t = (key: string, params?: Record<string, string | number>): string => {
    const entry = translations[key];
    if (!entry) return key;
    let text = entry[lang] || entry.en;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  const setLangWithSave = (newLang: SupportedLanguage) => {
    setLang(newLang);
    localStorage.setItem('khetmap-lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: setLangWithSave, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
export default LanguageContext;
