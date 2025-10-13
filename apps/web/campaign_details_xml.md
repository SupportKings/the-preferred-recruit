<page pageID="campaignsDetails" type="Details" tableName="campaigns" pageTitle="Campaign Detail" mainFieldIDs="name,athlete_id.full_name">

 <pageSection type="fields">

  <!-- Use process-oriented subsections with ≥3 fields each; merge if fewer -->

  <subSection displayName="Ownership & Setup">

   <!-- Include ALL non-audit fields (do NOT comment-out in Details) -->

   <field id="athlete_id" displayName="Athlete" tooltip="Athlete this campaign is for.">

    <lookup>

     <ref table="athletes" fieldID="full_name"/>

     <ref table="athletes" fieldID="graduation_year"/>

    </lookup>

   </field>

   <field id="name" displayName="Campaign Name" tooltip="Clear, descriptive campaign title."/>

   <field id="type" displayName="Campaign Type" tooltip="Wave/strategy: top, second_pass, third_pass, personal_best."/>

   <field id="status" displayName="Status" tooltip="Draft, active, paused, completed, or exhausted."/>

   <field id="primary_lead_list_id" displayName="Primary Lead List" tooltip="Seed list used to generate leads for this campaign.">

    <lookup>

     <ref table="school_lead_lists" fieldID="name"/>

     <ref table="school_lead_lists" fieldID="priority"/>

    </lookup>

   </field>

   <field id="seed_campaign_id" displayName="Seed Campaign" tooltip="If cloned, the original source campaign.">

    <lookup>

     <ref table="campaigns" fieldID="name"/>

     <ref table="campaigns" fieldID="type"/>

    </lookup>

   </field>

  </subSection>



  <subSection displayName="Schedule & Sending">

   <field id="start_date" displayName="Start Date" tooltip="When this campaign begins."/>

   <field id="end_date" displayName="End Date" tooltip="When this campaign ends (optional)."/>

   <field id="daily_send_cap" displayName="Daily Send Cap" tooltip="Maximum messages per day."/>

   <field id="sending_tool_campaign_url" displayName="Sending Tool Link" tooltip="Link to the campaign in your sending tool."/>

  </subSection>



  <subSection displayName="Metrics & Notes">

   <field id="leads_total" displayName="Leads (Total)" tooltip="Planned total leads for this campaign."/>

   <field id="leads_loaded" displayName="Leads Loaded" tooltip="Leads currently loaded into the sender."/>

   <field id="leads_remaining" displayName="Leads Remaining" tooltip="Leads not yet loaded/sent."/>

   <field id="internal_notes" displayName="Internal Notes" tooltip="Private notes about this campaign."/>

  </subSection>



  <!-- There are no additional fields -->

 </pageSection>



 <!-- One child tab per direct 1→many related table -->



 <pageSection type="child_tab" name="Campaign Leads">

  <component type="ListView" tableName="campaign_leads" createButton="VISIBLE" editType="DETAILS">

   <field id="include_reason" displayName="Include Reason" enableInlineEdit="FALSE" tooltip="Why this lead was included."/>

   <field id="university_job_id" displayName="Coach" enableInlineEdit="FALSE" tooltip="Specific coach role targeted (if any).">

    <lookup>

     <ref table="university_jobs" fieldID="job_title"/>

     <ref table="universities" fieldID="name"/>

    </lookup>

   </field>

   <field id="status" displayName="Lead Status" enableInlineEdit="TRUE" tooltip="Pending, replied, or suppressed."/>

   <field id="first_reply_at" displayName="First Reply At" enableInlineEdit="FALSE" tooltip="Timestamp of first coach reply, if any."/>

   <field id="application_id" displayName="Linked Application" enableInlineEdit="FALSE" tooltip="Application created from this lead (if applicable).">

    <lookup>

     <ref table="athlete_applications" fieldID="stage"/>

     <ref table="athlete_applications" fieldID="last_interaction_at"/>

     <ref table="athlete_applications" fieldID="scholarship_percent"/>

    </lookup>

   </field>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Private notes about this lead."/>

  </component>



  <page type="CreateForm" table="campaign_leads">

   <field id="campaign_id" prefilledFromParent="true" displayName="Campaign" tooltip="Prefilled link back to this campaign.">

    <lookup>

     <ref table="campaigns" fieldID="name"/>

     <ref table="campaigns" fieldID="type"/>

    </lookup>

   </field>

   <field name="source_lead_list_id" displayName="Source Lead List" tooltip="Lead list that sourced this lead (optional).">

    <lookup>

     <ref table="school_lead_lists" field="[name]"/>

     <ref table="school_lead_lists" field="[priority]"/>

    </lookup>

   </field>

   <field name="university_job_id" displayName="Coach/Job" tooltip="Specific coach role targeted (optional).">

    <lookup>

     <ref table="university_jobs" field="[job_title]"/>

     <ref table="university_jobs" field="[work_email]"/>

    </lookup>

   </field>

   <field name="include_reason" displayName="Include Reason" tooltip="Why this lead is included."/>

   <field name="status" displayName="Lead Status" tooltip="Initial status (pending, replied, suppressed)."/>

   <field name="internal_notes" displayName="Internal Notes" tooltip="Private notes about this lead."/>

  </page>



  <component type="EditModal" table="campaign_leads">

   <field name="status" displayName="Lead Status" tooltip="Pending, replied, or suppressed."/>

   <field name="include_reason" displayName="Include Reason" tooltip="Why this lead was included."/>

   <field name="internal_notes" displayName="Internal Notes" tooltip="Private notes about this lead."/>

   <field name="university_job_id" displayName="Coach/Job" tooltip="Specific coach role targeted.">

    <lookup>

     <ref table="university_jobs" field="[job_title]"/>

     <ref table="university_jobs" field="[work_email]"/>

    </lookup>

   </field>

  </component>

 </pageSection>



 <pageSection type="child_tab" name="Sending Tool Files">

  <component type="ListView" tableName="sending_tool_lead_lists" createButton="VISIBLE" editType="DETAILS">

   <field id="format" displayName="Format" enableInlineEdit="FALSE" tooltip="Export format (e.g., CSV)."/>

   <field id="row_count" displayName="Row Count" enableInlineEdit="FALSE" tooltip="Number of rows in the generated file."/>

   <field id="file_url" displayName="File URL" enableInlineEdit="FALSE" tooltip="Download link to the generated file."/>

   <field id="generated_by" displayName="Generated By" enableInlineEdit="FALSE" tooltip="Tool or user who generated the file."/>

   <field id="generated_at" displayName="Generated At" enableInlineEdit="FALSE" tooltip="When the file was generated."/>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Notes about this export batch."/>

  </component>



  <page type="CreateForm" table="sending_tool_lead_lists">

   <field id="campaign_id" prefilledFromParent="true" displayName="Campaign" tooltip="Prefilled link back to this campaign.">

    <lookup>

     <ref table="campaigns" fieldID="name"/>

     <ref table="campaigns" fieldID="type"/>

    </lookup>

   </field>

   <field name="format" displayName="Format" tooltip="Export format (CSV recommended)."/>

   <field name="file_url" displayName="File URL" tooltip="Storage link (e.g., Drive, S3)."/>

   <field name="row_count" displayName="Row Count" tooltip="How many rows are in the file."/>

   <field name="generated_by" displayName="Generated By" tooltip="Tool or user who generated the file."/>

   <field name="generated_at" displayName="Generated At" tooltip="Timestamp when generated."/>

   <field name="internal_notes" displayName="Internal Notes" tooltip="Notes about this export batch."/>

  </page>

 </pageSection>



 <pageSection type="child_tab" name="Replies">

  <component type="ListView" tableName="replies" createButton="VISIBLE" editType="DETAILS">

   <field id="type" displayName="Reply Type" enableInlineEdit="TRUE" tooltip="Call, text, email, or Instagram."/>

   <field id="occurred_at" displayName="Occurred At" enableInlineEdit="FALSE" tooltip="When the reply occurred."/>

   <field id="summary" displayName="Summary" enableInlineEdit="FALSE" tooltip="Short description of the reply."/>

   <field id="university_job_id" displayName="Coach/Job" enableInlineEdit="FALSE" tooltip="Specific coach role associated with this reply.">

    <lookup>

     <ref table="university_jobs" fieldID="job_title"/>

     <ref table="coaches" fieldID="full_name"/>

    </lookup>

   </field>

   <field id="application_id" displayName="Application" enableInlineEdit="FALSE" tooltip="Related athlete application, if any.">

    <lookup>

     <ref table="athlete_applications" fieldID="stage"/>

     <ref table="athlete_applications" fieldID="last_interaction_at"/>

    </lookup>

   </field>

   <field id="athlete_id" displayName="Athlete" enableInlineEdit="FALSE" tooltip="Athlete tied to this reply (if applicable).">

    <lookup>

     <ref table="athletes" fieldID="full_name"/>

     <ref table="athletes" fieldID="contact_email"/>

    </lookup>

   </field>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Private notes about this reply."/>

  </component>



  <page type="CreateForm" table="replies">

   <field id="campaign_id" prefilledFromParent="true" displayName="Campaign" tooltip="Prefilled link back to this campaign.">

    <lookup>

     <ref table="campaigns" fieldID="name"/>

     <ref table="campaigns" fieldID="type"/>

    </lookup>

   </field>

   <field name="type" displayName="Reply Type" tooltip="Call, text, email, or Instagram DM."/>

   <field name="occurred_at" displayName="Occurred At" tooltip="When the reply occurred."/>

   <field name="summary" displayName="Summary" tooltip="Brief summary of the reply."/>

   <field name="university_job_id" displayName="Coach/Job" tooltip="Specific coach role associated with this reply.">

    <lookup>

     <ref table="university_jobs" field="[job_title]"/>

     <ref table="coaches" field="[full_name]"/>

    </lookup>

   </field>

   <field name="application_id" displayName="Application" tooltip="Related athlete application, if any.">

    <lookup>

     <ref table="athlete_applications" field="[stage]"/>

     <ref table="athlete_applications" field="[last_interaction_at]"/>

    </lookup>

   </field>

   <field name="athlete_id" displayName="Athlete" tooltip="Athlete tied to this reply (if applicable).">

    <lookup>

     <ref table="athletes" field="[full_name]"/>

    </lookup>

   </field>

   <field name="internal_notes" displayName="Internal Notes" tooltip="Private notes about this reply."/>

  </page>



  <component type="EditModal" table="replies">

   <field name="type" displayName="Reply Type" tooltip="Call, text, email, or Instagram DM."/>

   <field name="occurred_at" displayName="Occurred At" tooltip="When the reply occurred."/>

   <field name="summary" displayName="Summary" tooltip="Brief summary of the reply."/>

   <field name="internal_notes" displayName="Internal Notes" tooltip="Private notes about this reply."/>

  </component>

 </pageSection>



 <pageSection type="child_tab" name="Derived Campaigns">

  <component type="ListView" tableName="campaigns" createButton="HIDDEN" editType="DETAILS">

   <field id="name" displayName="Campaign Name" enableInlineEdit="FALSE" tooltip="Derived campaign title."/>

   <field id="type" displayName="Type" enableInlineEdit="TRUE" tooltip="Wave/strategy (top, second_pass, third_pass, personal_best)."/>

   <field id="status" displayName="Status" enableInlineEdit="TRUE" tooltip="Draft, active, paused, completed, or exhausted."/>

   <field id="start_date" displayName="Start Date" enableInlineEdit="FALSE" tooltip="When the derived campaign began."/>

   <field id="end_date" displayName="End Date" enableInlineEdit="FALSE" tooltip="When it ended (if applicable)."/>

   <field id="primary_lead_list_id" displayName="Primary Lead List" enableInlineEdit="FALSE" tooltip="Seed list for the derived campaign.">

    <lookup>

     <ref table="school_lead_lists" fieldID="name"/>

     <ref table="school_lead_lists" fieldID="priority"/>

    </lookup>

   </field>

  </component>

  <!-- Note: This tab is intended to show campaigns where seed_campaign_id = current.id -->

 </pageSection>

</page>