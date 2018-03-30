(function ()
{
	'use strict';

	angular
		.module('app.settings')
		.controller('GuidedPaymentAdyenController', GuidedPaymentAdyenController);

	/** @ngInject */
	function GuidedPaymentAdyenController($mdDialog, $scope,$http,notifications,idToken,$charge)
	{
		var vm = this;
		$scope.authorize = {
			username : "",
			password: "",
			merchant_account: "",
			custom_endpoint: ""
		};

		$scope.submitAdyenRegistration = function () {
			// debugger;
			if($scope.adyenForm.$valid){

				$charge.paymentgateway().adyenkeyregister($scope.authorize).success(function (response) {

					if(response.status){
						notifications.toast("Successfully registered with Adyen", "success");

						$mdDialog.hide();

					}else{
						notifications.toast("Adyen registration failed ", "error");
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
