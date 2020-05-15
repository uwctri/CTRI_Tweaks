<?php

use REDCap;
use ExternalModules\ExternalModules;

if( isset($_POST['obj']) ) {
    $postData = json_decode($_POST['obj']);
    $pid = $postData->pid;
    $prefix = $postData->prefix;
    $dd = REDCap::getDataDictionary($pid,'array');
    foreach ( $postData->write as $data) {
        if( ($data->action == 'var' || $data->action == 'both') && //This check isn't really needed
             !in_array($data->var, REDCap::getValidFieldsByEvents($pid, $data->event)) )
            continue;
        if ($data->action == 'global' || $data->action == 'both')
            ExternalModules::setSystemSetting($prefix, $data->global, $data->val);
        if( !empty($data->instrument) ) {
            if( $dd[$data->var]['form_name'] == $data->instrument )
                $writeArray[$data->record]["repeat_instances"][$data->event][$data->instrument][$data->instance][$data->var] = $data->val;
        }
        else
            $writeArray[$data->record][$data->event][$data->var] = $data->val;
    }
    $out = REDCap::saveData($pid, 'array', $writeArray);
    echo json_encode($out);
}
else {
    echo "Missing Args";
}

?>