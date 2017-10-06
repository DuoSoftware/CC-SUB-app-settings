<?php


$doc = $_SERVER ['DOCUMENT_ROOT'];
require_once ($doc.'/services/config/settings.php');

$CLIENT_ID = '';

  if (isset($_GET['CLIENT_ID'])) {
    $CLIENT_ID = $_GET['CLIENT_ID'];
 }


 //define('TOKEN_URI', ''. PAYMENTGATEWAY_URL .'/services/duosoftware.paymentgateway.service/stripe/insertAccKeys');
 define('TOKEN_URI', ''. PAYMENTGATEWAY_URL .'/services/duosoftware.paymentgateway.service/stripe/insertAccKeys');
 define('AUTHORIZE_URI', 'https://connect.stripe.com/oauth/authorize');
   if (isset($_GET['code'])) {
     $code = $_GET['code'];
     $token_request_body = array(
     'code' => $code
     );


      $res = explode("@", $_GET['state']);



	   $req = curl_init(TOKEN_URI);
       curl_setopt($req, CURLOPT_RETURNTRANSFER, true);
       curl_setopt($req, CURLOPT_POST, true );
	   
      curl_setopt($req,CURLOPT_HTTPHEADER,array('idToken: '.$res[1],'domain: '.$res[0]));
	  
      curl_setopt($req, CURLOPT_POSTFIELDS, json_encode($token_request_body));
       curl_setopt($req, CURLOPT_SSL_VERIFYPEER, false);
       // TODO: Additional error handling
       $respCode = curl_getinfo($req, CURLINFO_HTTP_CODE);
	  $result = curl_exec($req);
	  //var_dump($result);
	  $resp = json_decode($result, true);
	  curl_close($req);

	  //var_dump($resp);

	  if($resp['status']){
        header('Location: //'.$res[0] .'/azureshell/#/settings');
	  }else{

	    var_dump($resp);

      $url = '//'.$res[0].'/azureshell/#/settings';
      echo "<br/> <a href='$url'>Go Back</a>";

	  }


   } else if (isset($_GET['error'])) { // Error

       $res = explode("@", $_GET['state']);


        $error =  $_GET['error_description'];

        if($error === 'The user denied your request'){
           header('Location: //'.$res[0] .'/azureshell/#/settings');
        }else{

          print_r('Error : '.$error);

          //$url = 'http://'.$res[0] .'/azureshell/#/settings';
          $url = '//'.$res[0] .'/azureshell/#/settings';
          echo "<br/> <a href='$url'>Go Back</a>";
        }

   } else { // Show OAuth link

     $authorize_request_body = array(
       'response_type' => 'code',
       'scope' => 'read_write',
       'client_id' => $CLIENT_ID,
       'state' => $_SERVER['SERVER_NAME'].'@'.$_COOKIE['securityToken']
       ,'redirect_uri'=> PAYMENTGATEWAY_URL .'/azureshell/app/main/settings/paymentMethod/payment-partial.php'
       //,'redirect_uri'=> 'http://app.cloudcharge.com/azureshell/app/main/settings/paymentMethod/payment-partial.php'
     );

   $url = AUTHORIZE_URI . '?' . http_build_query($authorize_request_body);

   //echo "<a href='$url'>Connect with Stripe</a>";
   header('Location: '.$url);
 }
?>
