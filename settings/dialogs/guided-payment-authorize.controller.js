(function ()
{
  'use strict';

  angular
    .module('app.settings')
    .controller('GuidedPaymentauthorizeController', GuidedPaymentauthorizeController);

  /** @ngInject */
  function GuidedPaymentauthorizeController($mdDialog, $scope,$http,notifications,idToken,$charge)
  {
    var vm = this;
    $scope.authorize = {
      skey :"",
      pkey:"",
      apiLoginid:""
    };

    $scope.submitauthorizeRegistration = function () {
       // debugger;
      if($scope.authorizeForm.$valid){

        $charge.paymentgateway().registerWithAuthorize($scope.authorize).success(function (response) {

          if(response.status){
            notifications.toast("Successfully registered with authorize", "success");

            $mdDialog.hide();

          }else{
            notifications.toast("authorize registration failed ", "error");
          }

        }).error(function (response) {

          // console.log(response);
          notifications.toast("authorize registration failed", "error");
        });
      }
    }

    $scope.closeDialog = function () {
      $mdDialog.hide();
    }
  }
})();
