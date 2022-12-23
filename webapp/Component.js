sap.ui.define(
  ['sap/ui/core/UIComponent'],
  function (UIComponent) {
    'use strict'
    return UIComponent.extend('taco.Component', {
      metadata: {
        interfaces: ['sap.ui.core.IAsyncContentCreation'],
        manifest: 'json'
      }
    })
  }
)
