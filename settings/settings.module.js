//////////////////////////////////////
// App : Settings                   //
// Owner : Suvethan                 //
// Last changed date : 2018/03/13   //
// Version : 6.1.0.38               //
// Updated By : Gihan               //
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
					security: ['$q','mesentitlement','$timeout','$rootScope','$state','$location', function($q,mesentitlement,$timeout,$rootScope,$state, $location){
						return $q(function(resolve, reject) {
							$timeout(function() {
								// if (true) {
								if ($rootScope.isBaseSet2) {
									resolve(function () {
										var entitledStatesReturn = mesentitlement.stateDepResolver('settings');

										mesentitlementProvider.setStateCheck("settings");

										if(entitledStatesReturn !== true){
											return $q.reject("unauthorized");
										}
									});
								} else {
									return $location.path('/settings');
								}
							});
						});
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
