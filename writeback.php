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
        if( !empty($data->instrument) && !$data->ignoreInstance ) {
            $instrument = str_replace(' ', '_', $data->instrument);
            $instrument = str_replace('-', '', $data->instrument);
            if( $dd[$data->var]['form_name'] == $instrument )
                $writeArray[$data->record]["repeat_instances"][$data->event][$data->instrument][$data->instance][$data->var] = $data->val;
        }
        else {
            $writeArray[$data->record][$data->event][$data->var] = $data->val;
        }
        if ( $data->overwrite == "0") {
            $existingData = REDCap::getData($pid, 'array', $data->record, $data->var, $data->event);
            if( !empty($data->instrument) && !$data->ignoreInstance ) {
                if ( !empty($existingData[$data->record]["repeat_instances"][$data->event][$data->instrument][$data->instance][$data->var]) ) {
                    $writeArray[$data->record]["repeat_instances"][$data->event][$data->instrument][$data->instance][$data->var] = '';
                }
            }
            else {
                if ( !empty($existingData[$data->record][$data->event][$data->var]) ) {
                    $writeArray[$data->record][$data->event][$data->var] = '';
                }
            }
        }
    }
    $out = REDCap::saveData($pid, 'array', $writeArray);
    echo json_encode($out);
}
else {
    echo "Missing Args";
}

?>