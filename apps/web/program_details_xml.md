<page pageID="programsDetails" type="Details" tableName="programs" pageTitle="Program Detail" mainFieldIDs="gender,university_id.name">

 <pageSection type="fields">

  <!-- Use process-oriented subsections with ≥3 fields each; merge if fewer -->

  <subSection displayName="Affiliation">

   <!-- Include ALL non-audit fields (do NOT comment-out in Details) -->

   <field id="university_id" displayName="University" tooltip="University this program belongs to.">

    <lookup>

     <ref table="universities" fieldID="name"/>

     <ref table="universities" fieldID="city"/>

     </lookup>

   </field>

   <field id="gender" displayName="Program Gender" tooltip="Men’s or Women’s program."/>

   <field id="internal_notes" displayName="Internal Notes" tooltip="Private notes about this program."/>

  </subSection>



  <subSection displayName="Team Links & Social">

   <field id="team_url" displayName="Team Website" tooltip="Official team page URL."/>

   <field id="team_instagram" displayName="Team Instagram" tooltip="Team Instagram profile URL."/>

   <field id="team_twitter" displayName="Team Twitter/X" tooltip="Team Twitter/X profile URL."/>

  </subSection>



  <!-- There are no additional fields -->

 </pageSection>



 <!-- One child tab per direct 1→many related table -->



 <pageSection type="child_tab" name="Program Events">

  <component type="ListView" tableName="program_events" createButton="VISIBLE" editType="DETAILS">

   <field id="event_id" displayName="Event" enableInlineEdit="FALSE" tooltip="Event supported by this program.">

    <lookup>

     <ref table="events" fieldID="code"/>

     <ref table="events" fieldID="name"/>

     <!-- <ref table="events" fieldID="event_group"/> -->

    </lookup>

   </field>

   <field id="is_active" displayName="Active?" enableInlineEdit="TRUE" tooltip="Whether the program is actively recruiting/competing in this event."/>

   <field id="start_date" displayName="Start Date" enableInlineEdit="FALSE" tooltip="When this event became active for the program."/>

   <field id="end_date" displayName="End Date" enableInlineEdit="FALSE" tooltip="When this event ended for the program (if applicable)."/>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Notes about event coverage."/>

  </component>



<page type="CreateForm" table="program_events">

   <field id="program_id" prefilledFromParent="true" displayName="Program" tooltip="Prefilled link back to this program.">

    <lookup>

     <ref table="programs" fieldID="gender"/>

    </lookup>

   </field>

   <field name="event_id" displayName="Event" tooltip="Select an event to associate with this program.">

    <lookup>

     <ref table="events" field="[code]"/>

     <ref table="events" field="[name]"/>

     <!-- <ref table="events" field="[event_group]"/> -->

    </lookup>

   </field>

   <field name="is_active" displayName="Active?" tooltip="Mark if this event is currently active for the program."/>

   <field name="start_date" displayName="Start Date" tooltip="When this event becomes active."/>

   <field name="end_date" displayName="End Date" tooltip="When this event stops being active (optional)."/>

   <field name="internal_notes" displayName="Internal Notes" tooltip="Context about this program-event relationship."/>

  </page>



 </pageSection>



 <pageSection type="child_tab" name="Assigned Coaches">

  <component type="ListView" tableName="university_jobs" createButton="VISIBLE" editType="DETAILS">

   <field id="coach_id" displayName="Coach" enableInlineEdit="FALSE" tooltip="Coach assigned to this program role.">

    <lookup>

     <ref table="coaches" fieldID="full_name"/>

      <ref table="coaches" fieldID="primary_specialty"/>

    </lookup>

   </field>

   <field id="job_title" displayName="Job Title" enableInlineEdit="TRUE" tooltip="Role title (e.g., Head Coach, Assistant)."/>

   <field id="university_id" displayName="University" enableInlineEdit="FALSE" tooltip="University employing the coach for this role.">

    <lookup>

     <ref table="universities" fieldID="name"/>

     <ref table="universities" fieldID="city"/>

    </lookup>

   </field>

   <field id="program_scope" displayName="Program Scope" enableInlineEdit="TRUE" tooltip="Scope of responsibility (men, women, both, n/a)."/>

   <field id="work_email" displayName="Work Email" enableInlineEdit="TRUE" tooltip="Role email."/>

   <field id="work_phone" displayName="Work Phone" enableInlineEdit="TRUE" tooltip="Role phone."/>

   <field id="start_date" displayName="Start Date" enableInlineEdit="FALSE" tooltip="When this role started."/>

   <field id="end_date" displayName="End Date" enableInlineEdit="FALSE" tooltip="When this role ended (if applicable)."/>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Notes specific to this job."/>

  </component>



 </pageSection>



</page>

