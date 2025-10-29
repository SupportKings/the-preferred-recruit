<page pageID="athletesDetails" type="Details" tableName="athletes" pageTitle="Athlete Detail" mainFieldIDs="full_name,sending_email_id.username">

 <pageSection type="fields">

  <!-- Use process-oriented subsections with ≥3 fields each; merge if fewer -->

  <subSection displayName="Identity & Contact">

   <!-- Include ALL non-audit fields (do NOT comment-out in Details) -->

   <field id="full_name" displayName="Full Name" tooltip="Athlete’s legal or preferred full name."/>

   <field id="contact_email" displayName="Contact Email" tooltip="Primary email for the athlete (used for general communication)."/>

   <field id="phone" displayName="Phone" tooltip="Primary phone number for the athlete."/>

   <field id="instagram_handle" displayName="Instagram Handle" tooltip="Athlete’s Instagram username for social outreach."/>

   <field id="gender" displayName="Gender" tooltip="Athlete’s gender for program fit and compliance."/>

   <field id="date_of_birth" displayName="Date of Birth" tooltip="Used for eligibility and age-based classifications."/>

   <field id="gpa" displayName= "GPA"/>

  </subSection>



  <subSection displayName="Location & Education">

   <field id="high_school" displayName="High School" tooltip="Current or last attended high school."/>

   <field id="city" displayName="City" tooltip="Home city for the athlete."/>

   <field id="state" displayName="State/Province" tooltip="Home state or province."/>

   <field id="country" displayName="Country" tooltip="Home country."/>

   <field id="graduation_year" displayName="HS Graduation Year" tooltip="High school graduation year."/>

   <field id="year_entering_university" displayName="Year Entering University" tooltip="Intended first year of university enrollment."/>

   <field id="student_type" displayName="Student Type" tooltip="Student profile type (e.g., high school, transfer)."/>

   <field id="sat_score" displayName="SAT Score" tooltip="SAT composite or relevant score for admissions context."/>

   <field id="act_score" displayName="ACT Score" tooltip="ACT composite score for admissions context."/>

  </subSection>



  <subSection displayName="Profile & Resources">

   <field id="athlete_net_url" displayName="AthleteNet URL" tooltip="Profile link used in outreach to coaches."/>

   <field id="milesplit_url" displayName="MileSplit URL" tooltip="MileSplit profile for verified performances."/>

   <field id="google_drive_folder_url" displayName="Google Drive Folder" tooltip="Shared folder with documents, videos, transcripts, etc."/>

   <field id="onboarding_form_data" displayName="Onboarding Notes (JSON)" tooltip="Free-text intake data: story, personality, and fit notes."/>

  </subSection>



  <subSection displayName="Comms & Discord">

   <field id="sending_email_id" displayName="Assigned Sending Email" tooltip="Outbound sending email account used for outreach.">

    <lookup>

     <ref table="email_sending_accounts" fieldID="username"/>

  		<ref table="domains" fieldID="domain_url"/>

	</ref>

    </lookup>

   </field>

   <field id="discord_channel_url" displayName="Discord Channel URL" tooltip="Link to the athlete’s private Discord channel."/>

   <field id="discord_channel_id" displayName="Discord Channel ID" tooltip="Raw Discord channel identifier."/>

   <field id="discord_username" displayName="Discord Username" tooltip="Athlete’s Discord handle for support and updates."/>

  </subSection>



  <subSection displayName="Sales & Engagement">

   <field id="lead_source" displayName="Lead Source" tooltip="How the athlete discovered or engaged with the service."/>

   <field id="sales_setter_id" displayName="Sales Setter" tooltip="Team member who set the initial sales appointment.">

    <lookup>

     <ref table="internal_team" fieldID="name"/>

     <ref table="internal_team" fieldID="job_title"/>

    </lookup>

   </field>

   <field id="sales_closer_id" displayName="Sales Closer" tooltip="Team member who closed the sale.">

    <lookup>

     <ref table="internal_team" fieldID="name"/>

     <ref table="internal_team" fieldID="job_title"/>

    </lookup>

   </field>

   <field id="last_sales_call_at" displayName="Last Sales Call" tooltip="Timestamp of the most recent sales call."/>

   <field id="sales_call_note" displayName="Sales Call Note" tooltip="Key context and outcomes from the last sales call."/>

   <field id="sales_call_recording_url" displayName="Sales Call Recording" tooltip="Link to the recorded sales call for reference."/>

  </subSection>



  <subSection displayName="Contract & Billing">

   <field id="contract_date" displayName="Contract Date" tooltip="Date the athlete signed the service agreement."/>

   <field id="go_live_date" displayName="Go-Live Date" tooltip="Date the outreach or service officially started."/>

   <field id="initial_contract_amount_usd" displayName="Initial Contract Amount (USD)" tooltip="Total contracted amount at signup."/>

   <field id="initial_cash_collected_usd" displayName="Initial Cash Collected (USD)" tooltip="Cash collected at or near contract date."/>

   <field id="initial_payment_type" displayName="Initial Payment Type" tooltip="Whether paid in full, deposit, or installments."/>

   <field id="internal_notes" displayName="Internal Notes" tooltip="General internal notes not visible to clients."/>

  </subSection>



 </pageSection>



 <pageSection type="child_tab" name="Onboarding Checklist">

  <component type="ListView" tableName="checklist_items" createButton="VISIBLE" editType="DETAILS">

   <field id="checklist_id" displayName="Checklist" enableInlineEdit="FALSE" tooltip="Checklist that this item belongs to.">

    <lookup>

     <ref table="checklists" fieldID="checklist_definition_id"/>

     <ref table="checklists" fieldID="internal_notes"/>

     <!-- <ref table="checklists" fieldID="athlete_id"/> -->

    </lookup>

   </field>

   <field id="template_item_id" displayName="Template Item" enableInlineEdit="FALSE" tooltip="Template reference for this item.">

    <lookup>

     <ref table="checklist_definition_items" fieldID="title"/>

     <ref table="checklist_definition_items" fieldID="sort_order"/>

     <!-- <ref table="checklist_definition_items" fieldID="required"/> -->

    </lookup>

   </field>

   <field id="title" displayName="Title" enableInlineEdit="TRUE" tooltip="Action title for this checklist item."/>

   <field id="description" displayName="Description" enableInlineEdit="TRUE" tooltip="Details for completing the task."/>

   <field id="sort_order" displayName="Order" enableInlineEdit="TRUE" tooltip="Ordering of the item within the checklist."/>

   <field id="required" displayName="Required?" enableInlineEdit="TRUE" tooltip="Whether completion is mandatory."/>

   <field id="is_applicable" displayName="Applicable?" enableInlineEdit="TRUE" tooltip="Toggle off if not relevant to this athlete."/>

   <field id="blocked_reason" displayName="Blocked Reason" enableInlineEdit="TRUE" tooltip="Why this item is blocked, if applicable."/>

   <field id="is_done" displayName="Done?" enableInlineEdit="TRUE" tooltip="Mark complete when finished."/>

   <field id="done_at" displayName="Done At" enableInlineEdit="FALSE" tooltip="Timestamp when the item was completed."/>

   <field id="done_by_team_member_id" displayName="Completed By" enableInlineEdit="FALSE" tooltip="Team member who completed the item.">

    <lookup>

     <ref table="internal_team" fieldID="name"/>

     <ref table="internal_team" fieldID="job_title"/>

     <!-- <ref table="internal_team" fieldID="timezone"/> -->

    </lookup>

   </field>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Private notes about this item."/>

  </component>



  <page type="CreateForm" table="checklist_items">

   <!-- Parent is athlete (indirect). Choose one of this athlete’s Checklists -->

   <field id="checklist_id" displayName="Onboarding Checklist" tooltip="Select the relevant checklist instance.">

    <lookup>

     <ref table="checklists" fieldID="checklist_definition_id"/>

     <ref table="checklists" fieldID="internal_notes"/>

    </lookup>

   </field>

   <field id="template_item_id" displayName="Template Item" tooltip="Optionally link to a template item.">

    <lookup>

     <ref table="checklist_definition_items" fieldID="title"/>

     <ref table="checklist_definition_items" fieldID="sort_order"/>

    </lookup>

   </field>

   <field id="title" displayName="Title" tooltip="Action title for this checklist item."/>

   <field id="description" displayName="Description" tooltip="Details for completing the task."/> -->

   <field id="required" displayName="Required?" tooltip="Mark if this item is mandatory."/> -->

   <!-- <field id="is_applicable" displayName="Applicable?" tooltip="Toggle if not relevant."/> -->

  </page>

 </pageSection>



