<?php

namespace UWMadison\CTRItweaks;
use ExternalModules\AbstractExternalModule;
use ExternalModules\ExternalModules;

class CTRItweaks extends AbstractExternalModule {
    
    public function __construct() {
            parent::__construct();
    }
    
    public function redcap_every_page_top($project_id) {
		
		if ( $this->getProjectSetting('hide-repeat-vars') ) {
			// Check to see if we are on the right page, and that its not the edit report page
			if (PAGE != 'DataExport/index.php' || $project_id == NULL || $_GET['addedit']) 
				return;
			// Check if the report ID is listed in the settings
			$id_list = array_map('trim',explode(',',$this->getProjectSetting('report-id-list')[0]));
			if (!in_array($_GET['report_id'],$id_list))
				return;
			$this->includeJs('js/hide_repeat_variables.js');
		}
    }
	
	public function redcap_data_entry_form() {
		if ( $this->getProjectSetting('prevent-enter-submit') )
			$this->includeJs('js/prevent_enter_submission.js');
		if ( $this->getProjectSetting('hide-save-next-record') )
			$this->includeJs('js/hide_save_next_record.js');
	}
    
    private function includeJs($path) {
        echo '<script src="' . $this->getUrl($path) . '"></script>';
    }
}

?>