<?php

namespace UWMadison\CTRItweaks;

use ExternalModules\AbstractExternalModule;
use REDCap;
use UIState;
use Design;
use MetaData;
use Project;

class CTRItweaks extends AbstractExternalModule
{
    private $module_global = 'CTRItweaks';
    private $signatures = [
        'kate' => 'js/signature_kate_kobinsky.js',
        'holly' => 'js/signature_holly_prince.js'
    ];

    public function redcap_every_page_top($project_id)
    {
        $this->initModule();
        $record = $_GET['id'];
        $instrument = $_GET['page'];
        $report_id = $_GET['report_id'];

        // Custom Config page
        if ($this->isPage('ExternalModules/manager/project.php') && $project_id)
            $this->includeJs('js/config.js');

        // Every page (edits to left-side nav bar)
        if ($this->getProjectSetting('hide-survey-tools'))
            $this->includeJs('js/all_hide_survey_distribution_tools.js');

        // Form Designer Page
        if ($this->isPage('Design/online_designer.php') && $instrument) {
            $this->includeJs('js/form_builder_action_tag_help.js');
            if ($this->getProjectSetting('support-12-hour-input'))
                $this->includeJs('js/data_entry_datetime_pickers.js');
        }

        // Add / Edit Records Page
        if ($this->isPage('DataEntry/record_home.php') && is_null($record)) {
            if ($this->getProjectSetting('stop-dag-rename')) {
                $this->passArgument('newRecordID', $this->getNextRecordID());
                $this->includeJs('js/add_edit_record_stop_dag_rename.js');
            }
            $this->setUIstate($project_id);
        }

        // Record Status Dashboard
        if ($this->isPage('DataEntry/record_status_dashboard.php') && is_null($record)) {
            if ($this->getProjectSetting('stop-dag-rename')) {
                $this->passArgument('newRecordID', $this->getNextRecordID());
                $this->includeJs('js/add_edit_record_stop_dag_rename.js');
            }
            $this->setUIstate($project_id);
        }

        // Record Home Page
        if ($this->isPage('DataEntry/record_home.php') && $record) {
            $name = $this->getProjectSetting('unverified-name');
            if (!is_null($name)) {
                $this->passArgument('UnverifiedName', $name);
                $this->includeJs('js/record_home_change_unverified.js');
            }
        }

        // View Report Page
        if (($this->isPage('DataExport/index.php') && $project_id && $report_id && !$_GET['addedit'] && !$_GET['stats_charts'])) {
            $this->passArgument('eventMap', array_flip(REDCap::getEventNames(false)));
            $this->includeJs('js/lib/pdfmake.min.js');
            $this->includeJs('js/lib/vfs_fonts.js');
            $this->loadPaymentConfig(null, $report_id);
            $this->includeJs('js/payment_common.js');
            $this->includeJs('js/payment_report.js');
        }

        // "Save and Return Later" page of a survey
        if ($_GET['__return'] != NULL) {
            if ($this->getProjectSetting('hide-send-survey-link'))
                $this->includeJs('js/survey_hide_send_survey_link.js');
        }
    }

    public function redcap_project_home_page($project_id)
    {
        $text = $this->getProjectSetting('project-home-alert');
        if (!empty($text)) {
            $this->passArgument('AlertText', $text);
            $this->includeJs('js/home_page_alert.js');
        }
        $this->setUIstate($project_id);
    }

