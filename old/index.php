<?php
require('Pusher.php');

$app_id = '129524';
$app_key = '49150bc81042dacfac7d';
$app_secret = '62abcbeb19f142a64291';

$pusher = new Pusher(
  $app_key,
  $app_secret,
  $app_id,
  array('encrypted' => true)
);

$data['alert'] = 'hello world';
$data['message'] = "lkasjdlkjasd";
$data['update_var'] = "player";
$data['data'] = "{}";
$pusher->trigger('update_channel', 'update_event', $data);
?>