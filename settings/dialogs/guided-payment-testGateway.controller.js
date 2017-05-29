(function ()
{
  'use strict';

  angular
    .module('app.settings')
    .controller('GuidedPaymenttestGatewayController', GuidedPaymenttestGatewayController);

  /** @ngInject */
  function GuidedPaymenttestGatewayController($mdDialog, $scope,$http,notifications,idToken,$charge,$timeout)
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

	  $scope.copyToClipboard = function (elem) {
		  $scope.coppiedTimeout = false;
		  $scope.copyStarted = true;
		  window.getSelection().empty();
		  var copyField = document.getElementById(elem);
		  var range = document.createRange();
		  range.selectNode(copyField);
		  window.getSelection().addRange(range);
		  document.execCommand('copy');
		  elem == 'success_no' ? $scope.successCopied = true : $scope.successCopied = false;
		  $timeout(function(){
			  $scope.coppiedTimeout = true;
		  },2000);
	  }

    $scope.closeDialog = function () {
      $mdDialog.hide();
    }
  }
})();
