sap.ui.define(["taco/controller/js/Constants", "taco/controller/js/Methods"], function (Constants, Methods) {
  "use strict";
  return {
    fnValidStep1: function (oCountryKey, oTaxType) {
      return (
        oCountryKey.getValueState() !== Constants.oValueState.Error &&
        oTaxType.getValueState() !== Constants.oValueState.Error
      ) ? true : false;
    },

    fnValidStep2: function (oVatScenario) {
      return (
        oVatScenario.getValueState() !== Constants.oValueState.Error
      ) ? true : false;
    },

    fnValidStep3: function (...oFields) {
      oFields[0].setValue(Methods.fnRemoveSpaces(oFields[0].getValue()));

      if (
        oFields[0].getValueState() === Constants.oValueState.None &&
        oFields[1].getValueState() === Constants.oValueState.None &&
        oFields[1].getValue().length >= 4 &&
        oFields[1].getValue().length !== 0 &&
        oFields[2].getValueState() === Constants.oValueState.None &&
        oFields[3].getValueState() === Constants.oValueState.None &&
        oFields[4].getValueState() === Constants.oValueState.None &&
        oFields[0].getValue().length === 2
      ) {
        return true;
      }

      return false;
    },
  };
});
