sap.ui.define(["sap/ui/core/library"], function (coreLibrary) {
  "use strict";
  return {
    oValueState: coreLibrary.ValueState,

    _oDomain: "https://usalspgsa660.na.pg.com:8443",

    _rSpaces: /\s/g,

    _oUrlCodes: {
      getTaxCountry: "GET_TAX_COUNTRY_LIST",
      getTaxType: "GET_TAX_TYPES_LIST",
      getTaxScenarios: "GET_TAX_SCENARIOS",
      getTaxFieldstatus: "GET_TAX_FIELDSTATUS",
      getTaxJur: "GET_TAXJUR_LIST",
      getReportCountries: "GET_SAP_COUNTRY_LIST",
      getEuCodes: "GET_EUCODE_LIST",
      getTaxCodes: "GET_TAX_CODES_LIST",
      getTaxProcedures: "GET_TAX_PROCEDURE",
      checkTaxCode: "CHECK_TAX_CODE",
      postCreateTaxCode: "POST_CREATE_TAX_CODE",
    },
  };
});
