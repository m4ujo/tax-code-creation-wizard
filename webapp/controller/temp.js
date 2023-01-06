sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "sap/ui/core/library", "sap/m/MessageBox"], function (Controller, JSONModel, MessageBox, coreLibrary) {
  "use strict";

  const oDomain = "https://usalspgsa660.na.pg.com:8443";
  const rSpaces = /\s/g;
  const oUrlCodes = {
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
    postCreateTaxCode: "TEST_POST_METHOD",
  };

  let oValueState = coreLibrary.ValueState;
  let aDataJson = [];
  let sUrl = "";

  return Controller.extend("taco.controller.App", {
    onInit: function () {
      // Get elemets by ID
      this.oWizard = this.byId("taco-wizard");
      this.oNavContainer = this.byId("taco-navcontainer");
      this.oMainPage = this.byId("taco-main-page");
      // Step 1
      this.oCbxCountryKey = this.byId("cbx-countryKey");
      this.oCbxTaxType = this.byId("cbx-taxType");
      // Step 2
      this.oCbxVatScenarios = this.byId("cbx-vatScenarios");
      // Step 3
      this.oIptTaxCodeId = this.byId("input-taxCodeId");
      this.oIptTaxName = this.byId("input-taxName");
      this.oChkCheckId = this.byId("chk-checkId");
      this.oCbxTaxJur = this.byId("cbx-taxJur");
      this.oCbxReportCountry = this.byId("cbx-reportCountry");
      this.oCbxEuCode = this.byId("cbx-euCode");
      this.oCbxTargetTaxCode = this.byId("cbx-targetTaxCode");
      this.oIptTolerance = this.byId("input-tolerance");
      // Step 4
      this.oTableReviewConditionTypes = this.byId("table-revTaxRates");

      this.aFinalData = {};
    },

    fnBackToWizardContent: function () {
      this.oNavContainer.backToPage(this._oMainPage.getId());
    },

    fnHandleNavigationToStep: function (iStepNumber) {
      const fnAfterNavigate = function () {
        this.oWizard.goToStep(this.oWizard.getSteps()[iStepNumber]);
        this.oNavContainer.detachAfterNavigate(fnAfterNavigate);
      }.bind(this);

      this.oNavContainer.attachAfterNavigate(fnAfterNavigate);
      this.fnBackToWizardContent();
    },

    fnChangeStateOfControlsForStep: function (iStep, bState) {
      if (iStep === 1) {
        this.oCbxCountryKey.setEnabled(bState);
        this.oCbxTaxType.setEnabled(bState);
      } else if (iStep === 2) {
        this.oCbxVatScenarios.setEnabled(bState);
      } else if (iStep === 3) {
        this.oIptTaxCodeId.setEnabled(bState);
        this.oIptTaxName.setEnabled(bState);
        this.oCbxTaxJur.setEnabled(bState);
        this.oChkCheckId.setEnabled(bState);
        this.oCbxReportCountry.setEnabled(bState);
        this.oCbxEuCode.setEnabled(bState);
        this.oCbxTargetTaxCode.setEnabled(bState);
        this.oIptTolerance.setEnabled(bState);
      } else if (iStep === 4) {
        this.oCbxVatScenarios.setEditable(bState);
      }
    },

    fnClearInputsForStep: function (iStep) {
      if (iStep === 1) {
        this.oCbxCountryKey.setValue("");
        this.oCbxCountryKey.setSelectedKey("");
        this.oCbxTaxType.setValue("");
        this.oCbxTaxType.setSelectedKey("");
      } else if (iStep === 2) {
        this.oCbxVatScenarios.setValue("");
        this.oCbxVatScenarios.setSelectedKey("");
      } else if (iStep === 3) {
        this.oIptTaxCodeId.setValue("");
        this.oIptTaxName.setValue("");
        this.oCbxTaxJur.setValue("");
        this.oCbxTaxJur.setSelectedKey("");
        this.oCbxReportCountry.setValue("");
        this.oCbxReportCountry.setSelectedKey("");
        this.oCbxEuCode.setValue("");
        this.oCbxEuCode.setSelectedKey("");
        this.oCbxTargetTaxCode.setValue("");
        this.oCbxTargetTaxCode.setSelectedKey("");
        this.oIptTolerance.setValue(0.0);
      } else if (iStep === 4) {
        this.oTableReviewConditionTypes.setModel(new JSONModel());
      }
    },

    // Tax Properties - Step 1 ------------------------------------------------------------------------------------
    onActivateStepTaxProperties: function () {
      sUrl = this.fnBuildUrl(oUrlCodes.getTaxCountry);
      this.fnGetDataJson(sUrl, this.oCbxCountryKey);

      sUrl = this.fnBuildUrl(oUrlCodes.getTaxType);
      this.fnGetDataJson(sUrl, this.oCbxTaxType);

      sUrl = this.fnBuildUrl(oUrlCodes.getEuCodes);
      this.fnGetDataJson(sUrl, this.oCbxEuCode);

      sUrl = this.fnBuildUrl(oUrlCodes.getReportCountries);
      this.fnGetDataJson(sUrl, this.oCbxReportCountry);
    },

    validateTaxProperties: function (oEvent) {
      // Make sure an item is chosen from the data list
      this.fnSetValueStateField(oEvent);

      // Remove spaces
      const sCountryKey = this.oCbxCountryKey.getValue().replace(rSpaces, "");
      const sTaxType = this.oCbxTaxType.getSelectedKey();

      // Validations
      if (sCountryKey === "" || sTaxType === "") {
        this.byId("step-tax-properties").setValidated(false);
      } else if (this.oCbxCountryKey.getValueState() === oValueState.Error || this.oCbxTaxType.getValueState() === oValueState.Error) {
        this.byId("step-tax-properties").setValidated(false);
      } else {
        this.byId("step-tax-properties").setValidated(true);
        sUrl = this.fnBuildUrl(oUrlCodes.getTaxCodes, {
          type: "land1",
          value: this.oCbxCountryKey.getValue(),
        });
        this.fnGetDataJson(sUrl, this.oCbxTargetTaxCode);
      }
    },

    onCompleteTaxProperties: function () {
      this.fnChangeStateOfControlsForStep(1, false);
    },

    // Vat Scenario - Step 2 ------------------------------------------------------------------------------------
    onActivateStepVatScenarios: function () {
      this.byId("step-vat-scenarios").setValidated(false);

      sUrl = this.fnBuildUrl(oUrlCodes.getTaxScenarios, { type: "land1", value: this.oCbxCountryKey.getValue() }, { type: "mwart", value: this.oCbxTaxType.getSelectedKey() });
      this.fnGetDataJson(sUrl);

      setTimeout(() => {
        this.oCbxVatScenarios.setModel(new JSONModel(aDataJson));

        if (aDataJson.length === 0) {
          MessageBox.error("No scenarios were found, for the entered values.", {
            details: `
                  <ul>
                    <li><strong>Country Key: </strong> ${this.oCbxCountryKey.getValue()}</li>
                    <li><strong>Tax Type: </strong> ${this.oCbxTaxType.getSelectedKey()}</li>
                  </ul>
                `,
          });
          this.oWizard.previousStep();
          this.byId("step-tax-properties").setValidated(false);
          this.fnChangeStateOfControlsForStep(1, true);
          this.fnClearInputsForStep(1);
        }
      }, 500);
    },

    validateVatScenario: function (oEvent) {
      this.fnSetValueStateField(oEvent);

      const sVatScenario = this.oCbxVatScenarios.getValue().replace(rSpaces, "");

      if (sVatScenario === "" || this.oCbxVatScenarios.getValueState() === oValueState.Error) {
        this.byId("step-vat-scenarios").setValidated(false);
      } else {
        this.byId("step-vat-scenarios").setValidated(true);
      }
    },

    onCompleteVatScenarios: function () {
      this.fnChangeStateOfControlsForStep(2, false);
      this.byId("button-backToStep1").setVisible(false);
    },

    onPressToStep1: function () {
      // Volver al paso 1
      this.oWizard.previousStep();
      this.fnChangeStateOfControlsForStep(1, true);
      this.fnClearInputsForStep(2);
    },

    // Tax Attr - Step 3 ------------------------------------------------------------------------------------
    onActivateStepTaxAttr: function () {
      this.byId("stepTaxAttr").setValidated(false);

      sUrl = this.fnBuildUrl(oUrlCodes.getTaxFieldstatus, { type: "land1", value: this.oCbxCountryKey.getValue() }, { type: "mwart", value: this.oCbxTaxType.getSelectedKey() }, { type: "scen", value: this.oCbxVatScenarios.getValue() });
      this.fnGetDataJson(sUrl);

      setTimeout(() => {
        if (aDataJson.length === 0) {
          MessageBox.error("Fieldstatus data not found, for the entered scenario.", {
            details: `
                  <ul>
                    <li><strong>Country Key: </strong> ${this.oCbxCountryKey.getValue()}</li>
                    <li><strong>Tax Type: </strong> ${this.oCbxTaxType.getSelectedKey()}</li>
                    <li><strong>VAT Tax Scenario: </strong> ${this.oCbxVatScenarios.getValue()}</li>
                  </ul>
                `,
          });
          this.oWizard.previousStep();
          this.byId("step-vat-scenarios").setValidated(false);
          this.fnChangeStateOfControlsForStep(2, true);
          this.fnClearInputsForStep(2);
        } else {
          aDataJson.forEach((x) => {
            const field = this.byId(`field-${x.fieldname}`);

            if (field) {
              if (x.fieldname === "CHECKID" && x.default_value === "X") {
                this.oChkCheckId.setSelected(true);
              }

              field.setVisible(true);
              if (x.scr_status === "S") {
                field.setVisible(false);
              }

              const inputProperties = field.mAggregations.content[1].mProperties;
              inputProperties.required = x.scr_status === "R" ? true : false;
            }
          });
        }
      }, 500);
    },

    validateTaxAttr: function (oEvent) {
      const taxCodeId = this.oIptTaxCodeId.getValue().replace(rSpaces, "");
      const taxName = this.oIptTaxName.getValue().replace(rSpaces, "");
      const taxJur = this.oCbxTaxJur.getValue().replace(rSpaces, "");
      const reportCountry = this.oCbxReportCountry.getValue().replace(rSpaces, "");
      const tTaxCode = this.oCbxTargetTaxCode.getValue().replace(rSpaces, "");

      if ((oEvent.getSource().sId === "container-taco---app--cbx-reportCountry" && this.oCbxReportCountry.mProperties.required) || (oEvent.getSource().sId === "container-taco---app--cbx-taxJur" && this.oCbxTaxJur.mProperties.required) || (oEvent.getSource().sId === "container-taco---app--cbx-euCode" && this.oCbxEuCode.mProperties.required) || (oEvent.getSource().sId === "container-taco---app--cbx-targetTaxCode" && this.oCbxTargetTaxCode.mProperties.required)) {
        this.fnSetValueStateField(oEvent);
      }

      if (
        (this.oIptTaxCodeId.mProperties.required && taxCodeId === "") ||
        (this.oIptTaxName.mProperties.required && taxName === "") ||
        (this.oCbxTaxJur.mProperties.required && taxJur === "") ||
        this.oCbxTaxJur.getValueState() === oValueState.Error ||
        (this.oCbxReportCountry.mProperties.required && reportCountry) === "" ||
        this.oCbxReportCountry.getValueState() === oValueState.Error ||
        this.oCbxEuCode.mProperties.required ||
        this.oCbxEuCode.getValueState() === oValueState.Error ||
        (this.oCbxTargetTaxCode.mProperties.required && tTaxCode === ""(this.oCbxTargetTaxCode.getValueState() === oValueState.Error))
      ) {
        this.byId("stepTaxAttr").setValidated(false);
      } else {
        this.byId("stepTaxAttr").setValidated(true);

        sUrl = this.fnBuildUrl(oUrlCodes.getTaxProcedures, { type: "land1", value: this.oCbxCountryKey.getValue() }, { type: "mwart", value: this.oCbxTaxType.getSelectedKey() }, { type: "scen", value: this.oCbxVatScenarios.getValue() });
        this.fnGetDataJson(sUrl, this.oTableReviewConditionTypes);
      }
    },

    onCompleteTaxAttr: function () {
      this.byId("button-backToStep2").setVisible(false);
      this.fnChangeStateOfControlsForStep(3, false);

      //   sUrl = this.fnBuildUrl(
      //     oUrlCodes.checkTaxCode,
      //     { type: 'land1', value: this.oCbxCountryKey.getValue() },
      //     { type: 'mwskz', value: this.oIptTaxCodeId.getValue() }
      //   );
      //   this.fnGetDataJson(sUrl);

      // if (aDataJson.status_code === 'E') {
      //   MessageBox.error(`${aDataJson.status_message}`);
      //   this.oWizard.invalidateStep(this.byId('stepTaxAttr'));
      //   this.oWizard.discardProgress(this.oWizard.getSteps()[2]);
      //   this.fnHandleNavigationToStep(3);
      // }
    },

    onPressToStep2: function () {
      // Volver al paso 2
      this.oWizard.previousStep();
      this.byId("button-backToStep1").setVisible(true);
      this.fnChangeStateOfControlsForStep(2, true);
      this.fnClearInputsForStep(3);
    },

    // Set Condition Types - Step 4 ------------------------------------------------------------------------------------
    onActivateConditionTypes: function () {
      sUrl = this.fnBuildUrl(oUrlCodes.getTaxProcedures, { type: "land1", value: this.oCbxCountryKey.getValue() }, { type: "mwart", value: this.oCbxTaxType.getSelectedKey() }, { type: "scen", value: this.oCbxVatScenarios.getValue() });
      this.fnGetDataJson(sUrl);

      setTimeout(() => {
        console.log(aDataJson);
      }, 500);
    },

    onCompleteConditionTypes: function () {
      this.byId("button-backToStep2").setVisible(false);
      this.byId("button-backToStep3").setVisible(false);

      let headerData = {
        land1: this.oCbxCountryKey.getValue(),
        kalsm: "",
        mwart: this.oCbxTaxType.getSelectedKey(),
        mwskz: this.oIptTaxCodeId.getValue(),
        mwskz_name: this.oIptTaxName.getValue(),
        txjcd: this.oCbxTaxJur.getValue(),
        scen: this.oCbxVatScenarios.getValue(),
        pruef: this.oChkCheckId.getSelected(),
        zmwsk: this.oCbxTargetTaxCode.getValue(),
        egrkz: this.oCbxEuCode.getValue(),
        lstml: this.oCbxReportCountry.getValue(),
        tolerance: this.oIptTolerance.getValue(),
      };
      let schemaData = [];

      this.oTableReviewConditionTypes.getRows().forEach((row) => {
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

      this.aFinalData = {
        header: headerData,
        schema: schemaData,
      };

      this.oTableReviewConditionTypes.getRows().forEach((row) => {
        row.getCells()[5].setEnabled(false);
      });

      this.byId("tableConditionTypes").mProperties.visibleRowCount = this.aFinalData.schema.length;

      this.byId("step-reviewAll").setModel(new JSONModel(this.aFinalData));
    },
    onPressToStep3: function () {
      this.oWizard.previousStep();
      this.byId("button-backToStep2").setVisible(true);
      this.fnChangeStateOfControlsForStep(3, true);
    },

    // Review
    backToStep4: function () {
      this.oWizard.previousStep();
      this.byId("button-backToStep3").setVisible(true);
      this.oTableReviewConditionTypes.getRows().forEach((row) => {
        row.getCells()[5].setEnabled(true);
      });
    },

    onComplete: function () {
      console.log("Make POST Request");

      console.log(this.aFinalData);

      sUrl = this.fnBuildUrl(oUrlCodes.postCreateTaxCode);

      fetch(sUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify(this.aFinalData),
      })
        .then((response) => response.text())
        .then((text) => console.log(text));
    },
  });
});
