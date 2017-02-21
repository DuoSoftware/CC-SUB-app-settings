/**
 * Created by Suvethan on 11/15/2016.
 */

(function ()
{
  'use strict';
  ////////////////////////////////
  // App : Settings
  // Owner  : Suvethan
  // Last changed date : 2016/11/15
  // Version : 6.0.0.1
  // Updated By : Suvethan
  /////////////////////////////////
  angular
    .module('app.settings')
    .controller('ReminderDialogController', ReminderDialogController);

  /** @ngInject */
  function ReminderDialogController($mdDialog, $scope,reminderTypeDefault,rowIndex,reminderCon)
  {
    var vm=this;
    $scope.invoiceReminder={};
    $scope.invoiceReminder.reminderType=reminderTypeDefault;

    if(reminderCon!=undefined || reminderCon!='' ||reminderCon !=null)
      $scope.invoiceReminder=angular.copy(reminderCon);
    $scope.submitReminder = function()
    {
      if (vm.reminderForm.$valid == true) {
        $scope.invoiceReminder.isDisabled=$scope.invoiceReminder.isDisabled==true?false:true;
        $scope.invoiceReminder.reminderIndex=rowIndex;
        if($scope.invoiceReminder.ReminderType=="OnDueDate")
          $scope.invoiceReminder.chkDisabled=true;
        else
          $scope.invoiceReminder.chkDisabled=false;
        $mdDialog.hide($scope.invoiceReminder);
      }
    }

    $scope.checkReminderType= function (type) {
      if(type=="OnDueDate")
      {
        $scope.invoiceReminder.chkDisabled=true;
        $scope.invoiceReminder.ReminderDays=0;
      }
      else
      {
        $scope.invoiceReminder.chkDisabled=false;
      }
    }

    $scope.clearFields = function () {
      $scope.invoiceReminder.ReminderType = "";
      $scope.invoiceReminder.ReminderDays = 0;
    }

    $scope.closeDialog= function () {
      $mdDialog.hide();
    }
  }
})();
