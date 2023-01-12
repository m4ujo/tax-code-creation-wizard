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

        // Step 4
        this.oStepConditionTypes = this.byId("step-condition-types");
        this.oTableDefault = this.byId("table-default");
        this.oContainerTableDefault = this.byId("container-table-default");
        this.oTableDeferred = this.byId("table-deferred");
        this.oContainerTableDeferred = this.byId("container-table-deferred");
        this.oBtnBackToStep3 = this.byId("button-back-to-step3");

        // Step 5
        this.oStepReviewAll = this.byId("step-review-all");
        this.oTableReview = this.byId("table-review");
        this.oBtnBackToStep4 = this.byId("button-back-to-step4");

        this.aFinalDataPost = {};

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
          this.oTableDefault.getRows().forEach((row) => {
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
          this.oTableDefault.setModel(new JSONModel());
          this.oTableDefault.getRows().forEach((row) => {
            row.getCells()[5].setValue(0.0);
          });
        }
      },

      // Step 1 --------------------------------------------
      onInitTaxProperties: function () {
        // Set the status value to error
        this.oCbxCountryKey.setValueState(Constants.oValueState.Error);
        this.oCbxTaxType.setValueState(Constants.oValueState.Error);

        // Get data from request URL: Countries
        this.sUrl = Methods.fnBuildUrl(Constants._oUrlCodes.getTaxCountry);
        Methods.fnGetAjax(this.sUrl).then((response) => {
          this.oCbxCountryKey.setModel(new JSONModel(response.data));
        });

        // Get data from request URL: Tax Types
        this.sUrl = Methods.fnBuildUrl(Constants._oUrlCodes.getTaxType);
        Methods.fnGetAjax(this.sUrl).then((response) => {
          this.oCbxTaxType.setModel(new JSONModel(response.data));
        });
      },

      validateTaxProperties: function (oEvent) {
        // Set the step validation status to FALSE by default
        this.oStepTaxProperties.setValidated(false);

        // Make sure an item is chosen from the data list
        Methods.fnSetValueStateField(oEvent, "R");

        // Validate
        let oValidated = Validations.fnValidStep1(this.oCbxCountryKey, this.oCbxTaxType);

        if (oValidated.bValidated) {
          Methods.fnGetAjax(oValidated.sUrl).then((response) => {
            if (response.data.length !== 0) {
              this.oCbxVatScenarios.setModel(new JSONModel(response.data));
              this.oStepTaxProperties.setValidated(oValidated.bValidated);
            } else {
              MessageBox.error("No scenarios were found, for the entered values.", {
                details: `
                    <ul>
                      <li><strong>Country Key: </strong> ${this.oCbxCountryKey.getValue()}</li>
                      <li><strong>Tax Type: </strong> ${this.oCbxTaxType.getValue()}</li>
                    </ul>
                  `,
              });
            }
          });
        }
      },

      onCompleteTaxProperties: function () {
        // When the step is finished, disable all controls
        this.fnChangeStateOfControlsForTheStep(1, false);
      },

      // Step 2 --------------------------------------------
      onActivateStepVatScenarios: function () {
        // Set the status value to error
        this.oCbxVatScenarios.setValueState(Constants.oValueState.Error);
      },

      searchFieldStatus: function (oEvent) {
        // Set the step validation status to FALSE by default
        this.oStepVatScenarios.setValidated(false);

        // Make sure an item is chosen from the data list
        Methods.fnSetValueStateField(oEvent, "R");

        let oValidated = Validations.fnValidStep2(this.oCbxVatScenarios, this.oCbxCountryKey, this.oCbxTaxType);

        if (oValidated.bValidated) {
          Methods.fnGetAjax(oValidated.sUrl).then((response) => {
            if (response.data.length !== 0) {
              Validations.fnCheckFieldStatus(this, this.oChkCheckId, response.data);
              this.oStepVatScenarios.setValidated(oValidated.bValidated);
              this.oIptTaxName.setValueState(Constants.oValueState.Error);
            } else {
              MessageBox.error("Fieldstatus data not found, for the entered scenario.", {
                details: `
                  <ul>
                  <li><strong>Country Key: </strong> ${this.oCbxCountryKey.getValue()}</li>
                  <li><strong>Tax Type: </strong> ${this.oCbxTaxType.getSelectedKey()}</li>
                  <li><strong>VAT Tax Scenario: </strong> ${this.oCbxVatScenarios.getValue()}</li>
                  </ul>
                  `,
              });
            }
          });
        }
      },

      onCompleteVatScenarios: function () {
        // When the step is finished, disable all controls
        this.fnChangeStateOfControlsForTheStep(2, false);
        // Set visible false button for back to first step
        this.oBtnBackToStep1.setVisible(false);
      },

      onPressBackToTaxProperties: function () {
        // When you return to the previous step, enable all controls
        this.fnChangeStateOfControlsForTheStep(1, true);

        // Clear inputs for the current step, when you return to the previous step
        // Show MessageBox here !!!!!!!
        this.fnClearInputsForStep(2);

        this.oWizard.previousStep();
      },

      // Step 3 --------------------------------------------
      onActivateStepTaxAttr: function () {
        // Set the status value to error, checking the fieldstatus again
        let oValidated = Validations.fnValidStep2(this.oCbxVatScenarios, this.oCbxCountryKey, this.oCbxTaxType);
        Methods.fnGetAjax(oValidated.sUrl).then((response) => {
          Validations.fnCheckFieldStatus(this, this.oChkCheckId, response.data);
        });
        this.oIptTaxName.setValueState(Constants.oValueState.Error);

        // Get data from request URL: Tax Jurisdiction
        this.sUrl = Methods.fnBuildUrl(Constants._oUrlCodes.getTaxJur, {
          type: "land1",
          value: this.oCbxCountryKey.getValue(),
        });
        Methods.fnGetAjax(this.sUrl).then((response) => {
          this.oCbxTaxJur.setModel(new JSONModel(response.data));
        });

        // Get data from request URL: Tax Report Countries
        this.sUrl = Methods.fnBuildUrl(Constants._oUrlCodes.getReportCountries);
        Methods.fnGetAjax(this.sUrl).then((response) => {
          this.oCbxReportCountry.setModel(new JSONModel(response.data));
        });

        // Get data from request URL: EU Codes
        this.sUrl = Methods.fnBuildUrl(Constants._oUrlCodes.getEuCodes);
        Methods.fnGetAjax(this.sUrl).then((response) => {
          this.oCbxEuCode.setModel(new JSONModel(response.data));
        });

        // Get data from request URL: Target Tax Code
        this.sUrl = Methods.fnBuildUrl(Constants._oUrlCodes.getTaxCodes, {
          type: "land1",
          value: this.oCbxCountryKey.getValue(),
        });
        Methods.fnGetAjax(this.sUrl).then((response) => {
          this.oCbxTargetTaxCode.setModel(new JSONModel(response.data));
        });
      },

      validateTaxAttr: function (oEvent) {
        // Set the step validation status to FALSE by default
        this.oStepTaxAttr.setValidated(false);

        // Make sure an item is chosen from the data list
        Methods.fnSetValueStateField(oEvent, oEvent.getSource().mProperties.fieldStatus);

        let bValidated = Validations.fnValidStep3(this.oIptTaxCodeId, this.oIptTaxName, this.oCbxTaxJur, this.oCbxReportCountry, this.oCbxTargetTaxCode);

        if (bValidated && this.oIptTaxCodeId.getValue().length === 2) {
          this.oStepTaxAttr.setValidated(bValidated);
        }
      },

      onCompleteTaxAttr: function () {
        this.fnChangeStateOfControlsForTheStep(3, false);
        this.oBtnBackToStep2.setVisible(false);

        this.sUrl = Methods.fnBuildUrl(
          Constants._oUrlCodes.checkTaxCode,
          { type: "land1", value: this.oCbxCountryKey.getValue() },
          { type: "mwskz", value: this.oIptTaxCodeId.getValue() },
          { type: "txjcd", value: this.oCbxTaxJur.getValue() }
        );
        Methods.fnGetAjax(this.sUrl).then((response) => {
          const data = response[0];

          if (data.status_code === "E") {
            this.fnChangeStateOfControlsForTheStep(3, true);
            this.oBtnBackToStep2.setVisible(true);
            this.oWizard.previousStep();
            MessageBox.error(data.status_message);
          } else {
            this.sUrl = Methods.fnBuildUrl(
              Constants._oUrlCodes.getTaxProcedures,
              { type: "land1", value: this.oCbxCountryKey.getValue() },
              { type: "mwart", value: this.oCbxTaxType.getSelectedKey() },
              { type: "scen", value: this.oCbxVatScenarios.getValue() }
            );

            Methods.fnGetAjax(this.sUrl).then((response) => {
              if (response.success === "false") {
                this.fnChangeStateOfControlsForTheStep(3, true);
                this.oBtnBackToStep2.setVisible(true);
                this.oWizard.previousStep();
                MessageBox.error(response.msg);
              } else {
                this.oTableDefault.setModel(new JSONModel(response.data));
                // ***************************************** New valid for deferred tax
                this.header = Methods.fnBuildHeaderData(
                  this.oCbxCountryKey,
                  this.oCbxTaxType,
                  this.oIptTaxCodeId,
                  this.oIptTaxName,
                  this.oCbxTaxJur,
                  this.oCbxVatScenarios,
                  this.oChkCheckId,
                  this.oCbxTargetTaxCode,
                  this.oCbxEuCode,
                  this.oCbxReportCountry,
                  this.oIptTolerance,
                  response.data[0]
                );
                this.sUrl = Methods.fnBuildUrl(
                  Constants._oUrlCodes.checkDeferredTaxInfo,
                  { type: "land1", value: this.header.land1 },
                  { type: "kalsm", value: this.header.kalsm },
                  { type: "mwart", value: this.header.mwart },
                  { type: "mwskz", value: this.header.mwskz },
                  { type: "mwskz_name", value: this.header.mwskz_name },
                  { type: "txjcd", value: this.header.txjcd },
                  { type: "scen", value: this.header.scen },
                  { type: "pruef", value: this.header.pruef ? "X" : "" },
                  { type: "zmwsk", value: this.header.zmwsk },
                  { type: "egrkz", value: this.header.egrkz },
                  { type: "lstml", value: this.header.lstml },
                  { type: "tolerance", value: this.header.tolerance }
                );
                Methods.fnGetAjax(this.sUrl).then((data) => {
                  console.log(data[0]);
                  if ((data[0].auto_deftax === "X" && data[0].deftax_scen === "X") && data[0].status_code !== "E") {
                    console.log("Show new table");
                    this.oContainerTableDeferred.setVisible(true);
                  } else if ((data[0].auto_deftax === "" && data[0].deftax_scen === "") && data[0].status_code === "S") {
                    this.oStepTaxAttr.setValidated(false);
                  } else {
                    this.oStepTaxAttr.setValidated(false);
                    this.oContainerTableDeferred.setVisible(false);
                    this.fnChangeStateOfControlsForTheStep(3, true);
                    this.oBtnBackToStep2.setVisible(true);
                    this.oWizard.previousStep();
                    MessageBox.error(`${data[0].status_message}`);
                  }
                });
              }
            });
          }
        });
      },

      onPressBackToVatScenarios: function () {
        // When you return to the previous step, enable all controls
        this.fnChangeStateOfControlsForTheStep(2, true);

        // Clear inputs for the current step, when you return to the previous step
        // Show MessageBox here !!!!!!!
        this.fnClearInputsForStep(3);

        this.oWizard.previousStep();
        this.oBtnBackToStep1.setVisible(true);
      },

      // Step 4 --------------------------------------------
      onCompleteConditionTypes: function () {
        this.fnChangeStateOfControlsForTheStep(4, false);
        this.oBtnBackToStep3.setVisible(false);

        this.aFinalDataPost = Methods.fnSetDataForReview(
          this.oCbxCountryKey,
          this.oCbxTaxType,
          this.oIptTaxCodeId,
          this.oIptTaxName,
          this.oCbxTaxJur,
          this.oCbxVatScenarios,
          this.oChkCheckId,
          this.oCbxTargetTaxCode,
          this.oCbxEuCode,
          this.oCbxReportCountry,
          this.oIptTolerance,
          this.oTableDefault,
          this.oTableReview
        );

        this.oStepReviewAll.setModel(new JSONModel(this.aFinalDataPost));
      },

      onPressBackToStepTaxAttr: function () {
        // When you return to the previous step, enable all controls
        this.fnChangeStateOfControlsForTheStep(3, true);

        // Clear inputs for the current step, when you return to the previous step
        // Show MessageBox here !!!!!!!
        this.fnClearInputsForStep(4);

        this.oWizard.previousStep();
        this.oBtnBackToStep2.setVisible(true);
      },

      onPressDeleteConditionTypes: function () {
        let oTable = this.oTableDefault;
        let selectedRows = oTable.getSelectedIndices();
        MessageToast.show(`${selectedRows}`);
      },

      // Step 5 --------------------------------------------
      onPressBackToSetConditionTypes: function () {
        // When you return to the previous step, enable all controls
        this.fnChangeStateOfControlsForTheStep(4, true);
        this.oWizard.previousStep();
        this.oBtnBackToStep3.setVisible(true);
      },

      onComplete: function () {
        console.log(this.aFinalDataPost);

        this._pBusyDialog.then(
          function (oBusyDialog) {
            oBusyDialog.open(); // Open busy dialog when Submit button is clicked

            this.sUrl = Methods.fnBuildUrl(Constants._oUrlCodes.postCreateTaxCode);
            fetch(this.sUrl, {
              method: "POST",
              headers: {
                "Content-Type": "text/plain",
              },
              body: JSON.stringify(this.aFinalDataPost),
            })
              .then((response) => response.json())
              .then((data) => {
                // After a successful creation, the busy dialog closes and
                // displays a MessageBox indicating that it has been created and the transport code.

                console.log(data);

                if (data.status_code === "S") {
                  MessageBox.success(`The tax code has been created successfully`, {
                    actions: [MessageBox.Action.OK],
                    onClose: function (sAction) {
                      if (sAction === "OK") {
                        window.location.reload();
                      }
                    },
                  });
                } else {
                  MessageBox.error(`${data.status_message}`);
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
