
(function ()
{
  'use strict';
  ////////////////////////////////
  // App : Settings
  // Owner  : Suvethan
  // Last changed date : 2016/11/09
  // Version : 6.0.0.1
  // Updated By : Kasun
  /////////////////////////////////
  angular
    .module('app.settings')
    .controller('TaxGroupDialogController', TaxGroupDialogController);

  /** @ngInject */
  function TaxGroupDialogController($mdDialog, $scope, fixedRates,indexGrp,groupTaxData,code,notifications,$charge,$filter,taxGroupList,infoDialog)
  {
    var vm = this;
    //vm.IndividualTax.state=false;
    //vm.taxGrpForm = taxGrpForm;
    //vm.taxGrpSubmit = taxGrpSubmit;

    // Methods
    //$scope.taxGrpHeader = taxFrpHeader;
    $scope.fixedRates = fixedRates;
    for(var i=0;i<$scope.fixedRates.length;i++)
    {
      $scope.fixedRates[i].taxState=false;
    }
    //$scope.$watch(function () {
    //  $scope.clearTaxGrpFields = clearTaxGrpFields;
    //})
    //$scope.taxGroupData = taxGroupData;
    //$scope.submitTaxGrp=submitTaxGrp;
    //$scope.addGroupRow=addGrpRow;
    //$scope.updateTaxGrp=updateTaxGrp;
    $scope.taxesInGroup = [];


    $scope.taxGrpHeader={};
    $scope.taxgrpdetails=[];
    $scope.taxGroupList=taxGroupList;

    //$scope.childTaxesDisplay = childTaxesDisplay;

    //

    vm.newVeg = function(chip) {
      return {
        name: chip,
        type: 'unknown'
      };
    };

    //////////

    $scope.closeDialog = function()
    {
      if($scope.taxGrpHeader!=null || $scope.taxGrpHeader != undefined)
        $scope.clearTaxGrpFields();

      $mdDialog.hide();
      $scope.groupInfoLoaded = false;

    }

    $scope.closeInfoDialog = function()
    {
      $mdDialog.hide();
      $scope.groupInfoLoaded = false;
    }

    $scope.clearTaxGrpFields= function () {
      //
      vm.taxGrpForm.$setPristine();
      vm.taxGrpForm.$setUntouched();
      $scope.taxgrpdetails=[];
      $scope.taxGrpHeader.taxgroupcode="";
      //$scope.isUpdateGrp=false;
      for(var i=0;i<$scope.fixedRates.length;i++)
      {
        $scope.fixedRates[i].taxState=false;
      }
    }


    $scope.isUpdateGrp=false;
    vm.taxGrpSubmit=false;
    $scope.submitTaxGrp= function () {

      if($scope.taxgrpdetails.length!=0) {
        if (vm.taxGrpForm.$valid == true) {
          vm.taxGrpSubmit = true;
          //if ($scope.taxgrpdetails.length!=0) {
          if ($scope.isUpdateGrp) {
            var count=0;
            for(var i=0;i<$scope.taxGroupList.length;i++)
            {
              if($scope.taxGroupList[i].taxgroupcode==$scope.taxGrpHeader.taxgroupcode)
              {
                if($scope.displayTaxGrp!=$scope.taxGrpHeader.taxgroupcode)
                {
                  count++;
                }
              }
            }
            if(count==0) {
              $scope.taxiddetails = [];
              var taxcode = $scope.taxGrpHeader.taxgroupcode;
              var taxgrpid = $scope.taxGrpHeader.taxgroupid;
              var status = $scope.taxGrpHeader.status;
              for (var i = 0; i < $scope.taxgrpdetails.length; i++) {
                var taxObj = $scope.taxgrpdetails[i];
                if (taxObj != null) {
                  $scope.taxiddetails.push
                  ({
                    taxid: taxObj.taxid
                  });
                }
                else {
                  var taxCode = $scope.taxgrpdetails[i].taxCode;
                  var tax = $filter('filter')($scope.taxgrpdetails, {taxcode: taxCode})[0];
                  $scope.taxiddetails.push
                  ({
                    taxid: tax.taxid
                  });
                }
              }
              var req = {
                "taxgroupid": taxgrpid,
                "taxgroupcode": taxcode,
                "status": status,
                "taxiddetails": $scope.taxiddetails
              }

              $charge.tax().updateTaxGrp(req).success(function (data) {

                notifications.toast("Tax Group has been updated.", "success");
                vm.taxGrpSubmit = false;
                var taxgroup = req;
                taxgroup.createdate = new Date();
                taxgroup.createuser = "admin";
                var taxGrpObj = $filter('filter')($scope.taxGroupList, {taxgroupid: taxgroup.taxgroupid})[0];
                var index = $scope.taxGroupList.indexOf(taxGrpObj);
                $scope.taxGroupList.splice(index, 1);
                $scope.taxGroupList.push(taxgroup);
                vm.taxGrpForm.$setPristine();
                vm.taxGrpForm.$setUntouched();
                $scope.taxgrpdetails = [];
                $scope.taxGrpHeader = {};
                $scope.isUpdateGrp = false;
                self.searchText = "";


              }).error(function (data) {
                vm.taxGrpSubmit = false;
              })
            }
            else
            {
              notifications.toast("Tax Group Code is already exist.", "error");
              $scope.taxGrpHeader.taxgroupcode = $scope.displayTaxGrp;
              vm.taxGrpSubmit = false;
            }
          }
          else {
            var isTaxGrp = false;
            if ($scope.taxGroupList.length != 0) {
              for (var i = 0; i < $scope.taxGroupList.length; i++) {
                if ($scope.taxGroupList[i].taxgroupcode == $scope.taxGrpHeader.taxgroupcode) {
                  isTaxGrp = true;
                  notifications.toast("Tax Group Code is already exist.", "error");
                  $scope.taxGrpHeader.taxgroupcode = "";
                  vm.taxGrpSubmit = false;
                  break;
                }
              }
            }
            if (!isTaxGrp) {
              $scope.taxiddetails = [];
              var taxgroupcode = $scope.taxGrpHeader.taxgroupcode;
              var dd = $scope.taxgrpdetails;
              for (var i = 0; i < $scope.taxgrpdetails.length; i++) {
                var taxObj = $scope.taxgrpdetails[i];
                if (taxObj != null) {
                  $scope.taxiddetails.push
                  ({
                    taxid: taxObj.taxid
                  });
                }
              }
              var req = {
                "taxgroupcode": taxgroupcode,
                "status": "1",
                "taxiddetails": $scope.taxiddetails
              }


              $charge.tax().storeTaxGrp(req).success(function (data) {

                vm.taxGrpSubmit = false;
                notifications.toast("Tax Group has been added.", "success");
                var taxgroup = req;
                taxgroup.taxgroupid = data.id;
                taxgroup.createdate = new Date();
                taxgroup.createuser = "admin";
                $scope.taxGroupList.push(taxgroup);
                vm.taxGrpForm.$setPristine();
                vm.taxGrpForm.$setUntouched();
                $scope.taxgrpdetails = [];
                $scope.taxGrpHeader = {};
                self.searchText = "";
                for(var i=0;i<$scope.fixedRates.length;i++)
                {
                  $scope.fixedRates[i].taxState=false;
                }
              }).error(function (data) {
                vm.taxGrpSubmit = false;
              })
            }
          }
          //}
          //else {
          //  notifications.toast("Tax Code cannot be empty", "error");
          //  vm.taxGrpSubmit = false;
          //}
        }
        $mdDialog.hide();

      }
      else
      {
        notifications.toast("Please select a tax.", "error");
      }
    }

    //$scope.taxGroups=$scope.fixedRates;
    //var self = this;
    //self.selectedItem  = '';
    //self.searchText    = "";
    //self.querySearch   = querySearch;
    //
    //function querySearch (query,index) {
    //  var results=[];
    //  for (var i = 0; i<$scope.taxGroups.length; ++i){
    //    //console.log($scope.allBanks[i].value.value);
    //    if($scope.taxGroups[i].taxcode.toLowerCase().indexOf(query.toLowerCase()) !=-1)
    //    {
    //      if($scope.taxGroups[i].taxcode.toLowerCase().startsWith(query.toLowerCase()))
    //      {
    //        results.push($scope.taxGroups[i]);
    //      }
    //
    //    }
    //  }
    //  return results;
    //}

    $scope.addNewGroupRow=function()
    {
      var taxgrp={};
      taxgrp.taxGroup=0;
      taxgrp.taxCode=0;
      //taxgrp.taxcodelst=$scope.fixedRates;
      //$scope.taxGroups.push(taxgrp);
    }

    $scope.addGroupRow = function (ev,state,index) {
      if(state) {
        if (ev != null) {
          $scope.taxgrpdetails.push(ev);
          self.searchText = "";
        }
        else {
          notifications.toast("Please select a tax.", "error");
        }
      }
      else
      {
        $scope.taxgrpdetails.splice(index,1);
      }
    }
    $scope.addNewGroupRow();

    $scope.removeGroupRow = function (index) {
      $scope.taxgrpdetails.splice(index, 1);
    }



    $scope.childTaxesDisplay = false;
    $scope.updateTaxGrp=function(ev,indexGrp,code)
    {
      if(code == "showTaxList"){
        $scope.childTaxesDisplay = true;
      }

      $scope.taxGrpHeader={};
      $scope.isUpdateGrp=true;

      $scope.groupInfoLoaded = false;
      $charge.tax().getTaxGrpByIDs(ev.taxgroupid).success(function(data) {
        console.log(data);
        $scope.taxGrpHeader=data[0];
        $scope.displayTaxGrp=data[0].taxgroupcode;
        if(data.groupDetail.length!=0) {
          for (var i = 0; i < data.groupDetail.length; i++) {
            data.groupDetail[i].newItem = false;
            var taxId = data.groupDetail[i].taxid;
            var taxDetails = $filter('filter')($scope.fixedRates, {taxid: taxId})[0];
            data.groupDetail[i].taxcode = taxDetails.taxcode;
          }
          //data.groupDetail[data.groupDetail.length - 1].newItem = true;
          $scope.taxgrpdetails=data.groupDetail;
          $scope.groupInfoLoaded = true;
        }
        else
        {
          $scope.taxgrpdetails=[];
        }
        for(var i=0;i<$scope.fixedRates.length;i++)
        {
          var taxStateObj=$filter('filter')($scope.taxgrpdetails, { taxid: $scope.fixedRates[i].taxid })[0];
          if(taxStateObj!=null || undefined)
            $scope.fixedRates[i].taxState=true;
        }
       // $scope.taxGroupEditDialog(ev, $scope.taxgrpdetails);
        $scope.childTaxesDisplay = false;

      }).error(function(data) {
        $scope.childTaxesDisplay = false;
      })

    }

    if(groupTaxData!=null)
      $scope.updateTaxGrp(groupTaxData,indexGrp,code);


    if(infoDialog){

      for(i=0;i<$scope.fixedRates.length;i++){
        if(fixedRates[i].taxState==true){
          $scope.taxesInGroup.push(fixedRates[i].taxcode);
        }
      }
    }
  }
})();
