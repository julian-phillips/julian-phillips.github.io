var renewables = ["geo", "hydro", "ocean", "solar", "wind"];

var nonrenewables = ["chemical", "combustion", "nuclear", "prod_other"];

var all = ["agri", "chemical", "combustion", "cons_error", "cons_other", "consumed", "electricity", "energy_ind", "exported", "geo", "household", "hydro", "imported", "lost", "lost_stored", "non_energy_ind", "nuclear", "ocean", "prod_error", "prod_other", "produced", "services", "solar", "stored", "tot_consumption", "tot_production", "transport", "wind"];

var consumption = ["agri", "cons_error", "cons_other", "consumed", "energy_ind", "exported", "household", "lost", "lost_stored", "non_energy_ind", "services", "stored", "tot_production", "transport"];

var production = ["chemical", "combustion", "geo", "hydro", "imported", "nuclear", "ocean", "prod_error", "prod_other", "produced", "solar", "tot_consumption", "wind"];

var exports = ["exported"];

var imports = ["imported"];

var import_export = ["exported", "imported"];

var descriptions = {
  "agri": "Electricity - Consumption in agriculture, forestry and fishing",
  "chem_auto_add": "From chemical heat -  Autoproducer",
  "chem_main_add": "From chemical heat -  Main activity",
  "comb_auto_add": "From combustible fuels -  Autoproducer",
  "comb_main_add": "From combustible fuels -  Main activity",
  "cons_other": "Electricity - Consumption not elsewhere specified (other)",
  "exported": "Electricity - exports",
  "geo": "Electricity - total geothermal production",
  "household": "Electricity - Consumption by households",
  "hydro": "Electricity - total hydro production",
  "imported": "Electricity - imports",
  "lost": "Electricity - Losses",
  "non_energy_ind": "Electricity - Consumption by manufacturing, construction and non-fuel industry",
  "nuclear": "Electricity - total nuclear production",
  "ocean": "Electricity - total tide, wave production",
  "other_auto_add": "From other sources -  Autoproducer",
  "other_main_add": "From other sources -  Main activity",
  "own_use_1": "Electricity - Own use by electricity, heat and CHP plants",
  "own_use_2": "Electricity - Energy industries own use",
  "population": "Population",
  "produced": "Electricity - Gross production",
  "services": "Electricity - Consumption by commercial and public services",
  "solar": "Electricity - total solar production",
  "stored": "Electricity - Own use by pump-storage plants",
  "transport": "Electricity - Consumption by transport",
  "wind": "Electricity - total wind production",
};

var regions = {
  "Africa": {
    "Eastern Africa": ["Burundi", "Comoros", "Djibouti", "Eritrea", "Ethiopia", "Kenya", "Madagascar", "Malawi", "Mauritius", "Mozambique", "Reunion", "Rwanda", "Seychelles", "Somalia", "Tanzania", "Uganda", "Zambia", "Zimbabwe"],
    "Middle Africa": ["Angola", "Cameroon", "Central African Republic", "Chad", "Congo", "Equatorial Guinea", "Gabon", "Sao Tome and Principe"],
    "Northern Africa": ["Algeria", "Egypt", "Libya", "Morocco", "Sudan", "Tunisia"],
    "Southern Africa": ["Botswana", "Lesotho", "Namibia", "South Africa", "Swaziland"],
    "Western Africa": ["Benin", "Burkina Faso", "Cabo Verde", "Cote dIvoire", "Gambia", "Ghana", "Guinea", "Guinea Bissau", "Liberia", "Mali", "Mauritania", "Niger", "Nigeria", "Senegal", "Sierra Leone", "St Helena", "Togo"],
  },
  "Americas": {
    "Caribbean": ["Anguilla", "Antigua and Barbuda", "Aruba", "Bahamas", "Barbados", "British Virgin Islands", "Cayman Islands", "Cuba", "Dominica", "Dominican Republic", "Grenada", "Guadeloupe", "Haiti", "Jamaica", "Martinique", "Montserrat", "Netherlands Antilles", "Puerto Rico", "St Kitts Nevis", "St Lucia", "St Vincent Grenadines", "Trinidad and Tobago", "Turks and Caicos Islands", "Virgin Islands"],
    "Central America": ["Belize", "Costa Rica", "El Salvador", "Guatemala", "Honduras", "Mexico", "Nicaragua", "Panama"],
    "Northern America": ["Bermuda", "Canada", "Greenland", "St Pierre Miquelon", "United States"],
    "South America": ["Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador", "Falkland Islands", "French Guiana", "Guyana", "Paraguay", "Peru", "Suriname", "Uruguay", "Venezuela"],
  },
  "Asia": {
    "Central Asia": ["Kazakhstan", "Kyrgyzstan", "Tajikistan", "Turkmenistan", "Uzbekistan"],
    "Eastern Asia": ["China", "China Hong Kong SAR", "China Macao SAR", "Japan", "Korea North", "Korea South", "Mongolia"],
    "South-Eastern Asia": ["Brunei Darussalam", "Cambodia", "Indonesia", "Lao", "Malaysia", "Myanmar", "Philippines", "Singapore", "Thailand", "Timor Leste", "Viet Nam"],
    "Southern Asia": ["Afghanistan", "Bangladesh", "Bhutan", "India", "Iran", "Maldives", "Nepal", "Pakistan", "Sri Lanka"],
    "Western Asia": ["Armenia", "Azerbaijan", "Bahrain", "Cyprus", "Georgia", "Iraq", "Israel", "Jordan", "Kuwait", "Lebanon", "Oman", "Qatar", "Saudi Arabia", "State of Palestine", "Syrian Arab Republic", "Turkey", "United Arab Emirates", "Yemen"],
  },
  "Europe": {
    "Eastern Europe": ["Belarus", "Bulgaria", "Czech Republic", "Hungary", "Poland", "Republic of Moldova", "Romania", "Russian Federation", "Slovakia", "Ukraine"],
    "Northern Europe": ["Denmark", "Estonia", "Faeroe Islands", "Finland", "Guernsey", "Iceland", "Ireland", "Isle of Man", "Jersey", "Latvia", "Lithuania", "Norway", "Sweden", "United Kingdom"],
    "Southern Europe": ["Albania", "Andorra", "Bosnia and Herzegovina", "Croatia", "Gibraltar", "Greece", "Italy", "Macedonia FYR", "Malta", "Montenegro", "Portugal", "Serbia", "Slovenia", "Spain"],
    "Western Europe": ["Austria", "Belgium", "France", "Germany", "Liechtenstein", "Luxembourg", "Netherlands", "Switzerland"],
  },
  "Oceania": {
    "Australia and New Zealand": ["Australia", "New Zealand"],
    "Melanesia": ["Fiji", "New Caledonia", "Papua New Guinea", "Solomon Islands", "Vanuatu"],
    "Micronesia": ["Guam", "Kiribati", "Marshall Islands", "Micronesia", "Nauru", "Northern Mariana Islands", "Palau"],
    "Polynesia": ["American Samoa", "Cook Islands", "French Polynesia", "Niue", "Samoa", "Tonga", "Tuvalu", "Wallis and Futuna Islands"],
  },
};

