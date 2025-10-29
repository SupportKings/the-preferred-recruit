<page pageID="school_lead_listsDetails" type="Details" tableName="school_lead_lists" pageTitle="School Lead List Detail" mainFieldIDs="name,athlete_id.full_name">

 <pageSection type="fields">

  <!-- Use process-oriented subsections with ≥3 fields each; merge if fewer -->

  <subSection displayName="List Identity">

   <!-- Include ALL non-audit fields (do NOT comment-out in Details) -->

   <field id="athlete_id" displayName="Athlete" tooltip="Athlete who owns this lead list.">

    <lookup>

     <ref table="athletes" fieldID="full_name"/>

     <ref table="athletes" fieldID="contact_email"/>

     <ref table="athletes" fieldID="graduation_year"/>

    </lookup>

   </field>

   <field id="name" displayName="List Name" tooltip="A clear, human-friendly name for this list (e.g., Fall 2025 D2 Targets)."/>

   <field id="priority" displayName="Priority" tooltip="Relative priority for this list (used for ordering and dashboards)."/>

  </subSection>



  <subSection displayName="Tagging & Notes">

   <field id="type" displayName="List Type" tooltip="Free-text descriptor for how this list is segmented (e.g., High Academic, Midwest)."/>

   <field id="internal_notes" displayName="Internal Notes" tooltip="Private notes about this lead list."/>

  </subSection>



  <!-- There are no additional fields -->

 </pageSection>



 <!-- One child tab per direct 1→many related table -->



 <pageSection type="child_tab" name="Entries (Universities/Programs)">

  <component type="ListView" tableName="school_lead_list_entries" createButton="VISIBLE" editType="DETAILS">

   <field id="university_id" displayName="University" enableInlineEdit="FALSE" tooltip="University included on this list.">

    <lookup>

     <ref table="universities" fieldID="name"/>

     <ref table="universities" fieldID="city"/>

     <!-- <ref table="universities" fieldID="region"/> -->

    </lookup>

   </field>

   <field id="program_id" displayName="Program" enableInlineEdit="FALSE" tooltip="Specific program (men/women), if applicable.">

    <lookup>

     <ref table="programs" fieldID="gender"/>

    </lookup>

   </field>

   <field id="status" displayName="Status" enableInlineEdit="TRUE" tooltip="Include/exclude or custom status for this entry."/>

   <field id="added_at" displayName="Added At" enableInlineEdit="FALSE" tooltip="When this entry was added."/>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Notes specific to this entry."/>

  </component>



  <page type="CreateForm" table="school_lead_list_entries">

   <field id="school_lead_list_id" prefilledFromParent="true" displayName="Lead List" tooltip="Prefilled link back to this lead list.">

    <lookup>

     <ref table="school_lead_lists" fieldID="name"/>

     <ref table="athletes" fieldID="full_name"/>

     <!-- <ref table="school_lead_lists" fieldID="season_label"/> -->

    </lookup>

   </field>

   <field name="university_id" displayName="University" tooltip="Select the university to add.">

    <lookup>

     <ref table="universities" field="[name]"/>

     <ref table="universities" field="[city]"/>

    </lookup>

   </field>

   <field name="program_id" displayName="Program" tooltip="Optional: select a specific program (men/women).">

    <lookup>

     <ref table="programs" field="[gender]"/>

    </lookup>

   </field>

   <field name="status" displayName="Status" tooltip="Set include/exclude or custom value."/>

   <field name="internal_notes" displayName="Internal Notes" tooltip="Notes for this entry."/>

  </page>



  <component type="EditModal" table="school_lead_list_entries">

   <field name="status" displayName="Status" tooltip="Update include/exclude or custom value."/>

   <field name="internal_notes" displayName="Internal Notes" tooltip="Notes for this entry."/>

   <field name="program_id" displayName="Program" tooltip="Specific program, if applicable.">

    <lookup>

     <ref table="programs" field="[gender]"/>

     <ref table="programs" field="[team_url]"/>

    </lookup>

   </field>

  </component>

 </pageSection>



 <pageSection type="child_tab" name="Campaigns (Using This List)">

  <component type="ListView" tableName="campaigns" createButton="VISIBLE" editType="DETAILS">

   <field id="name" displayName="Campaign Name" enableInlineEdit="FALSE" tooltip="Campaign title."/>

   <field id="type" displayName="Type" enableInlineEdit="TRUE" tooltip="Campaign wave/strategy (top, second_pass, third_pass, personal_best)."/>

   <field id="status" displayName="Status" enableInlineEdit="TRUE" tooltip="Draft, active, paused, completed, or exhausted."/>

   <field id="start_date" displayName="Start Date" enableInlineEdit="FALSE" tooltip="When the campaign began."/>

   <field id="end_date" displayName="End Date" enableInlineEdit="FALSE" tooltip="When the campaign ended (if applicable)."/>

   <field id="daily_send_cap" displayName="Daily Send Cap" enableInlineEdit="FALSE" tooltip="Max messages per day for this campaign."/>

   <field id="sending_tool_campaign_url" displayName="Sending Tool Link" enableInlineEdit="FALSE" tooltip="Link to the campaign in the sending tool (if any)."/>

  </component>



  <page type="CreateForm" table="campaigns">

   <field id="primary_lead_list_id" prefilledFromParent="true" displayName="Primary Lead List" tooltip="Prefilled to this lead list.">

    <lookup>

     <ref table="school_lead_lists" fieldID="name"/>

     <ref table="athletes" fieldID="full_name"/>

    </lookup>

   </field>

   <field name="athlete_id" displayName="Athlete" tooltip="Athlete this campaign is for.">

    <lookup>

     <ref table="athletes" field="[full_name]"/>

    </lookup>

   </field>

   <field name="name" displayName="Campaign Name" tooltip="Give the campaign a clear, descriptive name."/>

   <field name="type" displayName="Type" tooltip="Select the campaign strategy (top, second_pass, third_pass, personal_best)."/>

   <field name="status" displayName="Status" tooltip="Initial campaign status."/>

   <field name="daily_send_cap" displayName="Daily Send Cap" tooltip="Max messages per day."/>

   <field name="start_date" displayName="Start Date" tooltip="When this campaign should start."/>

   <field name="end_date" displayName="End Date" tooltip="When this campaign should end (optional)."/>

   <field name="internal_notes" displayName="Internal Notes" tooltip="Private notes about this campaign."/>

  </page>

 </pageSection>



 <pageSection type="child_tab" name="Campaign Leads (Sourced From This List)">

  <component type="ListView" tableName="campaign_leads" createButton="HIDDEN" editType="DETAILS">

   <field id="campaign_id" displayName="Campaign" enableInlineEdit="FALSE" tooltip="Campaign this lead belongs to.">

    <lookup>

     <ref table="campaigns" fieldID="name"/>

     <ref table="campaigns" fieldID="type"/>

     <!-- <ref table="campaigns" fieldID="status"/> -->

    </lookup>

   </field>

   <field id="university_id" displayName="University" enableInlineEdit="FALSE" tooltip="Target university.">

    <lookup>

     <ref table="universities" fieldID="name"/>

     <ref table="universities" fieldID="city"/>

    </lookup>

   </field>

   <field id="program_id" displayName="Program" enableInlineEdit="FALSE" tooltip="Target program (men/women).">

    <lookup>

     <ref table="programs" fieldID="gender"/>

     <ref table="programs" fieldID="team_url"/>

    </lookup>

   </field>

   <field id="university_job_id" displayName="Coach" enableInlineEdit="FALSE" tooltip="Specific coach role, if targeted.">

    <lookup>

     <ref table="university_jobs" fieldID="job_title"/>

     <ref table="university_jobs" fieldID="work_email"/>

     <!-- <ref table="university_jobs" fieldID="program_scope"/> -->

    </lookup>

   </field>

   <field id="status" displayName="Lead Status" enableInlineEdit="TRUE" tooltip="Pending, replied, or suppressed."/>

   <field id="first_reply_at" displayName="First Reply At" enableInlineEdit="FALSE" tooltip="Timestamp of first coach reply, if any."/>

   <field id="include_reason" displayName="Include Reason" enableInlineEdit="FALSE" tooltip="Why this lead was included."/>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Private notes about this lead."/>

  </component>

 </pageSection>



 <pageSection type="child_tab" name="Applications (Originated From This List)">

  <component type="ListView" tableName="athlete_applications" createButton="HIDDEN" editType="DETAILS">

   <field id="athlete_id" displayName="Athlete" enableInlineEdit="FALSE" tooltip="Applicant athlete.">

    <lookup>

     <ref table="athletes" fieldID="full_name"/>

     <ref table="athletes" fieldID="contact_email"/>

    </lookup>

   </field>

   <field id="university_id" displayName="University" enableInlineEdit="FALSE" tooltip="Target university.">

    <lookup>

     <ref table="universities" fieldID="name"/>

     <ref table="universities" fieldID="city"/>

    </lookup>

   </field>

   <field id="program_id" displayName="Program" enableInlineEdit="FALSE" tooltip="Target program (men/women).">

    <lookup>

     <ref table="programs" fieldID="gender"/>

     <ref table="programs" fieldID="team_url"/>

    </lookup>

   </field>

   <field id="stage" displayName="Stage" enableInlineEdit="TRUE" tooltip="Current application stage."/>

   <field id="start_date" displayName="Start Date" enableInlineEdit="FALSE" tooltip="When the application started."/>

   <field id="offer_date" displayName="Offer Date" enableInlineEdit="FALSE" tooltip="When an offer was made."/>

   <field id="commitment_date" displayName="Commitment Date" enableInlineEdit="FALSE" tooltip="When the athlete committed."/>

   <field id="scholarship_amount_per_year" displayName="Scholarship/Year (USD)" enableInlineEdit="FALSE" tooltip="Dollar value per year."/>

   <field id="scholarship_percent" displayName="Scholarship %" enableInlineEdit="FALSE" tooltip="Percentage offered."/>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Private notes for this application."/>

  </component>



 </pageSection>

</page>



