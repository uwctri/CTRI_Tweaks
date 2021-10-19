<?php

namespace UWMadison\CTRItweaks;
use ExternalModules\AbstractExternalModule;
use ExternalModules\ExternalModules;
use REDCap;
use UIState;

function printToScreen($string) {
    ?><script>console.log(<?=json_encode($string); ?>);</script><?php
}

class CTRItweaks extends AbstractExternalModule {
    private $module_global = 'CTRItweaks';
    private $js_library_fuse = "https://cdn.jsdelivr.net/npm/fuse.js@6.0.0";
    
    public function redcap_every_page_top($project_id) {
        $this->initCTRIglobal();
        
        // Custom Config page
        if (strpos(PAGE, 'manager/project.php') !== false && $project_id != NULL)
            $this->includeJs('js/config.js');
        
        // Every page (edits to left-side nav bar)
        if ( $this->getProjectSetting('hide-survey-tools') )
            $this->includeJs('js/all_hide_survey_distribution_tools.js');
        if ( !$this->getProjectSetting('disable-report-tweaks') ) {
            if ( $this->getProjectSetting('always-all-report') ) # TODO
                $this->includeJs('js/all_reports_one_page.js');
        }
        
        // Form Designer Page
        if (PAGE== 'Design/online_designer.php') {
            $this->includeJs('js/form_builder_action_tag_help.js');
            if ( $this->getProjectSetting('support-12-hour-input') ) 
                $this->includeJs('js/data_entry_datetime_pickers.js');
        }
        
        // Add / Edit Records Page
        if (PAGE == 'DataEntry/record_home.php' && is_null($_GET['id'])) {
            if ( $this->getProjectSetting('stop-dag-rename') ) {
                $this->includeCss('stop_new_record.css');
                $this->passArgument('newRecordID', $this->getNextRecordID() );
                $this->includeJs('js/add_edit_record_stop_dag_rename.js');
            }
            $this->setUIstate($project_id);
        }
        
        // Record Status Dashboard
        if ( PAGE == 'DataEntry/record_status_dashboard.php' && is_null($_GET['id'])) {
            if ( $this->getProjectSetting('stop-dag-rename') ) {
                $this->includeCss('stop_new_record.css');
                $this->passArgument('newRecordID', $this->getNextRecordID() );
                $this->includeJs('js/add_edit_record_stop_dag_rename.js');
            }
            $this->setUIstate($project_id);
        }
        
        // Record Home Page
        if (PAGE == 'DataEntry/record_home.php' && $_GET['id']) {
            $this->includeJs('js/record_home_always.js');
            if ( $this->getProjectSetting('align-th-top') ) {
                $this->includeJs('js/record_home_top_align_th.js');
            }
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
                foreach( array_filter($events) as $id ) {
                    $eventNames[] = REDCap::getEventNames(false,false,$id);
                }
                $this->passArgument('HideEvents', $eventNames);
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
                $tabevents = $this->mapEventIds2Names($tabevents);
                $this->passArgument('TabConfig', array_combine($tabnames, $tabevents));
                if ( !is_null($tabbutton) )
                    $this->passArgument('AddTabText', $tabbutton);
                $this->includeJs('js/record_home_sub_tabs.js');
            }
        }
        
        // Reports Page (not the Edit Reports Page)
        if (PAGE == 'DataExport/index.php' && $project_id != NULL && !$_GET['addedit'] && $_GET['report_id']){
            if ( !$this->getProjectSetting('disable-report-tweaks') ) { # TODO
                $this->includeJs('js/report_checkbox_row_col.js'); # TODO
                $this->includeJs('js/report_range_filter.js'); # TODO
                $this->includeJs('js/report_copy_visible.js'); # TODO
            }
            $wbSettings = $this->load_report_write_back_settings();
            if ( !empty($wbSettings['config']) ) {
                $this->passArgument('ReportWriteBack', $wbSettings);
                $this->includeJs('js/report_write_back.js');
            }
        }
        
