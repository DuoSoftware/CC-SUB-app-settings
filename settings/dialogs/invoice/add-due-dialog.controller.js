(function ()
{
  'use strict';
  angular
    .module('app.settings')
    .controller('addDueController', addDueController);

  /** @ngInject */
  function addDueController($mdDialog, $scope, addTerm, invoiceTerms,invoice,updateTerm,updateTermEnable)
  {
    var vm=this;

    $scope.addTermCheck = addTermCheck;
    $scope.updateTermCheck = updateTermCheck;
    $scope.addTerm = addTerm;
    $scope.updateTerm = updateTerm;
    $scope.invoiceTerms = invoiceTerms;
    $scope.updateTermEnable = updateTermEnable;
    $scope.invoice = invoice;

    $scope.closeDialog = function () {
		$scope.invoice.termName="";
		$scope.invoice.NoOfDays="";
		$mdDialog.hide();
    };

    function addTermCheck(item){
      if(vm.dueTerms.$valid){
        $scope.addTerm(item);
      }else{
        angular.element(document.querySelector('#dueTerms')).find('.ng-invalid:visible:first').focus();
      }
    }

    function updateTermCheck(item){
      if(vm.dueTerms.$valid){
        $scope.updateTerm(item);
      }else{
        angular.element(document.querySelector('#dueTerms')).find('.ng-invalid:visible:first').focus();
      }
    }

  }
})();
