<page pageID="universitiesDetails" type="Details" tableName="universities" pageTitle="University Detail" mainFieldIDs="name,city">

 <pageSection type="fields">

  <!-- Use process-oriented subsections with ≥3 fields each; merge if fewer -->

  <subSection displayName="Institution Profile">

   <!-- Include ALL non-audit fields (do NOT comment-out in Details) -->

   <field id="name" displayName="University Name" tooltip="Official university name used across outreach and reporting."/>

   <field id="type_public_private" displayName="Public/Private" tooltip="Institution control (e.g., Public, Private)."/>

   <field id="religious_affiliation" displayName="Religious Affiliation" tooltip="Denominational affiliation, if any."/>

   <field id="institution_flags_raw" displayName="Institution Flags" tooltip="Raw flags/labels imported from data sources."/>

   <field id="ipeds_nces_id" displayName="IPEDS/NCES ID" tooltip="Federal identifier used for reference and matching."/>

   <field id="internal_notes" displayName="Internal Notes" tooltip="Private notes about the institution."/>

  </subSection>



  <subSection displayName="Location & Context">

   <field id="city" displayName="City" tooltip="City where the university is located."/>

   <field id="state" displayName="State" tooltip="State or province of the university."/>

   <field id="region" displayName="Region" tooltip="Geographic region categorization (e.g., Midwest)."/>

   <field id="size_of_city" displayName="City Size" tooltip="Size category of the surrounding city."/>

   <field id="conference_raw" displayName="Conference (Raw)" tooltip="Athletics conference label as stored/imported."/>

   <field id="division_raw" displayName="Division (Raw)" tooltip="NCAA/NAIA division label as stored/imported."/>

  </subSection>



  <subSection displayName="Academics & Admissions">

   <field id="average_gpa" displayName="Average GPA" tooltip="Average GPA for admitted students."/>

   <field id="sat_ebrw_25th" displayName="SAT EBRW 25th %" tooltip="25th percentile SAT Evidence-Based Reading & Writing."/>

   <field id="sat_ebrw_75th" displayName="SAT EBRW 75th %" tooltip="75th percentile SAT Evidence-Based Reading & Writing."/>

   <field id="sat_math_25th" displayName="SAT Math 25th %" tooltip="25th percentile SAT Math."/>

   <field id="sat_math_75th" displayName="SAT Math 75th %" tooltip="75th percentile SAT Math."/>

   <field id="act_composite_25th" displayName="ACT Composite 25th %" tooltip="25th percentile ACT composite."/>

   <field id="act_composite_75th" displayName="ACT Composite 75th %" tooltip="75th percentile ACT composite."/>

   <field id="acceptance_rate_pct" displayName="Acceptance Rate (%)" tooltip="Undergraduate acceptance rate percentage."/>

   <field id="undergraduate_enrollment" displayName="Undergrad Enrollment" tooltip="Total undergraduate students."/>

   <field id="total_yearly_cost" displayName="Total Yearly Cost (USD)" tooltip="Estimated annual cost of attendance."/>

   <field id="majors_offered_url" displayName="Majors Offered URL" tooltip="Link to catalog or list of majors."/>

   <field id="us_news_ranking_national_2018" displayName="US News National (2018)" tooltip="US News national ranking (2018 snapshot)."/>

   <field id="us_news_ranking_liberal_arts_2018" displayName="US News Liberal Arts (2018)" tooltip="US News liberal arts ranking (2018 snapshot)."/>

   <field id="email_blocked" displayName="Email Blocked?" tooltip="If university email servers block outside messages; use Gmail/personal contact."/>

  </subSection>



  <!-- There are no additional fields -->

 </pageSection>



 <!-- One child tab per direct 1→many related table -->



 <pageSection type="child_tab" name="Programs">

  <component type="ListView" tableName="programs" createButton="VISIBLE" editType="DETAILS">

   <field id="gender" displayName="Program Gender" enableInlineEdit="TRUE" tooltip="Men’s or Women’s program designation."/>

   <field id="team_url" displayName="Team Website" enableInlineEdit="FALSE" tooltip="Official team page URL."/>

   <field id="team_instagram" displayName="Team Instagram" enableInlineEdit="FALSE" tooltip="Team Instagram profile URL."/>

   <field id="team_twitter" displayName="Team Twitter/X" enableInlineEdit="FALSE" tooltip="Team Twitter/X profile URL."/>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Private notes about this program."/>

  </component>



  <page type="CreateForm" table="programs">

   <field id="university_id" prefilledFromParent="true" displayName="University" tooltip="Prefilled link back to this university.">

    <lookup>

     <ref table="universities" fieldID="name"/>

     <ref table="universities" fieldID="city"/>

     <!-- <ref table="universities" fieldID="region"/> -->

    </lookup>

   </field>

   <field name="gender" displayName="Program Gender" tooltip="Choose men or women."/>

   <field name="team_url" displayName="Team Website" tooltip="Official team website URL."/>

   <field name="team_instagram" displayName="Team Instagram" tooltip="Team Instagram profile URL."/>

   <field name="team_twitter" displayName="Team Twitter/X" tooltip="Team Twitter/X profile URL."/>

   <field name="internal_notes" displayName="Internal Notes" tooltip="Private notes about this program."/>

  </page>

 </pageSection>



 <pageSection type="child_tab" name="University Jobs (Coaches)">

  <component type="ListView" tableName="university_jobs" createButton="VISIBLE" editType="DETAILS">

   <field id="coach_id" displayName="Coach" enableInlineEdit="FALSE" tooltip="Coach assigned to this role.">

    <lookup>

     <ref table="coaches" fieldID="full_name"/>

     <ref table="coaches" fieldID="email"/>

     <ref table="coaches" fieldID="primary_specialty"/> 

    </lookup>

   </field>

   <field id="program_id" displayName="Program" enableInlineEdit="FALSE" tooltip="If role is tied to a specific program.">

    <lookup>

     <ref table="programs" fieldID="gender"/>

     <ref table="programs" fieldID="team_url"/>

     <!-- <ref table="programs" fieldID="team_instagram"/> -->

    </lookup>

   </field>

   <field id="program_scope" displayName="Program Scope" enableInlineEdit="TRUE" tooltip="Scope of responsibility (men, women, both, n/a)."/>

   <field id="job_title" displayName="Job Title" enableInlineEdit="TRUE" tooltip="Role title (e.g., Head Coach, Assistant)."/>

   <field id="work_email" displayName="Work Email" enableInlineEdit="TRUE" tooltip="Email used for this role."/>

   <field id="work_phone" displayName="Work Phone" enableInlineEdit="TRUE" tooltip="Phone used for this role."/>

   <field id="start_date" displayName="Start Date" enableInlineEdit="FALSE" tooltip="When this role started."/>

   <field id="end_date" displayName="End Date" enableInlineEdit="FALSE" tooltip="When this role ended (if applicable)."/>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Notes specific to this role."/>

  </component>



  <page type="CreateForm" table="university_jobs">

   <field id="university_id" prefilledFromParent="true" displayName="University" tooltip="Prefilled link back to this university.">

    <lookup>

     <ref table="universities" fieldID="name"/>

     <ref table="universities" fieldID="city"/>

    </lookup>

   </field>

   <field name="coach_id" displayName="Coach" tooltip="Assign a coach to this role.">

    <lookup>

     <ref table="coaches" field="[full_name]"/>

     <ref table="coaches" field="[email]"/>

    </lookup>

   </field>

   <field name="program_id" displayName="Program" tooltip="Tie to a specific program, if applicable.">

    <lookup>

     <ref table="programs" field="[gender]"/>

     <ref table="programs" field="[team_url]"/>

    </lookup>

   </field>

   <field name="program_scope" displayName="Program Scope" tooltip="Scope of responsibility (men, women, both, n/a)."/>

   <field name="job_title" displayName="Job Title" tooltip="Role title (e.g., Assistant Coach)."/>

   <field name="work_email" displayName="Work Email" tooltip="Email used for this role."/>

   <field name="work_phone" displayName="Work Phone" tooltip="Phone used for this role."/>

   <field name="start_date" displayName="Start Date" tooltip="When this job starts."/>

   <field name="end_date" displayName="End Date" tooltip="When this job ends."/>

   <field name="internal_notes" displayName="Internal Notes" tooltip="Notes specific to this job/role."/>

  </page>

 </pageSection>



 <pageSection type="child_tab" name="Athlete Applications">

  <component type="ListView" tableName="athlete_applications" createButton="VISIBLE" editType="DETAILS">

   <field id="athlete_id" displayName="Athlete" enableInlineEdit="FALSE" tooltip="Applicant athlete.">

    <lookup>

     <ref table="athletes" fieldID="full_name"/>

     <ref table="athletes" fieldID="contact_email"/>

     <!-- <ref table="athletes" fieldID="graduation_year"/> -->

    </lookup>

   </field>

   <field id="program_id" displayName="Program" enableInlineEdit="FALSE" tooltip="Program (men/women) this application targets.">

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



  <page type="CreateForm" table="athlete_applications">

   <field id="university_id" prefilledFromParent="true" displayName="University" tooltip="Prefilled link to this university.">

    <lookup>

     <ref table="universities" fieldID="name"/>

     <ref table="universities" fieldID="city"/>

    </lookup>

   </field>

   <field name="athlete_id" displayName="Athlete" tooltip="Select the applicant.">

    <lookup>

     <ref table="athletes" field="[full_name]"/>

     <ref table="athletes" field="[contact_email]"/>

    </lookup>

   </field>

   <field name="program_id" displayName="Program" tooltip="Pick the program (men/women).">

    <lookup>

     <ref table="programs" field="[gender]"/>

    </lookup>

   </field>

   <field name="stage" displayName="Stage" tooltip="Initial application stage."/>

   <field name="start_date" displayName="Start Date" tooltip="When this application starts."/>

   <field name="offer_date" displayName="Offer Date" tooltip="Offer date, if applicable."/>

   <field name="commitment_date" displayName="Commitment Date" tooltip="Commit date, if applicable."/>

   <field name="scholarship_amount_per_year" displayName="Scholarship/Year (USD)" tooltip="Dollar value per year."/>

   <field name="scholarship_percent" displayName="Scholarship %" tooltip="Percentage offered."/>

   <field name="internal_notes" displayName="Internal Notes" tooltip="Private notes."/>

  </page>

 </pageSection>



 <pageSection type="child_tab" name="Lead List Entries">

  <component type="ListView" tableName="school_lead_list_entries" createButton="VISIBLE" editType="DETAILS">

   <field id="school_lead_list_id" displayName="Lead List" enableInlineEdit="FALSE" tooltip="Athlete lead list that includes this university.">

    <lookup>

     <ref table="school_lead_lists" fieldID="name"/>

     <ref table="school_lead_lists" fieldID="priority"/>

     <!-- <ref table="school_lead_lists" fieldID="season_label"/> -->

    </lookup>

   </field>

   <field id="program_id" displayName="Program" enableInlineEdit="FALSE" tooltip="Optional: specific program within the university.">

    <lookup>

     <ref table="programs" fieldID="gender"/>

     <ref table="programs" fieldID="team_url"/>

    </lookup>

   </field>

   <field id="status" displayName="Status" enableInlineEdit="TRUE" tooltip="Include/exclude or custom status for this entry."/>

   <field id="added_at" displayName="Added At" enableInlineEdit="FALSE" tooltip="When this entry was added."/>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Notes specific to this lead entry."/>

  </component>



  <page type="CreateForm" table="school_lead_list_entries">

   <field name="school_lead_list_id" displayName="Lead List" tooltip="Select an athlete’s lead list to add this university to.">

    <lookup>

     <ref table="school_lead_lists" field="[name]"/>

     <ref table="school_lead_lists" field="[priority]"/>

    </lookup>

   </field>

   <field id="university_id" prefilledFromParent="true" displayName="University" tooltip="Prefilled with this university."/>

   <field name="program_id" displayName="Program" tooltip="Optionally select a specific program.">

    <lookup>

     <ref table="programs" field="[gender]"/>

     <ref table="programs" field="[team_url]"/>

    </lookup>

   </field>

   <field name="status" displayName="Status" tooltip="Set include/exclude or custom value."/>

   <field name="internal_notes" displayName="Internal Notes" tooltip="Notes for this entry."/>

  </page>

 </pageSection>



 <pageSection type="child_tab" name="Campaign Leads">

  <component type="ListView" tableName="campaign_leads" createButton="VISIBLE" editType="DETAILS">

   <field id="campaign_id" displayName="Campaign" enableInlineEdit="FALSE" tooltip="Campaign this lead belongs to.">

    <lookup>

     <ref table="campaigns" fieldID="name"/>

     <ref table="campaigns" fieldID="type"/>

     <!-- <ref table="campaigns" fieldID="status"/> -->

    </lookup>

   </field>

   <field id="program_id" displayName="Program" enableInlineEdit="FALSE" tooltip="Target program at this university.">

    <lookup>

     <ref table="programs" fieldID="gender"/>

     <ref table="programs" fieldID="team_url"/>

    </lookup>

   </field>

   <field id="university_job_id" displayName="Coach/Job" enableInlineEdit="FALSE" tooltip="Specific coach role targeted.">

    <lookup>

     <ref table="university_jobs" fieldID="job_title"/>

     <ref table="university_jobs" fieldID="work_email"/>

     <!-- <ref table="university_jobs" fieldID="program_scope"/> -->

    </lookup>

   </field>

   <field id="status" displayName="Lead Status" enableInlineEdit="TRUE" tooltip="Pending, replied, or suppressed."/>

   <field id="first_reply_at" displayName="First Reply At" enableInlineEdit="FALSE" tooltip="Timestamp of first coach reply, if any."/>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Private notes about this lead."/>

  </component>



  <page type="CreateForm" table="campaign_leads">

   <field id="university_id" prefilledFromParent="true" displayName="University" tooltip="Prefilled with this university."/>

   <field name="campaign_id" displayName="Campaign" tooltip="Select the campaign.">

    <lookup>

     <ref table="campaigns" field="[name]"/>

     <ref table="campaigns" field="[type]"/>

    </lookup>

   </field>

   <field name="program_id" displayName="Program" tooltip="Target program (men/women).">

    <lookup>

     <ref table="programs" field="[gender]"/>

     <ref table="programs" field="[team_url]"/>

    </lookup>

   </field>

   <field name="university_job_id" displayName="Coach/Job" tooltip="Specific coach role targeted.">

    <lookup>

     <ref table="university_jobs" field="[job_title]"/>

     <ref table="university_jobs" field="[work_email]"/>

    </lookup>

   </field>

   <field name="status" displayName="Lead Status" tooltip="Initial status (pending/replied/suppressed)."/>

   <field name="internal_notes" displayName="Internal Notes" tooltip="Private notes for this lead."/>

  </page>

 </pageSection>



 <pageSection type="child_tab" name="Ball Knowledge">

  <component type="ListView" tableName="ball_knowledge" createButton="VISIBLE" editType="MODAL">

   <field id="note" displayName="Intel" enableInlineEdit="FALSE" tooltip="The intel itself (free-form)."/>

   <field id="source_type" displayName="Source Type" enableInlineEdit="FALSE" tooltip="From Athlete, From Campaign, From Call, or Other."/>

   <field id="about_coach_id" displayName="About Coach" enableInlineEdit="FALSE" tooltip="Coach this intel is about (optional).">

    <lookup>

     <ref table="coaches" fieldID="full_name"/>

    <ref table="coaches" fieldID="primary_specialty"/>

    </lookup>

   </field>

   <field id="about_program_id" displayName="About Program" enableInlineEdit="FALSE" tooltip="Program this intel is about (optional).">

    <lookup>

     <ref table="programs" fieldID="gender"/>

    </lookup>

   </field>

   <field id="from_athlete_id" displayName="From Athlete" enableInlineEdit="FALSE" tooltip="Athlete who reported this intel (optional).">

