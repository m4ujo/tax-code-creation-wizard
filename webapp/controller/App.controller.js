sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageBox'
  ],
  function (Controller, JSONModel, MessageBox) {
    'use strict'

    const domain = 'https://usalspgsa660.na.pg.com:8443'
    const rSpacesPattern = /\s/g
    const rPatternLetters = /[^\d]/g

    let data = []

    return Controller.extend('taco.controller.App', {
      onInit: function () {
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
        this.oChkCheckId = this.byId('chk-checkId')
        this.oCbxReportCountry = this.byId('cbx-reportCountry')
        this.oCbxEuCode = this.byId('cbx-euCode')
        this.oCbxTargetTaxCode = this.byId('cbx-targetTaxCode')
        this.oIptTolerance = this.byId('input-tolerance')
        // Step 4
        this.oTableRevTaxRates = this.byId('table-revTaxRates')

        this.getDataJSON(
          this.buildUrl('GET_TAX_COUNTRY_LIST'),
          this.oCbxCountryKey
        )
        this.getDataJSON(this.buildUrl('GET_TAX_TYPES_LIST'), this.oCbxTaxType)
      },

      // Utils
      validateNumericInput: function (oEvent) {
        const _oInput = oEvent.getSource()
        let val = _oInput.getValue()
        val = val.replace(rPatternLetters, '')
        _oInput.setValue(val)
      },
      buildUrl: function (code, ...params) {
        let url = `${domain}/pg_itx?sap-client=400&code=${code}`
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
        jQuery.ajax({
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
        data = response.data
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

      // Tax Properties - Step 1
      validateTaxProperties: function () {
        const sCountryKey = this.oCbxCountryKey
          .getValue()
          .replace(rSpacesPattern, '')
        const sTaxType = this.oCbxTaxType.getSelectedKey()

        this.oWizard.invalidateStep(this.byId('step-taxProperties'))

        if (sCountryKey !== '' && sTaxType !== '') {
          const taxScenUrl = this.buildUrl(
            'GET_TAX_SCENARIOS',
            { type: 'land1', value: sCountryKey },
            { type: 'mwart', value: sTaxType }
          )
          this.getDataJSON(taxScenUrl)
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
      backToStep1: function () {
        const taxScenUrl = this.buildUrl(
          'GET_TAX_SCENARIOS',
          { type: 'land1', value: this.oCbxCountryKey.getValue() },
          { type: 'mwart', value: this.oCbxTaxType.getSelectedKey() }
        )
        this.getDataJSON(taxScenUrl)
        this.oCbxCountryKey.setEnabled(true)
        this.oCbxTaxType.setEnabled(true)
        this.oWizard.previousStep()
        this.oCbxVatScenarios.setModel(new JSONModel())
      },

      // Vat Scenario - Step 2
      validateVatScenario: function () {
        this.oWizard.invalidateStep(this.byId('step-vatScenarios'))
        const sVatScenario = this.oCbxVatScenarios
          .getValue()
          .replace(rSpacesPattern, '')

        if (sVatScenario !== '') {
          const taxFieldStatusUrl = this.buildUrl(
            'GET_TAX_FIELDSTATUS',
            { type: 'land1', value: this.oCbxCountryKey.getValue() },
            { type: 'mwart', value: this.oCbxTaxType.getSelectedKey() },
            { type: 'scen', value: sVatScenario }
          )
          this.getDataJSON(taxFieldStatusUrl)
        }

        setTimeout(() => {
          if (data.length === 0) {
            MessageBox.error(
              'No data found, for the entered scenario.'
            )
            this.oWizard.invalidateStep(this.byId('step-vatScenarios'))
          } else {
            this.oWizard.validateStep(this.byId('step-vatScenarios'))
          }
        }, 1500)
      },
      completeVatScenarios: function () {
        data.forEach(x => console.log(x))
      },

      onComplete: function () {
        console.log('Terminado')
        this.oNavContainer.to(this.byId('taxCodeReviewPage'))
      }
      // Review
    })
  }
)
