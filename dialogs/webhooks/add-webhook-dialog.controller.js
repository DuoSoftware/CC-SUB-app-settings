// (function ()
// {
// 	'use strict';
// 	angular
// 		.module('app.settings')
// 		.controller('AddWebhookController', addWebhookController);
//
// 	/** @ngInject */
// 	function addWebhookController(notifications,$charge,$mdDialog, $scope,webhook,isEditOn, $timeout, tempUsedEventsList, loadWebhookListPaging)
// 	{
// 		var vm=this;
// 		vm.webhookEventList=[];
// 		$scope.loadingEventsWH = true;
// 		vm.webhook = webhook;
// 		vm.enabledEditWH = isEditOn;
// 		var skipAllEventsWH=0;
// 		var takeAllEventsWH=100;
// 		var tempUsedEventsList=tempUsedEventsList;
// 		$scope.loadWebhookListPaging = loadWebhookListPaging;
//
// 		$charge.webhook().allEvents(skipAllEventsWH,takeAllEventsWH,'asc').success(function (data) {
// 			//console.log(data);
// 			//
// 			if($scope.loadingEventsWH)
// 			{
// 				skipAllEventsWH += takeAllEventsWH;
//
// 				for (var i = 0; i < data.length; i++) {
// 					data[i].isAlreadyUsed=false;
// 					vm.webhookEventList.push(data[i]);
// 				}
// 				$scope.loadingEventsWH = false;
//
// 				// if(tempUsedEventsList.length!=0 && !$scope.loadingWebhooks)
// 				// {
// 				// 	$scope.checkAlreadyUsedEvents();
// 				// }
// 				if(vm.webhookEventList.length!=0)
// 				{
// 					$scope.checkAlreadyUsedEvents();
// 				}
// 			}
// 		}).error(function (data) {
// 			//console.log(data);
// 			vm.webhookEventList=[];
// 			$scope.loadingEventsWH = false;
// 		})
//
// 		// $scope.loadWebhookListPaging= function () {
// 		// 	$scope.loadingWebhooks = true;
// 		// 	$charge.webhook().allWebhooks(skipAllWebhooks,takeAllWebhooks,'desc').success(function (data) {
// 		// 		//console.log(data);
// 		// 		//
// 		// 		if($scope.loadingWebhooks)
// 		// 		{
// 		// 			skipAllWebhooks += takeAllWebhooks;
// 		//
// 		// 			for (var i = 0; i < data.length; i++) {
// 		// 				data[i].showEvents=false;
// 		// 				if(data[i].eventCodes!="" && data[i].eventCodes!=null && data[i].eventCodes!="null")
// 		// 				{
// 		// 					data[i].eventCodes=JSON.parse(data[i].eventCodes);
// 		// 					for (var j = 0; j < data[i].eventCodes.length; j++) {
// 		// 						tempUsedEventsList.push(data[i].eventCodes[j]);
// 		// 					}
// 		// 				}
// 		// 				vm.webhookList.push(data[i]);
// 		//
// 		// 			}
// 		//
// 		// 			$scope.loadingWebhooks = false;
// 		// 			if(data.length<takeAllWebhooks){
// 		// 				if(vm.webhookEventList.length!=0 && !$scope.loadingEventsWH)
// 		// 				{
// 		// 					$scope.checkAlreadyUsedEvents();
// 		// 				}
// 		// 			}
// 		// 			else{
// 		// 				$scope.loadWebhookListPaging();
// 		// 			}
// 		// 		}
// 		// 	}).error(function (data) {
// 		// 		//console.log(data);
// 		// 		$scope.loadingWebhooks = false;
// 		// 		if(vm.webhookEventList.length!=0 && !$scope.loadingEventsWH && tempUsedEventsList.length!=0)
// 		// 		{
// 		// 			$scope.checkAlreadyUsedEvents();
// 		// 		}
// 		// 	})
// 		// }
//
// 		$scope.checkAlreadyUsedEvents= function () {
// 			for (var i = 0; i < vm.webhookEventList.length; i++) {
// 				vm.webhookEventList[i].isAlreadyUsed=false;
// 				var tempEvent=vm.webhookEventList[i].eventType;
// 				for (var j = 0; j < tempUsedEventsList.length; j++) {
// 					if(tempEvent==tempUsedEventsList[j])
// 					{
// 						vm.webhookEventList[i].isAlreadyUsed=true;
// 					}
// 				}
// 			}
// 		}
//
// 		vm.closeDialog = function () {
// 			// vm.webhook={};
// 			// vm.webhook.type="custom";
// 			// vm.webhook.mode="Live";
// 			// vm.webhookTypeChange("custom");
// 			//
// 			// vm.webhookList=[];
// 			// skipAllWebhooks=0;
// 			// tempUsedEventsList=[];
// 			$mdDialog.hide();
// 			$scope.resetWebhook();
// 			vm.enabledEditWH=false;
// 		};
//
// 		$scope.resetWebhook= function () {
// 			vm.webhook={};
// 			vm.webhook.type="custom";
// 			vm.webhook.mode="Live";
// 			// vm.webhookTypeChange("custom");
//
// 			$timeout(function(){
// 				vm.webhookList=[];
// 			});
// 			// skipAllWebhooks=0;
// 			tempUsedEventsList=[];
// 			$scope.loadWebhookListPaging();
//
// 			vm.enabledEditWH=false;
// 		};
//
// 		vm.submitWebhook= function (editing) {
// 			if(!editing)
// 			{
// 				if (vm.webHooks.$valid == true) {
// 					vm.webhookSubmitted = true;
//
// 					var webhookObj={};
// 					var tempEventsSelected=false;
// 					webhookObj.endPoint=vm.webhook.endPoint;
// 					webhookObj.type=vm.webhook.type;
// 					webhookObj.createdDate=new Date();
// 					webhookObj.isEnabled=true;
// 					webhookObj.eventCodes=[];
//
// 					for (var i = 0; i < vm.webhookEventList.length; i++) {
// 						if(vm.webhookEventList[i].isSelected)
// 						{
// 							webhookObj.eventCodes.push(vm.webhookEventList[i].eventType);
// 							tempEventsSelected=true;
// 						}
// 					}
//
// 					if(tempEventsSelected)
// 					{
// 						$charge.webhook().createWH(webhookObj).success(function (data) {
// 							//console.log(data);
// 							//
// 							if(data.error=="00000")
// 							{
// 								notifications.toast("Webhook Created Successfully", "success");
// 								vm.webhook={};
// 								vm.webhook.type="custom";
// 								vm.webhook.mode="Live";
// 								vm.webhookTypeChange("custom");
//
// 								vm.webhookList=[];
// 								// skipAllWebhooks=0;
// 								tempUsedEventsList=[];
// 								$mdDialog.hide();
// 								$scope.loadWebhookListPaging();
// 							}
// 							else
// 							{
// 								notifications.toast("Webhook Creation Failed", "error");
// 							}
// 							//$scope.webhook={};
// 							vm.webhookSubmitted = false;
// 						}).error(function (data) {
// 							$mdDialog.hide();
// 							//console.log(data);
// 							vm.webhookSubmitted = false;
// 						})
// 					}
// 					else
// 					{
// 						notifications.toast("Select Events for the Webhook", "error");
// 						vm.webhookSubmitted = false;
// 					}
//
// 				}
// 			}
// 			else
// 			{
// 				if (vm.webHooks.$valid == true) {
// 					vm.webhookSubmitted = true;
//
// 					var webhookObj={};
// 					var tempEventsSelected=false;
// 					webhookObj.guWebhookId=vm.webhook.guWebhookId;
// 					webhookObj.endPoint=vm.webhook.endPoint;
// 					webhookObj.type=vm.webhook.type;
// 					webhookObj.createdDate=new Date();
// 					webhookObj.isEnabled=true;
// 					webhookObj.eventCodes=[];
//
// 					for (var i = 0; i < vm.webhookEventList.length; i++) {
// 						if(vm.webhookEventList[i].isSelected)
// 						{
// 							webhookObj.eventCodes.push(vm.webhookEventList[i].eventType);
// 							tempEventsSelected=true;
// 						}
// 					}
//
// 					if(tempEventsSelected)
// 					{
// 						$charge.webhook().updateWH(webhookObj).success(function (data) {
// 							//console.log(data);
// 							//
// 							if(data.error=="00000")
// 							{
// 								notifications.toast("Webhook Updated Successfully", "success");
// 								$scope.resetWebhook();
// 								$mdDialog.hide();
// 							}
// 							else
// 							{
// 								notifications.toast("Webhook Updating Failed", "error");
// 							}
// 							//$scope.webhook={};
// 							vm.webhookSubmitted = false;
// 						}).error(function (data) {
// 							$mdDialog.hide();
// 							//console.log(data);
// 							vm.webhookSubmitted = false;
// 						})
// 					}
// 					else
// 					{
// 						notifications.toast("Select Events for the Webhook", "error");
// 						vm.webhookSubmitted = false;
// 					}
//
// 				}
// 			}
// 		}
//
// 		vm.webhookTypeChange= function (type) {
// 			for (var i = 0; i < vm.webhookEventList.length; i++) {
// 				if(type=="all")
// 				{
// 					if(!vm.webhookEventList[i].isAlreadyUsed)
// 					{
// 						vm.webhookEventList[i].isSelected=true;
// 						vm.webhookEventList[i].isDisabled=true;
// 					}
// 				}
// 				else if(type=="custom")
// 				{
// 					vm.webhookEventList[i].isSelected=false;
// 					vm.webhookEventList[i].isDisabled=false;
// 				}
// 			}
// 		}
//
// 		$scope.resetWebhook= function () {
// 			$scope.webhook={};
// 			$scope.webhook.type="custom";
// 			$scope.webhook.mode="Live";
// 			// vm.webhookTypeChange("custom");
//
// 			vm.webhookList=[];
// 			// skipAllWebhooks=0;
// 			tempUsedEventsList=[];
// 			$scope.loadWebhookListPaging();
//
// 			$scope.enabledEditWH=false;
// 		}
//
// 		$scope.setEventListForWebhookEdit = function (webhook) {
// 			$scope.loadingEventsWH = false;
// 			for (var i = 0; i < webhook.eventCodes.length; i++) {
// 				var eventCode=webhook.eventCodes[i];
// 				for (var j = 0; j < vm.webhookEventList.length; j++) {
// 					if(eventCode==vm.webhookEventList[j].eventType)
// 					{
// 						vm.webhookEventList[j].isSelected=true;
// 						vm.webhookEventList[j].isAlreadyUsed=false;
// 						if(j == vm.webhookEventList.length-1)$scope.loadingEventsWH = true;
// 					}
// 				}
// 			}
// 		}
//
// 		if(isEditOn) {
// 			$scope.setEventListForWebhookEdit(vm.webhook);
// 		}
//
// 	}
// })();
