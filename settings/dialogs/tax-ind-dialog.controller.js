
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
		.controller('TaxIndividualDialogController', TaxIndividualDialogController);

	/** @ngInject */
	function TaxIndividualDialogController($mdDialog, $scope, $timeout,fixedRates,fixedRate,index,notifications,$charge,$filter, dialogInfo,general)
	{
		$scope.slabrows=[];
		$scope.taxHeader={};
		$scope.taxHeader.taxtype=true;
		$scope.requiredStatus=false;
		//$scope.taxGrpHeader={};
		$scope.taxgrpdetails=[];
		$scope. dialogInfo =  dialogInfo;
		$scope.isTaxInfoLoaded = true;

		$scope.isUpdate=false;
		$scope.individualSubmit=false;
		$scope.general = general;
		var vm = this;
		//vm.editTaxForm = editTaxForm;

		$scope.$watch(function () {
		});

		//$timeout(function() {
		//  $scope.individualSubmit = individualSubmit;
		//}, 1000);

		//$scope.addNewRow = addNewRow;
		//$scope.closeDialog = closeDialog;
		//$scope.addrow = addrow;
		//$scope.slabrows = slabrows;
		//$scope.removerow = removerow;
		//$scope.taxHeader = taxHeader;
		//$scope.clearTaxField = clearTaxField;
		//$scope.enableTaxType = enableTaxType;
		//$scope.isUpdate = isUpdate;
		//$scope.submitTax = submitTax;
		//$scope.updateTax = updateTax;
		$scope.fixedRates = fixedRates;
		//debugger;
		//$scope.requiredStatus = requiredStatus;


		//vm.newVeg = function(chip) {
		//  return {
		//    name: chip,
		//    type: 'unknown'
		//  };
		//};

		$scope.enableTaxType= function (ev) {
			debugger;
			$scope.requiredStatus=ev==true?false:true;
			if($scope.requiredStatus)
			{
				$scope.slabrows=[];
				$scope.addNewRow();
			}
			else
			{
				$scope.slabrows=[];
			}
		}

		//////////

		$scope.closeDialog=function()
		{
			$scope.clearTaxField();
			$mdDialog.hide();
		}

		$scope.closeInfoDialog=function()
		{
			$mdDialog.hide();
			$scope.isTaxInfoLoaded = false;

		}

		$scope.clearTaxField= function () {
			vm.editTaxForm.$setPristine();
			vm.editTaxForm.$setUntouched();
			$scope.taxHeader={};
			$scope.slabrows=[];
			//$scope.addrow();
			$scope.taxHeader.taxtype = true;
		}


		$scope.addNewRow=function()
		{
			var tax={};
			tax.frm=0;
			tax.to=0;
			tax.type="";
			tax.amount="Amount";
			tax.taxAmt=0;
			$scope.slabrows.push(tax);
		}

		$scope.addrow = function () {
			//tax.newItem=false;
			debugger;
			$scope.addNewRow();
		}

		$scope.removerow = function (index) {
			if($scope.slabrows.length!=1) {
				$scope.slabrows.splice(index, 1);
			}
		}

		$scope.updateTax=function(ev,index)
		{
			$scope.isTaxInfoLoaded = false;
			debugger;
			$scope.taxHeader={};
			$scope.isUpdate=true;
			//debugger;
			$charge.tax().getTaxByIDs(ev.taxid).success(function(data) {
				debugger;
				console.log(data);
				$scope.taxHeader.taxcode=ev.taxcode;
				$scope.displaytaxCode=ev.taxcode;
				$scope.taxHeader.taxid=ev.taxid;
				$scope.taxHeader.taxDesc="desc";
				if(ev.taxtype=="Fixed")
				{
					$scope.taxHeader.taxtype=1;
					$scope.enableTaxType(true);
					if(data[0].amounttype=="1")
						$scope.taxHeader.amount="Amount";
					else
						$scope.taxHeader.amount="%";
					$scope.taxHeader.taxrate = parseFloat(data[0].amount);
					$scope.slabrows=[];
					$scope.addrow();
				}
				else
				{
					$scope.enableTaxType(false);
					$scope.taxHeader.taxtype=0;
					for(var i=0;i<data.length;i++)
					{
						data[i].newItem=false;
						if(data[i].amounttype=="1")
							data[i].amounttype="Amount";
						else
							data[i].amounttype="%";

						data[i].frm=data[i].slabfrom;
						data[i].to=data[i].slabto;
						data[i].taxAmt=parseFloat(data[i].amount);
						data[i].amount=data[i].amounttype;
					}
					//data[data.length-1].newItem=true;
					$scope.slabrows=data;
				}

				$scope.isTaxInfoLoaded = true;
				// $scope.taxIndEditDialog();
				//taxHd.createddate=new Date();
				//taxHd.createuser="admin";
				//if(taxHd.taxtype=="1" ||taxHd.taxtype==1)
				//  taxHd.taxtype="Fixed";
				//else
				//  taxHd.taxtype="Slab";
				//$scope.fixedRates.splice(index,1);
				//$scope.fixedRates.push(taxHd);
			}).error(function(data) {

			})

		}

		if(index!=null)
			$scope.updateTax(fixedRate,index);
		//vm.editTaxForm = {};

		$scope.submitTax=function(type,index)
		{
			debugger;
			if(vm.editTaxForm.$valid==true) {
				$scope.individualSubmit=true;
				if ($scope.taxHeader.taxcode != undefined && $scope.taxHeader.taxcode != "") {
					if ($scope.isUpdate) {
						var count=0;
						//var fixedTaxObj = $filter('filter')($scope.fixedRates, { taxcode: $scope.taxHeader.taxcode })[0];
						for(var i=0;i<$scope.fixedRates.length;i++)
						{
							if($scope.fixedRates[i].taxcode==$scope.taxHeader.taxcode)
							{
								if($scope.displaytaxCode!=$scope.taxHeader.taxcode) {
									count++;
								}
							}
						}
						if(count==0) {
							$scope.taxdetails = [];
							var taxHeader = $scope.taxHeader;
							var taxDetails = $scope.slabrows;

							if (taxHeader.taxtype == true) {
								taxHeader.taxtype = "1";
							} else {
								taxHeader.taxtype = "0";
							}
							if (taxDetails.length > 0) {
								for (var i = 0; i < taxDetails.length; i++) {
									if (taxDetails[i].amount == "%")
										taxDetails[i].amount = "0";
									else
										taxDetails[i].amount = "1";
									if (taxHeader.taxtype == false) {
										$scope.taxdetails.push
										({
											"slabto": taxDetails[i].to,
											"slabfrom": taxDetails[i].frm,
											"amount": taxDetails[i].taxAmt,
											"amounttype": taxDetails[i].amount
										});
									}
									else {
										if (taxHeader.amount == "Amount")
											taxHeader.amount = "1";
										else
											taxHeader.amount = "0";
										$scope.taxdetails.push
										({
											"slabto": "",
											"slabfrom": "",
											"amount": taxHeader.taxrate,
											"amounttype": taxHeader.amount
										});
									}
								}
							}
							else {
								if (taxHeader.amount == "Amount")
									taxHeader.amount = "1";
								else
									taxHeader.amount = "0";
								$scope.taxdetails.push
								({
									"slabto": "",
									"slabfrom": "",
									"amount": taxHeader.taxrate,
									"amounttype": taxHeader.amount
								});
							}


							var req = {
								"taxid": taxHeader.taxid,
								"taxcode": taxHeader.taxcode,
								"taxtype": taxHeader.taxtype,
								"status": "1",
								"taxdetails": $scope.taxdetails
							}
							$charge.tax().updateTax(req).success(function (data) {
								debugger;
								notifications.toast("Tax has been updated.", "success");
								$scope.isTaxInfoLoaded = false;
								$scope.individualSubmit = false;
								var taxHd = req;
								taxHd.createddate = new Date();
								taxHd.createuser = "admin";
								if (taxHd.taxtype == "1" || taxHd.taxtype == 1)
									taxHd.taxtype = "Fixed";
								else
									taxHd.taxtype = "Slab";
								var taxObj = $filter('filter')($scope.fixedRates, {taxid: taxHd.taxid})[0];
								var index = $scope.fixedRates.indexOf(taxObj);
								$scope.fixedRates.splice(index, 1);
								taxHd.taxState = false;
								$scope.fixedRates.push(taxHd);
								vm.editTaxForm.$setPristine();
								vm.editTaxForm.$setUntouched();
								$scope.taxHeader = {};
								$scope.taxHeader.taxtype = true;
								$scope.requiredStatus = false;
								$scope.slabrows = [];
								$scope.addrow();
								$scope.isUpdate = false;
								$mdDialog.hide();
							}).error(function (data) {
								$scope.isTaxInfoLoaded = false;
								$scope.individualSubmit = false;
							})
						}
						else
						{
							notifications.toast("Tax Code is already exist.", "error");
							$scope.taxHeader.taxcode = $scope.displaytaxCode;
							$scope.individualSubmit=false;
						}
					}
					else {
						var isTax = false;
						if ($scope.fixedRates.length != 0) {
							for (var i = 0; i < $scope.fixedRates.length; i++) {
								if ($scope.fixedRates[i].taxcode == $scope.taxHeader.taxcode) {
									isTax = true;
									notifications.toast("Tax Code is already exist.", "error");
									$scope.taxHeader.taxcode = "";
									$scope.individualSubmit=false;
									break;
								}
							}
						}
						if (!isTax) {
							$scope.taxDet = [];
							var taxHeader = $scope.taxHeader;
							var slabdetails = $scope.slabrows;
							for (var i = 0; i < slabdetails.length; i++) {
								if (taxHeader.taxtype == 0) {
									if (slabdetails[i].amount == "Amount")
										slabdetails[i].amount = "1";
									else
										slabdetails[i].amount = "0";
									$scope.taxDet.push
									({
										"slabto": slabdetails[i].to,
										"slabfrom": slabdetails[i].frm,
										"amount": slabdetails[i].taxAmt,
										"amounttype": slabdetails[i].amount
									});
								}
								else {
								}
							}
							//debugger;
							if (taxHeader.taxtype == true) {
								taxHeader.taxtype = 1;
								if (taxHeader.amount == "Amount")
									taxHeader.amount = "1";
								else
									taxHeader.amount = "0";
								$scope.taxDet.push
								({
									"slabto": "",
									"slabfrom": "",
									"amount": taxHeader.taxrate,
									"amounttype": taxHeader.amount
								});
							}
							else {
								taxHeader.taxtype = 0;

							}
							var req = {
								"taxcode": taxHeader.taxcode,
								"taxtype": taxHeader.taxtype,
								"status": "1",
								"taxdetails": $scope.taxDet
							}

							$charge.tax().storeTax(req).success(function (data) {
								debugger;
								$scope.individualSubmit=false;
								var taxHd = req;
								taxHd.taxid = data.data.taxId;
								taxHd.createddate = new Date();
								taxHd.createuser = "admin";
								if (taxHd.taxtype == "1" || taxHd.taxtype == 1)
									taxHd.taxtype = "Fixed";
								else
									taxHd.taxtype = "Slab";
								taxHd.taxState=false;
								$scope.fixedRates.push(taxHd);
								$scope.taxGroupList = [];
								var skipGrp = 0, takeGrp = 100;
								$charge.tax().allgroups(skipGrp, takeGrp, "asc").success(function (data) {
									debugger;
									notifications.toast("Tax has been added.", "success");
									skipGrp += takeGrp;
									if (response == "") {
										for (var i = 0; i < data.length; i++) {
											$scope.taxGroupList.push(data[i]);

										}
										//$scope.more();
										$scope.taxHeader.taxtype = true;
										$scope.requiredStatus = false;
										//}
									}

									$scope.isTaxInfoLoaded = false;
								}).error(function (data) {
									//console.log(data);
									// response = data;
									$scope.isTaxInfoLoaded = false;
									$scope.isSpinnerShown = false;
									$scope.individualSubmit=false;
								})
								vm.editTaxForm.$setPristine();
								vm.editTaxForm.$setUntouched();
								$scope.taxHeader = {};
								$scope.slabrows = [];
								$scope.addrow();
							}).error(function (data) {
								$scope.individualSubmit=false;
								$scope.isTaxInfoLoaded = false;
							})

							$mdDialog.hide();

						}
					}
				}
				else {
					notifications.toast("Tax code cannot be empty.", "error");
					$scope.individualSubmit=false;
				}
			}
		}

	}
})();
