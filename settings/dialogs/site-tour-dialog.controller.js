/**
 * Created by Suvethan on 11/15/2016.
 */

(function ()
{
  'use strict';
  angular
    .module('app.dashboard')
    .controller('SiteToursController', SitesTourController);

  /** @ngInject */
  function SitesTourController($mdDialog, $scope,$charge)
  {
    var vm=this;
    var self = vm;

    $scope.currencies=[];
    $charge.settings().currencies().success(function(data) {
      //debugger;
      for (var key in data) {
        var dataRec=data[key];
        $scope.currencies.push(dataRec);
      }
      //debugger;
      //console.log(data);
    }).error(function(data) {
      console.log(data);
    })


    $scope.querySearch =function (query) {

      //Custom Filter
      //debugger;
      var results=[];
      for (var i = 0; i< $scope.currencies.length;  ++i){
        //console.log($scope.allBanks[i].value.value);
        //debugger;
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
      //debugger;
      if(ev!=undefined) {
        $scope.general.baseCurrency = ev.code;
        self.searchText = null;
      }
    }

    //$scope.general = general;
    $scope.general = {};
   // $scope.deleteGeneral = deleteGeneral;
    //$scope.imgWidth = imgWidth;
   // $scope.imgHeight = imgHeight;
    //$scope.saveCompanyProfile = saveCompanyProfile;
    //$scope.saveGeneral = saveGeneral;
    //$scope.deleteCompanyProfile = deleteCompanyProfile;
    //$scope.insertCompanyIndividual = insertCompanyIndividual;
    //$scope.footerFields = footerFields;
    //$scope.footerFieldValues = footerFieldValues;
    //$scope.saveFooter = saveFooter;
    //$scope.insertFooterIndividual = insertFooterIndividual;
    //$scope.deleteFooter = deleteFooter;
    //$scope.deletePreferred = deletePreferred;
    //$scope.setBaseCurrency = setBaseCurrency;
    //$scope.querySearch = querySearch;
    //$scope.addCurrency = addCurrency;
    //$scope.queryCurrency = queryCurrency;
    $scope.template={};
    //vm.isEditable = isEditable;
    //$scope.isPreview = isPreview;
    $scope.footerDet = {};
    $scope.footerDet.greeting='';
    $scope.footerDet.disclaimer='';
    $scope.template.companyLogo=[];

    $scope.invoice={};
    $scope.invoiceReminders=[];
    $scope.invoiceTerms=[];
    //$scope.$watch(function () {
    //  $scope.userCurrencies=[];
    //})

    //$scope.userCurrencies = userCurrencies;
    //debugger;
    //$scope.currencyFormatDet = currencyFormatDet;

    //self.selectedItem = selectedItem;
   // self.searchText = searchText;
   // self.searchCurrency = searchCurrency;

    //$scope.$watch(function () {
    //  if($scope.general.baseCurrency=="" || $scope.general.baseCurrency==undefined || $scope.general.baseCurrency==null || self.searchText=="" || self.searchText==null){
    //    $scope.tourSubmit = true;
    //  }else{
    //    $scope.tourSubmit = false;
    //  }
    //});

    $scope.closeDialog= function () {
      $mdDialog.hide();
      $scope.tourStepActive = 1;
    }

    $scope.tourStepActive = 1;
    $scope.siteTourNext = function () {
      if($scope.tourStepActive<3)
        $scope.tourStepActive += 1;
    }

    $scope.siteTourPrev = function () {
      if($scope.tourStepActive>1)
        $scope.tourStepActive -= 1;
    }
    $scope.tourSubmit = true;
    $scope.setBaseCurrency=function(ev)
    {
      //debugger;
      if(ev!=undefined) {
        $scope.general.baseCurrency = ev.code;
        //self.searchText = null;
        $scope.tourSubmit=false;
      }else{
        $scope.tourSubmit = true;
      }
    }


    $scope.general.userCurrency="";
    $scope.general.currencyName="";

    $scope.userCurrencies=[];
    $scope.addCurrencyInit= function (ev) {
      //debugger;
      if(ev!=undefined) {
        var currencyDet = $filter('filter')($scope.userCurrencies, {code: ev.code})[0];
        if(currencyDet==null || currencyDet==undefined) {
          if($scope.general.baseCurrency!=ev.code) {
            $scope.general.userCurrency = $scope.general.userCurrency + " " + ev.code;
            $scope.general.currencyName = $scope.general.currencyName == "" ? ev.name : $scope.general.currencyName + "," + ev.name;
            debugger;
            $scope.userCurrencies.push(ev);
            self.searchCurrency = null;
          }
          else
          {
            notifications.toast("Base currency cannot be added.", "error");
            self.searchCurrency    = null;
          }
        }
        else {
          notifications.toast("Currency Code " + ev.code + " has been already added.", "error");
          self.searchCurrency    = null;
        }
      }
    }

    var tempCurrencyCodes;
    var tempCurrencyNames;

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
      debugger;
      $scope.userCurrencies.splice(index,1);
      tempCurrencyNames.splice(index,1);
      tempCurrencyCodes.splice(index,1);

    }

    //Save General Records
    $scope.generalSubmit=false;
    $scope.imgWidth = "";
    $scope.imgHeight = "";
    $scope.general.decimalPoint=2;
    $scope.saveGeneralSite = function() {
      debugger;
      if(vm.generalForm.$valid==true) {
        $scope.generalSubmit=true;


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
          debugger;
          $charge.commondata().store(req).success(function (data) {
            localStorage.removeItem('firstLogin');
            localStorage.setItem("firstLogin", $scope.general.baseCurrency);
            if ($scope.cropper.croppedImage != null) {
              //angular.forEach($scope.template.companyLogo, function (obj) {
                $uploader.uploadMedia("CCCompanyImage", $scope.cropper.croppedImage, $scope.productImgFileName);

                //$scope.imgWidth = obj.element[0].childNodes[1].naturalWidth;
                //$scope.imgHeight = obj.element[0].childNodes[1].naturalHeight;

                //if($scope.imgWidth <= 180 && $scope.imgHeight <= 180) {
                  $uploader.onSuccess(function (e, data) {
                    $scope.template.croppedLogo = $storage.getMediaUrl("CCCompanyImage", $scope.productImgFileName);
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
                    debugger;
                    $charge.commondata().store(req).success(function (data) {
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
                      debugger;
                      $charge.commondata().store(req).success(function (data) {
                        $scope.saveInvoiceSite();
                      }).error(function (data) {
                        notifications.toast("Error occured while saving company profile.", "error");
                        $scope.generalSubmit = false;
                      });
                    }).error(function (data) {
                      notifications.toast("Error occured while saving company profile.", "error");
                      $scope.generalSubmit = false;
                    });
                  });
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
              debugger;
              $charge.commondata().store(req).success(function (data) {
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
                debugger;
                $charge.commondata().store(req).success(function (data) {
                  $scope.saveInvoiceSite();
                }).error(function (data) {
                  notifications.toast("Error occured while saving company profile.", "error");
                  $scope.generalSubmit = false;
                });
              }).error(function (data) {
                notifications.toast("Error occured while saving company profile.", "error");
                $scope.generalSubmit = false;
              });
            }


            //}
          }).error(function (data) {
            notifications.toast("Error occured while saving general records.", "error");
            $scope.generalSubmit = false;
          });
      }
    }

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

      $scope.companyFieldValues.push({
        "RowID": "",
        "RecordFieldData": $scope.template.croppedLogo,
        "ColumnIndex": "4"
      });
    }


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

    $scope.saveInvoiceSite= function () {
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
                "RecordFieldData":$scope.invoice.prefixLength==undefined?0:$scope.invoice.prefixLength,
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
                "RecordFieldData": -1,
                "ColumnIndex":"9"
              }]
          }

          $charge.commondata().store(req).success(function(data) {
            notifications.toast("General records has been saved.", "success");
            $scope.generalSubmit = false;
            $rootScope.firstLoginDitected = false;
            $mdDialog.hide();
            //$state.transitionTo($state.current, {}, {
            //  reload: true,
            //  inherit: false,
            //  notify: true
            //});
            $state.go('app.settings', {}, {reload: true});
      }).error(function () {

          });
    }

    //Image Uploader===================================

    //$scope.cropper = cropper;
    //$scope.cropper.sourceImage = null;
    //$scope.cropper.croppedImage = null;
    $scope.bounds = {};
    $scope.bounds.left = 0;
    $scope.bounds.right = 0;
    $scope.bounds.top = 0;
    $scope.bounds.bottom = 0;
    //$scope.productImgFileName = productImgFileName;
   // $scope.productImgSrc = productImgSrc;
    var files = [];

    $scope.triggerImgInput = function () {
      angular.element(document.querySelector('#productImageInput')).trigger('click');
      angular.element(document.querySelector('#productImageInput')).on('change', function () {
        files = this.files;

        if(files.length > 0) {
          $scope.productImgFileName = files[0].name;
        }
      });
    }

    //Image Uploader===================================

  }
})();
