<page pageID="internal_teamDetails" type="Details" tableName="internal_team" pageTitle="Team Member Detail" mainFieldIDs="name,job_title">

 <pageSection type="fields">

  <!-- Use process-oriented subsections with ≥3 fields each; merge if fewer -->

  <subSection displayName="Profile & Status">

   <!-- Include ALL non-audit fields (do NOT comment-out in Details) -->

   <field id="name" displayName="Name" tooltip="Team member’s display name."/>

   <field id="job_title" displayName="Job Title" tooltip="Role or title within the organization."/>

   <field id="timezone" displayName="Time Zone" tooltip="Local time zone for scheduling and SLAs."/>

   <field id="is_active" displayName="Active?" tooltip="Whether this team member is active."/>

   

   <field id="internal_notes" displayName="Internal Notes" tooltip="Private notes about this team member."/>

  </subSection>



  <!-- There are no additional fields -->

 </pageSection>



 <!-- One child tab per direct 1→many related table -->



 <pageSection type="child_tab" name="Athletes (Sales Setter/Closer)">

  <component type="ListView" tableName="athletes" createButton="HIDDEN" editType="DETAILS">

   <field id="full_name" displayName="Athlete" enableInlineEdit="FALSE" tooltip="Athlete full name."/>

   <field id="contact_email" displayName="Email" enableInlineEdit="FALSE" tooltip="Primary contact email."/>

   <field id="sales_setter_id" displayName="Sales Setter" enableInlineEdit="FALSE" tooltip="Assigned sales setter (this member if matched).">

    <lookup>

     <ref table="internal_team" fieldID="name"/>

    </lookup>

   </field>

   <field id="sales_closer_id" displayName="Sales Closer" enableInlineEdit="FALSE" tooltip="Assigned sales closer (this member if matched).">

    <lookup>

     <ref table="internal_team" fieldID="name"/>

    </lookup>

   </field>

   <field id="last_sales_call_at" displayName="Last Sales Call" enableInlineEdit="FALSE" tooltip="Timestamp of the last recorded sales call."/>

   <field id="sales_call_note" displayName="Sales Call Note" enableInlineEdit="FALSE" tooltip="Latest call summary."/>

   <field id="initial_contract_amount_usd" displayName="Initial Contract Amount (USD)" enableInlineEdit="FALSE" tooltip="Original contracted amount."/>

   <field id="initial_cash_collected_usd" displayName="Initial Cash Collected (USD)" enableInlineEdit="FALSE" tooltip="Cash collected at signing."/>

  </component>



 </pageSection>

</page>