<pageSection type="child_tab" name="Contacts">

 <component type="ListView" tableName="contact_athletes" createButton="VISIBLE" editType="DETAILS">

  <field id="contact_id" displayName="Contact" enableInlineEdit="FALSE" tooltip="Related parent/guardian or contact for the athlete.">

   <lookup>

    <ref table="contacts" fieldID="full_name"/>

    <ref table="contacts" fieldID="email"/>

    <!-- <ref table="contacts" fieldID="phone"/> -->

    <!-- <ref table="contacts" fieldID="preferred_contact_method"/> -->

   </lookup>

  </field>

  <field id="relationship" displayName="Relationship" enableInlineEdit="FALSE" tooltip="Relationship of the contact to the athlete (e.g., parent)."/>

  <field id="is_primary" displayName="Primary?" enableInlineEdit="TRUE" tooltip="Marks this as the primary contact."/>

  <field id="start_date" displayName="Start Date" enableInlineEdit="FALSE" tooltip="When this contact relationship started."/>

  <field id="end_date" displayName="End Date" enableInlineEdit="FALSE" tooltip="When this contact relationship ended, if applicable."/>

  <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Private notes about this relationship."/>

 </component>



 <!-- Quick-create a new Contact directly from this tab -->

 <page type="CreateForm" table="contacts">

  <field id="full_name" displayName="Full Name" tooltip="Contact’s full name (parent/guardian/relative/mentor)."/>

  <field id="email" displayName="Email" tooltip="Primary email for the contact."/>

  <field id="phone" displayName="Phone" tooltip="Contact’s phone number."/>

  <field id="preferred_contact_method" displayName="Preferred Contact Method" tooltip="e.g., email, phone, text."/>

  <field id="internal_notes" displayName="Internal Notes" tooltip="Private notes about this contact."/>

 </page>



 <page type="CreateForm" table="contact_athletes">

  <field id="athlete_id" prefilledFromParent="true" displayName="Athlete" tooltip="Prefilled link back to the athlete.">

   <lookup>

    <ref table="athletes" fieldID="full_name"/>

    <ref table="athletes" fieldID="contact_email"/>

   </lookup>

  </field>



  <!-- Select an existing Contact OR create one inline using the quick-create form above -->

  <field id="contact_id" displayName="Contact" tooltip="Select an existing contact or create a new one inline." selectionMode="SELECT_OR_CREATE" inlineCreateTarget="contacts">

   <lookup>

    <ref table="contacts" fieldID="full_name"/>

    <ref table="contacts" fieldID="email"/>

    <!-- <ref table="contacts" fieldID="phone"/> -->

   </lookup>

  </field>



  <field id="relationship" displayName="Relationship" tooltip="Describe how this contact is related to the athlete."/>

  <field id="is_primary" displayName="Primary?" tooltip="Set true if this is the main contact."/>

  <field id="internal_notes" displayName="Internal Notes" tooltip="Private notes about this relationship."/>

 </page>

