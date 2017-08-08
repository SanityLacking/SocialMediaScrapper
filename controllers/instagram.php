<?php
$ch = curl_init();

// set URL and other appropriate options
//https://api.instagram.com/v1/users/self/?access_token=5399513485.7bcc1f9.47279f18017646508ddc0a57cbcb69d3
curl_setopt($ch, CURLOPT_URL,"https://api.instagram.com/v1/users/self/?ACCESS_TOKEN=" .$_REQUEST['token']);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, 'out'.$_REQUEST['data']);
// grab URL and pass it to the browser
curl_exec($ch);
// close cURL resource, and free up system resources
curl_close($ch);
