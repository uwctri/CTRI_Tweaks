<?php

namespace UWMadison\CTRItweaks;
use ExternalModules\AbstractExternalModule;
use ExternalModules\ExternalModules;

use REDCap;

class CTRItweaks extends AbstractExternalModule {
    
    public function __construct() {
            parent::__construct();
    }
    
    public function redcap_every_page_top($project_id) {
        
        if (PAGE == 'DataEntry/record_home.php' && $_GET['id']) {
            $event = $this->getProjectSetting('system-management-event');
            if ( !is_null($event) ) {
                $this->passArgument('ctriTweaksRecordHomeEvent', REDCap::getEventNames(false,false,$event));
                $this->includeJs('js/move_event_record_home.js');
            }
            $forms = $this->getProjectSetting('hide-form-row')[0];
            if ( !is_null($forms[0]) ) {
                $this->passArgument('ctriTweaksRecordHomeForms', $forms);
                $this->includeJs('js/hide_row_record_home.js');
            }
            $tabnames  = $this->getProjectSetting('tab-name');
            $tabevents = $this->getProjectSetting('tab-event');
            $tabbutton = $this->getProjectSetting('tab-event-button');
            if ( !is_null($tabnames[0]) ) {
                $tabevents = $this->map_event_id_to_name($tabevents);
                $this->passArgument('ctriTweaksTabConfig', array_combine($tabnames, $tabevents));
                if ( !is_null($tabbutton) )
                    $this->passArgument('ctriTweaksAddTabText', $tabbutton);
                $this->includeJs('js/organize_record_home_tabs.js');
            }
            return;
        }
        
        // Check to see if we are on the Reports page, and that its not the edit report page
        if (PAGE != 'DataExport/index.php' || $project_id == NULL || $_GET['addedit']) 
            return;
        $this->includeJs('js/hide_empty_rows.js');
        $this->includeJs('js/report_range_filter.js');
        $this->includeJS('js/report_copy_visible.js');
        $wbSettings = $this->load_report_write_back_settings();
        if ( !empty($wbSettings) ) {
            $this->passArgument('ctriTweaksReportWriteBack', $wbSettings);
            $this->includeJs('js/report_write_back.js');
        }
        // Check if the report ID is listed in the settings
        $id_list = array_map('trim',explode(',',$this->getProjectSetting('report-id-list')[0]));
        if (!in_array($_GET['report_id'],$id_list))
            return;
        if ( $this->getProjectSetting('hide-repeat-vars') )
            $this->includeJs('js/hide_repeat_variables.js');
    }
    
    public function redcap_project_home_page () {
        $text = $this->getProjectSetting('project-home-alert');
        if ( !empty($text) ) {
            $this->passArgument('ctriTweaksAlertText', $text);
            $this->includeJs('js/home_page_alert.js');
        }
    }
    
    public function redcap_data_entry_form() {
        if ( $this->getProjectSetting('prevent-enter-submit') )
            $this->includeJs('js/prevent_enter_submission.js');
        if ( $this->getProjectSetting('hide-save-next-record') )
            $this->includeJs('js/hide_save_next_record.js');
    }
    
    private function map_event_id_to_name( $array ){
        foreach( $array as $name => $set ) {
            foreach( $set as $key => $event ) {
                $array[$name][$key] = REDCap::getEventNames(false,false,$event);
            }
        }
        return $array;
    }
    
    private function load_report_write_back_settings() {
        foreach( $this->getProjectSetting('write-back-button-text') as $index => $btn) {
            $config[$index]["btn"] = $btn;
            $config[$index]["text"] = $this->getProjectSetting('write-back-warning-text')[$index];
            $config[$index]["var"] = $this->getProjectSetting('write-back-variable')[$index];
            $config[$index]["value"] = $this->getProjectSetting('write-back-value')[$index];
            $config[$index]["report"] = $this->getProjectSetting('write-back-report')[$index];
            if( in_array(null, $config[$index]) || !in_array($_GET["report_id"], array_map('trim',explode(',', $config[$index]["report"]))) )
                unset($config[$index]);
        }
        return $config;
    }
    
    private function includeJs($path) {
        echo '<script src="' . $this->getUrl($path) . '"></script>';
    }
    
    private function passArgument($name, $value) {
        echo "<script>var ".$name." = ".json_encode($value).";</script>";
    }
    
    private function debugToConsole($msg) { 
        echo "<script>console.log(".json_encode($msg).")</script>";
    }
}

?>