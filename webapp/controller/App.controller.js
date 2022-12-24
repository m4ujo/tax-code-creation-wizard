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
    const REGEX_LETTERS = /[^\d]/g
    const URL_CODES = [
      'GET_TAX_COUNTRY_LIST',
      'GET_TAX_TYPES_LIST',
      'GET_TAX_SCENARIOS',
      'GET_TAX_FIELDSTATUS',
      'GET_TAXJUR_LIST',
      'GET_SAP_COUNTRY_LIST',
      'GET_EUCODE_LIST',
      'GET_TAX_PROCEDURE'
    ]

    let data = []
    let url = ''

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
      },

      // Utils
      validateNumericInput: function (oEvent) {
        const _oInput = oEvent.getSource()
        let val = _oInput.getValue()
        val = val.replace(REGEX_LETTERS, '')
        _oInput.setValue(val)
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

      // Tax Properties - Step 2
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

      // Vat Scenario - Step 3
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
            MessageBox.error('No data found, for the entered scenario.')
            this.oWizard.invalidateStep(this.byId('step-vatScenarios'))
          } else {
            this.oWizard.validateStep(this.byId('step-vatScenarios'))
          }
        }, 1500)
      },
      completeVatScenarios: function () {
        console.log(data)
        data.forEach((x) => {
          const field = this.byId(`field-${x.fieldname}`)
          field.setVisible(true)
          if (x.fieldname === 'CHECKID' && x.default_value === 'X') {
            this.oChkCheckId.setSelected(true)
          }
          if (x.scr_status === 'R') {
            const inputProperties = field.mAggregations.content[1].mProperties
            inputProperties.required = true
          } else if (x.scr_status === 'O') {
            console.log('')
          } else if (x.scr_status === 'S') {
            field.setVisible(false)
          }
        })
        this.oCbxVatScenarios.setEnabled(false)

        data = []
        url = this.buildUrl(URL_CODES[4], {
          type: 'land1',
          value: this.oCbxCountryKey.getValue()
        })
        this.getDataJSON(url, this.oCbxTaxJur)

        data = []
        url = this.buildUrl(URL_CODES[5])
        this.getDataJSON(url, this.oCbxReportCountry)

        data = []
        url = this.buildUrl(URL_CODES[6])
        this.getDataJSON(url, this.oCbxEuCode)
      },
      backToStep2: function () {
        this.oCbxVatScenarios.setEnabled(true)
        this.oWizard.previousStep()
      },

      // Vat Scenario - Step 4
      validateTaxAttr: function () {},
      completeTaxAttr: function () {},
      backToStep3: function () {},

      onComplete: function () {
        console.log('Terminado')
        this.oNavContainer.to(this.byId('taxCodeReviewPage'))
      }
      // Review
    })
  }
)
