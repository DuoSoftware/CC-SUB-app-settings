(function ()
{
  'use strict';

  angular
    .module('app.settings')
    .controller('GuidedPaymentWebxpayController', GuidedPaymentWebxpayController);

  /** @ngInject */
  function GuidedPaymentWebxpayController($mdDialog, $scope,$http,notifications,idToken,$charge)
  {
    var vm = this;
    $scope.webxpay = {
      skey :"",
      pkey:""
    };

    $scope.submitWebxpayRegistration = function () {
       // debugger;
      if($scope.webxpayForm.$valid){

        $charge.paymentgateway().registerWithWebxpay($scope.webxpay).success(function (response) {

          if(response.status){
            notifications.toast("Successfully registered with webxpay", "success");

            $mdDialog.hide();

          }else{
            notifications.toast("Webxpay registration failed ", "error");
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
