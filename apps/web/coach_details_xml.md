<page pageID="coachesDetails" type="Details" tableName="coaches" pageTitle="Coach Detail" mainFieldIDs="full_name,primary_specialty">

 <pageSection type="fields">

  <!-- Use process-oriented subsections with ≥3 fields each; merge if fewer -->

  <subSection displayName="Identity & Role">

   <field id="full_name" displayName="Full Name" tooltip="Coach’s full name."/>

   <field id="primary_specialty" displayName="Primary Specialty" tooltip="Primary event group this coach specializes in (e.g., sprints, distance)."/>

   <field id="internal_notes" displayName="Internal Notes" tooltip="Private notes about the coach."/>

  </subSection>



  <subSection displayName="Contact & Social">

   <field id="email" displayName="Email" tooltip="Personal email for the coach."/>

   <field id="phone" displayName="Phone" tooltip="Personal phone number for the coach."/>

   <field id="twitter_profile" displayName="Twitter Profile" tooltip="Link to the coach’s Twitter/X profile."/>

   <field id="linkedin_profile" displayName="LinkedIn Profile" tooltip="Link to the coach’s LinkedIn profile."/>

   <field id="instagram_profile" displayName="Instagram Profile" tooltip="Link to the coach’s Instagram profile."/>

  </subSection>



  <!-- There are no additional fields -->

 </pageSection>



 <!-- One child tab per direct 1→many related table -->



 <pageSection type="child_tab" name="University Jobs">

  <component type="ListView" tableName="university_jobs" createButton="VISIBLE" editType="DETAILS">

   <field id="job_title" displayName="Job Title" enableInlineEdit="TRUE" tooltip="Role title for this position (e.g., Assistant Coach, Head Coach)."/>

   <field id="university_id" displayName="University" enableInlineEdit="FALSE" tooltip="University employing the coach in this role.">

    <lookup>

     <ref table="universities" fieldID="name"/>

     <ref table="universities" fieldID="city"/>

     <ref table="universities" fieldID="region"/>

    </lookup>

   </field>

   <field id="program_id" displayName="Program" enableInlineEdit="FALSE" tooltip="Men’s/Women’s program for this role.">

    <lookup>

     <ref table="programs" fieldID="gender"/>

    </lookup>

   </field>

   <field id="program_scope" displayName="Program Scope" enableInlineEdit="TRUE" tooltip="Scope of responsibility (men, women, both, n/a)."/>

   <field id="work_email" displayName="Work Email" enableInlineEdit="TRUE" tooltip="Email used for this role."/>

   <field id="work_phone" displayName="Work Phone" enableInlineEdit="TRUE" tooltip="Phone number used for this role."/>

   <field id="start_date" displayName="Start Date" enableInlineEdit="FALSE" tooltip="When this job started."/>

   <field id="end_date" displayName="End Date" enableInlineEdit="FALSE" tooltip="When this job ended, if applicable."/>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Notes specific to this job/role."/>

  </component>



  <page type="CreateForm" table="university_jobs">

   <field id="coach_id" prefilledFromParent="true" displayName="Coach" tooltip="Prefilled link back to this coach.">

    <lookup>

     <ref table="coaches" fieldID="full_name"/>

    </lookup>

   </field>

   <field name="job_title" displayName="Job Title" tooltip="Role title for this position."/>

   <field name="university_id" displayName="University" tooltip="Select the employing university.">

    <lookup>

     <ref table="universities" field="[name]"/>

     <ref table="universities" field="[city]"/>

     <ref table="universities" field="[region]"/>

    </lookup>

   </field>

   <field name="program_id" displayName="Program" tooltip="Choose the specific program (men/women).">

    <lookup>

     <ref table="programs" field="[gender]"/>

     <ref table="programs" field="[team_url]"/>

     <!-- <ref table="programs" field="[team_instagram]"/> -->

    </lookup>

   </field>

   <field name="program_scope" displayName="Program Scope" tooltip="Scope of responsibility (men, women, both, n/a)."/>

   <field name="work_email" displayName="Work Email" tooltip="Email used for this role."/>

   <field name="work_phone" displayName="Work Phone" tooltip="Phone number used for this role."/>

   <field name="start_date" displayName="Start Date" tooltip="When this job starts."/>

   <field name="end_date" displayName="End Date" tooltip="When this job ends, if applicable."/>

   <field name="internal_notes" displayName="Internal Notes" tooltip="Notes specific to this job/role."/>

  </page>



 </pageSection>



 <pageSection type="child_tab" name="Campaign Leads">

  <component type="ListView" tableName="campaign_leads" createButton="VISIBLE" editType="MODAL">

   <field id="campaign_id" displayName="Campaign" enableInlineEdit="FALSE" tooltip="Campaign this lead belongs to.">

    <lookup>

     <ref table="campaigns" fieldID="name"/>

     <ref table="campaigns" fieldID="type"/>

    <ref table="campaigns" fieldID="status"/>

    </lookup>

   </field>

   <field id="source_lead_list_id" displayName="Source Lead List" enableInlineEdit="FALSE" tooltip="Lead list that sourced this lead.">

    <lookup>

     <ref table="school_lead_lists" fieldID="name"/>

     <ref table="school_lead_lists" fieldID="priority"/>

    </lookup>

   </field>

   <field id="university_id" displayName="University" enableInlineEdit="FALSE" tooltip="Target university.">

    <lookup>

     <ref table="universities" fieldID="name"/>

     <ref table="universities" fieldID="city"/>

     <ref table="universities" fieldID="region"/>

    </lookup>

   </field>

   <field id="program_id" displayName="Program" enableInlineEdit="FALSE" tooltip="Target program at the university.">

    <lookup>

     <ref table="programs" fieldID="gender"/>

    </lookup>

   </field>

   <field id="university_job_id" displayName="Coach/Job" enableInlineEdit="FALSE" tooltip="Specific coach role targeted.">

    <lookup>

     <ref table="university_jobs" fieldID="job_title"/>

     <ref table="university_jobs" fieldID="work_email"/>

     <!-- <ref table="university_jobs" fieldID="program_scope"/> -->

    </lookup>

   </field>

   <field id="include_reason" displayName="Include Reason" enableInlineEdit="FALSE" tooltip="Why this lead was included."/>

   <field id="included_at" displayName="Included At" enableInlineEdit="FALSE" tooltip="When this lead was included."/>

   <field id="status" displayName="Lead Status" enableInlineEdit="TRUE" tooltip="Pending, replied, or suppressed."/>

   <field id="first_reply_at" displayName="First Reply At" enableInlineEdit="FALSE" tooltip="Timestamp of first coach reply, if any."/>

   <field id="application_id" displayName="Linked Application" enableInlineEdit="FALSE" tooltip="Application created from this lead (if applicable).">

    <lookup>

     <ref table="athlete_applications" fieldID="stage"/>

     <ref table="athlete_applications" fieldID="last_interaction_at"/>

     <!-- <ref table="athlete_applications" fieldID="scholarship_percent"/> -->

    </lookup>

   </field>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Private notes about this lead."/>

  </component>



  <page type="CreateForm" table="campaign_leads">

   <field id="coach_id" prefilledFromParent="true" displayName="Coach" tooltip="Prefilled link back to this coach.">

    <lookup>

     <ref table="coaches" fieldID="full_name"/>

     <ref table="coaches" fieldID="email"/>

    </lookup>

   </field>

   <field name="campaign_id" displayName="Campaign" tooltip="Select the campaign this lead belongs to.">

    <lookup>

     <ref table="campaigns" field="[name]"/>

     <ref table="campaigns" field="[type]"/>

     <ref table="campaigns" field="[status]"/>

    </lookup>

   </field>

   <field name="source_lead_list_id" displayName="Source Lead List" tooltip="Lead list that sourced this lead.">

    <lookup>

     <ref table="school_lead_lists" field="[name]"/>

     <ref table="school_lead_lists" field="[priority]"/>

    </lookup>

   </field>

   <field name="university_id" displayName="University" tooltip="Target university for this lead.">

    <lookup>

     <ref table="universities" field="[name]"/>

     <ref table="universities" field="[city]"/>

    </lookup>

   </field>

   <field name="program_id" displayName="Program" tooltip="Target program (men/women).">

    <lookup>

     <ref table="programs" field="[gender]"/>

    </lookup>

   </field>

   <field name="university_job_id" displayName="Coach/Job" tooltip="Specific coach role targeted.">

    <lookup>

     <ref table="coach" field="name"/>

     <ref table="university_jobs" field="[job_title]"/>

     <ref table="university_jobs" field="[work_email]"/>

    </lookup>

   </field>

   <field name="include_reason" displayName="Include Reason" tooltip="Why this lead is included."/>

   <field name="status" displayName="Lead Status" tooltip="Set the initial lead status (pending, replied, suppressed)."/>

   <field name="internal_notes" displayName="Internal Notes" tooltip="Private notes about this lead."/>

   <field name="included_at" displayName="Included At" tooltip="When the lead was included."/> -->

   <field name="first_reply_at" displayName="First Reply At" tooltip="Timestamp of the first reply, if any."/> -->

  </page>



  <!-- Optional fields for a modal for editing. Only needed if the edit type is modal vs details-->

  <component type="EditModal" table="campaign_leads">

   <field name="status" displayName="Lead Status" tooltip="Pending, replied, or suppressed."/>

   <field name="include_reason" displayName="Include Reason" tooltip="Why this lead was included."/>

   <field name="internal_notes" displayName="Internal Notes" tooltip="Private notes about this lead."/>

   <field name="university_job_id" displayName="Coach/Job" tooltip="Specific coach role targeted.">

    <lookup>

     <ref table="university_jobs" field="[job_title]"/>

     <ref table="coach" field="name"/>

    </lookup>

   </field>

  </component>

 </pageSection>

</page>

