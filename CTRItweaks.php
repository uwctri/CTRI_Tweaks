<?php

namespace UWMadison\CTRItweaks;
use ExternalModules\AbstractExternalModule;
use ExternalModules\ExternalModules;
use REDCap;
use UIState;

function printToScreen($string) {
?>
    <script type='text/javascript'>
       $(function() {
          console.log(<?=json_encode($string); ?>);
       });
    </script>
    <?php
}

class CTRItweaks extends AbstractExternalModule {
    
    private $module_prefix = 'CTRI_Tweaks';
    private $module_global = 'CTRItweaks';
    private $module_name = 'CTRItweaks';
    
    public function __construct() {
            parent::__construct();
    }
    
    public function redcap_every_page_top($project_id) {
        $this->initCTRIglobal();
        if (strpos(PAGE, 'ExternalModules/manager/project.php') !== false && $project_id != NULL)
            $this->includeJs('js/config.js');
        
        if ( $this->getProjectSetting('hide-survey-tools') ) 
            $this->includeJs('js/hide_survey_distribution_tools.js');

        if (PAGE == 'DataEntry/record_home.php' && $_GET['id']) {
            $this->includeJs('js/record_home_always.js');
            $name = $this->getProjectSetting('unverified-name');
            if ( !is_null($name) ) {
                $this->passArgument('UnverifiedName', $name);
                $this->includeJs('js/record_home_change_unverified.js');
            }
            $event = $this->getProjectSetting('system-management-event');
            if ( !is_null($event) ) {
                $this->passArgument('RecordHomeEvent', REDCap::getEventNames(false,false,$event));
                $this->includeJs('js/record_home_system_event.js');
            }
            $events = $this->getProjectSetting('hide-events')[0];
            if ( !is_null($events) ) {
                $this->passArgument('HideEvents', $this->getEventNames($events));
                $this->includeJs('js/record_home_hide_event.js');
            }
            $forms = $this->getProjectSetting('hide-form-row')[0];
            if ( !is_null($forms[0]) ) {
                $this->passArgument('RecordHomeForms', $forms);
                $this->includeJs('js/record_home_hide_row.js');
            }
            $forms = $this->getProjectSetting('hide-repeating-table')[0];
            if ( !is_null($forms[0]) ){
                $this->passArgument('HideRepeatingTable', $forms);
                $this->includeJs('js/record_home_hide_repeating_table.js');
            }
            $forms = $this->getProjectSetting('full-size-repeating-table')[0];
            if ( !is_null($forms[0]) ){
                $this->passArgument('RepeatingTableFullSize', $forms);
                $this->includeJs('js/record_home_full_size_repeating_table.js');
            }
            $tabnames  = $this->getProjectSetting('tab-name');
            $tabevents = $this->getProjectSetting('tab-event');
            $tabbutton = $this->getProjectSetting('tab-event-button');
            if ( !is_null($tabnames[0]) ) {
                $tabevents = $this->map_event_id_to_name($tabevents);
                $this->passArgument('TabConfig', array_combine($tabnames, $tabevents));
                if ( !is_null($tabbutton) )
                    $this->passArgument('AddTabText', $tabbutton);
                $this->includeJs('js/record_home_sub_tabs.js');
            }
        }
        
        // Check to see if we are on the Reports page, and that its not the edit report page
        if (PAGE == 'DataExport/index.php' && $project_id != NULL && !$_GET['addedit']){
            $this->includeJs('js/report_hide_rows_cols.js');
            $this->includeJs('js/report_range_filter.js');
            $this->includeJS('js/report_copy_visible.js');
            $wbSettings = $this->load_report_write_back_settings();
            if ( !empty($wbSettings['config']) ) {
                $this->passArgument('ReportWriteBack', $wbSettings);
                $this->includeJs('js/report_write_back.js');
            }
            if( in_array($_GET["report_id"], array_map('trim',$this->getProjectSetting('check-print-report'))) ) {
                $this->passArgument('Check', 
                    array(
                        "useGlobal" => $this->getProjectSetting('use-global-check-number')[0],
                        "checkNumber" => $this->getSystemSetting('global-check-number'),
                        "study" => $this->getProjectSetting('check-print-study')[0],
                        "address" => $this->getProjectSetting('check-print-address')[0],
                        "varAmt" => $this->getProjectSetting('check-print-amt')[0],
                        "varName" => $this->getProjectSetting('check-print-name')[0],
                        "varMemo" => $this->getProjectSetting('check-print-memo')[0],
                        "varAddr1" => $this->getProjectSetting('check-print-addr1')[0],
                        "varAddr2" => $this->getProjectSetting('check-print-addr2')[0],
                        "varAddr3" => $this->getProjectSetting('check-print-addr3')[0],
                        )
                );
                $this->includeJs('js/report_add_check_print.js');
            }
        }
        
        // Check if we are on the "Save and Return Later" page of a survey
        if ( $_GET['__return'] != NULL ){
            if ( $this->getProjectSetting('hide-send-survey-link') )
                $this->includeJs('js/survey_hide_send_survey_link.js');
        }
    }
    
