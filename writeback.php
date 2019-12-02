<?php

use REDCap;

if( isset($_POST['obj']) ) {
    $postData = json_decode($_POST['obj']);
    $pid = $postData->pid;
    $dd = REDCap::getDataDictionary($pid,'array');
    foreach ( $postData->write as $data) {
        if( !in_array($data->varName, REDCap::getValidFieldsByEvents($pid, $data->event)) )
            continue;
        if( !empty($data->instrument) ) {
            if( $dd[$data->varName]['form_name'] == $data->instrument )
                $writeArray[$data->record]["repeat_instances"][$data->event][$data->instrument][$data->instance][$data->varName] = $data->val;
        }
        else
            $writeArray[$data->record][$data->event][$data->varName] = $data->val;
    }
    $out = REDCap::saveData($pid, 'array', $writeArray);
    echo json_encode($out); 
}
else {
    echo "Missing Args";
}

?>