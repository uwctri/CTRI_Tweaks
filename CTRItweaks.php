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
    public function redcap_every_page_top($project_id)
    {
        if (!defined("USERID"))
            return;

        try {
            $this->initModule();
        } catch (\Exception $e) {
            // Bail out if we can't initialize the module,
            // common due to 2fa
            return;
        }

        $record = $_GET["id"];
        $report_id = $_GET["report_id"];

        // Custom Config page
        if ($this->isPage("ExternalModules/manager/project.php") && $project_id)
            $this->includeJs("js/config.js");

        // Add / Edit Records Page
        if ($this->isPage("DataEntry/record_home.php") && is_null($record))
            $this->setUIstate($project_id);

        // Record Status Dashboard
        if ($this->isPage("DataEntry/record_status_dashboard.php") && is_null($record))
            $this->setUIstate($project_id);

        // Project Home/Setup Page
        if ($this->isPage("ProjectSetup/index.php") || $this->isPage("index.php"))
            $this->setUIstate($project_id);

        // View Report Page
        if (($this->isPage("DataExport/index.php") && $project_id && $report_id && !$_GET["addedit"] && !$_GET["stats_charts"])) {

            // Check printing report
            $reports = array_map("trim", explode(',', $this->getProjectSetting('check-report') ?? ""));
            if (in_array($_GET["report_id"], $reports)) {
                $this->includeJs("js/lib/pdfmake.min.js");
                $this->includeJs("js/lib/vfs_fonts.js");
                $this->loadPaymentConfig(null, $report_id);
            }
        }

        // Skip Data Entry Form
        if (!($this->isPage("DataEntry/index.php") && $_GET["id"] && $_GET["page"]))
            $this->includeJs("js/bundle.js");
    }

    public function redcap_data_entry_form($project_id, $record, $instrument)
    {
        // Payment load
        if ($instrument == "payment") {
            $this->includeJs("js/lib/pdfmake.min.js");
            $this->includeJs("js/lib/vfs_fonts.js");
            $this->loadPaymentConfig($record);
        }

        $this->afterLoadActionTags($instrument);
        $this->includeJs("js/bundle.js");
    }

    public function redcap_data_entry_form_top($project_id, $record, $instrument, $event_id)
    {
        $this->beforeLoadActionTags($instrument);
    }

    public function redcap_survey_page($project_id, $record, $instrument, $event_id)
    {
        $this->afterLoadActionTags($instrument);
    }

    public function redcap_survey_page_top($project_id, $record, $instrument, $event_id)
    {
        $this->beforeLoadActionTags($instrument);
    }

    public function redcap_module_ajax($action, $payload, $project_id)
    {
        if ($action == "deploy_payment") {
            $this->deployPaymentInstrument($project_id);
            return true;
        }
        if ($action == "bulk_payment") {
            return $this->bulkPaymentPrint($project_id, $payload["report"], $payload["write"]);
        }
        return false;
    }

    private function loadPaymentConfig($record, $report = null)
    {
        $generalData = [];
        $dataConfig = [
            "name" => ["name", "display_name", "full_name", "fullname"],
            "street1" => ["street1", "address1", "street", "address"],
            "street2" => ["street2", "address2"],
            "city" => ["city"],
            "state" => ["state"],
            "zip" => ["zip"],
            "record" => [REDCap::getRecordIdField()]
        ];
        $data = REDCap::getData("array", $record, array_merge(...array_values($dataConfig)));
        foreach ($data as $record_id => $record_data) {
            foreach ($record_data as $event_id => $event_data) {
                if ($event_id == "repeat_instances") continue;
                foreach ($event_data as $field => $val) {
                    if ($val == "") continue;
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

        // Static settings
        $seed = null;
        $eventMap = null;
        if ($report) {
            $reports = array_map("trim", explode(",", $this->getProjectSetting("check-report")));
            $index = array_search($report, $reports);
            $seed = array_map("trim", explode(",", $this->getProjectSetting("check-number")))[$index];
            $seed = strtolower($seed) == "global" ? $this->getSystemSetting("check-number") : $seed;
            $eventMap = array_flip(REDCap::getEventNames(false));
        }

        // Grab signature
        $sigFile = $this->getProjectSetting("file-signature");
        $sig64 = "";
        if ($sigFile) {
            list($mimeType, $docName, $fileContent) = REDCap::getFile($sigFile);
            $sig64 = "data:$mimeType;base64," . base64_encode($fileContent);
        }

        // Pass everything down to JS
        $this->passArgument([
            "paymentData" => $generalData,
            "showLogo" => $this->getProjectSetting("show-logo") == "1",
            "showVoid" => $this->getProjectSetting("show-void") == "1",
            "study"  => $this->getProjectSetting("study-name"),
            "signature" => $sig64,
            "seed" => $seed,
            "eventMap" => $eventMap
        ]);
        $this->includeJs("js/payment_images.js");
        $this->includeJs("js/payment.js");
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
        $event = db_fetch_assoc($result)["event_id"];

        // Grab the seed values
        $reports = array_map("trim", explode(",", $this->getProjectSetting("check-report")));
        $index = array_search($report_id, $reports);
        $seeds = array_map("trim", explode(",", $this->getProjectSetting("check-number")));

        foreach ($data as $row) {
            $write[$row["record"]]["repeat_instances"][$event][$instrument][$row["instance"]] = [
                "check_number" => $row["check"],
                "check_printed" => "1",
                "check_date" => date("Y-m-d")
            ];
            $new_seed = $row["check"];
        }

        if (strtolower($seeds["index"]) == "global") {
            $this->setSystemSetting("check-number", $new_seed);
        } else {
            $seeds[$index] = $new_seed;
            $this->setProjectSetting("check-number", implode(",", $seeds), $project_id);
        }

        return REDCap::saveData($project_id, "array", $write);
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
        $sql_errors = MetaData::save_metadata($dd, true, false, $project_id);
        db_query(count($sql_errors) > 0 ? "ROLLBACK" : "COMMIT");
        db_query("SET AUTOCOMMIT=1");
    }

    private function setUIstate($project_id)
    {
        if ($this->getProjectSetting('force-save-next-form')) {
            if (!empty(USERID) && (UIState::getUIStateValue($project_id, 'form', 'submit-btn') != 'savenextform'))
                UIState::saveUIStateValue($project_id, 'form', 'submit-btn', 'savenextform');
        }
    }

    private function beforeLoadActionTags($instrument)
    {
        // Action tags that don't touch JS
        global $Proj;
        $fields = REDCap::getFieldNames($instrument);
        $targetPid = $this->getProjectSetting("cross-project-pipe");
        foreach ($fields as $field_name) {
            $info = $Proj->metadata[$field_name];
            //@LABEL="[foo]"
            if (strpos($info["misc"], "@LABEL=") !== false) {
                $target = trim(explode(" ", explode("@LABEL=", $info["misc"])[1])[0], ' []"');
                if ($Proj->metadata[$target])
                    $Proj->metadata[$field_name]["element_label"] = $Proj->metadata[$target]["element_label"];
            }
            //@CROSSPP
            if (strpos($info["misc"], "@CROSSPP") !== false && !empty($targetPid)) {
                $this->pipeCrossPP($field_name, $targetPid);
            }
        }
    }

    private function pipeCrossPP($field, $targetPid)
    {
        global $Proj;
        $label = $Proj->metadata[$field]["element_label"];
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

    private function afterLoadActionTags($instrument)
    {
        // Action tags that are JS based
        global $Proj;
        $jsonNotes = [];
        $markAll = [];
        $readonly2 = [];
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
                    $jsonData = is_null($data) || !is_array($data['repeat_instances'][$_GET['event_id']]) ? $data[$_GET['event_id']][$field_name] : end(end($data['repeat_instances'][$_GET['event_id']]))[$field_name];
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
        $this->passArgument([
            "@JSONNOTES" => $jsonNotes,
            "@MARKALL" => $markAll,
            "@READONLY2" => $readonly2,
            "@DEFAULT2" => $default2,
            "@MISSINGCODE" => $missingcode,
            "@FUZZY" => $fuzzy
        ]);

        if (!empty($fuzzy)) {
            $this->includeJs('js/lib/fuse.min.js');
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
        return intval(end(array_keys(REDCap::getData('array', NULL, REDCap::getRecordIdField())))) + 1;
    }

    private function initModule()
    {
        $this->initializeJavascriptModuleObject();
        $obj = $this->getJavascriptModuleObjectName();
        $settings = [
            "project_settings" => $this->getProjectSettings(),
            "prefix" => $this->getPrefix(),
            'next_record_id' => $this->getProjectSetting("stop-dag-rename") == "1" ? $this->getNextRecordID() : "",
        ];
        echo "<script> Object.assign($obj, " . json_encode($settings) . ");</script>";
    }

    private function includeJs($path)
    {
        echo '<script src="' . $this->getUrl($path) . '"></script>' . "\n";
    }

    private function passArgument($arr)
    {
        $obj = $this->getJavascriptModuleObjectName();
        echo "<script> Object.assign($obj, " . json_encode($arr) . ");</script>";
    }
}