        // "Save and Return Later" page of a survey
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
        $this->setUIstate($project_id);
    }
    
    public function redcap_data_entry_form($project_id, $record, $instrument, $event_id) {
        // If on a hidden event then redirect the user to the Record Home
        $instruments = $this->getProjectSetting('stop-nav-instrument')[0];
        if ( in_array($instrument, $instruments) ) {
            $arm = $_GET['arm'] ? $_GET['arm'] : '1';
            header("Location: https://" . $_SERVER['HTTP_HOST'] . "/redcap/redcap_v" . REDCAP_VERSION . "/DataEntry/record_home.php?pid=" . $project_id . "&arm=" . $arm . "&id=" . $record);
            return;
        }

        $this->afterLoadActionTags($instrument);
        if ( $this->getProjectSetting('system-management-event') == $event_id )
            $this->includeJs('js/data_entry_system_event.js');
        if ( $this->getProjectSetting('support-12-hour-input') ) 
            $this->includeJs('js/data_entry_datetime_pickers.js');
        if ( $this->getProjectSetting('lock-complete-instruments') )
            $this->includeJs('js/data_entry_lock_complete.js');
        if ( $this->getProjectSetting('prevent-enter-submit') )
            $this->includeJs('js/data_entry_prevent_enter_submission.js');
        if ( $this->getProjectSetting('hide-save-next-record') )
            $this->includeJs('js/data_entry_hide_save_goto_next_record.js');
        if ( $this->getProjectSetting('hide-send-survey-email') )
            $this->includeJs('js/data_entry_hide_survey_option_email.js');
        if ( $this->getProjectSetting('hide-instruments-on-forms') )
            $this->includeJs('js/data_entry_hide_instruments.js');
        $this->includeJs('js/data_entry_stop_autocomplete.js');
        $this->includeJs('js/data_entry_mm_dd_yyyy.js');
        $this->includeJs('js/data_entry_prevent_scrolling_on_load.js');
        $this->includeJs('js/data_entry_toggle_write.js');
        $this->includeJs('js/data_entry_show_all_rows.js');
    }
    
    public function redcap_data_entry_form_top($project_id, $record, $instrument, $event_id) {
        $this->beforeLoadActionTags($instrument);
    }
    
    public function redcap_survey_page($project_id, $record, $instrument, $event_id) {
        $this->afterLoadActionTags($instrument);
        $this->includeJs('js/data_entry_mm_dd_yyyy.js');
        $this->includeJs('js/data_entry_stop_autocomplete.js');
    }
    
    public function redcap_survey_page_top($project_id, $record, $instrument, $event_id) {
        $this->beforeLoadActionTags($instrument);
    }
    
    private function setUIstate($project_id) {
        if ( $this->getProjectSetting('force-save-next-form') ) { // Done directly in php
            if( UIState::getUIStateValue($project_id , 'form', 'submit-btn')!='savenextform' )
                UIState::saveUIStateValue($project_id, 'form', 'submit-btn', 'savenextform');
        }
    }
    
    // Action tags that don't touch JS
    private function beforeLoadActionTags($instrument) {
        global $Proj;
        $fields = REDCap::getFieldNames($instrument);
        foreach ($fields as $field_name) {
            $info = $Proj->metadata[$field_name];
            //@LABEL="[foo]"
            if ( strpos($info['misc'], '@LABEL=') !== false ) {
                $target = trim(explode(' ',explode('@LABEL=', $info['misc'])[1])[0],' []"');
                if ( $Proj->metadata[$target] )
                    $Proj->metadata[$field_name]['element_label'] = $Proj->metadata[$target]['element_label'];
            }
            //@CROSSPP
            $targetPid = $this->getProjectSetting('cross-project-pipe');
            if ( strpos($info['misc'], '@CROSSPP') !== false && !empty($targetPid)) {
                $label = $Proj->metadata[$field_name]['element_label'];
                $count = preg_match_all('/!!(\[[A-Za-z1-9-_]+\]){1,3}/', $label, $match);
                if ( $count > 0 ) {
                    
                    foreach ( $match[0] as $pipeInstance ) {
                        $tmp = substr($pipeInstance, 3, strlen($pipeInstance)-4);
                        $tmp = explode('][', $tmp);
                        $event = null;
                        $instance = null;
                        $record = $_GET['id'];
                        if ( count($tmp) == 1 ) {
                            // Only a field, first event on non-long
                            $field = $tmp[0];
                        } elseif ( count($tmp) == 2 ) {
                            // Event and field
                            $event = $tmp[0];
                            $field = $tmp[1];
                        } else {
                            // Repeating instrument
                            $event = $tmp[0];
                            $field = $tmp[1];
                            $instance = $tmp[2];
                        }
                        if ( $event ) {
                            // Lookup event id with the event name and skirt Redcap's rules
                            $event = $this->getEventIdFromName( $targetPid, $event );
                        }
                        $data = REDCap::getData( $targetPid, 'array', $record, $field, $event );
                        $data = end(end($data[$record]));
                        $data = $instance ? $data[$instance] : $data;
                        $data = is_array($data) ? json_encode($data) : $data;
                        $data = is_bool($data) ? '' : $data;
                        $label = $Proj->metadata[$field_name]['element_label'];
                        $Proj->metadata[$field_name]['element_label'] = str_replace($pipeInstance, $data, $label);
                    }
                }
            }
        }
    }
    
    // Action tags that are JS based
    private function afterLoadActionTags($instrument) {
        global $Proj;
        $jsonNotes = [];
        $markAll = [];
        $readonly2 = [];
        $tomorrow = [];
        $missingcode = [];
        $fuzzy = [];
        $default2 = [];
        $fields = REDCap::getFieldNames($instrument);
        foreach ($fields as $field_name) {
            $info = $Proj->metadata[$field_name];
            //@JSONNOTES
            if ( strpos($info['misc'], '@JSONNOTES') !== false && $info['element_type'] == 'textarea') {
                if ( strpos($info['misc'], '@JSONNOTES-EVENTS') !== false ) {
                    $data = REDCap::getData($Proj->project_id,'array',$_GET['id'],$field_name)[$_GET['id']];
                    $jsonData = [];
                    foreach ( $data as $event_id => $eventData ) {
                        $eventJson = json_decode($eventData[$field_name],true);
                        $eventJson = $eventJson ? $eventJson : [];
                        $jsonData = array_merge($jsonData, $eventJson);
                    }
                    $jsonData = empty($jsonData) ? "{}" : json_encode($jsonData);
                } else {
                    $data = REDCap::getData($Proj->project_id,'array',$_GET['id'],$field_name,$_GET['event_id'])[$_GET['id']];
                    $jsonData = is_null($data) ? null : end(end($data['repeat_instances'][$_GET['event_id']]))[$field_name];
                    $jsonData = is_null($jsonData) ? $data[$_GET['event_id']][$field_name] : $jsonData;
                }
                $jsonNotes[$field_name] = $jsonData;
            }
            //@MARKALL
            if ( strpos($info['misc'], '@MARKALL') !== false && $info['grid_name'] ) {
                $markAll[$info['grid_name']] = trim(explode(' ',explode('@MARKALL=', $info['misc'])[1])[0],' "');
            }
            //@READONLY2
            if ( strpos($info['misc'], '@READONLY2') !== false ) {
                array_push($readonly2, $field_name);
            }
            //@DEFAULT2
            if ( strpos($info['misc'], '@DEFAULT2') !== false ) {
                $target = preg_replace('/\s+/', ' ', $info['misc']);
                $target = str_replace('@DEFAULT2 =', '@DEFAULT2=', $target);
                $rhs = explode('DEFAULT2=', $target)[1];
                $target = trim(explode(' ',trim($rhs,' '))[0],' "\'');
                if ( $target[0] == "[" && substr($target, strlen($target)-1) == "]" ) {
                    list($event,$field) = explode('][', $target);
                    $event = trim($event,'[]');
                    if ( empty($field) ) {
                        $field = $event;
                        $event = $_GET['event_id'];
                    } else {
                        $field = trim($field,'[]');
                        $event = REDCap::getEventIdFromUniqueEvent( $event );
                    }
                    $target = REDCap::getData($Proj->project_id,'array',$_GET['id'],$field,$event)[$_GET['id']];
                    $target = !is_null($target['repeat_instances']) ? end(end($target['repeat_instances'][$event]))[$field] : $target[$event][$field];
                    $default2[$field_name] = $target;
                } else {
                    preg_match('/"([^"]+)"/', $rhs, $target);
                    if ( !empty($target[0]) )
                        $target = $target[1];
                    else
                        $target = $rhs;
                    $default2[$field_name] = trim($target, '"\' ');
                }
                
            }
            //@TOMORROWBUTTON
            if ( strpos($info['misc'], '@TOMORROWBUTTON') !== false && strpos($info['element_validation_type'], 'date_') !== false ) {
                array_push($tomorrow, $field_name);
            }
            //@MISSINGCODE
            if ( strpos($info['misc'], '@MISSINGCODE') !== false ) {
                $input = stripslashes(trim(explode(' ',explode('@MISSINGCODE=', $info['misc'])[1])[0],' "'));
                $result = preg_match_all( '/\((.*?)\)/', $input, $match);
                $out = array();
                if ( !$result ) // No parentheses found, split on commas
                    $out = array_map('strtoupper', explode(',', $input) );
                else { // Parentheses found, break out the inputs
                    $input = $match[1];
                    foreach( $input as $index => $varString ) {
                        if ( strlen($varString) == 2 )
                            $out[$index] = [strtoupper($varString)];
                        else { // Regex magic, ("foo","woo") or "dk" or dk (no quotes)
                            $out[$index] = array_map(function($item) {
                                return trim($item, ' \'"');
                            }, preg_split('/,(?=(?:(?:[^"]*(?:")){2})*[^"]*$)/', $varString));
                        }
                    }
                }
                $missingcode[$field_name] = $out;
            }
            //@FUZZY
            if ( strpos($info['misc'], '@FUZZY') !== false ) {
                $fuzzy['search'][$field_name] = [];
                $target = trim(explode(' ',explode('@FUZZY=', $info['misc'])[1])[0],' []"');
                $target = $Proj->metadata[$target] ? $target : $field_name;
                $data = REDCap::getData($Proj->project_id,'array',null,$target);
                $dd = REDCap::getDataDictionary($Proj->project_id, 'array');
                foreach( $data as $record => $events ) {
                    foreach( $events as $event => $values ) {
                        if ( $event == 'repeat_instances' ) {
                            foreach( $values as $repeatingEvent => $instruments) {
                                foreach( $instruments as $instrument => $instances ) {
                                    foreach( $instances as $instance => $val ) {
                                        array_push($fuzzy['search'][$field_name], [
                                            'record' => $record,
                                            'event' => $repeatingEvent,
                                            'value' => $val[$target],
                                            'instance' => $instance,
                                            'instrument' => $instrument
                                        ]);
                                    }
                                }
                            }
                        } else {
                            foreach( $values as $val ) {
                                array_push($fuzzy['search'][$field_name], [
                                    'record' => $record,
                                    'event' => $event,
                                    'value' => $val,
                                    'instance' => '1',
                                    'instrument' => $dd[$field_name]['form_name']
                                ]);
                            }
                        }
                    }
                }
            }
        }
        if ( !empty($jsonNotes) ) {
            $this->passArgument('jsonNotes', ['raw'=>$jsonNotes]);
            $this->includeJs('js/data_entry_action_tag_json_notes.js');
        }
        if ( !empty($markAll) ) {
            $this->passArgument('markAll', $markAll);
            $this->includeJs('js/data_entry_action_tag_matrix_mark_all.js');
        }
        if ( !empty($readonly2) ) {
            $this->passArgument('readonly2', $readonly2);
            $this->includeJs('js/data_entry_action_tag_readonly2.js');
        }
        if ( !empty($default2) ) {
            $this->passArgument('default2', $default2);
            $this->includeJs('js/data_entry_action_tag_default2.js');
        }
        if ( !empty($tomorrow) ) {
            $this->passArgument('tomorrowButton', $tomorrow);
            $this->includeJs('js/data_entry_action_tag_tomorrow.js');
        }
        if ( !empty($missingcode) ) {
            $this->passArgument('missingcode', ['config' => []]);
            $this->passArgument('missingcode.config', $missingcode);
            $this->includeJs('js/data_entry_action_tag_missingcode.js');
        }
        if ( !empty($fuzzy) ) {
            $this->passArgument('fuzzy', $fuzzy);
            $this->includeJs('js/data_entry_action_tag_fuzzy.js');
            $this->includeJsLibrary($this->js_library_fuse);
        }
    }
    
    private function getEventIdFromName( $project_id, $eventName ) {
        $sql = "SELECT event_id, descrip FROM redcap_events_metadata WHERE event_id IN 
                (SELECT DISTINCT event_id FROM redcap_data WHERE project_id = $project_id);";
        $eventName = explode('_arm_',$eventName)[0];
        $results = db_query($sql);
        $out = false;
        if($results && $results !== false && db_num_rows($results)) {
            while ($row = db_fetch_assoc($results)) {
                $tmp = strtolower($row['descrip']);
                $tmp = preg_replace('/[^a-z\d\s:]*/','',$tmp);
                $tmp = str_replace(' ', '_', $tmp);
                if ( $tmp == $eventName ) {
                    $out = $row['event_id'];
                }
            }
        }
        return $out;
    }
    
    private function mapEventIds2Names( $array ){
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
    
    private function getNextRecordID() {
        global $Proj;
        return end(array_keys(REDCap::getData( $Proj->project_id, 'array', NULL, REDCap::getRecordIdField() )))+1;
    }
    
    private function load_report_write_back_settings() {
        foreach( $this->getProjectSetting('write-back-button-text') as $index => $btn) {
            $data['config'][$index]["btn"] = $btn;
            $data['config'][$index]["text"] = $this->getProjectSetting('write-back-warning-text')[$index];
            $data['config'][$index]["footer"] = $this->getProjectSetting('write-back-footer-text')[$index];
            foreach( $this->getProjectSetting('write-back-value')[$index] as $sub_index => $val ) {
                $data['config'][$index]["write"][$sub_index]['val'] = $val;
                $data['config'][$index]["write"][$sub_index]['overwrite'] = $this->getProjectSetting('write-back-overwrite')[$index][$sub_index];
                $data['config'][$index]["write"][$sub_index]['eventStatic'] = $this->getProjectSetting('write-back-event')[$index][$sub_index];
                $data['config'][$index]["write"][$sub_index]['var'] = $this->getProjectSetting('write-back-variable')[$index][$sub_index];
                $data['config'][$index]["write"][$sub_index]['global'] = $this->getProjectSetting('write-back-global')[$index][$sub_index];
                $data['config'][$index]["write"][$sub_index]['radio'] = $this->getProjectSetting('write-back-to')[$index][$sub_index];
            }
            $data['config'][$index]["report"] = $this->getProjectSetting('write-back-report')[$index];
            if( !isset($data['config'][$index]["btn"]) || !isset($data['config'][$index]["text"]) ||
                !in_array($_GET["report_id"], array_map('trim',explode(',', $data['config'][$index]["report"]))) )
                unset($data['config'][$index]);
        }
        $data['config'] = array_values($data['config']);
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
            "modulePrefix" => $this->PREFIX,
            "systemSettings" => $s,
        );
        echo "<script>var ".$this->module_global." = ".json_encode($data).";</script>";
    }
    
    private function includeJsLibrary($path) {
        echo '<script src="' . $path . '"></script>';
    }
    
    private function includeJs($path) {
        echo '<script src="' . $this->getUrl($path) . '"></script>';
    }
    
    private function includeCss($path) {
        echo '<link rel="stylesheet" href="' . $this->getUrl($path) . '"/>';
    }
    
    private function passArgument($name, $value) {
        echo "<script>".$this->module_global.".".$name." = ".json_encode($value).";</script>";
    }
}

?>
