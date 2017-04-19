(function ()
{
  'use strict';
  angular
    .module('app.settings')
    .controller('addCurrencyController', addCurrencyController);

  /** @ngInject */
  function addCurrencyController($mdDialog, $scope, addCurrency, searchCurrency, queryCurrency)
  {
    var vm=this;

    $scope.addCurrencyCheck = addCurrencyCheck;
    $scope.addCurrency = addCurrency;
    $scope.searchCurrency = searchCurrency;
    $scope.queryCurrency = queryCurrency;

    $scope.closeDialog = function () {
      $mdDialog.hide();
    };

    function addCurrencyCheck(item){
      if(vm.addCurrencyForm.$valid){
        $scope.addCurrency(item);
      }else{
        angular.element(document.querySelector('#addCurrencyForm')).find('.ng-invalid:visible:first').focus();
      }
    }


  }
})();
