<page pageID="athlete_applicationsDetails" type="Details" tableName="athlete_applications" pageTitle="Athlete Application Detail" mainFieldIDs="athlete_id.full_name,university_id.name">

 <pageSection type="fields">

  <!-- Use process-oriented subsections with ≥3 fields each; merge if fewer -->



  <subSection displayName="Parties & Target">

   <!-- Include ALL non-audit fields (do NOT comment-out in Details) -->

   <field id="athlete_id" displayName="Athlete" tooltip="Applicant athlete.">

    <lookup>

     <ref table="athletes" fieldID="full_name"/>

     <ref table="athletes" fieldID="graduation_year"/>

    </lookup>

   </field>

   <field id="university_id" displayName="University" tooltip="Target university for this application.">

    <lookup>

     <ref table="universities" fieldID="name"/>

     <ref table="universities" fieldID="city"/>

<field id="program_id" displayName="Program" tooltip="Target program (men's or women's) for this application.">

 <lookup>

 <ref table="programs" fieldID="gender"/>

 <ref table="programs" fieldID="team_url"/>

 </lookup>

</field>

     	

    </lookup>

   </field>

  </subSection>



  <subSection displayName="Stage & Timing">

   <field id="stage" displayName="Stage" tooltip="Current application stage (intro, ongoing, visit, offer, committed, dropped)."/>

   <field id="start_date" displayName="Start Date" tooltip="When the application started."/>

   <field id="offer_date" displayName="Offer Date" tooltip="When an offer was made (if applicable)."/>

   <field id="commitment_date" displayName="Commitment Date" tooltip="When the athlete committed (if applicable)."/>

   <field id="last_interaction_at" displayName="Last Interaction" tooltip="Most recent touchpoint with the program/university for this application."/>

  </subSection>



  <subSection displayName="Origin & Attribution">

   <field id="origin_lead_list_id" displayName="Origin Lead List" tooltip="Lead list that initially sourced this opportunity.">

    <lookup>

     <ref table="school_lead_lists" fieldID="name"/>

     <ref table="school_lead_lists" fieldID="priority"/>

    </lookup>

   </field>

   <field id="origin_lead_list_priority" displayName="Origin List Priority" tooltip="Priority at time of sourcing (snapshot)."/>

   <field id="origin_campaign_id" displayName="Origin Campaign" tooltip="Campaign that generated this opportunity (if applicable).">

    <lookup>

     <ref table="campaigns" fieldID="name"/>

     <ref table="campaigns" fieldID="type"/>

     <ref table="campaigns" fieldID="status"/>

    </lookup>

   </field>

  </subSection>



  <subSection displayName="Scholarship & Notes">

   <field id="scholarship_amount_per_year" displayName="Scholarship/Year (USD)" tooltip="Annual scholarship offer amount."/>

   <field id="scholarship_percent" displayName="Scholarship %" tooltip="Scholarship as a percentage of cost or equivalency."/>

   <field id="offer_notes" displayName="Offer Notes" tooltip="Notes/details about the offer (verbal, conditions, dates)."/>

   <field id="internal_notes" displayName="Internal Notes" tooltip="Private notes about this application."/>

  </subSection>



  <!-- There are no additional fields -->

 </pageSection>



 <!-- One child tab per direct 1→many related table -->



 <pageSection type="child_tab" name="Replies">

  <component type="ListView" tableName="replies" createButton="VISIBLE" editType="DETAILS">

   <field id="type" displayName="Reply Type" enableInlineEdit="TRUE" tooltip="Call, text, email, or Instagram DM."/>

   <field id="occurred_at" displayName="Occurred At" enableInlineEdit="FALSE" tooltip="When the reply occurred."/>

   <field id="summary" displayName="Summary" enableInlineEdit="FALSE" tooltip="Short description of the reply content."/>

   <field id="campaign_id" displayName="Campaign" enableInlineEdit="FALSE" tooltip="Related campaign, if any.">

    <lookup>

     <ref table="campaigns" fieldID="name"/>

     <ref table="campaigns" fieldID="type"/>

    </lookup>

   </field>

   <field id="university_job_id" displayName="Coach" enableInlineEdit="FALSE" tooltip="Specific coach role associated with this reply.">

    <lookup>

     <ref table="university_jobs" fieldID="job_title"/>

     <ref table="coaches" fieldID="full_name"/>

    </lookup>

   </field>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Private notes about this reply."/>

  </component>



  <page type="CreateForm" table="replies">

   <field id="application_id" prefilledFromParent="true" displayName="Application" tooltip="Prefilled link to this application.">

    <lookup>

     <ref table="athlete_applications" fieldID="stage"/>

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

   <field name="university_job_id" displayName="Coach/Job" tooltip="Specific coach role associated with this reply.">

    <lookup>

     <ref table="university_jobs" field="[job_title]"/>

     <ref table="coaches" field="[full_name]"/>

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



 <pageSection type="child_tab" name="Campaign Leads (Linked)">

  <component type="ListView" tableName="campaign_leads" createButton="VISIBLE" editType="DETAILS">

   <field id="campaign_id" displayName="Campaign" enableInlineEdit="FALSE" tooltip="Campaign that produced or relates to this application.">

    <lookup>

     <ref table="campaigns" fieldID="name"/>

     <ref table="campaigns" fieldID="type"/>

     <!-- <ref table="campaigns" fieldID="status"/> -->

    </lookup>

   </field>

   <field id="university_id" displayName="University" enableInlineEdit="FALSE" tooltip="Target university on the lead.">

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

   <field id="university_job_id" displayName="Coach/Job" enableInlineEdit="FALSE" tooltip="Specific coach role (if targeted).">

    <lookup>

     <ref table="university_jobs" fieldID="job_title"/>

     <ref table="university_jobs" fieldID="work_email"/>

    </lookup>

   </field>

   <field id="status" displayName="Lead Status" enableInlineEdit="TRUE" tooltip="Pending, replied, or suppressed."/>

   <field id="first_reply_at" displayName="First Reply At" enableInlineEdit="FALSE" tooltip="Timestamp of first coach reply, if any."/>

   <field id="include_reason" displayName="Include Reason" enableInlineEdit="FALSE" tooltip="Why this lead was included."/>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Private notes about this lead."/>

  </component>



  <page type="CreateForm" table="campaign_leads">

   <field id="application_id" prefilledFromParent="true" displayName="Linked Application" tooltip="Prefilled to associate this lead with the current application.">

    <lookup>

     <ref table="athlete_applications" fieldID="stage"/>

     <ref table="athlete_applications" fieldID="last_interaction_at"/>

    </lookup>

   </field>

   <field name="campaign_id" displayName="Campaign" tooltip="Select the campaign for this lead.">

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

   <field name="university_job_id" displayName="Coach/Job" tooltip="Specific coach role targeted (optional).">

    <lookup>

     <ref table="coaches" field="[full_name]"/>

     <ref table="university_jobs" field="[job_title]"/>

     <ref table="university_jobs" field="[work_email]"/>

    </lookup>

   </field>

   <field name="status" displayName="Lead Status" tooltip="Initial status (pending/replied/suppressed)."/>

   <field name="include_reason" displayName="Include Reason" tooltip="Why this lead is included."/>

   <field name="internal_notes" displayName="Internal Notes" tooltip="Private notes about this lead."/>

  </page>



  <component type="EditModal" table="campaign_leads">

   <field name="status" displayName="Lead Status" tooltip="Pending, replied, or suppressed."/>

   <field name="include_reason" displayName="Include Reason" tooltip="Why this lead was included."/>

   <field name="internal_notes" displayName="Internal Notes" tooltip="Private notes about this lead."/>

  </component>

 </pageSection>

</page>



