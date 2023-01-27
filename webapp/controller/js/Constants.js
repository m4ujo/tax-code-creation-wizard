sap.ui.define(["sap/ui/core/library"], function (coreLibrary) {
  "use strict";
  return {
    /**
     * Value state object
     * @type { Object }
     */
    oValueState: coreLibrary.ValueState,

    /**
     * Domain of API server
     * @type { String }
     * @private
     */
    _sDomain: "https://usalspgsa660.na.pg.com:8443",

    /**
     * Regex for white spaces
     * @type { RegExp }
     * @private
     */
    _rSpaces: /\s/g,

    /**
     * Request URL codes
     * @type { Object }
     * @private
     */
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
      validateReturnCountry: "VALIDATE_RETURN_COUNTRY",
      checkDeferredTaxInfo: "CHECK_DEFERRED_TAX_INFO",
    },
  };
});
