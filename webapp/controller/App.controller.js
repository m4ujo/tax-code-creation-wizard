sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageBox'
  ],
  function (Controller, JSONModel, MessageBox) {
    'use strict'

    const DOMAIN = 'https://usalspgsa660.na.pg.com:8443'
    const REGEX_SPACES = /\s/g
    // const REGEX_LETTERS = /[^.\d]/g
    const URL_CODES = [
      'GET_TAX_COUNTRY_LIST',
      'GET_TAX_TYPES_LIST',
      'GET_TAX_SCENARIOS',
      'GET_TAX_FIELDSTATUS',
      'GET_TAXJUR_LIST',
      'GET_SAP_COUNTRY_LIST',
      'GET_EUCODE_LIST',
      'GET_TAX_CODES_LIST',
      'GET_TAX_PROCEDURE',
      'CHECK_TAX_CODE'
    ]

    let data = []
    let url = ''

    return Controller.extend('taco.controller.App', {
      onInit: function () {
        const oViewModel = new sap.ui.model.json.JSONModel(
          {
            number: 0
          },
          true
        )
        this.getView().setModel(oViewModel, 'viewModel')

        // Get elemets by ID
        this.oWizard = this.byId('tacoWizard')
        this.oNavContainer = this.byId('wizardNavContainer')
        this.oWizardContentPage = this.byId('taxCodeWizardPage')
        // Step 1
        this.oCbxCountryKey = this.byId('cbx-countryKey')
        this.oCbxTaxType = this.byId('cbx-taxType')
        // Step 2
        this.oCbxVatScenarios = this.byId('cbx-vatScenarios')
        // Step 3
        this.oIptTaxCodeId = this.byId('input-taxCodeId')
        this.oIptTaxName = this.byId('input-taxName')
        this.oChkCheckId = this.byId('chk-checkId')
        this.oCbxTaxJur = this.byId('cbx-taxJur')
        this.oCbxReportCountry = this.byId('cbx-reportCountry')
        this.oCbxEuCode = this.byId('cbx-euCode')
        this.oCbxTargetTaxCode = this.byId('cbx-targetTaxCode')
        this.oIptTolerance = this.byId('input-tolerance')
        // Step 4
        this.oTableRevTaxRates = this.byId('table-revTaxRates')

        url = this.buildUrl(URL_CODES[0])
        this.getDataJSON(url, this.oCbxCountryKey)

        url = this.buildUrl(URL_CODES[1])
        this.getDataJSON(url, this.oCbxTaxType)

        this.finalData = {}
      },

      // Utils
      onInputLiveChange: function (oEvt) {
        const oControl = oEvt.getSource()
        this.validateFloatInput(oControl)
      },
      onInputChange: function (oEvent) {
        const oControl = oEvent.getSource()
        this.validateFloatInput(oControl)
      },
      validateFloatInput: function (oControl) {
        const oBinding = oControl.getBinding('value')
        const oValue = oControl.getValue()
        try {
          const oParsedValue = oBinding
            .getType()
            .parseValue(oValue, oBinding.sInternalType)
          if (oParsedValue) {
            oControl.setValueState(sap.ui.core.ValueState.None)
          } else {
            oControl.setValueState(sap.ui.core.ValueState.Error)
          }
        } catch (ex) {
          oControl.setValueState(sap.ui.core.ValueState.Error)
        }
      },
      buildUrl: function (code, ...params) {
        let url = `${DOMAIN}/pg_itx?sap-client=400&code=${code}`
        if (params) {
          params.forEach((param) => {
            url += `&${param.type}=${param.value}`
          })
        }
        return url
      },
      getDataJSON: function (url, ...obj) {
        const fSetData = this.setData
        const fDataNotFound = this.dataNotFound
        $.ajax({
          url,
          crossDomain: true,
          method: 'GET',
          success: function (response) {
            fSetData(response, obj[0])
          },
          error: function (a, b, c) {
            console.log('JSON not found')
            fDataNotFound(obj[0])
          }
        })
      },
      setData: function (response, obj) {
        // callback function
        if (response.data) {
          data = response.data
        } else {
          data = response[0]
        }
        if (obj) {
          obj.setModel(new JSONModel(data))
        }
      },
      dataNotFound: function (obj) {
        data = []
        if (obj) {
          obj.setModel(new JSONModel())
        }
      },
      backToWizardContent: function () {
        this.oNavContainer.backToPage(this._oWizardContentPage.getId())
      },
      _handleNavigationToStep: function (iStepNumber) {
        const fnAfterNavigate = function () {
          this.oWizard.goToStep(this.oWizard.getSteps()[iStepNumber])
          this.oNavContainer.detachAfterNavigate(fnAfterNavigate)
        }.bind(this)

        this.oNavContainer.attachAfterNavigate(fnAfterNavigate)
        this.backToWizardContent()
      },

      // Tax Properties - Step 1
      validateTaxProperties: function () {
        const sCountryKey = this.oCbxCountryKey
          .getValue()
          .replace(REGEX_SPACES, '')
        const sTaxType = this.oCbxTaxType.getSelectedKey()

        this.oWizard.invalidateStep(this.byId('step-taxProperties'))

        if (sCountryKey !== '' && sTaxType !== '') {
          url = this.buildUrl(
            URL_CODES[2],
            { type: 'land1', value: sCountryKey },
            { type: 'mwart', value: sTaxType }
          )
          this.getDataJSON(url)
        }

        setTimeout(() => {
          if (data.length === 0) {
            this.oWizard.invalidateStep(this.byId('step-taxProperties'))
            MessageBox.error(
              'No scenarios were found, for the entered values.'
            )
          } else if (sCountryKey === '' || sTaxType === '') {
            this.oWizard.invalidateStep(this.byId('step-taxProperties'))
          } else if (sTaxType !== 'A' && sTaxType !== 'V') {
            this.oWizard.invalidateStep(this.byId('step-taxProperties'))
          } else if (sCountryKey.length !== 2 || sTaxType.length !== 1) {
            this.oWizard.invalidateStep(this.byId('step-taxProperties'))
          } else {
            this.oWizard.validateStep(this.byId('step-taxProperties'))
          }
        }, 1500)
      },
      completeTaxProperties: function () {
        this.oCbxCountryKey.setEnabled(false)
        this.oCbxTaxType.setEnabled(false)
        this.oCbxVatScenarios.setModel(new JSONModel(data))
        data = []
      },

      // Vat Scenario - Step 2
      validateVatScenario: function () {
        this.oWizard.invalidateStep(this.byId('step-vatScenarios'))
        const sVatScenario = this.oCbxVatScenarios
          .getValue()
          .replace(REGEX_SPACES, '')

        if (sVatScenario !== '') {
          url = this.buildUrl(
            URL_CODES[3],
            { type: 'land1', value: this.oCbxCountryKey.getValue() },
            { type: 'mwart', value: this.oCbxTaxType.getSelectedKey() },
            { type: 'scen', value: sVatScenario }
          )
          this.getDataJSON(url)
        }

        setTimeout(() => {
          if (data.length === 0) {
            MessageBox.error(
              'Fieldstatus data not found, for the entered scenario.'
            )
            this.oWizard.invalidateStep(this.byId('step-vatScenarios'))
          } else {
            this.oWizard.validateStep(this.byId('step-vatScenarios'))
          }
        }, 1500)
      },
      completeVatScenarios: function () {
        data.forEach((x) => {
          const field = this.byId(`field-${x.fieldname}`)
          if (field) {
            field.setVisible(true)
            if (x.fieldname === 'CHECKID' && x.default_value === 'X') {
              this.oChkCheckId.setSelected(true)
            }
            if (x.scr_status === 'R') {
              const inputProperties =
                field.mAggregations.content[1].mProperties
              inputProperties.required = true
            } else if (x.scr_status === 'S') {
              field.setVisible(false)
            }

            if (x.scr_status === 'R' || x.scr_status === 'O') {
              data = []
              if (x.fieldname === 'TAXJURISDICTION') {
                url = this.buildUrl(URL_CODES[4], {
                  type: 'land1',
                  value: this.oCbxCountryKey.getValue()
                })
                this.getDataJSON(url, this.oCbxTaxJur)
              }
              if (x.fieldname === 'TAXRETURNCOUNTRY') {
                url = this.buildUrl(URL_CODES[5])
                this.getDataJSON(url, this.oCbxReportCountry)
              }
              if (x.fieldname === 'EUTAXCLASSIFICATION') {
                url = this.buildUrl(URL_CODES[6])
                this.getDataJSON(url, this.oCbxEuCode)
              }
              if (x.fieldname === 'EUTAXCLASSIFICATION') {
                url = this.buildUrl(URL_CODES[7], {
                  type: 'land1',
                  value: this.oCbxCountryKey.getValue()
                })
                this.getDataJSON(url, this.oCbxTargetTaxCode)
              }
            }
          }
        })

        this.oCbxVatScenarios.setEnabled(false)

        this.oIptTaxCodeId.setValue('')
        this.oIptTaxName.setValue('')
        this.oIptTolerance.setValue(0)

        this.byId('button-backToStep1').setVisible(false)
      },
      backToStep1: function () {
        url = this.buildUrl(
          URL_CODES[2],
          { type: 'land1', value: this.oCbxCountryKey.getValue() },
          { type: 'mwart', value: this.oCbxTaxType.getSelectedKey() }
        )
        this.getDataJSON(url)
        this.oCbxVatScenarios.setModel(new JSONModel())
        this.oCbxCountryKey.setEnabled(true)
        this.oCbxTaxType.setEnabled(true)
        this.oWizard.previousStep()
      },

      // Tax Attr - Step 3
      validateTaxAttr: function () {
        this.oWizard.invalidateStep(this.byId('step-taxAttr'))

        if (this.oIptTaxCodeId.getValue().length === 2) {
          data = []
          url = this.buildUrl(
            URL_CODES[9],
            { type: 'land1', value: this.oCbxCountryKey.getValue() },
            { type: 'mwskz', value: this.oIptTaxCodeId.getValue() }
          )
          this.getDataJSON(url)
        }

        setTimeout(() => {
          if (
            this.oIptTaxCodeId.getValue() === '' ||
            this.oIptTaxName.getValue() === '' ||
            this.oIptTolerance.getValue() < 0 ||
            this.oIptTolerance.getValue() > 100 ||
            this.oIptTaxCodeId.getValue().length !== 2
          ) {
            this.oWizard.invalidateStep(this.byId('step-taxAttr'))
          } else {
            this.oWizard.validateStep(this.byId('step-taxAttr'))
          }
        }, 1500)
      },
      completeTaxAttr: function () {
        if (data.status_code === 'E') {
          MessageBox.error(`${data.status_message}`)
          this.oWizard.invalidateStep(this.byId('step-taxAttr'))
          this.oWizard.discardProgress(this.oWizard.getSteps()[2])
          this._handleNavigationToStep(3)
        }

        data = []
        url = this.buildUrl(
          URL_CODES[8],
          { type: 'land1', value: this.oCbxCountryKey.getValue() },
          { type: 'mwart', value: this.oCbxTaxType.getSelectedKey() },
          { type: 'scen', value: this.oCbxVatScenarios.getValue() }
        )
        this.getDataJSON(url, this.oTableRevTaxRates)
        this.byId('button-backToStep1').setVisible(false)
        this.byId('button-backToStep2').setVisible(false)

        this.oIptTaxCodeId.setEnabled(false)
        this.oIptTaxName.setEnabled(false)
        this.oChkCheckId.setEnabled(false)
        this.oCbxReportCountry.setEnabled(false)
        this.oCbxEuCode.setEnabled(false)
        this.oCbxTargetTaxCode.setEnabled(false)
        this.oIptTolerance.setEnabled(false)
      },
      backToStep2: function () {
        this.oCbxVatScenarios.setEnabled(true)
        this.byId('button-backToStep1').setVisible(true)
        this.oWizard.previousStep()
        data = []
      },

      // Review Condition Types - Step 4
      completeConditionTypes: function () {
        this.byId('button-backToStep2').setVisible(false)

        const headerData = {
          countryKey: this.oCbxCountryKey.getValue(),
          taxType: this.oCbxTaxType.getSelectedKey(),
          vatTaxScenario: this.oCbxVatScenarios.getValue(),
          taxCodeId: this.oIptTaxCodeId.getValue(),
          taxName: this.oIptTaxName.getValue(),
          taxJur: this.oCbxTaxJur.getValue(),
          checkId: this.oChkCheckId.getSelected(),
          reportCountry: this.oCbxReportCountry.getValue(),
          euCode: this.oCbxEuCode.getValue(),
          targetTaxCode: this.oCbxTargetTaxCode.getValue(),
          tolerance: this.oIptTolerance.getValue()
        }
        const schemaData = []

        this.oTableRevTaxRates.getRows().forEach((row) => {
          const schemaTemp = {
            conditionType: row.getCells()[0].getText(),
            description: row.getCells()[1].getText(),
            taxProcedure: row.getCells()[2].getText(),
            position: row.getCells()[3].getText(),
            accountKey: row.getCells()[4].getText(),
            rate: row.getCells()[5].getValue()
          }
          schemaData.push(schemaTemp)
        })

        this.finalData = {
          header: headerData,
          schema: schemaData
        }

        this.byId('step-reviewAll').setModel(new JSONModel(this.finalData))

        console.log(this.byId('step-reviewAll'))
      },
      backToStep3: function () {
        this.oWizard.previousStep()
        this.byId('button-backToStep2').setVisible(true)
        this.oIptTaxCodeId.setEnabled(true)
        this.oIptTaxName.setEnabled(true)
        this.oChkCheckId.setEnabled(true)
        this.oCbxReportCountry.setEnabled(true)
        this.oCbxEuCode.setEnabled(true)
        this.oCbxTargetTaxCode.setEnabled(true)
        this.oIptTolerance.setEnabled(true)
        data = []
      },

      onComplete: function () {
        console.log('Terminado')
        this.oNavContainer.to(this.byId('taxCodeReviewPage'))
      }
    })
  }
)
