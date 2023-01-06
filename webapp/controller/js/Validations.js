sap.ui.define(["taco/controller/js/Constants", "taco/controller/js/Methods"], function (Constants, Methods) {
  "use strict";
  return {
    fnValidStep1: function (oCountryKey, oTaxType) {
      let sCountryKey = Methods.fnRemoveSpaces(oCountryKey.getValue()),
        sTaxType = oTaxType.getSelectedKey();

      let oValidated = {
        bValidated: false,
        sUrl: "",
      };

      if (oCountryKey.getValueState() !== Constants.oValueState.Error && oTaxType.getValueState() !== Constants.oValueState.Error) {
        oValidated = {
          bValidated: true,
          sUrl: Methods.fnBuildUrl(Constants._oUrlCodes.getTaxScenarios, { type: "land1", value: sCountryKey }, { type: "mwart", value: sTaxType }),
        };
      }

      return oValidated;
    },

    fnValidStep2: function (oVatScenario, oCountryKey, oTaxType) {
      let sVatScenario = oVatScenario.getValue();

      let oValidated = {
        bValidated: false,
        sUrl: "",
      };

      if (oVatScenario.getValueState() !== Constants.oValueState.Error) {
        oValidated = {
          bValidated: true,
          sUrl: Methods.fnBuildUrl(
            Constants._oUrlCodes.getTaxFieldstatus,
            { type: "land1", value: oCountryKey.getValue() },
            { type: "mwart", value: oTaxType.getSelectedKey() },
            { type: "scen", value: sVatScenario }
          ),
        };
      }

      return oValidated;
    },

    fnCheckFieldStatus: function (oGlobal, oChkCheckId, aFieldStatusData) {
      aFieldStatusData.forEach((x) => {
        const field = oGlobal.byId(`field-${x.fieldname}`);

        if (field) {
          if (x.fieldname === "CHECKID" && x.default_value === "X") {
            oChkCheckId.setSelected(true);
          }

          field.setVisible(true);
          if (x.scr_status === "S") {
            field.setVisible(false);
          }

          const inputProperties = field.mAggregations.content[1].mProperties;
          inputProperties.required = x.scr_status === "R" ? true : false;
          inputProperties.fieldStatus = x.scr_status;

          if (inputProperties.required) {
            field.mAggregations.content[1].setValueState(Constants.oValueState.Error);
          } else {
            field.mAggregations.content[1].setValueState(Constants.oValueState.None);
          }
        }
      });
    },

    fnValidStep3: function (...oFields) {
      oFields[0].setValue(Methods.fnRemoveSpaces(oFields[0].getValue()));

      if (
        oFields[0].getValueState() === Constants.oValueState.None &&
        oFields[1].getValueState() === Constants.oValueState.None &&
        oFields[2].getValueState() === Constants.oValueState.None &&
        oFields[3].getValueState() === Constants.oValueState.None &&
        oFields[4].getValueState() === Constants.oValueState.None
      ) {
        return true;
      }

      return false;
    },
  };
});
