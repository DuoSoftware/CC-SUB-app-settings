(function ()
{
  'use strict';

  angular
    .module('app.account')
    .controller('GuidedPaymentbraintreeController', GuidedPaymentbraintreeController);

  /** @ngInject */
  function GuidedPaymentbraintreeController($mdDialog, $scope,$http,notifications,idToken,$charge)
  {
    var vm = this;
    $scope.braintree = {
      skey :"",
      pkey:"",
      merchantId:"",
      currency : ""
    };

    $scope.submitbraintreeRegistration = function () {
       debugger;
      if($scope.braintreeForm.$valid){

        $charge.paymentgateway().registerWithBraintree($scope.braintree).success(function (response) {

          if(response.status){
            notifications.toast("Successfully registered with Braintree", "success");

            $mdDialog.hide();

          }else{
            notifications.toast("Braintree registration failed ", "error");
          }

        }).error(function (response) {

          console.log(response);
          notifications.toast("Braintree registration failed", "error");
        });
      }
    }

    $scope.closeDialog = function () {
      $mdDialog.hide();
    }
  }
})();
