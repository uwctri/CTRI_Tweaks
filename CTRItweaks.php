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
            $forms = $this->getProjectSetting('full-size-repeating-table');
            if ( !is_null($forms[0]) ){
                $this->passArgument('ctriTweaksRepeatingTableFullSize', $forms);
                $this->includeJs('js/record_home_full_size_repeating_table.js');
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
        }
        
        // Check to see if we are on the Reports page, and that its not the edit report page
        if (PAGE == 'DataExport/index.php' && $project_id != NULL && !$_GET['addedit']){
            $this->includeJs('js/report_hide_rows_cols.js');
            $this->includeJs('js/report_range_filter.js');
            $this->includeJS('js/report_copy_visible.js');
            $wbSettings = $this->load_report_write_back_settings();
            if ( !empty($wbSettings['config']) ) {
                $this->passArgument('ctriTweaksReportWriteBack', $wbSettings);
                $this->includeJs('js/report_write_back.js');
            }
        }
        
        // Check if we are on the "Save and Return Later" page of a survey
        if ( $_GET['__return'] != NULL ){
            if ( $this->getProjectSetting('hide-send-survey-link') )
                $this->includeJs('js/hide_send_survey_link.js');
        }
    }
    
    public function redcap_project_home_page () {
        $text = $this->getProjectSetting('project-home-alert');
        if ( !empty($text) ) {
            $this->passArgument('ctriTweaksAlertText', $text);
            $this->includeJs('js/home_page_alert.js');
        }
    }
    
    public function redcap_data_entry_form() {
        if ( $this->getProjectSetting('lock-complete-instruments') )
            $this->includeJs('js/data_entry_lock_complete.js');
        if ( $this->getProjectSetting('prevent-enter-submit') )
            $this->includeJs('js/prevent_enter_submission.js');
        if ( $this->getProjectSetting('hide-save-next-record') )
            $this->includeJs('js/hide_save_next_record.js');
        $this->includeJs('js/stop_autocomplete.js');
        $this->includeJs('js/mm_dd_yyyy.js');
    }
    
    public function redcap_survey_page() {
        $this->includeJs('js/stop_autocomplete.js');
        $this->includeJs('js/mm_dd_yyyy.js');
    }
    
    private function map_event_id_to_name( $array ){
        foreach( $array as $name => $set ) {
            foreach( $set as $key => $event ) {
                $array[$name][$key] = REDCap::getEventNames(false,false,$event);
            }
        }
        return $array;
    }
    
    private function getEventNameMap(){
        foreach( REDCap::getEventNames(false) as $eventID => $display ){
            $data[$eventID]['display'] = $display;
        }
        foreach( REDCap::getEventNames(true) as $eventID => $unique ){
            $data[$eventID]['unique'] = $unique;
        }
        return $data;
    }
    
    private function load_report_write_back_settings() {
        foreach( $this->getProjectSetting('write-back-button-text') as $index => $btn) {
            $data['config'][$index]["btn"] = $btn;
            $data['config'][$index]["text"] = $this->getProjectSetting('write-back-warning-text')[$index];
            $data['config'][$index]["var"] = $this->getProjectSetting('write-back-variable')[$index];
            $data['config'][$index]["value"] = $this->getProjectSetting('write-back-value')[$index];
            $data['config'][$index]["report"] = $this->getProjectSetting('write-back-report')[$index];
            if( in_array(null, $data['config'][$index]) || !in_array($_GET["report_id"], array_map('trim',explode(',', $data['config'][$index]["report"]))) )
                unset($data['config'][$index]);
        }
        $data['general']['post'] = $this->getUrl('writeback.php');
        $data['general']['eventMap'] = $this->getEventNameMap();
        $data['general']['record_id'] = REDCap::getRecordIdField();
        return $data;
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
