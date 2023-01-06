sap.ui.define(["taco/controller/js/Constants"], function (Constants) {
  "use strict";
  return {
    fnRemoveSpaces: (str) => {
      return str.replace(Constants._rSpaces, "");
    },

    fnBuildUrl: (sCode, ...aParams) => {
      let url = `${Constants._oDomain}/pg_itx?sap-client=400&code=${sCode}`;

      if (aParams) {
        aParams.forEach((param) => {
          param.value = param.value.replace("&", "%26");
          param.value = param.value.replace(" ", "%20");
          url += `&${param.type}=${param.value}`;
        });
      }

      return url;
    },

    fnSetValueStateField: function (oEvent, ...aFieldStatus) {
      const oValidatedField = oEvent.getSource();
      const sValue = this.fnRemoveSpaces(oValidatedField.getValue().toString());
      const status = aFieldStatus[0];
      const controlType = oValidatedField.getMetadata().getName();
      let sSelectedKey = "";

      oValidatedField.setValueState(Constants.oValueState.Error);

      if (controlType === "sap.m.ComboBox") {
        sSelectedKey = oValidatedField.getSelectedKey();
      }

      if ((status === "R" || status === undefined) && sValue.length === 0) {
        oValidatedField.setValueStateText("Mandatory field, don't leave empty");
      } else if (controlType === "sap.m.ComboBox" && !sSelectedKey && sValue) {
        oValidatedField.setValueStateText("Select an item from the list");

        if (status === "O") {
          oValidatedField.setValueStateText("Select an item from the list or leave empty");
          oValidatedField.setValueState(Constants.oValueState.Warning);
        }
      } else {
        oValidatedField.setValueState(Constants.oValueState.None);
      }
    },

    fnGetAjax: (sUrl) => {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: sUrl,
          crossDomain: true,
          type: "GET",
          success: function (response) {
            resolve(response);
          },
          error: function (error) {
            reject(error);
          },
        });
      });
    },

    fnSetDataForReview: function (...aFields) {
      let schemaData = [],
        headerData = {
          land1: aFields[0].getValue(),
          kalsm: "",
          mwart: aFields[1].getSelectedKey(),
          mwskz: aFields[2].getValue(),
          mwskz_name: aFields[3].getValue(),
          txjcd: aFields[4].getValue(),
          scen: aFields[5].getValue(),
          pruef: aFields[6].getSelected(),
          zmwsk: aFields[7].getValue(),
          egrkz: aFields[8].getValue(),
          lstml: aFields[9].getValue(),
          tolerance: aFields[10].getValue(),
        };

      aFields[11].getRows().forEach((row) => {
        const schemaTemp = {
          kschl: row.getCells()[0].getText(),
          vtext: row.getCells()[1].getText(),
          kalsm: row.getCells()[2].getText(),
          stunr: row.getCells()[3].getText(),
          kvsl1: row.getCells()[4].getText(),
          kbetr: row.getCells()[5].getValue(),
        };

        if (schemaTemp.kschl) {
          headerData.kalsm = schemaTemp.kalsm;
          schemaData.push(schemaTemp);
        }
      });

      let aFinalData = {
        header: headerData,
        schema: schemaData,
      };

      aFields[12].mProperties.visibleRowCount = aFinalData.schema.length;

      return aFinalData;
    },
  };
});
