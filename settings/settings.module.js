//////////////////////////////////////
// App : Settings                   //
// Owner : Suvethan                 //
// Last changed date : 2017/06/12   //
// Version : 6.1.0.16              //
// Updated By : Ishara              // 
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
        mesentitlementProvider.setStateCheck("settings");

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
                        var entitledStatesReturn = mesentitlement.stateDepResolver('settings');

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
                    }]
                },
                bodyClass: 'settings'
            });

        msNavigationServiceProvider.saveItem('settings', {
            title    : 'Settings',
            state    : 'app.settings',
            weight   : 12
        });
    }
})();
