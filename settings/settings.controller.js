(function ()
{
	'use strict';
	////////////////////////////////
	// App : Settings
	// Owner  : Suvethan
	// Last changed date : 2016/11/10
	// Version : 6.0.0.9
	// Updated By : Kasun
	/////////////////////////////////
	angular
		.module('app.settings')
		.controller('settingscontroller', settingscontroller)
		.directive('imageResize', function($q) {
			return {
				restrict: 'A',
				scope: {
					percent: '@imageResizePercent',
					src: '@',
					id: '@'
				},
				link: function (scope, element, attr) {
					var canvas;

					// Creates a new image object from the src
					// Uses the deferred pattern
					var createImage = function (src) {
						var deferred = $q.defer();
						var img = new Image();

						img.onload = function() {
							deferred.resolve(img);
						};
						img.src = src;

						return deferred.promise;
					};

					// Resize image
					var resize = function (img) {
						canvas = document.getElementById(scope.id);
						var ctx = canvas.getContext("2d");

						var newHeight = (img.height * scope.percent) / 100;
						var newWidth = (img.width * scope.percent) / 100;

						canvas.width = newWidth;
						canvas.height = newHeight;
						ctx.drawImage(img, 0, 0, newHeight, newWidth);
					};

					// Create an Image, when loaded pass it on to the resizer
					var startResize = function () {
						createImage(scope.src)
							.then(resize, function () {
								// console.log('error')
							});
					};

					if (scope.percent !== 100) {
						startResize();
					}
				}
			}
		})
		.directive('dragAndDrop', function() {
			return {
				restrict: 'A',
				link: function ($scope, elem, attr) {
					elem.bind('dragover', function (e) {
						e.stopPropagation();
						e.preventDefault();
						$scope.divClass = true;
						//debugger;
						// e.dataTransfer.dropEffect = 'copy';
					});
					elem.bind('dragenter', function (e) {
						e.stopPropagation();
						e.preventDefault();
						$scope.$apply(function () {
							$scope.divClass = true;
						});
					});
					elem.bind('dragleave', function (e) {
						e.stopPropagation();
						e.preventDefault();
						$scope.$apply(function () {
							$scope.divClass = '';
						});
					});
					elem.bind('drop', function (e) {
						e.stopPropagation();
						e.preventDefault();

						var files = e.originalEvent.dataTransfer.files;

						if (files && files[0]) {
							var FR= new FileReader();

							FR.readAsDataURL( files[0] );
							FR.addEventListener("load", function(e) {
								// $timeout(function () {
								$scope.addedImage = e.target.result;
								$scope.$apply();
								$scope.divClass = false;
								// },0);
							});
						}

						if(files.length > 0) {
							$scope.productImgChanged = true;
							var splitIndex=files[0].name.lastIndexOf('.');
							$scope.productImgFileName = files[0].name.substr(0,splitIndex);
							// $scope.productImgFileType = files[0].type.split("/")[1];
							$scope.productImgFileType = 'jpg';
							// if($scope.productImgFileType == 'jpeg'){$scope.productImgFileType = "jpg";}
						}

					});
				}
			}
		});

	/** @ngInject */
	function settingscontroller($window,$scope, $document, $timeout, $mdDialog, $mdMedia, $mdSidenav,$rootScope,$charge,$filter,notifications,$state,$storage,$uploader,$http,logHelper)
	{
		var vm = this;
		vm.settingsCategoryState = "default";
		vm.sidenavActiveState = '';
		vm.colors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'pink-bg', 'purple-bg'];
		// vm.selectedAccount = 'creapond';
		vm.selectedProduct = {};
		vm.toggleSidenav = toggleSidenav;

		vm.responsiveReadPane = undefined;
		vm.dynamicHeight = false;

		vm.scrollPos = 0;
		vm.scrollEl = angular.element('#content');
		vm.taxstat = 'Fixed';

		// Methods
		vm.closeReadPane = closeReadPane;
		vm.settingsCategoryNavigation = settingsCategoryNavigation;
		vm.companyLogoGuide = {
			fresh: 'or add a logo',
			editable: 'add a new logo'
		};
		vm.isEditable = false;
		vm.previewLayout = 'column';
		vm.setPreviewLayout = setPreviewLayout;
		//vm.templateName = 'Company Name';
		//vm.footerDisclaimer = {
		//  greeting: 'Please pay within 7 days. Thank you for your business.',
		//  message: 'In condimentum malesuada efficitur. Mauris volutpat placerat auctor. Ut ac congue dolor. Quisque scelerisque lacus sed feugiat fermentum. Cras aliquet facilisis pellentesque. Nunc hendrerit quam at leo commodo, a suscipit tellus dapibus. Etiam at felis volutpat est mollis lacinia. Mauris placerat sem sit amet velit mollis, in porttitor ex finibus. Proin eu nibh id libero tincidunt lacinia et eget eros.'
		//};

		var settingsTabs = document.getElementById('settingsTabs');
		angular.forEach(settingsTabs.children[1].children, function (tab) {
			//console.log(tab)
		});
		//settingsTabs.find('md-tab-content').addClass('ms-scroll');

		$scope.planChangeView=false;


		//////////
		$scope.showTaxesFor = "";

		/**
		 * Returns a random integer between min (inclusive) and max (inclusive)
		 */
		function getRandomInt(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}

		function gst(name) {
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') c = c.substring(1, c.length);
				if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
			}
			//debugger;
			return null;
		}

		/** Get currentDomain for applications*/
		$scope.accCategory = gst('category');
		/** --------------------------------- */

		$scope.setTaxesFor = function (code, group, index) {
			$scope.showTaxesFor = code;
		}

		$scope.taxGroupDialogInit = function(ev) {
			$mdDialog.show({
				controller: 'TaxGroupDialogController as vm',
				templateUrl: 'app/main/settings/dialogs/taxGroupDialog.html',
				targetEvent: ev,
				clickOutsideToClose:false,
				locals: {
					fixedRates : $scope.fixedRates,
					taxGroupList : $scope.taxGroupList,
					indexGrp:null,
					groupTaxData:null,
					code:null,
					infoDialog : null,
					groupTaxInfo : null
				}
			}).then(function(answer) {
			}, function() {
			});
		};

		$scope.taxGroupEditDialog = function(ev, groupTaxData,index,code) {
			$mdDialog.show({
				controller: 'TaxGroupDialogController as vm',
				templateUrl: 'app/main/settings/dialogs/taxGroupDialog.html',
				targetEvent: ev,
				clickOutsideToClose:false,
				locals: {
					fixedRates : $scope.fixedRates,
					taxGroupList : $scope.taxGroupList,
					indexGrp:index,
					groupTaxData:groupTaxData,
					code:code,
					infoDialog : null,
					groupTaxInfo : null
				}
			}).then(function(answer) {
			}, function() {
			});
		};

		$scope.taxGroupInfoDialog = function(ev, groupTaxData,index,code) {

			$mdDialog.show({
				controller: 'TaxGroupDialogController as vm',
				templateUrl: 'app/main/settings/dialogs/taxGroupInfoDialog.html',
				targetEvent: ev,
				clickOutsideToClose:false,
				locals: {
					fixedRates : $scope.fixedRates,
					taxGroupList : null,
					indexGrp:index,
					groupTaxData:groupTaxData,
					code:code,
					infoDialog : null,
					groupTaxInfo : null
				}
			}).then(function(answer) {
			}, function() {
			});
		};

		$scope.taxIndAddDialog = function(ev) {
			$mdDialog.show({
				controller: 'TaxIndividualDialogController as vm',
				templateUrl: 'app/main/settings/dialogs/taxIndividDialog.html',
				targetEvent: ev,
				clickOutsideToClose:false,
				locals: {
					fixedRates : $scope.fixedRates,
					fixedRate:null,
					index:null,
					dialogInfo : null,
					general : $scope.general
				}
			}).then(function(answer) {
			}, function() {
			});
		};

		$scope.taxIndEditDialog = function(ev,fixedRate,index) {
			$mdDialog.show({
				controller: 'TaxIndividualDialogController as vm',
				templateUrl: 'app/main/settings/dialogs/taxIndividDialog.html',
				targetEvent: ev,
				clickOutsideToClose:false,
				locals: {
					fixedRates : $scope.fixedRates,
					fixedRate:fixedRate,
					index:index,
					dialogInfo : null,
					general : $scope.general
				}
			}).then(function(answer) {
			}, function() {
			});
		};

		$scope.taxInfoDialog = function(ev,fixedRate,index) {
			$mdDialog.show({
				controller: 'TaxIndividualDialogController',
				templateUrl: 'app/main/settings/dialogs/taxInfoDialog.html',
				targetEvent: ev,
				clickOutsideToClose:false,
				locals: {
					fixedRates : $scope.fixedRates,
					fixedRate:fixedRate,
					index:index,
					dialogInfo : null,
					general : $scope.general
				}
			}).then(function(answer) {
			}, function() {
			});
		};

		function setPreviewLayout(){

		}

		// Watch screen size to activate responsive read pane
		$scope.$watch(function ()
		{
			return $mdMedia('gt-md');
		}, function (current)
		{
			vm.responsiveReadPane = !current;
		});

		// Watch screen size to activate dynamic height on tabs
		$scope.$watch(function ()
		{
			return $mdMedia('xs');
		}, function (current)
		{
			vm.dynamicHeight = current;
		});

		$scope.$watch(function () {
			var elem = document.querySelector('#billingFrqCurrency');
			var elem2 = document.querySelector('#billingFrqCurrencyEdit');
			if(elem != null){
				if(elem.innerText == "$0"){
					var innerCurr = elem.innerText.split('0')[0];
					elem.innerText = innerCurr;
				}
			}
			if(elem2 != null){
				if(elem2.innerText == "$0"){
					var innerCurr = elem2.innerText.split('0')[0];
					elem2.innerText = innerCurr;
				}
			}
		});

		/**
		 * Close read pane
		 */
		function settingsCategoryNavigation(state)
		{
			vm.settingsCategoryState = state;
			vm.sidenavActiveState = state;
			switch(state)
			{
				case 'plans':
					$scope.loadPlanAttributes();
					break;
				case 'products':
					$scope.loadProductAttributes();
					break;
				case 'webhooks':
					$scope.loadWebhooksAttributes();
					break;
				case 'emailtemplate':
					$scope.loadEmailTemplateAttributes();
					break;
				case 'invoice':
					$scope.loadInvoiceAttributes();
					break;
				case 'quotation':
					$scope.loadQuotationAttributes();
					break;
				case 'payment':
					$scope.loadPaymentAttributes();
					break;
				case 'inventory':
					$scope.loadInventoryAttributes();
					break;
				case 'individual-tax':
					$scope.loadIndividualTaxes();
					$scope.loadTaxGrps();
					break;
				case 'tax-groups':
					$scope.loadTaxGrps();
					break;
				default :
					break;

			}
			//if(state=='products')
			//  $scope.loadProductAttributes();

		}


		/**
		 * Close read pane
		 */
		function closeReadPane()
		{
			if ( angular.isDefined(vm.responsiveReadPane) && vm.responsiveReadPane )
			{
				vm.activeProductPaneIndex = 0;

				$timeout(function ()
				{
					vm.scrollEl.scrollTop(vm.scrollPos);
				}, 650);
			}
		}

		function toggleSidenav(sidenavId)
		{
			$mdSidenav(sidenavId).toggle();
		}

		/**
		 * Collapsible Sidenav Lists
		 */


		/*
		 * General tab started
		 */
		$rootScope.selectedProduct = {};
		$scope.changeProduct={};
		$scope.general={};
		$scope.status="true";
		$scope.taxes = ['10', '20', '30', '40'];
		$scope.currencies=[];
		$scope.baseCurrencyDet=[];
		$scope.currencyFormatDet=[];
		$scope.timezoneDet=[];
		$scope.dateformatDet=[];
		$scope.frequentCurrencies=[];
		$scope.selectFixed = true;

		$scope.currencyFormat=['######.##','###,###.##','### ###.##'];
		$scope.timezones=['Zone 1','Zone 2'];
		$scope.dateformats=['DateFormat 1','DateFormat 2'];
		$scope.languages=[];
		$scope.papersizes=['A4','B5','A2'];
		$scope.userCurrencies=[];
		$scope.isPreview=false;
		$scope.template={}
		$scope.footerDet={};
		$scope.footerDet.greeting='Thank you for your business';
		$scope.footerDet.disclaimer='';

		//$scope.template.companyName="Company Name";

		$charge.settings().currencies().success(function(data) {
			//
			for (var key in data) {
				var dataRec=data[key];
				$scope.currencies.push(dataRec);
			}
			//
			//console.log(data);
		}).error(function(data) {
			//console.log(data);
		})

		$charge.settings().languages().success(function(data) {
			//
			//for (var key in data) {
			//    $scope.languages.push(key);
			//}
			var arr = $.map(data, function(el) { return el; })
			for(var i=0;i<arr.length;i++)
			{
				$scope.languages.push(arr[i]);
			}
			//console.log(data);
		}).error(function(data) {
			//console.log(data);
		})

		var self = this;
		self.selectedItem  = null;
		self.searchText    = null;
		//self.querySearch   = querySearch;

		$scope.querySearch =function (query) {

			//Custom Filter
			//
			var results=[];
			for (var i = 0; i< $scope.currencies.length;  ++i){
				//console.log($scope.allBanks[i].value.value);
				//
				if($scope.currencies[i].code.toLowerCase().indexOf(query.toLowerCase()) !=-1)
				{
					if($scope.currencies[i].code.toLowerCase().startsWith(query.toLowerCase()))
					{
						results.push($scope.currencies[i]);
					}
				}
			}
			return results;
		}
		$scope.setBaseCurrency=function(ev)
		{
			//
			if(ev!=undefined) {

				$scope.general.baseCurrency = ev.code;
				// self.searchText = null;
			}
		}


		var self = this;
		self.searchCurrency    = null;
		//self.queryCurrency   = queryCurrency;

		$scope.queryCurrency=function(query) {

			//Custom Filter
			var results=[];
			for (var i = 0; i<$scope.currencies.length; ++i){
				//console.log($scope.allBanks[i].value.value);
				//
				if($scope.currencies[i].code.toLowerCase().indexOf(query.toLowerCase()) !=-1)
				{
					if($scope.currencies[i].code.toLowerCase().startsWith(query.toLowerCase()))
					{
						results.push($scope.currencies[i]);
					}

				}
			}
			return results;
		}

		$scope.addCurrencyDialog = function() {
			$mdDialog.show({
				controller: 'addCurrencyController as vm',
				templateUrl: 'app/main/settings/dialogs/prompt-add-currency.html',
				clickOutsideToClose:false,
				locals:{
					addCurrency : $scope.addCurrency,
					searchCurrency : self.searchCurrency,
					queryCurrency : $scope.queryCurrency
				}
			});
		};

		$scope.general.userCurrency="";
		$scope.general.currencyName="";
		$scope.addCurrency= function (ev) {

			if(ev!=undefined) {
				var currencyDet = $filter('filter')($scope.userCurrencies, {code: ev.code})[0];
				if(currencyDet==null || currencyDet==undefined) {
					if($scope.general.baseCurrency!=ev.code) {
						$scope.general.userCurrency = $scope.general.userCurrency + " " + ev.code;
						$scope.general.currencyName = $scope.general.currencyName == "" ? ev.name : $scope.general.currencyName + "," + ev.name;

						$scope.userCurrencies.push(ev);
						self.searchCurrency = null;
						$mdDialog.hide();
					}
					else
					{
						notifications.toast("Base currency cannot be added.", "error");
						self.searchCurrency    = null;
						$mdDialog.hide();
					}
				}
				else {
					notifications.toast("Currency Code " + ev.code + " has been already added.", "error");
					self.searchCurrency    = null;
				}
			}
		}

		$scope.clearFields= function () {
			//self.searchText= "";
			//self.searchCurrency="";
			//$scope.general.baseCurrency="";
			//$scope.general.currencyFormat="";
			//$scope.general.timezone="";
			//$scope.general.dateFormat="";
			//$scope.general.decimalPoint="";
			//$scope.general.userCurrency="";
			//$scope.general.currencyName="";
			//$scope.userCurrencies=[];
			//$scope.template.companyName="";
			//$scope.template.companyAddress="";
			//$scope.template.companyPhone="";
			//$scope.template.companyEmail="";
			//$scope.template.companyLogoPreview=[];
			$state.go($state.current, {}, {reload: true});
		}

		//$scope.clearTaxField= function () {
		//  vm.editTaxForm.$setPristine();
		//  vm.editTaxForm.$setUntouched();
		//  $scope.taxHeader={};
		//  $scope.slabrows=[];
		//  $scope.taxHeader.taxtype=true;
		//  $scope.requiredStatus=false;
		//  $scope.isUpdate=false;
		//  $scope.addrow();
		//}

		//$scope.clearTaxGrpFields= function () {
		//  $scope.taxgrpdetails=[];
		//  $scope.taxGrpHeader={};
		//  $scope.isUpdateGrp=false;
		//}



		var isBaseCurrency=false,isCurrencyFormat=false,isTimeZone=false,isDateFormat=false,isFrequentCurrency=false,isFrequentCurrencyName=false,isDecimalPoint=false;
		$scope.isDeleted=false;
		$scope.isAllGenLoaded = false;
		$scope.allGenLoaded = false;
		var tempCurrencyCodes;
		var tempCurrencyNames;
		$scope.gen1Loading = false;
		$charge.settingsapp().getDuobaseValuesByTableName("CTS_GeneralAttributes").success(function(data) {
			isBaseCurrency=true;
			isCurrencyFormat=true;
			isDecimalPoint=true;
			isTimeZone=true;
			isDateFormat=true;
			isFrequentCurrency=true;
			isFrequentCurrencyName=true;
			$scope.isAllGenLoaded=true;
			//
			$scope.baseCurrencyDet=data[0];
			$scope.general.baseCurrency=data[0].RecordFieldData;

			$scope.loadOnlinePaymentRegistration(); // load gateways

			$scope.UIbaseCurrency=angular.copy($scope.general.baseCurrency);
			$scope.baseCurrency=data[0].RecordFieldData;
			$scope.general.GURecID=data[0].GuRecID;
			//$scope.isAllGenLoaded.push("ok");

			$scope.currencyFormatDet=data[1];
			$scope.general.currencyFormat=data[1].RecordFieldData;
			//$scope.isAllGenLoaded.push("ok");

			$scope.decimalPointDet=data[6];
			$scope.general.decimalPoint=parseInt(data[6].RecordFieldData);
			//$scope.isAllGenLoaded.push("ok");

			$scope.timezoneDet=data[2];
			$scope.general.timezone=data[2].RecordFieldData;
			// $scope.isAllGenLoaded.push("ok");

			$scope.dateformatDet=data[3];
			$scope.general.dateFormat=data[3].RecordFieldData;
			//$scope.isAllGenLoaded.push("ok");


			tempCurrencyCodes=[];
			//
			$scope.frequentCurrencies=data[4];
			$scope.general.userCurrency=data[4].RecordFieldData;
			tempCurrencyCodes=data[4].RecordFieldData.trimLeft().split(" ");
			var currencyCode=data[4];

			tempCurrencyNames=[];
			$scope.userCurrencies=[];
			var currencyNames=data[5];
			$scope.frequentCurrencyNames=data[5];
			$scope.general.currencyName=data[5].RecordFieldData;
			tempCurrencyNames=data[5].RecordFieldData.trimLeft().split(",");
			for(var i=0;i<tempCurrencyCodes.length;i++)
			{
				if(tempCurrencyCodes!="") {
					$scope.userCurrencies.push({
						code: tempCurrencyCodes[i],
						name: tempCurrencyNames[i],
						currencyCode: currencyCode,
						currencyName: currencyNames
					});
				}
			}
			//$scope.isAllGenLoaded.push("ok");
			$scope.gen1Loading = true;

		}).error(function(data) {
			isBaseCurrency=false;
			isCurrencyFormat=false;
			isDecimalPoint=false;
			isTimeZone=false;
			isDateFormat=false;
			isFrequentCurrency=false;
			isFrequentCurrencyName=false;
			$scope.isAllGenLoaded=false;
			$scope.gen1Loading = true;
			$scope.loadOnlinePaymentRegistration();
		})


		//$charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_GeneralAttributes","BaseCurrency").success(function(data) {
		//  //
		//  isBaseCurrency=true;
		//  $scope.baseCurrencyDet=data;
		//  $scope.general.baseCurrency=data[0].RecordFieldData;
		//  $scope.baseCurrency=data[0].RecordFieldData;
		//  $scope.general.GURecID=data[0].GuRecID;
		//  $scope.isAllGenLoaded.push("ok");
		//}).error(function(data) {
		//
		//  //$scope.general.GURecID=data[0].GuRecID;
		//  isBaseCurrency=false;
		//  $scope.isAllGenLoaded.push("ok");
		//
		//})




		//$charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_GeneralAttributes","CurrencyFormat").success(function(data) {
		//  isCurrencyFormat=true;
		//  $scope.currencyFormatDet=data;
		//  $scope.general.currencyFormat=data[0].RecordFieldData;
		//  $scope.isAllGenLoaded.push("ok");
		//
		//}).error(function(data) {
		//  isCurrencyFormat=false;
		//  $scope.isAllGenLoaded.push("ok");
		//})


		//$charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_GeneralAttributes","DecimalPointLength").success(function(data) {
		//  isDecimalPoint=true;
		//  $scope.decimalPointDet=data;
		//  $scope.general.decimalPoint=parseInt(data[0].RecordFieldData);
		//  $scope.isAllGenLoaded.push("ok");
		//}).error(function(data) {
		//  isDecimalPoint=false;
		//  $scope.isAllGenLoaded.push("ok");
		//})

		//$charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_GeneralAttributes","TimeZone").success(function(data) {
		//  isTimeZone=true;
		//  $scope.timezoneDet=data;
		//  $scope.general.timezone=data[0].RecordFieldData;
		//  $scope.isAllGenLoaded.push("ok");
		//}).error(function(data) {
		//  isTimeZone=false;
		//  $scope.isAllGenLoaded.push("ok");
		//})

		//$charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_GeneralAttributes","DateFormat").success(function(data) {
		//  isDateFormat=true;
		//  $scope.dateformatDet=data;
		//  $scope.general.dateFormat=data[0].RecordFieldData;
		//  $scope.isAllGenLoaded.push("ok");
		//}).error(function(data) {
		//  isDateFormat=false;
		//  $scope.isAllGenLoaded.push("ok");
		//})

		//$charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_GeneralAttributes","FrequentCurrencies").success(function(data) {
		//  isFrequentCurrency=true;
		//  tempCurrencyCodes=[];
		//  //
		//  $scope.frequentCurrencies=data;
		//  $scope.general.userCurrency=data[0].RecordFieldData;
		//  tempCurrencyCodes=data[0].RecordFieldData.trimLeft().split(" ");
		//  var currencyCode=data[0];
		//  $charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_GeneralAttributes","FrequentCurrencyNames").success(function(data) {
		//    isFrequentCurrencyName=true;
		//    tempCurrencyNames=[];
		//    $scope.userCurrencies=[];
		//    var currencyNames=data[0];
		//    $scope.frequentCurrencyNames=data;
		//    $scope.general.currencyName=data[0].RecordFieldData;
		//    tempCurrencyNames=data[0].RecordFieldData.trimLeft().split(",");
		//    for(var i=0;i<tempCurrencyCodes.length;i++)
		//    {
		//      if(tempCurrencyCodes!="") {
		//        $scope.userCurrencies.push({
		//          code: tempCurrencyCodes[i],
		//          name: tempCurrencyNames[i],
		//          currencyCode: currencyCode,
		//          currencyName: currencyNames
		//        });
		//      }
		//    }
		//    $scope.isAllGenLoaded.push("ok");
		//
		//  }).error(function(data) {
		//    isFrequentCurrencyName=false;
		//  })
		//}).error(function(data) {
		//  isFrequentCurrency=false;
		//  $scope.isAllGenLoaded.push("ok");
		//})

		$scope.allGenLoadedCount=0;
		//$scope.$watch(function () {
		//  if($scope.isAllGenLoaded==true && $rootScope.firstLoginDitected==false){
		//    $scope.allGenLoaded = true;
		//  }
		//})
		$scope.allGenLoaded = true;
		//if($scope.allGenLoaded )
		//{
		//  if($rootScope.firstLoginDitected === true){
		//    $scope.initSiteTour();
		//  }
		//}

		$scope.exportDummyLogo = function () {
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');
			ctx.canvas.width = 180;
			ctx.canvas.height = 180;
			var img = new Image();
			img.setAttribute('crossOrigin', 'anonymous');
			img.onload = function() {
				ctx.drawImage(img, 0, 0);
				$scope.cropper.croppedImage = $scope.template.croppedLogo = canvas.toDataURL("image/jpeg", "");
				$scope.productImgFileName = 'dummy_logo';
				$scope.productImgFileType = 'jpg';
				$scope.tempCompanyLogo = $scope.cropper.croppedImage;
			}
			img.src = 'https://ccresourcegrpdisks974.blob.core.windows.net/b2c/images/dummy_logo.jpg';
		};

		var isTemplateDet=false;
		$scope.template.companyLogo=[];
		$scope.template.croppedLogo="";
		$scope.gen2Loading = false;
		$charge.settingsapp().getDuobaseValuesByTableName("CTS_CompanyAttributes").success(function(data) {
			isTemplateDet=true;
			//
			$scope.template.companyDet=data;
			$scope.template.companyName=data[0].RecordFieldData;
			$scope.template.companyAddress=data[1].RecordFieldData;
			$scope.template.companyPhone=data[2].RecordFieldData;
			$scope.template.companyEmail=data[3].RecordFieldData;
			$scope.template.companyLogoPreview=(data[4].RecordFieldData=="")?"":data[4].RecordFieldData=="Array"?"":data[4].RecordFieldData;
			$scope.template.croppedLogo=(data[4].RecordFieldData=="")?"":data[4].RecordFieldData=="Array"?"":data[4].RecordFieldData;

			$rootScope.companyDetailsPublic = $scope.template;
			if($scope.template.croppedLogo!=""){
				vm.isEditable=true;
				//$http({
				//  method: 'GET',
				//  url: $scope.template.croppedLogo
				//}).then(function successCallback(response) {
				//  $scope.cropper.croppedImage = response.data;
				//}, function errorCallback(response) {
				//
				//});
				if($scope.template.croppedLogo.split('/')[$scope.template.croppedLogo.split('/').length-1].split('.')[0] == 'dummy_logo'){
					$timeout(function(){
						$scope.tempCompanyLogo = $scope.template.croppedLogo;
						$scope.editImageOn = true;
					},0);
				}
				$scope.cropper.croppedImage=$scope.template.croppedLogo;
				$rootScope.companyLogoPublic=$scope.template.croppedLogo;
				$scope.gen2Loading = true;
			}
			else{
				$scope.exportDummyLogo();
				$timeout(function(){
					$scope.tempCompanyLogo = $scope.template.croppedLogo;
					$scope.editImageOn = true;
				},0);
				$scope.gen2Loading = true;
			}
			//vm.previewLayout = 'row';
			$scope.template.GURecID=data[0].GuRecID;
		}).error(function(data) {
			$scope.exportDummyLogo();
			$timeout(function(){
				$scope.editImageOn = true;
			},0);
			isDateFormat=false;
			$scope.gen2Loading = true;
		})


		var isFooterDet=false;
		$charge.settingsapp().getDuobaseValuesByTableName("CTS_FooterAttributes").success(function(data) {
			isFooterDet=true;
			//
			$scope.footerDet.footersDet=data;
			$scope.footerDet.greeting=data[0].RecordFieldData;
			$scope.footerDet.disclaimer=data[1].RecordFieldData!=""?atob(data[1].RecordFieldData):"";
			$scope.footerDet.GURecID=data[0].GuRecID;
		}).error(function(data) {
			isFooterDet=false;
		})



		$charge.subscription().getTranCount().success(function(data) {
			$scope.transactionCount=data['count'];
			//

		}).error(function(data) {

			$scope.infoJson= {};
			$scope.infoJson.message =JSON.stringify(data);
			$scope.infoJson.app ='settings';
			logHelper.error( $scope.infoJson);

		})




		//$scope.deleteGeneral= function () {
		//  $charge.commondata().delete($scope.baseCurrencyDet[0]).success(function (data) {
		//    $charge.commondata().delete($scope.currencyFormatDet[0]).success(function (data) {
		//      $charge.commondata().delete($scope.timezoneDet[0]).success(function (data) {
		//        $charge.commondata().delete($scope.dateformatDet[0]).success(function (data) {
		//          $charge.commondata().delete($scope.frequentCurrencies[0]).success(function (data) {
		//            $charge.commondata().delete($scope.frequentCurrencyNames[0]).success(function (data) {
		//              $charge.commondata().delete($scope.decimalPointDet[0]).success(function (data) {
		//              var req = {
		//                "RecordName": "CTS_GeneralAttributes",
		//                "FieldName": "BaseCurrency",
		//                "RecordFieldData": $scope.general.baseCurrency
		//              }
		//                $charge.commondata().insertDuoBaseValuesAddition(req).success(function (data) {
		//                  var req = {
		//                    "RecordName": "CTS_GeneralAttributes",
		//                    "FieldName": "CurrencyFormat",
		//                    "RecordFieldData": $scope.general.currencyFormat
		//                  }
		//                  $charge.commondata().insertDuoBaseValuesAddition(req).success(function (data) {
		//                    var req = {
		//                      "RecordName": "CTS_GeneralAttributes",
		//                      "FieldName": "TimeZone",
		//                      "RecordFieldData": $scope.general.timezone
		//                    }
		//                    $charge.commondata().insertDuoBaseValuesAddition(req).success(function (data) {
		//                      var req = {
		//                        "RecordName": "CTS_GeneralAttributes",
		//                        "FieldName": "DateFormat",
		//                        "RecordFieldData": $scope.general.dateFormat
		//                      }
		//                      $charge.commondata().insertDuoBaseValuesAddition(req).success(function (data) {
		//                        var req = {
		//                          "RecordName": "CTS_GeneralAttributes",
		//                          "FieldName": "FrequentCurrencies",
		//                          "RecordFieldData": $scope.general.userCurrency
		//                        }
		//                        //
		//                        $charge.commondata().insertDuoBaseValuesAddition(req).success(function (data) {
		//                          var req = {
		//                            "RecordName": "CTS_GeneralAttributes",
		//                            "FieldName": "FrequentCurrencyNames",
		//                            "RecordFieldData": $scope.general.currencyName
		//                          }
		//                          $charge.commondata().insertDuoBaseValuesAddition(req).success(function (data) {
		//                            var req = {
		//                              "RecordName": "CTS_GeneralAttributes",
		//                              "FieldName": "DecimalPointLength",
		//                              "RecordFieldData": $scope.general.decimalPoint
		//                            }
		//                            $charge.commondata().insertDuoBaseValuesAddition(req).success(function (data) {
		//                              notifications.toast("General records has been saved.", "success");
		//                              $state.go($state.current, {}, {reload: true});
		//                              $scope.spinnerGeneral = false;
		//                            }).error(function (data) {
		//
		//                            })
		//                          }).error(function (data) {
		//
		//                          })
		//                        }).error(function (data) {
		//
		//                        })
		//                      }).error(function (data) {
		//
		//                      })
		//                    }).error(function (data) {
		//
		//                    })
		//                  }).error(function (data) {
		//
		//                  })
		//                }).error(function (data) {
		//
		//                }).error(function (data) {
		//
		//                })
		//              }).error(function (data) {
		//
		//              })
		//            }).error(function (data) {
		//
		//            })
		//          }).error(function (data) {
		//
		//          })
		//        }).error(function (data) {
		//
		//        })
		//      }).error(function (data) {
		//
		//      })
		//    }).error(function (data) {
		//
		//    })
		//  }).error(function (data) {
		//
		//  })
		//}


		$scope.deleteGeneral= function () {

			$charge.settingsapp().deleteCommmon($scope.general.GURecID).success(function (data) {

				var req = [{
					"RecordName": "CTS_GeneralAttributes",
					"FieldName": "BaseCurrency",
					"RecordFieldData": $scope.general.baseCurrency
				},
					{
						"RecordName": "CTS_GeneralAttributes",
						"FieldName": "CurrencyFormat",
						"RecordFieldData": $scope.general.currencyFormat
					},
					{
						"RecordName": "CTS_GeneralAttributes",
						"FieldName": "TimeZone",
						"RecordFieldData": $scope.general.timezone
					},
					{
						"RecordName": "CTS_GeneralAttributes",
						"FieldName": "DateFormat",
						"RecordFieldData": $scope.general.dateFormat
					},
					{
						"RecordName": "CTS_GeneralAttributes",
						"FieldName": "FrequentCurrencies",
						"RecordFieldData": $scope.general.userCurrency
					},
					{
						"RecordName": "CTS_GeneralAttributes",
						"FieldName": "FrequentCurrencyNames",
						"RecordFieldData": $scope.general.currencyName
					},
					{
						"RecordName": "CTS_GeneralAttributes",
						"FieldName": "DecimalPointLength",
						"RecordFieldData": $scope.general.decimalPoint
					}]
				$charge.settingsapp().insertBulkDuoBaseValues(req).success(function(data) {
					localStorage.removeItem('firstLogin');
					localStorage.setItem("firstLogin", $scope.general.baseCurrency);
					//notifications.toast("General records have been updated.", "success");
					$scope.deleteCompanyProfile();
				}).error(function (data) {
					notifications.toast("Error occured while updating General Record.", "error");
					$scope.generalSubmit=false;

					$scope.infoJson= {};
					$scope.infoJson.message =JSON.stringify(data);
					$scope.infoJson.app ='settings';
					logHelper.error( $scope.infoJson);
				})
			}).error(function (data) {
				$scope.generalSubmit=false;

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})

		}

		$scope.updateGeneralCheckProcess= function () {

			if($scope.cropper.croppedImage!=null && $scope.cropper.croppedImage!="" && $scope.productImgChanged) {
				//angular.forEach($scope.template.companyLogo, function (obj) {
				var uploadImageObj = {
					"base64Image": $scope.cropper.croppedImage,
					"fileName": $scope.productImgFileName,
					"format": $scope.productImgFileType,
					"app": "Company",
					"fileType": "image"
				}
				$charge.storage().storeImage(uploadImageObj).success(function (data) {
					$scope.template.croppedLogo=data.fileUrl;
					$scope.productImgChanged=false;
					$scope.updateGeneralRecords();

					$scope.infoJson= {};
					$scope.infoJson.message =$scope.productImgFileName+' Company logo uploaded';
					$scope.infoJson.app ='settings';
					logHelper.info( $scope.infoJson);

				}).error(function (data) {
					//console.log(data);
					notifications.toast("Error occured while uploading Company logo.", "error");
					$scope.generalSubmit = false;

					$scope.infoJson= {};
					$scope.infoJson.message =JSON.stringify(data);
					$scope.infoJson.app ='settings';
					logHelper.error( $scope.infoJson);
				})
			}
			else
			{
				$scope.updateGeneralRecords();
			}
		}

		$scope.updateGeneralRecords= function () {
			var updateData=[{
				"RowID": $scope.baseCurrencyDet.RowID,
				"RecordFieldData": $scope.general.baseCurrency
			},
				{
					"RowID": $scope.currencyFormatDet.RowID,
					"RecordFieldData": $scope.general.currencyFormat
				},
				{
					"RowID": $scope.timezoneDet.RowID,
					"RecordFieldData": $scope.general.timezone
				},
				{
					"RowID": $scope.dateformatDet.RowID,
					"RecordFieldData": $scope.general.dateFormat
				},
				{
					"RowID": $scope.frequentCurrencies.RowID,
					"RecordFieldData": $scope.general.userCurrency
				},
				{
					"RowID": $scope.frequentCurrencyNames.RowID,
					"RecordFieldData": $scope.general.currencyName
				},
				{
					"RowID": $scope.decimalPointDet.RowID,
					"RecordFieldData": $scope.general.decimalPoint
				},
				{
					"RowID": $scope.template.companyDet[0].RowID,
					"RecordFieldData": $scope.template.companyName
				},
				{
					"RowID": $scope.template.companyDet[1].RowID,
					"RecordFieldData": $scope.template.companyAddress
				},
				{
					"RowID": $scope.template.companyDet[2].RowID,
					"RecordFieldData": $scope.template.companyPhone
				},
				{
					"RowID": $scope.template.companyDet[3].RowID,
					"RecordFieldData": $scope.template.companyEmail
				},
				{
					"RowID": $scope.template.companyDet[4].RowID,
					"RecordFieldData": $scope.template.croppedLogo
				},
				{
					"RowID": $scope.footerDet.footersDet[0].RowID,
					"RecordFieldData": $scope.footerDet.greeting==undefined?"":$scope.footerDet.greeting
				},
				{
					"RowID": $scope.footerDet.footersDet[1].RowID,
					"RecordFieldData": $scope.footerDet.disclaimer==undefined?"":btoa($scope.footerDet.disclaimer)
				}]

			$charge.settingsapp().updateGeneralDataByRowId(updateData).success(function(data) {
				localStorage.removeItem('firstLogin');
				localStorage.setItem("firstLogin", $scope.general.baseCurrency);
				notifications.toast("General records have been updated.", "success");
				$scope.template.companyLogo=[];
				$scope.productImgChanged=false;
				$scope.generalSubmit=false;
				$state.go($state.current, {}, {reload: true});

				$scope.infoJson= {};
				$scope.infoJson.message ='General records have been updated';
				$scope.infoJson.app ='settings';
				logHelper.info( $scope.infoJson);
			}).error(function (data) {
				notifications.toast("Error occured while updating General Record.", "error");
				$scope.template.companyLogo=[];
				$scope.generalSubmit=false;

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})
		}

		//Save General Records

		//Image Uploader===================================

		$scope.cropper = {};
		$scope.cropper.sourceImage = null;
		$scope.cropper.croppedImage = 'https://ccresourcegrpdisks974.blob.core.windows.net/b2c/images/dummy_logo.jpg';
		$scope.bounds = {};
		$scope.bounds.left = 0;
		$scope.bounds.right = 0;
		$scope.bounds.top = 0;
		$scope.bounds.bottom = 0;
		$scope.productImgFileName = "";
		$scope.productImgSrc = "";
		$scope.productImgChanged = false;
		var files = [];

		// (function () {
		// 	var canvas = document.createElement('canvas');
		// 	var ctx = canvas.getContext('2d');
		// 	ctx.canvas.width = 180;
		// 	ctx.canvas.height = 180;
		// 	var img = new Image();
		// 	img.setAttribute('crossOrigin', 'anonymous');
		// 	img.onload = function() {
		// 		ctx.drawImage(img, 0, 0);
		// 		$scope.cropper.croppedImage = $scope.template.croppedLogo = canvas.toDataURL("image/png", "");
		// 		$scope.tempCompanyLogo = $scope.cropper.croppedImage;
		// 	}
		// 	img.src = 'https://ccresourcegrpdisks974.blob.core.windows.net/b2c/images/dummy_logo.jpg';
		// })();

		$scope.triggerImgInput = function () {
			$scope.addedImage = false;

			angular.element(document.querySelector('#productImageInput')).trigger('click');
			angular.element(document.querySelector('#productImageInput')).on('change', function () {
				files = this.files;

				if (this.files && this.files[0]) {
					var FR= new FileReader();

					FR.readAsDataURL( this.files[0] );
					FR.addEventListener("load", function(e) {
						$timeout(function () {
							$scope.addedImage = e.target.result;
						},0);
					});
				}

				if(files.length > 0) {
					$scope.productImgChanged = true;
					var splitIndex=files[0].name.lastIndexOf('.');
					$scope.productImgFileName = files[0].name.substr(0,splitIndex);
					// $scope.productImgFileType = files[0].type.split("/")[1];
					$scope.productImgFileType = 'jpg';
					// if($scope.productImgFileType == 'jpeg'){$scope.productImgFileType = "jpg";}
				}
			});
		}

		$scope.$watch(function () {
			angular.element('#dragZone').bind('dragover', function(e){
				// console.log('Over');
			})
		});

		// Drag & Drop image #########################################################

		// Drag & Drop image #########################################################

		//Image Uploader 15_06_2017
		vm.showControls = false;
		vm.fit = false;
		$scope.editImageOn = false;

		$scope.editCompanyLogoInit = function () {
			$scope.tempCompanyLogo = angular.copy($scope.cropper.croppedImage);
			$timeout(function(){
				$scope.editImageOn = true;
				//$scope.cropper.croppedImage ? $scope.addedImage = $scope.cropper.croppedImage : $scope.addedImage=false;
			});
		};

		$scope.editCompanyCancel = function () {
			$scope.cropper.croppedImage = $scope.tempCompanyLogo;
			$timeout(function(){
				$scope.editImageOn = false;
				$scope.addedImage = false;
			});
		};

		$scope.retryImageUpload = function () {
			$timeout(function(){
				$scope.editImageOn = false;
				$scope.editImageOn = true;
				$scope.addedImage = false;
				$scope.cropper.croppedImage = $scope.tempCompanyLogo;
			});
		};

		vm.myButtonLabels = {
			rotateLeft: '',
			rotateRight: '',
			zoomIn: '<i class="material-icons">zoom_in</i>',
			zoomOut: '<i class="material-icons">zoom_out</i>',
			fit: '<i class="material-icons">filter_center_focus</i>',
			crop: ''
		};

		vm.updateResultImage = function(base64) {
			vm.resultImage = base64;
			$scope.cropper.croppedImage = vm.resultImage;
			$scope.$apply();
		};

		vm.doneImageCropping = function(cropperApi) {
			// angular.element('#imageCropElement').trigger('Cropped');
			$timeout(function(){
				$scope.editImageOn = false;
				$scope.addedImage = false;
			});
		};

		vm.cropperApi = function(cropperApi) {
			cropperApi.zoomOut(1.01);
			cropperApi.zoomIn(1.01);
			cropperApi.fit();
			$scope.cropper.croppedImage = cropperApi.crop();
			//cropperApi.remove();
			$scope.$apply();
		};
		//Image Uploader 15_06_2017

		//Image Uploader===================================

		$scope.saveGeneralCheck = function() {
			$scope.generalSubmit=true;
			$charge.tenant().checkTenantReady().success(function (data) {
				if(data.status)
				{
					$scope.generalSubmit=false;
					$scope.saveGeneral();
				}
				else
				{
					$scope.saveGeneralCheck();
				}
			}).error(function (data) {
				notifications.toast("Error occured while Checking DB", "error");
				$scope.generalSubmit = false;

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			});
		}

		$scope.generalSubmit=false;
		$scope.imgWidth = "";
		$scope.imgHeight = "";
		$scope.saveGeneral = function() {

			if(vm.generalForm.$valid==true) {
				$scope.generalSubmit=true;
				if (!isBaseCurrency && !isCurrencyFormat && !isTimeZone && !isDateFormat && !isFrequentCurrency && !isFrequentCurrencyName && !isTemplateDet && !isDecimalPoint && !isFooterDet) {

					$scope.generalFields = [];
					$scope.generalFieldValues = [];

					$scope.generalFields.push({
						"FieldCultureName": "BaseCurrency",
						"FieldID": "",
						"FieldName": "BaseCurrency",
						"FieldType": "BaseCurrencyType",
						"ColumnIndex": "0"
					});
					$scope.generalFieldValues.push({
						"RowID": "",
						"RecordFieldData": $scope.general.baseCurrency,
						"ColumnIndex": "0"
					});
					$scope.generalFields.push({
						"FieldCultureName": "CurrencyFormat",
						"FieldID": "",
						"FieldName": "CurrencyFormat",
						"FieldType": "CurrencyFormatType",
						"ColumnIndex": "1"
					});
					$scope.generalFieldValues.push({
						"RowID": "",
						"RecordFieldData": $scope.general.currencyFormat,
						"ColumnIndex": "1"
					});
					$scope.generalFields.push({
						"FieldCultureName": "TimeZone",
						"FieldID": "",
						"FieldName": "TimeZone",
						"FieldType": "TimeZoneType",
						"ColumnIndex": "2"
					});
					$scope.generalFieldValues.push({
						"RowID": "",
						"RecordFieldData": $scope.general.timezone,
						"ColumnIndex": "2"
					});
					$scope.generalFields.push({
						"FieldCultureName": "DateFormat",
						"FieldID": "",
						"FieldName": "DateFormat",
						"FieldType": "DateFormatType",
						"ColumnIndex": "3"
					});
					$scope.generalFieldValues.push({
						"RowID": "",
						"RecordFieldData": $scope.general.dateFormat,
						"ColumnIndex": "3"
					});
					//added 07-07-2016 start
					$scope.generalFields.push({
						"FieldCultureName": "FrequentCurrencies",
						"FieldID": "",
						"FieldName": "FrequentCurrencies",
						"FieldType": "FrequentCurrenciesType",
						"ColumnIndex": "4"
					});
					$scope.generalFieldValues.push({
						"RowID": "",
						"RecordFieldData": $scope.general.userCurrency,
						"ColumnIndex": "4"
					});

					$scope.generalFields.push({
						"FieldCultureName": "FrequentCurrencyNames",
						"FieldID": "",
						"FieldName": "FrequentCurrencyNames",
						"FieldType": "FrequentCurrencyNamesType",
						"ColumnIndex": "5"
					});

					$scope.generalFieldValues.push({
						"RowID": "",
						"RecordFieldData": $scope.general.currencyName,
						"ColumnIndex": "5"
					});

					$scope.generalFields.push({
						"FieldCultureName": "DecimalPointLength",
						"FieldID": "",
						"FieldName": "DecimalPointLength",
						"FieldType": "DecimalPointLengthType",
						"ColumnIndex": "6"
					});

					$scope.generalFieldValues.push({
						"RowID": "",
						"RecordFieldData": $scope.general.decimalPoint == undefined ? 2 : $scope.general.decimalPoint,
						"ColumnIndex": "6"
					});


					//end
					var req = {
						"GURecID": "",
						"RecordType": "CTS_GeneralAttributes",
						"OperationalStatus": "Active",
						"RecordStatus": "Active",
						"Cache": "CTS_GeneralAttributes",
						"Separate": "Test",
						"RecordName": "CTS_GeneralAttributes",
						"GuTranID": "12345",
						"RecordCultureName": "CTS_GeneralAttributes",
						"RecordCode": "CTS_GeneralAttributes",
						"commonDatafieldDetails": $scope.generalFields,
						"commonDataValueDetails": $scope.generalFieldValues
					}

					$charge.settingsapp().store(req).success(function (data) {
						//$scope.generalSubmit = false;
						localStorage.removeItem('firstLogin');
						localStorage.setItem("firstLogin", $scope.general.baseCurrency);
						if ($scope.cropper.croppedImage != "" && $scope.cropper.croppedImage != null) {
							//angular.forEach($scope.template.companyLogo, function (obj) {
							var uploadImageObj = {
								"base64Image": $scope.cropper.croppedImage,
								"fileName": $scope.productImgFileName,
								"format": $scope.productImgFileType,
								"app": "Company",
								"fileType": "image"
							}
							$charge.storage().storeImage(uploadImageObj).success(function (data) {
								$scope.template.companyLogo=data.fileUrl;

								$scope.saveCompanyProfile();
								var req = {
									"GURecID": "",
									"RecordType": "CTS_CompanyAttributes",
									"OperationalStatus": "Active",
									"RecordStatus": "Active",
									"Cache": "CTS_CompanyAttributes",
									"Separate": "Test",
									"RecordName": "CTS_CompanyAttributes",
									"GuTranID": "12345",
									"RecordCultureName": "CTS_CompanyAttributes",
									"RecordCode": "CTS_CompanyAttributes",
									"commonDatafieldDetails": $scope.companyFields,
									"commonDataValueDetails": $scope.companyFieldValues
								}

								$charge.settingsapp().store(req).success(function (data) {
									$scope.saveFooter();
									var req = {
										"GURecID": "",
										"RecordType": "CTS_FooterAttributes",
										"OperationalStatus": "Active",
										"RecordStatus": "Active",
										"Cache": "CTS_FooterAttributes",
										"Separate": "Test",
										"RecordName": "CTS_FooterAttributes",
										"GuTranID": "12345",
										"RecordCultureName": "CTS_FooterAttributes",
										"RecordCode": "CTS_FooterAttributes",
										"commonDatafieldDetails": $scope.footerFields,
										"commonDataValueDetails": $scope.footerFieldValues
									}

									$charge.settingsapp().store(req).success(function (data) {
										notifications.toast("General records has been saved.", "success");
										$scope.generalSubmit = false;
										$state.go($state.current, {}, {reload: true});
										$rootScope.$broadcast('base_available');
										$rootScope.firstLoginDitected = false;

										$scope.infoJson= {};
										$scope.infoJson.message ='General records has been saved';
										$scope.infoJson.app ='settings';
										logHelper.info( $scope.infoJson);
									}).error(function (data) {
										notifications.toast("Error occured while saving company profile.", "error");
										$scope.generalSubmit = false;

										$scope.infoJson= {};
										$scope.infoJson.message =JSON.stringify(data);
										$scope.infoJson.app ='settings';
										logHelper.error( $scope.infoJson);

										$charge.settingsapp().deleteGeneralData().success(function (data) {
											//console.log("Settings Rollback..");
										}).error(function (data) {
											//console.log("Settings Rollback failed");
											$scope.infoJson= {};
											$scope.infoJson.message =JSON.stringify(data);
											$scope.infoJson.app ='settings';
											logHelper.error( $scope.infoJson);
										});

									});
								}).error(function (data) {
									notifications.toast("Error occured while saving company profile.", "error");
									$scope.generalSubmit = false;

									$scope.infoJson= {};
									$scope.infoJson.message =JSON.stringify(data);
									$scope.infoJson.app ='settings';
									logHelper.error( $scope.infoJson);

									$charge.settingsapp().deleteGeneralData().success(function (data) {
										//console.log("Settings Rollback..");
									}).error(function (data) {
										//console.log("Settings Rollback failed");
										$scope.infoJson= {};
										$scope.infoJson.message =JSON.stringify(data);
										$scope.infoJson.app ='settings';
										logHelper.error( $scope.infoJson);
									});

								});
							}).error(function (data) {
								//console.log(data);
								$scope.generalSubmit = false;

								$scope.infoJson= {};
								$scope.infoJson.message =JSON.stringify(data);
								$scope.infoJson.app ='settings';
								logHelper.error( $scope.infoJson);

								$charge.settingsapp().deleteGeneralData().success(function (data) {
									//console.log("Settings Rollback..");
								}).error(function (data) {
									//console.log("Settings Rollback failed");
									$scope.infoJson= {};
									$scope.infoJson.message =JSON.stringify(data);
									$scope.infoJson.app ='settings';
									logHelper.error( $scope.infoJson);
								});

							})

							//$uploader.uploadMedia("CCCompanyImage", $scope.cropper.croppedImage, $scope.productImgFileName);

							//$scope.imgWidth = obj.element[0].childNodes[1].naturalWidth;
							//$scope.imgHeight = obj.element[0].childNodes[1].naturalHeight;

							//if($scope.imgWidth <= 180 && $scope.imgHeight <= 180) {

							//  $uploader.onSuccess(function (e, data) {
							//    $scope.template.companyLogo = $storage.getMediaUrl("CCCompanyImage", $scope.productImgFileName);
							//    $scope.saveCompanyProfile();
							//    var req = {
							//      "GURecID": "",
							//      "RecordType": "CTS_CompanyAttributes",
							//      "OperationalStatus": "Active",
							//      "RecordStatus": "Active",
							//      "Cache": "CTS_CompanyAttributes",
							//      "Separate": "Test",
							//      "RecordName": "CTS_CompanyAttributes",
							//      "GuTranID": "12345",
							//      "RecordCultureName": "CTS_CompanyAttributes",
							//      "RecordCode": "CTS_CompanyAttributes",
							//      "commonDatafieldDetails": $scope.companyFields,
							//      "commonDataValueDetails": $scope.companyFieldValues
							//    }
							//
							//    $charge.settingsapp().storeCompanyDetails(req).success(function (data) {
							//      $scope.saveFooter();
							//      var req = {
							//        "GURecID": "",
							//        "RecordType": "CTS_FooterAttributes",
							//        "OperationalStatus": "Active",
							//        "RecordStatus": "Active",
							//        "Cache": "CTS_FooterAttributes",
							//        "Separate": "Test",
							//        "RecordName": "CTS_FooterAttributes",
							//        "GuTranID": "12345",
							//        "RecordCultureName": "CTS_FooterAttributes",
							//        "RecordCode": "CTS_FooterAttributes",
							//        "commonDatafieldDetails": $scope.footerFields,
							//        "commonDataValueDetails": $scope.footerFieldValues
							//      }
							//
							//      $charge.settingsapp().store(req).success(function (data) {
							//        notifications.toast("General records has been saved.", "success");
							//        $scope.generalSubmit = false;
							//        $state.go($state.current, {}, {reload: true});
							//        $rootScope.firstLoginDitected = false;
							//      }).error(function (data) {
							//        notifications.toast("Error occured while saving company profile.", "error");
							//        $scope.generalSubmit = false;
							//      });
							//    }).error(function (data) {
							//      notifications.toast("Error occured while saving company profile.", "error");
							//      $scope.generalSubmit = false;
							//    });
							//  });

							//}else{
							//  notifications.toast("Company logo is too large to upload (Maxumum size : 180px x 180px)", "error");
							//  $scope.generalSubmit = false;
							//}
							//});
						}
						else {
							$scope.saveCompanyProfile();
							var req = {
								"GURecID": "",
								"RecordType": "CTS_CompanyAttributes",
								"OperationalStatus": "Active",
								"RecordStatus": "Active",
								"Cache": "CTS_CompanyAttributes",
								"Separate": "Test",
								"RecordName": "CTS_CompanyAttributes",
								"GuTranID": "12345",
								"RecordCultureName": "CTS_CompanyAttributes",
								"RecordCode": "CTS_CompanyAttributes",
								"commonDatafieldDetails": $scope.companyFields,
								"commonDataValueDetails": $scope.companyFieldValues
							}

							$charge.settingsapp().store(req).success(function (data) {
								$scope.saveFooter();
								var req = {
									"GURecID": "",
									"RecordType": "CTS_FooterAttributes",
									"OperationalStatus": "Active",
									"RecordStatus": "Active",
									"Cache": "CTS_FooterAttributes",
									"Separate": "Test",
									"RecordName": "CTS_FooterAttributes",
									"GuTranID": "12345",
									"RecordCultureName": "CTS_FooterAttributes",
									"RecordCode": "CTS_FooterAttributes",
									"commonDatafieldDetails": $scope.footerFields,
									"commonDataValueDetails": $scope.footerFieldValues
								}

								$charge.settingsapp().store(req).success(function (data) {
									notifications.toast("General records has been saved.", "success");
									$scope.generalSubmit = false;
									$state.go($state.current, {}, {reload: true});
									$rootScope.firstLoginDitected = false;
									$rootScope.$broadcast('base_available');
									// $charge.settingsapp().deleteGeneralData().success(function (data) {
									// 	console.log("Settings Rollback..");
									// }).error(function (data) {
									// 	console.log("Settings Rollback failed");
									// });
									$scope.infoJson= {};
									$scope.infoJson.message ='General records has been saved';
									$scope.infoJson.app ='settings';
									logHelper.info( $scope.infoJson);
								}).error(function (data) {
									notifications.toast("Error occured while saving company profile.", "error");
									$scope.generalSubmit = false;

									$scope.infoJson= {};
									$scope.infoJson.message =JSON.stringify(data);
									$scope.infoJson.app ='settings';
									logHelper.error( $scope.infoJson);

									$charge.settingsapp().deleteGeneralData().success(function (data) {
										//console.log("Settings Rollback..");
									}).error(function (data) {
										//console.log("Settings Rollback failed");
										$scope.infoJson= {};
										$scope.infoJson.message =JSON.stringify(data);
										$scope.infoJson.app ='settings';
										logHelper.error( $scope.infoJson);
									});

								});
							}).error(function (data) {
								notifications.toast("Error occured while saving company profile.", "error");
								$scope.generalSubmit = false;

								$scope.infoJson= {};
								$scope.infoJson.message =JSON.stringify(data);
								$scope.infoJson.app ='settings';
								logHelper.error( $scope.infoJson);

								$charge.settingsapp().deleteGeneralData().success(function (data) {
									//console.log("Settings Rollback..");
								}).error(function (data) {
									//console.log("Settings Rollback failed");
									$scope.infoJson= {};
									$scope.infoJson.message =JSON.stringify(data);
									$scope.infoJson.app ='settings';
									logHelper.error( $scope.infoJson);
								});

							});
						}


						//}
					}).error(function (data) {
						notifications.toast("Error occured while saving general records.", "error");
						$scope.generalSubmit = false;

						$scope.infoJson= {};
						$scope.infoJson.message =JSON.stringify(data);
						$scope.infoJson.app ='settings';
						logHelper.error( $scope.infoJson);

						$charge.settingsapp().deleteGeneralData().success(function (data) {
							//console.log("Settings Rollback..");
						}).error(function (data) {
							//console.log("Settings Rollback failed");
							$scope.infoJson= {};
							$scope.infoJson.message =JSON.stringify(data);
							$scope.infoJson.app ='settings';
							logHelper.error( $scope.infoJson);
						});

					})
				}
				else {
					if ($scope.baseCurrency != $scope.general.baseCurrency) {
						if ($scope.transactionCount == 0)
							$scope.updateGeneralCheckProcess();
						//$scope.deleteGeneral();
						else {
							notifications.toast("Base Currency cannot be changed.", "error");
							$scope.general.baseCurrency = $scope.baseCurrency;
							$scope.generalSubmit = false;
						}
					}
					else {
						$scope.updateGeneralCheckProcess();
						//$scope.deleteGeneral();
					}
				}
			}
		}

		//20/09/2016
		$scope.companyFields;
		$scope.companyFieldValues;
		$scope.saveCompanyProfile = function () {
			$scope.companyFields = [];
			$scope.companyFieldValues = [];

			$scope.companyFields.push({
				"FieldCultureName": "CompanyName",
				"FieldID": "",
				"FieldName": "CompanyName",
				"FieldType": "CompanyNameType",
				"ColumnIndex": "0"
			});
			$scope.companyFieldValues.push({
				"RowID": "",
				"RecordFieldData": $scope.template.companyName,
				"ColumnIndex": "0"
			});
			$scope.companyFields.push({
				"FieldCultureName": "CompanyAddress",
				"FieldID": "",
				"FieldName": "CompanyAddress",
				"FieldType": "CompanyAddressType",
				"ColumnIndex": "1"
			});
			$scope.companyFieldValues.push({
				"RowID": "",
				"RecordFieldData": $scope.template.companyAddress,
				"ColumnIndex": "1"
			});
			$scope.companyFields.push({
				"FieldCultureName": "CompanyPhoneNo",
				"FieldID": "",
				"FieldName": "CompanyPhoneNo",
				"FieldType": "CompanyPhoneNoType",
				"ColumnIndex": "2"
			});
			$scope.companyFieldValues.push({
				"RowID": "",
				"RecordFieldData": $scope.template.companyPhone,
				"ColumnIndex": "2"
			});
			$scope.companyFields.push({
				"FieldCultureName": "CompanyEmail",
				"FieldID": "",
				"FieldName": "CompanyEmail",
				"FieldType": "CompanyEmailType",
				"ColumnIndex": "3"
			});
			$scope.companyFieldValues.push({
				"RowID": "",
				"RecordFieldData": $scope.template.companyEmail,
				"ColumnIndex": "3"
			});
			$scope.companyFields.push({
				"FieldCultureName": "CompanyLogo",
				"FieldID": "",
				"FieldName": "CompanyLogo",
				"FieldType": "CompanyLogoType",
				"ColumnIndex": "4"
			});

			//if($scope.cropper.croppedImage!=null)
			//{
			//  vm.isEditable = false;
			//  $scope.template.croppedLogo=$scope.cropper.croppedImage;
			//}
			//else
			//{}
			$scope.companyFieldValues.push({
				"RowID": "",
				"RecordFieldData": $scope.template.companyLogo,
				"ColumnIndex": "4"
			});
		}

		$scope.deleteCompanyProfile= function () {
			$charge.settingsapp().deleteCommmon($scope.template.GURecID).success(function (data) {
				if($scope.cropper.croppedImage!=null && $scope.cropper.croppedImage!="") {
					//angular.forEach($scope.template.companyLogo, function (obj) {
					var uploadImageObj = {
						"base64Image": $scope.cropper.croppedImage,
						"fileName": $scope.productImgFileName,
						"format": $scope.productImgFileType,
						"app": "Company",
						"fileType": "image"
					}
					$charge.storage().storeImage(uploadImageObj).success(function (data) {
						$scope.template.croppedLogo=data.fileUrl;
						$scope.insertCompanyIndividual();

						$scope.infoJson= {};
						$scope.infoJson.message =$scope.productImgFileName+' Company logo uploaded';
						$scope.infoJson.app ='settings';
						logHelper.info( $scope.infoJson);

					}).error(function (data) {
						//console.log(data);
						$scope.generalSubmit = false;

						$scope.infoJson= {};
						$scope.infoJson.message =JSON.stringify(data);
						$scope.infoJson.app ='settings';
						logHelper.error( $scope.infoJson);
					})

					//$uploader.uploadMedia("CCCompanyImage", $scope.cropper.croppedImage, $scope.productImgFileName);

					//$scope.imgWidth = obj.element[0].childNodes[1].naturalWidth;
					//$scope.imgHeight = obj.element[0].childNodes[1].naturalHeight;

					//if($scope.imgWidth <= 180 && $scope.imgHeight <= 180) {

					//$uploader.onSuccess(function (e, data) {
					//  $scope.template.croppedLogo = $storage.getMediaUrl("CCCompanyImage", $scope.productImgFileName);
					//
					//  $http({
					//    method: 'GET',
					//    url: $scope.template.croppedLogo
					//  }).then(function successCallback(response) {
					//    $scope.cropper.croppedImage = response.data;
					//    $scope.insertCompanyIndividual();
					//  }, function errorCallback(response) {
					//
					//  });
					//});

					//}else{
					//  notifications.toast("Company logo is too large to upload (Maxumum size : 180px x 180px)", "error");
					//  $scope.generalSubmit = false;
					//}
					//});
				}
				else
				{
					$scope.template.companyLogo=$scope.template.Preview;
					$scope.insertCompanyIndividual();
				}
			}).error(function (data) {
				notifications.toast("Error occured while updating Company Record.", "error");
				$scope.template.companyLogo=[];
				$scope.generalSubmit=false;

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})
		}

		$scope.insertCompanyIndividual= function () {
			var req =[{
				"RecordName":"CTS_CompanyAttributes",
				"FieldName":"CompanyName",
				"RecordFieldData":$scope.template.companyName
			},
				{
					"RecordName":"CTS_CompanyAttributes",
					"FieldName":"CompanyAddress",
					"RecordFieldData":$scope.template.companyAddress
				},
				{
					"RecordName":"CTS_CompanyAttributes",
					"FieldName":"CompanyPhoneNo",
					"RecordFieldData":$scope.template.companyPhone
				},
				{
					"RecordName":"CTS_CompanyAttributes",
					"FieldName":"CompanyEmail",
					"RecordFieldData":$scope.template.companyEmail
				},
				{
					"RecordName":"CTS_CompanyAttributes",
					"FieldName":"CompanyLogo",
					"RecordFieldData":$scope.template.croppedLogo
				}]
			//
			$charge.settingsapp().insertBulkDuoBaseValues(req).success(function(data) {
				//notifications.toast("General records have been updated.", "success");
				//$state.go($state.current, {}, {reload: true});
				$scope.template.companyLogo=[];
				$scope.deleteFooter();
				//$scope.generalSubmit=false;
			}).error(function (data) {
				notifications.toast("Error occured while updating Company Record.", "error");
				$scope.generalSubmit=false;

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})
		}



		//05-10-2016
		$scope.footerFields;
		$scope.footerFieldValues;
		$scope.saveFooter = function () {
			$scope.footerFields = [];
			$scope.footerFieldValues = [];

			$scope.footerFields.push({
				"FieldCultureName": "Greeting",
				"FieldID": "",
				"FieldName": "Greeting",
				"FieldType": "GreetingType",
				"ColumnIndex": "0"
			});
			$scope.footerFieldValues.push({
				"RowID": "",
				"RecordFieldData": $scope.footerDet.greeting==undefined?"":$scope.footerDet.greeting,
				"ColumnIndex": "0"
			});
			$scope.footerFields.push({
				"FieldCultureName": "Disclaimer",
				"FieldID": "",
				"FieldName": "Disclaimer",
				"FieldType": "DisclaimerType",
				"ColumnIndex": "1"
			});
			$scope.footerFieldValues.push({
				"RowID": "",
				"RecordFieldData": $scope.footerDet.disclaimer==undefined?"":btoa($scope.footerDet.disclaimer),
				"ColumnIndex": "1"
			});
		}

		$scope.deleteFooter= function () {
			$charge.settingsapp().deleteCommmon($scope.footerDet.GURecID).success(function (data) {
				//
				$scope.insertFooterIndividual();
			}).error(function (data) {
				notifications.toast("Error occured while updating Footer Record.", "error");
				$scope.generalSubmit=false;

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})
		}

		$scope.insertFooterIndividual= function () {
			var req =[{
				"RecordName":"CTS_FooterAttributes",
				"FieldName":"Greeting",
				"RecordFieldData":$scope.footerDet.greeting==undefined?"":$scope.footerDet.greeting
			},
				{
					"RecordName":"CTS_FooterAttributes",
					"FieldName":"Disclaimer",
					"RecordFieldData":$scope.footerDet.disclaimer==undefined?"":btoa($scope.footerDet.disclaimer)
				}]
			//
			$charge.settingsapp().insertBulkDuoBaseValues(req).success(function(data) {
				notifications.toast("General records have been updated.", "success");
				$scope.generalSubmit=false;
				$state.go($state.current, {}, {reload: true});

				$scope.infoJson= {};
				$scope.infoJson.message ='General records have been updated';
				$scope.infoJson.app ='settings';
				logHelper.info( $scope.infoJson);
			}).error(function (data) {
				notifications.toast("Error occured while updating Footer Record.", "error");
				$scope.generalSubmit=false;

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})
		}

		$scope.deletePreferred= function (ev,index) {
			$scope.general.userCurrency="";
			$scope.general.currencyName="";
			for(var i=0;i<$scope.userCurrencies.length;i++) {
				if ($scope.userCurrencies[i].code!=ev.code) {
					$scope.general.userCurrency = $scope.general.userCurrency + " " + $scope.userCurrencies[i].code;
					$scope.general.currencyName = $scope.general.currencyName == "" ? $scope.userCurrencies[i].name : $scope.general.currencyName + "," + $scope.userCurrencies[i].name;
				}
				else
				{
					$scope.general.userCurrency.trimRight();
					$scope.general.currencyName.trimRight(",");
				}
			}

			$scope.userCurrencies.splice(index,1);
			tempCurrencyNames.splice(index,1);
			tempCurrencyCodes.splice(index,1);

		}


		/*
		 * General tab end
		 */



		/*
		 *  Preference tab start
		 */

		var skip=0;
		var take=100;
		$scope.content={};
		$scope.product={};
		$scope.inventory={};
		$scope.plan={};
		$scope.content.enableDiscounts=false;
		$scope.toggleDiscNo = true;
		$scope.content.sendInvoice=false;
		$scope.toggleInvoiceNo=true;
		$scope.content.sendReminder=false;
		$scope.toggleReminderNo=true;
		$scope.content.allowPartialPay=false;
		$scope.togglePaymentsNo=true;
		$scope.content.enableDiscountsQuote=false;
		$scope.tgDiscQuoteNo=true;
		$scope.content.sendInvoiceQuote=false;
		$scope.tgInvoiceQuoteNo=true;
		$scope.categories = [];
		$scope.taxes = ['10', '20', '30', '40'];
		$scope.brands = [];
		$scope.stores=[];
		$scope.planTypeList=[];
		$scope.UOMs=[];
		$scope.editCategory="";
		$scope.updateEnable = false;

		$scope.editCat=false;
		//$charge.uom().getAllUOM('Product_123').success(function(data) {
		//  $scope.UOMs=[];
		//  //
		//  console.log(data);
		//  for(var i=0;i<data.length;i++)
		//  {
		//    //
		//    $scope.UOMs.push(data[i][0]);
		//    //
		//  }
		//}).error(function(data) {
		//  console.log(data);
		//})

		//$rootScope.isCategoryLoaded=false;
		//$charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_CommonAttributes","Category").success(function(data) {
		//  $scope.categories=[];
		//  $rootScope.isCategoryLoaded=true;
		//  for(var i=0;i<data.length;i++)
		//  {
		//    $scope.categories.push(data[i]);
		//  }
		//}).error(function(data) {
		//  console.log(data);
		//  $rootScope.isCategoryLoaded=false;
		//})
		//
		//$rootScope.isBrandLoaded=false;
		//$charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_CommonAttributes","Brand").success(function(data) {
		//  $scope.brands=[];
		//  $rootScope.isBrandLoaded=true;
		//  //console.log(data);
		//  for(var i=0;i<data.length;i++)
		//  {
		//    //
		//    $scope.brands.push(data[i]);
		//  }
		//}).error(function(data) {
		//  console.log(data);
		//  $rootScope.isBrandLoaded=false;
		//})

		$scope.loadingProductCategories = true;
		$scope.loadingProductBrands = true;
		$scope.loadingProductUMOs = true;
		$scope.loadProductAttributes= function () {

			$charge.uom().getAllUOM('Product_123').success(function(data) {
				$scope.UOMs=[];
				//console.log(data);
				for(var i=0;i<data.length;i++)
				{
					//
					$scope.UOMs.push(data[i]);
					//
				}
				$scope.loadingProductUMOs = false;
			}).error(function(data) {
				//  console.log(data);
				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
				$scope.loadingProductUMOs = false;
			})

			$rootScope.isCategoryLoaded=false;
			$charge.settingsapp().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_CommonAttributes","Category").success(function(data) {
				$scope.categories=[];
				$rootScope.isCategoryLoaded=true;
				for(var i=0;i<data.length;i++)
				{
					$scope.categories.push(data[i]);
				}
				$scope.loadingProductCategories = false;
			}).error(function(data) {
				console.log(data);
				$rootScope.isCategoryLoaded=false;
				$scope.loadingProductCategories = false;
			})

			$rootScope.isBrandLoaded=false;
			$charge.settingsapp().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_CommonAttributes","Brand").success(function(data) {
				$scope.brands=[];
				$rootScope.isBrandLoaded=true;
				//console.log(data);
				for(var i=0;i<data.length;i++)
				{
					//
					$scope.brands.push(data[i]);
				}
				$scope.loadingProductBrands = false;
			}).error(function(data) {
				console.log(data);
				$rootScope.isBrandLoaded=false;
				$scope.loadingProductBrands = false;
			})

		}

		var skipPlanChangeFee=0;
		var takePlanChangeFee=100;
		$scope.loadingPlanChangeFee = false;
		$scope.planChangeFeeList=[];

		var skipPlanKeyAttributes=0;
		var takePlanKeyAttributes=100;
		$scope.loadingPlanKeyAttributes = true;
		$scope.planKeyAttributesList=[];

		$scope.BaseCurrencyPlanChangeFee = "";
		$scope.currencyRate = 1;

		$scope.isPlanTypeLoaded = false;

		$scope.loadPlanAttributes= function () {
			//$charge.settingsapp().getDuobaseValuesByTableName("CTS_CommonAttributes").success(function(data) {
			//  $scope.categories=[];
			//  $rootScope.isCategoryLoaded=true;
			//  for(var i=0;i<data.length;i++)
			//  {
			//    $scope.categories.push(data[i]);
			//  }
			//
			//  $scope.brands=[];
			//  $rootScope.isBrandLoaded=true;
			//  //console.log(data);
			//  for(var i=0;i<data.length;i++)
			//  {
			//    //
			//    $scope.brands.push(data[i]);
			//  }
			//
			//}).error(function(data) {
			//  $rootScope.isCategoryLoaded=false;
			//  $rootScope.isBrandLoaded=false;
			//})
			//
			$charge.uom().getAllUOM('Plan_123').success(function(data) {
				$scope.UOMs=[];
				//console.log(data);
				for(var i=0;i<data.length;i++)
				{
					//
					$scope.UOMs.push(data[i]);
					//
				}
			}).error(function(data) {
				//  console.log(data);
				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})

			$charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_PlanAttributes", "PlanType").success(function (data) {
				var length = data.length;
				//
				$scope.planTypeList=[];
				$rootScope.isPlanTypeLoaded=true;
				for (var i = 0; i < length; i++) {
					for (var j = 0; j < data[i].length; j++) {
						var obj = data[i][j];
						if (obj.ColumnIndex == "0") {
							$scope.planTypeList.push(obj);

						}
					}
				}
				$scope.isPlanTypeLoaded = true;
			}).error(function (data) {
				$rootScope.isPlanTypeLoaded=false;
				$scope.isPlanTypeLoaded = true;

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})

			skipPlanKeyAttributes=0;
			$scope.loadingPlanKeyAttributes = true;
			$scope.planKeyAttributesList=[];

			$charge.plan().allPlanKeyAttributes(skipPlanKeyAttributes,takePlanKeyAttributes,'desc').success(function(data)
			{
				//console.log(data);

				if($scope.loadingPlanKeyAttributes)
				{
					skipPlanKeyAttributes += takePlanKeyAttributes;

					for (var i = 0; i < data.length; i++) {
						$scope.planKeyAttributesList.push(data[i]);
					}

					$scope.loadingPlanKeyAttributes = false;

					if(data.length<takePlanKeyAttributes){

					}
					else
					{
						$scope.loadPlanKeyAttributesPaging();
					}

				}

			}).error(function(data)
			{
				$scope.loadingPlanKeyAttributes = false;

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})

			skipPlanChangeFee=0;
			$scope.loadingPlanChangeFee = true;
			$scope.planChangeFeeList=[];

			$charge.plan().allPlanChangeFees(skipPlanChangeFee,takePlanChangeFee,'desc').success(function(data)
			{
				//console.log(data);

				if($scope.loadingPlanChangeFee)
				{
					skipPlanChangeFee += takePlanChangeFee;

					for (var i = 0; i < data.length; i++) {
						data[i].editItem=false;
						$scope.planChangeFeeList.push(data[i]);
					}

					$scope.loadingPlanChangeFee = false;

					if(data.length<takePlanChangeFee){

					}
					else
					{
						$scope.loadPlanChangeFeePaging();
					}

				}

			}).error(function(data)
			{
				$scope.loadingPlanChangeFee = false;
				$scope.planChangeFeeList = [];

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})

			$charge.settingsapp().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_GeneralAttributes","BaseCurrency").success(function(data) {
				$scope.BaseCurrencyPlanChangeFee=data[0].RecordFieldData;
				//console.log($scope.BaseCurrencyPlanChangeFee);
				//$scope.selectedCurrency = $scope.BaseCurrency;

			}).error(function(data) {
				//console.log(data);
				$scope.BaseCurrencyPlanChangeFee="USD";
				//$scope.selectedCurrency = $scope.BaseCurrency;
				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})

		}

		$scope.loadPlanKeyAttributesPaging= function () {
			$scope.loadingPlanKeyAttributes = true;
			$charge.plan().allPlanKeyAttributes(skipPlanKeyAttributes,takePlanKeyAttributes,'desc').success(function(data)
			{
				//console.log(data);

				if($scope.loadingPlanKeyAttributes)
				{
					skipPlanKeyAttributes += takePlanKeyAttributes;

					for (var i = 0; i < data.length; i++) {
						$scope.planKeyAttributesList.push(data[i]);
					}

					$scope.loadingPlanKeyAttributes = false;

					if(data.length<takePlanKeyAttributes){

					}
					else
					{
						$scope.loadPlanKeyAttributesPaging();
					}

				}

			}).error(function(data)
			{
				$scope.loadingPlanKeyAttributes = false;

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})
		}

		$scope.loadPlanChangeFeePaging= function () {
			$scope.loadingPlanChangeFee = true;
			$charge.plan().allPlanChangeFees(skipPlanChangeFee,takePlanChangeFee,'desc').success(function(data)
			{
				//console.log(data);

				if($scope.loadingPlanChangeFee)
				{
					skipPlanChangeFee += takePlanChangeFee;

					for (var i = 0; i < data.length; i++) {
						data[i].editItem=false;
						$scope.planChangeFeeList.push(data[i]);
					}

					$scope.loadingPlanChangeFee = false;

					if(data.length<takePlanChangeFee){

					}
					else
					{
						$scope.loadPlanChangeFeePaging();
					}

				}

			}).error(function(data)
			{
				//$scope.planChangeFeeList = false;
				$scope.loadingPlanChangeFee = false;

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})
		}

		vm.webhookEventList=[];
		var skipAllEventsWH=0;
		var takeAllEventsWH=100;

		vm.webhookList=[];
		var skipAllWebhooks=0;
		var takeAllWebhooks=100;
		$scope.loadingEventsWH = true;
		$scope.loadingWebhooks = true;
		vm.tempUsedEventsList=[];

		vm.webhookHistoryList=[];
		var skipAllWebhookHistory=0;
		var takeAllWebhookHistory=100;
		$scope.loadingWebhookHistory = true;
		$scope.isMoreWebhookHistoryLoading = true;

		$scope.loadWebhooksAttributes= function () {

			vm.webhookEventList=[];
			skipAllEventsWH=0;
			$scope.loadingEventsWH = true;
			$scope.loadingWebhooks = true;

			vm.tempUsedEventsList=[];

			$charge.webhook().allEvents(skipAllEventsWH,takeAllEventsWH,'asc').success(function (data) {
				//console.log(data);
				//
				if($scope.loadingEventsWH)
				{
					skipAllEventsWH += takeAllEventsWH;

					for (var i = 0; i < data.length; i++) {
						data[i].isAlreadyUsed=false;
						vm.webhookEventList.push(data[i]);
					}
					$scope.loadingEventsWH = false;

					if(vm.tempUsedEventsList.length!=0 && !$scope.loadingWebhooks)
					{
						$scope.checkAlreadyUsedEvents();
					}
				}
			}).error(function (data) {
				//console.log(data);
				vm.webhookEventList=[];
				$scope.loadingEventsWH = false;

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})

			vm.webhookList=[];
			skipAllWebhooks=0;

			$charge.webhook().allWebhooks(skipAllWebhooks,takeAllWebhooks,'desc').success(function (data) {
				//console.log(data);
				//
				if($scope.loadingWebhooks)
				{
					skipAllWebhooks += takeAllWebhooks;

					for (var i = 0; i < data.length; i++) {
						data[i].showEvents=false;
						if(data[i].eventCodes!="" && data[i].eventCodes!=null && data[i].eventCodes!="null")
						{
							data[i].eventCodes=JSON.parse(data[i].eventCodes);
							for (var j = 0; j < data[i].eventCodes.length; j++) {
								vm.tempUsedEventsList.push(data[i].eventCodes[j]);
							}
						}
						vm.webhookList.push(data[i]);

					}

					$scope.loadingWebhooks = false;
					if(data.length<takeAllWebhooks){
						if(vm.webhookEventList.length!=0 && !$scope.loadingEventsWH)
						{
							$scope.checkAlreadyUsedEvents();
						}
					}
					else{
						$scope.loadWebhookListPaging();
					}
				}
			}).error(function (data) {
				//console.log(data);
				vm.webhookList=[];
				$scope.loadingWebhooks = false;

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})


			vm.webhookHistoryList=[];
			skipAllWebhookHistory=0;
			$scope.loadingWebhookHistory = true;
			$scope.isMoreWebhookHistoryLoading = true;
			$charge.webhook().allWebhookHistory(skipAllWebhookHistory,takeAllWebhookHistory,'desc').success(function (data) {
				//console.log(data);
				if($scope.loadingWebhookHistory)
				{
					skipAllWebhookHistory += takeAllWebhookHistory;

					for (var i = 0; i < data.length; i++) {
						vm.webhookHistoryList.push(data[i]);
					}
					$scope.loadingWebhookHistory = false;

					if(data.length<takeAllWebhookHistory)
					{
						$scope.isMoreWebhookHistoryLoading = false;
					}

				}

			}).error(function (data) {
				//console.log(data);
				vm.webhookHistoryList=[];
				$scope.loadingWebhookHistory = false;
				$scope.isMoreWebhookHistoryLoading = false;

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})

		}

		$scope.loadWebhookListPaging= function () {
			$scope.loadingWebhooks = true;
			$charge.webhook().allWebhooks(skipAllWebhooks,takeAllWebhooks,'desc').success(function (data) {
				//console.log(data);
				if($scope.loadingWebhooks)
				{
					skipAllWebhooks += takeAllWebhooks;

					for (var i = 0; i < data.length; i++) {
						data[i].showEvents=false;
						if(data[i].eventCodes!="" && data[i].eventCodes!=null && data[i].eventCodes!="null")
						{
							data[i].eventCodes=JSON.parse(data[i].eventCodes);
							for (var j = 0; j < data[i].eventCodes.length; j++) {
								vm.tempUsedEventsList.push(data[i].eventCodes[j]);
							}
						}
						vm.webhookList.push(data[i]);

					}

					$scope.loadingWebhooks = false;
					if(data.length<takeAllWebhooks){
						if(vm.webhookEventList.length!=0 && !$scope.loadingEventsWH)
						{
							$scope.checkAlreadyUsedEvents();
						}
					}
				}
			}).error(function (data) {
				//console.log(data);
				$scope.loadingWebhooks = false;
				if(vm.webhookEventList.length!=0 && !$scope.loadingEventsWH && vm.tempUsedEventsList.length!=0)
				{
					$scope.checkAlreadyUsedEvents();
				}

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})
		}

		$scope.checkAlreadyUsedEvents= function () {
			for (var i = 0; i < vm.webhookEventList.length; i++) {
				vm.webhookEventList[i].isAlreadyUsed=false;
				var tempEvent=vm.webhookEventList[i].eventType;
				for (var j = 0; j < vm.tempUsedEventsList.length; j++) {
					if(tempEvent==vm.tempUsedEventsList[j])
					{
						vm.webhookEventList[i].isAlreadyUsed=true;
					}
				}
			}
		};

		$scope.loadWebhookHistoryListPaging= function () {
			$scope.loadingWebhookHistory = true;
			$scope.isMoreWebhookHistoryLoading = true;
			$charge.webhook().allWebhookHistory(skipAllWebhookHistory,takeAllWebhookHistory,'desc').success(function (data) {
				//console.log(data);
				if($scope.loadingWebhookHistory)
				{
					skipAllWebhookHistory += takeAllWebhookHistory;

					for (var i = 0; i < data.length; i++) {
						vm.webhookHistoryList.push(data[i]);
					}
					$scope.loadingWebhookHistory = false;

					if(data.length<takeAllWebhookHistory)
					{
						$scope.isMoreWebhookHistoryLoading = false;
					}

				}

			}).error(function (data) {
				//console.log(data);
				vm.webhookHistoryList=[];
				$scope.loadingWebhookHistory = false;
				$scope.isMoreWebhookHistoryLoading = false;

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})
		}

		vm.closeDialog = function () {
			for (var j = 0; j < vm.webhookEventList.length; j++) {
				vm.webhookEventList[i].isSelected=false;
			}
			$timeout(function () {
				vm.webhook={};
				vm.webhook.type=false;
				vm.webhook.mode="Live";
			});
			// vm.webhookTypeChange("custom");
			//
			// vm.webhookList=[];
			// skipAllWebhooks=0;
			// vm.tempUsedEventsList=[];

			$mdDialog.hide();
			vm.enabledEditWH=false;
		};

		$scope.resetWebhook= function () {
			vm.webhook={};
			vm.webhook.type="custom";
			vm.webhook.mode="Live";
			vm.webhookTypeChange(true);

			vm.webhookList=[];
			skipAllWebhooks=0;
			vm.tempUsedEventsList=[];
			$scope.loadWebhookListPaging();

			vm.enabledEditWH=false;
		};

		vm.submitWebhook= function (editing) {
			if(!editing)
			{
				if (vm.webHooks.$valid == true) {
					vm.webhookSubmitted = true;

					var webhookObj={};
					var tempEventsSelected=false;
					webhookObj.endPoint=vm.webhook.endPoint;
					webhookObj.type=vm.webhook.type;
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
							//console.log(data);
							//
							if(data.error=="00000")
							{
								notifications.toast("Webhook Created Successfully", "success");
								vm.webhook={};
								vm.webhook.type="custom";
								vm.webhook.mode="Live";
								vm.webhookTypeChange("custom");

								$scope.infoJson= {};
								$scope.infoJson.message =vm.webhook.endPoint+' Webhook Created Successfully';
								$scope.infoJson.app ='settings';
								logHelper.info( $scope.infoJson);

								vm.webhookList=[];
								skipAllWebhooks=0;
								vm.tempUsedEventsList=[];
								$mdDialog.hide();
								$scope.loadWebhookListPaging();
							}
							else
							{
								notifications.toast("Webhook Creation Failed", "error");

								$scope.infoJson= {};
								$scope.infoJson.message =JSON.stringify(data);
								$scope.infoJson.app ='settings';
								logHelper.error( $scope.infoJson);
							}
							//$scope.webhook={};
							vm.webhookSubmitted = false;
						}).error(function (data) {
							$mdDialog.hide();
							//console.log(data);
							vm.webhookSubmitted = false;

							$scope.infoJson= {};
							$scope.infoJson.message =JSON.stringify(data);
							$scope.infoJson.app ='settings';
							logHelper.error( $scope.infoJson);
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
					webhookObj.guWebhookId=vm.webhook.guWebhookId;
					webhookObj.endPoint=vm.webhook.endPoint;
					webhookObj.type=vm.webhook.type;
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
							//console.log(data);
							//
							if(data.error=="00000")
							{
								notifications.toast("Webhook Updated Successfully", "success");
								$scope.resetWebhook();
								$mdDialog.hide();

								$scope.infoJson= {};
								$scope.infoJson.message =vm.webhook.endPoint+' Webhook Updated Successfully';
								$scope.infoJson.app ='settings';
								logHelper.info( $scope.infoJson);
							}
							else
							{
								notifications.toast("Webhook Updating Failed", "error");

								$scope.infoJson= {};
								$scope.infoJson.message =JSON.stringify(data);
								$scope.infoJson.app ='settings';
								logHelper.error( $scope.infoJson);
							}
							//$scope.webhook={};
							vm.webhookSubmitted = false;
						}).error(function (data) {
							$mdDialog.hide();
							//console.log(data);
							vm.webhookSubmitted = false;

							$scope.infoJson= {};
							$scope.infoJson.message =JSON.stringify(data);
							$scope.infoJson.app ='settings';
							logHelper.error( $scope.infoJson);
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

		$scope.addWebhookDialog = function(isEdit) {
			// if(isEdit){
			// 	vm.enabledEditWH = true;
			// }
			vm.webhook.type = false;
			for (var i = 0; i < vm.webhookEventList.length; i++) {
				vm.webhookEventList[i].isAlreadyUsed=false;
				if(!isEdit)vm.webhookEventList[i].isSelected=false;
				var tempEvent=vm.webhookEventList[i].eventType;
				for (var j = 0; j < vm.tempUsedEventsList.length; j++) {
					if(tempEvent==vm.tempUsedEventsList[j] && !vm.webhookEventList[i].isSelected)
					{
						vm.webhookEventList[i].isAlreadyUsed=true;
					}
				}
			}
			$mdDialog.show({
				controller: function () {
					return vm;
				},
				controllerAs: 'vm',
				templateUrl: 'app/main/settings/dialogs/webhooks/prompt-add-webhook.html',
				clickOutsideToClose:false
				// locals:{
				// 	// submitWebhook:$scope.submitWebhook,
				// 	skipAllWebhooks:$scope.skipAllWebhooks,
				// 	vm.tempUsedEventsList:$scope.vm.tempUsedEventsList,
				// 	webhookTypeChange:vm.webhookTypeChange,
				// 	webhookSubmitted:vm.webhookSubmitted,
				// 	webhookEventList:vm.webhookEventList,
				// 	webHooks:vm.webHooks,
				// 	webhook:$scope.webhook,
				// 	enabledEditWH:$scope.enabledEditWH,
				// 	// resetWebhook:$scope.resetWebhook,
				// 	loadWebhookListPaging: $scope.loadWebhookListPaging
				// }
			});
		};

		vm.enabledEditWH=false;
		$scope.editWebhook= function (webhook) {
			//$scope.resetWebhook();
			// vm.webhookTypeChange("custom");
			// $scope.checkAlreadyUsedEvents();
			vm.enabledEditWH=true;
			vm.webhook.guWebhookId=webhook.guWebhookId;
			vm.webhook.endPoint=webhook.endPoint;
			vm.webhook.type=webhook.type;
			for (var a = 0; a < vm.webhookEventList.length; a++) {
				vm.webhookEventList[a].isAlreadyUsed=false;
				vm.webhookEventList[a].isSelected=false;
				for (var b = 0; b < vm.tempUsedEventsList.length; b++) {
					if(vm.webhookEventList[a].eventType==vm.tempUsedEventsList[b])
					{
						vm.webhookEventList[a].isAlreadyUsed=true;
					}
				}
			}
			for (var i = 0; i < webhook.eventCodes.length; i++) {
				for (var j = 0; j < vm.webhookEventList.length; j++) {
					if(webhook.eventCodes[i]==vm.webhookEventList[j].eventType)
					{
						vm.webhookEventList[j].isSelected=true;
						vm.webhookEventList[j].isAlreadyUsed=false;
					}
				}
			}
			$mdDialog.show({
				controller: function () {
					return vm;
				},
				controllerAs: 'vm',
				templateUrl: 'app/main/settings/dialogs/webhooks/prompt-add-webhook.html',
				clickOutsideToClose:false
			});
		};

		vm.emailTemplateList=[];
		var skipAllEmailTemplates=0;
		var takeAllEmailTemplates=100;
		$scope.loadingEmailTemplates = true;

		$scope.loadEmailTemplateAttributes= function () {
			vm.emailTemplateList=[];
			skipAllEmailTemplates=0;
			$scope.loadingEmailTemplates = true;

			$charge.storage().allTemplates().success(function (data) {
				//console.log(data);
				//
				if($scope.loadingEmailTemplates)
				{
					for (var i = 0; i < data.result.length; i++) {
						vm.emailTemplateList.push({
							url:data.result[i],
							name:data.result[i].split('/')[data.result[i].split('/').length-1].split('.')[0],
							isSelected:false
						});
					}

					$scope.getDefaultEmailTemplate();

				}
			}).error(function (data) {
				//console.log(data);
				vm.emailTemplateList=[];
				$scope.loadingEmailTemplates = false;
			})
		}

		$scope.defaultEmailTemplate = "";
		$scope.defaultEmailTemplateID="";

		$scope.getDefaultEmailTemplate= function () {
			$charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_EmailTemplates", "TemplateUrl").success(function (data) {
				//
				$scope.defaultEmailTemplate=data[0][0].RecordFieldData;
				$scope.defaultEmailTemplateID=data[0][0].GuRecID;
				$scope.selectChangeTemplate($scope.defaultEmailTemplate);

			}).error(function (data) {
				$scope.defaultEmailTemplate = "";
				$scope.loadingEmailTemplates = false;
				if(data == '204')vm.emailTemplateList[0].isSelected = true;

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})
		}


		$rootScope.isStoreLoaded=false;
		$rootScope.isPlanTypeLoaded=false;
		//$scope.inventory={};
		//$charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_InventoryAttributes","Store").success(function(data) {
		//  $scope.stores=[];
		//  $rootScope.isStoreLoaded=true;
		//  //console.log(data);
		//  for(var i=0;i<data.length;i++)
		//  {
		//    //
		//    $scope.stores.push(data[i]);
		//  }
		//}).error(function(data) {
		//  $rootScope.isStoreLoaded=false;
		//})

		$scope.loadInventoryAttributes= function () {
			$charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_InventoryAttributes", "Store,DefaultStockLevel").success(function (data) {
				var length = data.length;
				//
				$scope.stores=[];
				$rootScope.isStoreLoaded=true;
				for (var i = 0; i < length; i++) {
					for (var j = 0; j < data[i].length; j++) {
						var obj = data[i][j];
						if (obj.ColumnIndex == "0") {
							$scope.stores.push(obj);

						}
						if (obj.ColumnIndex == "1") {
							$scope.inventory.defaultstocklevel = parseInt(obj.RecordFieldData);
							$scope.inventory.defaultstockDetails = obj;
						}
					}
				}
			}).error(function (data) {
				$rootScope.isStoreLoaded=false;
			})
		}



		$scope.addBrandDisabled = false;
		$scope.addBrand = function()
		{
			var ev=$scope.product.brand;
			$scope.addBrandDisabled = true;
			if(ev!=null && ev!="") {
				var isDuplicateBrand=false;
				if($scope.brands.length!=0) {

					for (var i = 0; i < $scope.brands.length; i++) {
						if ($scope.brands[i].RecordFieldData == ev) {
							isDuplicateBrand=true;
							notifications.toast("Brand is already exist.", "error");
							$scope.product.brand="";
							$scope.addBrandDisabled = false;

							break;
						}
					}
				}
				if(!isDuplicateBrand) {
					if ($rootScope.isBrandLoaded) {
						var req = {
							"RecordName": "CTS_CommonAttributes",
							"FieldName": "Brand",
							"RecordFieldData": ev
						}

						$charge.settingsapp().insertDuoBaseValuesAddition(req).success(function (data) {
							//console.log(data);
							notifications.toast("Brand has been added.", "success");
							$charge.settingsapp().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_CommonAttributes", "Brand").success(function (data) {
								$scope.brands = [];
								for (var i = 0; i < data.length; i++) {
									$scope.brands.push(data[i]);
								}
								$scope.product.brand = "";
								$scope.addBrandDisabled = false;
								//$mdDialog.hide($scope.brands);
							}).error(function (data) {
								//console.log(data);
								$scope.addBrandDisabled = false;
							})

							//if (data.IsSuccess) {
							//  console.log(data);
							//  //notifications.toast("Record Inserted, Product ID " + data.Data[0].ID , "success");
							//}
						}).error(function (data) {
							//console.log(data);
							$scope.addBrandDisabled = false;
						})
					}
					else {
						var req = {
							"GURecID": "123",
							"RecordType": "CTS_CommonAttributes",
							"OperationalStatus": "Active",
							"RecordStatus": "Active",
							"Cache": "CTS_CommonAttributes",
							"Separate": "Test",
							"RecordName": "CTS_CommonAttributes",
							"GuTranID": "12345",
							"RecordCultureName": "CTS_CommonAttributes",
							"RecordCode": "CTS_CommonAttributes",
							"commonDatafieldDetails": [
								{
									"FieldCultureName": "Brand",
									"FieldID": "124",
									"FieldName": "Brand",
									"FieldType": "BrandType",
									"ColumnIndex": "1"
								}],
							"commonDataValueDetails": [
								{
									"RowID": "1452",
									"RecordFieldData": ev,
									"ColumnIndex": "1"
								}]
						}

						$charge.settingsapp().store(req).success(function (data) {
							$rootScope.isBrandLoaded = true;
							notifications.toast("Brand has been added.", "success");
							$charge.settingsapp().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_CommonAttributes", "Brand").success(function (data) {
								$scope.brands = [];
								for (var i = 0; i < data.length; i++) {
									$scope.brands.push(data[i]);
								}
								$scope.product.brand = "";
								$scope.addBrandDisabled = false;
								//$mdDialog.hide($scope.brands);
							}).error(function (data) {
								//console.log(data);
								$scope.addBrandDisabled = false;
							})

							//if(data.IsSuccess) {
							//  console.log(data);
							//  //notifications.toast("Record Inserted, Product ID " + data.Data[0].ID , "success");
							//}
						}).error(function (data) {
							//console.log(data);
							$scope.addBrandDisabled = false;
						})
					}
				}
			}
			else{
				$scope.addBrandDisabled = false;
				notifications.toast("Brand cannot be empty" , "error");
			}
		}

		$scope.editBra=false;
		$scope.editBrand = '';
		$scope.updateBraEnable = false;

		$scope.displayBrand= function (brand) {
			$scope.editBra=true;
			brand.editItem = true;
			$scope.displayBrandCode=brand.RecordFieldData;
			$scope.editBrand = angular.copy(brand);
			$scope.updateBraEnable = true;

		}

		$scope.submitBrands= function () {
			if (vm.brands.$valid == true) {
				//
				if (!$scope.updateBraEnable) {
					$scope.addBrand();
				}
				else {
					$scope.updateBrand();
				}
			}
		}

		$scope.updateBrandDisabled = false;
		$scope.updateBrand= function () {
			var commondata=$scope.editBrand;
			$scope.updateBrandDisabled = true;
			var req= {
				"GURecID":commondata.GuRecID,
				"RowID":commondata.RowID,
				"RecordFieldData":commondata.RecordFieldData,
				"FieldID":commondata.FieldID,
				"ColumnIndex":commondata.ColumnIndex,
				"FieldName":commondata.FieldName
			}
			var countBrand=0;
			for (var i = 0; i < $scope.brands.length; i++) {
				if ($scope.brands[i].RecordFieldData == commondata.RecordFieldData) {
					if($scope.displayBrandCode!=commondata.RecordFieldData)
					{
						countBrand++;
					}
				}
			}
			if(countBrand==0) {
				$charge.settingsapp().update(req).success(function (data) {
					//
					if (data.count > 0) {
						notifications.toast("Brand has been updated.", "success");
						$charge.settingsapp().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_CommonAttributes", "Brand").success(function (data) {
							$scope.brands = [];
							for (var i = 0; i < data.length; i++) {
								$scope.brands.push(data[i]);
							}
							$scope.editBrand = "";
							$scope.updateBraEnable = !$scope.updateBraEnable;
							$scope.updateBrandDisabled = false;
						}).error(function (data) {
							//console.log(data);
							$scope.updateBrandDisabled = false;
						})
					}
					else {
						$scope.editBrand = "";
						$scope.updateBraEnable = !$scope.updateBraEnable;
						$scope.updateBrandDisabled = false;
					}
				}).error(function (data) {
					//console.log(data);
					$scope.updateBrandDisabled = false;
				})
			}
			else
			{
				notifications.toast("Brand is already exist.", "error");
				$scope.updateBrandDisabled = false;
				$scope.editBrand.RecordFieldData = $scope.displayBrandCode;
			}
		}

		$scope.submitStore= function () {
			if (vm.stores.$valid == true) {
				//
				if (!$scope.editInventory) {
					$scope.addStore();
				}
				else {
					$scope.updateStore();
				}
			}
		}

		$scope.addInventoryDisabled = false;
		$scope.addStore = function()
		{
			$scope.addInventoryDisabled = true;

			var ev=$scope.inventory.store;
			if(ev!=null && ev!="") {
				var isDuplicateStore=false;
				if($scope.stores.length!=0) {
					for (var i = 0; i < $scope.stores.length; i++) {
						if ($scope.stores[i].RecordFieldData == ev) {
							isDuplicateStore=true;
							notifications.toast("Store is already exist.", "error");
							$scope.inventory.store="";
							$scope.addInventoryDisabled = false;
							break;
						}
					}
				}
				if(!isDuplicateStore) {
					if ($rootScope.isStoreLoaded) {
						var req = {
							"RecordName": "CTS_InventoryAttributes",
							"FieldName": "Store",
							"RecordFieldData": ev
						}

						$charge.settingsapp().insertDuoBaseValuesAddition(req).success(function (data) {
							//console.log(data);
							notifications.toast("Store has been added.", "success");
							//$charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_InventoryAttributes", "Store").success(function (data) {
							//  $scope.stores = [];
							//  for (var i = 0; i < data.length; i++) {
							//    $scope.stores.push(data[i]);
							//  }
							//  $scope.inventory.store = "";
							//  $scope.addInventoryDisabled = false;
							//  //$mdDialog.hide($scope.stores);
							//}).error(function (data) {
							//  console.log(data);
							//  $scope.addInventoryDisabled = false;
							//})

							$charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_InventoryAttributes", "Store,DefaultStockLevel").success(function (data) {
								var length = data.length;
								//
								$scope.stores=[];
								$rootScope.isStoreLoaded=true;
								for (var i = 0; i < length; i++) {
									for (var j = 0; j < data[i].length; j++) {
										var obj = data[i][j];
										if (obj.ColumnIndex == "0") {
											$scope.stores.push(obj);

										}
										if (obj.ColumnIndex == "1") {
											$scope.inventory.defaultstocklevel = parseInt(obj.RecordFieldData);
											$scope.inventory.defaultstockDetails = obj;
										}
									}

								}
								$scope.inventory.store = "";
								$scope.addInventoryDisabled = false;
							}).error(function (data) {
								//console.log(data);
								$scope.addInventoryDisabled = false;
							})

							if (data.IsSuccess) {
								//console.log(data);
								$scope.addInventoryDisabled = false;
								//notifications.toast("Record Inserted, Product ID " + data.Data[0].ID , "success");
							}
						}).error(function (data) {
							//console.log(data);
							$scope.addInventoryDisabled = false;
						})
					}
					else {
						var req = {
							"GURecID": "123",
							"RecordType": "CTS_InventoryAttributes",
							"OperationalStatus": "Active",
							"RecordStatus": "Active",
							"Cache": "CTS_InventoryAttributes",
							"Separate": "Test",
							"RecordName": "CTS_InventoryAttributes",
							"GuTranID": "12345",
							"RecordCultureName": "CTS_InventoryAttributes",
							"RecordCode": "CTS_InventoryAttributes",
							"commonDatafieldDetails": [
								{
									"FieldCultureName": "Store",
									"FieldID": "124",
									"FieldName": "Store",
									"FieldType": "StoreType",
									"ColumnIndex": "0"
								},
								{
									"FieldCultureName": "DefaultStockLevel",
									"FieldID": "124",
									"FieldName": "DefaultStockLevel",
									"FieldType": "DefaultStockLevelType",
									"ColumnIndex": "1"
								}],
							"commonDataValueDetails": [
								{
									"RowID": "1452",
									"RecordFieldData": ev,
									"ColumnIndex": "0"
								},
								{
									"RowID": "1452",
									"RecordFieldData": "",
									"ColumnIndex": "1"
								}]
						}
						//
						$charge.settingsapp().store(req).success(function (data) {
							$rootScope.isStoreLoaded = true;
							notifications.toast("Store has been added.", "success");
//                $charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_InventoryAttributes", "Store").success(function (data) {
//                  $scope.stores = [];
//                  for (var i = 0; i < data.length; i++) {
//                    $scope.stores.push(data[i]);
//                  }
//                  $scope.inventory.store = "";
////$mdDialog.hide($scope.stores);
//                }).error(function (data) {
//                  console.log(data);
//                })

							$charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_InventoryAttributes", "Store,DefaultStockLevel").success(function (data) {
								var length = data.length;
								//
								$scope.stores=[];
								$rootScope.isStoreLoaded=true;
								for (var i = 0; i < length; i++) {
									for (var j = 0; j < data[i].length; j++) {
										var obj = data[i][j];
										if (obj.ColumnIndex == "0") {
											$scope.stores.push(obj);

										}
										if (obj.ColumnIndex == "1") {
											$scope.inventory.defaultstocklevel = parseInt(obj.RecordFieldData);
											$scope.inventory.defaultstockDetails = obj;
										}
									}
								}
								$scope.inventory.store = "";
							}).error(function (data) {
							})

							if (data.IsSuccess) {
								//console.log(data);
								//notifications.toast("Record Inserted, Product ID " + data.Data[0].ID , "success");
							}
						}).error(function (data) {
							//console.log(data);
						})
					}
				}
			}
			else{
				$scope.addInventoryDisabled = false;
				notifications.toast("Store cannot be empty" , "error");
			}

		}

		$scope.editInventory=false;
		$scope.updateInven = '';
		$scope.updateInventoryDisabled = false;

		$scope.editInven= function (store) {
			$scope.editInventory=true;
			$scope.displayStoreCode=store.RecordFieldData;
			$scope.updateInven = angular.copy(store);
		}

		$scope.updateStore=function (commondata) {
			var commondata=$scope.updateInven;
			$scope.updateInventoryDisabled = true;
			var req= {
				"GURecID":commondata.GuRecID,
				"RowID":commondata.RowID,
				"RecordFieldData":commondata.RecordFieldData,
				"FieldID":commondata.FieldID,
				"ColumnIndex":commondata.ColumnIndex,
				"FieldName":commondata.FieldName
			}
			var countStore=0;
			for (var i = 0; i < $scope.stores.length; i++) {
				if ($scope.stores[i].RecordFieldData == commondata.RecordFieldData) {
					if($scope.displayStoreCode!=commondata.RecordFieldData)
					{
						countStore++;
					}
				}
			}
			if(countStore==0) {
				$charge.settingsapp().update(req).success(function (data) {

					if (data.count > 0) {
						notifications.toast("Store has been updated.", "success");
//              $charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_InventoryAttributes", "Store").success(function (data) {
//                $scope.stores = [];
//                for (var i = 0; i < data.length; i++) {
//                  $scope.stores.push(data[i]);
//                }
//                $scope.editInventory = !$scope.editInventory;
//                $scope.updateInven = "";
//                $scope.updateInventoryDisabled = false;
////$mdDialog.hide($scope.stores);
//              }).error(function (data) {
//                console.log(data);
//                $scope.updateInventoryDisabled = false;
//              })

						$charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_InventoryAttributes", "Store,DefaultStockLevel").success(function (data) {
							var length = data.length;
							//
							$scope.stores=[];
							$rootScope.isStoreLoaded=true;
							for (var i = 0; i < length; i++) {
								for (var j = 0; j < data[i].length; j++) {
									var obj = data[i][j];
									if (obj.ColumnIndex == "0") {
										$scope.stores.push(obj);

									}
									if (obj.ColumnIndex == "1") {
										$scope.inventory.defaultstocklevel = parseInt(obj.RecordFieldData);
										$scope.inventory.defaultstockDetails = obj;
									}
								}
							}

							$scope.editInventory = !$scope.editInventory;
							$scope.updateInven = "";
							$scope.updateInventoryDisabled = false;
						}).error(function (data) {
							$scope.updateInventoryDisabled = false;
						})
					}
					else {
						$scope.editInventory = !$scope.editInventory;
						$scope.updateInven = "";
						$scope.updateInventoryDisabled = false;
					}
				}).error(function (data) {
					//console.log(data);
					$scope.updateInventoryDisabled = false;
				})
			}
			else
			{
				notifications.toast("Store is already exist" , "error");
				$scope.updateInventoryDisabled = false;
				$scope.updateInven.RecordFieldData = $scope.displayStoreCode;
			}
		}

		$scope.deleteAdditionalInv= function (ev) {
			$charge.settingsapp().delete(ev).success(function(data) {
				//
			}).error(function(data) {

			})
		}
		$scope.saveAdditionalInventory= function () {
			var ev=$scope.inventory.store;
			var isDuplicateStore=false;
			if($scope.stores.length!=0) {
				isDuplicateStore=true;
			}
			if (isDuplicateStore) {
				if(vm.inventoryform.$valid == true) {
					$scope.stockLevelDisabled=true;
					if ($scope.inventory.defaultstockDetails != undefined || $scope.inventory.defaultstockDetails != null)
						$scope.deleteAdditionalInv($scope.inventory.defaultstockDetails);
					var req = {
						"RecordName": "CTS_InventoryAttributes",
						"FieldName": "DefaultStockLevel",
						"RecordFieldData": $scope.inventory.defaultstocklevel
					}
					//
					$charge.settingsapp().insertDuoBaseValuesAddition(req).success(function (data) {
						//console.log(data);
						if ($scope.inventory.defaultstockDetails != undefined || $scope.inventory.defaultstockDetails != null) {
							if($scope.inventory.defaultstockDetails.RecordFieldData!="") {
								notifications.toast("Default stock level has been updated.", "success");
							}
							else {
								notifications.toast("Default stock level has been added.", "success");
								$scope.inventory.defaultstockDetails.RecordFieldData=$scope.inventory.defaultstocklevel;
							}
						}
						else
							notifications.toast("Default stock level has been added.", "success");

						$charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_InventoryAttributes", "DefaultStockLevel").success(function (data) {
							var length = data.length;
							$scope.inventory.defaultstocklevel = parseInt(data[0][0].RecordFieldData);
							$scope.inventory.defaultstockDetails=data[0][0];
							$scope.stockLevelDisabled=false;
						}).error(function (data) {
						})

						if (data.IsSuccess) {

						}
					}).error(function (data) {

					})
				}
			}
			else {
				notifications.toast("Please add store before saving default stock level.", "success");
			}
		}
		$scope.editUom=false;
		$scope.editUnit = '';
		$scope.updateUomEnable = false;

		$scope.displayUom= function (uom) {
			//console.log(ev);
			$scope.editUom=true;
			uom.editItem=true;
			$scope.displayUOMCode=uom.UOMCode;
			$scope.editUnit = angular.copy(uom);
			$scope.updateUomEnable = true;

		}

		$scope.cancelEditUOM= function (uom) {
			//console.log(ev);
			$timeout(function(){
				uom.editItem=false;
			});
		};


		$scope.updateUomDisabled = false;
		$scope.updateUOM= function () {
			var uom= $scope.editUnit;
			$scope.updateUomDisabled = true;
			var req = {
				"GUUOMID":uom.GUUOMID,
				"GUTranID":uom.GUTranID,
				"CommitStatus":uom.CommitStatus,
				"UOMCode":uom.UOMCode
			}
			var countUOM=0;
			for (var i = 0; i < $scope.UOMs.length; i++) {
				if ($scope.UOMs[i].UOMCode == uom.UOMCode) {
					if($scope.displayUOMCode!=uom.UOMCode) {
						countUOM++;
					}
				}
			}

			if(countUOM==0) {
				$charge.uom().updateUOM(req).success(function (data) {

					if (data.count > 0) {
						notifications.toast("UOM has been updated.", "success");
						$charge.uom().getAllUOM('Plan_123').success(function (data) {
							$scope.UOMs = [];
							//
							//console.log(data);
							for (var i = 0; i < data.length; i++) {
								//
								$scope.UOMs.push(data[i]);
								//
							}

							$scope.editUnit = "";
							$scope.updateUomEnable = !$scope.updateUomEnable;
							$scope.updateUomDisabled = false;
						}).error(function (data) {
							//console.log(data);
							$scope.updateUomDisabled = false;

							$scope.infoJson= {};
							$scope.infoJson.message =JSON.stringify(data);
							$scope.infoJson.app ='settings';
							logHelper.error( $scope.infoJson);
						})
					} else {
						$scope.editUnit = "";
						$scope.updateUomEnable = !$scope.updateUomEnable;
						$scope.updateUomDisabled = false;
					}
				}).error(function (data) {
					//console.log(data);
					$scope.updateUomDisabled = false;
				})
			}
			else
			{
				notifications.toast("UOM is already exist" , "error");
				$scope.updateUomDisabled = false;
				$scope.editUnit.UOMCode = $scope.displayUOMCode;
			}
		}

		$scope.updateProductUOM= function () {
			var uom= $scope.editUnit;
			$scope.updateUomDisabled = true;
			var req = {
				"GUUOMID":uom.GUUOMID,
				"GUTranID":uom.GUTranID,
				"CommitStatus":uom.CommitStatus,
				"UOMCode":uom.UOMCode
			}
			var countUOM=0;
			for (var i = 0; i < $scope.UOMs.length; i++) {
				if ($scope.UOMs[i].UOMCode == uom.UOMCode) {
					if($scope.displayUOMCode!=uom.UOMCode) {
						countUOM++;
					}
				}
			}

			if(countUOM==0) {
				$charge.uom().updateUOM(req).success(function (data) {

					if (data.count > 0) {
						notifications.toast("UOM has been updated.", "success");
						$charge.uom().getAllUOM('Product_123').success(function (data) {
							$scope.UOMs = [];
							//
							//console.log(data);
							for (var i = 0; i < data.length; i++) {
								//
								$scope.UOMs.push(data[i]);
								//
							}

							$scope.editUnit = "";
							$scope.updateUomEnable = !$scope.updateUomEnable;
							$scope.updateUomDisabled = false;
						}).error(function (data) {
							//console.log(data);
							$scope.updateUomDisabled = false;

							$scope.infoJson= {};
							$scope.infoJson.message =JSON.stringify(data);
							$scope.infoJson.app ='settings';
							logHelper.error( $scope.infoJson);
						})
					} else {
						$scope.editUnit = "";
						$scope.updateUomEnable = !$scope.updateUomEnable;
						$scope.updateUomDisabled = false;
					}
				}).error(function (data) {
					//console.log(data);
					$scope.updateUomDisabled = false;
				})
			}
			else
			{
				notifications.toast("UOM is already exist" , "error");
				$scope.updateUomDisabled = false;
				$scope.editUnit.UOMCode = $scope.displayUOMCode;
			}
		}

		$scope.submitUOM = function() {
			if (vm.unitOfMeasure.$valid == true) {
				//
				if (!$scope.updateUomEnable) {
					$scope.addUOM();
				}
				else {
					$scope.updateUOM();
				}
			}
		}

		$scope.addUomDisabled = false;
		$scope.addUOM= function () {
			var ev = $scope.plan.uom;
			$scope.addUomDisabled = true;

			if (ev != null && ev != "") {
				var isDuplicate = false;
				if ($scope.UOMs.length != 0) {
					for (var i = 0; i < $scope.UOMs.length; i++) {
						if ($scope.UOMs[i].UOMCode == ev) {
							notifications.toast("UOM Code is already exist.", "error");
							$scope.plan.uom = "";
							$scope.addUomDisabled = false;
							isDuplicate = true;
							break;
						}
					}
				}
				if (!isDuplicate) {
					var req = {
						"GUUOMID": "123",
						"GUUOMTypeID": "supplier1",
						"GUTranID": "12345",
						"CommitStatus": "Active",
						"UOMCode": ev,
						"uomApplicationMapperDetail": [{
							"GUApplicationID": "Plan_123"
						}],
						"uomConversionDetails": [{
							"FromUOMCode": ev,
							"Qty": "10",
							"ToUOMCode": ev
						}]

					}
					$charge.uom().store(req).success(function (data) {
						notifications.toast("UOM has been added.", "success");
						$charge.uom().getAllUOM('Plan_123').success(function (data) {
							$scope.UOMs = [];
							//
							//console.log(data);
							for (var i = 0; i < data.length; i++) {
								//
								$scope.UOMs.push(data[i]);
								//
							}
							$scope.plan.uom = "";
							$scope.addUomDisabled = false;
							//$mdDialog.hide($scope.UOMs);
						}).error(function (data) {
							//console.log(data);
							$scope.addUomDisabled = false;

							$scope.infoJson= {};
							$scope.infoJson.message =JSON.stringify(data);
							$scope.infoJson.app ='settings';
							logHelper.error( $scope.infoJson);
						})
						//if(data.IsSuccess) {
						//  console.log(data);
						//}
					}).error(function (data) {
						//console.log(data);
						$scope.infoJson= {};
						$scope.infoJson.message =JSON.stringify(data);
						$scope.infoJson.app ='settings';
						logHelper.error( $scope.infoJson);
					})
				}
			}
			else{
				notifications.toast("UOM cannot be empty", "error");
				$scope.addUomDisabled = false;
			}

		}

		$scope.addProductUOM= function () {
			var ev = $scope.product.uom;
			$scope.addUomDisabled = true;

			if (ev != null && ev != "") {
				var isDuplicate = false;
				if ($scope.UOMs.length != 0) {
					for (var i = 0; i < $scope.UOMs.length; i++) {
						if ($scope.UOMs[i].UOMCode == ev) {
							notifications.toast("UOM Code is already exist.", "error");
							$scope.product.uom = "";
							$scope.addUomDisabled = false;
							isDuplicate = true;
							break;
						}
					}
				}
				if (!isDuplicate) {
					var req = {
						"GUUOMID": "123",
						"GUUOMTypeID": "supplier1",
						"GUTranID": "12345",
						"CommitStatus": "Active",
						"UOMCode": ev,
						"uomApplicationMapperDetail": [{
							"GUApplicationID": "Product_123"
						}],
						"uomConversionDetails": [{
							"FromUOMCode": ev,
							"Qty": "10",
							"ToUOMCode": ev
						}]

					}
					$charge.uom().store(req).success(function (data) {
						notifications.toast("UOM has been added.", "success");
						$charge.uom().getAllUOM('Product_123').success(function (data) {
							$scope.UOMs = [];
							//
							//console.log(data);
							for (var i = 0; i < data.length; i++) {
								//
								$scope.UOMs.push(data[i]);
								//
							}
							$scope.product.uom = "";
							$scope.addUomDisabled = false;
							//$mdDialog.hide($scope.UOMs);
						}).error(function (data) {
							//console.log(data);
							$scope.addUomDisabled = false;

							$scope.infoJson= {};
							$scope.infoJson.message =JSON.stringify(data);
							$scope.infoJson.app ='settings';
							logHelper.error( $scope.infoJson);
						})
						//if(data.IsSuccess) {
						//  console.log(data);
						//}
					}).error(function (data) {
						//console.log(data);
						$scope.infoJson= {};
						$scope.infoJson.message =JSON.stringify(data);
						$scope.infoJson.app ='settings';
						logHelper.error( $scope.infoJson);
					})
				}
			}
			else{
				notifications.toast("UOM cannot be empty", "error");
				$scope.addUomDisabled = false;
			}

		}

		$scope.submitPlan= function (state) {
			$scope.updateUomEnable = state;
			if (vm.planType.$valid == true) {
				//
				if (!$scope.updateUomEnable) {
					$scope.addPlan();
				}
				else {
					$scope.updatePlan();
				}
			}
		}

		$scope.addPlanDialog = function() {
			$mdDialog.show({
				controller: 'addPlanController as vm',
				templateUrl: 'app/main/settings/dialogs/plans/prompt-add-plan.html',
				clickOutsideToClose:false,
				locals:{
					submitPlan : $scope.submitPlan,
					plan : $scope.plan,
					editUnit:null,
					updateUomEnable:false,
					addUomDisabled:$scope.addUomDisabled
				}
			});
		};

		$scope.editPlanDialog = function(plantype) {
			$mdDialog.show({
				controller: 'addPlanController as vm',
				templateUrl: 'app/main/settings/dialogs/plans/prompt-add-plan.html',
				clickOutsideToClose:false,
				locals:{
					submitPlan : $scope.submitPlan,
					plan : $scope.plan,
					editUnit:plantype,
					updateUomEnable:true,
					addUomDisabled:$scope.addUomDisabled
				}
			});
		};

		$scope.addUomDisabled = false;
		$scope.addPlan = function()
		{
			$scope.addUomDisabled = true;

			var ev=$scope.plan.plantype;
			if(ev!=null && ev!="") {
				var isDuplicatePlanType=false;
				if($scope.planTypeList.length!=0) {
					for (var i = 0; i < $scope.planTypeList.length; i++) {
						if ($scope.planTypeList[i].RecordFieldData == ev) {
							isDuplicatePlanType=true;
							notifications.toast("Type is already exist.", "error");
							$scope.plan.plantype="";
							$scope.addUomDisabled = false;
							break;
						}
					}
				}
				if(!isDuplicatePlanType) {
					if ($rootScope.isPlanTypeLoaded) {
						var req = {
							"RecordName": "CTS_PlanAttributes",
							"FieldName": "PlanType",
							"RecordFieldData": ev
						}

						$charge.settingsapp().insertDuoBaseValuesAddition(req).success(function (data) {
							//console.log(data);
							notifications.toast("Type has been added.", "success");
							$mdDialog.hide();

							$scope.infoJson= {};
							$scope.infoJson.message =ev+' Type has been added';
							$scope.infoJson.app ='settings';
							logHelper.info( $scope.infoJson);
							//$charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_InventoryAttributes", "Store").success(function (data) {
							//  $scope.stores = [];
							//  for (var i = 0; i < data.length; i++) {
							//    $scope.stores.push(data[i]);
							//  }
							//  $scope.inventory.store = "";
							//  $scope.addInventoryDisabled = false;
							//  //$mdDialog.hide($scope.stores);
							//}).error(function (data) {
							//  console.log(data);
							//  $scope.addInventoryDisabled = false;
							//})
							$charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_PlanAttributes", "PlanType").success(function (data) {
								var length = data.length;
								//
								$scope.planTypeList=[];
								$rootScope.isPlanTypeLoaded=true;
								for (var i = 0; i < length; i++) {
									for (var j = 0; j < data[i].length; j++) {
										var obj = data[i][j];
										if (obj.ColumnIndex == "0") {
											$scope.planTypeList.push(obj);

										}
									}
								}
								$scope.plan.plantype = "";
							}).error(function (data) {
								$scope.infoJson= {};
								$scope.infoJson.message =JSON.stringify(data);
								$scope.infoJson.app ='settings';
								logHelper.error( $scope.infoJson);
							})

							if (data.error=="00000") {
								//console.log(data);
								$scope.addUomDisabled = false;
								//notifications.toast("Record Inserted, Product ID " + data.Data[0].ID , "success");
								$scope.infoJson= {};
								$scope.infoJson.message =JSON.stringify(data);
								$scope.infoJson.app ='settings';
								logHelper.error( $scope.infoJson);
							}
						}).error(function (data) {
							//console.log(data);
							$scope.addUomDisabled = false;

							$scope.infoJson= {};
							$scope.infoJson.message =JSON.stringify(data);
							$scope.infoJson.app ='settings';
							logHelper.error( $scope.infoJson);
						})
					}
					else {
						var req = {
							"GURecID": "123",
							"RecordType": "CTS_PlanAttributes",
							"OperationalStatus": "Active",
							"RecordStatus": "Active",
							"Cache": "CTS_PlanAttributes",
							"Separate": "Test",
							"RecordName": "CTS_PlanAttributes",
							"GuTranID": "12345",
							"RecordCultureName": "CTS_PlanAttributes",
							"RecordCode": "CTS_PlanAttributes",
							"commonDatafieldDetails": [
								{
									"FieldCultureName": "PlanType",
									"FieldID": "124",
									"FieldName": "PlanType",
									"FieldType": "PlanType_Type",
									"ColumnIndex": "0"
								}],
							"commonDataValueDetails": [
								{
									"RowID": "1452",
									"RecordFieldData": ev,
									"ColumnIndex": "0"
								}]
						}
						//
						$charge.settingsapp().store(req).success(function (data) {
							$rootScope.isPlanTypeLoaded = true;
							notifications.toast("Type has been added.", "success");
							$mdDialog.hide();

							$scope.infoJson= {};
							$scope.infoJson.message =ev+' Type has been added';
							$scope.infoJson.app ='settings';
							logHelper.info( $scope.infoJson);
							//                $charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_InventoryAttributes", "Store").success(function (data) {
							//                  $scope.stores = [];
							//                  for (var i = 0; i < data.length; i++) {
							//                    $scope.stores.push(data[i]);
							//                  }
							//                  $scope.inventory.store = "";
							////$mdDialog.hide($scope.stores);
							//                }).error(function (data) {
							//                  console.log(data);
							//                })

							$charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_PlanAttributes", "PlanType").success(function (data) {
								var length = data.length;
								//
								$scope.planTypeList=[];
								$rootScope.isPlanTypeLoaded=true;
								for (var i = 0; i < length; i++) {
									for (var j = 0; j < data[i].length; j++) {
										var obj = data[i][j];
										if (obj.ColumnIndex == "0") {
											$scope.planTypeList.push(obj);

										}
									}
								}
								$scope.plan.plantype = "";
							}).error(function (data) {
								$scope.infoJson= {};
								$scope.infoJson.message =JSON.stringify(data);
								$scope.infoJson.app ='settings';
								logHelper.error( $scope.infoJson);
							})

							if (data[0].error=="00000") {
								//console.log(data);
								$scope.addUomDisabled = false;
								//notifications.toast("Record Inserted, Product ID " + data.Data[0].ID , "success");
							}
						}).error(function (data) {
							//console.log(data);
							$scope.addUomDisabled = false;

							$scope.infoJson= {};
							$scope.infoJson.message =JSON.stringify(data);
							$scope.infoJson.app ='settings';
							logHelper.error( $scope.infoJson);
						})
					}
				}
			}
			else{
				$scope.addUomDisabled = false;
				notifications.toast("Type cannot be empty" , "error");
			}

		}

		$scope.editUom=false;
		$scope.editUnit = '';
		$scope.updateUomEnable = false;

		$scope.editPlan= function (plan) {
			//$scope.editInventory=true;
			//$scope.displayStoreCode=plan.RecordFieldData;
			//$scope.updateInven = angular.copy(plan);

			$scope.editUom=true;
			$scope.displayUOMCode=plan.RecordFieldData;
			$scope.editUnit = angular.copy(plan);
			$scope.updateUomEnable = true;
		}

		$scope.updateUomDisabled = false;
		$scope.updatePlan=function (commondata) {
			var commondata=$scope.editUnit;
			$scope.updateUomDisabled = true;
			var req= {
				"GURecID":commondata.GuRecID,
				"RowID":commondata.RowID,
				"RecordFieldData":commondata.RecordFieldData,
				"FieldID":commondata.FieldID,
				"ColumnIndex":commondata.ColumnIndex,
				"FieldName":commondata.FieldName
			}
			var countPlan=0;
			for (var i = 0; i < $scope.planTypeList.length; i++) {
				if ($scope.planTypeList[i].RecordFieldData == commondata.RecordFieldData) {
					if($scope.displayUOMCode!=commondata.RecordFieldData)
					{
						countPlan++;
					}
				}
			}
			if(countPlan==0) {
				$charge.settingsapp().update(req).success(function (data) {

					if (data.count > 0) {
						notifications.toast("Type has been updated.", "success");

						$scope.infoJson= {};
						$scope.infoJson.message =commondata.RecordFieldData+' Type has been updated';
						$scope.infoJson.app ='settings';
						logHelper.info( $scope.infoJson);
//              $charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_InventoryAttributes", "Store").success(function (data) {
//                $scope.stores = [];
//                for (var i = 0; i < data.length; i++) {
//                  $scope.stores.push(data[i]);
//                }
//                $scope.editInventory = !$scope.editInventory;
//                $scope.updateInven = "";
//                $scope.updateInventoryDisabled = false;
////$mdDialog.hide($scope.stores);
//              }).error(function (data) {
//                console.log(data);
//                $scope.updateInventoryDisabled = false;
//              })

						$charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_PlanAttributes", "PlanType").success(function (data) {
							var length = data.length;
							//
							$scope.planTypeList=[];
							$rootScope.isPlanTypeLoaded=true;
							for (var i = 0; i < length; i++) {
								for (var j = 0; j < data[i].length; j++) {
									var obj = data[i][j];
									if (obj.ColumnIndex == "0") {
										$scope.planTypeList.push(obj);

									}
								}
							}

							$scope.editUom = !$scope.editUom;
							$scope.editUnit = "";
							$scope.updateUomDisabled = false;
							$mdDialog.hide();
						}).error(function (data) {
							$scope.updateUomDisabled = false;
							$mdDialog.hide();

							$scope.infoJson= {};
							$scope.infoJson.message =JSON.stringify(data);
							$scope.infoJson.app ='settings';
							logHelper.error( $scope.infoJson);
						})
						$scope.updateUomEnable = false;
					}
					else {
						$scope.editUom = !$scope.editUom;
						$scope.editUnit = "";
						$scope.updateUomDisabled = false;
						$scope.updateUomEnable = false;
					}
				}).error(function (data) {
					$mdDialog.hide();
					//console.log(data);
					$scope.updateUomDisabled = false;
					$scope.updateUomEnable = false;

					$scope.infoJson= {};
					$scope.infoJson.message =JSON.stringify(data);
					$scope.infoJson.app ='settings';
					logHelper.error( $scope.infoJson);
				})
			}
			else
			{
				notifications.toast("Type already exist" , "error");
				$scope.updateUomDisabled = false;
				$scope.updateUomEnable = false;
				$scope.editUnit.RecordFieldData = $scope.displayUOMCode;
			}
		}

		$scope.deletePlan= function (ev,index) {

			$charge.settingsapp().delete(ev).success(function(data) {
				//
				$scope.planTypeList.splice(index,1);
			}).error(function(data) {
				//console.log(data);
			})
		}


		$scope.changePlanFee={};

		$scope.openPlanChangeView = function () {
			vm.planChangeFeeForm.$setPristine();
			vm.planChangeFeeForm.$setUntouched();
			$scope.planChangeView = true;
		}

		$scope.submitPlanChangeFee= function () {

			if(vm.planChangeFeeForm.$valid){
				$scope.planChangeFeeSubmitted=true;

				$scope.changePlanFee.currency=$scope.BaseCurrencyPlanChangeFee;
				$scope.changePlanFee.rate=$scope.currencyRate;

				var planChangeFeeDuplicate=false;

				for(var i = 0; i < $scope.planChangeFeeList.length; i++)
				{
					if($scope.planChangeFeeList[i].planFrom==$scope.changePlanFee.planFrom && $scope.planChangeFeeList[i].planTo==$scope.changePlanFee.planTo)
					{
						planChangeFeeDuplicate=true;
						break;
					}
				}

				if(!planChangeFeeDuplicate)
				{
					$charge.plan().createPlanChangeFee($scope.changePlanFee).success(function(data)
					{
						if(data.response=="succeeded")
						{
							notifications.toast("Successfully plan change fee created","success");
							$scope.planChangeFeeSubmitted=false;
							$scope.changePlanFee={};

							$scope.infoJson= {};
							$scope.infoJson.message ='Successfully plan change fee created';
							$scope.infoJson.app ='settings';
							logHelper.info( $scope.infoJson);

							skipPlanChangeFee=0;
							$scope.planChangeFeeList=[];
							$scope.loadPlanChangeFeePaging();
							vm.planChangeFeeForm.$setPristine();
							vm.planChangeFeeForm.$setUntouched();
							$scope.planChangeView=false;
						}
						else
						{
							notifications.toast("Plan change fee creation failed","error");
							$scope.planChangeFeeSubmitted=false;
							$scope.planChangeView=false;
						}
					}).error(function(data)
					{
						notifications.toast("Plan change fee creation failed","error");
						$scope.planChangeFeeSubmitted=false;
						$scope.planChangeView=false;

						$scope.infoJson= {};
						$scope.infoJson.message =JSON.stringify(data);
						$scope.infoJson.app ='settings';
						logHelper.error( $scope.infoJson);
					})
				}
				else
				{
					notifications.toast("Duplicate Change Plans","error");
					$scope.planChangeFeeSubmitted=false;
					$scope.changePlanFee.planFrom="";
					$scope.changePlanFee.planTo="";
				}
			}else{
				angular.element('#planChangeFeeForm').find('.ng-invalid:visible:first').focus();
			}
		}



		$scope.planChangeFeeItemOriginal=[];
		$scope.editPlanChangeFee= function (plan) {
			//$scope.cancelEditPlanChangeFee($scope.planChangeFeeItemOriginal);

			$scope.planChangeFeeItemOriginal=angular.copy(plan);
			plan.editItem=true;

		}

		$scope.cancelEditPlanChangeFee= function (plan) {

			plan.editItem=false;
			plan.planFrom=angular.copy($scope.planChangeFeeItemOriginal.planFrom);
			plan.planTo=angular.copy($scope.planChangeFeeItemOriginal.planTo);
			plan.fee=angular.copy($scope.planChangeFeeItemOriginal.fee);
			//plan.editItem=false;
		}

		$scope.updatingPlanChangeFee= function (updatePlan, index) {

			$scope.planChangeFeeUpdateSubmitted=true;

			var planChangeFeeUpdateDuplicate=false;
			var planChangeFeeUpdateInvalid=false;

			for(var i = 0; i < $scope.planChangeFeeList.length; i++)
			{
				if(index==i)
				{

				}
				else if($scope.planChangeFeeList[i].planFrom==updatePlan.planFrom && $scope.planChangeFeeList[i].planTo==updatePlan.planTo)
				{
					planChangeFeeUpdateDuplicate=true;
					break;
				}
			}
			if(updatePlan.planFrom=="" || updatePlan.planTo=="" || updatePlan.fee=="" || updatePlan.fee==undefined)
			{
				planChangeFeeUpdateInvalid=true;
				$scope.planChangeFeeUpdateSubmitted=false;
			}

			if(!planChangeFeeUpdateDuplicate && !planChangeFeeUpdateInvalid)
			{
				$charge.plan().updatePlanChangeFee(updatePlan).success(function(data)
				{
					if(data.response=="succeeded")
					{
						notifications.toast("Successfully Plan Change Fee Updated","success");
						$scope.planChangeFeeUpdateSubmitted=false;

						$scope.infoJson= {};
						$scope.infoJson.message ='Successfully Plan Change Fee Updated';
						$scope.infoJson.app ='settings';
						logHelper.info( $scope.infoJson);

						skipPlanChangeFee=0;
						$scope.planChangeFeeList=[];
						$scope.loadPlanChangeFeePaging();

					}
					else
					{
						notifications.toast("Plan Change Fee Updating Failed","error");
						$scope.planChangeFeeUpdateSubmitted=false;

						$scope.infoJson= {};
						$scope.infoJson.message =JSON.stringify(data);
						$scope.infoJson.app ='settings';
						logHelper.error( $scope.infoJson);
					}
				}).error(function(data)
				{
					notifications.toast("Plan Change Fee Updating Failed","error");
					$scope.planChangeFeeUpdateSubmitted=false;

					$scope.infoJson= {};
					$scope.infoJson.message =JSON.stringify(data);
					$scope.infoJson.app ='settings';
					logHelper.error( $scope.infoJson);
				})
			}
			else
			{
				if(planChangeFeeUpdateInvalid)
				{
					notifications.toast("Invalid Change Plan Details","error");
				}
				else
				{
					notifications.toast("Duplicate Change Plans","error");
				}
				$scope.planChangeFeeUpdateSubmitted=false;
			}
		}

		$scope.deletingPlanChangeFee= function (plan) {

			$charge.plan().deletePlanChangeFee(plan.guChangeFeeID).success(function(data)
			{
				if(data.response=="succeeded")
				{
					notifications.toast("Successfully Plan Change Fee Deleted","success");

					$scope.infoJson= {};
					$scope.infoJson.message ='Successfully Plan Change Fee Deleted';
					$scope.infoJson.app ='settings';
					logHelper.info( $scope.infoJson);

					skipPlanChangeFee=0;
					$scope.planChangeFeeList=[];
					$scope.loadPlanChangeFeePaging();

				}
				else
				{
					notifications.toast("Plan Change Fee Deleting Failed","error");

					$scope.infoJson= {};
					$scope.infoJson.message =JSON.stringify(data);
					$scope.infoJson.app ='settings';
					logHelper.error( $scope.infoJson);
				}
			}).error(function(data)
			{
				notifications.toast("Plan Change Fee Deleting Failed","error");

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})

		}

		$scope.tempSelectedWebhook=[];
		$scope.webhookItemViewToggle= function (event) {
			if($scope.tempSelectedWebhook!=[] && $scope.tempSelectedWebhook!=event)
			{
				$scope.tempSelectedWebhook.showEvents=false;
			}
			$scope.tempSelectedWebhook=event;

			if(event.showEvents)
			{
				event.showEvents=!event.showEvents;
			}
			else
			{
				event.showEvents=!event.showEvents;
			}
		}


		vm.webhook={};
		vm.webhookSubmitted = false;

		$scope.showDeleteWebhookConfirm = function(ev,webhook) {
			// Appending dialog to document.body to cover sidenav in docs app
			var confirm = $mdDialog.confirm()
				.title('Would you like to delete this Webhook?')
				.textContent('You cannot revert this action again for a active Webhook!')
				.ariaLabel('Lucky day')
				.targetEvent(ev)
				.ok('Please do it!')
				.cancel('No!');

			$mdDialog.show(confirm).then(function() {
				$scope.deleteWebhook(webhook);
			}, function() {

			});
		};

		$scope.deleteWebhook= function (webhook) {
			//$scope.resetWebhook();
			var webhookID=webhook.guWebhookId;
			$charge.webhook().deleteWebhookByID(webhookID).success(function (data) {
				if(data.error=="00000")
				{
					notifications.toast("Webhook has Deleted Successfully", "success");
					$scope.resetWebhook();

					$scope.infoJson= {};
					$scope.infoJson.message ='Webhook has Deleted Successfully';
					$scope.infoJson.app ='settings';
					logHelper.info( $scope.infoJson);
				}
				else
				{
					notifications.toast("Webhook Deleting Failed", "error");

					$scope.infoJson= {};
					$scope.infoJson.message =JSON.stringify(data);
					$scope.infoJson.app ='settings';
					logHelper.error( $scope.infoJson);
				}
			}).error(function (data) {
				//console.log(data);
				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})
		}

		vm.webhookTypeChange = function (type) {
			for (var i = 0; i < vm.webhookEventList.length; i++) {
				if(type==true)
				{
					if(!vm.webhookEventList[i].isAlreadyUsed)
					{
						vm.webhookEventList[i].isSelected=true;
						vm.webhookEventList[i].isDisabled=false;
					}
				}
				else if(type==false)
				{
					vm.webhookEventList[i].isSelected=false;
					vm.webhookEventList[i].isDisabled=false;
				}
			}
		};

		// $scope.resetWebhook= function () {
		// 	$scope.webhook={};
		// 	$scope.webhook.type="custom";
		// 	$scope.webhook.mode="Live";
		// 	vm.webhookTypeChange("custom");
		//
		// 	vm.webhookList=[];
		// 	skipAllWebhooks=0;
		// 	vm.tempUsedEventsList=[];
		// 	$scope.loadWebhookListPaging();
		//
		// 	$scope.enabledEditWH=false;
		// }

		$scope.selectChangeTemplate= function (template) {
			for (var i = 0; i < vm.emailTemplateList.length; i++) {
				if(vm.emailTemplateList[i].url!=template)
				{
					vm.emailTemplateList[i].isSelected=false;
				}
				else
				{
					vm.emailTemplateList[i].isSelected=true;
				}
			}
			$scope.loadingEmailTemplates = false;
		}

		$scope.templateToEnlarge = "";

		$scope.maximizeTemplate = function (template) {
			$scope.selectedTemplateView = template;
			$mdDialog.show({
				controller: 'MaximizeTemplateController',
				templateUrl: 'app/main/settings/dialogs/email-templates-full/emailTemplateFull.html',
				clickOutsideToClose:false,
				locals:{
					selectedTemplateView: template,
					template: $scope.template,
					footerDet: $scope.footerDet,
					cropper: $scope.cropper
				}
			});
		};

		$scope.closeDialog = function () {
			$mdDialog.hide();
		};

		vm.emailTemplateSubmitted=false;

		$scope.submitEmailTemplate= function () {
			vm.emailTemplateSubmitted=true;
			var tempEmailTemplateSelected=false;
			var tempEmailTemplate="";
			for (var i = 0; i < vm.emailTemplateList.length; i++) {
				if(vm.emailTemplateList[i].isSelected)
				{
					tempEmailTemplate=vm.emailTemplateList[i].url;
					tempEmailTemplateSelected=true;
					break;
				}
			}

			if(tempEmailTemplateSelected)
			{
				if($scope.defaultEmailTemplate!="")
				{
					$charge.settingsapp().deleteCommmon($scope.defaultEmailTemplateID).success(function (data) {
						var req = {
							"RecordName": "CTS_EmailTemplates",
							"FieldName": "TemplateUrl",
							"RecordFieldData": tempEmailTemplate
						}

						$charge.settingsapp().insertDuoBaseValuesAddition(req).success(function (data) {
							notifications.toast("Template has been Set", "success");
							$scope.defaultEmailTemplate=angular.copy(tempEmailTemplate);
							vm.emailTemplateSubmitted=false;
						}).error(function (data) {
							//console.log(data);
							notifications.toast("Template Saving Error", "error");
							vm.emailTemplateSubmitted=false;

							$scope.infoJson= {};
							$scope.infoJson.message =JSON.stringify(data);
							$scope.infoJson.app ='settings';
							logHelper.error( $scope.infoJson);
						})
					}).error(function (data) {
						//console.log(data);
						notifications.toast("Template Saving Error", "error");
						vm.emailTemplateSubmitted=false;

						$scope.infoJson= {};
						$scope.infoJson.message =JSON.stringify(data);
						$scope.infoJson.app ='settings';
						logHelper.error( $scope.infoJson);
					})

				}
				else
				{
					var req={
						"GURecID":"123",
						"RecordType":"CTS_EmailTemplates",
						"OperationalStatus":"Active",
						"RecordStatus":"Active",
						"Cache":"CTS_EmailTemplates",
						"Separate":"Test",
						"RecordName":"CTS_EmailTemplates",
						"GuTranID":"12345",
						"RecordCultureName":"CTS_EmailTemplates",
						"RecordCode":"CTS_EmailTemplates",
						"commonDatafieldDetails":[
							{
								"FieldCultureName":"TemplateUrl",
								"FieldID":"124",
								"FieldName":"TemplateUrl",
								"FieldType":"TemplateUrlType",
								"ColumnIndex":"0"
							}
						],
						"commonDataValueDetails":[
							{
								"RowID":"1452",
								"RecordFieldData":tempEmailTemplate,
								"ColumnIndex":"0"
							}
						]

					}

					$charge.settingsapp().store(req).success(function (data) {
						notifications.toast("Template has Set", "success");
						$scope.defaultEmailTemplate=angular.copy(tempEmailTemplate);
						vm.emailTemplateSubmitted=false;

					}).error(function (data) {
						//console.log(data);
						notifications.toast("Template Saving Error", "error");
						vm.emailTemplateSubmitted=false;

						$scope.infoJson= {};
						$scope.infoJson.message =JSON.stringify(data);
						$scope.infoJson.app ='settings';
						logHelper.error( $scope.infoJson);
					})
				}


			}
			else
			{
				notifications.toast("Please select a Template", "error");
				vm.emailTemplateSubmitted=false;
			}
		}

		$scope.addCategoryDisabled = false;
		$scope.submitCategories = function() {
			if (vm.categories.$valid == true) {
				//
				if (!$scope.updateCatEnable) {
					$scope.addCat();
				}
				else {
					$scope.updateCat();
				}
			}
		}
		$scope.addCat = function()
		{
			var ev=$scope.product.category;
			$scope.addCategoryDisabled = true;

			if(ev!=null && ev!="") {
				var isDuplicateCat=false;
				if($scope.categories.length!=0) {
					for (var i = 0; i < $scope.categories.length; i++) {
						if ($scope.categories[i].RecordFieldData == ev) {
							isDuplicateCat=true;
							notifications.toast("Category is already exist.", "error");
							$scope.product.category="";
							$scope.addCategoryDisabled = false;
							$scope.addCatView = false;
							break;
						}
					}
				}
				if(!isDuplicateCat) {
					if ($rootScope.isCategoryLoaded) {
						var req = {
							"RecordName": "CTS_CommonAttributes",
							"FieldName": "Category",
							"RecordFieldData": ev
						}

						$charge.settingsapp().insertDuoBaseValuesAddition(req).success(function (data) {
							notifications.toast("Category has been added.", "success");
							$charge.settingsapp().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_CommonAttributes", "Category").success(function (data) {
								$scope.categories = [];
								for (var i = 0; i < data.length; i++) {
									$scope.categories.push(data[i]);
								}
								$scope.product.category = "";
								$scope.addCategoryDisabled = false;
								$scope.addCatView = false;
//$mdDialog.hide($scope.categories);
							}).error(function (data) {
								$scope.addCategoryDisabled = false;
								$scope.addCatView = false;
//console.log(data);
							})

							//if(data.IsSuccess) {
							//  console.log(data);
							//  //notifications.toast("Record Inserted, Product ID " + data.Data[0].ID , "success");
							//}
						}).error(function (data) {
							$scope.addCategoryDisabled = false;
							$scope.addCatView = false;
//console.log(data);
						})
					}
					else {
						var req = {
							"GURecID": "123",
							"RecordType": "CTS_CommonAttributes",
							"OperationalStatus": "Active",
							"RecordStatus": "Active",
							"Cache": "CTS_CommonAttributes",
							"Separate": "Test",
							"RecordName": "CTS_CommonAttributes",
							"GuTranID": "12345",
							"RecordCultureName": "CTS_CommonAttributes",
							"RecordCode": "CTS_CommonAttributes",
							"commonDatafieldDetails": [
								{
									"FieldCultureName": "Category",
									"FieldID": "124",
									"FieldName": "Category",
									"FieldType": "CategoryType",
									"ColumnIndex": "0"
								}],
							"commonDataValueDetails": [
								{
									"RowID": "1452",
									"RecordFieldData": ev,
									"ColumnIndex": "0"
								}]
						}

						$charge.settingsapp().store(req).success(function (data) {
							$rootScope.isCategoryLoaded = true;
							notifications.toast("Category has been added.", "success");
							$charge.settingsapp().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_CommonAttributes", "Category").success(function (data) {
								$scope.categories = [];
								for (var i = 0; i < data.length; i++) {
									$scope.categories.push(data[i]);
								}
								$scope.product.category = "";
								$scope.addCategoryDisabled = false;
								$scope.addCatView = false;
//$mdDialog.hide($scope.categories);
							}).error(function (data) {
								$scope.addCategoryDisabled = false;
								$scope.addCatView = false;
//console.log(data);
							})

							if (data.IsSuccess) {
								//console.log(data);
								$scope.addCategoryDisabled = false;
								$scope.addCatView = false;
//notifications.toast("Record Inserted, Product ID " + data.Data[0].ID , "success");
							}
						}).error(function (data) {
							//console.log(data);
							$scope.addCatView = false;
						})
					}
				}
			}
			else{
				$scope.addCategoryDisabled = false;
				notifications.toast("Category cannot be empty" , "error");
			}
		}

		$scope.updateCategoryDisabled = false;
		$scope.updateCat= function () {
			var commondata=$scope.editCategory;
			$scope.updateCategoryDisabled = true;

			var req= {
				"GURecID":commondata.GuRecID,
				"RowID":commondata.RowID,
				"RecordFieldData":commondata.RecordFieldData,
				"FieldID":commondata.FieldID,
				"ColumnIndex":commondata.ColumnIndex,
				"FieldName":commondata.FieldName
			}
			var countCat=0;
			for (var i = 0; i < $scope.categories.length; i++) {
				if ($scope.categories[i].RecordFieldData == commondata.RecordFieldData) {
					if($scope.displayCategoryCode!=commondata.RecordFieldData) {
						countCat++;
					}
				}
			}
			if(countCat==0) {
				$charge.settingsapp().update(req).success(function (data) {
					//
					if (data.count > 0) {
						notifications.toast("Category has been updated.", "success");
						$charge.settingsapp().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_CommonAttributes", "Category").success(function (data) {
							$scope.categories = [];
							for (var i = 0; i < data.length; i++) {
								$scope.categories.push(data[i]);
							}
							$scope.editCategory = "";
							$scope.updateCatEnable = !$scope.updateCatEnable;
							$scope.updateCategoryDisabled = false;
						}).error(function (data) {
							//console.log(data);
							$scope.updateCategoryDisabled = false;
						})
					} else {
						$scope.editCategory = "";
						$scope.updateCatEnable = !$scope.updateCatEnable;
						$scope.updateCategoryDisabled = false;
					}
				}).error(function (data) {
					//console.log(data);
					$scope.updateCategoryDisabled = false;
				})
			}
			else
			{
				notifications.toast("Category is already exist", "error");
				$scope.updateCategoryDisabled = false;
				$scope.editCategory.RecordFieldData = $scope.displayCategoryCode;
			}
		}

		$scope.displayCat= function (category) {
			$scope.displayCategoryCode=category.RecordFieldData;
			$scope.editCategory = angular.copy(category);
			$scope.updateCatEnable = true;
			category.editItem = true;
		}

		$scope.cancelEditCat= function (category) {
			$timeout(function(){
				category.editItem=false;
			});
		}

		$scope.cancelEditBrand= function (brand) {
			$timeout(function(){
				brand.editItem=false;
			});
		}

		$scope.deleteCommonData= function (ev,index) {
			//
			$charge.settingsapp().delete(ev).success(function(data) {
				//
				if(ev.ColumnIndex=="0")
					$scope.categories.splice(index,1);
				else if(ev.ColumnIndex=="1")
					$scope.brands.splice(index,1);
			}).error(function(data) {
				//console.log(data);
			})
		}

		$scope.deleteStore= function (ev,index) {

			$charge.settingsapp().delete(ev).success(function(data) {
				//
				$scope.stores.splice(index,1);
			}).error(function(data) {
				//console.log(data);
			})
		}

		$scope.showDeleteUOMConfirm = function(ev,uom,index) {
			// Appending dialog to document.body to cover sidenav in docs app
			var confirm = $mdDialog.confirm()
				.title('Would you like to delete this UOM?')
				.textContent('You cannot revert this action again for a active UOM!')
				.ariaLabel('Lucky day')
				.targetEvent(ev)
				.ok('Please do it!')
				.cancel('No!');

			$mdDialog.show(confirm).then(function() {
				$scope.deleteUOM(uom,index);
			}, function() {

			});
		};

		$scope.deleteUOM= function (ev,index) {
			//
			$charge.uom().delete(ev.GUUOMID).success(function(data) {
				//
				$scope.UOMs.splice(index,1);
				notifications.toast("UOM has been deleted successfully", "success");
			}).error(function(data) {
				//console.log(data);
				notifications.toast("UOM deleting Failed", "error");

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})
		}



		//Invoice Pane
		$scope.invoice={};
		//$scope.invoice.invoicePrefix="";
		//$scope.invoice.prefixLength="";
		//$scope.invoice.enableDiscounts=0;
		//$scope.invoice.sendInvoice=0;
		//$scope.invoice.sendReminder=0;
		//$scope.invoice.allowPartialPay=0;
		//$scope.invoice.firstReminder="";
		//$scope.invoice.RecurrReminder="";
		$scope.invoiceSettings=[];
		$scope.invoiceTerms=[];
		$scope.editOn=false;
		var isInvoiceLoaded=false;

		$scope.editInvoice=true;
		$scope.updateInv = '';


		$scope.invoiceReminders=[];

		$scope.addReminder = function () {
			var existingReminder = $scope.invoiceReminders[$scope.invoiceReminders.length - 1];
			var index=existingReminder!=undefined?existingReminder.No:0;
			$scope.addNewReminder(index);
		}

		$scope.removeReminder = function (index) {
			if($scope.invoiceReminders.length!=1) {
				$scope.invoiceReminders.splice(index, 1);
			}
		}

		//var reminderCount=0;
		$scope.addNewReminder=function(index)
		{
			index++;
			var reminder={};
			reminder.isDisabled=true;
			reminder.No=index;
			reminder.ReminderDays=0;
			reminder.ReminderType='';
			$scope.invoiceReminders.push(reminder);
		}

		//$scope.addNewReminder(0);

		//$scope.isReminderOn = true;
		//$scope.turnOnReminder = function (ev, index) {
		//  if($scope.isReminderOn){
		//    $scope.showReminderDialog(ev, index);
		//  }else{
		//    $scope.turnOffReminder(index);
		//  }
		//};
		$scope.reminderInfo = [];
		$scope.showReminderInfo = function (ev, index) {
			$scope.reminderInfo.push($scope.invoiceReminders[index]);

			//
			// $mdDialog.show({
			// 	controller: 'ReminderDialogController as vm',
			// 	templateUrl: 'app/main/settings/dialogs/reminderDialogInfo.html',
			// 	parent: angular.element(document.body),
			// 	targetEvent: ev,
			// 	clickOutsideToClose:true,
			// 	locals: {
			// 		reminderTypeDefault:'Before',
			// 		rowIndex:index,
			// 		reminderCon:$scope.invoiceReminders[index]
			// 	}
			// })
			// 	.then(function(reminders) {
			// 	})

		}

		$scope.showReminderDialog = function(ev,index)
		{
			$mdDialog.show({
				controller: 'ReminderDialogController as vm',
				templateUrl: 'app/main/settings/dialogs/reminderDialog.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose:true,
				locals: {
					reminderTypeDefault:'Before',
					rowIndex:index,
					reminderCon:$scope.invoiceReminders[index],
					showReminderInfo: $scope.showReminderInfo
				}
			})
				.then(function(reminders) {
					if(reminders!=undefined) {
						$scope.invoiceReminders[reminders.reminderIndex]['ReminderDays'] = reminders.ReminderDays;
						$scope.invoiceReminders[reminders.reminderIndex]['ReminderType'] = reminders.ReminderType;
						$scope.invoiceReminders[reminders.reminderIndex]['isDisabled'] = reminders.isDisabled;
					}
				})

		}

		$scope.turnOffReminder= function (index) {
			//
			$scope.invoiceReminders[index]['isDisabled']=!$scope.invoiceReminders[index]['isDisabled'];
		}

		$scope.editInv= function () {
			//console.log(ev);
			$scope.editInvoice=true;
			$scope.updateInv = "invoice";
			//$mdDialog.show({
			//  controller: 'updateCatCtrl',
			//  locals:{commondata: ev},
			//  templateUrl: 'partials/edit_category.html',
			//  parent: angular.element(document.body),
			//  targetEvent: ev,
			//  clickOutsideToClose:true
			//})
			//  .then(function(categories) {
			//    $scope.categories=categories;
			//  })
		}
		$scope.invoice.prefixLength=0;
		$scope.loadInvoiceAttributes= function () {
			$scope.dueTermsLoaded = false;
			$charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_InvoiceAttributes","InvoicePrefix,PrefixLength,EnableDiscount,SIVEA,SREOP,PartialPayments,InvoiceTerms,CreditLimit").success(function(data) {
				var length=data.length;
				for(var i=0;i<length;i++)
				{
					var obj=data[i][0];
					$scope.invoiceSettings.push(data[i][0]);
					if(obj.ColumnIndex=="0") {
						$scope.invoice.invoicePrefix = obj.RecordFieldData;
						$scope.invoicePrefix=obj.RecordFieldData;
					}
					if(obj.ColumnIndex=="1") {
						$scope.invoice.prefixLength = parseInt(obj.RecordFieldData);
					}
					if(obj.ColumnIndex=="2") {
						$scope.invoice.enableDiscounts = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
						obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.toggleDiscYes=true : $scope.toggleDiscYes=false : $scope.toggleDiscYes=false;
					}
					if(obj.ColumnIndex=="3") {
						$scope.invoice.sendInvoice = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
						obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.toggleInvoiceYes=true : $scope.toggleInvoiceYes=false : $scope.toggleInvoiceYes=false;
					}
					if(obj.ColumnIndex=="4") {
						$scope.invoice.sendReminder = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
						obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.toggleReminderYes=true : $scope.toggleReminderYes=false : $scope.toggleReminderYes=false;
					}
					if(obj.ColumnIndex=="5") {
						$scope.invoice.allowPartialPay = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
						obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.togglePaymentsYes=true : $scope.togglePaymentsYes=false : $scope.togglePaymentsYes=false;
					}
					// if(obj.ColumnIndex=="6") {
					// 	$scope.invoice.firstReminder = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):[];
					// 	$scope.invoiceReminders = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):[];
					// }
					// if(obj.ColumnIndex=="7") {
					// 	$scope.invoice.RecurrReminder = obj.RecordFieldData;
					// }
					if (obj.ColumnIndex == "8") {
						$scope.invoiceTerms = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):[{
								"termName":"NET-15",
								"termDays":"15"
							},{
								"termName":"NET-30",
								"termDays":"30"
							}];
					}
					if(obj.ColumnIndex=="9")
					{
						$scope.invoice.enablecreditLimit=obj.RecordFieldData != "" ?obj.RecordFieldData <0?false:true:false;
						$scope.invoice.creditLimit = $scope.invoice.enablecreditLimit==true ? parseFloat(obj.RecordFieldData) : "";
						obj.RecordFieldData != "" ? obj.RecordFieldData <0 ? $scope.toggleCreditLimitYes=false : $scope.toggleCreditLimitYes=true : $scope.toggleCreditLimitYes=false;
					}
				}
				//
				$scope.dueTermsLoaded = true;
				isInvoiceLoaded=true;
				if($scope.invoiceTerms.length==0)
					$scope.addNewReminder(0);
				//
			}).error(function(data) {
				$scope.dueTermsLoaded = true;
				isInvoiceLoaded=false;
				$scope.invoiceTerms = [{
					"termName":"NET-15",
					"termDays":"15"
				},{
					"termName":"NET-30",
					"termDays":"30"
				}];
				$scope.addNewReminder(0);

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})
		}


		$scope.clearInvoiceFields= function () {
			if($scope.invoiceSettings.length!=0)
			{
				for(var i=0;i<$scope.invoiceSettings.length;i++)
				{
					//var obj=data[i][0];
					var obj=$scope.invoiceSettings[i];
					if(obj.ColumnIndex=="0") {
						$scope.invoice.invoicePrefix = obj.RecordFieldData;
						$scope.invoicePrefix=obj.RecordFieldData;
					}
					if(obj.ColumnIndex=="1") {
						$scope.invoice.prefixLength = parseInt(obj.RecordFieldData);
					}
					if(obj.ColumnIndex=="2") {
						$scope.invoice.enableDiscounts = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
						obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.toggleDiscYes=true : $scope.toggleDiscYes=false : $scope.toggleDiscYes=false;
					}
					if(obj.ColumnIndex=="3") {
						$scope.invoice.sendInvoice = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
						obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.toggleInvoiceYes=true : $scope.toggleInvoiceYes=false : $scope.toggleInvoiceYes=false;
					}
					if(obj.ColumnIndex=="4") {
						$scope.invoice.sendReminder = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
						obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.toggleReminderYes=true : $scope.toggleReminderYes=false : $scope.toggleReminderYes=false;
					}
					if(obj.ColumnIndex=="5") {
						$scope.invoice.allowPartialPay = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
						obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.togglePaymentsYes=true : $scope.togglePaymentsYes=false : $scope.togglePaymentsYes=false;
					}
					if(obj.ColumnIndex=="6") {
						$scope.invoice.firstReminder = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):[];
						$scope.invoiceReminders = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):[];
					}
					if(obj.ColumnIndex=="7") {
						$scope.invoice.RecurrReminder = obj.RecordFieldData;
					}
					if (obj.ColumnIndex == "8") {
						$scope.invoiceTerms = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):[{
								"termName":"NET-15",
								"termDays":"15"
							},{
								"termName":"NET-30",
								"termDays":"30"
							}];
					}
					if(obj.ColumnIndex=="9")
					{
						$scope.invoice.enablecreditLimit=obj.RecordFieldData != "" ?obj.RecordFieldData <0?false:true:false;
						$scope.invoice.creditLimit = $scope.invoice.enablecreditLimit==true ? parseFloat(obj.RecordFieldData) : "";
						obj.RecordFieldData != "" ? obj.RecordFieldData <0 ? $scope.toggleCreditLimitYes=false : $scope.toggleCreditLimitYes=true : $scope.toggleCreditLimitYes=false;
					}
				}
				isInvoiceLoaded=true;
				$scope.invoice={};
			}
			else
			{
				vm.invoices.$setPristine();
				vm.invoices.$setUntouched();
				$scope.invoice={};
				isInvoiceLoaded=false;
			}

		}


		$scope.toggleEditInvoice= function () {
			$scope.editOn=!$scope.editOn;
		}
		$scope.toggleSwitch= function (ev,ctrl) {
			//
			if(ctrl=="discount") {
				if (ev) {
					$scope.toggleDiscYes = true;
					$scope.toggleDiscNo = false;
				}
				else {
					$scope.toggleDiscNo = true;
					$scope.toggleDiscYes = false;
				}
			}
			else if(ctrl=="invoice") {
				if (ev) {
					$scope.toggleInvoiceYes = true;
					$scope.toggleInvoiceNo = false;
				}
				else {
					$scope.toggleInvoiceNo = true;
					$scope.toggleInvoiceYes = false;
				}
			}
			else if(ctrl=="reminder") {
				if (ev) {
					$scope.toggleReminderYes = true;
					$scope.toggleReminderNo = false;
				}
				else {
					$scope.toggleReminderNo = true;
					$scope.toggleReminderYes = false;
				}
			}
			else if(ctrl=="payments") {
				if (ev) {
					$scope.togglePaymentsYes = true;
					$scope.togglePaymentsNo = false;
				}
				else {
					$scope.togglePaymentsNo = true;
					$scope.togglePaymentsYes = false;
				}
			}
			else if(ctrl=="creditlimit") {
				if (ev) {
					$scope.toggleCreditLimitYes = true;
					$scope.toggleCreditLimitNo = false;
				}
				else {
					$scope.toggleCreditLimitNo = true;
					$scope.toggleCreditLimitYes = false;
				}
			}
			else if(ctrl=="quotationDiscount") {
				if (ev) {
					$scope.tgDiscQuoteYes = true;
					$scope.tgDiscQuoteNo = false;
				}
				else {
					$scope.tgDiscQuoteNo = true;
					$scope.tgDiscQuoteYes = false;
				}
			}
			else if(ctrl=="quotationSendMail") {
				if (ev) {
					$scope.tgInvoiceQuoteYes = true;
					$scope.tgInvoiceQuoteNo = false;
				}
				else {
					$scope.tgInvoiceQuoteNo = true;
					$scope.tgInvoiceQuoteYes = false;
				}
			}
		}

		$scope.addTerm= function (ev) {
			if($scope.invoiceTerms.length!=0)
			{
				for(var i=0;i<$scope.invoiceTerms.length;i++)
				{
					if($scope.invoiceTerms[i].termName==ev.termName)
					{
						notifications.toast("Term has been already added.", "error");
						break;
					}
					else if(ev.NoOfDays !== parseInt(ev.NoOfDays, 10))
					{
						notifications.toast("Number of days are invalid.", "error");
						$scope.invoice.NoOfDays=1;
						break;
					}
					else
					{
						$scope.invoiceTerms.push({
							"termName":ev.termName,
							"termDays":ev.NoOfDays
						})
						$mdDialog.hide();
						$scope.invoice.termName="";
						$scope.invoice.NoOfDays="";
						break;
					}
				}
			}
			else
			{
				$scope.invoiceTerms.push({
					"termName":ev.termName,
					"termDays":ev.NoOfDays
				})
				$mdDialog.hide();
				$scope.invoice.termName="";
				$scope.invoice.NoOfDays="";
			}
		}

		var selectedIndex;
		$scope.updateTerm= function (ev) {
			if(selectedIndex!=undefined || selectedIndex!=null)
			{
				$scope.invoiceTerms.splice(selectedIndex,1);
				$scope.invoiceTerms.push({
					"termName":ev.termName,
					"termDays":ev.NoOfDays
				})
				$mdDialog.hide();
				selectedIndex=undefined;
				$scope.invoice.termName="";
				$scope.invoice.NoOfDays=0;
			}
		}
		$scope.updateTermEnable = false;
		$scope.addDueDialog = function() {
			$mdDialog.show({
				controller: 'addDueController as vm',
				templateUrl: 'app/main/settings/dialogs/invoice/prompt-add-due.html',
				clickOutsideToClose:false,
				locals:{
					addTerm : $scope.addTerm,
					updateTerm : $scope.updateTerm,
					invoiceTerms : $scope.invoiceTerms,
					invoice : $scope.invoice,
					updateTermEnable : null
				}
			});
		};
		$scope.displayTerm= function (termObj,index) {
			$scope.invoice.termName=termObj.termName;
			$scope.invoice.NoOfDays=parseInt(termObj.termDays);
			$scope.updateTermEnable = true;
			selectedIndex=index;
			$mdDialog.show({
				controller: 'addDueController as vm',
				templateUrl: 'app/main/settings/dialogs/invoice/prompt-add-due.html',
				clickOutsideToClose:false,
				locals:{
					addTerm : null,
					updateTerm : $scope.updateTerm,
					invoiceTerms : null,
					updateTermEnable : $scope.updateTermEnable,
					invoice : $scope.invoice
				}
			});
		}


		$scope.deleteTerm= function (index) {
			$scope.invoiceTerms.splice(index,1);
		}

		$scope.deleteInvoiceSettings= function (ev) {
			//
			$charge.settingsapp().delete(ev).success(function(data) {

			}).error(function(data) {
				//console.log(data);
				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})
		}

		vm.invoiceSubmit=false;
		$scope.addTermsDisabled = false;
		$scope.saveInvoice= function () {
			//$scope.invoice.invoicePrefix=$scope.invoice.invoicePrefix!=undefined?$scope.invoice.invoicePrefix:"";
			if(vm.invoices.$valid == true)
			{
				$scope.addTermsDisabled = true;

				vm.invoiceSubmit=true;

				if(isInvoiceLoaded) {
					//var address = $filter('filter')($scope.invoiceSettings, { RecordFieldData: invoice.person_name })[0];
					if ($scope.invoicePrefix == $scope.invoice.invoicePrefix) {
						for (var i = 0; i < $scope.invoiceSettings.length; i++) {
							//
							$scope.deleteInvoiceSettings($scope.invoiceSettings[i]);
						}
						var req = [{
							"RecordName": "CTS_InvoiceAttributes",
							"FieldName": "InvoicePrefix",
							"RecordFieldData": $scope.invoice.invoicePrefix==undefined?"":$scope.invoice.invoicePrefix
						},
							{
								"RecordName": "CTS_InvoiceAttributes",
								"FieldName": "PrefixLength",
								"RecordFieldData": $scope.invoice.prefixLength==undefined?0:$scope.invoice.prefixLength
							},
							{
								"RecordName": "CTS_InvoiceAttributes",
								"FieldName": "EnableDiscount",
								"RecordFieldData": $scope.invoice.enableDiscounts == true ? 1 : 0
							},
							{
								"RecordName": "CTS_InvoiceAttributes",
								"FieldName": "SIVEA",
								"RecordFieldData": $scope.invoice.sendInvoice == true ? 1 : 0
							},
							{
								"RecordName": "CTS_InvoiceAttributes",
								"FieldName": "SREOP",
								"RecordFieldData": $scope.invoice.sendReminder == true ? 1 : 0
							},
							{
								"RecordName": "CTS_InvoiceAttributes",
								"FieldName": "PartialPayments",
								"RecordFieldData": $scope.invoice.allowPartialPay == true ? 1 : 0
							},
							{
								"RecordName": "CTS_InvoiceAttributes",
								"FieldName": "FirstReminder",
								"RecordFieldData": $scope.invoiceReminders.length!=0?JSON.stringify($scope.invoiceReminders ):""
							},
							{
								"RecordName": "CTS_InvoiceAttributes",
								"FieldName": "RecurringReminder",
								"RecordFieldData": $scope.invoice.RecurrReminder
							},
							{
								"RecordName": "CTS_InvoiceAttributes",
								"FieldName": "InvoiceTerms",
								"RecordFieldData": $scope.invoiceTerms.length!=0?JSON.stringify($scope.invoiceTerms):""
							},
							{
								"RecordName": "CTS_InvoiceAttributes",
								"FieldName": "CreditLimit",
								"RecordFieldData": $scope.invoice.enablecreditLimit==true?$scope.invoice.creditLimit:-1
							}]
						//
						$charge.settingsapp().insertBulkDuoBaseValues(req).success(function (data) {
							vm.invoiceSubmit=false;
							notifications.toast("Invoice settings has been applied.", "success");
							$charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_InvoiceAttributes", "InvoicePrefix,PrefixLength,EnableDiscount,SIVEA,SREOP,PartialPayments,FirstReminder,RecurringReminder,InvoiceTerms,CreditLimit").success(function (data) {
								$scope.invoiceSettings = [];
								var length = data.length;
								for (var i = 0; i < length; i++) {
									var obj = data[i][0];
									$scope.invoiceSettings.push(data[i][0]);
									if (obj.ColumnIndex == "0") {
										$scope.invoice.invoicePrefix = obj.RecordFieldData;
										localStorage.removeItem('invoicePrefix');
										localStorage.setItem("invoicePrefix", obj.RecordFieldData);
									}
									if (obj.ColumnIndex == "1") {
										$scope.invoice.prefixLength = parseInt(obj.RecordFieldData);
										localStorage.removeItem('prefixLength');
										localStorage.setItem("prefixLength", obj.RecordFieldData);
									}
									if (obj.ColumnIndex == "2") {
										$scope.invoice.enableDiscounts = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
										obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.toggleDiscYes = true : $scope.toggleDiscYes = false : $scope.toggleDiscYes = false;
									}
									if (obj.ColumnIndex == "3") {
										$scope.invoice.sendInvoice = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
										obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.toggleInvoiceYes = true : $scope.toggleInvoiceYes = false : $scope.toggleInvoiceYes = false;
									}
									if (obj.ColumnIndex == "4") {
										$scope.invoice.sendReminder = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
										obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.toggleReminderYes = true : $scope.toggleReminderYes = false : $scope.toggleReminderYes = false;
									}
									if (obj.ColumnIndex == "5") {
										$scope.invoice.allowPartialPay = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
										obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.togglePaymentsYes = true : $scope.togglePaymentsYes = false : $scope.togglePaymentsYes = false;
									}
									if (obj.ColumnIndex == "6") {
										$scope.invoice.firstReminder = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):[];
										$scope.invoiceReminders = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):[];
									}
									if (obj.ColumnIndex == "7") {
										$scope.invoice.RecurrReminder = obj.RecordFieldData;
									}
									if (obj.ColumnIndex == "8") {
										$scope.invoiceTerms = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):[{
												"termName":"NET-15",
												"termDays":"15"
											},{
												"termName":"NET-30",
												"termDays":"30"
											}];
									}
									if(obj.ColumnIndex=="9")
									{
										$scope.invoice.enablecreditLimit=obj.RecordFieldData != "" ?obj.RecordFieldData <0?false:true:false;
										$scope.invoice.creditLimit = $scope.invoice.enablecreditLimit==true ? parseFloat(obj.RecordFieldData) : "";
										obj.RecordFieldData != "" ? obj.RecordFieldData <0 ? $scope.toggleCreditLimitYes=false : $scope.toggleCreditLimitYes=true : $scope.toggleCreditLimitYes=false;
									}
								}
								//
								isInvoiceLoaded = true;
								if($scope.invoiceTerms.length==0)
									$scope.addNewReminder(0);
								$scope.addTermsDisabled = false;
//
							}).error(function (data) {
								$scope.addTermsDisabled = false;
								isInvoiceLoaded = false;

								$scope.infoJson= {};
								$scope.infoJson.message =JSON.stringify(data);
								$scope.infoJson.app ='settings';
								logHelper.error( $scope.infoJson);
							})
						}).error(function (data) {
							//console.log(data);
							vm.invoiceSubmit=false;
							$scope.addTermsDisabled = false;

							$scope.infoJson= {};
							$scope.infoJson.message =JSON.stringify(data);
							$scope.infoJson.app ='settings';
							logHelper.error( $scope.infoJson);
						})
					}
					else
					{
						//if($scope.transactionCount== 0)
						//{
						for (var i = 0; i < $scope.invoiceSettings.length; i++) {
							//
							$scope.deleteInvoiceSettings($scope.invoiceSettings[i]);
						}
						var req = [{
							"RecordName": "CTS_InvoiceAttributes",
							"FieldName": "InvoicePrefix",
							"RecordFieldData": $scope.invoice.invoicePrefix
						},
							{
								"RecordName": "CTS_InvoiceAttributes",
								"FieldName": "PrefixLength",
								"RecordFieldData": $scope.invoice.prefixLength
							},
							{
								"RecordName": "CTS_InvoiceAttributes",
								"FieldName": "EnableDiscount",
								"RecordFieldData": $scope.invoice.enableDiscounts == true ? 1 : 0
							},
							{
								"RecordName": "CTS_InvoiceAttributes",
								"FieldName": "SIVEA",
								"RecordFieldData": $scope.invoice.sendInvoice == true ? 1 : 0
							},
							{
								"RecordName": "CTS_InvoiceAttributes",
								"FieldName": "SREOP",
								"RecordFieldData": $scope.invoice.sendReminder == true ? 1 : 0
							},
							{
								"RecordName": "CTS_InvoiceAttributes",
								"FieldName": "PartialPayments",
								"RecordFieldData": $scope.invoice.allowPartialPay == true ? 1 : 0
							},
							{
								"RecordName": "CTS_InvoiceAttributes",
								"FieldName": "FirstReminder",
								"RecordFieldData": $scope.invoiceReminders.length!=0?JSON.stringify($scope.invoiceReminders ):""
							},
							{
								"RecordName": "CTS_InvoiceAttributes",
								"FieldName": "RecurringReminder",
								"RecordFieldData": $scope.invoice.RecurrReminder
							},
							{
								"RecordName": "CTS_InvoiceAttributes",
								"FieldName": "InvoiceTerms",
								"RecordFieldData": $scope.invoiceTerms.length!=0?JSON.stringify($scope.invoiceTerms):""
							},
							{
								"RecordName": "CTS_InvoiceAttributes",
								"FieldName": "CreditLimit",
								"RecordFieldData": $scope.invoice.enablecreditLimit==true?$scope.invoice.creditLimit:-1
							}]
						//
						$charge.settingsapp().insertBulkDuoBaseValues(req).success(function (data) {
							notifications.toast("Invoice settings has been applied.", "success");
							vm.invoiceSubmit=false;
							$charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_InvoiceAttributes", "InvoicePrefix,PrefixLength,EnableDiscount,SIVEA,SREOP,PartialPayments,FirstReminder,RecurringReminder,InvoiceTerms,CreditLimit").success(function (data) {
								$scope.invoiceSettings = [];
								var length = data.length;
								for (var i = 0; i < length; i++) {
									var obj = data[i][0];
									$scope.invoiceSettings.push(data[i][0]);
									if (obj.ColumnIndex == "0") {
										$scope.invoice.invoicePrefix = obj.RecordFieldData;
										localStorage.removeItem('invoicePrefix');
										localStorage.setItem("invoicePrefix", obj.RecordFieldData);
									}
									if (obj.ColumnIndex == "1") {
										$scope.invoice.prefixLength = parseInt(obj.RecordFieldData);
										localStorage.removeItem('prefixLength');
										localStorage.setItem("prefixLength", obj.RecordFieldData);
									}
									if (obj.ColumnIndex == "2") {
										$scope.invoice.enableDiscounts = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
										obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.toggleDiscYes = true : $scope.toggleDiscYes = false : $scope.toggleDiscYes = false;
									}
									if (obj.ColumnIndex == "3") {
										$scope.invoice.sendInvoice = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
										obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.toggleInvoiceYes = true : $scope.toggleInvoiceYes = false : $scope.toggleInvoiceYes = false;
									}
									if (obj.ColumnIndex == "4") {
										$scope.invoice.sendReminder = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
										obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.toggleReminderYes = true : $scope.toggleReminderYes = false : $scope.toggleReminderYes = false;
									}
									if (obj.ColumnIndex == "5") {
										$scope.invoice.allowPartialPay = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
										obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.togglePaymentsYes = true : $scope.togglePaymentsYes = false : $scope.togglePaymentsYes = false;
									}
									if (obj.ColumnIndex == "6") {
										$scope.invoice.firstReminder = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):[];
										$scope.invoiceReminders = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):[];
									}
									if (obj.ColumnIndex == "7") {
										$scope.invoice.RecurrReminder = obj.RecordFieldData;
									}
									if (obj.ColumnIndex == "8") {
										$scope.invoiceTerms = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):[{
												"termName":"NET-15",
												"termDays":"15"
											},{
												"termName":"NET-30",
												"termDays":"30"
											}];
									}
									if(obj.ColumnIndex=="9")
									{
										$scope.invoice.enablecreditLimit=obj.RecordFieldData != "" ?obj.RecordFieldData <0?false:true:false;
										$scope.invoice.creditLimit = $scope.invoice.enablecreditLimit==true ? parseFloat(obj.RecordFieldData) : "";
										obj.RecordFieldData != "" ? obj.RecordFieldData <0 ? $scope.toggleCreditLimitYes=false : $scope.toggleCreditLimitYes=true : $scope.toggleCreditLimitYes=false;
									}
								}
								//
								isInvoiceLoaded = true;
								if($scope.invoiceTerms.length==0)
									$scope.addNewReminder(0);
								$scope.addTermsDisabled = false;
