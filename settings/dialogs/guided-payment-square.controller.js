(function ()
{
	'use strict';

	angular
		.module('app.settings')
		.controller('GuidedPaymentSquareController', GuidedPaymentSquareController);

	/** @ngInject */
	function GuidedPaymentSquareController($mdDialog, $scope,$http,notifications,idToken,$charge)
	{
		var vm = this;
		$scope.square = {
			applicationId :"",
			locationId:"",
			accessToken:""
		};

		$scope.submitSquareRegistration = function () {
			// debugger;
			if($scope.squareForm.$valid){

				$charge.paymentgateway().squarekeyregister($scope.square).success(function (response) {

					if(response.status){
						notifications.toast("Successfully registered with Square", "success");

						$mdDialog.hide();

					}else{
						notifications.toast("Square registration failed ", "error");
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
