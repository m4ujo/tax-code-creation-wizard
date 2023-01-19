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
          if (typeof param.value === "string") {
            param.value = param.value.replace("%", "%25");
            param.value = param.value.replace("&", "%26");
            param.value = param.value.replace(" ", "%20");
          }
          url += `&${param.type}=${param.value}`;
        });
      }

      return url;
    },

    fnSetMandatoryField: function (oControl) {
      oControl.setValueState(Constants.oValueState.Error);
      oControl.setValueStateText("Mandatory field");
    },

    fnChangeValueState: function (oEvent) {
      const oField = oEvent.getSource();
      const sFieldValue = this.fnRemoveSpaces(oField.getValue().toString());
      const bRequiredField = oField.mProperties.required;
      const sFieldType = oField.getMetadata().getName();
      let sSelectedKey = "";

      if (sFieldType === "sap.m.ComboBox")
        sSelectedKey = oField.getSelectedKey();

      if (sFieldValue === "" && bRequiredField) {
        this.fnSetMandatoryField(oField);
      } else if (
        sFieldType === "sap.m.ComboBox" && !sSelectedKey &&
        sFieldValue && oField.sId !== "container-taco---app--cbx-target-tax-code"
      ) {
        oField.setValueState(Constants.oValueState.Error);
        oField.setValueStateText("Select an item from the list");

        if (!bRequiredField) {
          oField.setValueStateText("Select an item from the list or leave empty");
          oField.setValueState(Constants.oValueState.Warning);
        }
      } else {
        oField.setValueState(Constants.oValueState.None);
      }
    },

    fnCheckFieldStatus: function (oThis, aData) {
      this.fnSetMandatoryField(oThis.oIptTaxName);

      aData.forEach((oFieldData) => {
        const oField = oThis.byId(`field-${oFieldData.fieldname}`);

        if (oField) {
          oField.setVisible((oFieldData.scr_status === "S") ? false : true);

          if (oFieldData.fieldname === "CHECKID" && oFieldData.default_value === "X")
            oField.mAggregations.content[1].setSelected(true);

          const inputProperties = oField.mAggregations.content[1].mProperties;
          inputProperties.required = oFieldData.scr_status === "R" ? true : false;

          if (inputProperties.required) {
            this.fnSetMandatoryField(oField.mAggregations.content[1]);
          } else {
            oField.mAggregations.content[1].setValueState(Constants.oValueState.None);
          }
        }
      });
    },

    fnSetDataForReview: function (oTable, oTableReview, ...aFields) {
      let oHeaderData = {}, aSchemaData = [];

      oHeaderData = {
        land1: aFields[0], kalsm: aFields[1], mwart: aFields[2],
        mwskz: aFields[3], mwskz_name: aFields[4], txjcd: aFields[5],
        scen: aFields[6], pruef: aFields[7], zmwsk: aFields[8],
        egrkz: aFields[9], lstml: aFields[10], tolerance: aFields[11]
      };

      oTable.getRows().forEach((row) => {
        if (row.getCells()[0].getText())
          aSchemaData.push({
            kschl: row.getCells()[0].getText(), vtext: row.getCells()[1].getText(), kalsm: row.getCells()[2].getText(),
            stunr: row.getCells()[3].getText(), kvsl1: row.getCells()[4].getText(), kbetr: row.getCells()[5].getValue(),
          });
      });

      oTableReview.mProperties.visibleRowCount = oTable.getModel().oData.length;

      return {
        header: oHeaderData,
        schema: aSchemaData,
      };
    },
  };
});