//
							}).error(function (data) {
								isInvoiceLoaded = false;
								$scope.addTermsDisabled = false;

								$scope.infoJson= {};
								$scope.infoJson.message =JSON.stringify(data);
								$scope.infoJson.app ='settings';
								logHelper.error( $scope.infoJson);
							})
						}).error(function (data) {
							//console.log(data);
							vm.invoiceSubmit=false;
							$scope.addTermsDisabled = false;

							$scope.infoJson= {};
							$scope.infoJson.message =JSON.stringify(data);
							$scope.infoJson.app ='settings';
							logHelper.error( $scope.infoJson);
						})
						//}
						//else
						//{
						//  notifications.toast("Invoice Prefix cannot be changed.", "error");
						//  $scope.invoice.invoicePrefix=$scope.invoicePrefix;
						//  vm.invoiceSubmit=false;
						//}
					}
				}
				else
				{

					var req= {
						"GURecID":"",
						"RecordType":"CTS_InvoiceAttributes",
						"OperationalStatus":"Active",
						"RecordStatus":"Active",
						"Cache":"CTS_InvoiceAttributes",
						"Separate":"Test",
						"RecordName":"CTS_InvoiceAttributes",
						"GuTranID":"12345",
						"RecordCultureName":"CTS_InvoiceAttributes",
						"RecordCode":"CTS_InvoiceAttributes",
						"commonDatafieldDetails":[
							{
								"FieldCultureName":"EnableDiscount",
								"FieldID":"",
								"FieldName":"EnableDiscount",
								"FieldType":"EnableDiscountType",
								"ColumnIndex":"2"
							},
							{
								"FieldCultureName":"InvoicePrefix",
								"FieldID":"",
								"FieldName":"InvoicePrefix",
								"FieldType":"InvoicePrefixType",
								"ColumnIndex":"0"
							},
							{
								"FieldCultureName":"PrefixLength",
								"FieldID":"",
								"FieldName":"PrefixLength",
								"FieldType":"PrefixLengthType",
								"ColumnIndex":"1"
							},
							{
								"FieldCultureName":"SIVEA",
								"FieldID":"",
								"FieldName":"SIVEA",
								"FieldType":"SIVEAType",
								"ColumnIndex":"3"
							},
							{
								"FieldCultureName":"SREOP",
								"FieldID":"",
								"FieldName":"SREOP",
								"FieldType":"SREOPType",
								"ColumnIndex":"4"
							},
							{
								"FieldCultureName":"PartialPayments",
								"FieldID":"",
								"FieldName":"PartialPayments",
								"FieldType":"PartialPaymentsType",
								"ColumnIndex":"5"
							},
							{
								"FieldCultureName":"FirstReminder",
								"FieldID":"",
								"FieldName":"FirstReminder",
								"FieldType":"FirstReminderType",
								"ColumnIndex":"6"
							},
							{
								"FieldCultureName":"RecurringReminder",
								"FieldID":"",
								"FieldName":"RecurringReminder",
								"FieldType":"RecurringReminderType",
								"ColumnIndex":"7"
							},
							{
								"FieldCultureName":"InvoiceTerms",
								"FieldID":"",
								"FieldName":"InvoiceTerms",
								"FieldType":"InvoiceTermsType",
								"ColumnIndex":"8"
							},
							{
								"FieldCultureName":"CreditLimit",
								"FieldID":"",
								"FieldName":"CreditLimit",
								"FieldType":"CreditLimitType",
								"ColumnIndex":"9"
							}],
						"commonDataValueDetails":[
							{
								"RowID":"",
								"RecordFieldData":$scope.invoice.enableDiscounts,
								"ColumnIndex":"2"
							},
							{
								"RowID":"",
								"RecordFieldData":$scope.invoice.invoicePrefix,
								"ColumnIndex":"0"
							},
							{
								"RowID":"",
								"RecordFieldData":$scope.invoice.prefixLength,
								"ColumnIndex":"1"
							},
							{
								"RowID":"",
								"RecordFieldData":$scope.invoice.sendInvoice,
								"ColumnIndex":"3"
							},
							{
								"RowID":"",
								"RecordFieldData":$scope.invoice.sendReminder,
								"ColumnIndex":"4"
							},
							{
								"RowID":"",
								"RecordFieldData":$scope.invoice.allowPartialPay,
								"ColumnIndex":"5"
							},
							{
								"RowID":"",
								"RecordFieldData":$scope.invoiceReminders.length!=0?JSON.stringify($scope.invoiceReminders ):"",
								"ColumnIndex":"6"
							},
							{
								"RowID":"",
								"RecordFieldData":$scope.invoice.RecurrReminder,
								"ColumnIndex":"7"
							},
							{
								"RowID":"",
								"RecordFieldData":$scope.invoiceTerms.length!=0?JSON.stringify($scope.invoiceTerms):"",
								"ColumnIndex":"8"
							},
							{
								"RowID":"",
								"RecordFieldData": $scope.invoice.enablecreditLimit==true?$scope.invoice.creditLimit:-1,
								"ColumnIndex":"9"
							}]
					}

					$charge.settingsapp().store(req).success(function(data) {
						//console.log(data);
						vm.invoiceSubmit=false;
						notifications.toast("Invoice settings has been applied.", "success");
						$charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_InvoiceAttributes", "InvoicePrefix,PrefixLength,EnableDiscount,SIVEA,SREOP,PartialPayments,FirstReminder,RecurringReminder,InvoiceTerms,CreditLimit").success(function (data) {
							$scope.invoiceSettings = [];
							var length = data.length;
							for (var i = 0; i < length; i++) {
								var obj = data[i][0];
								$scope.invoiceSettings.push(data[i][0]);
								if (obj.ColumnIndex == "0") {
									$scope.invoice.invoicePrefix = obj.RecordFieldData;
									$scope.invoicePrefix=obj.RecordFieldData;
									localStorage.setItem("invoicePrefix", obj.RecordFieldData);
								}
								if (obj.ColumnIndex == "1") {
									$scope.invoice.prefixLength = parseInt(obj.RecordFieldData);
									localStorage.setItem("prefixLength", obj.RecordFieldData);
								}
								if (obj.ColumnIndex == "2") {
									$scope.invoice.enableDiscounts = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
									obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.toggleDiscYes = true : $scope.toggleDiscYes = false : $scope.toggleDiscYes = false;
								}
								if (obj.ColumnIndex == "3") {
									$scope.invoice.sendInvoice = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
									obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.toggleInvoiceYes = true : $scope.toggleInvoiceYes = false : $scope.toggleInvoiceYes = false;
								}
								if (obj.ColumnIndex == "4") {
									$scope.invoice.sendReminder = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
									obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.toggleReminderYes = true : $scope.toggleReminderYes = false : $scope.toggleReminderYes = false;
								}
								if (obj.ColumnIndex == "5") {
									$scope.invoice.allowPartialPay = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
									obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.togglePaymentsYes = true : $scope.togglePaymentsYes = false : $scope.togglePaymentsYes = false;
								}
								if (obj.ColumnIndex == "6") {
									$scope.invoice.firstReminder = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):[];
									$scope.invoiceReminders = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):[];
								}
								if (obj.ColumnIndex == "7") {
									$scope.invoice.RecurrReminder = obj.RecordFieldData;
								}
								if (obj.ColumnIndex == "8") {
									$scope.invoiceTerms = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):"";
								}
								if(obj.ColumnIndex=="9")
								{
									$scope.invoice.enablecreditLimit=obj.RecordFieldData != "" ?obj.RecordFieldData <0?false:true:false;
									$scope.invoice.creditLimit = $scope.invoice.enablecreditLimit==true ? parseFloat(obj.RecordFieldData) : "";
									obj.RecordFieldData != "" ? obj.RecordFieldData <0 ? $scope.toggleCreditLimitYes=false : $scope.toggleCreditLimitYes=true : $scope.toggleCreditLimitYes=false;
								}
							}
							//
							isInvoiceLoaded = true;
							if($scope.invoiceTerms.length==0)
								$scope.addNewReminder(0);
							$scope.addTermsDisabled = false;
