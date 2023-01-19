sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/core/syncStyleClass",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "taco/controller/js/Methods",
    "taco/controller/js/Constants",
    "taco/controller/js/Validations",
  ],
  function (Controller, Fragment, syncStyleClass, JSONModel, MessageBox, MessageToast, Methods, Constants, Validations) {
    "use strict";

    let data = {}, data_tgt = {};

    return Controller.extend("taco.controller.App", {
      onInit: function () {
        // Get elements by ID
        this.oWizard = this.byId("taco-wizard");
        this.oNavContainer = this.byId("taco-navcontainer");
        this.oMainPage = this.byId("taco-main-page");

        // Elements by step
        // Step 1
        this.oStepTaxProperties = this.byId("step-tax-properties");
        this.oCbxCountryKey = this.byId("cbx-country-key");
        this.oCbxTaxType = this.byId("cbx-tax-type");

        // Step 2
        this.oStepVatScenarios = this.byId("step-vat-scenarios");
        this.oCbxVatScenarios = this.byId("cbx-vat-scenarios");
        this.oBtnBackToStep1 = this.byId("button-back-to-step1");

        // Step 3
        this.oStepTaxAttr = this.byId("step-tax-attr");
        this.oIptTaxCodeId = this.byId("input-tax-code-id");
        this.oIptTaxName = this.byId("input-tax-name");
        this.oCbxTaxJur = this.byId("cbx-tax-jur");
        this.oChkCheckId = this.byId("chk-check-id");
        this.oCbxReportCountry = this.byId("cbx-report-country");
        this.oCbxEuCode = this.byId("cbx-eu-code");
        this.oCbxTargetTaxCode = this.byId("cbx-target-tax-code");
        this.oIptTolerance = this.byId("input-tolerance");
        this.oBtnBackToStep2 = this.byId("button-back-to-step2");
        this.oBtnValidateTaxAttr = this.byId("button-validate-step3");

        // Step 4
        this.oStepConditionTypes = this.byId("step-condition-types");
        this.oTableDefault = this.byId("table-default");
        this.oContainerTableDefault = this.byId("container-table-default");
        this.oTableDeferred = this.byId("table-deferred");
        this.oContainerTableDeferred = this.byId("container-table-deferred");
        this.oBtnBackToStep3 = this.byId("button-back-to-step3");
        this.oBtnDeleteTableDefault = this.byId("button-delete-condition-type");
        this.oIptReceiverTaxName = this.byId("input-receiver-tax-name");

        // Step 5
        this.oStepReviewAll = this.byId("step-review-all");
        this.oTableReview = this.byId("table-review");
        this.oTableReviewDeferred = this.byId("table-review-deferred");
        this.oContainerReviewTableDeferred = this.byId("container-table-deferred-review");
        this.oBtnBackToStep4 = this.byId("button-back-to-step4");

        this.oFinalDataPost = {};

        // Instantiating busy dialog for the end of the tool
        if (!this._pBusyDialog) {
          this._pBusyDialog = Fragment.load({
            name: "taco.view.fragment.BusyDialog",
            controller: this,
          }).then(
            function (oBusyDialog) {
              this.getView().addDependent(oBusyDialog);
              syncStyleClass("sapUiSizeCompact", this.getView(), oBusyDialog);
              return oBusyDialog;
            }.bind(this)
          );
        }
      },

      fnChangeStateOfControlsForTheStep: function (iStep, bState) {
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
          this.oIptReceiverTaxName.setEnabled(bState);
          this.oTableDefault.getRows().forEach((row) => {
            row.getCells()[5].setEnabled(bState);
          });
          this.oTableDeferred.getRows().forEach((row) => {
            row.getCells()[5].setEnabled(bState);
          });
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
          this.oTableDefault.getRows().forEach((x) => {
            x.getCells()[5].setValue(0);
          });
          if (this.oMoreInfo.scenAdd !== "") {
            this.oTableDeferred.getRows().forEach((x) => {
              x.getCells()[5].setValue(0);
            });
          }
        }
      },

      /**
       * Get countries, requesting data from the server
       * @function
       * @name fnGetCountries
       */
      fnGetCountries: async function () {
        // Get data from request URL: Countries
        this.sUrl = Methods.fnBuildUrl(Constants._oUrlCodes.getTaxCountry);
        try {
          this.oResponse = await fetch(this.sUrl).then(oResponse => oResponse.json());
          this.oCbxCountryKey.setModel(new JSONModel(this.oResponse.data));
        } catch (error) {
          MessageBox.error("Server cannot respond to the request.", {
            details: `
              <span>
                <strong>URL:</strong> <a href="${this.sUrl}">${Constants._oUrlCodes.getTaxCountry}</a>
              </span>
            `
          });
        }
      },

      /**
       * Get countries, requesting data from the server
       * @function
       * @name fnGetTaxTypes
       */
      fnGetTaxTypes: async function () {
        // Get data from request URL: Tax Types
        this.sUrl = Methods.fnBuildUrl(Constants._oUrlCodes.getTaxType);
        try {
          this.oResponse = await fetch(this.sUrl).then(oResponse => oResponse.json());
          this.oCbxTaxType.setModel(new JSONModel(this.oResponse.data));
        } catch (error) {
          MessageBox.error("Server cannot respond to the request.", {
            details: `
              <span>
                <strong>URL:</strong> <a href="${this.sUrl}">${Constants._oUrlCodes.getTaxType}</a>
              </span>
            `
          });
        }
      },

      /**
       * Request for data from countries
       * @function
       * @name fnGetReportingCountries
       */
      fnGetReportingCountries: async function () {
        // Get data from request URL: Reporting countries
        this.sUrl = Methods.fnBuildUrl(Constants._oUrlCodes.getReportCountries);
        try {
          this.oResponse = await fetch(this.sUrl).then(oResponse => oResponse.json());
          this.oCbxReportCountry.setModel(new JSONModel(this.oResponse.data));
        } catch (error) {
          MessageBox.error("Server cannot respond to the request.", {
            details: `
              <span>
                <strong>URL:</strong> <a href="${this.sUrl}">${Constants._oUrlCodes.getReportCountries}</a>
              </span>
            `
          });
        }
      },

      /**
       * Request for data from countries
       * @function
       * @name fnGetEuCodes
       */
      fnGetEuCodes: async function () {
        // Get data from request URL: EU Codes
        this.sUrl = Methods.fnBuildUrl(Constants._oUrlCodes.getEuCodes);
        try {
          this.oResponse = await fetch(this.sUrl).then(oResponse => oResponse.json());
          this.oCbxEuCode.setModel(new JSONModel(this.oResponse.data));
        } catch (error) {
          MessageBox.error("Server cannot respond to the request.", {
            details: `
              <span>
                <strong>URL:</strong> <a href="${this.sUrl}">${Constants._oUrlCodes.getEuCodes}</a>
              </span>
            `
          });
        }
      },

      /**
       * Set fields as required and request data
       * @function
       * @name initTaxProperties
       */
      initTaxProperties: function () {
        Methods.fnSetMandatoryField(this.oCbxCountryKey);
        Methods.fnSetMandatoryField(this.oCbxTaxType);

        this.fnGetCountries();
        this.fnGetTaxTypes();
        this.fnGetReportingCountries();
        this.fnGetEuCodes();
      },

      fnGetVatScenarios: async function () {
        // Get data from request URL: VAT Scenarios
        this.sUrl = Methods.fnBuildUrl(Constants._oUrlCodes.getTaxScenarios,
          { type: "land1", value: this.oCbxCountryKey.getValue() },
          { type: "mwart", value: this.oCbxTaxType.getSelectedKey() }
        );
        try {
          this.oResponse = await fetch(this.sUrl).then(oResponse => oResponse.json());

          if (this.oResponse.data.length === 0) {
            MessageBox.error("No scenarios were found, for the entered values.");
          } else {
            this.oCbxVatScenarios.setModel(new JSONModel(this.oResponse.data));
            this.oStepTaxProperties.setValidated(true);
          }
        } catch (error) {
          MessageBox.error("Server cannot respond to the request.", {
            details: `
              <span>
                <strong>URL:</strong> <a href="${this.sUrl}">${Constants._oUrlCodes.getTaxScenarios}</a>
              </span>
            `
          });
          this.oStepTaxProperties.setValidated(false);
        }

      },

      validateTaxProperties: function (oEvent) {
        // Override step by default
        this.oStepTaxProperties.setValidated(false);

        // Make sure an item is chosen from the data list
        Methods.fnChangeValueState(oEvent);

        // Validate
        if (Validations.fnValidStep1(this.oCbxCountryKey, this.oCbxTaxType)) {
          this.fnGetVatScenarios();
        }
      },

      completeTaxProperties: function () {
        // When the step is finished, disable all controls
        this.fnChangeStateOfControlsForTheStep(1, false);
      },

      // Step 2 --------------------------------------------
      initVatScenarios: function () {
        // Set the status value to error
        Methods.fnSetMandatoryField(this.oCbxVatScenarios);
      },

      fnGetMoreInfo: function () {
        let sAutoDeftax = "";

        this.oCbxCountryKey.getModel().oData.forEach((oCountry) => {
          if (oCountry.land1 === this.oCbxCountryKey.getValue())
            sAutoDeftax = oCountry.auto_deftax;
        });

        this.oCbxVatScenarios.getModel().oData.forEach((oScenario) => {
          if (oScenario.scen === this.oCbxVatScenarios.getValue())
            this.oMoreInfo = {
              scenAdd: oScenario.scen_add,
              deftaxScen: oScenario.deftax_scen,
              autoDeftax: sAutoDeftax,
              editableTable: oScenario.allw_excl_kschl
            };
        });
      },

      fnGetConditionTypes: async function (sScenario) {
        this.sUrl = Methods.fnBuildUrl(Constants._oUrlCodes.getTaxProcedures,
          { type: "land1", value: this.oCbxCountryKey.getValue() },
          { type: "mwart", value: this.oCbxTaxType.getSelectedKey() },
          { type: "scen", value: sScenario }
        );

        try {
          this.oResponse = await fetch(this.sUrl).then(oResponse => oResponse.json());

          if (this.oResponse.data.length === 0) {
            MessageBox.error("Condition types not found, for the entered scenario.");
          } else {
            if (sScenario === this.oMoreInfo.scenAdd) {
              this.oTableDeferred.setModel(new JSONModel(this.oResponse.data));
              this.oTableDeferred.mProperties.visibleRowCount = this.oResponse.data.length;
            } else {
              this.oTableDefault.setModel(new JSONModel(this.oResponse.data));
              this.oTableDefault.mProperties.visibleRowCount = this.oResponse.data.length;
            }
            this.fnGetFieldStatus();
          }
        } catch (error) {
          MessageBox.error("Server cannot respond to the request.", {
            details: `
              <span>
                <strong>URL:</strong> <a href="${this.sUrl}">${Constants._oUrlCodes.getTaxScenarios}</a>
              </span>
            `
          });
          this.oStepVatScenarios.setValidated(false);
        }
      },

      fnGetFieldStatus: async function () {
        this.sUrl = Methods.fnBuildUrl(Constants._oUrlCodes.getTaxFieldstatus,
          { type: "land1", value: this.oCbxCountryKey.getValue() },
          { type: "mwart", value: this.oCbxTaxType.getSelectedKey() },
          { type: "scen", value: this.oCbxVatScenarios.getValue() }
        );

        try {
          this.oResponse = await fetch(this.sUrl).then(oResponse => oResponse.json());

          if (this.oResponse.data.length === 0) {
            MessageBox.error("Fieldstatus not found, for the entered scenario.");
          } else {
            this.aFieldStatus = this.oResponse.data;
            this.oStepVatScenarios.setValidated(true);
          }
        } catch (error) {
          MessageBox.error("Server cannot respond to the request.", {
            details: `
              <span>
                <strong>URL:</strong> <a href="${this.sUrl}">${Constants._oUrlCodes.getTaxFieldstatus}</a>
              </span>
            `
          });
          this.oStepVatScenarios.setValidated(false);
        }
      },

      validateVatScenarios: function (oEvent) {
        // Set the step validation status to FALSE by default
        this.oStepVatScenarios.setValidated(false);

        // Make sure an item is chosen from the data list
        Methods.fnChangeValueState(oEvent);

        if (Validations.fnValidStep2(this.oCbxVatScenarios)) {
          this.fnGetConditionTypes(this.oCbxVatScenarios.getValue());
          this.fnGetMoreInfo();
          if (this.oMoreInfo.scenAdd !== "") {
            this.fnGetConditionTypes(this.oMoreInfo.scenAdd);
          }
        }
      },

      completeVatScenarios: function () {
        this.fnChangeStateOfControlsForTheStep(2, false);
        this.oBtnBackToStep1.setVisible(false);
        Methods.fnCheckFieldStatus(this, this.aFieldStatus);
      },

      onPressBackToTaxProperties: function () {
        // When you return to the previous step, enable all controls
        this.fnChangeStateOfControlsForTheStep(1, true);

        // Clear inputs for the current step, when you return to the previous step
        this.fnClearInputsForStep(2);

        this.oWizard.previousStep();
      },

      // Step 3 --------------------------------------------

      fnGetTaxJurisdiction: async function () {
        // Get data from request URL: Tax Jurisdiction
        this.sUrl = Methods.fnBuildUrl(Constants._oUrlCodes.getTaxJur, { type: "land1", value: this.oCbxCountryKey.getValue() });
        try {
          this.oResponse = await fetch(this.sUrl).then(oResponse => oResponse.json());
          this.oCbxTaxJur.setModel(new JSONModel(this.oResponse.data));
        } catch (error) {
          MessageBox.error("Server cannot respond to the request.", {
            details: `
              <span>
                <strong>URL:</strong> <a href="${this.sUrl}">${Constants._oUrlCodes.getTaxJur}</a>
              </span>
            `
          });
        }
      },

      fnGetTaxCodes: async function () {
        this.sUrl = Methods.fnBuildUrl(Constants._oUrlCodes.getTaxCodes, { type: "land1", value: this.oCbxCountryKey.getValue() });
        try {
          this.oResponse = await fetch(this.sUrl).then(oResponse => oResponse.json());
          this.oCbxTargetTaxCode.setModel(new JSONModel(this.oResponse.data));
        } catch (error) {
          MessageBox.error("Server cannot respond to the request.", {
            details: `
              <span>
                <strong>URL:</strong> <a href="${this.sUrl}">${Constants._oUrlCodes.getTaxCodes}</a>
              </span>
            `
          });
        }
      },

      initTaxAttr: function () {
        this.fnGetTaxJurisdiction();
        this.fnGetTaxCodes();
      },

      fnCheckTaxCode: async function () {
        this.sUrl = Methods.fnBuildUrl(Constants._oUrlCodes.checkTaxCode,
          { type: "land1", value: this.oCbxCountryKey.getValue() },
          { type: "mwskz", value: this.oIptTaxCodeId.getValue().toUpperCase() },
          { type: "txjcd", value: this.oCbxTaxJur.getValue() }
        );

        try {
          this.oResponse = await fetch(this.sUrl).then(oResponse => oResponse.json());

          if (this.oResponse[0].status_code === "E") {
            MessageToast.show(`${this.oResponse[0].status_message}`);
            this.oStepTaxAttr.setValidated(false);
          } else if (this.oResponse[0].status_code === "S") {
            MessageToast.show("No errors found, all required fields were validated");
            this.oBtnValidateTaxAttr.setVisible(false);
            this.oStepTaxAttr.setValidated(true);

            this.fnGetConditionTypes(this.oCbxVatScenarios.getValue());
            if (this.oMoreInfo.scenAdd !== "") {
              this.fnGetConditionTypes(this.oMoreInfo.scenAdd);
            }
          }

        } catch (error) {
          MessageBox.error("Server cannot respond to the request.", {
            details: `
              <span>
                <strong>URL:</strong> <a href="${this.sUrl}">${Constants._oUrlCodes.checkTaxCode}</a>
              </span>
            `
          });
        }
      },

      fnCheckDeferredTaxInfo: async function () {
        this.sUrl = Methods.fnBuildUrl(
          Constants._oUrlCodes.checkDeferredTaxInfo,
          { type: "land1", value: this.oCbxCountryKey.getValue() },
          { type: "kalsm", value: this.oTableDefault.getModel().oData[0].kalsm },
          { type: "mwart", value: this.oCbxTaxType.getSelectedKey() },
          { type: "mwskz", value: this.oIptTaxCodeId.getValue() },
          { type: "mwskz_name", value: this.oIptTaxName.getValue() },
          { type: "txjcd", value: this.oCbxTaxJur.getValue() },
          { type: "scen", value: this.oCbxVatScenarios.getValue() },
          { type: "pruef", value: this.oChkCheckId.getSelected() ? "X" : "" },
          { type: "zmwsk", value: this.oCbxTargetTaxCode.getValue() },
          { type: "egrkz", value: this.oCbxEuCode.getValue() },
          { type: "lstml", value: this.oCbxReportCountry.getValue() },
          { type: "tolerance", value: this.oIptTolerance.getValue() }
        );

        try {
          this.oResponse = await fetch(this.sUrl).then(oResponse => oResponse.json());

          this.oContainerTableDeferred.setVisible(false);
          this.oContainerReviewTableDeferred.setVisible(false);

          if (this.oResponse[0].status_code === "S") {
            this.fnCheckTaxCode();
            this.oStepConditionTypes.setValidated(true);
            if (this.oResponse[0].auto_deftax === "X" && this.oResponse[0].deftax_scen === "X") {
              this.oStepConditionTypes.setValidated(false);
              this.oContainerTableDeferred.setVisible(true);
              this.oContainerReviewTableDeferred.setVisible(true);
            }
          } else {
            this.oStepTaxAttr.setValidated(false);
            MessageBox.error(`${this.oResponse[0].status_message}`);
          }

        } catch (error) {
          MessageBox.error("Server cannot respond to the request.", {
            details: `
              <span>
                <strong>URL:</strong> <a href="${this.sUrl}">${Constants._oUrlCodes.checkDeferredTaxInfo}</a>
              </span>
            `
          });
        }
      },

      validateTaxAttr: function (oEvent) {
        // Set the step validation status to FALSE by default
        this.oStepTaxAttr.setValidated(false);

        // Make sure an item is chosen from the data list
        Methods.fnChangeValueState(oEvent);

        let bValidated = Validations.fnValidStep3(
          this.oIptTaxCodeId, this.oIptTaxName,
          this.oCbxTaxJur, this.oCbxReportCountry,
          this.oCbxTargetTaxCode
        );

        if (bValidated) {
          this.oBtnValidateTaxAttr.setVisible(true);
        } else {
          this.oBtnValidateTaxAttr.setVisible(false);
        }
      },

      onPressValidateTaxAttr: function () {
        this.fnCheckDeferredTaxInfo();
      },

      completeTaxAttr: function () {
        this.oBtnValidateTaxAttr.setVisible(false);
        this.oBtnBackToStep2.setVisible(false);
        this.fnChangeStateOfControlsForTheStep(3, false);

        if (this.oMoreInfo.editableTable === "X") {
          this.oTableDefault.setSelectionMode(sap.ui.table.SelectionMode.MultiToggle);
          this.oBtnDeleteTableDefault.setVisible(true);
        } else {
          this.oTableDefault.setSelectionMode(sap.ui.table.SelectionMode.None);
          this.oBtnDeleteTableDefault.setVisible(false);
        }
      },

      onPressBackToVatScenarios: function () {
        // When you return to the previous step, enable all controls
        this.fnChangeStateOfControlsForTheStep(2, true);

        // Clear inputs for the current step, when you return to the previous step
        this.fnClearInputsForStep(3);
        this.oBtnValidateTaxAttr.setVisible(false);

        this.oWizard.previousStep();
        this.oBtnBackToStep1.setVisible(true);
      },

      // Step 4 --------------------------------------------
      validateReceiverTaxName: function () {
        this.oStepConditionTypes.setValidated(false);

        if (this.oIptReceiverTaxName.getValue().length !== 0 && this.oIptReceiverTaxName.getValue().length >=4) {
          this.oStepConditionTypes.setValidated(true);
        } else {
          this.oStepConditionTypes.setValidated(false);
        }
      },

      fnOrderData: function () {
        data = Methods.fnSetDataForReview(
          this.oTableDefault, this.oTableReview,
          this.oCbxCountryKey.getValue(), this.oTableDefault.getModel().oData[0].kalsm,
          this.oCbxTaxType.getSelectedKey(), this.oIptTaxCodeId.getValue(),
          this.oIptTaxName.getValue(), this.oCbxTaxJur.getValue(),
          this.oCbxVatScenarios.getValue(), this.oChkCheckId.getSelected(),
          this.oCbxTargetTaxCode.getValue(), this.oCbxEuCode.getValue(),
          this.oCbxReportCountry.getValue(), this.oIptTolerance.getValue()
        );

        if (this.oMoreInfo.scenAdd !== "") {
          data_tgt = Methods.fnSetDataForReview(
            this.oTableDeferred, this.oTableReviewDeferred,
            this.oCbxCountryKey.getValue(), this.oTableDeferred.getModel().oData[0].kalsm,
            this.oCbxTaxType.getSelectedKey(), this.oCbxTargetTaxCode.getValue(),
            this.oIptReceiverTaxName.getValue(), this.oCbxTaxJur.getValue(),
            this.oMoreInfo.scenAdd, this.oChkCheckId.getSelected(),
            "", this.oCbxEuCode.getValue(),
            this.oCbxReportCountry.getValue(), this.oIptTolerance.getValue()
          );
        }
      },

      onCompleteConditionTypes: function () {
        this.fnChangeStateOfControlsForTheStep(4, false);
        this.oBtnBackToStep3.setVisible(false);

        this.fnOrderData();

        this.oStepReviewAll.setModel(new JSONModel(data.header));
        this.oTableReview.setModel(new JSONModel(data.schema));
        this.oTableReviewDeferred.setModel(new JSONModel(data_tgt));

        this.oTableDefault.setSelectionMode(sap.ui.table.SelectionMode.None);
        this.oBtnDeleteTableDefault.setVisible(false);
      },

      onPressBackToStepTaxAttr: function () {
        // When you return to the previous step, enable all controls
        this.fnChangeStateOfControlsForTheStep(3, true);

        // Clear inputs for the current step, when you return to the previous step
        // Show MessageBox here !!!!!!!
        this.fnClearInputsForStep(4);

        this.oStepTaxAttr.setValidated(false);

        this.oWizard.previousStep();
        this.oBtnBackToStep2.setVisible(true);
        this.oBtnValidateTaxAttr.setVisible(true);
      },

      onPressDeleteConditionTypes: function () {
        let oTable = this.oTableDefault;
        let indices = oTable.getSelectedIndices();
        let tableData = oTable.getModel().oData;
        let model;

        if (tableData.length > indices.length) {
          indices
            .slice()
            .reverse()
            .forEach((index) => {
              tableData.splice(index, 1);
            });
          model = new JSONModel(tableData);
          this.oTableDefault.mProperties.visibleRowCount = tableData.length;
          this.oTableDefault.setModel(model);
        }
      },

      // Step 5 --------------------------------------------
      onPressBackToSetConditionTypes: function () {
        // When you return to the previous step, enable all controls
        this.fnChangeStateOfControlsForTheStep(4, true);
        this.oWizard.previousStep();
        this.oBtnBackToStep3.setVisible(true);

        if (this.oMoreInfo.editableTable === "X") {
          this.oBtnDeleteTableDefault.setVisible(true);
          this.oTableDefault.setSelectionMode(sap.ui.table.SelectionMode.MultiToggle);
        } else {
          this.oBtnDeleteTableDefault.setVisible(false);
        }
      },

      onComplete: function () {
        this._pBusyDialog.then(
          function (oBusyDialog) {
            oBusyDialog.open(); // Open busy dialog when Submit button is clicked

            this.final_data = {
              data,
              data_tgt,
            };

            this.sUrl = Methods.fnBuildUrl(Constants._oUrlCodes.postCreateTaxCode);
            fetch(this.sUrl, {
              method: "POST",
              headers: {
                "Content-Type": "text/plain",
              },
              body: JSON.stringify(this.final_data),
            })
              .then((response) => response.json())
              .then((data) => {
                // After a successful creation, the busy dialog closes and
                // displays a MessageBox indicating that it has been created and the transport code.

                if (data[0].status_code === "S") {
                  MessageBox.success("The tax code has been created successfully", {
                    actions: [MessageBox.Action.OK],
                    onClose: function (sAction) {
                      if (sAction === "OK") {
                        window.location.reload();
                      }
                    },
                  });
                } else {
                  MessageBox.error(`${data[0].status_message}`);
                }

                this._pBusyDialog.then(function (oBusyDialog) {
                  oBusyDialog.close();
                });
              });
          }.bind(this)
        );
      },
    });
  }
);
