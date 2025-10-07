<page id="athletesCreate" type="Create" table="athletes" name="Create Athlete">

  <pageSection type="fields">



   <subSection name="Identity & Contact">

    <field name="full_name" displayName="Full Name"/>

    <field name="contact_email" displayName="Email"/>

    <field name="phone" displayName="Phone"/>

    <field name="instagram_handle" displayName="Instagram"/>

    <field name="gender" displayName="Gender"/>

    <field name="date_of_birth" displayName="Date of Birth"/>

   </subSection>



   <subSection name="Schooling">

    <field name="high_school" displayName="High School"/>

    <field name="city" displayName="City"/>

    <field name="state" displayName="State"/>

    <field name="country" displayName="Country"/>

    <field name="graduation_year" displayName="Graduation Year"/>

    <field name="year_entering_university" displayName="Year Entering University"/>

   </subSection>



   <subSection name="Profiles & Academic">

    <field name="athlete_net_url" displayName="Athletic.net URL"/>

    <field name="milesplit_url" displayName="MileSplit URL"/>

    <field name="google_drive_folder_url" displayName="Google Drive Folder"/>

    <field name="sat_score" displayName="SAT Score"/>

    <field name="act_score" displayName="ACT Score"/>

   </subSection>



   <subSection name="Contract & Sales">

    <field name="contract_date" displayName="Contract Date"/>

    <field name="go_live_date" displayName="Go Live Date"/>

    <field name="sales_setter_id" displayName="Sales Setter">

     <lookup>

      <ref table="internal_team" field="name"/>

      <ref table="internal_team" field="job_title"/>

       </lookup>

    </field>

    <field name="sales_closer_id" displayName="Sales Closer">

     <lookup>

      <ref table="internal_team" field="name"/>

      <ref table="internal_team" field="job_title"/>

    

     </lookup>

    </field>

    <field name="lead_source" displayName="Lead Source"/>

    <field name="last_sales_call_at" displayName="Last Sales Call"/>

    <field name="sales_call_note" displayName="Sales Call Notes"/>

    <field name="sales_call_recording_url" displayName="Sales Call Recording URL"/>

    <field name="initial_contract_amount_usd" displayName="Initial Contract Amount (USD)"/>

    <field name="initial_cash_collected_usd" displayName="Initial Cash Collected (USD)"/>

    <field name="initial_payment_type" displayName="Initial Payment Type"/>

    <field name="student_type" displayName="Student Type"/>

   </subSection>



   <subSection name="Discord">

    <field name="discord_channel_url" displayName="Discord Channel URL"/>

    <field name="discord_channel_id" displayName="Discord Channel ID"/>

    <field name="discord_username" displayName="Discord Username"/>

   </subSection>



   <subSection name="Internal">

    <field name="internal_notes" displayName="Internal Notes"/>

   </subSection>



  </pageSection>

</page>