    public function redcap_data_entry_form($project_id, $record, $instrument, $event_id)
    {
        // If on a hidden event then redirect the user to the Record Home
        $instruments = $this->getProjectSetting('stop-nav-instrument')[0];
        if (in_array($instrument, $instruments)) {
            $arm = $_GET['arm'] ? $_GET['arm'] : '1';
            header("Location: https://" . $_SERVER['HTTP_HOST'] . "/redcap/redcap_v" . REDCAP_VERSION . "/DataEntry/record_home.php?pid=" . $project_id . "&arm=" . $arm . "&id=" . $record);
            return;
        }

        // Payment load
        if ($instrument == "payment") {
            $this->includeJs('js/lib/pdfmake.min.js');
            $this->includeJs('js/lib/vfs_fonts.js');
            $this->loadPaymentConfig($record);
            $this->includeJs('js/payment_common.js');
            $this->includeJs('js/payment_form.js');
        }

        $this->afterLoadActionTags($instrument);
        if ($this->getProjectSetting('system-management-event') == $event_id)
            $this->includeJs('js/data_entry_system_event.js');
        if ($this->getProjectSetting('support-12-hour-input'))
            $this->includeJs('js/data_entry_datetime_pickers.js');
        if ($this->getProjectSetting('lock-complete-instruments'))
            $this->includeJs('js/data_entry_lock_complete.js');
        if ($this->getProjectSetting('prevent-enter-submit'))
            $this->includeJs('js/data_entry_prevent_enter_submission.js');
        if ($this->getProjectSetting('hide-save-next-record'))
            $this->includeJs('js/data_entry_hide_save_goto_next_record.js');
        if ($this->getProjectSetting('hide-send-survey-email'))
            $this->includeJs('js/data_entry_hide_survey_option_email.js');
        if ($this->getProjectSetting('hide-instruments-on-forms'))
            $this->includeJs('js/data_entry_hide_instruments.js');
        $this->includeJs('js/data_entry_stop_autocomplete.js');
        $this->includeJs('js/data_entry_mm_dd_yyyy.js');
        $this->includeJs('js/data_entry_prevent_scrolling_on_load.js');
        $this->includeJs('js/data_entry_toggle_write.js');
        $this->includeJs('js/data_entry_show_all_rows.js');
    }

    public function redcap_data_entry_form_top($project_id, $record, $instrument, $event_id)
    {
        $this->beforeLoadActionTags($instrument);
    }

    public function redcap_survey_page($project_id, $record, $instrument, $event_id)
    {
        $this->afterLoadActionTags($instrument);
        $this->includeJs('js/data_entry_mm_dd_yyyy.js');
        $this->includeJs('js/data_entry_stop_autocomplete.js');
    }

    public function redcap_survey_page_top($project_id, $record, $instrument, $event_id)
    {
        $this->beforeLoadActionTags($instrument);
    }

    public function redcap_module_ajax($action, $payload, $project_id)
    {
        $status = false;
        if ($action == "deploy_payment") {
            $this->deployPaymentInstrument($project_id);
            $status = true;
        } elseif ($action == "bulk_payment") {
            return $this->bulkPaymentPrint($project_id, $payload['report'], $payload['write']);
        }
        return $status;
    }

    private function loadPaymentConfig($record, $report = null)
    {
        $generalData = [];
        $dataConfig = [
            'name' => ['name', 'display_name', 'full_name', 'fullname'],
            'street1' => ['street1', 'address1', 'street', 'address'],
            'street2' => ['street2', 'address2'],
            'city' => ['city'],
            'state' => ['state'],
            'zip' => ['zip'],
            'record' => [REDCap::getRecordIdField()]
        ];
        $data = REDCap::getData('array', $record, array_merge(...array_values($dataConfig)));
        foreach ($data as $record_id => $record_data) {
            foreach ($record_data as $event_id => $event_data) {
                if ($event_id == 'repeat_instances') continue;
                foreach ($event_data as $field => $val) {
                    if ($val == '') continue;
                    foreach ($dataConfig as $alias => $possibleField) {
                        if (in_array($field, $possibleField)) {
                            $generalData[$record_id][$alias] = $val;
                            break;
                        }
                    }
                }
            }
        }
        $generalData = empty($record) ? $generalData : $generalData[$record];
        $this->passArgument('paymentData', $generalData);

        // Static settings
        if ($report) {
            $reports = explode(',', $this->getProjectSetting('check-report'));
            $index = array_search($report, $reports);
            $seed = explode(',', $this->getProjectSetting('check-number'))[$index];
            $seed = strtolower($seed) == 'global' ? $this->getSystemSetting('check-number') : $seed;
            $this->passArgument('seed', $seed);
        }
        $this->passArgument('logo', $this->getProjectSetting('show-logo') == '1');
        $this->passArgument('study', $this->getProjectSetting('study-name'));
        $sig = $this->getProjectSetting('signature');
        if ($sig) {
            $this->includeJs($this->signatures[$sig]);
        }
    }

