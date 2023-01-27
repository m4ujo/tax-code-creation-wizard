sap.ui.define(["taco/controller/js/Constants", "taco/controller/js/Methods"], function (Constants, Methods) {
  "use strict";
  return {
    /**
     * Validate all fields on step 1
     * If value state is different to "Error": true, else: false
     * @function
     * @name fnValidStep1
     * @param {Object} oCountryKey
     * @param {Object} oTaxType
     * @returns {Boolean} Control variable
     */
    fnValidStep1: function (oCountryKey, oTaxType) {
      return (
        oCountryKey.getValueState() !== Constants.oValueState.Error &&
        oTaxType.getValueState() !== Constants.oValueState.Error
      ) ? true : false;
    },

    /**
     * Validate all fields on step 2
     * If value state is different to "Error": true, else: false
     * @function
     * @name fnValidStep2
     * @param {Object} oVatScenario
     * @returns {Boolean} Control variable
     */
    fnValidStep2: function (oVatScenario) {
      return (
        oVatScenario.getValueState() !== Constants.oValueState.Error
      ) ? true : false;
    },

    /**
     * Validate all fields on step 3
     * If value state is different to "Error": true, else: false
     * @function
     * @name fnValidStep3
     * @param {Array} aFields
     * @returns {Boolean} Control variable
     */
    fnValidStep3: function (...aFields) {
      aFields[0].setValue(Methods.fnRemoveSpaces(aFields[0].getValue()));

      if (
        aFields[0].getValueState() === Constants.oValueState.None &&
        aFields[1].getValueState() === Constants.oValueState.None &&
        aFields[1].getValue().length >= 4 &&
        aFields[1].getValue().length !== 0 &&
        aFields[2].getValueState() === Constants.oValueState.None &&
        aFields[3].getValueState() === Constants.oValueState.None &&
        aFields[4].getValueState() === Constants.oValueState.None &&
        aFields[0].getValue().length === 2
      ) {
        return true;
      }

      return false;
    },
  };
});
