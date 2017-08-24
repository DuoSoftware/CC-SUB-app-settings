//////////////////////////////////////
// App : Settings                   //
// Owner : Suvethan                 //
// Last changed date : 2017/08/24   //
// Version : 6.1.0.26               //
// Updated By : Kasun               //
//////////////////////////////////////

(function ()
{
    'use strict';

    angular
        .module('app.settings', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $stickyStateProvider, $urlRouterProvider, msNavigationServiceProvider, mesentitlementProvider)
    {
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
        /** Check for Super admin */
        var isSuperAdmin = gst('isSuperAdmin');
        /** Check for Super admin - END */

        $stateProvider
            .state('app.settings', {
                url    : '/settings',
                views : {
                    'settings@app': {
                        templateUrl: 'app/main/settings/settings.html',
                        controller : 'settingscontroller as vm'
                    }
                },
                resolve: {
                    security: ['$q','mesentitlement','$timeout','$rootScope','$state', function($q,mesentitlement,$timeout,$rootScope,$state){
                        if(isSuperAdmin != 'true'){
                            var entitledStatesReturn = mesentitlement.stateDepResolver('settings');
                            mesentitlementProvider.setStateCheck("settings");


                            if(entitledStatesReturn !== true){
                                  return $q.reject("unauthorized");
                            }
                            else
                            {
                              //debugger;
                              $timeout(function() {
                                //console.log('Timeout started');
                                var firstLogin=localStorage.getItem("firstLogin");
                                if(firstLogin==null ||firstLogin=="" || firstLogin==undefined) {
                                  $rootScope.firstLoginDitected = true;
                                }
                                else
                                {
                                  $rootScope.firstLoginDitected = false;
                                  //localStorage.removeItem('firstLogin');
                                }
                              }, 50);
                            }
                        }
                    }]
                },
                bodyClass: 'settings'
            });

        if(isSuperAdmin != 'true'){
            msNavigationServiceProvider.saveItem('settings', {
                title    : 'Settings',
                state    : 'app.settings',
                weight   : 12
            });
        }
    }
})();
