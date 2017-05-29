(function ()
{
  'use strict';

  angular
    .module('app.settings')
    .controller('GuidedPaymenttestGatewayController', GuidedPaymenttestGatewayController);

  /** @ngInject */
  function GuidedPaymenttestGatewayController($mdDialog, $scope,$http,notifications,idToken,$charge)
  {
    var vm = this;
    $scope.twoCheckOut = {
      sid :"",
      skey:""
    };

    $scope.submittestGatewayRegistration = function () {
      // debugger;
      // if($scope.twoCheckoutForm.$valid){
      //
      //   $charge.paymentgateway().insertAccKeys($scope.twoCheckOut).success(function (response) {
      //
      //     if(response.status){
      //       notifications.toast("Successfully registered with testGateway", "success");
      //
      //       $mdDialog.hide();
      //
      //     }else{
      //       notifications.toast("testGateway registration failed ", "error");
      //     }
      //
      //   }).error(function (response) {
      //
      //     console.log(response);
      //     notifications.toast("testGateway registration failed", "error");
      //   });
      // }
    }

    $scope.closeDialog = function () {
      $mdDialog.hide();
    }
  }
})();
