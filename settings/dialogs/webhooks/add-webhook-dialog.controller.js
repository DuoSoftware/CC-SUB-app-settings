(function ()
{
  'use strict';
  angular
    .module('app.settings')
    .controller('AddWebhookController', addWebhookController);

  /** @ngInject */
  function addWebhookController(notifications,$charge,$mdDialog, $scope,webHooks,webhook,webhookEventList,webhookTypeChange,webhookSubmitted,enabledEditWH,resetWebhook,tempUsedEventsList,skipAllWebhooks,loadWebhookListPaging)
  {
    var vm=this;

	  // $scope.submitWebhook = submitWebhook;
      $scope.webhookTypeChange = webhookTypeChange;
      vm.webhookSubmitted = webhookSubmitted;
      vm.webHooks = webHooks;
      vm.webhookEventList = webhookEventList;
	  $scope.webhook = webhook;
	  $scope.enabledEditWH = enabledEditWH;
      $scope.resetWebhook = resetWebhook;
      $scope.skipAllWebhooks = skipAllWebhooks;
      $scope.tempUsedEventsList = tempUsedEventsList;
      $scope.loadWebhookListPaging = loadWebhookListPaging;
      $scope.tempUsedEventsList = tempUsedEventsList;

      $scope.closeDialog = function () {
		  $scope.webhook={};
		  $scope.webhook.type="custom";
		  $scope.webhook.mode="Live";
		  $scope.webhookTypeChange("custom");

		  vm.webhookList=[];
		  skipAllWebhooks=0;
		  tempUsedEventsList=[];
          $mdDialog.hide();
      }

	  $scope.submitWebhook= function (editing) {
		  if(!editing)
		  {
			  if (vm.webHooks.$valid == true) {
				  vm.webhookSubmitted = true;

				  var webhookObj={};
				  var tempEventsSelected=false;
				  webhookObj.endPoint=$scope.webhook.endPoint;
				  webhookObj.type=$scope.webhook.type;
				  webhookObj.createdDate=new Date();
				  webhookObj.isEnabled=true;
				  webhookObj.eventCodes=[];

				  for (var i = 0; i < vm.webhookEventList.length; i++) {
					  if(vm.webhookEventList[i].isSelected)
					  {
						  webhookObj.eventCodes.push(vm.webhookEventList[i].eventType);
						  tempEventsSelected=true;
					  }
				  }

				  if(tempEventsSelected)
				  {
					  $charge.webhook().createWH(webhookObj).success(function (data) {
						  console.log(data);
						  // debugger;
						  if(data.error=="00000")
						  {
							  notifications.toast("Webhook Created Successfully", "success");
							  $scope.webhook={};
							  $scope.webhook.type="custom";
							  $scope.webhook.mode="Live";
							  $scope.webhookTypeChange("custom");

							  vm.webhookList=[];
							  skipAllWebhooks=0;
							  tempUsedEventsList=[];
							  $mdDialog.hide();
							  $scope.loadWebhookListPaging();
						  }
						  else
						  {
							  notifications.toast("Webhook Creation Failed", "error");
						  }
						  //$scope.webhook={};
						  vm.webhookSubmitted = false;
					  }).error(function (data) {
						  $mdDialog.hide();
						  console.log(data);
						  vm.webhookSubmitted = false;
					  })
				  }
				  else
				  {
					  notifications.toast("Select Events for the Webhook", "error");
					  vm.webhookSubmitted = false;
				  }

			  }
		  }
		  else
		  {
			  if (vm.webHooks.$valid == true) {
				  vm.webhookSubmitted = true;

				  var webhookObj={};
				  var tempEventsSelected=false;
				  webhookObj.guWebhookId=$scope.webhook.guWebhookId;
				  webhookObj.endPoint=$scope.webhook.endPoint;
				  webhookObj.type=$scope.webhook.type;
				  webhookObj.createdDate=new Date();
				  webhookObj.isEnabled=true;
				  webhookObj.eventCodes=[];

				  for (var i = 0; i < vm.webhookEventList.length; i++) {
					  if(vm.webhookEventList[i].isSelected)
					  {
						  webhookObj.eventCodes.push(vm.webhookEventList[i].eventType);
						  tempEventsSelected=true;
					  }
				  }

				  if(tempEventsSelected)
				  {
					  $charge.webhook().updateWH(webhookObj).success(function (data) {
						  console.log(data);
						  // debugger;
						  if(data.error=="00000")
						  {
							  notifications.toast("Webhook Updated Successfully", "success");
							  $scope.resetWebhook();
							  $mdDialog.hide();
						  }
						  else
						  {
							  notifications.toast("Webhook Updating Failed", "error");
						  }
						  //$scope.webhook={};
						  vm.webhookSubmitted = false;
					  }).error(function (data) {
						  $mdDialog.hide();
						  console.log(data);
						  vm.webhookSubmitted = false;
					  })
				  }
				  else
				  {
					  notifications.toast("Select Events for the Webhook", "error");
					  vm.webhookSubmitted = false;
				  }

			  }
		  }
	  }

  }
})();