    private function bulkPaymentPrint($project_id, $report_id, $data)
    {
        $instrument = "payment";
        $new_seed = 0;

        // Grab event knowing that their is only one event with the form
        $sql = "
        SELECT B.event_id FROM
        (SELECT event_id FROM redcap_events_forms where form_name = '$instrument') AS A
        LEFT JOIN redcap_events_metadata AS B
        ON A.event_id = B.event_id 
        LEFT JOIN redcap_events_arms AS C
        ON B.arm_id = C.arm_id
        WHERE C.project_id = $project_id;";
        $result = db_query($sql);
        $event = db_fetch_assoc($result)['event_id'];

        // Grab the seed values
        $reports = explode(',', $this->getProjectSetting('check-report'));
        $index = array_search($report_id, $reports);
        $seeds = explode(',', $this->getProjectSetting('check-number'));

        foreach ($data as $row) {
            $write[$row->record]["repeat_instances"][$event][$instrument][$data->instance] = [
                'check_number' => $data->checkNumber,
                'check_printed' => '1',
                'check_date' => date('Y-m-d')
            ];
            $new_seed = $data->checkNumber;
        }

        if (strtolower($seeds['index']) == 'global') {
            $this->setSystemSetting('check-number', $new_seed);
        } else {
            $seeds[$index] = $new_seed;
            $this->setProjectSetting('check-number', implode(', ', $seeds), $project_id);
        }

        return REDCap::saveData($project_id, 'array', $write);
    }

    private function deployPaymentInstrument($project_id)
    {
        // Check if deployed
        $instruments = array_keys(REDCap::getInstrumentNames(null, $project_id));
        if (in_array("payment", $instruments)) return;

        // Prep to correct the dd
        global $Proj;
        $Proj = new Project($project_id);
        $dd = Design::excel_to_array($this->getUrl("payment.csv"), ",");
        db_query("SET AUTOCOMMIT=0");
        db_query("BEGIN");

        //Create a data dictionary snapshot of the *current* metadata and store the file in the edocs table
        // This is why we need to define a Project above
        MetaData::createDataDictionarySnapshot();

        // Update the dd
        $sql_errors = MetaData::save_metadata($dd, true);
        if (count($sql_errors) > 0) {
            // ERRORS OCCURRED, so undo any changes made
            db_query("ROLLBACK");
            // Set back to previous value
            db_query("SET AUTOCOMMIT=1");
        } else {
            // COMMIT CHANGES
            db_query("COMMIT");
            // Set back to previous value
            db_query("SET AUTOCOMMIT=1");
        }
    }

    private function setUIstate($project_id)
    {
        if ($this->getProjectSetting('force-save-next-form')) {
            if (UIState::getUIStateValue($project_id, 'form', 'submit-btn') != 'savenextform')
                UIState::saveUIStateValue($project_id, 'form', 'submit-btn', 'savenextform');
        }
    }

    // Action tags that don't touch JS
    private function beforeLoadActionTags($instrument)
    {
        global $Proj;
        $fields = REDCap::getFieldNames($instrument);
        $targetPid = $this->getProjectSetting('cross-project-pipe');
        foreach ($fields as $field_name) {
            $info = $Proj->metadata[$field_name];
            //@LABEL="[foo]"
            if (strpos($info['misc'], '@LABEL=') !== false) {
                $target = trim(explode(' ', explode('@LABEL=', $info['misc'])[1])[0], ' []"');
                if ($Proj->metadata[$target])
                    $Proj->metadata[$field_name]['element_label'] = $Proj->metadata[$target]['element_label'];
            }
            //@CROSSPP
            if (strpos($info['misc'], '@CROSSPP') !== false && !empty($targetPid)) {
                $this->pipeCrossPP($field_name, $targetPid);
            }
        }
    }

    private function pipeCrossPP($field, $targetPid)
    {
        global $Proj;
        $label = $Proj->metadata[$field]['element_label'];
        $count = preg_match_all('/!!(\[[A-Za-z1-9-_]+\]){1,3}/', $label, $match);
        if (empty($count)) return;
        foreach ($match[0] as $pipeInstance) {
            $tmp = substr($pipeInstance, 3, strlen($pipeInstance) - 4);
            $tmp = explode('][', $tmp);
            $event = null;
            $instance = null;
            $record = $_GET['id'];
            if (count($tmp) == 1) {
                // Only a field, first event on non-long
                $field = $tmp[0];
            } elseif (count($tmp) == 2) {
                // Event and field
                $event = $tmp[0];
                $field = $tmp[1];
            } else {
                // Repeating instrument
                $event = $tmp[0];
                $field = $tmp[1];
                $instance = $tmp[2];
            }
            if ($event) {
                // Lookup event id with the event name and skirt Redcap's rules
                $event = $this->getEventIdFromName($targetPid, $event);
            }
            $data = REDCap::getData($targetPid, 'array', $record, $field, $event);
            $data = end(end($data[$record]));
            $data = $instance ? $data[$instance] : $data;
            $data = is_array($data) ? json_encode($data) : $data;
            $data = is_bool($data) ? '' : $data;
            $label = $Proj->metadata[$field]['element_label'];
            $Proj->metadata[$field]['element_label'] = str_replace($pipeInstance, $data, $label);
        }
    }