</pageSection>



 <pageSection type="child_tab" name="Results">

  <component type="ListView" tableName="athlete_results" createButton="VISIBLE" editType="DETAILS">

   <field id="event_id" displayName="Event" enableInlineEdit="FALSE" tooltip="Event for this performance.">

    <lookup>

     <ref table="events" fieldID="code"/>

     <ref table="events" fieldID="name"/>

     <!-- <ref table="events" fieldID="event_group"/> -->

     <!-- <ref table="events" fieldID="units"/> -->

    </lookup>

   </field>

   <field id="performance_mark" displayName="Performance Mark (event.units)" enableInlineEdit="FALSE" tooltip="Recorded time/mark/points for the event."/>

   <field id="date_recorded" displayName="Date Recorded" enableInlineEdit="FALSE" tooltip="When this result occurred."/>

   <field id="location" displayName="Location" enableInlineEdit="FALSE" tooltip="Meet/location of the result."/>

   <field id="hand_timed" displayName="Hand Timed?" enableInlineEdit="TRUE" tooltip="Indicate if timing was hand-timed."/>

   <field id="wind" displayName="Wind" enableInlineEdit="FALSE" tooltip="Wind reading, if applicable."/>

   <field id="altitude" displayName="Altitude?" enableInlineEdit="TRUE" tooltip="Whether the venue is altitude-aided."/>

   <field id="organized_event" displayName="Organized Event?" enableInlineEdit="TRUE" tooltip="Whether this result was at an organized meet."/>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Private notes on the result."/>

  </component>



  <page type="CreateForm" table="athlete_results">

   <field id="athlete_id" prefilledFromParent="true" displayName="Athlete" tooltip="Prefilled link back to the athlete.">

    <lookup>

     <ref table="athletes" fieldID="full_name"/>

     <ref table="athletes" fieldID="contact_email"/>

     <!-- <ref table="athletes" fieldID="instagram_handle"/> -->

     <!-- <ref table="athletes" fieldID="gender"/> -->

    </lookup>

   </field>

   <field id="event_id" displayName="Event" tooltip="Select the event contested.">

    <lookup>

     <ref table="events" fieldID="code"/>

     <ref table="events" fieldID="name"/>

     <!-- <ref table="events" fieldID="event_group"/> -->

    </lookup>

   </field>

   <field id="performance_mark" displayName="Performance Mark" tooltip="Time/mark/points to three decimals if needed."/>

   <field id="date_recorded" displayName="Date Recorded" tooltip="Date the result occurred."/>

   <field id="location" displayName="Location" tooltip="Meet location."/>

   <field id="hand_timed" displayName="Hand Timed?" tooltip="Check if the time is hand-timed."/>

   <field id="wind" displayName="Wind" tooltip="Wind reading value."/>

   <field id="altitude" displayName="Altitude?" tooltip="Altitude-aided indicator."/>

   <field id="organized_event" displayName="Organized Event?" tooltip="Mark if this was an official meet."/>

   <field id="internal_notes" displayName="Internal Notes" tooltip="Private notes about the performance."/>

  </page>

 </pageSection>



 <pageSection type="child_tab" name="Applications">

  <component type="ListView" tableName="athlete_applications" createButton="VISIBLE" editType="DETAILS">

   <field id="university_id" displayName="University" enableInlineEdit="FALSE" tooltip="Target university for this application.">

    <lookup>

     <ref table="universities" fieldID="name"/>

     <ref table="universities" fieldID="city"/>

     <!-- <ref table="universities" fieldID="region"/> -->

     <!-- <ref table="universities" fieldID="acceptance_rate_pct"/> -->

    </lookup>

   </field>

   <field id="program_id" displayName="Program" enableInlineEdit="FALSE" tooltip="Specific men’s/women’s program.">

    <lookup>

     <ref table="programs" fieldID="gender"/>

     <ref table="programs" fieldID="team_url"/>

     <!-- <ref table="programs" fieldID="team_instagram"/> -->

     <!-- <ref table="programs" fieldID="internal_notes"/> -->

    </lookup>

   </field>

   <field id="stage" displayName="Stage" enableInlineEdit="TRUE" tooltip="Pipeline stage (intro → offer → committed)."/>

   <field id="start_date" displayName="Start Date" enableInlineEdit="FALSE" tooltip="When the application began."/>

   <field id="offer_date" displayName="Offer Date" enableInlineEdit="FALSE" tooltip="When an offer was received."/>

   <field id="commitment_date" displayName="Commitment Date" enableInlineEdit="FALSE" tooltip="When the athlete committed."/>

   <field id="origin_lead_list_id" displayName="Origin Lead List" enableInlineEdit="FALSE" tooltip="Source lead list from which this application originated.">

    <lookup>

     <ref table="school_lead_lists" fieldID="name"/>

     <ref table="school_lead_lists" fieldID="priority"/>

     <!-- <ref table="school_lead_lists" fieldID="season_label"/> -->

    </lookup>

   </field>

   <field id="origin_lead_list_priority" displayName="Origin Lead List Priority" enableInlineEdit="FALSE" tooltip="Priority value of the originating lead list."/>

   <field id="origin_campaign_id" displayName="Origin Campaign" enableInlineEdit="FALSE" tooltip="Campaign that originated this application.">

    <lookup>

     <ref table="campaigns" fieldID="name"/>

     <ref table="campaigns" fieldID="type"/>

     <!-- <ref table="campaigns" fieldID="status"/> -->

    </lookup>

   </field>

   <field id="last_interaction_at" displayName="Last Interaction" enableInlineEdit="FALSE" tooltip="Most recent contact with the program."/>

   <field id="scholarship_amount_per_year" displayName="Scholarship/Year (USD)" enableInlineEdit="FALSE" tooltip="Dollar value offered per year."/>

   <field id="scholarship_percent" displayName="Scholarship %" enableInlineEdit="FALSE" tooltip="Percentage of scholarship offered."/>

   <field id="offer_notes" displayName="Offer Notes" enableInlineEdit="FALSE" tooltip="Notes and conditions related to the offer."/>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Private notes for this application."/>

  </component>



  <page type="CreateForm" table="athlete_applications">

   <field id="athlete_id" prefilledFromParent="true" displayName="Athlete" tooltip="Prefilled link back to the athlete.">

    <lookup>

     <ref table="athletes" fieldID="full_name"/>

     <ref table="athletes" fieldID="contact_email"/>

     <!-- <ref table="athletes" fieldID="city"/> -->

     <!-- <ref table="athletes" fieldID="graduation_year"/> -->

    </lookup>

   </field>

   <field id="university_id" displayName="University" tooltip="Choose the target university.">

    <lookup>

     <ref table="universities" fieldID="name"/>

     <ref table="universities" fieldID="city"/>

     <!-- <ref table="universities" fieldID="region"/> -->

    </lookup>

   </field>

   <field id="program_id" displayName="Program" tooltip="Pick the gendered program at that university.">

    <lookup>

     <ref table="programs" fieldID="gender"/>

     <ref table="programs" fieldID="team_url"/>

     <!-- <ref table="programs" fieldID="team_instagram"/> -->

    </lookup>

   </field>

   <field id="stage" displayName="Stage" tooltip="Set the initial application stage."/>

   <field id="start_date" displayName="Start Date" tooltip="When the application starts."/>

   <field id="origin_lead_list_id" displayName="Origin Lead List" tooltip="Lead list source for this application."/>

   <field id="origin_campaign_id" displayName="Origin Campaign" tooltip="Campaign that led to this application."/>

   <field id="offer_notes" displayName="Offer Notes" tooltip="Notes about offers or conditions."/>

  </page>

 </pageSection>



 <pageSection type="child_tab" name="Lead Lists">

  <component type="ListView" tableName="school_lead_lists" createButton="VISIBLE" editType="DETAILS">

   <field id="name" displayName="List Name" enableInlineEdit="TRUE" tooltip="Name of the lead list for targeting schools."/>

   <field id="priority" displayName="Priority" enableInlineEdit="TRUE" tooltip="Relative priority for outreach sequencing."/>

   <field id="type" displayName="Type" enableInlineEdit="FALSE" tooltip="Lead list type or segment."/>

   <field id="season_label" displayName="Season Label" enableInlineEdit="FALSE" tooltip="Season tag for this list."/>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Private notes for this list."/>

  </component>



  <page type="CreateForm" table="school_lead_lists">

   <field id="athlete_id" prefilledFromParent="true" displayName="Athlete" tooltip="Prefilled link back to the athlete.">

    <lookup>

     <ref table="athletes" fieldID="full_name"/>

     <ref table="athletes" fieldID="contact_email"/>

     <!-- <ref table="athletes" fieldID="graduation_year"/> -->

    </lookup>

   </field>

   <field id="name" displayName="List Name" tooltip="Name your list (e.g., Fall D2 Targets)."/>

   <field id="priority" displayName="Priority" tooltip="Integer priority for ordering/sends."/>

   <field id="type" displayName="Type" tooltip="Segment or criteria for the list."/>

   <field id="internal_notes" displayName="Internal Notes" tooltip="Private notes for the list."/>

  </page>

 </pageSection>



 <pageSection type="child_tab" name="Campaigns">

  <component type="ListView" tableName="campaigns" createButton="VISIBLE" editType="DETAILS">

   <field id="name" displayName="Campaign Name" enableInlineEdit="TRUE" tooltip="Human-friendly campaign label."/>

   <field id="type" displayName="Type" enableInlineEdit="FALSE" tooltip="Top, second pass, third pass, or personal best."/>

   <field id="primary_lead_list_id" displayName="Primary Lead List" enableInlineEdit="FALSE" tooltip="Lead list used to seed this campaign.">

    <lookup>

     <ref table="school_lead_lists" fieldID="name"/>

     <ref table="school_lead_lists" fieldID="priority"/>

     <!-- <ref table="school_lead_lists" fieldID="season_label"/> -->

    </lookup>

   </field>

   <field id="seed_campaign_id" displayName="Seed Campaign" enableInlineEdit="FALSE" tooltip="Original campaign used to seed this one (only for 2nd/3rd tier).">

    <lookup>

     <ref table="campaigns" fieldID="name"/>

     <ref table="campaigns" fieldID="type"/>

    </lookup>

   </field>

   <field id="status" displayName="Status" enableInlineEdit="TRUE" tooltip="Draft, active, paused, completed, or exhausted."/>

   <field id="start_date" displayName="Start Date" enableInlineEdit="FALSE" tooltip="When this campaign begins."/>

   <field id="end_date" displayName="End Date" enableInlineEdit="FALSE" tooltip="When this campaign ends."/>

   <field id="daily_send_cap" displayName="Daily Send Cap" enableInlineEdit="TRUE" tooltip="Max number of emails per day."/>

   <field id="leads_total" displayName="Leads Total" enableInlineEdit="FALSE" tooltip="Total number of leads added."/>

   <field id="leads_loaded" displayName="Leads Loaded" enableInlineEdit="FALSE" tooltip="Leads already sent or queued."/>

   <field id="leads_remaining" displayName="Leads Remaining" enableInlineEdit="FALSE" tooltip="Leads not yet sent."/>

   <field id="sending_tool_campaign_url" displayName="Sending Tool URL" enableInlineEdit="FALSE" tooltip="Link to the sending tool campaign view."/>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Campaign notes and strategy context."/>

  </component>



  <page type="CreateForm" table="campaigns">

   <field id="athlete_id" prefilledFromParent="true" displayName="Athlete" tooltip="Prefilled link back to the athlete.">

    <lookup>

     <ref table="athletes" fieldID="full_name"/>

     <ref table="athletes" fieldID="contact_email"/>

       </lookup>

   </field>

   <field id="name" displayName="Campaign Name" tooltip="Give the campaign a clear, descriptive name."/>

   <field id="type" displayName="Type" tooltip="Select the campaign type (top/second/third/personal_best)."/>

   <field id="primary_lead_list_id" displayName="Primary Lead List" tooltip="Lead list to seed the campaign.">

    <lookup>

     <ref table="school_lead_lists" fieldID="name"/>

     <ref table="school_lead_lists" fieldID="priority"/>

 

    </lookup>

   </field>

   <field id="daily_send_cap" displayName="Daily Send Cap" tooltip="Set a reasonable daily limit."/>

   <field id="start_date" displayName="Start Date" tooltip="When outreach starts."/>

   <field id="internal_notes" displayName="Internal Notes" tooltip="Strategy or notes."/>

  </page>

 </pageSection>



 <pageSection type="child_tab" name="Replies">

  <component type="ListView" tableName="replies" createButton="VISIBLE" editType="DETAILS">

   <field id="type" displayName="Reply Type" enableInlineEdit="FALSE" tooltip="Channel used by the coach (email, call, text, IG)."/>

   <field id="occurred_at" displayName="Occurred At" enableInlineEdit="FALSE" tooltip="Timestamp of the reply."/>

   <field id="summary" displayName="Summary" enableInlineEdit="FALSE" tooltip="Short description of the reply content."/>

   <field id="application_id" displayName="Application" enableInlineEdit="FALSE" tooltip="Related application (if applicable).">

    <lookup>

     <ref table="athlete_applications" fieldID="stage"/>

     <ref table="athlete_applications" fieldID="last_interaction_at"/>

     <!-- <ref table="athlete_applications" fieldID="scholarship_percent"/> -->

    </lookup>

   </field>

   <field id="university_job_id" displayName="Coach/Job" enableInlineEdit="FALSE" tooltip="Coach that replied.">

    <lookup>

     <ref table="university_jobs" fieldID="job_title"/>

     <ref table="university_jobs" fieldID="work_email"/>

     <!-- <ref table="university_jobs" fieldID="program_scope"/> -->

    </lookup>

   </field>

   <field id="campaign_id" displayName="Campaign" enableInlineEdit="FALSE" tooltip="Campaign that generated this reply.">

    <lookup>

     <ref table="campaigns" fieldID="name"/>

     <ref table="campaigns" fieldID="status"/>

    </lookup>

   </field>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Private notes related to this reply."/>

  </component>



  <page type="CreateForm" table="replies">

   <field id="athlete_id" prefilledFromParent="true" displayName="Athlete" tooltip="Prefilled link back to the athlete.">

    <lookup>

     <ref table="athletes" fieldID="full_name"/>

     <ref table="athletes" fieldID="instagram_handle"/>

    </lookup>

   </field>

   <field id="type" displayName="Reply Type" tooltip="Choose the channel (email, call, text, Instagram)."/>

   <field id="occurred_at" displayName="Occurred At" tooltip="When the reply happened."/>

   <field id="summary" displayName="Summary" tooltip="Short description of what was said or asked."/>

   <field id="application_id" displayName="Application" tooltip="Link to an existing application, if relevant.">

    <lookup>

     <ref table="athlete_applications" fieldID="stage"/>

     <ref table="athlete_applications" fieldID="university_id"/>

    </lookup>

   </field>

   <field id="university_job_id" displayName="Coach/Job" tooltip="Coach role at a program or university.">

    <lookup>

     <ref table="university_jobs" fieldID="job_title"/>

     <ref table="university_jobs" fieldID="work_email"/>

    </lookup>

   </field>

   <field id="campaign_id" displayName="Campaign" tooltip="Optional link to the outreach campaign that led to this reply.">

    <lookup>

     <ref table="campaigns" fieldID="name"/>

     <ref table="campaigns" fieldID="status"/>

    </lookup>

   </field>

   <!-- <field id="internal_notes" displayName="Internal Notes" tooltip="Private context for the reply."/> -->

  </page>

 </pageSection>



 <!-- Extended (second-level) related records for convenience -->



 <pageSection type="child_tab" name="Lead List Entries">

  <component type="ListView" tableName="school_lead_list_entries" createButton="VISIBLE" editType="DETAILS">

   <field id="school_lead_list_id" displayName="Lead List" enableInlineEdit="FALSE" tooltip="Which athlete lead list this entry belongs to.">

    <lookup>

     <ref table="school_lead_lists" fieldID="name"/>

     <ref table="school_lead_lists" fieldID="priority"/>

    </lookup>

   </field>

   <field id="university_id" displayName="University" enableInlineEdit="FALSE" tooltip="University included in this list entry.">

    <lookup>

     <ref table="universities" fieldID="name"/>

     <ref table="universities" fieldID="city"/>

    </lookup>

   </field>

   <field id="program_id" displayName="Program" enableInlineEdit="FALSE" tooltip="Specific program (men/women) at the university.">

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

   <!-- Parent is athlete (indirect). Choose one of the athlete's Lead Lists -->

   <field id="school_lead_list_id" displayName="Lead List" tooltip="Select one of this athlete’s lead lists.">

    <lookup>

     <ref table="school_lead_lists" fieldID="name"/>

     <ref table="school_lead_lists" fieldID="priority"/>

    </lookup>

   </field>

   <field id="university_id" displayName="University" tooltip="Pick the university to add to the list.">

    <lookup>

     <ref table="universities" fieldID="name"/>

     <ref table="universities" fieldID="city"/>

    </lookup>

   </field>

   <field id="program_id" displayName="Program" tooltip="Optionally target a specific program.">

    <lookup>

     <ref table="programs" fieldID="gender"/>

     <ref table="programs" fieldID="team_url"/>

    </lookup>

   </field>

   <field id="status" displayName="Status" tooltip="Include/exclude or custom status."/>

   <field id="internal_notes" displayName="Internal Notes" tooltip="Notes for this entry."/>

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

   <field id="university_id" displayName="University" enableInlineEdit="FALSE" tooltip="Target university.">

    <lookup>

     <ref table="universities" fieldID="name"/>

     <ref table="universities" fieldID="city"/>

    </lookup>

   </field>

   <field id="program_id" displayName="Program" enableInlineEdit="FALSE" tooltip="Target program at the university.">

    <lookup>

     <ref table="programs" fieldID="gender"/>

     <ref table="programs" fieldID="team_url"/>

    </lookup>

   </field>

   <field id="university_job_id" displayName="Coach/Job" enableInlineEdit="FALSE" tooltip="Specific coach role targeted.">

    <lookup>

     <ref table="university_jobs" fieldID="job_title"/>

     <ref table="university_jobs" fieldID="work_email"/>

    </lookup>

   </field>

   <field id="status" displayName="Lead Status" enableInlineEdit="TRUE" tooltip="Pending, replied, or suppressed."/>

   <field id="first_reply_at" displayName="First Reply At" enableInlineEdit="FALSE" tooltip="Timestamp of first coach reply, if any."/>

   <field id="application_id" displayName="Linked Application" enableInlineEdit="FALSE" tooltip="Application created from this lead (if applicable).">

    <lookup>

     <ref table="athlete_applications" fieldID="stage"/>

     <ref table="athlete_applications" fieldID="last_interaction_at"/>

    </lookup>

   </field>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Private notes about this lead."/>

  </component>



  <page type="CreateForm" table="campaign_leads">

   <field id="campaign_id" displayName="Campaign" tooltip="Select one of this athlete’s campaigns.">

    <lookup>

     <ref table="campaigns" fieldID="name"/>

     <ref table="campaigns" fieldID="type"/>

    </lookup>

   </field>

   <field id="university_id" displayName="University" tooltip="Target university for this lead.">

    <lookup>

     <ref table="universities" fieldID="name"/>

     <ref table="universities" fieldID="city"/>

    </lookup>

   </field>

   <field id="program_id" displayName="Program" tooltip="Target program (men/women).">

    <lookup>

     <ref table="programs" fieldID="gender"/>

     <ref table="programs" fieldID="team_url"/>

    </lookup>

   </field>

