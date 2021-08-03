<?php

use REDCap;
use ExternalModules\ExternalModules;

if( isset($_POST['obj']) ) {
    
    // Gather Posted info
    $postData = json_decode($_POST['obj']);
    $pid = $postData->pid;
    $prefix = $postData->prefix;
    $dd = REDCap::getDataDictionary($pid,'array');
    
    foreach ( $postData->write as $data) {
        
        // Make sure we have expected settings, this check isn't really needed
        if( ($data->action == 'var' || $data->action == 'both') && 
             !in_array($data->var, REDCap::getValidFieldsByEvents($pid, $data->event)) ) {
            continue;
        }
        
        // Set global system setting
        if ($data->action == 'global' || $data->action == 'both') {
            ExternalModules::setSystemSetting($prefix, $data->global, $data->val);
        }
        
        // Set Local value on repeat or single instrument
        if( !empty($data->instrument) && !$data->ignoreInstance ) {
            
            $instrument = str_replace(' ', '_', $data->instrument);
            $instrument = str_replace('-', '', $data->instrument);
            
            if( $dd[$data->var]['form_name'] == $instrument ) {
                $writeArray[$data->record]["repeat_instances"][$data->event][$data->instrument][$data->instance][$data->var] = $data->val;
            }
        }
        else {
            $writeArray[$data->record][$data->event][$data->var] = $data->val;
        }
        
        // If no overwritting then make sure we don't blow away data
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