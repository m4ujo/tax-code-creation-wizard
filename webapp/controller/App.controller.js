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

    let data = {},
      data_tgt = {};

    return Controller.extend("taco.controller.App", {
      /**
       * Get all elements of the views by ID
       * Init busy dialog for the final step
       * @function
       * @name onInit
       */
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

      /**
       * Get all elements of the views by ID
       * Init busy dialog for the final step
       * @function
       * @name fnChangeStateOfControl
       * @param {Number} iStep Wizard step number
       * @param {Boolean} bState Boolean param for disable and enable controls
       */
      fnChangeStateOfControl: function (iStep, bState) {
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

      /**
       * Get all elements of the views by ID
       * Init busy dialog for the final step
       * @function
       * @name fnClearInputs
       * @param {Number} iStep Wizard step number
       */
      fnClearInputs: function (iStep) {
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
       * Get data from request URL: Countries
       * Put data in the combobox that corresponds to the country selection
       * @function
       * @name fnGetCountries
       */
      fnGetCountries: async function () {
        // Build URL for request data
        this.sUrl = Methods.fnBuildUrl(Constants._oUrlCodes.getTaxCountry);

        // If no exceptions are found, request the data and put a new model in this.oCbxCountry
        try {
          this.oResponse = await fetch(this.sUrl).then((oResponse) => oResponse.json());
          this.oCbxCountryKey.setModel(new JSONModel(this.oResponse.data));
        } catch (error) {
          MessageBox.error("Server cannot respond to the request.", {
            details: `
              <span>
                <strong>URL:</strong> <a href="${this.sUrl}">${Constants._oUrlCodes.getTaxCountry}</a>
              </span>
            `,
          });
        }
      },

      /**
       * Get data from request URL: Tax Types
       * Put data in the combobox that corresponds to the tax type selection
       * @function
       * @name fnGetTaxTypes
       */
      fnGetTaxTypes: async function () {
        this.sUrl = Methods.fnBuildUrl(Constants._oUrlCodes.getTaxType);
        try {
          this.oResponse = await fetch(this.sUrl).then((oResponse) => oResponse.json());
          this.oCbxTaxType.setModel(new JSONModel(this.oResponse.data));
        } catch (error) {
          MessageBox.error("Server cannot respond to the request.", {
            details: `
              <span>
                <strong>URL:</strong> <a href="${this.sUrl}">${Constants._oUrlCodes.getTaxType}</a>
              </span>
            `,
          });
        }
      },

      /**
       * Set fields as required and make queries that don't require parameters
       * @function
       * @name initTaxProperties
       */
      initTaxProperties: function () {
        Methods.fnSetMandatoryField(this.oCbxCountryKey);
        Methods.fnSetMandatoryField(this.oCbxTaxType);

        this.fnGetCountries();
        this.fnGetTaxTypes();
      },

      /**
       * Get data from request URL: VAT Scenarios
       * Put data in the combobox that corresponds to the VAT Scenarios selection
       * @function
       * @name fnGetVatScenarios
       */
      fnGetVatScenarios: async function () {
        this.sUrl = Methods.fnBuildUrl(
          Constants._oUrlCodes.getTaxScenarios,
          { type: "land1", value: this.oCbxCountryKey.getValue() },
          { type: "mwart", value: this.oCbxTaxType.getSelectedKey() }
        );
        try {
          this.oResponse = await fetch(this.sUrl).then((oResponse) => oResponse.json());

          if (this.oResponse.data.length === 0) {
            MessageBox.error("No scenarios were found, for the entered values.");
          } else {
            this.oCbxVatScenarios.setModel(new JSONModel(this.oResponse.data));
            // Show next step button
            this.oStepTaxProperties.setValidated(true);
          }
        } catch (error) {
          MessageBox.error("Server cannot respond to the request.", {
            details: `
              <span>
                <strong>URL:</strong> <a href="${this.sUrl}">${Constants._oUrlCodes.getTaxScenarios}</a>
              </span>
            `,
          });
          this.oStepTaxProperties.setValidated(false);
        }
      },

      /**
       * Override step by default
       * Validate field state
       * Validate content of the inputs
       * @function
       * @name validateTaxProperties
       * @param {Object} oEvent Event object of control
       */
      validateTaxProperties: function (oEvent) {
        this.oStepTaxProperties.setValidated(false);

        Methods.fnChangeValueState(oEvent);

        if (Validations.fnValidStep1(this.oCbxCountryKey, this.oCbxTaxType)) {
          this.fnGetVatScenarios();
        }
      },

      /**
       * When the first step is finished
       * Disable controls for first step
       * @function
       * @name completeTaxProperties
       */
      completeTaxProperties: function () {
        this.fnChangeStateOfControl(1, false);
      },

      /**
       * Set fields as required
       * @function
       * @name initVatScenarios
       */
      initVatScenarios: function () {
        // Set the status value to error
        Methods.fnSetMandatoryField(this.oCbxVatScenarios);
      },

      /**
       * Get flags from master country table
       * @function
       * @name fnGetMoreInfo
       */
      fnGetMoreInfo: function () {
        let sAutoDeftax = "";

        this.oCbxCountryKey.getModel().oData.forEach((oCountry) => {
          if (oCountry.land1 === this.oCbxCountryKey.getValue()) sAutoDeftax = oCountry.auto_deftax;
        });

        this.oCbxVatScenarios.getModel().oData.forEach((oScenario) => {
          if (oScenario.scen === this.oCbxVatScenarios.getValue())
            this.oMoreInfo = {
              scenAdd: oScenario.scen_add,
              deftaxScen: oScenario.deftax_scen,
              autoDeftax: sAutoDeftax,
              editableTable: oScenario.allw_excl_kschl,
            };
        });
      },

      /**
       * Get data from request URL: Condition Types
       * Put data in the table that corresponds to the Condition Types
       * Put data in the table that corresponds to the Condition Types Deferred
       * @function
       * @name fnGetConditionTypes
       * @param {String} sScenario To identify if the deferred tax table should be displayed
       */
      fnGetConditionTypes: async function (sScenario) {
        this.sUrl = Methods.fnBuildUrl(
          Constants._oUrlCodes.getTaxProcedures,
          { type: "land1", value: this.oCbxCountryKey.getValue() },
          { type: "mwart", value: this.oCbxTaxType.getSelectedKey() },
          { type: "scen", value: sScenario }
        );

        try {
          this.oResponse = await fetch(this.sUrl).then((oResponse) => oResponse.json());

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
            `,
          });
          this.oStepVatScenarios.setValidated(false);
        }
      },

      /**
       * Get data from request URL: Check field status
       * The data collected is to evaluate if a field from step 3 is mandatory or optional
       * @function
       * @name fnGetFieldStatus
       */
      fnGetFieldStatus: async function () {
        this.sUrl = Methods.fnBuildUrl(
          Constants._oUrlCodes.getTaxFieldstatus,
          { type: "land1", value: this.oCbxCountryKey.getValue() },
          { type: "mwart", value: this.oCbxTaxType.getSelectedKey() },
          { type: "scen", value: this.oCbxVatScenarios.getValue() }
        );

        try {
          this.oResponse = await fetch(this.sUrl).then((oResponse) => oResponse.json());

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
            `,
          });
          this.oStepVatScenarios.setValidated(false);
        }
      },

      /**
       * Override step by default
       * Validate field state
       * Validate content of the inputs
       * @function
       * @name validateVatScenarios
       * @param {Object} oEvent Event object of control
       */
      validateVatScenarios: function (oEvent) {
        this.oStepVatScenarios.setValidated(false);

        Methods.fnChangeValueState(oEvent);

        if (Validations.fnValidStep2(this.oCbxVatScenarios)) {
          this.fnGetConditionTypes(this.oCbxVatScenarios.getValue());
          this.fnGetMoreInfo();
          if (this.oMoreInfo.scenAdd !== "") {
            this.fnGetConditionTypes(this.oMoreInfo.scenAdd);
          }
        }
      },

      /**
       * When the step 2 is completed
       * Disable controls for second step
       * Make button for back to first step invisible
       * Check field status
       * @function
       * @name completeVatScenarios
       */
      completeVatScenarios: function () {
        this.fnChangeStateOfControl(2, false);
        this.oBtnBackToStep1.setVisible(false);
        Methods.fnCheckFieldStatus(this, this.aFieldStatus);
      },

      /**
       * When you return to the previous step
       * Enable all controls for first step
       * Clear inputs for second step
       * @function
       * @name onPressBackToTaxProperties
       */
      onPressBackToTaxProperties: function () {
        this.fnChangeStateOfControl(1, true);
        this.fnClearInputs(2);
        this.oWizard.previousStep();
      },

      /**
       * Get data from request URL: Tax Jurisdiction
       * Put data in the combobox that corresponds to the Tax Jurisdiction selection
       * @function
       * @name fnGetTaxJurisdiction
       */
      fnGetTaxJurisdiction: async function () {
        this.sUrl = Methods.fnBuildUrl(Constants._oUrlCodes.getTaxJur, { type: "land1", value: this.oCbxCountryKey.getValue() });

        try {
          this.oResponse = await fetch(this.sUrl).then((oResponse) => oResponse.json());
          this.oCbxTaxJur.setModel(new JSONModel(this.oResponse.data));
        } catch (error) {
          MessageBox.error("Server cannot respond to the request.", {
            details: `
              <span>
                <strong>URL:</strong> <a href="${this.sUrl}">${Constants._oUrlCodes.getTaxJur}</a>
              </span>
            `,
          });
        }
      },

      /**
       * Get data from request URL: Target Tax Codes
       * Put data in the combobox that corresponds to the Target Tax Codes selection
       * @function
       * @name fnGetTaxCodes
       */
      fnGetTaxCodes: async function () {
        this.sUrl = Methods.fnBuildUrl(Constants._oUrlCodes.getTaxCodes, { type: "land1", value: this.oCbxCountryKey.getValue() });
        try {
          this.oResponse = await fetch(this.sUrl).then((oResponse) => oResponse.json());
          this.oCbxTargetTaxCode.setModel(new JSONModel(this.oResponse.data));
        } catch (error) {
          MessageBox.error("Server cannot respond to the request.", {
            details: `
              <span>
                <strong>URL:</strong> <a href="${this.sUrl}">${Constants._oUrlCodes.getTaxCodes}</a>
              </span>
            `,
          });
        }
      },

      /**
       * Get data from request URL: Reporting countries
       * Put data in the combobox that corresponds to the reporting countries selection
       * @function
       * @name fnGetReportingCountries
       */
      fnGetReportingCountries: async function () {
        this.sUrl = Methods.fnBuildUrl(Constants._oUrlCodes.getReportCountries);
        try {
          this.oResponse = await fetch(this.sUrl).then((oResponse) => oResponse.json());
          this.oCbxReportCountry.setModel(new JSONModel(this.oResponse.data));
        } catch (error) {
          MessageBox.error("Server cannot respond to the request.", {
            details: `
                    <span>
                      <strong>URL:</strong> <a href="${this.sUrl}">${Constants._oUrlCodes.getReportCountries}</a>
                    </span>
                  `,
          });
        }
      },

      /**
       * Get data from request URL: EU Codes
       * Put data in the combobox that corresponds to the EU codes selection
       * @function
       * @name fnGetEuCodes
       */
      fnGetEuCodes: async function () {
        this.sUrl = Methods.fnBuildUrl(Constants._oUrlCodes.getEuCodes);
        try {
          this.oResponse = await fetch(this.sUrl).then((oResponse) => oResponse.json());
          this.oCbxEuCode.setModel(new JSONModel(this.oResponse.data));
        } catch (error) {
          MessageBox.error("Server cannot respond to the request.", {
            details: `
                    <span>
                      <strong>URL:</strong> <a href="${this.sUrl}">${Constants._oUrlCodes.getEuCodes}</a>
                    </span>
                  `,
          });
        }
      },

      /**
       * Start step, making requests and filling out models for comboboxes
       * @function
       * @name initTaxAttr
       */
      initTaxAttr: function () {
        this.fnGetTaxJurisdiction();
        this.fnGetTaxCodes();
        this.fnGetReportingCountries();
        this.fnGetEuCodes();
      },

      /**
       * Make a request to validate if the tax code is accepted
       * @function
       * @name fnCheckTaxCode
       */
      fnCheckTaxCode: async function () {
        this.sUrl = Methods.fnBuildUrl(
          Constants._oUrlCodes.checkTaxCode,
          { type: "land1", value: this.oCbxCountryKey.getValue() },
          { type: "mwskz", value: this.oIptTaxCodeId.getValue().toUpperCase() },
          { type: "txjcd", value: this.oCbxTaxJur.getValue() }
        );

        try {
          this.oResponse = await fetch(this.sUrl).then((oResponse) => oResponse.json());

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
            `,
          });
        }
      },

      /**
       * Make a request to validate if the case is deferred and if so, show the table and the additional input
       * @function
       * @name fnCheckDeferredTaxInfo
       */
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
          this.oResponse = await fetch(this.sUrl).then((oResponse) => oResponse.json());

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
            `,
          });
        }
      },

      /**
       * Override step by default
       * Validate field state
       * Validate content of the inputs
       * @function
       * @name validateTaxAttr
       * @param {Object} oEvent Event object of control
       */
      validateTaxAttr: function (oEvent) {
        this.oStepTaxAttr.setValidated(false);

        Methods.fnChangeValueState(oEvent);

        let bValidated = Validations.fnValidStep3(
          this.oIptTaxCodeId,
          this.oIptTaxName,
          this.oCbxTaxJur,
          this.oCbxReportCountry,
          this.oCbxTargetTaxCode
        );

        if (bValidated) {
          this.oBtnValidateTaxAttr.setVisible(true);
        } else {
          this.oBtnValidateTaxAttr.setVisible(false);
        }
      },

      /**
       * When "Check" button is pressed, make validations for all fields in the third step
       * @function
       * @name onPressValidateTaxAttr
       */
      onPressValidateTaxAttr: function () {
        this.fnCheckDeferredTaxInfo();
      },

      /**
       * When tax attributes step is finished
       * Make invisible "Check" button
       * Make invisible back to second step button
       * Disable all controls of third step
       * Validate if the table will need remove lines
       * @function
       * @name onPressValidateTaxAttr
       */
      completeTaxAttr: function () {
        this.oBtnValidateTaxAttr.setVisible(false);
        this.oBtnBackToStep2.setVisible(false);
        this.fnChangeStateOfControl(3, false);

        if (this.oMoreInfo.editableTable === "X") {
          this.oTableDefault.setSelectionMode(sap.ui.table.SelectionMode.MultiToggle);
          this.oBtnDeleteTableDefault.setVisible(true);
        } else {
          this.oTableDefault.setSelectionMode(sap.ui.table.SelectionMode.None);
          this.oBtnDeleteTableDefault.setVisible(false);
        }
      },

      /**
       * Event for back to the second step button
       * Enable all controls of the second step
       * Clear inputs for the current step (3)
       * Make invisible "Check" button
       * Show button back to first step
       * @function
       * @name onPressBackToVatScenarios
       */
      onPressBackToVatScenarios: function () {
        this.fnChangeStateOfControl(2, true);

        this.fnClearInputs(3);
        this.oBtnValidateTaxAttr.setVisible(false);

        this.oWizard.previousStep();
        this.oBtnBackToStep1.setVisible(true);
      },

      /**
       * If type of tax is deferred, validate additional input for receiver
       * Override current step by default
       * Make validations and show "Next" button
       * @function
       * @name validateReceiverTaxName
       */
      validateReceiverTaxName: function () {
        this.oStepConditionTypes.setValidated(false);

        if (this.oIptReceiverTaxName.getValue().length !== 0 && this.oIptReceiverTaxName.getValue().length >= 4) {
          this.oStepConditionTypes.setValidated(true);
        } else {
          this.oStepConditionTypes.setValidated(false);
        }
      },

      /**
       * Execute fnSetDataForReview(Methods.js) for each case
       * @function
       * @name fnOrderData
       */
      fnOrderData: function () {
        data = Methods.fnSetDataForReview(
          this.oTableDefault,
          this.oTableReview,
          this.oCbxCountryKey.getValue(),
          this.oTableDefault.getModel().oData[0].kalsm,
          this.oCbxTaxType.getSelectedKey(),
          this.oIptTaxCodeId.getValue(),
          this.oIptTaxName.getValue(),
          this.oCbxTaxJur.getValue(),
          this.oCbxVatScenarios.getValue(),
          this.oChkCheckId.getSelected(),
          this.oCbxTargetTaxCode.getValue(),
          this.oCbxEuCode.getValue(),
          this.oCbxReportCountry.getValue(),
          this.oIptTolerance.getValue()
        );

        if (this.oMoreInfo.scenAdd !== "") {
          data_tgt = Methods.fnSetDataForReview(
            this.oTableDeferred,
            this.oTableReviewDeferred,
            this.oCbxCountryKey.getValue(),
            this.oTableDeferred.getModel().oData[0].kalsm,
            this.oCbxTaxType.getSelectedKey(),
            this.oCbxTargetTaxCode.getValue(),
            this.oIptReceiverTaxName.getValue(),
            this.oCbxTaxJur.getValue(),
            this.oMoreInfo.scenAdd,
            this.oChkCheckId.getSelected(),
            "",
            this.oCbxEuCode.getValue(),
            this.oCbxReportCountry.getValue(),
            this.oIptTolerance.getValue()
          );
        }
      },

      /**
       * When fourth step is finished
       * Disable current controls (step 4)
       * Make invisible back to step 3 button
       * Execute fnOrderData, prepare for send
       * Set model of data
       * @function
       * @name completeConditionTypes
       */
      completeConditionTypes: function () {
        this.fnChangeStateOfControl(4, false);
        this.oBtnBackToStep3.setVisible(false);

        this.fnOrderData();

        this.oStepReviewAll.setModel(new JSONModel(data.header));
        this.oTableReview.setModel(new JSONModel(data.schema));
        this.oTableReviewDeferred.setModel(new JSONModel(data_tgt));

        this.oTableDefault.setSelectionMode(sap.ui.table.SelectionMode.None);
        this.oBtnDeleteTableDefault.setVisible(false); // Hide button of delete line
      },

      /**
       * When back to third step button is pressed
       * Enable controls of third step
       * Clear table data of current step
       * @function
       * @name onPressBackToStepTaxAttr
       */
      onPressBackToStepTaxAttr: function () {
        this.fnChangeStateOfControl(3, true);

        this.fnClearInputs(4);

        this.oStepTaxAttr.setValidated(false);

        this.oWizard.previousStep();
        this.oBtnBackToStep2.setVisible(true);
        this.oBtnValidateTaxAttr.setVisible(true);
      },

      /**
       * Get selected lines of table and delete if the delete line button is pressed
       * @function
       * @name onPressDeleteConditionTypes
       */
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

      /**
       * When back to fourth step button is pressed
       * Enable controls of step 4
       * Show back to step 3 button
       * @function
       * @name onPressBackToSetConditionTypes
       */
      onPressBackToSetConditionTypes: function () {
        this.fnChangeStateOfControl(4, true);
        this.oWizard.previousStep();
        this.oBtnBackToStep3.setVisible(true);

        // If the table is editable then show selection mode
        if (this.oMoreInfo.editableTable === "X") {
          this.oBtnDeleteTableDefault.setVisible(true);
          this.oTableDefault.setSelectionMode(sap.ui.table.SelectionMode.MultiToggle);
        } else {
          this.oBtnDeleteTableDefault.setVisible(false);
        }
      },

      /**
       * Make POST request for send all data to the server
       * @function
       * @name onComplete
       */
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
                /*
                  After a successful creation, the busy dialog closes and
                  displays a MessageBox indicating that it has been created.
                */
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

                // Close busy dialog
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
