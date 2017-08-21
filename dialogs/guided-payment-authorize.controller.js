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