<field id="university_job_id" displayName="Coach/Job" tooltip="Specific coach role, if known.">

 <lookup>

<ref table="universities" fieldID="name"/>

 <ref table="university_jobs" fieldID="job_title"/>



 </lookup>

</field>



   <field id="status" displayName="Lead Status" tooltip="Set initial lead status."/>

   <field id="internal_notes" displayName="Internal Notes" tooltip="Notes for this lead."/>

  </page>

 </pageSection>



 <pageSection type="child_tab" name="Sending Tool Lead Lists (CSV Exports)">

  <component type="ListView" tableName="sending_tool_lead_lists" createButton="VISIBLE" editType="DETAILS">

   <field id="campaign_id" displayName="Campaign" enableInlineEdit="FALSE" tooltip="Campaign that this export belongs to.">

    <lookup>

     <ref table="campaigns" fieldID="name"/>

     <ref table="campaigns" fieldID="status"/>

    </lookup>

   </field>

   <field id="format" displayName="Format" enableInlineEdit="FALSE" tooltip="Export file format (e.g., CSV)."/>

   <field id="file_url" displayName="File URL" enableInlineEdit="FALSE" tooltip="Link to the generated list file."/>

   <field id="row_count" displayName="Row Count" enableInlineEdit="FALSE" tooltip="Number of rows in the exported file."/>

   <field id="generated_by" displayName="Generated By" enableInlineEdit="FALSE" tooltip="User or system that generated the file."/>

   <field id="generated_at" displayName="Generated At" enableInlineEdit="FALSE" tooltip="Timestamp when the file was generated."/>

   <field id="internal_notes" displayName="Internal Notes" enableInlineEdit="FALSE" tooltip="Notes about file generation."/>

  </component>



  <page type="CreateForm" table="sending_tool_lead_lists">

   <field id="campaign_id" displayName="Campaign" tooltip="Choose the associated campaign.">

    <lookup>

     <ref table="campaigns" fieldID="name"/>

     <ref table="campaigns" fieldID="status"/>

    </lookup>

   </field>

   <field id="format" displayName="Format" tooltip="File format (CSV recommended)."/>

   <field id="file_url" displayName="File URL" tooltip="Optional link if already uploaded."/>

   <field id="internal_notes" displayName="Internal Notes" tooltip="Notes about this exported file."/> 

  </page>

 </pageSection>



</page>

