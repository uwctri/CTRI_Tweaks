<?php

namespace UWMadison\CTRItweaks;

use ExternalModules\AbstractExternalModule;
use REDCap;
use UIState;

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

        // Add / Edit Records Page
        if ($this->isPage("DataEntry/record_home.php") && is_null($record))
            $this->setUIstate($project_id);

        // Record Status Dashboard
        if ($this->isPage("DataEntry/record_status_dashboard.php") && is_null($record))
            $this->setUIstate($project_id);

        // Project Home/Setup Page
        if ($this->isPage("ProjectSetup/index.php") || $this->isPage("index.php"))
            $this->setUIstate($project_id);

        // Skip Data Entry Form
        if (!($this->isPage("DataEntry/index.php") && $_GET["id"] && $_GET["page"]))
            $this->includeJs("js/bundle.js");
    }

    public function redcap_data_entry_form($project_id, $record, $instrument)
    {
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
            $recordEvents = !empty($data[$record]) ? end($data[$record]) : [];
            $data = is_array($recordEvents) ? end($recordEvents) : $recordEvents;
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
                    if (is_null($data) || !is_array($data['repeat_instances'][$_GET['event_id']])) {
                        $jsonData = $data[$_GET['event_id']][$field_name];
                    } else {
                        $repeatInstances = end($data['repeat_instances'][$_GET['event_id']]);
                        $lastInstance = is_array($repeatInstances) ? end($repeatInstances) : [];
                        $jsonData = $lastInstance[$field_name];
                    }
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
                    if (!is_null($target['repeat_instances']) && is_array($target['repeat_instances'][$event])) {
                        $repeatInstances = end($target['repeat_instances'][$event]);
                        $lastInstance = is_array($repeatInstances) ? end($repeatInstances) : [];
                        $target = $lastInstance[$field];
                    } else {
                        $target = $target[$event][$field];
                    }
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
            $this->includeJs('js/fuse.min.js');
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
        $keys = array_keys(REDCap::getData('array', NULL, REDCap::getRecordIdField()));
        return intval(end($keys)) + 1;
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