    // Action tags that are JS based
    private function afterLoadActionTags($instrument)
    {
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
            if (strpos($info['misc'], '@JSONNOTES') !== false && $info['element_type'] == 'textarea') {
                if (strpos($info['misc'], '@JSONNOTES-EVENTS') !== false) {
                    $data = REDCap::getData($Proj->project_id, 'array', $_GET['id'], $field_name)[$_GET['id']];
                    $jsonData = [];
                    foreach ($data as $event_id => $eventData) {
                        $eventJson = json_decode($eventData[$field_name], true);
                        $eventJson = $eventJson ? $eventJson : [];
                        $jsonData = array_merge($jsonData, $eventJson);
                    }
                    $jsonData = empty($jsonData) ? "{}" : json_encode($jsonData);
                } else {
                    $data = REDCap::getData($Proj->project_id, 'array', $_GET['id'], $field_name, $_GET['event_id'])[$_GET['id']];
                    $jsonData = is_null($data) ? null : end(end($data['repeat_instances'][$_GET['event_id']]))[$field_name];
                    $jsonData = is_null($jsonData) ? $data[$_GET['event_id']][$field_name] : $jsonData;
                }
                $jsonNotes['noDate'] = (strpos($info['misc'], '@JSONNOTES-NODATE') !== false);
                $jsonNotes['raw'][$field_name] = $jsonData;
            }
            //@MARKALL
            if (strpos($info['misc'], '@MARKALL') !== false && $info['grid_name']) {
                $markAll[$info['grid_name']] = trim(explode(' ', explode('@MARKALL=', $info['misc'])[1])[0], ' "');
            }
            //@READONLY2
            if (strpos($info['misc'], '@READONLY2') !== false) {
                array_push($readonly2, $field_name);
            }
            //@DEFAULT2
            if (strpos($info['misc'], '@DEFAULT2') !== false) {
                $target = preg_replace('/\s+/', ' ', $info['misc']);
                $target = str_replace('@DEFAULT2 =', '@DEFAULT2=', $target);
                $rhs = explode('DEFAULT2=', $target)[1];
                $target = trim(explode(' ', trim($rhs, ' '))[0], ' "\'');
                if ($target[0] == "[" && substr($target, strlen($target) - 1) == "]") {
                    list($event, $field) = explode('][', $target);
                    $event = trim($event, '[]');
                    if (empty($field)) {
                        $field = $event;
                        $event = $_GET['event_id'];
                    } else {
                        $field = trim($field, '[]');
                        $event = REDCap::getEventIdFromUniqueEvent($event);
                    }
                    $target = REDCap::getData($Proj->project_id, 'array', $_GET['id'], $field, $event)[$_GET['id']];
                    $target = !is_null($target['repeat_instances']) ? end(end($target['repeat_instances'][$event]))[$field] : $target[$event][$field];
                    $default2[$field_name] = $target;
                } else {
                    preg_match('/"([^"]+)"/', $rhs, $target);
                    if (!empty($target[0]))
                        $target = $target[1];
                    else
                        $target = $rhs;
                    $default2[$field_name] = trim($target, '"\' ');
                }
            }
            //@TOMORROWBUTTON
            if (strpos($info['misc'], '@TOMORROWBUTTON') !== false && strpos($info['element_validation_type'], 'date_') !== false) {
                array_push($tomorrow, $field_name);
            }
            //@MISSINGCODE
            if (strpos($info['misc'], '@MISSINGCODE') !== false) {
                $input = stripslashes(trim(explode(' ', explode('@MISSINGCODE=', $info['misc'])[1])[0], ' "'));
                $result = preg_match_all('/\((.*?)\)/', $input, $match);
                $out = array();
                if (!$result) // No parentheses found, split on commas
                    $out = array_map('strtoupper', explode(',', $input));
                else { // Parentheses found, break out the inputs
                    $input = $match[1];
                    foreach ($input as $index => $varString) {
                        if (strlen($varString) == 2)
                            $out[$index] = [strtoupper($varString)];
                        else { // Regex magic, ("foo","woo") or "dk" or dk (no quotes)
                            $out[$index] = array_map(function ($item) {
                                return trim($item, ' \'"');
                            }, preg_split('/,(?=(?:(?:[^"]*(?:")){2})*[^"]*$)/', $varString));
                        }
                    }
                }
                $missingcode[$field_name] = $out;
            }
            //@FUZZY
            if (strpos($info['misc'], '@FUZZY') !== false) {
                $fuzzy['search'][$field_name] = [];
                $target = trim(explode(' ', explode('@FUZZY=', $info['misc'])[1])[0], ' []"');
                $target = $Proj->metadata[$target] ? $target : $field_name;
                $data = REDCap::getData($Proj->project_id, 'array', null, $target);
                $dd = REDCap::getDataDictionary($Proj->project_id, 'array');
                foreach ($data as $record => $events) {
                    foreach ($events as $event => $values) {
                        if ($event == 'repeat_instances') {
                            foreach ($values as $repeatingEvent => $instruments) {
                                foreach ($instruments as $instrument => $instances) {
                                    foreach ($instances as $instance => $val) {
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
                            foreach ($values as $val) {
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
        if (!empty($jsonNotes)) {
            $this->passArgument('jsonNotes', $jsonNotes);
            $this->includeJs('js/data_entry_action_tag_json_notes.js');
        }
        if (!empty($markAll)) {
            $this->passArgument('markAll', $markAll);
            $this->includeJs('js/data_entry_action_tag_matrix_mark_all.js');
        }
        if (!empty($readonly2)) {
            $this->passArgument('readonly2', $readonly2);
            $this->includeJs('js/data_entry_action_tag_readonly2.js');
        }
        if (!empty($default2)) {
            $this->passArgument('default2', $default2);
            $this->includeJs('js/data_entry_action_tag_default2.js');
        }
        if (!empty($tomorrow)) {
            $this->passArgument('tomorrowButton', $tomorrow);
            $this->includeJs('js/data_entry_action_tag_tomorrow.js');
        }
        if (!empty($missingcode)) {
            $this->passArgument('missingcode', ['config' => []]);
            $this->passArgument('missingcode.config', $missingcode);
            $this->includeJs('js/data_entry_action_tag_missingcode.js');
        }
        if (!empty($fuzzy)) {
            $this->passArgument('fuzzy', $fuzzy);
            $this->includeJs('js/lib/fuse.min.js');
            $this->includeJs('js/data_entry_action_tag_fuzzy.js');
        }
    }

    private function getEventIdFromName($project_id, $eventName)
    {
        $sql = "SELECT event_id, descrip FROM redcap_events_metadata WHERE event_id IN 
                (SELECT DISTINCT event_id FROM redcap_data WHERE project_id = $project_id);";
        $eventName = explode('_arm_', $eventName)[0];
        $results = db_query($sql);
        $out = false;
        if (!$results || !db_num_rows($results))
            return $out;
        while ($row = db_fetch_assoc($results)) {
            $tmp = strtolower($row['descrip']);
            $tmp = preg_replace('/[^a-z\d\s:]*/', '', $tmp);
            $tmp = str_replace(' ', '_', $tmp);
            if ($tmp == $eventName) {
                $out = $row['event_id'];
            }
        }
        return $out;
    }

    private function getNextRecordID()
    {
        return end(array_keys(REDCap::getData('array', NULL, REDCap::getRecordIdField()))) + 1;
    }

    private function initModule()
    {
        $this->initializeJavascriptModuleObject();
        echo "<script>var " . $this->module_global . " = " . json_encode(["prefix" => $this->getPrefix()]) . ";</script>";
        echo "<script>" . $this->module_global . ".ajax = " . $this->getJavascriptModuleObjectName() . ".ajax;</script>";
    }

    private function includeJs($path)
    {
        echo '<script src="' . $this->getUrl($path) . '"></script>';
    }

    private function passArgument($name, $value)
    {
        echo "<script>" . $this->module_global . "." . $name . " = " . json_encode($value) . ";</script>";
    }
}
