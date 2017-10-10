(function ()
{
  'use strict';

  angular
    .module('app.settings')
    .controller('GuidedPaymentworldpayController', GuidedPaymentworldpayController);

  /** @ngInject */
  function GuidedPaymentworldpayController($mdDialog, $scope,$http,notifications,idToken,$charge)
  {
    var vm = this;
    $scope.worldPay = {
      skey :"",
      ckey:""
    };

    $scope.submitworldpayRegistration = function () {
      // debugger;
      if($scope.worldPayForm.$valid){

        $charge.paymentgateway().registerWithWorldPay($scope.worldPay).success(function (response) {

          if(response.status){
            notifications.toast("Successfully registered with World pay", "success");

            $mdDialog.hide();

          }else{
            notifications.toast("World pay registration failed ", "error");
          }

        }).error(function (response) {

          // console.log(response);
          notifications.toast("World pay registration failed", "error");
        });
      }
    }

    $scope.closeDialog = function () {
      $mdDialog.hide();
    }
  }
})();