//
						}).error(function (data) {
							isInvoiceLoaded = false;
							$scope.addTermsDisabled = false;

							$scope.infoJson= {};
							$scope.infoJson.message =JSON.stringify(data);
							$scope.infoJson.app ='settings';
							logHelper.error( $scope.infoJson);
						})
					}).error(function(data) {
						//console.log(data);
						vm.invoiceSubmit=false;
						$scope.addTermsDisabled = false;

						$scope.infoJson= {};
						$scope.infoJson.message =JSON.stringify(data);
						$scope.infoJson.app ='settings';
						logHelper.error( $scope.infoJson);
					})
				}
			}
			//$scope.invoice;
		}


		$scope.quotation={};
		vm.quotationSubmit=false;
		$scope.saveQuotation= function () {

			if(vm.quotations.$valid==true) {
				vm.quotationSubmit=true;
				if (isQuotationLoaded) {
					if ($scope.quotationPrefix == $scope.quotation.quotationPrefix) {
						for (var i = 0; i < $scope.quotationSettings.length; i++) {
							//
							$scope.deleteQuotationSettings($scope.quotationSettings[i]);
						}
						var req = [{
							"RecordName": "CTS_QuotationAttributes",
							"FieldName": "QuotationPrefix",
							"RecordFieldData": $scope.quotation.quotationPrefix
						},
							{
								"RecordName": "CTS_QuotationAttributes",
								"FieldName": "QuotationPrefixLength",
								"RecordFieldData": $scope.quotation.prefixLength
							},
							{
								"RecordName": "CTS_QuotationAttributes",
								"FieldName": "QuotationEnableDiscount",
								"RecordFieldData": $scope.quotation.enableDiscounts == true ? 1 : 0
							},
							{
								"RecordName": "CTS_QuotationAttributes",
								"FieldName": "QuotationSIVEA",
								"RecordFieldData": $scope.quotation.sendQuotation == true ? 1 : 0
							}]
						//
						$charge.settingsapp().insertBulkDuoBaseValues(req).success(function (data) {
							notifications.toast("Quotation settings has been applied.", "success");
							vm.quotationSubmit=false;
							$charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_QuotationAttributes", "QuotationPrefix,QuotationPrefixLength,QuotationEnableDiscount,QuotationSIVEA").success(function (data) {
								$scope.quotationSettings = [];
								var length = data.length;
								for (var i = 0; i < length; i++) {
									var obj = data[i][0];
									$scope.quotationSettings.push(data[i][0]);
									if (obj.ColumnIndex == "0") {
										$scope.quotation.quotationPrefix = obj.RecordFieldData;
										localStorage.removeItem('QuotationPrefix');
										localStorage.setItem("QuotationPrefix", obj.RecordFieldData);
									}
									if (obj.ColumnIndex == "1") {
										$scope.quotation.prefixLength = parseInt(obj.RecordFieldData);
										localStorage.removeItem('QuotationPrefixLength');
										localStorage.setItem("QuotationPrefixLength", obj.RecordFieldData);
									}
									if (obj.ColumnIndex == "2") {
										$scope.quotation.enableDiscounts = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
										obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.tgDiscQuoteYes = true : $scope.tgDiscQuoteYes = false : $scope.tgDiscQuoteYes = false;
									}
									if (obj.ColumnIndex == "3") {
										$scope.quotation.sendQuotation = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
										obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.tgInvoiceQuoteYes = true : $scope.tgInvoiceQuoteYes = false : $scope.tgInvoiceQuoteYes = false;
									}
								}
								//
								isQuotationLoaded = true;
								//
							}).error(function (data) {
								isQuotationLoaded = false;
							})
						}).error(function (data) {
							//console.log(data);
							vm.quotationSubmit=false;
						})
					}
					else {
						//if ($scope.transactionCount == 0) {
						for (var i = 0; i < $scope.quotationSettings.length; i++) {
							//
							$scope.deleteQuotationSettings($scope.quotationSettings[i]);
						}
						var req = [{
							"RecordName": "CTS_QuotationAttributes",
							"FieldName": "QuotationPrefix",
							"RecordFieldData": $scope.quotation.quotationPrefix
						},
							{
								"RecordName": "CTS_QuotationAttributes",
								"FieldName": "QuotationPrefixLength",
								"RecordFieldData": $scope.quotation.prefixLength
							},
							{
								"RecordName": "CTS_QuotationAttributes",
								"FieldName": "QuotationEnableDiscount",
								"RecordFieldData": $scope.quotation.enableDiscounts == true ? 1 : 0
							},
							{
								"RecordName": "CTS_QuotationAttributes",
								"FieldName": "QuotationSIVEA",
								"RecordFieldData": $scope.quotation.sendQuotation == true ? 1 : 0
							}]
						//
						$charge.settingsapp().insertBulkDuoBaseValues(req).success(function (data) {
							notifications.toast("Quotation settings has been applied.", "success");
							vm.quotationSubmit=false;
							$charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_QuotationAttributes", "QuotationPrefix,QuotationPrefixLength,QuotationEnableDiscount,QuotationSIVEA").success(function (data) {
								$scope.quotationSettings = [];
								var length = data.length;
								for (var i = 0; i < length; i++) {
									var obj = data[i][0];
									$scope.quotationSettings.push(data[i][0]);
									if (obj.ColumnIndex == "0") {
										$scope.quotation.quotationPrefix = obj.RecordFieldData;
										localStorage.removeItem('QuotationPrefix');
										localStorage.setItem("QuotationPrefix", obj.RecordFieldData);
									}
									if (obj.ColumnIndex == "1") {
										$scope.quotation.prefixLength = parseInt(obj.RecordFieldData);
										localStorage.removeItem('QuotationPrefixLength');
										localStorage.setItem("QuotationPrefixLength", obj.RecordFieldData);
									}
									if (obj.ColumnIndex == "2") {
										$scope.quotation.enableDiscounts = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
										obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.tgDiscQuoteYes = true : $scope.tgDiscQuoteYes = false : $scope.tgDiscQuoteYes = false;
									}
									if (obj.ColumnIndex == "3") {
										$scope.quotation.sendQuotation = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
										obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.tgInvoiceQuoteYes = true : $scope.tgInvoiceQuoteYes = false : $scope.tgInvoiceQuoteYes = false;
									}
								}
								//
								isQuotationLoaded = true;
								//
							}).error(function (data) {
								isQuotationLoaded = false;
							})
						}).error(function (data) {
							//console.log(data);
							vm.quotationSubmit=false;
						})
						//}
						//else {
						//  notifications.toast("Quotation Prefix cannot be changed.", "error");
						//  $scope.quotation.quotationPrefix = $scope.quotationPrefix;
						//  vm.quotationSubmit=false;
						//}
					}
				}
				else {

					var req = {
						"GURecID": "",
						"RecordType": "CTS_QuotationAttributes",
						"OperationalStatus": "Active",
						"RecordStatus": "Active",
						"Cache": "CTS_QuotationAttributes",
						"Separate": "Test",
						"RecordName": "CTS_QuotationAttributes",
						"GuTranID": "12345",
						"RecordCultureName": "CTS_QuotationAttributes",
						"RecordCode": "CTS_QuotationAttributes",
						"commonDatafieldDetails": [
							{
								"FieldCultureName": "QuotationEnableDiscount",
								"FieldID": "",
								"FieldName": "QuotationEnableDiscount",
								"FieldType": "QuotationEnableDiscountType",
								"ColumnIndex": "2"
							},
							{
								"FieldCultureName": "QuotationPrefix",
								"FieldID": "",
								"FieldName": "QuotationPrefix",
								"FieldType": "QuotationPrefixType",
								"ColumnIndex": "0"
							},
							{
								"FieldCultureName": "QuotationPrefixLength",
								"FieldID": "",
								"FieldName": "QuotationPrefixLength",
								"FieldType": "QuotationPrefixLengthType",
								"ColumnIndex": "1"
							},
							{
								"FieldCultureName": "QuotationSIVEA",
								"FieldID": "",
								"FieldName": "QuotationSIVEA",
								"FieldType": "QuotationSIVEAType",
								"ColumnIndex": "3"
							}],
						"commonDataValueDetails": [
							{
								"RowID": "",
								"RecordFieldData": $scope.quotation.enableDiscounts,
								"ColumnIndex": "2"
							},
							{
								"RowID": "",
								"RecordFieldData": $scope.quotation.quotationPrefix,
								"ColumnIndex": "0"
							},
							{
								"RowID": "",
								"RecordFieldData": $scope.quotation.prefixLength,
								"ColumnIndex": "1"
							},
							{
								"RowID": "",
								"RecordFieldData": $scope.quotation.sendQuotation,
								"ColumnIndex": "3"
							}]
					}

					$charge.settingsapp().store(req).success(function (data) {
						//console.log(data);
						vm.quotationSubmit=false;
						notifications.toast("Quotation settings has been applied.", "success");

						$charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_QuotationAttributes", "QuotationPrefix,QuotationPrefixLength,QuotationEnableDiscount,QuotationSIVEA").success(function (data) {
							$scope.quotationSettings = [];
							var length = data.length;
							for (var i = 0; i < length; i++) {
								var obj = data[i][0];
								$scope.quotationSettings.push(data[i][0]);
								if (obj.ColumnIndex == "0") {
									$scope.quotation.quotationPrefix = obj.RecordFieldData;
									$scope.quotationPrefix = obj.RecordFieldData;
									localStorage.setItem("QuotationPrefix", obj.RecordFieldData);
								}
								if (obj.ColumnIndex == "1") {
									$scope.quotation.prefixLength = parseInt(obj.RecordFieldData);
									localStorage.setItem("QuotationPrefixLength", obj.RecordFieldData);
								}
								if (obj.ColumnIndex == "2") {
									$scope.quotation.enableDiscounts = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
									obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.tgDiscQuoteYes = true : $scope.tgDiscQuoteYes = false : $scope.tgDiscQuoteYes = false;
								}
								if (obj.ColumnIndex == "3") {
									$scope.quotation.sendQuotation = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
									obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.tgInvoiceQuoteYes = true : $scope.tgInvoiceQuoteYes = false : $scope.tgInvoiceQuoteYes = false;
								}
							}
							//
							isQuotationLoaded = true;
							//
						}).error(function (data) {
							isQuotationLoaded = false;
						})
					}).error(function (data) {
						//console.log(data);
						vm.quotationSubmit=false;
					})
				}
			}
		}


		$scope.deleteQuotationSettings= function (ev) {
			//
			$charge.settingsapp().delete(ev).success(function(data) {

			}).error(function(data) {
				//console.log(data);
			})
		}

		$scope.clearQuotation= function () {
			$scope.quotation.quotationPrefix="";
			$scope.quotation.prefixLength="";
			$scope.tgDiscQuoteYes=false;
			$scope.tgInvoiceQuoteYes=false;
		}

		$scope.toggleQuotSwitch= function (ev,ctrl) {
			//
			if(ctrl=="discount") {
				if (ev) {
					$scope.tgDiscQuoteYes = true;
					$scope.tgDiscQuoteNo = false;
				}
				else {
					$scope.tgDiscQuoteNo = true;
					$scope.tgDiscQuoteYes = false;
				}
			}
			else if(ctrl=="quotation") {
				if (ev) {
					$scope.tgInvoiceQuoteYes = true;
					$scope.tgInvoiceQuoteNo = false;
				}
				else {
					$scope.tgInvoiceQuoteNo = true;
					$scope.tgInvoiceQuoteYes = false;
				}
			}
		}

		var isQuotationLoaded=false;
		$scope.quotationSettings=[];

		$scope.loadQuotationAttributes= function () {
			$charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_QuotationAttributes","QuotationPrefix,QuotationPrefixLength,QuotationEnableDiscount,QuotationSIVEA").success(function(data) {
				var length=data.length;
				for(var i=0;i<length;i++)
				{
					var obj=data[i][0];
					$scope.quotationSettings.push(data[i][0]);
					if(obj.ColumnIndex=="0") {
						$scope.quotation.quotationPrefix = obj.RecordFieldData;
						$scope.quotationPrefix=obj.RecordFieldData;
					}
					if(obj.ColumnIndex=="1") {
						$scope.quotation.prefixLength = parseInt(obj.RecordFieldData);
					}
					if(obj.ColumnIndex=="2") {
						$scope.quotation.enableDiscounts = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
						obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.tgDiscQuoteYes=true : $scope.tgDiscQuoteYes=false : $scope.tgDiscQuoteYes=false;
					}
					if(obj.ColumnIndex=="3") {
						$scope.quotation.sendQuotation = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
						obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.tgInvoiceQuoteYes=true : $scope.tgInvoiceQuoteYes=false : $scope.tgInvoiceQuoteYes=false;
					}
				}
				//
				isQuotationLoaded=true;
				//
			}).error(function(data) {
				isQuotationLoaded=false;
			})
		}


		$scope.clearQuotationFields= function () {
			if($scope.quotationSettings.length!=0)
			{
				for(var i=0;i<$scope.quotationSettings.length;i++)
				{
					//var obj=data[i][0];
					var obj=$scope.quotationSettings[i];
					if(obj.ColumnIndex=="0") {
						$scope.quotation.quotationPrefix = obj.RecordFieldData;
						$scope.quotationPrefix=obj.RecordFieldData;
					}
					if(obj.ColumnIndex=="1") {
						$scope.quotation.prefixLength = parseInt(obj.RecordFieldData);
					}
					if(obj.ColumnIndex=="2") {
						$scope.quotation.enableDiscounts = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
						obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.tgDiscQuoteYes=true : $scope.tgDiscQuoteYes=false : $scope.tgDiscQuoteYes=false;
					}
					if(obj.ColumnIndex=="3") {
						$scope.quotation.sendQuotation = obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? true : false : false;
						obj.RecordFieldData != "" ? obj.RecordFieldData == 1 ? $scope.tgInvoiceQuoteYes=true : $scope.tgInvoiceQuoteYes=false : $scope.tgInvoiceQuoteYes=false;
					}
				}
				isQuotationLoaded=true;
			}
			else
			{
				vm.quotations.$setPristine();
				vm.quotations.$setUntouched();
				$scope.quotation={};
				isQuotationLoaded=false;
			}

		}



		//Payment tab
		$scope.payment={};
		vm.paymentSubmit=false;
		$scope.savePayment= function () {
			if(vm.payments.$valid==true) {
				vm.paymentSubmit=true;
				if (isPaymentLoaded) {
					if ($scope.paymentPrefix == $scope.payment.paymentPrefix) {
						for (var i = 0; i < $scope.paymentSettings.length; i++) {
							//
							$scope.deletePaymentSettings($scope.paymentSettings[i]);
						}
						var req = [{
							"RecordName": "CTS_PaymentAttributes",
							"FieldName": "PaymentPrefix",
							"RecordFieldData": $scope.payment.paymentPrefix
						},
							{
								"RecordName": "CTS_PaymentAttributes",
								"FieldName": "PaymentPrefixLength",
								"RecordFieldData": $scope.payment.prefixLength
							},
							{
								"RecordName": "CTS_PaymentAttributes",
								"FieldName": "FirstReminder",
								"RecordFieldData": $scope.invoiceReminders.length!=0?JSON.stringify($scope.invoiceReminders ):""
							},
							{
								"RecordName": "CTS_PaymentAttributes",
								"FieldName": "RecurringReminder",
								"RecordFieldData": $scope.payment.RecurrReminder
							}]
						//
						$charge.settingsapp().insertBulkDuoBaseValues(req).success(function (data) {
							vm.paymentSubmit=false;
							notifications.toast("Payment settings has been applied.", "success");
							$charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_PaymentAttributes", "PaymentPrefix,PaymentPrefixLength,FirstReminder,RecurringReminder").success(function (data) {
								$scope.paymentSettings = [];
								var length = data.length;
								for (var i = 0; i < length; i++) {
									var obj = data[i][0];
									$scope.paymentSettings.push(data[i][0]);
									if (obj.ColumnIndex == "0") {
										$scope.payment.paymentPrefix = obj.RecordFieldData;
										localStorage.removeItem('paymentPrefix');
										localStorage.setItem("paymentPrefix", obj.RecordFieldData);
									}
									if (obj.ColumnIndex == "1") {
										$scope.payment.prefixLength = parseInt(obj.RecordFieldData);
										localStorage.removeItem('PaymentPrefixLength');
										localStorage.setItem("PaymentPrefixLength", obj.RecordFieldData);
									}
									if (obj.ColumnIndex == "2") {
										$scope.payment.firstReminder = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):[];
										$scope.invoiceReminders = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):[];
									}
									if (obj.ColumnIndex == "3") {
										$scope.payment.RecurrReminder = obj.RecordFieldData;
									}
								}
								//
								isPaymentLoaded = true;
								//
							}).error(function (data) {
								isPaymentLoaded = false;

								$scope.infoJson= {};
								$scope.infoJson.message =JSON.stringify(data);
								$scope.infoJson.app ='settings';
								logHelper.error( $scope.infoJson);
							})
						}).error(function (data) {
							//console.log(data);
							vm.paymentSubmit=false;

							$scope.infoJson= {};
							$scope.infoJson.message =JSON.stringify(data);
							$scope.infoJson.app ='settings';
							logHelper.error( $scope.infoJson);
						})
					}
					else {
						//if ($scope.transactionCount == 0) {
						for (var i = 0; i < $scope.paymentSettings.length; i++) {
							//
							$scope.deletePaymentSettings($scope.paymentSettings[i]);
						}
						var req = [{
							"RecordName": "CTS_PaymentAttributes",
							"FieldName": "PaymentPrefix",
							"RecordFieldData": $scope.payment.paymentPrefix
						},
							{
								"RecordName": "CTS_PaymentAttributes",
								"FieldName": "PaymentPrefixLength",
								"RecordFieldData": $scope.payment.prefixLength
							},
							{
								"RecordName": "CTS_PaymentAttributes",
								"FieldName": "FirstReminder",
								"RecordFieldData": $scope.invoiceReminders.length!=0?JSON.stringify($scope.invoiceReminders ):""
							},
							{
								"RecordName": "CTS_PaymentAttributes",
								"FieldName": "RecurringReminder",
								"RecordFieldData": $scope.payment.RecurrReminder
							}]

						$charge.settingsapp().insertBulkDuoBaseValues(req).success(function (data) {
							notifications.toast("Payment settings has been applied.", "success");
							vm.paymentSubmit=false;
							$charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_PaymentAttributes", "PaymentPrefix,PaymentPrefixLength,FirstReminder,RecurringReminder").success(function (data) {
								$scope.paymentSettings = [];
								var length = data.length;
								for (var i = 0; i < length; i++) {
									var obj = data[i][0];
									$scope.paymentSettings.push(data[i][0]);
									if (obj.ColumnIndex == "0") {
										$scope.payment.paymentPrefix = obj.RecordFieldData;
										localStorage.removeItem('paymentPrefix');
										localStorage.setItem("paymentPrefix", obj.RecordFieldData);
									}
									if (obj.ColumnIndex == "1") {
										$scope.payment.prefixLength = parseInt(obj.RecordFieldData);
										localStorage.removeItem('PaymentPrefixLength');
										localStorage.setItem("PaymentPrefixLength", obj.RecordFieldData);
									}
									if (obj.ColumnIndex == "2") {
										$scope.payment.firstReminder = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):[];
										$scope.invoiceReminders = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):[];
									}
									if (obj.ColumnIndex == "3") {
										$scope.payment.RecurrReminder = obj.RecordFieldData;
									}
								}
								//
								isPaymentLoaded = true;
								//
							}).error(function (data) {
								isPaymentLoaded = false;

								$scope.infoJson= {};
								$scope.infoJson.message =JSON.stringify(data);
								$scope.infoJson.app ='settings';
								logHelper.error( $scope.infoJson);
							})
						}).error(function (data) {
							//console.log(data);
							vm.paymentSubmit=false;

							$scope.infoJson= {};
							$scope.infoJson.message =JSON.stringify(data);
							$scope.infoJson.app ='settings';
							logHelper.error( $scope.infoJson);
						})
						//}
						//else {
						//  notifications.toast("Payment Prefix cannot be changed.", "error");
						//  $scope.payment.paymentPrefix = $scope.paymentPrefix;
						//  vm.paymentSubmit=false;
						//}
					}
				}
				else {

					var req = {
						"GURecID": "",
						"RecordType": "CTS_PaymentAttributes",
						"OperationalStatus": "Active",
						"RecordStatus": "Active",
						"Cache": "CTS_PaymentAttributes",
						"Separate": "Test",
						"RecordName": "CTS_PaymentAttributes",
						"GuTranID": "12345",
						"RecordCultureName": "CTS_PaymentAttributes",
						"RecordCode": "CTS_PaymentAttributes",
						"commonDatafieldDetails": [
							{
								"FieldCultureName": "PaymentPrefix",
								"FieldID": "",
								"FieldName": "PaymentPrefix",
								"FieldType": "PaymentPrefixType",
								"ColumnIndex": "0"
							},
							{
								"FieldCultureName": "PaymentPrefixLength",
								"FieldID": "",
								"FieldName": "PaymentPrefixLength",
								"FieldType": "PaymentPrefixLengthType",
								"ColumnIndex": "1"
							},
							{
								"FieldCultureName":"FirstReminder",
								"FieldID":"",
								"FieldName":"FirstReminder",
								"FieldType":"FirstReminderType",
								"ColumnIndex":"2"
							},
							{
								"FieldCultureName":"RecurringReminder",
								"FieldID":"",
								"FieldName":"RecurringReminder",
								"FieldType":"RecurringReminderType",
								"ColumnIndex":"3"
							}],
						"commonDataValueDetails": [
							{
								"RowID": "",
								"RecordFieldData": $scope.payment.paymentPrefix,
								"ColumnIndex": "0"
							},
							{
								"RowID": "",
								"RecordFieldData": $scope.payment.prefixLength,
								"ColumnIndex": "1"
							},
							{
								"RowID":"",
								"RecordFieldData":$scope.invoiceReminders.length!=0?JSON.stringify($scope.invoiceReminders ):"",
								"ColumnIndex":"2"
							},
							{
								"RowID":"",
								"RecordFieldData":$scope.payment.RecurrReminder,
								"ColumnIndex":"3"
							}]
					}

					$charge.settingsapp().store(req).success(function (data) {
						//console.log(data);
						notifications.toast("Payment settings has been applied.", "success");
						vm.paymentSubmit=false;

						$charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_PaymentAttributes", "PaymentPrefix,PaymentPrefixLength,FirstReminder,RecurringReminder").success(function (data) {
							$scope.paymentSettings = [];
							var length = data.length;
							for (var i = 0; i < length; i++) {
								var obj = data[i][0];
								$scope.paymentSettings.push(data[i][0]);
								if (obj.ColumnIndex == "0") {
									$scope.payment.paymentPrefix = obj.RecordFieldData;
									$scope.paymentPrefix = obj.RecordFieldData;
									localStorage.setItem("paymentPrefix", obj.RecordFieldData);
								}
								if (obj.ColumnIndex == "1") {
									$scope.payment.prefixLength = parseInt(obj.RecordFieldData);
									localStorage.setItem("PaymentPrefixLength", obj.RecordFieldData);
								}
								if (obj.ColumnIndex == "2") {
									$scope.payment.firstReminder = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):[];
									$scope.invoiceReminders = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):[];
								}
								if (obj.ColumnIndex == "3") {
									$scope.payment.RecurrReminder = obj.RecordFieldData;
								}
							}
							//
							isPaymentLoaded = true;
							//
						}).error(function (data) {
							isPaymentLoaded = false;

							$scope.infoJson= {};
							$scope.infoJson.message =JSON.stringify(data);
							$scope.infoJson.app ='settings';
							logHelper.error( $scope.infoJson);
						})
					}).error(function (data) {
						//console.log(data);
						$scope.infoJson= {};
						$scope.infoJson.message =JSON.stringify(data);
						$scope.infoJson.app ='settings';
						logHelper.error( $scope.infoJson);
					})


				}
			}
		}


		var isPaymentLoaded=false;
		$scope.paymentSettings=[];

		$scope.PaymentRetryUpdating=false;

		$scope.loadPaymentAttributes= function () {
			$scope.remindersInPaymentLoaded = false;
			$scope.invoiceReminders=[];
			$charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_PaymentAttributes","PaymentPrefix,PaymentPrefixLength,FirstReminder,RecurringReminder").success(function(data) {
				var length=data.length;
				for(var i=0;i<length;i++)
				{
					var obj=data[i][0];
					$scope.paymentSettings.push(data[i][0]);
					if(obj.ColumnIndex=="0") {
						$scope.payment.paymentPrefix = obj.RecordFieldData;
						$scope.paymentPrefix=obj.RecordFieldData;
					}
					if(obj.ColumnIndex=="1") {
						$scope.payment.prefixLength = parseInt(obj.RecordFieldData);
					}
					if (obj.ColumnIndex == "2") {
						$scope.payment.firstReminder = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):[];
						$scope.invoiceReminders = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):[];
					}
					if (obj.ColumnIndex == "3") {
						$scope.payment.RecurrReminder = obj.RecordFieldData;
					}
				}
				$scope.remindersInPaymentLoaded = true;
				//
				isPaymentLoaded=true;
				//
			}).error(function(data) {
				$scope.addNewReminder(0);
				$scope.remindersInPaymentLoaded = true;
				isPaymentLoaded=false;

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})
			//$scope.remindersInPaymentLoaded = false;
			//$charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_InvoiceAttributes","FirstReminder,RecurringReminder").success(function(data) {
			//	var length = data.length;
			//	for (var i = 0; i < length; i++) {
			//		var obj = data[i][0];
			//		$scope.invoiceSettings.push(data[i][0]);
			//		if(obj.ColumnIndex=="6") {
			//			$scope.invoice.firstReminder = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):[];
			//			$scope.invoiceReminders = obj.RecordFieldData!=""?JSON.parse(obj.RecordFieldData):[];
			//		}
			//		if(obj.ColumnIndex=="7") {
			//			$scope.invoice.RecurrReminder = obj.RecordFieldData;
			//		}
			//	}
			//	$scope.remindersInPaymentLoaded = true;
			//
			//}).error(function (data) {
			//	$scope.addNewReminder(0);
			//	$scope.remindersInPaymentLoaded = false;
			//});


			$scope.PaymentRetryUpdating=false;

			$charge.notification().getProcessByCode("Payment").success(function(data) {
				//console.log(data);

				$scope.retryProcess={};
				$scope.retryProcess.processCode="Payment";
				$scope.retryProcess.processName="Payment";
				for(var i=0;i<data.actions.length;i++)
				{
					var actionObj=data.actions[i];
					if(actionObj.actionIndex==0)
					{
						$scope.retryProcess.daysAfterAttempt1st=actionObj.daysAfterAttempt;
						$scope.retryProcess.emailNotification1st=actionObj.emailNotification==1?true:false;
					}
					else if(actionObj.actionIndex==1)
					{
						$scope.retryProcess.daysAfterAttempt2nd=actionObj.daysAfterAttempt;
						$scope.retryProcess.emailNotification2nd=actionObj.emailNotification==1?true:false;
					}
					else if(actionObj.actionIndex==2)
					{
						$scope.retryProcess.daysAfterAttempt3rd=actionObj.daysAfterAttempt;
						$scope.retryProcess.emailNotification3rd=actionObj.emailNotification==1?true:false;
					}
					else if(actionObj.actionIndex==3)
					{
						$scope.retryProcess.daysAfterAttemptFinally=actionObj.processAction;
						$scope.retryProcess.emailNotificationFinally=actionObj.emailNotification==1?true:false;
					}
				}

				$scope.PaymentRetryUpdating=true;

			}).error(function(data) {
				//console.log(data);
				if(data==204)
				{
					$scope.PaymentRetryUpdating=false;
				}

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})
		}


		$scope.clearPaymentFields= function () {
			if($scope.paymentSettings.length!=0)
			{
				for(var i=0;i<$scope.paymentSettings.length;i++)
				{
					//var obj=data[i][0];
					var obj=$scope.paymentSettings[i];
					if(obj.ColumnIndex=="0") {
						$scope.payment.paymentPrefix = obj.RecordFieldData;
						$scope.paymentPrefix=obj.RecordFieldData;
					}
					if(obj.ColumnIndex=="1") {
						$scope.payment.prefixLength = parseInt(obj.RecordFieldData);
					}
				}
				isPaymentLoaded=true;
			}
			else
			{
				vm.payments.$setPristine();
				vm.payments.$setUntouched();
				$scope.payment={};
				isPaymentLoaded=false;
			}

		}

		$scope.deletePaymentSettings= function (ev) {
			//
			$charge.settingsapp().delete(ev).success(function(data) {

			}).error(function(data) {
				//console.log(data);
				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})
		}


		$scope.retryProcess={};
		$scope.paymentRetrySubmitted=false;
		$scope.submitPaymentRetryProcess= function () {
			$scope.paymentRetrySubmitted=true;

			$scope.retryProcess.processCode="Payment";
			$scope.retryProcess.actions=[];

			var actionObj1={};
			var actionObj2={};
			var actionObj3={};
			var actionObj4={};
			actionObj1.actionIndex=0;
			actionObj1.daysAfterAttempt=$scope.retryProcess.daysAfterAttempt1st;
			actionObj1.processAction="Retry";
			actionObj1.emailNotification=$scope.retryProcess.emailNotification1st;
			$scope.retryProcess.actions.push(actionObj1);

			actionObj2.actionIndex=1;
			actionObj2.daysAfterAttempt=$scope.retryProcess.daysAfterAttempt2nd;
			actionObj2.processAction="Retry";
			actionObj2.emailNotification=$scope.retryProcess.emailNotification2nd;
			$scope.retryProcess.actions.push(actionObj2);

			actionObj3.actionIndex=2;
			actionObj3.daysAfterAttempt=$scope.retryProcess.daysAfterAttempt3rd;
			actionObj3.processAction="Retry";
			actionObj3.emailNotification=$scope.retryProcess.emailNotification3rd;
			$scope.retryProcess.actions.push(actionObj3);

			actionObj4.actionIndex=3;
			actionObj4.daysAfterAttempt=0;
			actionObj4.processAction=$scope.retryProcess.daysAfterAttemptFinally;
			actionObj4.emailNotification=$scope.retryProcess.emailNotificationFinally;
			$scope.retryProcess.actions.push(actionObj4);

			if(!$scope.PaymentRetryUpdating)
			{
				$charge.notification().createRetryProcess($scope.retryProcess).success(function(data) {
					//console.log(data);
					if(data.response=="succeeded")
					{
						notifications.toast("Successfully Payment Retry Configuration Saved","success");
						$scope.paymentRetrySubmitted=false;

						$scope.PaymentRetryUpdating=true;

					}
					else
					{
						notifications.toast("Payment Retry Configuration Saving Failed","error");
						$scope.paymentRetrySubmitted=false;
					}

				}).error(function(data) {
					//console.log(data);
					notifications.toast("Payment Retry Configuration Saving Failed","error");
					$scope.paymentRetrySubmitted=false;

					$scope.infoJson= {};
					$scope.infoJson.message =JSON.stringify(data);
					$scope.infoJson.app ='settings';
					logHelper.error( $scope.infoJson);
				})
			}
			else
			{
				$charge.notification().updateRetryProcess($scope.retryProcess).success(function(data) {
					//console.log(data);
					if(data.response=="succeeded")
					{
						notifications.toast("Successfully Payment Retry Configuration Updated","success");
						$scope.paymentRetrySubmitted=false;

						$scope.PaymentRetryUpdating=true;

					}
					else
					{
						notifications.toast("Payment Retry Configuration Updating Failed","error");
						$scope.paymentRetrySubmitted=false;
					}

				}).error(function(data) {
					//console.log(data);
					notifications.toast("Payment Retry Configuration Updating Failed","error");
					$scope.paymentRetrySubmitted=false;

					$scope.infoJson= {};
					$scope.infoJson.message =JSON.stringify(data);
					$scope.infoJson.app ='settings';
					logHelper.error( $scope.infoJson);
				})
			}

		}
		/*
		 * Preferences tab end
		 */

		/*
		 * Payments start
		 */

		$scope.editPayment=false;
		$scope.updatePay = '';

		$scope.editPay= function () {
			$scope.editPayment=true;
			$scope.updatePay = "Payment";
		}

		/*
		 * Tax tab start
		 */

		$scope.upadateGroupTax=false;
		$scope.updateGT = '';

		$scope.editGroupTax= function () {
			$scope.upadateGroupTax=true;
			$scope.updateGT = {
				group_name: "Group Name",
				base_currency: "Base Currency"
			};
		}

		var skip= 0,take=100;
		var skipGrp= 0,takeGrp=100;
		var response="";

		$scope.fixedRates = [];
		$scope.taxGroupList=[];
		$scope.slabRates=[];

		$scope.isIndTaxLoaded = true;
		$scope.loadIndividualTaxes= function () {
			$scope.isIndTaxLoaded = false;
			$charge.tax().all(skip,take,"asc").success(function(data) {
				//
				skip += take;
				if(response=="") {
					//if($scope.loading) {
					// returned data contains an array of 2 sentences
					for (var i = 0; i < data.length; i++) {
						if(data[i].taxtype=="1")
							data[i].taxtype="Fixed";
						else if(data[i].taxtype=="0")
							data[i].taxtype="Slab";

						data[i].taxState=false;
						$scope.fixedRates.push(data[i]);

					}
					//$scope.more();
					$timeout(function () {
						$scope.isIndTaxLoaded = true;
					});
					$scope.loading = false;
					// $scope.isSpinnerShown=false;
					//}
				}
			}).error(function(data) {
				//console.log(data);
				response=data;
				$timeout(function () {
					$scope.isIndTaxLoaded = true;
				});
				// $scope.isSpinnerShown=false;
				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})
		}

		$scope.isGrpTaxLoaded = false;
		$scope.loadTaxGrps= function () {
			$charge.tax().allgroups(skipGrp,takeGrp,"asc").success(function(data) {
				//
				skipGrp += takeGrp;
				if(response=="") {
					//if($scope.loading) {
					// returned data contains an array of 2 sentences
					for (var i = 0; i < data.length; i++) {
						$scope.taxGroupList.push(data[i]);

					}
					//$scope.more();
					$scope.isGrpTaxLoaded = true;
					$scope.loading = false;
					// $scope.isSpinnerShown=false;
					//}
				}
			}).error(function(data) {
				//console.log(data);
				$scope.isGrpTaxLoaded = true;
				response=data;
				// $scope.isSpinnerShown=false;
				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			})
		}



		$scope.editableIndTax=false;
		$scope.editInd = '';
		$scope.isSlug=false;

		$scope.editIndTax= function (category, taxtype) {
			$scope.editableIndTax=true;
			$scope.editInd = category;
			if(taxtype == "Slug"){
				$scope.isSlug=true;
			}
			//$mdDialog.show({
			//  controller: 'updateCatCtrl',
			//  locals:{commondata: ev},
			//  templateUrl: 'partials/edit_category.html',
			//  parent: angular.element(document.body),
			//  targetEvent: ev,
			//  clickOutsideToClose:true
			//})
			//  .then(function(categories) {
			//    $scope.categories=categories;
			//  })
		}

		$scope.showTaxInfo = function () {
			$scope.taxIndEditDialog();
		}

		//$scope.updateTax=function(ev,index)
		//{
		//
		//
		//  $scope.taxHeader={};
		//  $scope.isUpdate=true;
		//  //
		//  $charge.tax().getTaxByIDs(ev.taxid).success(function(data) {
		//    console.log(data);
		//    $scope.taxHeader.taxcode=ev.taxcode;
		//    $scope.displaytaxCode=ev.taxcode;
		//    $scope.taxHeader.taxid=ev.taxid;
		//    $scope.taxHeader.taxDesc="desc";
		//    if(ev.taxtype=="Fixed")
		//    {
		//      $scope.taxHeader.taxtype=1;
		//      $scope.enableTaxType(true);
		//      if(data[0].amounttype=="1")
		//        $scope.taxHeader.amount="Amount";
		//      else
		//        $scope.taxHeader.amount="%";
		//      $scope.taxHeader.taxrate = parseFloat(data[0].amount);
		//      $scope.slabrows=[];
		//      $scope.addrow();
		//    }
		//    else
		//    {
		//      $scope.enableTaxType(false);
		//      $scope.taxHeader.taxtype=0;
		//      for(var i=0;i<data.length;i++)
		//      {
		//        data[i].newItem=false;
		//        if(data[i].amounttype=="1")
		//          data[i].amounttype="Amount";
		//        else
		//          data[i].amounttype="%";
		//
		//        data[i].frm=data[i].slabfrom;
		//        data[i].to=data[i].slabto;
		//        data[i].taxAmt=parseFloat(data[i].amount);
		//        data[i].amount=data[i].amounttype;
		//      }
		//      //data[data.length-1].newItem=true;
		//      $scope.slabrows=data;
		//    }
		//
		//    $scope.taxIndEditDialog();
		//    //taxHd.createddate=new Date();
		//    //taxHd.createuser="admin";
		//    //if(taxHd.taxtype=="1" ||taxHd.taxtype==1)
		//    //  taxHd.taxtype="Fixed";
		//    //else
		//    //  taxHd.taxtype="Slab";
		//    //$scope.fixedRates.splice(index,1);
		//    //$scope.fixedRates.push(taxHd);
		//  }).error(function(data) {
		//
		//  })
		//
		//}
		//
		////vm.editTaxForm = {};
		//
		//$scope.isUpdate=false;
		//$scope.individualSubmit=false;
		//$scope.submitTax=function(type,index)
		//{
		//
		//  if(vm.editTaxForm.$valid==true) {
		//    $scope.individualSubmit=true;
		//    if ($scope.taxHeader.taxcode != undefined && $scope.taxHeader.taxcode != "") {
		//      if ($scope.isUpdate) {
		//        var count=0;
		//        //var fixedTaxObj = $filter('filter')($scope.fixedRates, { taxcode: $scope.taxHeader.taxcode })[0];
		//        for(var i=0;i<$scope.fixedRates.length;i++)
		//        {
		//          if($scope.fixedRates[i].taxcode==$scope.taxHeader.taxcode)
		//          {
		//            if($scope.displaytaxCode!=$scope.taxHeader.taxcode) {
		//              count++;
		//            }
		//          }
		//        }
		//        if(count==0) {
		//          $scope.taxdetails = [];
		//          var taxHeader = $scope.taxHeader;
		//          var taxDetails = $scope.slabrows;
		//
		//          if (taxHeader.taxtype == true) {
		//            taxHeader.taxtype = "1";
		//          } else {
		//            taxHeader.taxtype = "0";
		//          }
		//          if (taxDetails.length > 0) {
		//            for (var i = 0; i < taxDetails.length; i++) {
		//              if (taxDetails[i].amount == "%")
		//                taxDetails[i].amount = "0";
		//              else
		//                taxDetails[i].amount = "1";
		//              if (taxHeader.taxtype == false) {
		//                $scope.taxdetails.push
		//                ({
		//                  "slabto": taxDetails[i].to,
		//                  "slabfrom": taxDetails[i].frm,
		//                  "amount": taxDetails[i].taxAmt,
		//                  "amounttype": taxDetails[i].amount
		//                });
		//              }
		//              else {
		//                if (taxHeader.amount == "Amount")
		//                  taxHeader.amount = "1";
		//                else
		//                  taxHeader.amount = "0";
		//                $scope.taxdetails.push
		//                ({
		//                  "slabto": "",
		//                  "slabfrom": "",
		//                  "amount": taxHeader.taxrate,
		//                  "amounttype": taxHeader.amount
		//                });
		//              }
		//            }
		//          }
		//          else {
		//            if (taxHeader.amount == "Amount")
		//              taxHeader.amount = "1";
		//            else
		//              taxHeader.amount = "0";
		//            $scope.taxdetails.push
		//            ({
		//              "slabto": "",
		//              "slabfrom": "",
		//              "amount": taxHeader.taxrate,
		//              "amounttype": taxHeader.amount
		//            });
		//          }
		//
		//
		//          var req = {
		//            "taxid": taxHeader.taxid,
		//            "taxcode": taxHeader.taxcode,
		//            "taxtype": taxHeader.taxtype,
		//            "status": "1",
		//            "taxdetails": $scope.taxdetails
		//          }
		//          $charge.tax().updateTax(req).success(function (data) {
		//
		//            notifications.toast("Tax has been updated.", "success");
		//            $scope.individualSubmit = false;
		//            var taxHd = req;
		//            taxHd.createddate = new Date();
		//            taxHd.createuser = "admin";
		//            if (taxHd.taxtype == "1" || taxHd.taxtype == 1)
		//              taxHd.taxtype = "Fixed";
		//            else
		//              taxHd.taxtype = "Slab";
		//            var taxObj = $filter('filter')($scope.fixedRates, {taxid: taxHd.taxid})[0];
		//            var index = $scope.fixedRates.indexOf(taxObj);
		//            $scope.fixedRates.splice(index, 1);
		//            taxHd.taxState = false;
		//            $scope.fixedRates.push(taxHd);
		//            vm.editTaxForm.$setPristine();
		//            vm.editTaxForm.$setUntouched();
		//            $scope.taxHeader = {};
		//            $scope.taxHeader.taxtype = true;
		//            $scope.requiredStatus = false;
		//            $scope.slabrows = [];
		//              $scope.addrow();
		//            $scope.isUpdate = false;
		//            $mdDialog.hide();
		//          }).error(function (data) {
		//            $scope.individualSubmit = false;
		//          })
		//        }
		//        else
		//        {
		//          notifications.toast("Tax Code is already exist.", "error");
		//          $scope.taxHeader.taxcode = $scope.displaytaxCode;
		//          $scope.individualSubmit=false;
		//        }
		//      }
		//      else {
		//        var isTax = false;
		//        if ($scope.fixedRates.length != 0) {
		//          for (var i = 0; i < $scope.fixedRates.length; i++) {
		//            if ($scope.fixedRates[i].taxcode == $scope.taxHeader.taxcode) {
		//              isTax = true;
		//              notifications.toast("Tax Code is already exist.", "error");
		//              $scope.taxHeader.taxcode = "";
		//              $scope.individualSubmit=false;
		//              break;
		//            }
		//          }
		//        }
		//        if (!isTax) {
		//          $scope.taxDet = [];
		//          var taxHeader = $scope.taxHeader;
		//          var slabdetails = $scope.slabrows;
		//          for (var i = 0; i < slabdetails.length; i++) {
		//            if (taxHeader.taxtype == 0) {
		//              if (slabdetails[i].amount == "Amount")
		//                slabdetails[i].amount = "1";
		//              else
		//                slabdetails[i].amount = "0";
		//              $scope.taxDet.push
		//              ({
		//                "slabto": slabdetails[i].to,
		//                "slabfrom": slabdetails[i].frm,
		//                "amount": slabdetails[i].taxAmt,
		//                "amounttype": slabdetails[i].amount
		//              });
		//            }
		//            else {
		//            }
		//          }
		//          //
		//          if (taxHeader.taxtype == true) {
		//            taxHeader.taxtype = 1;
		//            if (taxHeader.amount == "Amount")
		//              taxHeader.amount = "1";
		//            else
		//              taxHeader.amount = "0";
		//            $scope.taxDet.push
		//            ({
		//              "slabto": "",
		//              "slabfrom": "",
		//              "amount": taxHeader.taxrate,
		//              "amounttype": taxHeader.amount
		//            });
		//          }
		//          else {
		//            taxHeader.taxtype = 0;
		//
		//          }
		//          var req = {
		//            "taxcode": taxHeader.taxcode,
		//            "taxtype": taxHeader.taxtype,
		//            "status": "1",
		//            "taxdetails": $scope.taxDet
		//          }
		//
		//          $charge.tax().storeTax(req).success(function (data) {
		//
		//            $scope.individualSubmit=false;
		//            var taxHd = req;
		//            taxHd.taxid = data.id;
		//            taxHd.createddate = new Date();
		//            taxHd.createuser = "admin";
		//            if (taxHd.taxtype == "1" || taxHd.taxtype == 1)
		//              taxHd.taxtype = "Fixed";
		//            else
		//              taxHd.taxtype = "Slab";
		//            taxHd.taxState=false;
		//            $scope.fixedRates.push(taxHd);
		//            $scope.taxGroupList = [];
		//            var skipGrp = 0, takeGrp = 100;
		//            $charge.tax().allgroups(skipGrp, takeGrp, "asc").success(function (data) {
		//
		//              notifications.toast("Tax has been added.", "success");
		//              skipGrp += takeGrp;
		//              if (response == "") {
		//                for (var i = 0; i < data.length; i++) {
		//                  $scope.taxGroupList.push(data[i]);
		//
		//                }
		//                //$scope.more();
		//                $scope.taxHeader.taxtype = true;
		//                $scope.requiredStatus = false;
		//                //}
		//              }
		//
		//            }).error(function (data) {
		//              //console.log(data);
		//              response = data;
		//              $scope.isSpinnerShown = false;
		//              $scope.individualSubmit=false;
		//            })
		//            vm.editTaxForm.$setPristine();
		//            vm.editTaxForm.$setUntouched();
		//            $scope.taxHeader = {};
		//            $scope.slabrows = [];
		//            $scope.addrow();
		//          }).error(function (data) {
		//            $scope.individualSubmit=false;
		//          })
		//
		//          $mdDialog.hide();
		//
		//        }
		//      }
		//    }
		//    else {
		//      notifications.toast("Tax code cannot be empty.", "error");
		//      $scope.individualSubmit=false;
		//    }
		//  }
		//}


		//$scope.enableTaxType= function (ev) {
		//  $scope.requiredStatus=ev==true?false:true;
		//  if($scope.requiredStatus)
		//  {
		//    //$scope.slabrows=[];
		//    $scope.addNewRow();
		//  }
		//  else
		//  {
		//    $scope.slabrows=[];
		//  }
		//}

		//$scope.addNewRow=function()
		//{
		//  var tax={};
		//  tax.frm=0;
		//  tax.to=0;
		//  tax.type="";
		//  tax.amount="Amount";
		//  tax.taxAmt=0;
		//  $scope.slabrows.push(tax);
		//}
		//
		//$scope.addrow = function () {
		//  //tax.newItem=false;
		//  $scope.addNewRow();
		//}
		//
		//
		//$scope.removerow = function (index) {
		//  if($scope.slabrows.length!=1) {
		//    $scope.slabrows.splice(index, 1);
		//  }
		//}

		$scope.deleteTax= function (ev,index) {
			var confirm = $mdDialog.confirm()
				.title('Are you sure you want to delete this tax?')
				.textContent('You cannot revert a tax once you delete it!')
				.ariaLabel('Lucky day')
				.targetEvent(ev)
				.ok('Yes')
				.cancel('No');

			$mdDialog.show(confirm).then(function() {
				$charge.tax().deleteTax(ev.taxid).success(function(data) {

					notifications.toast("Tax has been deleted.", "success");
					$scope.fixedRates.splice(index,1);
				}).error(function(data) {
					notifications.toast(data.error, "error");

					$scope.infoJson= {};
					$scope.infoJson.message =JSON.stringify(data);
					$scope.infoJson.app ='settings';
					logHelper.error( $scope.infoJson);
				})
			}, function() {

			});
		}
		$scope.addTaxGroup=function(ev)
		{
			$mdDialog.show({
				controller: 'addTaxGrpCtrl as ctrl',
				locals:{fixedRates: $scope.fixedRates},
				templateUrl: 'partials/add_taxgroup.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose:true
			})
				.then(function(taxgroup) {
					taxgroup.createdate=new Date();
					taxgroup.createuser="admin";
					$scope.taxGroupList.push(taxgroup);
				})
		}

		//$scope.childTaxesDisplay = false;
		//$scope.updateTaxGrp=function(ev,index,code)
		//{
		//  if(code == "showTaxList"){
		//    $scope.childTaxesDisplay = true;
		//  }
		//
		//  $scope.taxGrpHeader={};
		//  $scope.isUpdateGrp=true;
		//
		//
		//  $charge.tax().getTaxGrpByIDs(ev.taxgroupid).success(function(data) {
		//    console.log(data);
		//    $scope.taxGrpHeader=data[0];
		//    $scope.displayTaxGrp=data[0].taxgroupcode;
		//    if(data.groupDetail.length!=0) {
		//      for (var i = 0; i < data.groupDetail.length; i++) {
		//        data.groupDetail[i].newItem = false;
		//        var taxId = data.groupDetail[i].taxid;
		//        var taxDetails = $filter('filter')($scope.fixedRates, {taxid: taxId})[0];
		//        data.groupDetail[i].taxcode = taxDetails.taxcode;
		//      }
		//      //data.groupDetail[data.groupDetail.length - 1].newItem = true;
		//      $scope.taxgrpdetails=data.groupDetail;
		//
		//    }
		//    else
		//    {
		//      $scope.taxgrpdetails=[];
		//    }
		//    for(var i=0;i<$scope.fixedRates.length;i++)
		//    {
		//      var taxStateObj=$filter('filter')($scope.taxgrpdetails, { taxid: $scope.fixedRates[i].taxid })[0];
		//      if(taxStateObj!=null || undefined)
		//        $scope.fixedRates[i].taxState=true;
		//    }
		//    $scope.taxGroupEditDialog(ev, $scope.taxgrpdetails);
		//    $scope.childTaxesDisplay = false;
		//
		//  }).error(function(data) {
		//    $scope.childTaxesDisplay = false;
		//  })
		//
		//}

		$scope.deleteTaxGrp= function (ev,index) {
			var confirm = $mdDialog.confirm()
				.title('Are you sure you want to delete this tax group?')
				.textContent('You cannot revert a tax once you delete it!')
				.ariaLabel('Lucky day')
				.targetEvent(ev)
				.ok('Yes')
				.cancel('No');

			$mdDialog.show(confirm).then(function() {
				$charge.tax().deleteTaxGrp(ev.taxgroupid).success(function(data) {

					notifications.toast("Tax Group has been deleted.", "success");
					$scope.taxGroupList.splice(index,1);
				}).error(function(data) {
					notifications.toast(data.error, "error");

					$scope.infoJson= {};
					$scope.infoJson.message =JSON.stringify(data);
					$scope.infoJson.app ='settings';
					logHelper.error( $scope.infoJson);
				})
			}, function() {

			});
		}

		//Site Tour Extraction
		$scope.initSiteTour = function(ev) {
			$mdDialog.show({
				controller: 'SiteTourController as vm',
				templateUrl: 'app/main/settings/dialogs/siteTourDialog.html',
				targetEvent: ev,
				clickOutsideToClose:false,
				locals:{
					general : $scope.general,
					deleteGeneral: $scope.deleteGeneral,
					generalSubmit : $scope.generalSubmit,
					imgWidth : $scope.imgWidth,
					imgHeight : $scope.imgHeight,
					//saveGeneral : $scope.saveGeneral,
					saveCompanyProfile : $scope.saveCompanyProfile,
					deleteCompanyProfile : $scope.deleteCompanyProfile,
					insertCompanyIndividual : $scope.insertCompanyIndividual,
					footerFields : $scope.footerFields,
					footerFieldValues : $scope.footerFieldValues,
					saveFooter : $scope.saveFooter,
					deleteFooter : $scope.deleteFooter,
					insertFooterIndividual : $scope.insertFooterIndividual,
					deletePreferred : $scope.deletePreferred,
					setBaseCurrency : $scope.setBaseCurrency,
					querySearch : $scope.querySearch,
					selectedItem : self.selectedItem,
					searchText : self.searchText,
					addCurrency : $scope.addCurrency,
					searchCurrency : self.searchCurrency,
					queryCurrency : $scope.queryCurrency,
					userCurrencies : $scope.userCurrencies,
					currencyFormatDet : $scope.currencyFormatDet,
					template : $scope.template,
					isEditable : vm.isEditable,
					isPreview : $scope.isPreview,
					settingsCategoryNavigation : settingsCategoryNavigation,
					reveal:$scope.reveal,
					cropper: $scope.cropper,
					productImgFileName: $scope.productImgFileName,
					productImgSrc: $scope.productImgSrc,
					files: files
				}
			}).then(function(answer) {
			}, function() {
			});
		};

		// PAYMENT GATEWAY - INTEGRATED FROM MY ACC ===============================================================================
		// $scope.isRegisteredWithStripe = false;
		$scope.isRegButtonsShow = true;
		// $scope.isRegisteredWith2checkout = false;

		// $scope.checkPaymentMethodRegistry = function(){
		//
		// 	$charge.paymentgateway().stripeCheckAccount().success(function (data) {
		//
		// 		if(data.status) {
		// 			for (var i = 0; i < data.data.length; i++) {
		// 				if (data.data[i].gateway === "stripe")
		// 					$scope.isRegisteredWithStripe = true;
		//
		// 				if (data.data[i].gateway === "2checkout")
		// 					$scope.isRegisteredWith2checkout = true;
		// 			}
		//
		// 			$scope.isRegButtonsShow = false;
		//
		// 		}
		//
		// 	}).error(function(data) {
		// 		console.log( data);
		//
		// 		$scope.isRegisteredWithStripe = false;
		// 		$scope.isRegisteredWith2checkout = false;
		// 		$scope.isRegButtonsShow = false;
		//
		// 	});
		//
		// }
		//
		// $scope.checkPaymentMethodRegistry();

		vm.openRegistrationMenu = function($mdOpenMenu, ev) {
			$mdOpenMenu(ev);
		};

		$scope.proceedWithStripe = function(CLIENT_ID){

			var confirm = $mdDialog.confirm()
				.title('Connect with stripe')
				.textContent('Do you want to proceed ?')
				.ariaLabel('Lucky day')
				.ok('Yes')
				.cancel('No');
			$mdDialog.show(confirm).then(function () {

				$scope.isRegButtonsShow = true;
				$window.location.href = '/azureshell/app/main/settings/paymentMethod/payment-partial.php?CLIENT_ID='+CLIENT_ID;

			}, function () {
				$mdDialog.hide();

			});


		}

		$scope.disconnectWithStripe = function(){

			$scope.isRegButtonsShow = true;


			var confirm = $mdDialog.confirm()
				.title('Disconnect with stripe')
				.textContent('Do you want to proceed with stripe disconnection?')
				.ariaLabel('Lucky day')
				.ok('Yes')
				.cancel('No');
			$mdDialog.show(confirm).then(function () {



				$charge.paymentgateway().deactiveAcc().success(function (dataa) {

					//console.log(dataa);

					if(dataa.status)
					{
						notifications.toast("You have successfully disconnected with stripe", "Success");
						$scope.isRegisteredWithStripe = false;
						$scope.makeDefault('testGateway');
						$scope.loadOnlinePaymentRegistration();
					}else{
						notifications.toast("There is a problem, Please try again", "Error");
					}

					$scope.isRegButtonsShow= false;

				}).error(function (data) {
					//console.log(data);
					$scope.isRegButtonsShow= false;
					var error = "There is a problem, Please try again";
					if(angular.isDefined(data["error"])){
						error = data["error"]+". Please try again";
					}
					notifications.toast(error, "Error");

				});

			}, function () {
				$scope.isRegButtonsShow = true;
			});

		}


		$scope.disconnectWithbraintree = function(key){

			$scope.isRegButtonsShow = true;

			$scope.braintree = key;

			var confirm = $mdDialog.confirm()
				.title('Disconnect with braintree')
				.textContent('Do you want to proceed with braintree disconnection?')
				.ariaLabel('Lucky day')
				.ok('Yes')
				.cancel('No');
			$mdDialog.show(confirm).then(function () {



				$charge.paymentgateway().disconnectWithBraintree($scope.braintree).success(function (dataa) {

					//console.log(dataa);

					if(dataa.status)
					{
						notifications.toast("You have successfully disconnected with braintree", "Success");
						$scope.makeDefault('testGateway');
						$scope.loadOnlinePaymentRegistration();
					}else{
						notifications.toast("There is a problem, Please try again", "Error");
					}

					$scope.isRegButtonsShow= false;

				}).error(function (data) {
					//console.log(data);
					$scope.isRegButtonsShow= false;
					var error = "There is a problem, Please try again";
					if(angular.isDefined(data["error"])){
						error = data["error"]+". Please try again";
					}
					notifications.toast(error, "Error");

					$scope.infoJson= {};
					$scope.infoJson.message =JSON.stringify(data);
					$scope.infoJson.app ='settings';
					logHelper.error( $scope.infoJson);

				});

			}, function () {
				$scope.isRegButtonsShow = true;
			});

		}

		$scope.disconnectWithWorldPay = function(key){

			$scope.isRegButtonsShow = true;

			$scope.worldpay = key;

			var confirm = $mdDialog.confirm()
				.title('Disconnect with worldpay')
				.textContent('Do you want to proceed with worldpay disconnection?')
				.ariaLabel('Lucky day')
				.ok('Yes')
				.cancel('No');
			$mdDialog.show(confirm).then(function () {



				$charge.paymentgateway().disconnectWithworldpay($scope.worldpay).success(function (dataa) {

					//console.log(dataa);

					if(dataa.status)
					{
						notifications.toast("You have successfully disconnected with worldpay", "Success");
						$scope.makeDefault('testGateway');
						$scope.loadOnlinePaymentRegistration();
					}else{
						notifications.toast("There is a problem, Please try again", "Error");
					}

					$scope.isRegButtonsShow= false;

				}).error(function (data) {
					//console.log(data);
					$scope.isRegButtonsShow= false;
					var error = "There is a problem, Please try again";
					if(angular.isDefined(data["error"])){
						error = data["error"]+". Please try again";
					}
					notifications.toast(error, "Error");

					$scope.infoJson= {};
					$scope.infoJson.message =JSON.stringify(data);
					$scope.infoJson.app ='settings';
					logHelper.error( $scope.infoJson);

				});

			}, function () {
				$scope.isRegButtonsShow = true;
			});

		}

		$scope.disconnectWithAuthorize = function(key){

			$scope.isRegButtonsShow = true;

			$scope.authorize = key;

			var confirm = $mdDialog.confirm()
				.title('Disconnect with AuthorizedNet')
				.textContent('Do you want to proceed with AuthorizedNet disconnection?')
				.ariaLabel('Lucky day')
				.ok('Yes')
				.cancel('No');
			$mdDialog.show(confirm).then(function () {

				$charge.paymentgateway().disconnectWithAuthorize($scope.authorize).success(function (dataa) {

					//console.log(dataa);

					if(dataa.status)
					{
						notifications.toast("You have successfully disconnected with AuthorizedNet", "Success");
						$scope.makeDefault('testGateway');
						$scope.loadOnlinePaymentRegistration();
					}else{
						notifications.toast("There is a problem, Please try again", "Error");
					}

					$scope.isRegButtonsShow= false;

				}).error(function (data) {
					//console.log(data);
					$scope.isRegButtonsShow= false;
					var error = "There is a problem, Please try again";
					if(angular.isDefined(data["error"])){
						error = data["error"]+". Please try again";
					}
					notifications.toast(error, "Error");

					$scope.infoJson= {};
					$scope.infoJson.message =JSON.stringify(data);
					$scope.infoJson.app ='settings';
					logHelper.error( $scope.infoJson);

				});

			}, function () {
				$scope.isRegButtonsShow = true;
			});

		}


    $scope.disconnectWithPaypal = function(key){

      $scope.isRegButtonsShow = true;

      $scope.paypal = key;

      var confirm = $mdDialog.confirm()
        .title('Disconnect with paypal')
        .textContent('Do you want to proceed with paypal disconnection?')
        .ariaLabel('Lucky day')
        .ok('Yes')
        .cancel('No');
      $mdDialog.show(confirm).then(function () {



        $charge.paymentgateway().disconnectWithPayPal($scope.paypal).success(function (dataa) {

          //console.log(dataa);

          if(dataa.status)
          {
            notifications.toast("You have successfully disconnected with paypal", "Success");
            $scope.makeDefault('testGateway');
            $scope.loadOnlinePaymentRegistration();
          }else{
            notifications.toast("There is a problem, Please try again", "Error");
          }

          $scope.isRegButtonsShow= false;

        }).error(function (data) {
          //console.log(data);
          $scope.isRegButtonsShow= false;
          var error = "There is a problem, Please try again";
          if(angular.isDefined(data["error"])){
            error = data["error"]+". Please try again";
          }
          notifications.toast(error, "Error");

          $scope.infoJson= {};
          $scope.infoJson.message =JSON.stringify(data);
          $scope.infoJson.app ='settings';
          logHelper.error( $scope.infoJson);

        });

      }, function () {
        $scope.isRegButtonsShow = true;
      });

    }


		//============================================================

		$scope.currentGateways = [];
		$scope.defaultGateway = "";
    if($scope.accCategory === null){
      $scope.accCategory = gst('category');
    }
		$scope.loadOnlinePaymentRegistration = function(){
			$charge.paymentgateway().availableGateways($scope.general.baseCurrency,$scope.accCategory).success(function (data) {
				if(data.status) {

					$scope.currentGateways = data.data.availableGateway;

					$scope.defaultGateway = data.data.defaultGatway['0'].gateway;

					for (i = 0; i < $scope.currentGateways.length; i++) {

						if (angular.isDefined(data.data.connectedGatways[$scope.currentGateways[i].paymentGateway])) {
							$scope.currentGateways[i].isConnected = true;
							$scope.currentGateways[i].key = data.data.connectedGatways[$scope.currentGateways[i].paymentGateway];

              if($scope.currentGateways[i].key['0'].enableBitcoin){
                  $scope.currentGateways[i].key['0'].enableBitcoin = $scope.currentGateways[i].key['0'].enableBitcoin === 1 ? true : false;
                }

                if($scope.currentGateways[i].key['0'].enableAch){
                  $scope.currentGateways[i].key['0'].enableAch = $scope.currentGateways[i].key['0'].enableAch === 1 ? true : false;
                }
						}
						else
						{
							$scope.currentGateways[i].isConnected = false;
						}

					}

				}

				$scope.gen1Loading = true;
			}).error(function(data) {
				//console.log( data);

				$scope.currentGateways = [];

				$scope.gen1Loading = true;

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			});


		}


    $scope.issavePyamnetExtraDetailsClicked = false;
    $scope.savePyamnetExtraDetails = function(extraDetails){
      $scope.issavePyamnetExtraDetailsClicked = true;
      $charge.paymentgateway().stripeachregister(extraDetails).success(function (data) {

        if(data.status) {
          notifications.toast("Stripe ACH/Bitcoin information saved", "Success");

        }else{
          notifications.toast("There is a problem, Please try again", "Error");
        }

        $scope.issavePyamnetExtraDetailsClicked = false;

      }).error(function(data) {
        //console.log( data);
        notifications.toast("There is a problem, Please try again", "Error");
        $scope.issavePyamnetExtraDetailsClicked = false;

        $scope.infoJson= {};
        $scope.infoJson.message =JSON.stringify(data);
        $scope.infoJson.app ='settings';
        logHelper.error( $scope.infoJson);
      });

    }

		$scope.viewTestGateway = function(ev) {

			$mdDialog.show({
				controller: 'GuidedPaymenttestGatewayController',
				templateUrl: 'app/main/settings/dialogs/guided-payment-testGateway.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose:false,
				locals:{
					idToken : $scope.idToken
				}
			})
				.then(function(answer) {
					// add method after
				}, function() {

				});

		}

		$scope.makeDefault= function(gateway){

			$charge.paymentgateway().makeDefaultGateway(gateway).success(function (data) {

				if(data.status) {
					$scope.defaultGateway = gateway;

					notifications.toast("Default gateway changed", "Success");

				}else{
					notifications.toast("There is a problem, Please try again", "Error");
				}

			}).error(function(data) {
				//console.log( data);
				notifications.toast("There is a problem, Please try again", "Error");

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='settings';
				logHelper.error( $scope.infoJson);
			});
		}

		$scope.proceedWithGateway= function (gateway,ev) {
			if(gateway.paymentGateway === 'stripe'){
				$scope.proceedWithStripe(gateway.clientId);
			}
			else if(gateway.paymentGateway === 'worldpay'){

				$mdDialog.show({
					controller: 'GuidedPaymentworldpayController',
					templateUrl: 'app/main/settings/dialogs/guided-payment-worldpay.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose:false,
					locals:{
						idToken : $scope.idToken
					}
				})
					.then(function(answer) {
						$scope.loadOnlinePaymentRegistration();

					}, function() {

					});
			}else if(gateway.paymentGateway === 'braintree'){

				$mdDialog.show({
					controller: 'GuidedPaymentbraintreeController',
					templateUrl: 'app/main/settings/dialogs/guided-payment-braintree.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose:false,
					locals:{
						idToken : $scope.idToken
					}
				})
					.then(function(answer) {
						$scope.loadOnlinePaymentRegistration();

					}, function() {

					});
			}
			else if(gateway.paymentGateway === 'authorizednet'){

				$mdDialog.show({
					controller: 'GuidedPaymentauthorizeController',
					templateUrl: 'app/main/settings/dialogs/guided-payment-authorize.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose:false,
					locals:{
						idToken : $scope.idToken
					}
				})
					.then(function(answer) {
						$scope.loadOnlinePaymentRegistration();

					}, function() {

					});
			}
			else if(gateway.paymentGateway === 'webxpay'){

				$mdDialog.show({
					controller: 'GuidedPaymentWebxpayController',
					templateUrl: 'app/main/settings/dialogs/guided-payment-webxpay.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose:false,
					locals:{
						idToken : $scope.idToken
					}
				})
					.then(function(answer) {
						$scope.loadOnlinePaymentRegistration();

					}, function() {

					});
			}else if(gateway.paymentGateway === 'paypal'){

        $mdDialog.show({
          controller: 'GuidedPaymentPaypalController',
          templateUrl: 'app/main/settings/dialogs/guided-payment-paypal.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:false,
          locals:{
            idToken : $scope.idToken
          }
        })
          .then(function(answer) {
            $scope.loadOnlinePaymentRegistration();

          }, function() {

          });
      }
		}

		$scope.disconnectWithGateway= function (gateway,key) {
			// $scope.defaultGateway == gateway ? $scope.defaultGateway = 'testGateway' : null;
      if(gateway === 'stripe'){
				$scope.disconnectWithStripe();
			}
			else if(gateway === 'worldpay'){
				$scope.disconnectWithWorldPay(key)
			}else if(gateway === 'braintree'){
				$scope.disconnectWithbraintree(key)
			}else if(gateway === 'authorizednet'){
				$scope.disconnectWithAuthorize(key);
			}else if(gateway === 'webxpay'){
				$scope.disconnectWithWebxpay(key);
			}else if(gateway === 'paypal'){
        $scope.disconnectWithPaypal(key);
      }
		}



		// $scope.registerWithTwoCheckout = function() {
		//
		//
		// 	var confirm = $mdDialog.confirm()
		// 		.title('2Checkout Register')
		// 		.textContent('Do you want to proceed ?')
		// 		.ariaLabel('Lucky day')
		// 		.ok('Yes')
		// 		.cancel('No');
		// 	$mdDialog.show(confirm).then(function (ev) {
		//
		// 		$mdDialog.show({
		// 			controller: 'GuidedPayment2CheckoutController',
		// 			templateUrl: 'app/main/settings/dialogs/guided-payment-2checkout.html',
		// 			parent: angular.element(document.body),
		// 			targetEvent: ev,
		// 			clickOutsideToClose:false,
		// 			locals:{
		// 				idToken : $scope.idToken
		// 			}
		// 		})
		// 			.then(function(answer) {
		// 				$scope.checkPaymentMethodRegistry();
		//
		// 			}, function() {
		//
		// 			});
		//
		// 	}, function () {
		// 		$mdDialog.hide();
		// 	});
		//
		// }
		//
		// $scope.deleteWithTwoCheckout = function() {
		//
		//
		// 	var confirm = $mdDialog.confirm()
		// 		.title('2Checkout disconnect')
		// 		.textContent('Do you want to proceed ?')
		// 		.ariaLabel('Lucky day')
		// 		.ok('Yes')
		// 		.cancel('No');
		// 	$mdDialog.show(confirm).then(function () {
		//
		// 		$charge.paymentgateway().deleteClient().success(function (response) {
		//
		// 			if(response.status){
		// 				$scope.isRegisteredWith2checkout = false;
		// 				notifications.toast("Successfully disconnected with 2checkout ", "success");
		// 			}else{
		// 				notifications.toast("2Checkout disconnection failed", "error");
		// 			}
		//
		//
		// 		}).error(function (response) {
		// 			console.log(response);
		// 			notifications.toast("2Checkout disconnection failed", "error");
		//
		// 		});
		//
		//
		// 	}, function () {
		// 		$mdDialog.hide();
		// 	});
		//
		// }

		// END PAYMENT GATEWAY - INTEGRATED FROM MY ACC ==============================================================================






		//

		//$rootScope.firstLoginDitected = true;
		//if($rootScope.firstLoginDitected === true){
		//  $scope.initSiteTour();
		//}


		//$scope.isUpdateGrp=false;
		//vm.taxGrpSubmit=false;
		//$scope.submitTaxGrp= function () {
		//
		//  if($scope.taxgrpdetails.length!=0) {
		//    if (vm.taxGrpForm.$valid == true) {
		//      vm.taxGrpSubmit = true;
		//      //if ($scope.taxgrpdetails.length!=0) {
		//      if ($scope.isUpdateGrp) {
		//        var count=0;
		//        for(var i=0;i<$scope.taxGroupList.length;i++)
		//        {
		//          if($scope.taxGroupList[i].taxgroupcode==$scope.taxGrpHeader.taxgroupcode)
		//          {
		//            if($scope.displayTaxGrp!=$scope.taxGrpHeader.taxgroupcode)
		//            {
		//              count++;
		//            }
		//          }
		//        }
		//        if(count==0) {
		//          $scope.taxiddetails = [];
		//          var taxcode = $scope.taxGrpHeader.taxgroupcode;
		//          var taxgrpid = $scope.taxGrpHeader.taxgroupid;
		//          var status = $scope.taxGrpHeader.status;
		//          for (var i = 0; i < $scope.taxgrpdetails.length; i++) {
		//            var taxObj = $scope.taxgrpdetails[i];
		//            if (taxObj != null) {
		//              $scope.taxiddetails.push
		//              ({
		//                taxid: taxObj.taxid
		//              });
		//            }
		//            else {
		//              var taxCode = $scope.taxgrpdetails[i].taxCode;
		//              var tax = $filter('filter')($scope.taxgrpdetails, {taxcode: taxCode})[0];
		//              $scope.taxiddetails.push
		//              ({
		//                taxid: tax.taxid
		//              });
		//            }
		//          }
		//          var req = {
		//            "taxgroupid": taxgrpid,
		//            "taxgroupcode": taxcode,
		//            "status": status,
		//            "taxiddetails": $scope.taxiddetails
		//          }
		//
		//          $charge.tax().updateTaxGrp(req).success(function (data) {
		//
		//            notifications.toast("Tax Group has been updated.", "success");
		//            vm.taxGrpSubmit = false;
		//            var taxgroup = req;
		//            taxgroup.createdate = new Date();
		//            taxgroup.createuser = "admin";
		//            var taxGrpObj = $filter('filter')($scope.taxGroupList, {taxgroupid: taxgroup.taxgroupid})[0];
		//            var index = $scope.taxGroupList.indexOf(taxGrpObj);
		//            $scope.taxGroupList.splice(index, 1);
		//            $scope.taxGroupList.push(taxgroup);
		//            vm.taxGrpForm.$setPristine();
		//            vm.taxGrpForm.$setUntouched();
		//            $scope.taxgrpdetails = [];
		//            $scope.taxGrpHeader = {};
		//            $scope.isUpdateGrp = false;
		//            self.searchText = "";
		//            $scope.childTaxesDisplay = false;
		//
		//
		//          }).error(function (data) {
		//            vm.taxGrpSubmit = false;
		//            $scope.childTaxesDisplay = false;
		//          })
		//        }
		//        else
		//        {
		//          notifications.toast("Tax Group Code is already exist.", "error");
		//          $scope.taxGrpHeader.taxgroupcode = $scope.displayTaxGrp;
		//          vm.taxGrpSubmit = false;
		//        }
		//      }
		//      else {
		//        var isTaxGrp = false;
		//        if ($scope.taxGroupList.length != 0) {
		//          for (var i = 0; i < $scope.taxGroupList.length; i++) {
		//            if ($scope.taxGroupList[i].taxgroupcode == $scope.taxGrpHeader.taxgroupcode) {
		//              isTaxGrp = true;
		//              notifications.toast("Tax Group Code is already exist.", "error");
		//              $scope.taxGrpHeader.taxgroupcode = "";
		//              vm.taxGrpSubmit = false;
		//              break;
		//            }
		//          }
		//        }
		//        if (!isTaxGrp) {
		//          $scope.taxiddetails = [];
		//          var taxgroupcode = $scope.taxGrpHeader.taxgroupcode;
		//          var dd = $scope.taxgrpdetails;
		//          for (var i = 0; i < $scope.taxgrpdetails.length; i++) {
		//            var taxObj = $scope.taxgrpdetails[i];
		//            if (taxObj != null) {
		//              $scope.taxiddetails.push
		//              ({
		//                taxid: taxObj.taxid
		//              });
		//            }
		//          }
		//          var req = {
		//            "taxgroupcode": taxgroupcode,
		//            "status": "1",
		//            "taxiddetails": $scope.taxiddetails
		//          }
		//
		//
		//          $charge.tax().storeTaxGrp(req).success(function (data) {
		//
		//            vm.taxGrpSubmit = false;
		//            notifications.toast("Tax Group has been added.", "success");
		//            var taxgroup = req;
		//            taxgroup.taxgroupid = data.id;
		//            taxgroup.createdate = new Date();
		//            taxgroup.createuser = "admin";
		//            $scope.taxGroupList.push(taxgroup);
		//            vm.taxGrpForm.$setPristine();
		//            vm.taxGrpForm.$setUntouched();
		//            $scope.taxgrpdetails = [];
		//            $scope.taxGrpHeader = {};
		//            self.searchText = "";
		//            for(var i=0;i<$scope.fixedRates.length;i++)
		//            {
		//              $scope.fixedRates[i].taxState=false;
		//            }
		//            $scope.childTaxesDisplay = false;
		//          }).error(function (data) {
		//            vm.taxGrpSubmit = false;
		//            $scope.childTaxesDisplay = false;
		//          })
		//        }
		//      }
		//      //}
		//      //else {
		//      //  notifications.toast("Tax Code cannot be empty", "error");
		//      //  vm.taxGrpSubmit = false;
		//      //}
		//    }
		//    $mdDialog.hide();
		//
		//  }
		//  else
		//  {
		//    notifications.toast("Please select a tax.", "error");
		//  }
		//}

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
		//
		//$scope.addNewGroupRow=function()
		//{
		//  var taxgrp={};
		//  taxgrp.taxGroup=0;
		//  taxgrp.taxCode=0;
		//  //taxgrp.taxcodelst=$scope.fixedRates;
		//  //$scope.taxGroups.push(taxgrp);
		//}
		//
		//$scope.addGroupRow = function (ev,state,index) {
		//  if(state) {
		//    if (ev != null) {
		//      $scope.taxgrpdetails.push(ev);
		//      self.searchText = "";
		//    }
		//    else {
		//      notifications.toast("Please select a tax.", "error");
		//    }
		//  }
		//  else
		//  {
		//    $scope.taxgrpdetails.splice(index,1);
		//  }
		//}
		//$scope.addNewGroupRow();
		//
		//$scope.removeGroupRow = function (index) {
		//  $scope.taxgrpdetails.splice(index, 1);
		//}


		/*
		 * Tax tab end
		 */

		/*
		 Intro Start
		 */
		//$scope.CompletedEvent = function (scope) {
		//  console.log("Completed Event called");
		//};
		//
		//$scope.ExitEvent = function (scope) {
		//  console.log("Exit Event called");
		//};
		//
		//$scope.ChangeEvent = function (targetElement, scope) {
		//  console.log("Change Event called");
		//  console.log(targetElement);  //The target element
		//  console.log(this);  //The IntroJS object
		//};
		//
		//$scope.BeforeChangeEvent = function (targetElement, scope) {
		//  console.log("Before Change Event called");
		//  console.log(targetElement);
		//};
		//
		//$scope.AfterChangeEvent = function (targetElement, scope) {
		//  console.log("After Change Event called");
		//  console.log(targetElement);
		//};
		//
		//$scope.IntroOptions = {
		//  steps:[
		//    {
		//      element: document.querySelector('#step1'),
		//      intro: "This is the first tooltip."
		//    },
		//    {
		//      element: document.querySelectorAll('#step2')[0],
		//      intro: "<strong>You</strong> can also <em>include</em> HTML",
		//      position: 'right'
		//    },
		//    {
		//      element: '#step3',
		//      intro: 'More features, more fun.',
		//      position: 'left'
		//    },
		//    {
		//      element: '#step4',
		//      intro: "Another step.",
		//      position: 'bottom'
		//    },
		//    {
		//      element: '#step5',
		//      intro: 'Get it, use it.'
		//    }
		//  ],
		//  showStepNumbers: false,
		//  exitOnOverlayClick: true,
		//  exitOnEsc:true,
		//  nextLabel: '<strong>NEXT!</strong>',
		//  prevLabel: '<span style="color:green">Previous</span>',
		//  skipLabel: 'Exit',
		//  doneLabel: 'Thanks'
		//};
		//
		//$scope.ShouldAutoStart = true;
		/*
		 Intro End
		 */
	}

})();
