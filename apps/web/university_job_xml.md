<page pageID="university_jobsDetails" type="Details" tableName="university_jobs" pageTitle="University Job Detail" mainFieldIDs="coach_id.full_name,job_title,university_id.name">

 <pageSection type="fields">

  <!-- Use process-oriented subsections with ≥3 fields each; merge if fewer -->

  <subSection displayName="Assignment & Role">

   <!-- Include ALL non-audit fields (do NOT comment-out in Details) -->

   <field id="coach_id" displayName="Coach" tooltip="Coach assigned to this role.">

    <lookup>

     <ref table="coaches" fieldID="full_name"/>

     <ref table="coaches" fieldID="primary_specialty"/>

    </lookup>

   </field>

   <field id="job_title" displayName="Job Title" tooltip="Role title (e.g., Head Coach, Assistant Coach)."/>

   <field id="program_scope" displayName="Program Scope" tooltip="Scope of responsibility for this role (men, women, both, n/a)."/>

   <field id="university_id" displayName="University" tooltip="University employing the coach for this role.">

    <lookup>

     <ref table="universities" fieldID="name"/>

     <ref table="universities" fieldID="city"/>

     <!-- <ref table="universities" fieldID="region"/> -->

    </lookup>

   </field>

   <field id="program_id" displayName="Program" tooltip="If this role is tied to a specific program. Leave blank when scope is university-wide.">

    <lookup>

     <ref table="programs" fieldID="gender"/>

    </lookup>

   </field>



  </subSection>



  <subSection displayName="Operations & Timeline">

   <field id="work_email" displayName="Work Email" tooltip="Email used for this role."/>

   <field id="work_phone" displayName="Work Phone" tooltip="Phone number used for this role."/>

   <field id="start_date" displayName="Start Date" tooltip="When this role started."/>

   <field id="end_date" displayName="End Date" tooltip="When this role ended (if applicable)."/>

   <field id="internal_notes" displayName="Internal Notes" tooltip="Notes specific to this job/role."/>

  </subSection>

 </pageSection>



 <pageSection type="child_tab" name="Responsibilities">

  <component type="ListView" tableName="coach_responsibilities" createButton="VISIBLE" editType="MODAL">

   <field id="event_group" displayName="Event Group" enableInlineEdit="TRUE" tooltip="Primary event group this role covers (e.g., sprints, distance)."/>

   <field id="event_id" displayName="Specific Event" enableInlineEdit="FALSE" tooltip="Optional: specific event this role covers.">

    <lookup>

     <ref table="events" fieldID="code"/>

     <ref table="events" fieldID="event_group"/>

    </lookup>

   </field>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Notes about this responsibility."/>

  </component>



  <page type="CreateForm" table="coach_responsibilities">

   <field id="university_job_id" prefilledFromParent="true" displayName="University Job" tooltip="Prefilled link back to this job.">

    <lookup>

     <ref table="university_jobs" fieldID="job_title"/>

     <ref table="coaches" fieldID="full_name"/>

     <!-- <ref table="universities" fieldID="name"/> -->

    </lookup>

   </field>

   <field name="event_group" displayName="Event Group" tooltip="Select the event group this role covers."/>

   <field name="event_id" displayName="Specific Event" tooltip="Optional: choose a specific event.">

    <lookup>

     <ref table="events" field="[code]"/>

     <ref table="events" field="[event_group]"/>

    </lookup>

   </field>

   <field name="internal_notes" displayName="Internal Notes" tooltip="Notes for this responsibility."/>

  </page>



  <component type="EditModal" table="coach_responsibilities">

   <field name="event_group" displayName="Event Group" tooltip="Primary event group covered."/>

   <field name="event_id" displayName="Specific Event" tooltip="Specific event covered, if applicable.">

    <lookup>

     <ref table="events" field="[code]"/>

     <ref table="events" field="[name]"/>

    </lookup>

   </field>

   <!-- Optional fields for the child edit modal -->

   <!-- <field name="internal_notes" displayName="Internal Notes" tooltip="Notes about this responsibility."/> -->

  </component>

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

   <field id="university_id" displayName="University" enableInlineEdit="FALSE" tooltip="Target university for this lead.">

    <lookup>

     <ref table="universities" fieldID="name"/>

     <ref table="universities" fieldID="city"/>

    </lookup>

   </field>

   <field id="program_id" displayName="Program" enableInlineEdit="FALSE" tooltip="Target program at the university.">

    <lookup>

     <ref table="programs" fieldID="gender"/>

    </lookup>

   </field>

   <field id="status" displayName="Lead Status" enableInlineEdit="TRUE" tooltip="Pending, replied, or suppressed."/>

   <field id="first_reply_at" displayName="First Reply At" enableInlineEdit="FALSE" tooltip="Timestamp of first coach reply, if any."/>

   <field id="include_reason" displayName="Include Reason" enableInlineEdit="FALSE" tooltip="Why this lead was included."/>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Private notes about this lead."/>

  </component>



  <page type="CreateForm" table="campaign_leads">

   <field id="university_job_id" prefilledFromParent="true" displayName="Coach/Job" tooltip="Prefilled link back to this coach role.">

    <lookup>

     <ref table="university_jobs" fieldID="job_title"/>

     <ref table="coaches" fieldID="full_name"/>

     <!-- <ref table="universities" fieldID="name"/> -->

    </lookup>

   </field>

   <field name="campaign_id" displayName="Campaign" tooltip="Select a campaign for this lead.">

    <lookup>

     <ref table="campaigns" field="[name]"/>

     <ref table="campaigns" field="[type]"/>

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

     <ref table="programs" field="[team_url]"/>

    </lookup>

   </field>

   <field name="status" displayName="Lead Status" tooltip="Initial status (pending, replied, suppressed)."/>

   <field name="include_reason" displayName="Include Reason" tooltip="Why this lead is included."/>

   <field name="internal_notes" displayName="Internal Notes" tooltip="Private notes about this lead."/>

  </page>



  <component type="EditModal" table="campaign_leads">

   <field name="status" displayName="Lead Status" tooltip="Pending, replied, or suppressed."/>

   <field name="include_reason" displayName="Include Reason" tooltip="Why this lead was included."/>

   <field name="internal_notes" displayName="Internal Notes" tooltip="Private notes about this lead."/>

   <field name="program_id" displayName="Program" tooltip="Target program.">

    <lookup>

     <ref table="programs" field="[gender]"/>

     <ref table="programs" field="[team_url]"/>

    </lookup>

   </field>

  </component>

 </pageSection>



 <pageSection type="child_tab" name="Replies">

  <component type="ListView" tableName="replies" createButton="VISIBLE" editType="DETAILS">

   <field id="type" displayName="Reply Type" enableInlineEdit="TRUE" tooltip="Call, text, email, or Instagram DM."/>

   <field id="occurred_at" displayName="Occurred At" enableInlineEdit="FALSE" tooltip="When the reply occurred."/>

   <field id="summary" displayName="Summary" enableInlineEdit="FALSE" tooltip="Short description of the reply."/>

   <field id="campaign_id" displayName="Campaign" enableInlineEdit="FALSE" tooltip="Related campaign, if any.">

    <lookup>

     <ref table="campaigns" fieldID="name"/>

     <ref table="campaigns" fieldID="type"/>

    </lookup>

   </field>

   <field id="application_id" displayName="Application" enableInlineEdit="FALSE" tooltip="Related athlete application, if any.">

    <lookup>

     <ref table="athlete_applications" fieldID="stage"/>

     <ref table="athlete_applications" fieldID="last_interaction_at"/>

     <!-- <ref table="athlete_applications" fieldID="scholarship_percent"/> -->

    </lookup>

   </field>

   <field id="athlete_id" displayName="Athlete" enableInlineEdit="FALSE" tooltip="Athlete involved in this reply, if applicable.">

    <lookup>

     <ref table="athletes" fieldID="full_name"/>

     <ref table="athletes" fieldID="contact_email"/>

    </lookup>

   </field>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Private notes about this reply."/>

  </component>



  <page type="CreateForm" table="replies">

   <field id="university_job_id" prefilledFromParent="true" displayName="Coach/Job" tooltip="Prefilled link back to this coach role.">

    <lookup>

     <ref table="university_jobs" fieldID="job_title"/>

     <ref table="coaches" fieldID="full_name"/>

    </lookup>

   </field>

   <field name="type" displayName="Reply Type" tooltip="Call, text, email, or Instagram DM."/>

   <field name="occurred_at" displayName="Occurred At" tooltip="When the reply occurred."/>

   <field name="summary" displayName="Summary" tooltip="Brief summary of the reply."/>

   <field name="campaign_id" displayName="Campaign" tooltip="Related campaign, if any.">

    <lookup>

     <ref table="campaigns" field="[name]"/>

     <ref table="campaigns" field="[type]"/>

    </lookup>

   </field>

   <field name="application_id" displayName="Application" tooltip="Related athlete application, if any.">

    <lookup>

     <ref table="athlete_applications" field="[stage]"/>

     <ref table="athlete_applications" field="[last_interaction_at]"/>

    </lookup>

   </field>

   <field name="athlete_id" displayName="Athlete" tooltip="Athlete involved, if applicable.">

    <lookup>

     <ref table="athletes" field="[full_name]"/>

     <ref table="athletes" field="[contact_email]"/>

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

</page>

