(function ()
{
  'use strict';

  angular
    .module('app.settings')
    .controller('GuidedPaymentPaypalController', GuidedPaymentPaypalController);

  /** @ngInject */
  function GuidedPaymentPaypalController($mdDialog, $scope,$http,notifications,idToken,$charge)
  {
    var vm = this;
    $scope.paypal = {
      apiUsername :"",
      apiPassword:"",
      apiSignature:""
    };

    $scope.submitPaypalRegistration = function () {
       // debugger;
      if($scope.paypalForm.$valid){

        $charge.paymentgateway().registerWithPayPal($scope.paypal).success(function (response) {

          if(response.status){
            notifications.toast("Successfully registered with PayPal", "success");

            $mdDialog.hide();

          }else{
            notifications.toast("Paypal registration failed ", "error");
          }

        }).error(function (data) {

          var error = "There is a problem, Please try again";
          if(angular.isDefined(data["error"])){
            error = data["error"]+". Please try again";
          }
          notifications.toast(error, "Error");
        });
      }
    }

    $scope.closeDialog = function () {
      $mdDialog.hide();
    }
  }
})();
