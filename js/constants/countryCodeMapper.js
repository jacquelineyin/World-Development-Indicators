class CountryCodeMapper {
    constructor() {
        this.countries = new Countries();

        this.AFGHANISTAN = 'AFG',
        this.ALBANIA = 'ALB',
        this.ALGERIA = 'DZA',
        this.AMERICAN_SAMOA = 'ASM',
        this.ANGOLA = 'AGO',
        this.ANTIGUA_AND_BARBUDA = 'ATG',
        this.ARGENTINA = 'ARG',
        this.ARMENIA = 'ARM',
        this.ARUBA = 'ABW',
        this.AUSTRALIA = 'AUS',
        this.AUSTRIA = 'AUT',
        this.AZERBAIJAN = 'AZE',
        this.BAHAMAS_THE = 'BHS',
        this.BAHRAIN = 'BHR',
        this.BANGLADESH = 'BGD',
        this.BARBADOS = 'BRB',
        this.BELARUS = 'BLR',
        this.BELGIUM = 'BEL',
        this.BELIZE = 'BLZ',
        this.BENIN = 'BEN',
        this.BERMUDA = 'BMU',
        this.BHUTAN = 'BTN',
        this.BOLIVIA = 'BOL',
        this.BOSNIA_AND_HERZEGOVINA = 'BIH',
        this.BOTSWANA = 'BWA',
        this.BRAZIL = 'BRA',
        this.BRUNEI_DARUSSALAM = 'BRN',
        this.BULGARIA = 'BGR',
        this.BURKINA_FASO = 'BFA',
        this.BURUNDI = 'BDI',
        this.CABO_VERDE = 'CPV',
        this.CAMBODIA = 'KHM',
        this.CAMEROON = 'CMR',
        this.CANADA = 'CAN',
        this.CAYMAN_ISLANDS = 'CYM',
        this.CENTRAL_AFRICAN_REPUBLIC = 'CAF',
        this.CHAD = 'TCD',
        this.CHILE = 'CHL',
        this.CHINA = 'CHN',
        this.COLOMBIA = 'COL',
        this.COMOROS = 'COM',
        this.CONGO_REP = 'COG',
        this.COSTA_RICA = 'CRI',
        this.COTE_D_IVOIRE = 'CIV',
        this.CROATIA = 'HRV',
        this.CUBA = 'CUB',
        this.CURACAO = 'CUW',
        this.CYPRUS = 'CYP',
        this.CZECH_REPUBLIC = 'CZE',
        this.DENMARK = 'DNK',
        this.DJIBOUTI = 'DJI',
        this.DOMINICA = 'DMA',
        this.DOMINICAN_REPUBLIC = 'DOM',
        this.ECUADOR = 'ECU',
        this.EGYPT = 'EGY',
        this.EL_SALVADOR = 'SLV',
        this.EQUATORIAL_GUINEA = 'GNQ',
        this.ERITREA = 'ERI',
        this.ESTONIA = 'EST',
        this.ETHIOPIA = 'ETH',
        this.FAEROE_ISLANDS = 'FRO',
        this.FIJI = 'FJI',
        this.FINLAND = 'FIN',
        this.FRANCE = 'FRA',
        this.FRENCH_POLYNESIA = 'PYF',
        this.GABON = 'GAB',
        this.GAMBIA_THE = 'GMB',
        this.GEORGIA = 'GEO',
        this.GERMANY = 'DEU',
        this.GHANA = 'GHA',
        this.GREECE = 'GRC',
        this.GREENLAND = 'GRL',
        this.GRENADA = 'GRD',
        this.GUAM = 'GUM',
        this.GUATEMALA = 'GTM',
        this.GUINEA = 'GIN',
        this.GUINEA_BISSAU = 'GNB',
        this.GUYANA = 'GUY',
        this.HAITI = 'HTI',
        this.HONDURAS = 'HND',
        this.HONG_KONG_SAR_CHINA = 'HKG',
        this.HUNGARY = 'HUN',
        this.ICELAND = 'ISL',
        this.INDIA = 'IND',
        this.INDONESIA = 'IDN',
        this.IRAN_ISLAMIC_REP = 'IRN',
        this.IRAQ = 'IRQ',
        this.IRELAND = 'IRL',
        this.ISRAEL = 'ISR',
        this.ITALY = 'ITA',
        this.JAMAICA = 'JAM',
        this.JAPAN = 'JPN',
        this.JORDAN = 'JOR',
        this.KAZAKHSTAN = 'KAZ',
        this.KENYA = 'KEN',
        this.KIRIBATI = 'KIR',
        this.KOREA_DEMOCRATIC_REPUBLIC_OF = 'PRK',
        this.KOREA_REPUBLIC_OF = 'KOR',
        this.KUWAIT = 'KWT',
        this.KYRGYZ_REPUBLIC = 'KGZ',
        this.LAO_PDR = 'LAO',
        this.LATVIA = 'LVA',
        this.LEBANON = 'LBN',
        this.LESOTHO = 'LSO',
        this.LIBERIA = 'LBR',
        this.LIBYA = 'LBY',
        this.LIECHTENSTEIN = 'LIE',
        this.LITHUANIA = 'LTU',
        this.LUXEMBOURG = 'LUX',
        this.MACAO_SAR_CHINA = 'MAC',
        this.MACEDONIA_FYR = 'MKD',
        this.MADAGASCAR = 'MDG',
        this.MALAWI = 'MWI',
        this.MALAYSIA = 'MYS',
        this.MALDIVES = 'MDV',
        this.MALI = 'MLI',
        this.MALTA = 'MLT',
        this.MARSHALL_ISLANDS = 'MHL',
        this.MAURITANIA = 'MRT',
        this.MAURITIUS = 'MUS',
        this.MEXICO = 'MEX',
        this.MICRONESIA_FED_STS = 'FSM',
        this.MOLDOVA = 'MDA',
        this.MONACO = 'MCO',
        this.MONGOLIA = 'MNG',
        this.MONTENEGRO = 'MNE',
        this.MOROCCO = 'MAR',
        this.MOZAMBIQUE = 'MOZ',
        this.MYANMAR = 'MMR',
        this.NAMIBIA = 'NAM',
        this.NEPAL = 'NPL',
        this.NETHERLANDS = 'NLD',
        this.NEW_CALEDONIA = 'NCL',
        this.NEW_ZEALAND = 'NZL',
        this.NICARAGUA = 'NIC',
        this.NIGER = 'NER',
        this.NIGERIA = 'NGA',
        this.NORTHERN_MARIANA_ISLANDS = 'MNP',
        this.NORWAY = 'NOR',
        this.OMAN = 'OMN',
        this.PAKISTAN = 'PAK',
        this.PALAU = 'PLW',
        this.PANAMA = 'PAN',
        this.PAPUA_NEW_GUINEA = 'PNG',
        this.PARAGUAY = 'PRY',
        this.PERU = 'PER',
        this.PHILIPPINES = 'PHL',
        this.POLAND = 'POL',
        this.PORTUGAL = 'PRT',
        this.PUERTO_RICO = 'PRI',
        this.QATAR = 'QAT',
        this.RUSSIAN_FEDERATION = 'RUS',
        this.RWANDA = 'RWA',
        this.SAMOA = 'WSM',
        this.SAN_MARINO = 'SMR',
        this.SAO_TOME_AND_PRINCIPE = 'STP',
        this.SAUDI_ARABIA = 'SAU',
        this.SENEGAL = 'SEN',
        this.SERBIA = 'SRB',
        this.SEYCHELLES = 'SYC',
        this.SIERRA_LEONE = 'SLE',
        this.SINGAPORE = 'SGP',
        this.SINT_MAARTEN = 'SXM',
        this.SLOVAK_REPUBLIC = 'SVK',
        this.SLOVENIA = 'SVN',
        this.SOLOMON_ISLANDS = 'SLB',
        this.SOMALIA = 'SOM',
        this.SOUTH_AFRICA = 'ZAF',
        this.SOUTH_SUDAN = 'SSD',
        this.SPAIN = 'ESP',
        this.SRI_LANKA = 'LKA',
        this.ST_KITTS_AND_NEVIS = 'KNA',
        this.ST_LUCIA = 'LCA',
        this.ST_MARTIN_ = 'MAF',
        this.ST_VINCENT_AND_THE_GRENADINES = 'VCT',
        this.SUDAN = 'SDN',
        this.SURINAME = 'SUR',
        this.SWAZILAND = 'SWZ',
        this.SWEDEN = 'SWE',
        this.SWITZERLAND = 'CHE',
        this.SYRIAN_ARAB_REPUBLIC = 'SYR',
        this.TAJIKISTAN = 'TJK',
        this.TANZANIA = 'TZA',
        this.THAILAND = 'THA',
        this.TOGO = 'TGO',
        this.TONGA = 'TON',
        this.TRINIDAD_AND_TOBAGO = 'TTO',
        this.TUNISIA = 'TUN',
        this.TURKEY = 'TUR',
        this.TURKMENISTAN = 'TKM',
        this.TURKS_AND_CAICOS_ISLANDS = 'TCA',
        this.TUVALU = 'TUV',
        this.UGANDA = 'UGA',
        this.UKRAINE = 'UKR',
        this.UNITED_ARAB_EMIRATES = 'ARE',
        this.UNITED_KINGDOM = 'GBR',
        this.UNITED_STATES = 'USA',
        this.URUGUAY = 'URY',
        this.UZBEKISTAN = 'UZB',
        this.VANUATU = 'VUT',
        this.VENEZUELA_RB = 'VEN',
        this.VIETNAM = 'VNM',
        this.VIRGIN_ISLANDS_US = 'VIR',
        this.WORLD = 'WLD',
        this.YEMEN_REPUBLIC_OF = 'YEM',
        this.ZAMBIA = 'ZMB',
        this.ZIMBABWE = 'ZWE'
    }

    /**
     * Purpose: Returns ISO_A3 code of a country given its country name
     * @param {string} country 
     * @returns {string}
     */
    getCountryCode(country) {
        const key = this.countries.getKey(country);
        return this[key];
    }

    /**
     * Purpose: Returns an array of ISO_A3 country codes in the order of the countries given
     * @param {Array} countries = Array of strings representing country names
     * @returns {Array} of strings
     */
    getCountryCodes(countries) {
        let codes = [];
        for (let country of countries) {
            let code = this.getCountryCode(country);
            codes.push(code);
        }
        return codes;
    }
    
}