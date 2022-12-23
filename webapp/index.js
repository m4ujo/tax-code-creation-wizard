sap.ui.define(
  ['sap/ui/core/ComponentContainer'],
  function (ComponentContainer) {
    'use strict'

    new ComponentContainer({
      name: 'taco',
      settings: {
        id: 'taco'
      },
      async: true
    }).placeAt('content')
  }
)
