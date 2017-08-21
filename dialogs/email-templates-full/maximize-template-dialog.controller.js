(function ()
{
	'use strict';
	angular
		.module('app.settings')
		.controller('MaximizeTemplateController', maximizeTemplateController);

	/** @ngInject */
	function maximizeTemplateController($mdDialog, $scope, selectedTemplateView, template,footerDet,cropper)
	{
		$scope.selectedTemplateView = selectedTemplateView;
		$scope.template = template;
		$scope.footerDet = footerDet;
		$scope.cropper = cropper;

		$scope.closeDialog = function () {
			$mdDialog.hide();
		};

	}
})();
