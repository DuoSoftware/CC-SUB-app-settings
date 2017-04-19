(function ()
{
  'use strict';
  angular
    .module('app.settings')
    .controller('addPlanController', addPlanController);

  /** @ngInject */
  function addPlanController($mdDialog, $scope, submitPlan, plan,editUnit,updateUomEnable,addUomDisabled
	)
  {
    var vm=this;

    $scope.addPlanCheck = addPlanCheck;
    $scope.submitPlan = submitPlan;
    $scope.plan = plan;
    $scope.editUnit = editUnit;
    $scope.updateUomEnable = updateUomEnable;
    $scope.addUomDisabled =  addUomDisabled;


    $scope.closeDialog = function () {
      $mdDialog.hide();
    };

    function addPlanCheck(){
      if(vm.planType.$valid){
        $scope.submitPlan($scope.updateUomEnable);
      }else{
        angular.element(document.querySelector('#addPlanForm')).find('.ng-invalid:visible:first').focus();
      }
    }

  }
})();