    public function redcap_project_home_page ($project_id ) {
        $text = $this->getProjectSetting('project-home-alert');
        if ( !empty($text) ) {
            $this->passArgument('AlertText', $text);
            $this->includeJs('js/home_page_alert.js');
        }
        if ( $this->getProjectSetting('force-save-next-form') ) { // Done directly in php
            if( UIState::getUIStateValue($project_id , 'form', 'submit-btn')!='savenextform' )
                UIState::saveUIStateValue($project_id, 'form', 'submit-btn', 'savenextform');
        }
    }
    
    public function redcap_data_entry_form() {
        if ( $this->getProjectSetting('lock-complete-instruments') )
            $this->includeJs('js/data_entry_prevent_enter_submission.js');
        if ( $this->getProjectSetting('prevent-enter-submit') )
            $this->includeJs('js/data_entry_prevent_enter_submission.js');
        if ( $this->getProjectSetting('hide-save-next-record') )
            $this->includeJs('js/data_entry_hide_save_goto_next_record.js');
        if ( $this->getProjectSetting('hide-send-survey-email') )
            $this->includeJS('js/data_entry_hide_survey_option_email.js');
        $this->includeJs('js/data_entry_stop_autocomplete.js');
        $this->includeJs('js/data_entry_mm_dd_yyyy.js');
    }
    
    public function redcap_survey_page() {
        $this->includeJs('js/data_entry_stop_autocomplete.js');
        $this->includeJs('js/data_entry_mm_dd_yyyy.js');
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
    
    private function getEventNames( $id_list ){
        $data = [];
        foreach( $id_list as $index => $id ) {
            if ( $id != "" )
                $data[$index] = REDCap::getEventNames(false,false,$id);
        }
        return $data;
    }
    
    private function load_report_write_back_settings() {
        foreach( $this->getProjectSetting('write-back-button-text') as $index => $btn) {
            $data['config'][$index]["btn"] = $btn;
            $data['config'][$index]["text"] = $this->getProjectSetting('write-back-warning-text')[$index];
            $data['config'][$index]["footer"] = $this->getProjectSetting('write-back-footer-text')[$index];
            foreach( $this->getProjectSetting('write-back-value')[$index] as $sub_index => $val ) {
                $data['config'][$index]["write"][$sub_index]['val'] = $val;
                $data['config'][$index]["write"][$sub_index]['var'] = $this->getProjectSetting('write-back-variable')[$index][$sub_index];
                $data['config'][$index]["write"][$sub_index]['global'] = $this->getProjectSetting('write-back-global')[$index][$sub_index];
                $data['config'][$index]["write"][$sub_index]['radio'] = $this->getProjectSetting('write-back-to')[$index][$sub_index];
            }
            $data['config'][$index]["report"] = $this->getProjectSetting('write-back-report')[$index];
            if( in_array(null, $data['config'][$index]) || !in_array($_GET["report_id"], array_map('trim',explode(',', $data['config'][$index]["report"]))) )
                unset($data['config'][$index]);
        }
        $data['general']['post'] = $this->getUrl('writeback.php');
        $data['general']['eventMap'] = $this->getEventNameMap();
        $data['general']['record_id'] = REDCap::getRecordIdField();
        return $data;
    }
    
    private function initCTRIglobal() {
        $s = $this->getSystemSettings();
        unset($s['enabled']);
        unset($s['discoverable-in-project']);
        unset($s['user-activate-permission']);
        unset($s['version']);
        $data = array(
            "modulePrefix" => $this->module_prefix,
            "systemSettings" => $s,
        );
        echo "<script>var ".$this->module_global." = ".json_encode($data).";</script>";
    }
    
    private function includeJs($path) {
        echo '<script src="' . $this->getUrl($path) . '"></script>';
    }
    
    private function passArgument($name, $value) {
        echo "<script>".$this->module_global.".".$name." = ".json_encode($value).";</script>";
    }
    
    private function debugToConsole($msg) { 
        echo "<script>console.log(".json_encode($msg).")</script>";
    }
}

?>
